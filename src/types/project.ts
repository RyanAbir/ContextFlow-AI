export type ProjectStatus = "active" | "paused" | "completed"

export type Project = {
  id: string
  userId: string
  // Optional workspace association for team-owned projects
  workspaceId?: string
  // The user who created the project (may be same as userId for personal projects)
  createdBy?: string
  title: string
  description?: string
  status: ProjectStatus
  createdAt: Date
}
