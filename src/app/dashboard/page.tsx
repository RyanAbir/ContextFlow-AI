"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  CheckSquare,
  Clock,
  Folder,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/context/workspace-context"
import { getWorkspaceProjects, listUserProjects } from "@/lib/projects"
import { getTasksForProjectIds, listUserTasks } from "@/lib/tasks"
import { seedDemoWorkspace } from "@/lib/demo-seed"
import type { Project } from "@/types/project"
import type { Task } from "@/types/task"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, router, user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
        <p className="text-lg font-medium text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <DashboardShell>
      <DashboardPageContent user={user} />
    </DashboardShell>
  )
}

interface DashboardPageContentProps {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>
}

function DashboardPageContent({ user }: DashboardPageContentProps) {
  const router = useRouter()
  const { currentWorkspace } = useWorkspace()
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  const totalProjects = projects?.length ?? 0
  const activeTasks = tasks?.filter((task) => task.status !== "done").length ?? 0
  const backlogCount = tasks?.filter((task) => task.status === "todo").length ?? 0
  const inProgressCount = tasks?.filter((task) => task.status === "in_progress").length ?? 0
  const completedCount = tasks?.filter((task) => task.status === "done").length ?? 0
  const productivityScore = tasks && tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
  const aiSummariesCount = 0

  const overviewStats = useMemo(
    () => [
      {
        title: "Total Projects",
        value: totalProjects.toString(),
        description: currentWorkspace
          ? "Projects in this workspace."
          : "All projects owned by your account.",
        icon: Folder,
      },
      {
        title: "Active Tasks",
        value: activeTasks.toString(),
        description: "Tasks currently open or in progress.",
        icon: CheckSquare,
      },
      {
        title: "AI Summaries",
        value: aiSummariesCount.toString(),
        description: "Generate summaries to populate AI insights.",
        icon: Sparkles,
      },
      {
        title: "Productivity Score",
        value: productivityScore.toString(),
        description: tasks && tasks.length > 0 ? "Completed task ratio over total tasks." : "No task history available yet.",
        icon: BarChart3,
      },
    ],
    [activeTasks, aiSummariesCount, currentWorkspace, productivityScore, tasks, totalProjects]
  )

  useEffect(() => {
    let cancelled = false

    async function loadDashboardStats() {
      if (!user) return
      setStatsLoading(true)
      setStatsError(null)

      try {
        if (currentWorkspace) {
          const workspaceProjects = await getWorkspaceProjects(currentWorkspace.id)
          let workspaceTasks: Task[] = []

          if (workspaceProjects.length > 0) {
            const projectIds = workspaceProjects.map((project) => project.id)
            workspaceTasks = await getTasksForProjectIds(projectIds)
          }

          if (!cancelled) {
            setProjects(workspaceProjects)
            setTasks(workspaceTasks)
          }
        } else {
          const [userProjects, userTasks] = await Promise.all([
            listUserProjects(user.uid),
            listUserTasks(user.uid),
          ])
          if (!cancelled) {
            setProjects(userProjects)
            setTasks(userTasks)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setStatsError((err as Error).message ?? "Unable to load dashboard data.")
          setProjects([])
          setTasks([])
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false)
        }
      }
    }

    void loadDashboardStats()
    return () => {
      cancelled = true
    }
  }, [currentWorkspace, user])

  return (
    <div className="space-y-5 sm:space-y-8">
      <section id="dashboard" className="rounded-2xl border border-border bg-card/95 p-4 shadow-sm shadow-black/10 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Workspace dashboard</p>
            <h1 className="mt-3 break-words text-2xl font-semibold text-foreground sm:mt-4 sm:text-4xl">
              {user.displayName ?? user.email ?? "Welcome back"}
            </h1>
          </div>
          <div className="w-fit rounded-2xl bg-muted/10 px-4 py-3 text-sm font-medium text-muted-foreground">
            Authenticated access enabled
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-base">
          This secure SaaS shell is built for ContextFlow AI. Use the sidebar to explore project status, tasks, AI insights, and settings.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="flex h-full flex-col space-y-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">
                  {stat.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{stat.value}</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{stat.description}</p>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] xl:gap-6">
        <Card className="space-y-6" id="projects">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Recent projects</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Project activity snapshot</h2>
            </div>
            <Button className="w-full sm:w-auto" variant="secondary" size="sm" onClick={() => router.push("/dashboard/projects")}>View all</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {statsLoading ? (
              <div className="col-span-full rounded-2xl border border-border bg-background/80 p-6 text-center text-sm text-muted-foreground">
                Loading projects...
              </div>
            ) : statsError ? (
              <div className="col-span-full rounded-2xl border border-border bg-background/80 p-6 text-center text-sm text-destructive">
                {statsError}
              </div>
            ) : projects && projects.length > 0 ? (
              projects.slice(0, 4).map((project) => (
                <div key={project.id} className="rounded-2xl border border-border bg-background/80 p-4 transition-colors hover:bg-muted/10">
                  <p className="text-base font-semibold text-foreground">{project.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground capitalize">{project.status}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-border bg-background/80 p-6 text-center text-sm text-muted-foreground">
                No projects found. Create a new project to get activity here.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4" id="tasks">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Task summary</p>
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">Tasks by status</h3>
              </div>
            </div>
            <div className="grid gap-3">
              {statsLoading ? (
                <div className="rounded-2xl border border-border bg-background/80 p-4 text-center text-sm text-muted-foreground">
                  Calculating task status summary...
                </div>
              ) : statsError ? (
                <div className="rounded-2xl border border-border bg-background/80 p-4 text-center text-sm text-destructive">
                  {statsError}
                </div>
              ) : (
                [
                  { label: "Backlog", value: backlogCount.toString() },
                  { label: "In progress", value: inProgressCount.toString() },
                  { label: "Completed", value: completedCount.toString() },
                ].map((task) => (
                  <div key={task.label} className="flex items-center justify-between rounded-2xl bg-muted/10 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{task.label}</span>
                    <span className="font-semibold text-foreground">{task.value}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="space-y-4" id="insights">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">AI insights</p>
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">Placeholder recommendations</h3>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              AI insights will appear here once your project data is connected. For now, build on this secure dashboard shell.
            </p>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)] xl:gap-6" id="settings">
        <Card className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Recent activity</p>
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">Team actions</h3>
            </div>
          </div>
          <div className="space-y-3">
            {[
              "Added new project brief",
              "Updated AI summary draft",
              "Completed task: kickoff meeting",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-background/80 px-4 py-4">
                <p className="text-sm text-foreground">{item}</p>
                <p className="mt-2 text-xs text-muted-foreground">Just now</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Productivity</p>
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                {statsLoading ? "Loading score" : "Productivity score"}
              </h3>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/10 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {statsLoading
                ? "Loading productivity data..."
                : tasks && tasks.length > 0
                ? `Completed ${completedCount} of ${tasks.length} tasks (${productivityScore}%).`
                : "Productivity metrics will populate after tracking your workflow and integrating task data."}
            </p>
          </div>
        </Card>
      </section>

      {process.env.NODE_ENV === "development" ? (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)] xl:gap-6" id="demo-seed">
          <Card className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.3em]">Developer preview</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">Generate demo data</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (!user) return
                  setSeedLoading(true)
                  setSeedError(null)
                  setSeedMessage(null)
                  try {
                    await seedDemoWorkspace(user.uid)
                    setSeedMessage("Demo workspace created successfully. Refresh to see the new workspace.")
                  } catch (err) {
                    console.error(err)
                    setSeedError((err as Error).message ?? "Unable to generate demo data.")
                  } finally {
                    setSeedLoading(false)
                  }
                }}
                disabled={seedLoading}
              >
                {seedLoading ? "Generating..." : "Generate Demo Data"}
              </Button>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Create a seeded workspace with example projects, tasks, and context notes for local development.
            </p>
            {seedMessage ? (
              <div className="rounded-2xl border border-border bg-background/90 px-4 py-3 text-sm text-foreground">
                {seedMessage}
              </div>
            ) : null}
            {seedError ? (
              <div className="rounded-2xl border border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {seedError}
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}
    </div>
  )
}
