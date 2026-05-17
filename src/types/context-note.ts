export type ContextNoteCategory = "requirements" | "meeting" | "idea" | "blocker" | "technical"

export type ContextNote = {
  id: string
  projectId: string
  userId: string
  title: string
  content: string
  category?: ContextNoteCategory
  createdAt: Date
  updatedAt: Date
}
