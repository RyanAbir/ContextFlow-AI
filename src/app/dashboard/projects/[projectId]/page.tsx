"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ContextNoteCard } from "@/components/context-notes/ContextNoteCard"
import { ContextNoteForm } from "@/components/context-notes/ContextNoteForm"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { EditProjectForm } from "@/components/projects/EditProjectForm"
import { TaskCard } from "@/components/tasks/TaskCard"
import { TaskForm } from "@/components/tasks/TaskForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { subscribeToProjectNotes } from "@/lib/context-notes"
import { getProjectById } from "@/lib/projects"
import { subscribeToProjectTasks } from "@/lib/tasks"
import type { ProjectAiSummary } from "@/types/ai-summary"
import type { ContextNote } from "@/types/context-note"
import type { Project } from "@/types/project"
import type { Task } from "@/types/task"

type ProjectResult =
  | { projectId: string; status: "ready"; project: Project }
  | { projectId: string; status: "not_found" | "unauthorized" | "error" }

type TasksResult = {
  projectId: string
  tasks: Task[]
}

type NotesResult = {
  projectId: string
  notes: ContextNote[]
}

type ProjectSummaryApiResponse = {
  summary?: ProjectAiSummary
  error?: string
}

export default function ProjectDetailPage() {
  const { projectId } = useParams() as { projectId: string }
  const router = useRouter()
  const { user, loading } = useAuth()
  const [projectResult, setProjectResult] = useState<ProjectResult | null>(null)
  const [editing, setEditing] = useState(false)
  const [notesResult, setNotesResult] = useState<NotesResult | null>(null)
  const [tasksResult, setTasksResult] = useState<TasksResult | null>(null)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [editingNote, setEditingNote] = useState<ContextNote | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [aiSummary, setAiSummary] = useState<ProjectAiSummary | null>(null)
  const [showAiSummary, setShowAiSummary] = useState(false)
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

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

  useEffect(() => {
    if (!user || projectResult?.status !== "ready" || projectResult.project.userId !== user.uid) return

    const scopedProjectId = projectResult.project.id
    const unsub = subscribeToProjectNotes(scopedProjectId, user.uid, (list) => {
      setNotesResult({ projectId: scopedProjectId, notes: list })
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
  const notes = notesResult?.projectId === project.id ? notesResult.notes : null
  const tasks = tasksResult?.projectId === project.id ? tasksResult.tasks : null
  const canGenerateSummary = tasks !== null && notes !== null && !isGeneratingSummary

  const handleGenerateSummary = async () => {
    if (!canGenerateSummary) return

    setIsGeneratingSummary(true)
    setAiSummaryError(null)
    setShowAiSummary(true)

    try {
      const response = await fetch("/api/ai/project-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: {
            id: project.id,
            title: project.title,
            description: project.description ?? "",
            status: project.status,
          },
          tasks: tasks.map((task) => ({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate?.toISOString(),
          })),
          contextNotes: notes.map((note) => ({
            title: note.title,
            content: note.content,
            category: note.category,
            updatedAt: note.updatedAt.toISOString(),
          })),
        }),
      })

      const data = (await response.json().catch(() => ({}))) as ProjectSummaryApiResponse

      if (!response.ok || !data.summary) {
        setAiSummaryError(data.error ?? "Unable to generate an AI summary right now.")
        return
      }

      setAiSummary(data.summary)
    } catch (error) {
      console.error(error)
      setAiSummaryError("Unable to reach the AI summary service.")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

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
            <Button variant="outline" onClick={handleGenerateSummary} disabled={!canGenerateSummary}>
              {isGeneratingSummary ? "Generating..." : "Generate AI Summary"}
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
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Context</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Context notes</h2>
            </div>
            <Button onClick={() => setShowCreateNote(true)}>New note</Button>
          </div>

          {notes === null ? (
            <div className="rounded-2xl border border-border bg-card/95 p-6 text-sm text-muted-foreground">
              Loading context notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
              <p className="text-lg font-semibold text-foreground">No context notes yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Store requirements, decisions, ideas, and meeting notes for this project.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <ContextNoteCard key={note.id} note={note} onEdit={setEditingNote} />
              ))}
            </div>
          )}
        </section>

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

        {showAiSummary ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAiSummary(false)} />
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
              <Card className="space-y-5 rounded-2xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">AI Summary</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">{project.title}</h2>
                  </div>
                  <Button variant="ghost" onClick={() => setShowAiSummary(false)}>
                    Close
                  </Button>
                </div>

                {isGeneratingSummary ? (
                  <div className="rounded-2xl border border-border bg-background/40 p-6 text-sm text-muted-foreground">
                    Generating project summary...
                  </div>
                ) : aiSummaryError ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
                    {aiSummaryError}
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-4">
                    <section className="rounded-2xl border border-border bg-background/40 p-5">
                      <h3 className="text-sm font-semibold text-foreground">Project Summary</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiSummary.projectSummary}</p>
                    </section>

                    <section className="rounded-2xl border border-border bg-background/40 p-5">
                      <h3 className="text-sm font-semibold text-foreground">Current Progress</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiSummary.currentProgress}</p>
                    </section>

                    <section className="rounded-2xl border border-border bg-background/40 p-5">
                      <h3 className="text-sm font-semibold text-foreground">Blockers/Risks</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiSummary.blockersRisks}</p>
                    </section>

                    <section className="rounded-2xl border border-border bg-background/40 p-5">
                      <h3 className="text-sm font-semibold text-foreground">Recommended Next Steps</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                        {aiSummary.recommendedNextSteps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-2xl border border-border bg-background/40 p-5">
                      <h3 className="text-sm font-semibold text-foreground">Priority Suggestions</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                        {aiSummary.prioritySuggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                ) : null}
              </Card>
            </div>
          </div>
        ) : null}

        {showCreateNote ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateNote(false)} />
            <div className="relative w-full max-w-2xl p-6">
              <ContextNoteForm projectId={project.id} userId={user.uid} onClose={() => setShowCreateNote(false)} />
            </div>
          </div>
        ) : null}

        {editingNote ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingNote(null)} />
            <div className="relative w-full max-w-2xl p-6">
              <ContextNoteForm
                projectId={project.id}
                userId={user.uid}
                note={editingNote}
                onClose={() => setEditingNote(null)}
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
