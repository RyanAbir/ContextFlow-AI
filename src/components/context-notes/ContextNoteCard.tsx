"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { deleteContextNote } from "@/lib/context-notes"
import type { ContextNote, ContextNoteCategory } from "@/types/context-note"

type ContextNoteCardProps = {
  note: ContextNote
  onEdit: (note: ContextNote) => void
}

const categoryLabels: Record<ContextNoteCategory, string> = {
  requirements: "Requirements",
  meeting: "Meeting",
  idea: "Idea",
  blocker: "Blocker",
  technical: "Technical",
}

const categoryClasses: Record<ContextNoteCategory, string> = {
  requirements: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  meeting: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  idea: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  blocker: "border-red-500/20 bg-red-500/10 text-red-400",
  technical: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
}

function getPreview(content: string) {
  const compact = content.replace(/\s+/g, " ").trim()
  if (compact.length <= 180) return compact
  return `${compact.slice(0, 177)}...`
}

export function ContextNoteCard({ note, onEdit }: ContextNoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const preview = getPreview(note.content)

  const handleDelete = async () => {
    if (!confirm(`Delete note "${note.title}"?`)) return
    setIsDeleting(true)

    try {
      await deleteContextNote(note.id)
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="rounded-2xl p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {note.category ? (
              <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", categoryClasses[note.category])}>
                {categoryLabels[note.category]}
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">Updated {note.updatedAt.toLocaleString()}</span>
          </div>

          <h3 className="mt-3 text-base font-semibold text-foreground">{note.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{preview || "No content provided."}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(note)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
