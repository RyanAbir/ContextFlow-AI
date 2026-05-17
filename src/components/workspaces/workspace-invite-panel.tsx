"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/context/workspace-context"
import {
  canManageWorkspaceInvites,
  createWorkspaceInvite,
  subscribeToWorkspaceInvites,
} from "@/lib/workspace-invites"
import type { WorkspaceInvite } from "@/types/workspace-invite"

export function WorkspaceInvitePanel() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [loading, setLoading] = useState(false)
  const [invites, setInvites] = useState<WorkspaceInvite[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isManager, setIsManager] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined
    const loadAccess = async () => {
      if (!currentWorkspace || !user) {
        setIsManager(false)
        setInvites([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const allowed = await canManageWorkspaceInvites(user.uid, currentWorkspace.id)
        if (!mounted) return
        setIsManager(allowed)
        if (!allowed) {
          setInvites([])
          return
        }

        unsubscribe = await subscribeToWorkspaceInvites(
          user.uid,
          currentWorkspace.id,
          (list) => {
            if (!mounted) return
            setInvites(list)
            setLoading(false)
          },
          (err) => {
            console.error(err)
            if (!mounted) return
            setError(err.message || "Failed to load invites")
            setLoading(false)
          }
        )
        if (!mounted) {
          unsubscribe()
          return
        }
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError((err as Error).message ?? "Failed to load invites")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadAccess()
    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [currentWorkspace, user])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !currentWorkspace) return
    setError(null)
    setLoading(true)
    try {
      await createWorkspaceInvite(user.uid, currentWorkspace.id, email, role)
      setEmail("")
      setRole("member")
    } catch (err) {
      console.error(err)
      setError((err as Error).message ?? "Failed to create invite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{currentWorkspace?.name ?? "Workspace"}</h3>
        <p className="text-sm text-muted-foreground">Manage members and invites</p>
      </div>

      {loading && invites === null ? (
        <div className="text-sm text-muted-foreground">Loading invites…</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground">Pending invites</h4>
            {invites && invites.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-foreground">
                {invites.map((i) => (
                  <li key={i.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <div>
                      <div className="font-medium">{i.invitedEmail}</div>
                      <div className="text-xs text-muted-foreground">{i.role} • {new Date(i.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{i.status}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">No pending invites</div>
            )}
          </div>

          {isManager === null ? (
            <div className="text-sm text-muted-foreground">Checking permissions…</div>
          ) : isManager === false ? (
            <div className="rounded-2xl border border-border bg-muted/5 p-4 text-sm text-muted-foreground">
              You do not have permission to manage workspace invites. Only workspace owners and admins may manage invites.
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Invite by email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "member")}
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setEmail(""); setRole("member") }} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading || email.trim() === ""}>{loading ? "Inviting..." : "Send invite"}</Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Card>
  )
}
