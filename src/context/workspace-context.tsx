"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { subscribeToUserWorkspaces } from "@/lib/workspaces"
import type { Workspace } from "@/types/workspace"

type WorkspaceContextValue = {
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (workspace: Workspace | null) => void
  workspaces: Workspace[] | null
  loading: boolean
  error: string | null
  addWorkspace: (workspace: Workspace) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const applyState = (update: () => void) => {
      queueMicrotask(() => {
        if (!cancelled) update()
      })
    }

    if (authLoading) {
      applyState(() => {
        setLoading(true)
        setError(null)
      })
      return () => {
        cancelled = true
      }
    }

    if (!user) {
      applyState(() => {
        setWorkspaces(null)
        setCurrentWorkspace(null)
        setLoading(false)
        setError(null)
      })
      return () => {
        cancelled = true
      }
    }

    applyState(() => {
      setLoading(true)
      setError(null)
    })

    const unsubscribe = subscribeToUserWorkspaces(
      user.uid,
      (list) => {
        if (cancelled) return
        setWorkspaces(list)
        setLoading(false)
        setError(null)
        setCurrentWorkspace((current) => {
          if (current && list.some((workspace) => workspace.id === current.id)) {
            return current
          }
          return list[0] ?? null
        })
      },
      (err) => {
        if (cancelled) return
        console.error("Failed to load workspaces", err)
        setWorkspaces([])
        setCurrentWorkspace(null)
        setError(err.message || "Failed to load workspaces")
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [authLoading, user])

  const addWorkspace = (workspace: Workspace) => {
    setError(null)
    setWorkspaces((prev) => {
      const list = prev ?? []
      if (list.some((w) => w.id === workspace.id)) return list
      return [workspace, ...list]
    })
    setCurrentWorkspace(workspace)
  }

  const value = useMemo(
    () => ({ currentWorkspace, setCurrentWorkspace, workspaces, loading, error, addWorkspace }),
    [currentWorkspace, loading, error, workspaces]
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  }

  return context
}
