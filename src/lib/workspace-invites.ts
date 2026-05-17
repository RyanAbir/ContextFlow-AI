import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  onSnapshot,
  increment,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { WorkspaceInvite, WorkspaceInviteStatus } from "@/types/workspace-invite"
import type { WorkspaceRole } from "@/types/workspace"
import { getWorkspaceById } from "@/lib/workspaces"

function ensureDb() {
  if (!db) throw new Error("Firestore has not been initialized.")
  return db
}

function logFirestoreError(helper: string, queryShape: string, error: unknown) {
  console.error(`[Firestore:${helper}] ${queryShape}`, error)
}

async function isWorkspaceOwnerOrAdmin(userId: string, workspaceId: string): Promise<boolean> {
  const database = ensureDb()
  const ws = await getWorkspaceById(workspaceId)
  if (!ws) return false
  if (ws.ownerId === userId) return true

  const memberRef = doc(database, "workspaces", workspaceId, "members", userId)
  let snap
  try {
    snap = await getDoc(memberRef)
  } catch (error) {
    logFirestoreError("isWorkspaceOwnerOrAdmin", "get workspaces/{workspaceId}/members/{userId}", error)
    throw error
  }
  if (!snap.exists()) return false
  const data = snap.data() as Record<string, unknown>
  const role = data.role as WorkspaceRole | undefined
  return role === "admin" || role === "owner"
}

export async function canManageWorkspaceInvites(userId: string, workspaceId: string): Promise<boolean> {
  return isWorkspaceOwnerOrAdmin(userId, workspaceId)
}

function workspaceInvitesQuery(database: ReturnType<typeof ensureDb>, workspaceId: string) {
  const invitesRef = collection(database, "workspaceInvites")
  return query(
    invitesRef,
    where("workspaceId", "==", workspaceId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(200)
  )
}

function mapWorkspaceInvite(id: string, data: Record<string, unknown>): WorkspaceInvite {
  const createdField = data.createdAt as { toDate?: () => Date } | undefined
  const expiresField = data.expiresAt as { toDate?: () => Date } | undefined
  const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
  const expires = expiresField && typeof expiresField.toDate === "function" ? expiresField.toDate() : (data.expiresAt as Date | null)

  return {
    id,
    workspaceId: (data.workspaceId as string) ?? "",
    workspaceName: (data.workspaceName as string) ?? "",
    invitedEmail: (data.invitedEmail as string) ?? "",
    invitedBy: (data.invitedBy as string) ?? "",
    role: (data.role as WorkspaceRole) ?? ("member" as WorkspaceRole),
    status: (data.status as WorkspaceInviteStatus) ?? ("pending" as WorkspaceInviteStatus),
    createdAt: created,
    expiresAt: expires ?? null,
  }
}

export async function createWorkspaceInvite(
  inviterId: string,
  workspaceId: string,
  invitedEmail: string,
  role: WorkspaceRole,
  expiresAt?: Date
): Promise<string> {
  const database = ensureDb()

  // permission check
  const allowed = await isWorkspaceOwnerOrAdmin(inviterId, workspaceId)
  if (!allowed) throw new Error("Not authorized to invite members to this workspace")

  const ws = await getWorkspaceById(workspaceId)
  if (!ws) throw new Error("Workspace not found")

  const invitesRef = collection(database, "workspaceInvites")
  let docRef
  try {
    docRef = await addDoc(invitesRef, {
      workspaceId,
      workspaceName: ws.name,
      invitedEmail: invitedEmail.toLowerCase(),
      invitedBy: inviterId,
      role,
      status: "pending",
      createdAt: serverTimestamp(),
      expiresAt: expiresAt ?? null,
    })
  } catch (error) {
    logFirestoreError("createWorkspaceInvite", "add workspaceInvites document", error)
    throw error
  }

  return docRef.id
}

export async function getWorkspaceInvites(userId: string, workspaceId: string): Promise<WorkspaceInvite[]> {
  const database = ensureDb()

  const allowed = await isWorkspaceOwnerOrAdmin(userId, workspaceId)
  if (!allowed) throw new Error("Not authorized to view invites for this workspace")

  const q = workspaceInvitesQuery(database, workspaceId)
  let snap
  try {
    snap = await getDocs(q)
  } catch (error) {
    logFirestoreError(
      "getWorkspaceInvites",
      'workspaceInvites where workspaceId == workspaceId and status == "pending" orderBy createdAt desc limit 200',
      error
    )
    throw error
  }
  return snap.docs.map((d) => mapWorkspaceInvite(d.id, d.data() as Record<string, unknown>))
}

export async function subscribeToWorkspaceInvites(
  userId: string,
  workspaceId: string,
  onChange: (invites: WorkspaceInvite[]) => void,
  onError?: (error: Error) => void
): Promise<Unsubscribe> {
  const database = ensureDb()

  const allowed = await isWorkspaceOwnerOrAdmin(userId, workspaceId)
  if (!allowed) throw new Error("Not authorized to view invites for this workspace")

  return onSnapshot(
    workspaceInvitesQuery(database, workspaceId),
    (snapshot) => {
      onChange(snapshot.docs.map((d) => mapWorkspaceInvite(d.id, d.data() as Record<string, unknown>)))
    },
    (error) => {
      logFirestoreError(
        "subscribeToWorkspaceInvites",
        'workspaceInvites where workspaceId == workspaceId and status == "pending" orderBy createdAt desc limit 200',
        error
      )
      onError?.(error)
    }
  )
}

export async function getPendingInvitesForEmail(userEmail: string): Promise<WorkspaceInvite[]> {
  const database = ensureDb()

  const invitesRef = collection(database, "workspaceInvites")
  const q = query(
    invitesRef,
    where("invitedEmail", "==", userEmail.toLowerCase()),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(200)
  )
  let snap
  try {
    snap = await getDocs(q)
  } catch (error) {
    logFirestoreError(
      "getPendingInvitesForEmail",
      'workspaceInvites where invitedEmail == currentUser.email and status == "pending" orderBy createdAt desc limit 200',
      error
    )
    throw error
  }

  return snap.docs.map((d) => mapWorkspaceInvite(d.id, d.data() as Record<string, unknown>))
}

export async function acceptWorkspaceInvite(inviteId: string, userId: string, userEmail: string): Promise<void> {
  const database = ensureDb()
  const inviteRef = doc(database, "workspaceInvites", inviteId)
  let snap
  try {
    snap = await getDoc(inviteRef)
  } catch (error) {
    logFirestoreError("acceptWorkspaceInvite", "get workspaceInvites/{inviteId}", error)
    throw error
  }
  if (!snap.exists()) throw new Error("Invite not found")
  const data = snap.data() as Record<string, unknown>
  const status = (data.status as WorkspaceInviteStatus) ?? ("pending" as WorkspaceInviteStatus)
  if (status !== "pending") throw new Error("Invite is no longer pending")

  const invitedEmail = (data.invitedEmail as string) ?? ""
  if (invitedEmail.toLowerCase() !== userEmail.toLowerCase()) throw new Error("Invite not addressed to this user")

  const expiresField = data.expiresAt as { toDate?: () => Date } | undefined
  const expires = expiresField && typeof expiresField.toDate === "function" ? expiresField.toDate() : (data.expiresAt as Date | null)
  if (expires && expires.getTime() < Date.now()) {
    throw new Error("Invite has expired")
  }

  const workspaceId = (data.workspaceId as string) ?? ""
  // create member doc
  const memberRef = doc(database, "workspaces", workspaceId, "members", userId)
  try {
    await setDoc(memberRef, {
      userId,
      workspaceId,
      inviteId,
      role: data.role ?? "member",
      joinedAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError("acceptWorkspaceInvite", "create workspaces/{workspaceId}/members/{userId} from pending invite", error)
    throw error
  }

  // increment member count on workspace
  const workspaceRef = doc(database, "workspaces", workspaceId)
  try {
    await updateDoc(workspaceRef, { memberCount: increment(1) })
  } catch (err) {
    // best-effort: if update fails, continue
    console.warn("Failed to increment memberCount", err)
  }

  // update invite status
  try {
    await updateDoc(inviteRef, { status: "accepted", acceptedAt: serverTimestamp(), acceptedBy: userId })
  } catch (error) {
    logFirestoreError("acceptWorkspaceInvite", "update workspaceInvites/{inviteId} status accepted", error)
    throw error
  }
}

export async function declineWorkspaceInvite(inviteId: string, userId: string, userEmail: string): Promise<void> {
  const database = ensureDb()
  const inviteRef = doc(database, "workspaceInvites", inviteId)
  let snap
  try {
    snap = await getDoc(inviteRef)
  } catch (error) {
    logFirestoreError("declineWorkspaceInvite", "get workspaceInvites/{inviteId}", error)
    throw error
  }
  if (!snap.exists()) throw new Error("Invite not found")
  const data = snap.data() as Record<string, unknown>
  const status = (data.status as WorkspaceInviteStatus) ?? ("pending" as WorkspaceInviteStatus)
  if (status !== "pending") throw new Error("Invite is no longer pending")

  const invitedEmail = (data.invitedEmail as string) ?? ""
  if (invitedEmail.toLowerCase() !== userEmail.toLowerCase()) throw new Error("Invite not addressed to this user")

  try {
    await updateDoc(inviteRef, { status: "declined", declinedAt: serverTimestamp(), declinedBy: userId })
  } catch (error) {
    logFirestoreError("declineWorkspaceInvite", "update workspaceInvites/{inviteId} status declined", error)
    throw error
  }
}
