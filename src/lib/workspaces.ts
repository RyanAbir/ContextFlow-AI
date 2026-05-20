import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Workspace, WorkspaceMember, WorkspaceRole } from "@/types/workspace"

function ensureDb() {
  if (!db) {
    throw new Error("Firestore has not been initialized. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set and code runs on the client.")
  }
  return db
}

function logFirestoreError(helper: string, queryShape: string, error: unknown) {
  console.error(`[Firestore:${helper}] ${queryShape}`, error)
}

export async function createWorkspace(userId: string, data: { name: string; description?: string }): Promise<string> {
  const database = ensureDb()
  const workspacesRef = collection(database, "workspaces")

  try {
    const docRef = await addDoc(workspacesRef, {
      name: data.name,
      description: data.description ?? "",
      ownerId: userId,
      createdBy: userId,
      memberCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const memberRef = doc(database, "workspaces", docRef.id, "members", userId)
    try {
      await setDoc(memberRef, {
        userId,
        workspaceId: docRef.id,
        role: "owner" as WorkspaceRole,
        joinedAt: serverTimestamp(),
      })
    } catch (error) {
      logFirestoreError("createWorkspace", "create workspaces/{workspaceId}/members/{userId}", error)
      throw error
    }

    return docRef.id
  } catch (error) {
    logFirestoreError("createWorkspace", "write workspaces + workspaces/{workspaceId}/members/{userId}", error)
    throw error
  }
}

function mapWorkspace(id: string, data: Record<string, unknown>): Workspace {
  const createdField = data.createdAt as { toDate?: () => Date } | undefined
  const updatedField = data.updatedAt as { toDate?: () => Date } | undefined
  const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
  const updated = updatedField && typeof updatedField.toDate === "function" ? updatedField.toDate() : undefined

  return {
    id,
    name: (data.name as string) ?? "Untitled Workspace",
    description: (data.description as string) ?? "",
    ownerId: (data.ownerId as string) ?? "",
    createdBy: (data.createdBy as string) ?? undefined,
    createdAt: created,
    updatedAt: updated,
    memberCount: (data.memberCount as number) ?? 0,
  }
}

function mapWorkspaceMember(data: Record<string, unknown>): WorkspaceMember {
  const joinedField = data.joinedAt as { toDate?: () => Date } | undefined
  const joinedAt = joinedField && typeof joinedField.toDate === "function" ? joinedField.toDate() : new Date()

  return {
    userId: (data.userId as string) ?? "",
    workspaceId: (data.workspaceId as string) ?? "",
    role: (data.role as WorkspaceRole) ?? "member",
    joinedAt,
  }
}

function mergeWorkspaces(owned: Workspace[], memberWorkspaces: Workspace[]): Workspace[] {
  const byId = new Map<string, Workspace>()
  for (const workspace of [...owned, ...memberWorkspaces]) {
    byId.set(workspace.id, workspace)
  }

  return Array.from(byId.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getUserWorkspaceMemberships(userId: string): Promise<WorkspaceMember[]> {
  const database = ensureDb()
  const membersRef = collectionGroup(database, "members")
  const q = query(membersRef, where("userId", "==", userId), limit(100))
  let snap
  try {
    snap = await getDocs(q)
  } catch (error) {
    logFirestoreError("getUserWorkspaceMemberships", "members collectionGroup where userId == currentUser limit 100", error)
    throw error
  }

  return snap.docs.map((d) => mapWorkspaceMember(d.data() as Record<string, unknown>))
}

async function getWorkspacesForMemberships(memberships: WorkspaceMember[]): Promise<Workspace[]> {
  const database = ensureDb()
  const workspaceIds = Array.from(new Set(memberships.map((member) => member.workspaceId).filter(Boolean)))
  let snapshots
  try {
    snapshots = await Promise.all(workspaceIds.map((workspaceId) => getDoc(doc(database, "workspaces", workspaceId))))
  } catch (error) {
    logFirestoreError("getWorkspacesForMemberships", "get workspaces/{workspaceId} for matching member docs", error)
    throw error
  }

  return snapshots
    .filter((snapshot) => snapshot.exists())
    .map((snapshot) => mapWorkspace(snapshot.id, snapshot.data() as Record<string, unknown>))
}

export function subscribeToUserWorkspaces(
  userId: string,
  onChange: (workspaces: Workspace[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const database = ensureDb()
  const workspacesRef = collection(database, "workspaces")
  const ownedQuery = query(workspacesRef, where("ownerId", "==", userId), orderBy("createdAt", "desc"), limit(100))
  const membershipsQuery = query(collectionGroup(database, "members"), where("userId", "==", userId), limit(100))

  console.debug("[Firestore:subscribeToUserWorkspaces] starting", {
    userId,
    ownedQuery: "workspaces where ownerId == currentUser orderBy createdAt desc limit 100",
    membershipsQuery: "members collectionGroup where userId == currentUser limit 100",
  })

  let ownedWorkspaces: Workspace[] = []
  let membershipWorkspaces: Workspace[] = []
  let ownedLoaded = false
  let membershipsLoaded = false
  let disposed = false

  const emitIfReady = () => {
    if (!ownedLoaded || !membershipsLoaded || disposed) return
    onChange(mergeWorkspaces(ownedWorkspaces, membershipWorkspaces))
  }

  const handleError = (error: Error) => {
    if (disposed) return
    logFirestoreError("subscribeToUserWorkspaces", "workspace subscription failed", error)
    onError?.(error)
  }

  const unsubscribeOwned = onSnapshot(
    ownedQuery,
    (snapshot) => {
      console.debug("[Firestore:subscribeToUserWorkspaces] owned snapshot", {
        userId,
        count: snapshot.docs.length,
        sample: snapshot.docs[0]?.data() ?? null,
      })
      ownedWorkspaces = snapshot.docs.map((d) => mapWorkspace(d.id, d.data() as Record<string, unknown>))
      ownedLoaded = true
      emitIfReady()
    },
    (error) => {
      logFirestoreError("subscribeToUserWorkspaces", "workspaces where ownerId == currentUser orderBy createdAt desc limit 100", error)
      handleError(error)
    }
  )

  const unsubscribeMemberships = onSnapshot(
    membershipsQuery,
    (snapshot) => {
      console.debug("[Firestore:subscribeToUserWorkspaces] membership snapshot", {
        userId,
        count: snapshot.docs.length,
        sample: snapshot.docs[0]?.data() ?? null,
      })
      const memberships = snapshot.docs.map((d) => mapWorkspaceMember(d.data() as Record<string, unknown>))
      void getWorkspacesForMemberships(memberships)
        .then((workspaces) => {
          membershipWorkspaces = workspaces
          membershipsLoaded = true
          emitIfReady()
        })
        .catch(handleError)
    },
    (error) => {
      logFirestoreError("subscribeToUserWorkspaces", "members collectionGroup where userId == currentUser limit 100", error)
      handleError(error)
    }
  )

  return () => {
    disposed = true
    unsubscribeOwned()
    unsubscribeMemberships()
  }
}

export async function listUserWorkspaces(userId: string): Promise<Workspace[]> {
  const database = ensureDb()
  const workspacesRef = collection(database, "workspaces")
  const q = query(workspacesRef, where("ownerId", "==", userId), orderBy("createdAt", "desc"), limit(100))
  let snap
  try {
    snap = await getDocs(q)
  } catch (error) {
    logFirestoreError("listUserWorkspaces", "workspaces where ownerId == currentUser orderBy createdAt desc limit 100", error)
    throw error
  }
  const owned = snap.docs.map((d) => mapWorkspace(d.id, d.data() as Record<string, unknown>))
  const memberWorkspaces = await getWorkspacesForMemberships(await getUserWorkspaceMemberships(userId))
  return mergeWorkspaces(owned, memberWorkspaces)
}

export async function updateWorkspace(userId: string, workspaceId: string, updates: Partial<{ name: string; description: string }>): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "workspaces", workspaceId)
  let snap
  try {
    snap = await getDoc(ref)
  } catch (error) {
    logFirestoreError("updateWorkspace", "get workspaces/{workspaceId}", error)
    throw error
  }
  if (!snap.exists()) throw new Error("Workspace not found")
  const data = snap.data() as Record<string, unknown>
  if ((data.ownerId as string) !== userId) throw new Error("Not authorized to update this workspace")

  const allowed: Record<string, unknown> = {}
  if (typeof updates.name === "string") allowed["name"] = updates.name
  if (typeof updates.description === "string") allowed["description"] = updates.description
  allowed["updatedAt"] = serverTimestamp()

  try {
    await updateDoc(ref, allowed)
  } catch (error) {
    logFirestoreError("updateWorkspace", "update workspaces/{workspaceId}", error)
    throw error
  }
}

export async function deleteWorkspace(userId: string, workspaceId: string): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "workspaces", workspaceId)
  let snap
  try {
    snap = await getDoc(ref)
  } catch (error) {
    logFirestoreError("deleteWorkspace", "get workspaces/{workspaceId}", error)
    throw error
  }
  if (!snap.exists()) throw new Error("Workspace not found")
  const data = snap.data() as Record<string, unknown>
  if ((data.ownerId as string) !== userId) throw new Error("Not authorized to delete this workspace")

  const membersRef = collection(database, "workspaces", workspaceId, "members")
  try {
    const membersSnap = await getDocs(membersRef)
    const batch = writeBatch(database)

    membersSnap.docs.forEach((memberDoc) => {
      batch.delete(memberDoc.ref)
    })
    batch.delete(ref)

    await batch.commit()
  } catch (error) {
    logFirestoreError("deleteWorkspace", "delete workspaces/{workspaceId} and workspaces/{workspaceId}/members", error)
    throw error
  }
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  const database = ensureDb()
  const ref = doc(database, "workspaces", workspaceId)
  let snap
  try {
    snap = await getDoc(ref)
  } catch (error) {
    logFirestoreError("getWorkspaceById", "get workspaces/{workspaceId}", error)
    throw error
  }
  if (!snap.exists()) return null
  const data = snap.data() as Record<string, unknown>
  return mapWorkspace(snap.id, data)
}
