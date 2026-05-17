import {
  LayoutDashboard,
  Sparkles,
  Users,
  Wallet,
  Settings2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const sidebarNav: NavItem[] = [
  { title: "Overview", href: "#overview", icon: LayoutDashboard },
  { title: "Performance", href: "#performance", icon: Sparkles },
  { title: "Customers", href: "#customers", icon: Users },
  { title: "Revenue", href: "#revenue", icon: Wallet },
  { title: "Settings", href: "#settings", icon: Settings2 },
]

export const siteConfig = {
  name: "ContextFlow AI",
  description: "A modern SaaS UI foundation for ContextFlow AI.",
}
