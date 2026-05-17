"use client"

// Use built-in date formatting to avoid an extra dependency
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { updateProject, deleteProject } from "@/lib/projects"
import type { Project } from "@/types/project"
import { useState } from "react"

interface ProjectCardProps {
  project: Project
  onClick?: (id: string) => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm(`Delete project "${project.title}"?`)) return
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChangeStatus = async (status: Project["status"], e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await updateProject(project.id, { status })
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <Card className="space-y-3 cursor-pointer" onClick={() => onClick?.(project.id)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
          <p className="mt-3 text-xs text-muted-foreground">Created {project.createdAt.toLocaleDateString()}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full bg-muted/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {project.status}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={(e) => handleChangeStatus("active", e)}>Active</Button>
            <Button size="sm" variant="ghost" onClick={(e) => handleChangeStatus("paused", e)}>Pause</Button>
            <Button size="sm" variant="destructive" onClick={(e) => handleDelete(e)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
