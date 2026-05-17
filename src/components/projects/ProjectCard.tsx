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
    <Card className="h-full cursor-pointer space-y-3 hover:border-border/80 hover:bg-card" onClick={() => onClick?.(project.id)}>
      <div className="flex h-full flex-col gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-semibold text-foreground">{project.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{project.description || "No description provided."}</p>
          <p className="mt-3 text-xs text-muted-foreground">Created {project.createdAt.toLocaleDateString()}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-fit rounded-full bg-muted/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {project.status}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
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
