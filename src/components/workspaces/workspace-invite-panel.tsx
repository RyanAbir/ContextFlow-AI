"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/context/workspace-context"
import {
  createWorkspaceInvite,
  getWorkspaceInvites,
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

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!currentWorkspace || !user) return
      setLoading(true)
      try {
        const list = await getWorkspaceInvites(user.uid, currentWorkspace.id)
        if (!mounted) return
        setInvites(list)
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError((err as Error).message ?? "Failed to load invites")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [currentWorkspace, user])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !currentWorkspace) return
    setError(null)
    setLoading(true)
    try {
      await createWorkspaceInvite(user.uid, currentWorkspace.id, email, role)
      const list = await getWorkspaceInvites(user.uid, currentWorkspace.id)
      setInvites(list)
      setEmail("")
      setRole("member")
    } catch (err) {
      console.error(err)
      setError((err as Error).message ?? "Failed to create invite")
    } finally {
      setLoading(false)
    }
  }

  // Simple permission check: UI shows invite form only if current user appears to be owner/admin.
  // For full accuracy, server-side checks are enforced in rules and helpers.
  const canInvite = async () => {
    if (!user || !currentWorkspace) return false
    try {
      // try to fetch invites; helper will throw if not authorized
      await getWorkspaceInvites(user.uid, currentWorkspace.id)
      return true
    } catch (err) {
      return false
    }
  }

  const [allowed, setAllowed] = useState<boolean | null>(null)
  useEffect(() => {
    let mounted = true
    if (!currentWorkspace || !user) {
      setAllowed(false)
      return
    }
    setAllowed(null)
    canInvite().then((v) => mounted && setAllowed(v))
    return () => {
      mounted = false
    }
  }, [currentWorkspace, user])

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

          {allowed === null ? (
            <div className="text-sm text-muted-foreground">Checking permissions…</div>
          ) : allowed === false ? null : (
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
