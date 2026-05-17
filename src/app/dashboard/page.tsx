"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Activity, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { useAuth } from "@/context/auth-context"

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
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-border bg-card/95 p-8 shadow-sm shadow-black/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
              <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
                {user.displayName ?? user.email ?? "Your dashboard"}
              </h1>
            </div>
            <div className="rounded-3xl bg-muted/10 px-4 py-2 text-sm text-muted-foreground">
              Live workspace status
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            This foundation is prepared for your authenticated dashboard experience. Add app-specific content and team data next.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Team activity</p>
            <p className="text-3xl font-semibold text-foreground">12 updates</p>
          </Card>
          <Card className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">AI insights</p>
            <p className="text-3xl font-semibold text-foreground">4 summaries</p>
          </Card>
          <Card className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Next step</p>
            <p className="text-3xl font-semibold text-foreground">Ready to configure</p>
          </Card>
        </div>

        <div className="rounded-[2rem] border border-border bg-background/80 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">Protected foundation ready for your app.</h2>
            </div>
            <Button onClick={() => router.push("/dashboard")}>Refresh view</Button>
          </div>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            Users who are not signed in will be redirected to the login page automatically.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
