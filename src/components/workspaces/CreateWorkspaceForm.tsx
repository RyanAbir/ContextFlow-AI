"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { createWorkspace, getWorkspaceById } from "@/lib/workspaces"
import { useWorkspace } from "@/context/workspace-context"

interface CreateWorkspaceFormProps {
  onClose: () => void
}

export function CreateWorkspaceForm({ onClose }: CreateWorkspaceFormProps) {
  const { user } = useAuth()
  const { addWorkspace } = useWorkspace()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const id = await createWorkspace(user.uid, { name, description })
      const workspace = await getWorkspaceById(id)
      if (workspace) {
        addWorkspace(workspace)
      }
      setName("")
      setDescription("")
      onClose()
    } catch (err) {
      console.error(err)
      setError("Failed to create workspace")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Workspace name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            placeholder="My team workspace"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            rows={3}
            placeholder="Optional description"
          />
        </div>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || name.trim() === ""}>
            {isLoading ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
