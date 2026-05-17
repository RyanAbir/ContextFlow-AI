import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, ProjectStatus } from "@/types/project"

function ensureDb() {
  if (!db) {
    throw new Error("Firestore has not been initialized. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set and code runs on the client.")
  }
  return db
}

export async function createProject(userId: string, data: {
  title: string
  description?: string
  status?: ProjectStatus
}): Promise<void> {
  const database = ensureDb()
  const projectsRef = collection(database, "projects")

  await addDoc(projectsRef, {
    userId,
    title: data.title,
    description: data.description ?? "",
    status: data.status ?? "active",
    createdAt: serverTimestamp(),
  })
}

export function subscribeToUserProjects(userId: string, onChange: (projects: Project[]) => void) {
  const database = ensureDb()
  const projectsRef = collection(database, "projects")
  const q = query(projectsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(100))

  return onSnapshot(q, (snapshot) => {
    const results: Project[] = snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      const createdField = data.createdAt as { toDate?: () => Date } | undefined
      const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
      const userId = (data.userId as string) ?? ""
      const title = (data.title as string) ?? "Untitled"
      const description = (data.description as string) ?? ""
      const status = (data.status as ProjectStatus) ?? "active"

      return {
        id: d.id,
        userId,
        title,
        description,
        status,
        createdAt: created,
      }
    })
    onChange(results)
  })
}

export async function listUserProjects(userId: string): Promise<Project[]> {
  const database = ensureDb()
  const projectsRef = collection(database, "projects")
  const q = query(projectsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(100))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    const createdField = data.createdAt as { toDate?: () => Date } | undefined
    const created = createdField && typeof createdField.toDate === "function" ? createdField.toDate() : new Date()
    const userId = (data.userId as string) ?? ""
    const title = (data.title as string) ?? "Untitled"
    const description = (data.description as string) ?? ""
    const status = (data.status as ProjectStatus) ?? "active"

    return {
      id: d.id,
      userId,
      title,
      description,
      status,
      createdAt: created,
    }
  })
}

export async function updateProject(projectId: string, updates: Partial<{
  title: string
  description: string
  status: ProjectStatus
}>): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "projects", projectId)
  await updateDoc(ref, updates as Record<string, unknown>)
}

export async function deleteProject(projectId: string): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "projects", projectId)
  await deleteDoc(ref)
}
