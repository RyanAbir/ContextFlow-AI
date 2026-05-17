import {
  CheckCircle2,
  CloudCog,
  Layers,
  MessageCircle,
  Monitor,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SectionTitle } from "@/components/ui/section-title"

const features = [
  {
    title: "AI summaries",
    description: "Turn long updates and meeting notes into concise action items and context-aware recommendations.",
    icon: Sparkles,
  },
  {
    title: "Project context",
    description: "Link tasks, files, and conversations into a living workspace context that stays aligned.",
    icon: Layers,
  },
  {
    title: "Task management",
    description: "Manage priorities, timelines, and ownership from a single AI-powered command center.",
    icon: CheckCircle2,
  },
  {
    title: "Workspace collaboration",
    description: "Bring teams together with shared updates, comments, and contextual workspaces.",
    icon: Users,
  },
  {
    title: "Responsive dashboard",
    description: "A modern interface designed for desktop and mobile workflows with clarity and speed.",
    icon: Monitor,
  },
]

const workflow = [
  {
    step: "01",
    title: "Organize work",
    description: "Structure projects with goals, tasks, and milestones so every team member stays in sync.",
    icon: CloudCog,
  },
  {
    step: "02",
    title: "Add context",
    description: "Capture notes, files, and decisions alongside work so insights are always tied to action.",
    icon: MessageCircle,
  },
  {
    step: "03",
    title: "Generate AI insights",
    description: "Get summarized updates, risk signals, and next-step suggestions powered by contextual AI.",
    icon: Zap,
  },
]

const benefits = [
  {
    title: "Faster decisions",
    description: "AI-generated overviews keep teams aligned without extra meetings.",
  },
  {
    title: "Clear context",
    description: "Work stays organized with everything connected and easy to find.",
  },
  {
    title: "Better clarity",
    description: "Focus on outcomes with a dashboard built for predictable work rhythms.",
  },
  {
    title: "Scale with ease",
    description: "Designed to grow from small teams to enterprise operations without friction.",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
          <div className="space-y-8">
            <div className="space-y-4 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                AI work management
              </p>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
                Turn team work into context-rich AI momentum.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                ContextFlow AI helps teams capture work context, summarize progress, and keep projects moving with intelligent recommendations.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg">Start free trial</Button>
              <Button variant="outline" size="lg">
                View demo
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-border bg-card/95 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Workstreams</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">24 active boards</p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-card/95 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">AI insights</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">5 new summaries today</p>
              </div>
            </div>
          </div>

          <Card className="relative overflow-hidden p-6 shadow-2xl shadow-black/20">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-background/80 p-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    Dashboard preview
                  </p>
                  <p className="text-xs text-muted-foreground">AI context in one view</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-background/90 p-5">
                  <p className="text-sm text-muted-foreground">Tasks due</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">8</p>
                </div>
                <div className="rounded-3xl bg-background/90 p-5">
                  <p className="text-sm text-muted-foreground">Project health</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">92%</p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/80 bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-foreground">Recent AI summary</p>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/80">New</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Review the latest project summary and see next actions for your team in one place.
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/90 p-5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Timeline</span>
                  <span>Today</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {['Research', 'Design', 'Launch'].map((item) => (
                    <div key={item} className="rounded-2xl bg-muted/20 p-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <section id="features" className="mt-20 space-y-10">
          <SectionTitle
            title="Features"
            description="Everything you need to keep work contextual, visible, and ready for AI-driven decisions."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section id="workflow" className="mt-20 space-y-10">
          <SectionTitle
            title="Workflow"
            description="A simple, three-step process for smarter team work and AI-driven context." 
          />
          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.step} className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="rounded-3xl bg-muted/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Step {item.step}
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section id="benefits" className="mt-20 space-y-10">
          <SectionTitle
            title="Benefits"
            description="A platform built for clarity, speed, and modern AI-powered teamwork."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map((item) => (
              <Card key={item.title} className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-border bg-card/95 p-10 text-center shadow-sm shadow-black/10">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Ready to move faster</p>
          <h2 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">
            Build better work with AI context at every step.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            Start with a powerful landing experience and grow into a full ContextFlow AI workspace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg">Start free trial</Button>
            <Button variant="outline" size="lg">
              Contact sales
            </Button>
          </div>
        </section>

        <footer className="mt-20 border-t border-border/70 pt-8 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>ContextFlow AI &copy; {new Date().getFullYear()}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a href="#features" className="transition hover:text-foreground">Features</a>
              <a href="#workflow" className="transition hover:text-foreground">Workflow</a>
              <a href="#benefits" className="transition hover:text-foreground">Benefits</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
