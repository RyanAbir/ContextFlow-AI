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
import type { Task, TaskPriority, TaskStatus } from "@/types/task"

type DateLike = {
  toDate?: () => Date
}

type CreateTaskInput = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
}

type UpdateTaskInput = Partial<{
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
}>

function ensureDb() {
  if (!db) {
    throw new Error("Firestore has not been initialized. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set and code runs on the client.")
  }
  return db
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

function mapTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    projectId: typeof data.projectId === "string" ? data.projectId : "",
    userId: typeof data.userId === "string" ? data.userId : "",
    title: typeof data.title === "string" ? data.title : "Untitled task",
    description: typeof data.description === "string" ? data.description : "",
    status: data.status === "in_progress" || data.status === "done" ? data.status : "todo",
    priority: data.priority === "low" || data.priority === "high" ? data.priority : "medium",
    dueDate: toDate(data.dueDate),
    createdAt: toDate(data.createdAt) ?? new Date(),
  }
}

export async function createTask(projectId: string, userId: string, data: CreateTaskInput): Promise<void> {
  const database = ensureDb()
  const tasksRef = collection(database, "tasks")

  await addDoc(tasksRef, {
    projectId,
    userId,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate ?? null,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToProjectTasks(projectId: string, userId: string, onChange: (tasks: Task[]) => void) {
  const database = ensureDb()
  const tasksRef = collection(database, "tasks")
  const q = query(
    tasksRef,
    where("projectId", "==", projectId),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(200)
  )

  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map((d) => mapTask(d.id, d.data() as Record<string, unknown>))
    onChange(results)
  })
}

export async function updateTask(taskId: string, updates: UpdateTaskInput): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "tasks", taskId)
  await updateDoc(ref, updates)
}

export async function deleteTask(taskId: string): Promise<void> {
  const database = ensureDb()
  const ref = doc(database, "tasks", taskId)
  await deleteDoc(ref)
}
