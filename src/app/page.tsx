import { ArrowRight, BarChart3, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/layout/dashboard-shell"

const metrics = [
  { label: "Active users", value: "18.3k", icon: Users },
  { label: "Conversion", value: "12.8%", icon: Sparkles },
  { label: "Growth", value: "4.9x", icon: BarChart3 },
]

export default function Home() {
  return (
    <DashboardShell>
      <div className="flex w-full flex-col gap-8">
        <section className="rounded-[2rem] border border-border bg-card/95 p-8 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                ContextFlow AI
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A clean, scalable SaaS dashboard foundation with quiet dark theme styling and responsive layout support.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button>Start building</Button>
              <Button variant="outline">Explore components</Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-[1.75rem] border border-border bg-background/80 p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-6 text-3xl font-semibold text-foreground">{item.value}</p>
              </div>
            )
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[2rem] border border-border bg-card/95 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Growth snapshot</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Review the initial product metrics and refine the first launch roadmap.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/80 bg-background/80 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Pipeline</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">42%</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/80 bg-background/80 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Retention</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">81%</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-border bg-card/95 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Product</p>
              <p className="mt-4 text-2xl font-semibold text-foreground">Launch ready</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This placeholder page is built to scale into a full ContextFlow AI experience.
              </p>
            </div>
            <div className="rounded-[2rem] border border-border bg-background/80 p-6">
              <p className="text-sm font-medium text-muted-foreground">Mobile & desktop ready</p>
              <p className="mt-3 text-sm leading-6 text-foreground">
                The layout supports desktop sidebar navigation and a mobile menu trigger out of the box.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
