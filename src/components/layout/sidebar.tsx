"use client"

import Link from "next/link"
import { LogOut, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sidebarNav } from "@/lib/site"
import { useAuth } from "@/context/auth-context"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col overflow-y-auto border-r border-border bg-background/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-300 sm:p-6 md:w-72 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              ContextFlow AI
            </p>
            <p className="text-sm text-muted-foreground">Modern SaaS dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {sidebarNav.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4 transition group-hover:text-primary" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card/90 p-4 sm:mt-auto sm:p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Launch ready</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use this foundation to build the ContextFlow AI experience.
            </p>
          </div>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={logout}
              aria-label="Logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          ) : null}
        </div>
      </aside>
    </>
  )
}
