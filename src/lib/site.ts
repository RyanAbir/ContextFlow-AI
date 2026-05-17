import {
  LayoutDashboard,
  Sparkles,
  Folder,
  CheckSquare,
  Settings2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const sidebarNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard#dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/dashboard/projects", icon: Folder },
  { title: "Tasks", href: "/dashboard#tasks", icon: CheckSquare },
  { title: "AI Insights", href: "/dashboard#insights", icon: Sparkles },
  { title: "Settings", href: "/dashboard#settings", icon: Settings2 },
]

export const siteConfig = {
  name: "ContextFlow AI",
  description: "A modern SaaS UI foundation for ContextFlow AI.",
}
