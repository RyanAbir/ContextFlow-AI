export type ProjectStatus = "active" | "paused" | "completed"

export type Project = {
  id: string
  userId: string
  title: string
  description?: string
  status: ProjectStatus
  createdAt: Date
}
