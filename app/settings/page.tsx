'use client'

import { useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const AVATAR_COLORS: Record<string, string> = {
  'bg-violet-500': 'bg-violet-500',
  'bg-blue-500':   'bg-blue-500',
  'bg-amber-400':  'bg-amber-400',
}

interface TeamUser {
  email: string
  name: string
  color: string
}

export default function SettingsPage() {
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/auth/users`)
      .then(r => r.ok ? r.json() : [])
      .then(setTeamUsers)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {teamUsers.map(user => (
                  <div key={user.email} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[user.color] ?? 'bg-slate-500'}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
