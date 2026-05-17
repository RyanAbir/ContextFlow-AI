"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { EditProjectForm } from "@/components/projects/EditProjectForm"
import { TaskCard } from "@/components/tasks/TaskCard"
import { TaskForm } from "@/components/tasks/TaskForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { getProjectById } from "@/lib/projects"
import { subscribeToProjectTasks } from "@/lib/tasks"
import type { Project } from "@/types/project"
import type { Task } from "@/types/task"

type ProjectResult =
  | { projectId: string; status: "ready"; project: Project }
  | { projectId: string; status: "not_found" | "unauthorized" | "error" }

type TasksResult = {
  projectId: string
  tasks: Task[]
}

export default function ProjectDetailPage() {
  const { projectId } = useParams() as { projectId: string }
  const router = useRouter()
  const { user, loading } = useAuth()
  const [projectResult, setProjectResult] = useState<ProjectResult | null>(null)
  const [editing, setEditing] = useState(false)
  const [tasksResult, setTasksResult] = useState<TasksResult | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!user) return

    let mounted = true

    getProjectById(projectId)
      .then((p) => {
        if (!mounted) return
        if (!p) {
          setProjectResult({ projectId, status: "not_found" })
          return
        }
        if (p.userId !== user.uid) {
          setProjectResult({ projectId, status: "unauthorized" })
          return
        }
        setProjectResult({ projectId, status: "ready", project: p })
      })
      .catch((err) => {
        console.error(err)
        if (mounted) {
          setProjectResult({ projectId, status: "error" })
        }
      })

    return () => {
      mounted = false
    }
  }, [projectId, user])

  useEffect(() => {
    if (!user || projectResult?.status !== "ready" || projectResult.project.userId !== user.uid) return

    const scopedProjectId = projectResult.project.id
    const unsub = subscribeToProjectTasks(scopedProjectId, user.uid, (list) => {
      setTasksResult({ projectId: scopedProjectId, tasks: list })
    })
    return () => unsub()
  }, [projectResult, user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (!projectResult || projectResult.projectId !== projectId) {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">Loading project...</div>
      </DashboardShell>
    )
  }

  if (projectResult.status === "not_found") {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">Project not found</p>
          <p className="mt-2 text-sm text-muted-foreground">The requested project does not exist.</p>
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard/projects")}>Back to projects</Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (projectResult.status === "unauthorized") {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">Unauthorized</p>
          <p className="mt-2 text-sm text-muted-foreground">You do not have access to this project.</p>
          <div className="mt-4">
            <Button onClick={() => router.push("/dashboard/projects")}>Back to projects</Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (projectResult.status === "error") {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
          <p className="text-sm text-muted-foreground">Unable to load project.</p>
        </div>
      </DashboardShell>
    )
  }

  if (projectResult.status !== "ready") {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
          <p className="text-sm text-muted-foreground">Unable to load project.</p>
        </div>
      </DashboardShell>
    )
  }

  const project = projectResult.project
  const tasks = tasksResult?.projectId === project.id ? tasksResult.tasks : null

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Project</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{project.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Created {project.createdAt.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/projects")}>
              Back
            </Button>
            <Button onClick={() => setEditing(true)}>Edit</Button>
          </div>
        </div>

        <Card>
          <p className="text-sm text-muted-foreground">{project.description || "No description provided."}</p>
          <div className="mt-4">
            <span className="rounded-full bg-muted/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {project.status}
            </span>
          </div>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Tasks</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Project tasks</h2>
            </div>
            <Button onClick={() => setShowCreateTask(true)}>New task</Button>
          </div>

          {tasks === null ? (
            <div className="rounded-2xl border border-border bg-card/95 p-6 text-sm text-muted-foreground">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
              <p className="text-lg font-semibold text-foreground">No tasks yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Create the first task for this project.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
              ))}
            </div>
          )}
        </section>

        {editing ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(false)} />
            <div className="relative w-full max-w-2xl p-6">
              <EditProjectForm
                project={project}
                onSaved={(updated) => setProjectResult({ projectId: updated.id, status: "ready", project: updated })}
                onClose={() => setEditing(false)}
              />
            </div>
          </div>
        ) : null}

        {showCreateTask ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateTask(false)} />
            <div className="relative w-full max-w-2xl p-6">
              <TaskForm projectId={project.id} userId={user.uid} onClose={() => setShowCreateTask(false)} />
            </div>
          </div>
        ) : null}

        {editingTask ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingTask(null)} />
            <div className="relative w-full max-w-2xl p-6">
              <TaskForm
                projectId={project.id}
                userId={user.uid}
                task={editingTask}
                onClose={() => setEditingTask(null)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
