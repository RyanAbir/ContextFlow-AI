import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
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

export async function createWorkspace(userId: string, data: { name: string; description?: string }): Promise<string> {
  const database = ensureDb()
  const workspacesRef = collection(database, "workspaces")

  const docRef = await addDoc(workspacesRef, {
    name: data.name,
    description: data.description ?? "",
    ownerId: userId,
    memberCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // create initial member document under workspace members subcollection using userId as the doc id
  const memberRef = doc(database, "workspaces", docRef.id, "members", userId)
  await setDoc(memberRef, {
    userId,
    workspaceId: docRef.id,
    role: "owner" as WorkspaceRole,
    joinedAt: serverTimestamp(),
  })

  return docRef.id
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
  const snap = await getDocs(q)

  return snap.docs.map((d) => mapWorkspaceMember(d.data() as Record<string, unknown>))
}

async function getWorkspacesForMemberships(memberships: WorkspaceMember[]): Promise<Workspace[]> {
  const database = ensureDb()
  const workspaceIds = Array.from(new Set(memberships.map((member) => member.workspaceId).filter(Boolean)))
  const snapshots = await Promise.all(workspaceIds.map((workspaceId) => getDoc(doc(database, "workspaces", workspaceId))))

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
    onError?.(error)
  }

  const unsubscribeOwned = onSnapshot(
    ownedQuery,
    (snapshot) => {
      ownedWorkspaces = snapshot.docs.map((d) => mapWorkspace(d.id, d.data() as Record<string, unknown>))
      ownedLoaded = true
      emitIfReady()
    },
    handleError
  )

  const unsubscribeMemberships = onSnapshot(
    membershipsQuery,
    (snapshot) => {
      const memberships = snapshot.docs.map((d) => mapWorkspaceMember(d.data() as Record<string, unknown>))
      void getWorkspacesForMemberships(memberships)
        .then((workspaces) => {
          membershipWorkspaces = workspaces
          membershipsLoaded = true
          emitIfReady()
        })
        .catch(handleError)
    },
    handleError
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
  const snap = await getDocs(q)
  const owned = snap.docs.map((d) => mapWorkspace(d.id, d.data() as Record<string, unknown>))
  const memberWorkspaces = await getWorkspacesForMemberships(await getUserWorkspaceMemberships(userId))
  return mergeWorkspaces(owned, memberWorkspaces)
}

export async function updateWorkspace(userId: string, workspaceId: string, updates: Partial<{ name: string; description: string }>): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "workspaces", workspaceId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("Workspace not found")
  const data = snap.data() as Record<string, unknown>
  if ((data.ownerId as string) !== userId) throw new Error("Not authorized to update this workspace")

  const allowed: Record<string, unknown> = {}
  if (typeof updates.name === "string") allowed["name"] = updates.name
  if (typeof updates.description === "string") allowed["description"] = updates.description
  allowed["updatedAt"] = serverTimestamp()

  await updateDoc(ref, allowed)
}

export async function deleteWorkspace(userId: string, workspaceId: string): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "workspaces", workspaceId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("Workspace not found")
  const data = snap.data() as Record<string, unknown>
  if ((data.ownerId as string) !== userId) throw new Error("Not authorized to delete this workspace")

  // Note: Deleting the workspace document does not remove subcollections. For production, consider a Cloud Function to cascade deletions.
  await deleteDoc(ref)
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  const database = ensureDb()
  const ref = doc(database, "workspaces", workspaceId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as Record<string, unknown>
  return mapWorkspace(snap.id, data)
}
