import { NextResponse } from "next/server"
import type { ProjectAiSummary } from "@/types/ai-summary"

type SummaryProjectInput = {
  id: string
  title: string
  description?: string
  status?: string
}

type SummaryTaskInput = {
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
}

type SummaryContextNoteInput = {
  title: string
  content: string
  category?: string
  updatedAt?: string
}

type ProjectSummaryRequest = {
  project: SummaryProjectInput
  tasks: SummaryTaskInput[]
  contextNotes: SummaryContextNoteInput[]
}

type GeminiPart = {
  text?: string
}

type GeminiGenerateContentResponse = {
  candidates?: {
    content?: {
      parts?: GeminiPart[]
    }
  }[]
  error?: {
    message?: string
  }
}

const geminiModel = "gemini-2.5-flash"
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function isProject(value: unknown): value is SummaryProjectInput {
  return isRecord(value) && isString(value.id) && isString(value.title)
}

function isTask(value: unknown): value is SummaryTaskInput {
  return isRecord(value) && isString(value.title) && isString(value.status) && isString(value.priority)
}

function isContextNote(value: unknown): value is SummaryContextNoteInput {
  return isRecord(value) && isString(value.title) && isString(value.content)
}

function parseRequestBody(value: unknown): ProjectSummaryRequest | null {
  if (!isRecord(value) || !isProject(value.project) || !Array.isArray(value.tasks) || !Array.isArray(value.contextNotes)) {
    return null
  }

  if (!value.tasks.every(isTask) || !value.contextNotes.every(isContextNote)) {
    return null
  }

  return {
    project: {
      id: value.project.id,
      title: value.project.title,
      description: optionalString(value.project.description),
      status: optionalString(value.project.status),
    },
    tasks: value.tasks.map((task) => ({
      title: task.title,
      description: optionalString(task.description),
      status: task.status,
      priority: task.priority,
      dueDate: optionalString(task.dueDate),
    })),
    contextNotes: value.contextNotes.map((note) => ({
      title: note.title,
      content: note.content,
      category: optionalString(note.category),
      updatedAt: optionalString(note.updatedAt),
    })),
  }
}

function buildPrompt(input: ProjectSummaryRequest) {
  return [
    "You are a project operations assistant. Summarize the provided project data for a SaaS dashboard.",
    "Return only valid JSON with this exact shape:",
    '{"projectSummary":"string","currentProgress":"string","blockersRisks":"string","recommendedNextSteps":["string"],"prioritySuggestions":["string"]}',
    "Do not invent facts. If data is missing, say what is unknown. Keep each section concise and actionable.",
    "",
    `Project: ${JSON.stringify(input.project)}`,
    `Tasks: ${JSON.stringify(input.tasks)}`,
    `Context notes: ${JSON.stringify(input.contextNotes)}`,
  ].join("\n")
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function parseSummary(text: string): ProjectAiSummary | null {
  const parsed: unknown = JSON.parse(text)

  if (!isRecord(parsed)) return null
  if (!isString(parsed.projectSummary)) return null
  if (!isString(parsed.currentProgress)) return null
  if (!isString(parsed.blockersRisks)) return null
  if (!isStringArray(parsed.recommendedNextSteps)) return null
  if (!isStringArray(parsed.prioritySuggestions)) return null

  return {
    projectSummary: parsed.projectSummary,
    currentProgress: parsed.currentProgress,
    blockersRisks: parsed.blockersRisks,
    recommendedNextSteps: parsed.recommendedNextSteps,
    prioritySuggestions: parsed.prioritySuggestions,
  }
}

function extractGeminiText(data: GeminiGenerateContentResponse) {
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? ""
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 })
  }

  const body: unknown = await request.json().catch(() => null)
  const input = parseRequestBody(body)

  if (!input) {
    return NextResponse.json({ error: "Invalid project summary request." }, { status: 400 })
  }

  try {
    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    })

    const data = (await response.json().catch(() => ({}))) as GeminiGenerateContentResponse

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? "Gemini could not generate a project summary." },
        { status: response.status }
      )
    }

    const text = extractGeminiText(data)

    if (!text) {
      return NextResponse.json({ error: "Gemini returned an empty summary." }, { status: 502 })
    }

    const summary = parseSummary(text)

    if (!summary) {
      return NextResponse.json({ error: "Gemini returned an unexpected summary format." }, { status: 502 })
    }

    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: "Unable to generate a project summary right now." }, { status: 502 })
  }
}
