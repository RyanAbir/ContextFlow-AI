"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createContextNote, updateContextNote } from "@/lib/context-notes"
import type { ContextNote, ContextNoteCategory } from "@/types/context-note"

type ContextNoteFormProps = {
  projectId: string
  userId: string
  note?: ContextNote
  onClose: () => void
}

const categoryOptions: { value: ContextNoteCategory; label: string }[] = [
  { value: "requirements", label: "Requirements" },
  { value: "meeting", label: "Meeting" },
  { value: "idea", label: "Idea" },
  { value: "blocker", label: "Blocker" },
  { value: "technical", label: "Technical" },
]

export function ContextNoteForm({ projectId, userId, note, onClose }: ContextNoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [category, setCategory] = useState<ContextNoteCategory | "">(note?.category ?? "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const nextCategory = category || undefined

      if (note) {
        await updateContextNote(note.id, {
          title,
          content,
          category: nextCategory ?? null,
        })
      } else {
        await createContextNote(projectId, userId, {
          title,
          content,
          category: nextCategory,
        })
      }

      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="space-y-4 rounded-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{note ? "Edit context note" : "Create context note"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Capture reusable project context for later summaries.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Title</label>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            placeholder="Note title"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Content</label>
          <textarea
            required
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            rows={6}
            placeholder="Requirements, decisions, meeting notes, ideas, or technical context"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as ContextNoteCategory | "")}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
          >
            <option value="">No category</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : note ? "Save changes" : "Create note"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
