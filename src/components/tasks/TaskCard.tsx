"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { deleteTask } from "@/lib/tasks"
import type { Task, TaskPriority, TaskStatus } from "@/types/task"

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const statusClasses: Record<TaskStatus, string> = {
  todo: "border-border bg-muted/20 text-muted-foreground",
  in_progress: "border-primary/20 bg-primary/10 text-foreground",
  done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
}

const priorityClasses: Record<TaskPriority, string> = {
  low: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  high: "border-red-500/20 bg-red-500/10 text-red-400",
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  )
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete task "${task.title}"?`)) return
    setIsDeleting(true)

    try {
      await deleteTask(task.id)
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusClasses[task.status]}>{statusLabels[task.status]}</Badge>
            <Badge className={priorityClasses[task.priority]}>{priorityLabels[task.priority]}</Badge>
          </div>

          <h3 className="mt-3 break-words text-base font-semibold text-foreground">{task.title}</h3>
          {task.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No description provided.</p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {task.dueDate ? <span>Due {task.dueDate.toLocaleDateString()}</span> : <span>No due date</span>}
            <span>Created {task.createdAt.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
