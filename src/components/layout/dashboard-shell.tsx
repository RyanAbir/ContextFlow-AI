"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopNavbar } from "@/components/layout/top-navbar"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-72">
        <TopNavbar onMobileMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main className="min-h-[calc(100vh-4rem)] px-4 pb-10 pt-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
