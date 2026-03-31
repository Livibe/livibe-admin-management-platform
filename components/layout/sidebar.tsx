"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Kanban, CheckSquare, BarChart2, Settings, Zap, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { getClientUser, logout, USERS } from "@/lib/auth"

const nav = [
  { label: "Dashboard", href: "/",         icon: LayoutDashboard },
  { label: "Clients",   href: "/clients",  icon: Users },
  { label: "Pipeline",  href: "/pipeline", icon: Kanban },
  { label: "Tasks",     href: "/tasks",    icon: CheckSquare },
  { label: "Reports",   href: "/reports",  icon: BarChart2 },
  { label: "Settings",  href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    setUsername(getClientUser())
  }, [])

  function handleLogout() {
    logout()
    router.push('/login')
    router.refresh()
  }

  const userInfo = username ? USERS[username] : null

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm">Livibe</span>
          <span className="block text-slate-400 text-xs">Admin Management</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
              userInfo?.color ?? "bg-slate-600"
            )}>
              {userInfo ? userInfo.label.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{userInfo?.label ?? '—'}</p>
              <p className="text-slate-400 text-xs">Sales</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
