import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getProjectById } from "@/lib/projects"
import type { ContextNote, ContextNoteCategory } from "@/types/context-note"

type DateLike = {
  toDate?: () => Date
}

type CreateContextNoteInput = {
  title: string
  content: string
  category?: ContextNoteCategory
}

type UpdateContextNoteInput = Partial<{
  title: string
  content: string
  category: ContextNoteCategory | null
}>

const categories: ContextNoteCategory[] = ["requirements", "meeting", "idea", "blocker", "technical"]

function ensureDb() {
  if (!db) {
    throw new Error("Firestore has not been initialized. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set and code runs on the client.")
  }
  return db
}

function logFirestoreError(helper: string, queryShape: string, error: unknown) {
  console.error(`[Firestore:${helper}] ${queryShape}`, error)
}

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value

  const candidate = value as DateLike
  if (typeof candidate.toDate === "function") {
    return candidate.toDate()
  }

  return undefined
}

function toCategory(value: unknown): ContextNoteCategory | undefined {
  if (typeof value !== "string") return undefined
  return categories.includes(value as ContextNoteCategory) ? (value as ContextNoteCategory) : undefined
}

function mapContextNote(id: string, data: Record<string, unknown>): ContextNote {
  const createdAt = toDate(data.createdAt) ?? new Date()

  return {
    id,
    projectId: typeof data.projectId === "string" ? data.projectId : "",
    userId: typeof data.userId === "string" ? data.userId : "",
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : undefined,
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    title: typeof data.title === "string" ? data.title : "Untitled note",
    content: typeof data.content === "string" ? data.content : "",
    category: toCategory(data.category),
    createdAt,
    updatedAt: toDate(data.updatedAt) ?? createdAt,
  }
}

export async function createContextNote(
  projectId: string,
  userId: string,
  data: CreateContextNoteInput
): Promise<void> {
  const database = ensureDb()
  const notesRef = collection(database, "contextNotes")

  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error("Project not found")
  }

  try {
    await addDoc(notesRef, {
      projectId,
      userId,
      createdBy: userId,
      workspaceId: project.workspaceId ?? null,
      title: data.title,
      content: data.content,
      category: data.category ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError("createContextNote", "add contextNotes document", error)
    throw error
  }
}

export function subscribeToProjectNotes(
  projectId: string,
  userId: string,
  onChange: (notes: ContextNote[]) => void
) {
  const database = ensureDb()
  const notesRef = collection(database, "contextNotes")
  const q = query(
    notesRef,
    where("projectId", "==", projectId),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(200)
  )

  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map((d) => mapContextNote(d.id, d.data() as Record<string, unknown>))
    onChange(results)
  })
}

export async function updateContextNote(noteId: string, updates: UpdateContextNoteInput): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "contextNotes", noteId)
  try {
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreError("updateContextNote", "update contextNotes/{noteId}", error)
    throw error
  }
}

export async function deleteContextNote(noteId: string): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "contextNotes", noteId)
  try {
    await deleteDoc(ref)
  } catch (error) {
    logFirestoreError("deleteContextNote", "delete contextNotes/{noteId}", error)
    throw error
  }
}
