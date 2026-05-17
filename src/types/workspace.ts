export type WorkspaceRole = "owner" | "admin" | "member"

export type Workspace = {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: Date
  updatedAt?: Date
  memberCount: number
}

export type WorkspaceMember = {
  userId: string
  workspaceId: string
  role: WorkspaceRole
  joinedAt: Date
}
