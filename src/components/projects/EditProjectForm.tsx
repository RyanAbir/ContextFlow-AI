"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { updateProject } from "@/lib/projects"
import type { Project } from "@/types/project"

interface EditProjectFormProps {
  project: Project
  onSaved?: (updated: Project) => void
  onClose?: () => void
}

export function EditProjectForm({ project, onSaved, onClose }: EditProjectFormProps) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description ?? "")
  const [status, setStatus] = useState<Project["status"]>(project.status)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProject(project.id, { title, description, status })
      onSaved?.({ ...project, title, description, status })
      onClose?.()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project["status"])}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
        </div>
      </form>
    </Card>
  )
}
