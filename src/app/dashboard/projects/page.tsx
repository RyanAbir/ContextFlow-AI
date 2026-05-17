"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { CreateProjectForm } from "@/components/projects/CreateProjectForm"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { subscribeToUserProjects } from "@/lib/projects"
import { useAuth } from "@/context/auth-context"
import type { Project } from "@/types/project"

export default function ProjectsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserProjects(user.uid, (list) => setProjects(list))
    return () => unsub()
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Projects</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Project workspaces</h1>
          </div>
          <div>
            <Button onClick={() => setShowCreate(true)}>New project</Button>
          </div>
        </div>

        <div>
          {projects === null ? (
            <p className="text-sm text-muted-foreground">Loading your projects…</p>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
              <p className="text-lg font-semibold text-foreground">No projects yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Create your first project to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>

        {showCreate ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
            <div className="relative w-full max-w-2xl p-6">
              <CreateProjectForm onClose={() => setShowCreate(false)} />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
