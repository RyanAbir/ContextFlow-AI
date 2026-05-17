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
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Projects</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Project workspaces</h1>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setShowCreate(true)}>New project</Button>
        </div>

        <div>
          {projects === null ? (
            <div className="rounded-2xl border border-border bg-card/95 p-6 text-sm text-muted-foreground">
              Loading your projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/95 p-6 text-center sm:p-8">
              <p className="text-lg font-semibold text-foreground">No projects yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Create your first project to get started.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onClick={(id) => router.push(`/dashboard/projects/${id}`)} />
              ))}
            </div>
          )}
        </div>

        {showCreate ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto">
              <CreateProjectForm onClose={() => setShowCreate(false)} />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
