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
  { title: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "#projects", icon: Folder },
  { title: "Tasks", href: "#tasks", icon: CheckSquare },
  { title: "AI Insights", href: "#insights", icon: Sparkles },
  { title: "Settings", href: "#settings", icon: Settings2 },
]

export const siteConfig = {
  name: "ContextFlow AI",
  description: "A modern SaaS UI foundation for ContextFlow AI.",
}
