"use client"

import { LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/context/auth-context"

interface TopNavbarProps {
  onMobileMenuToggle: () => void
}

export function TopNavbar({ onMobileMenuToggle }: TopNavbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="text-sm font-medium text-muted-foreground">
          Workspace overview
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button
              variant="ghost"
              size="icon"
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
