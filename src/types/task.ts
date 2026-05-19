export type TaskStatus = "todo" | "in_progress" | "done"

export type TaskPriority = "low" | "medium" | "high"

export type Task = {
  id: string
  projectId: string
  userId: string
  workspaceId?: string
  createdBy?: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  createdAt: Date
}
