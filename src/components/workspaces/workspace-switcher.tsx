"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/context/workspace-context"
import dynamic from "next/dynamic"

const CreateWorkspaceForm = dynamic(() => import("./CreateWorkspaceForm").then((m) => m.CreateWorkspaceForm), { ssr: false })

export function WorkspaceSwitcher() {
  const { currentWorkspace, setCurrentWorkspace, workspaces, loading } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        className="inline-flex items-center gap-2 rounded-2xl"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="truncate max-w-[12rem] text-sm font-medium text-foreground">
          {currentWorkspace?.name ?? "Select workspace"}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-lg shadow-black/20">
          <div className="space-y-2 px-3 py-3">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card/95 px-3 py-3 text-sm text-muted-foreground">
                Loading workspaces...
              </div>
            ) : workspaces && workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => {
                    setCurrentWorkspace(workspace)
                    setOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <span className="block truncate">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">{workspace.description ?? "Workspace"}</span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-card/95 px-3 py-3 text-sm text-muted-foreground">
                No workspaces found
              </div>
            )}
          </div>
          <div className="border-t border-border px-3 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false)
                setShowCreate(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Create workspace
            </Button>
          </div>
        </div>
      ) : null}

      {showCreate ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto">
            <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create workspace</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} aria-label="Close">
                  ×
                </Button>
              </div>
              <div className="mt-4">
                {/* Lazy load form component to keep bundle small */}
                <CreateWorkspaceForm onClose={() => setShowCreate(false)} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
