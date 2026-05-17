"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/context/workspace-context"
import { createProject, createWorkspaceProject } from "@/lib/projects"

interface CreateProjectFormProps {
  onClose: () => void
}

export function CreateProjectForm({ onClose }: CreateProjectFormProps) {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"active" | "paused" | "completed">("active")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isWorkspaceSelected = currentWorkspace !== null
  const workspaceLabel = isWorkspaceSelected ? currentWorkspace?.name : "Personal workspace"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      if (currentWorkspace) {
        await createWorkspaceProject(currentWorkspace.id, user.uid, {
          title,
          description,
          status,
        })
      } else {
        await createProject(user.uid, { title, description, status })
      }
      setTitle("")
      setDescription("")
      setStatus("active")
      onClose()
    } catch (err) {
      console.error(err)
      setError("Unable to create project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Creating project in</p>
          <div className="mt-2 rounded-lg border border-border bg-muted/5 px-3 py-2 text-sm text-foreground">
            {workspaceLabel}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            placeholder="Project title"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            rows={3}
            placeholder="Short description"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "paused" | "completed")}
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || title.trim() === ""}>
            {isLoading ? "Creating..." : `Create project${isWorkspaceSelected ? " in workspace" : " in personal workspace"}`}
          </Button>
        </div>
      </form>
    </Card>
  )
}
