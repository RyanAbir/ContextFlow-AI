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
  addWorkspace: (workspace: Workspace) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      return
    }

    if (!user) {
      setWorkspaces(null)
      setCurrentWorkspace(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToUserWorkspaces(user.uid, (list) => {
      setWorkspaces(list)
      setLoading(false)
      setCurrentWorkspace((current) => {
        if (current && list.some((workspace) => workspace.id === current.id)) {
          return current
        }
        return list[0] ?? null
      })
    })

    return () => unsubscribe()
  }, [authLoading, user])

  const addWorkspace = (workspace: Workspace) => {
    setWorkspaces((prev) => {
      const list = prev ?? []
      if (list.some((w) => w.id === workspace.id)) return list
      return [workspace, ...list]
    })
    setCurrentWorkspace(workspace)
  }

  const value = useMemo(
    () => ({ currentWorkspace, setCurrentWorkspace, workspaces, loading, addWorkspace }),
    [currentWorkspace, loading, workspaces]
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
