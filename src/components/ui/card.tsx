import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm shadow-black/10",
        className
      )}
      {...props}
    />
  )
}
