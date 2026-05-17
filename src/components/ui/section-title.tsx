import { cn } from "@/lib/utils"

interface SectionTitleProps {
  title: string
  description: string
  className?: string
}

export function SectionTitle({ title, description, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </p>
      <p className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {description}
      </p>
    </div>
  )
}
