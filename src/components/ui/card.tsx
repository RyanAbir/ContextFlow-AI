import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/95 p-4 shadow-sm shadow-black/10 transition-colors sm:p-6",
        className
      )}
      {...props}
    />
  )
}
