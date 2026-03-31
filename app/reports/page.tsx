'use client'

import { useState, useEffect, useCallback } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Deal {
  id: string
  eventName: string
  clientName: string
  dealValue: number
  stage: string
  createdBy?: string
  createdAt: string
}

interface Client {
  id: string
  companyName: string
  country?: string
  industry?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type ReportTab = 'country' | 'industry'

function BarList({ data, total }: { data: { name: string; value: number; count: number }[]; total: number }) {
  if (data.length === 0) return <p className="text-xs text-slate-400 py-4 text-center">No data yet</p>
  return (
    <div className="space-y-3">
      {data.map(({ name, value, count }) => {
        const pct = total > 0 ? (value / total) * 100 : 0
        return (
          <div key={name} className="flex items-center gap-3">
            <div className="w-36 shrink-0">
              <p className="text-xs font-medium text-slate-800 truncate">{name}</p>
              <p className="text-xs text-slate-400">{count} deal{count !== 1 ? 's' : ''} · ${value.toLocaleString()}</p>
            </div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
          </div>
        )
      })}
    </div>
  )
}

function AssigneeBarList({ data, total }: { data: { name: string; value: number; count: number }[]; total: number }) {
  const COLORS: Record<string, string> = {
    Muan:  'bg-blue-400',
    Japan: 'bg-violet-500',
    Kla:   'bg-amber-400',
  }
  if (data.length === 0) return <p className="text-xs text-slate-400 py-4 text-center">No data yet</p>
  return (
    <div className="space-y-3">
      {data.map(({ name, value, count }) => {
        const pct = total > 0 ? (value / total) * 100 : 0
        const bar = COLORS[name] ?? 'bg-slate-400'
        return (
          <div key={name} className="flex items-center gap-3">
            <div className="w-36 shrink-0">
              <p className="text-xs font-medium text-slate-800">{name}</p>
              <p className="text-xs text-slate-400">{count} deal{count !== 1 ? 's' : ''} · ${value.toLocaleString()}</p>
            </div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ReportsPage() {
  const [deals, setDeals]     = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<ReportTab>('country')

  const fetchData = useCallback(async () => {
    try {
      const [dealsRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/deals`),
        fetch(`${API_URL}/clients`),
      ])
      if (dealsRes.ok)   setDeals(await dealsRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const activeDeals = deals.filter(d => d.stage !== 'close_loss')
  const wonDeals    = deals.filter(d => d.stage === 'close_won')
  const lostDeals   = deals.filter(d => d.stage === 'close_loss')
  const totalValue  = activeDeals.reduce((s, d) => s + Number(d.dealValue), 0)

  // By Country
  const byCountry = Object.entries(
    clients.reduce((acc, c) => {
      const clientDeals = activeDeals.filter(d => d.clientName === c.companyName)
      const value = clientDeals.reduce((s, d) => s + Number(d.dealValue), 0)
      if (value > 0) {
        const key = c.country || 'Unknown'
        acc[key] = { value: (acc[key]?.value || 0) + value, count: (acc[key]?.count || 0) + clientDeals.length }
      }
      return acc
    }, {} as Record<string, { value: number; count: number }>)
  ).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.value - a.value)

  // By Industry
  const byIndustry = Object.entries(
    clients.reduce((acc, c) => {
      const clientDeals = activeDeals.filter(d => d.clientName === c.companyName)
      const value = clientDeals.reduce((s, d) => s + Number(d.dealValue), 0)
      if (value > 0) {
        const key = c.industry || 'Other'
        acc[key] = { value: (acc[key]?.value || 0) + value, count: (acc[key]?.count || 0) + clientDeals.length }
      }
      return acc
    }, {} as Record<string, { value: number; count: number }>)
  ).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.value - a.value)

  // By Assigned To
  const byAssignee = Object.entries(
    deals.reduce((acc, d) => {
      const key = d.createdBy ? d.createdBy.charAt(0).toUpperCase() + d.createdBy.slice(1) : 'Unassigned'
      acc[key] = { value: (acc[key]?.value || 0) + Number(d.dealValue), count: (acc[key]?.count || 0) + 1 }
      return acc
    }, {} as Record<string, { value: number; count: number }>)
  ).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.value - a.value)

  const assigneeTotal = deals.reduce((s, d) => s + Number(d.dealValue), 0)

  return (
    <div>
      <Topbar title="Reports" />
      <div className="p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Pipeline', value: `$${totalValue.toLocaleString()}`,                                                      sub: `${activeDeals.length} deals` },
                { label: 'Close Won',      value: `$${wonDeals.reduce((s, d) => s + Number(d.dealValue), 0).toLocaleString()}`,           sub: `${wonDeals.length} deals`,  green: true },
                { label: 'Close Lost',     value: `$${lostDeals.reduce((s, d) => s + Number(d.dealValue), 0).toLocaleString()}`,          sub: `${lostDeals.length} deals`, red: true },
                { label: 'Total Clients',  value: clients.length.toString(),                                                               sub: 'in database' },
              ].map(({ label, value, sub, green, red }) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`text-xl font-bold mt-1 ${green ? 'text-green-600' : red ? 'text-red-500' : 'text-slate-900'}`}>{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Country / Industry tab */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Revenue Breakdown</CardTitle>
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                    {(['country', 'industry'] as ReportTab[]).map(t => (
                      <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t === 'industry' ? 'Industry' : 'Country'}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <BarList data={tab === 'country' ? byCountry : byIndustry} total={totalValue} />
              </CardContent>
            </Card>

            {/* By Assigned To */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pipeline by Assigned To</CardTitle></CardHeader>
              <CardContent>
                <AssigneeBarList data={byAssignee} total={assigneeTotal} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
