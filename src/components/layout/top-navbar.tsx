"use client"

import { LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/context/auth-context"
import { WorkspaceSwitcher } from "@/components/workspaces/workspace-switcher"

interface TopNavbarProps {
  onMobileMenuToggle: () => void
}

export function TopNavbar({ onMobileMenuToggle }: TopNavbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6 xl:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 md:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground md:flex-none">
          Workspace overview
        </div>

        <div className="flex items-center gap-2">
          <WorkspaceSwitcher />
          <ThemeToggle />
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              onClick={logout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
