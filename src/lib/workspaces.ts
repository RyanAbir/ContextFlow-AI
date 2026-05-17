import {
  addDoc,
  collection,
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

export function subscribeToUserWorkspaces(userId: string, onChange: (workspaces: Workspace[]) => void) {
  const database = ensureDb()
  const workspacesRef = collection(database, "workspaces")
  const q = query(workspacesRef, where("ownerId", "==", userId), orderBy("createdAt", "desc"), limit(100))

  return onSnapshot(q, (snapshot) => {
    const results: Workspace[] = snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      const createdField = data.createdAt as { toDate?: () => Date } | undefined
      const updatedField = data.updatedAt as { toDate?: () => Date } | undefined
      const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
      const updated = updatedField && typeof updatedField.toDate === "function" ? updatedField.toDate() : undefined

      return {
        id: d.id,
        name: (data.name as string) ?? "Untitled Workspace",
        description: (data.description as string) ?? "",
        ownerId: (data.ownerId as string) ?? "",
        createdAt: created,
        updatedAt: updated,
        memberCount: (data.memberCount as number) ?? 0,
      }
    })
    onChange(results)
  })
}

export async function listUserWorkspaces(userId: string): Promise<Workspace[]> {
  const database = ensureDb()
  const workspacesRef = collection(database, "workspaces")
  const q = query(workspacesRef, where("ownerId", "==", userId), orderBy("createdAt", "desc"), limit(100))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    const createdField = data.createdAt as { toDate?: () => Date } | undefined
    const updatedField = data.updatedAt as { toDate?: () => Date } | undefined
    const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
    const updated = updatedField && typeof updatedField.toDate === "function" ? updatedField.toDate() : undefined

    return {
      id: d.id,
      name: (data.name as string) ?? "Untitled Workspace",
      description: (data.description as string) ?? "",
      ownerId: (data.ownerId as string) ?? "",
      createdAt: created,
      updatedAt: updated,
      memberCount: (data.memberCount as number) ?? 0,
    }
  })
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
  const createdField = data.createdAt as { toDate?: () => Date } | undefined
  const updatedField = data.updatedAt as { toDate?: () => Date } | undefined
  const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
  const updated = updatedField && typeof updatedField.toDate === "function" ? updatedField.toDate() : undefined

  return {
    id: snap.id,
    name: (data.name as string) ?? "Untitled Workspace",
    description: (data.description as string) ?? "",
    ownerId: (data.ownerId as string) ?? "",
    createdAt: created,
    updatedAt: updated,
    memberCount: (data.memberCount as number) ?? 0,
  }
}
