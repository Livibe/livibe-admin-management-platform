'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Menu } from 'lucide-react'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3.5 left-4 z-20 md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white"
      >
        <Menu className="w-4 h-4" />
      </button>

      <main className="md:ml-60 min-h-screen h-screen">{children}</main>
    </>
  )
}
