import { createWorkspace, listUserWorkspaces } from "@/lib/workspaces"
import { createWorkspaceProject, listUserProjects } from "@/lib/projects"
import { createTask } from "@/lib/tasks"
import { createContextNote } from "@/lib/context-notes"

async function runSeedStep<T>(label: string, operation: () => Promise<T>): Promise<T> {
  console.debug(`[DemoSeed] ${label} started`)
  try {
    const result = await operation()
    console.debug(`[DemoSeed] ${label} succeeded`)
    return result
  } catch (error) {
    console.error(`[DemoSeed] ${label} failed`, error)
    throw new Error(`[DemoSeed] ${label} failed: ${(error as Error).message}`)
  }
}

export async function seedDemoWorkspace(userId: string): Promise<string> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Demo seed is only available in development.")
  }

  const [workspaces, projects] = await runSeedStep("check seed preconditions", () =>
    Promise.all([listUserWorkspaces(userId), listUserProjects(userId)])
  )

  if (workspaces.length > 0 || projects.length > 0) {
    throw new Error("Demo seed is only available for a fresh development account without existing workspaces or projects.")
  }

  const workspaceId = await runSeedStep("create demo workspace", () =>
    createWorkspace(userId, {
      name: "ContextFlow Demo Workspace",
      description:
        "A sample workspace with example projects, tasks, and context notes for local development.",
    })
  )

  const projectSeeds = [
    {
      title: "AI Product Launch",
      description: "Define the roadmap, feature set, and launch strategy for ContextFlow AI.",
      status: "active" as const,
      tasks: [
        {
          title: "Draft product vision and goals",
          description: "Capture the main business problem, target users, and AI value proposition.",
          status: "in_progress" as const,
          priority: "high" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
        {
          title: "Gather stakeholder feedback",
          description: "Collect input from product, design, and engineering to align the launch plan.",
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        },
        {
          title: "Review competitor positioning",
          description: "Summarize market opportunities and differentiators for the demo product.",
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
        },
      ],
      notes: [
        {
          title: "Launch hypothesis",
          content:
            "ContextFlow AI helps product teams turn scattered requirements, design notes, and customer feedback into a coherent launch plan with AI-assisted insights.",
          category: "idea" as const,
        },
        {
          title: "Key success metrics",
          content: "Measure time-to-decision, project alignment, and task completion rate for the launch pilot.",
          category: "requirements" as const,
        },
      ],
    },
    {
      title: "Design System Revamp",
      description: "Refresh the visual system, component library, and mobile experience for the new release.",
      status: "active" as const,
      tasks: [
        {
          title: "Audit existing UI patterns",
          description: "Document current components, spacing, and typography inconsistencies.",
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        },
        {
          title: "Prototype mobile homepage",
          description: "Build a mobile-first layout to improve clarity and information hierarchy.",
          status: "todo" as const,
          priority: "high" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
        },
      ],
      notes: [
        {
          title: "Design goals",
          content:
            "Focus on clarity, accessible typography, and a lightweight component system that supports rapid iteration.",
          category: "requirements" as const,
        },
        {
          title: "Design review checklist",
          content: "Ensure the new UI supports responsive layout, color contrast, and intuitive controls across devices.",
          category: "meeting" as const,
        },
      ],
    },
    {
      title: "Marketing Automation Pilot",
      description: "Build workflows and collateral for a demo launch campaign targeting early adopters.",
      status: "active" as const,
      tasks: [
        {
          title: "Outline email nurture sequence",
          description: "Draft the first campaign for product intro, feature highlights, and pilot signups.",
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        },
        {
          title: "Define target personas",
          description: "Identify the primary user segments and top pain points for pilot messaging.",
          status: "todo" as const,
          priority: "medium" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11),
        },
      ],
      notes: [
        {
          title: "Go-to-market themes",
          content:
            "Position ContextFlow AI as a product intelligence workspace that turns fragmented context into actionable plans.",
          category: "idea" as const,
        },
        {
          title: "Campaign success criteria",
          content:
            "Track demo signups, user feedback quality, and progression from awareness to evaluation.",
          category: "requirements" as const,
        },
      ],
    },
  ]

  for (const project of projectSeeds) {
    const projectId = await runSeedStep(`create project "${project.title}"`, () =>
      createWorkspaceProject(workspaceId, userId, {
        title: project.title,
        description: project.description,
        status: project.status,
      })
    )

    for (const task of project.tasks) {
      await runSeedStep(`create task "${task.title}" for project "${project.title}"`, () =>
        createTask(projectId, userId, {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        })
      )
    }

    for (const note of project.notes) {
      await runSeedStep(`create note "${note.title}" for project "${project.title}"`, () =>
        createContextNote(projectId, userId, {
          title: note.title,
          content: note.content,
          category: note.category,
        })
      )
    }
  }

  return workspaceId
}
