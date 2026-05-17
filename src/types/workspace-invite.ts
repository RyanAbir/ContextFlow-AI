import type { WorkspaceRole } from "./workspace"

export type WorkspaceInviteStatus = "pending" | "accepted" | "declined" | "expired"

export type WorkspaceInvite = {
  id: string
  workspaceId: string
  workspaceName: string
  invitedEmail: string
  invitedBy: string
  role: WorkspaceRole
  status: WorkspaceInviteStatus
  createdAt: Date
  expiresAt?: Date | null
}
