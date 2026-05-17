"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { WorkspaceInvitePanel } from "@/components/workspaces/workspace-invite-panel"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/context/workspace-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { deleteWorkspace } from "@/lib/workspaces"

export default function WorkspaceSettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, router, user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-muted-foreground">Loading workspace settings...</p>
      </div>
    )
  }

  return (
    <DashboardShell>
      <WorkspaceSettingsContent />
    </DashboardShell>
  )
}

function WorkspaceSettingsContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const isWorkspaceOwner = currentWorkspace?.ownerId === user?.uid

  async function handleDeleteWorkspace() {
    if (!currentWorkspace || !user) return
    setDeleteLoading(true)
    setDeleteError(null)
    setDeleteSuccess(null)

    try {
      await deleteWorkspace(user.uid, currentWorkspace.id)
      setDeleteSuccess(`Deleted ${currentWorkspace.name}.`)
      setCurrentWorkspace(null)
      setShowDeleteConfirmation(false)
      router.push("/dashboard")
    } catch (error) {
      setDeleteError((error as Error).message ?? "Unable to delete workspace.")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm shadow-black/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Workspace Settings</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{currentWorkspace?.name ?? "No workspace selected"}</h1>
          </div>
          {currentWorkspace ? (
            <div className="rounded-2xl bg-muted/10 px-4 py-2 text-sm font-medium text-muted-foreground">
              Member count: {currentWorkspace.memberCount}
            </div>
          ) : null}
        </div>

        {currentWorkspace ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage workspace invites and membership settings for <span className="font-medium text-foreground">{currentWorkspace.name}</span>.
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/5 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No workspace selected</p>
            <p className="mt-2">Select a workspace in the top bar to manage invites and settings.</p>
          </div>
        )}
      </div>

      {currentWorkspace ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Workspace details</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">Basic information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Workspace name</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{currentWorkspace.name}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Workspace owner</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{currentWorkspace.ownerId}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{currentWorkspace.memberCount}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {currentWorkspace.updatedAt ? currentWorkspace.updatedAt.toLocaleString() : "Never"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border border-border bg-background/80 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Workspace controls</p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">Actions</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/projects")}>Back to projects</Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Invite team members below or manage workspace settings as your role allows. Invite acceptance and membership management will appear once users respond.
              </p>
            </Card>

            <Card className="rounded-2xl border border-destructive/50 bg-destructive/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-destructive">Danger zone</p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">Delete workspace</h2>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={!isWorkspaceOwner || deleteLoading}
                >
                  Delete workspace
                </Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                This will remove the workspace and related workspace membership records. Only the workspace owner may perform this action.
              </p>

              {showDeleteConfirmation ? (
                <div className="mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">
                    Confirm deletion of <span className="font-semibold text-foreground">{currentWorkspace.name}</span>. This cannot be undone.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirmation(false)} disabled={deleteLoading}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteWorkspace} disabled={deleteLoading}>
                      {deleteLoading ? "Deleting..." : "Confirm delete"}
                    </Button>
                  </div>
                  {deleteError ? (
                    <p className="mt-3 text-sm text-destructive">{deleteError}</p>
                  ) : null}
                </div>
              ) : null}

              {deleteSuccess ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-foreground">
                  {deleteSuccess}
                </div>
              ) : null}
            </Card>
          </div>

          <div className="space-y-6">
            <WorkspaceInvitePanel />
          </div>
        </div>
      ) : null}
    </div>
  )
}
