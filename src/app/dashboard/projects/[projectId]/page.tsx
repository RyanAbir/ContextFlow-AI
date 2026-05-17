"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { useAuth } from "@/context/auth-context"
import { getProjectById } from "@/lib/projects"
import type { Project } from "@/types/project"
import { EditProjectForm } from "@/components/projects/EditProjectForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ProjectDetailPage() {
  const { projectId } = useParams() as { projectId: string }
  const router = useRouter()
  const { user, loading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [editing, setEditing] = useState(false)

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
          setNotFound(true)
          return
        }
        if (p.userId !== user.uid) {
          setUnauthorized(true)
          return
        }
        setProject(p)
      })
      .catch((err) => console.error(err))
      .finally(() => mounted && setLoadingProject(false))

    return () => {
      mounted = false
    }
  }, [projectId, user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (loadingProject) {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">Loading project…</div>
      </DashboardShell>
    )
  }

  if (notFound) {
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

  if (unauthorized) {
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

  if (!project) {
    return (
      <DashboardShell>
        <div className="rounded-2xl border border-border bg-card/95 p-8 text-center">
          <p className="text-sm text-muted-foreground">Unable to load project.</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Project</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{project.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Created {project.createdAt.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/projects")}>Back</Button>
            <Button onClick={() => setEditing(true)}>Edit</Button>
          </div>
        </div>

        <Card>
          <p className="text-sm text-muted-foreground">{project.description ?? "No description provided."}</p>
          <div className="mt-4">
            <span className="rounded-full bg-muted/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{project.status}</span>
          </div>
        </Card>

        {editing ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(false)} />
            <div className="relative w-full max-w-2xl p-6">
              <EditProjectForm
                project={project}
                onSaved={(updated) => setProject(updated)}
                onClose={() => setEditing(false)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
