"use client"

import { useEffect } from "react"
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

const overviewStats = [
  {
    title: "Total Projects",
    value: "8",
    description: "Active workflows in your team.",
    icon: Folder,
  },
  {
    title: "Active Tasks",
    value: "24",
    description: "Tasks currently in progress.",
    icon: CheckSquare,
  },
  {
    title: "AI Summaries",
    value: "4",
    description: "Generated insights ready to review.",
    icon: Sparkles,
  },
  {
    title: "Productivity Score",
    value: "72",
    description: "Placeholder benchmark for your workspace.",
    icon: BarChart3,
  },
]

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
              {[
                { name: "Website refresh", status: "In progress" },
                { name: "AI workflow pilot", status: "Review" },
                { name: "Client onboarding", status: "Planning" },
                { name: "Q2 roadmap", status: "Pending" },
              ].map((project) => (
                <div key={project.name} className="rounded-2xl border border-border bg-background/80 p-4 transition-colors hover:bg-muted/10">
                  <p className="text-base font-semibold text-foreground">{project.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{project.status}</p>
                </div>
              ))}
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
                {[
                  { label: "Backlog", value: "14" },
                  { label: "In progress", value: "6" },
                  { label: "Completed", value: "4" },
                ].map((task) => (
                  <div key={task.label} className="flex items-center justify-between rounded-2xl bg-muted/10 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{task.label}</span>
                    <span className="font-semibold text-foreground">{task.value}</span>
                  </div>
                ))}
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
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">Placeholder score</h3>
              </div>
            </div>
            <div className="rounded-2xl bg-muted/10 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Productivity metrics will populate after tracking your workflow and integrating task data.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </DashboardShell>
  )
}
