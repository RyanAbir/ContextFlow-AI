"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { getPendingInvitesForEmail, acceptWorkspaceInvite, declineWorkspaceInvite } from "@/lib/workspace-invites"
import type { WorkspaceInvite } from "@/types/workspace-invite"

export default function InvitesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const userEmail = user?.email ?? null
  const [invites, setInvites] = useState<WorkspaceInvite[] | null>(null)
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, router, user])

  const loadInvites = useCallback(async () => {
    if (!userEmail) return
    setLoadingInvites(true)
    setError(null)

    try {
      const list = await getPendingInvitesForEmail(userEmail)
      setInvites(list)
    } catch (err) {
      console.error("[InvitesPage] getPendingInvitesForEmail failed", err)
      setError((err as Error).message ?? "Unable to load invites")
    } finally {
      setLoadingInvites(false)
    }
  }, [userEmail])

  useEffect(() => {
    queueMicrotask(() => {
      void loadInvites()
    })
  }, [loadInvites])

  const handleAccept = async (inviteId: string) => {
    if (!user?.email || !user.uid) return
    setActionLoading(inviteId)
    setError(null)
    try {
      await acceptWorkspaceInvite(inviteId, user.uid, user.email)
      await loadInvites()
    } catch (err) {
      console.error("[InvitesPage] acceptWorkspaceInvite failed", err)
      setError((err as Error).message ?? "Unable to accept invite")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (inviteId: string) => {
    if (!user?.email || !user.uid) return
    setActionLoading(inviteId)
    setError(null)
    try {
      await declineWorkspaceInvite(inviteId, user.uid, user.email)
      await loadInvites()
    } catch (err) {
      console.error("[InvitesPage] declineWorkspaceInvite failed", err)
      setError((err as Error).message ?? "Unable to decline invite")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-muted-foreground">Loading invites...</p>
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Workspace invites</p>
              <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Pending invites</h1>
            </div>
            <div className="rounded-2xl bg-muted/10 px-4 py-2 text-sm font-medium text-muted-foreground">
              {user.email}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            Accept or decline invites addressed to your authenticated email address.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-border bg-destructive/10 px-4 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loadingInvites ? (
          <Card className="rounded-2xl border border-border bg-background/80 p-6 text-sm text-muted-foreground">
            Loading pending invites...
          </Card>
        ) : invites === null || invites.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-muted/5 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No pending invites</p>
            <p className="mt-2">Any pending workspace invites addressed to your email will appear here.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invites.map((invite) => {
              const isActive = actionLoading === invite.id
              return (
                <Card key={invite.id} className="space-y-4 border border-border bg-background/80 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{invite.workspaceName}</p>
                      <h2 className="mt-1 text-xl font-semibold text-foreground truncate">{invite.workspaceName}</h2>
                    </div>
                    <span className="rounded-full border border-border bg-muted/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {invite.status}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Role</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{invite.role}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Invited by</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{invite.invitedBy}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{invite.createdAt.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{invite.invitedEmail}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={() => void handleDecline(invite.id)} disabled={isActive}>Decline</Button>
                    <Button onClick={() => void handleAccept(invite.id)} disabled={isActive}>{isActive ? "Processing..." : "Accept"}</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
