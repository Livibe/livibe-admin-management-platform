"use client"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <h1 className="font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9 h-8 text-xs" placeholder="Search clients, deals..." />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </header>
  )
}
