"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopNavbar } from "@/components/layout/top-navbar"
import { WorkspaceProvider } from "@/context/workspace-context"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <WorkspaceProvider>
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:pl-72">
          <TopNavbar onMobileMenuToggle={() => setSidebarOpen((open) => !open)} />
          <main className="min-h-[calc(100vh-4rem)] px-3 pb-8 pt-4 sm:px-4 sm:pb-10 sm:pt-6 md:px-6 xl:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
