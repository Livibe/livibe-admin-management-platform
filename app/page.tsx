'use client'

import { useState, useEffect, useCallback } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, AlertTriangle, Clock, Calendar, ArrowRight, Loader2, CheckSquare } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import Link from 'next/link'

interface Deal {
  id: string
  eventName: string
  clientName: string
  dealValue: number
  stage: string
  approachEndDate?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  companyName: string
  status?: string
  whoApproach?: string
  country?: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate?: string
  assignedTo?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const STAGES = [
  { key: 'lead_identified',       label: 'Lead Identified',        color: 'bg-slate-400' },
  { key: 'contacted',             label: 'Contacted',              color: 'bg-blue-400' },
  { key: 'meeting_scheduled',     label: 'Meeting Scheduled',      color: 'bg-indigo-500' },
  { key: 'proposal_in_negotiation', label: 'Negotiation', color: 'bg-violet-500' },
  { key: 'close_won',             label: 'Close Won',              color: 'bg-green-500' },
  { key: 'close_loss',            label: 'Close Loss',             color: 'bg-red-400' },
]

const WHO_COLORS: Record<string, string> = {
  muan:  'bg-blue-50 text-blue-700',
  japan: 'bg-violet-50 text-violet-700',
  kla:   'bg-amber-50 text-amber-700',
}

function formatUSD(n: number) {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `฿${(n / 1_000).toFixed(0)}K`
  return `฿${n.toLocaleString()}`
}

export default function DashboardPage() {
  const [deals, setDeals]     = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [dr, cr, tr] = await Promise.all([
        fetch(`${API_URL}/deals`),
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/tasks`),
      ])
      if (dr.ok) setDeals(await dr.json())
      if (cr.ok) setClients(await cr.json())
      if (tr.ok) setTasks(await tr.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Computed metrics ────────────────────────────────────────────────────────
  const activeDeals   = deals.filter(d => d.stage !== 'close_loss')
  const wonDeals      = deals.filter(d => d.stage === 'close_won')
  const totalPipeline = activeDeals.reduce((s, d) => s + Number(d.dealValue), 0)
  const wonRevenue    = wonDeals.reduce((s, d) => s + Number(d.dealValue), 0)

  const overdueTasks  = tasks.filter(t => t.status === 'overdue')
  const pendingTasks  = tasks.filter(t => t.status === 'pending')

  const stuckDeals = activeDeals.filter(d => {
    const updated = new Date(d.updatedAt)
    return differenceInDays(new Date(), updated) > 14 && d.stage !== 'close_won'
  })

  // Pipeline funnel — each stage is cumulative (deals at this stage OR further along)
  const STAGE_ORDER = ['lead_identified', 'contacted', 'meeting_scheduled', 'proposal_in_negotiation', 'close_won', 'close_loss']
  const stageBreakdown = STAGES.map(s => {
    const stageIdx = STAGE_ORDER.indexOf(s.key)
    const inOrPast = deals.filter(d => STAGE_ORDER.indexOf(d.stage) >= stageIdx)
    return {
      ...s,
      count: inOrPast.length,
      value: inOrPast.reduce((sum, d) => sum + Number(d.dealValue), 0),
    }
  })
  const maxFunnelCount = Math.max(stageBreakdown[0]?.count ?? 0, 1)

  // Conversion rate of each stage vs Lead Identified (total)
  const total = deals.length
  const conversionSteps = STAGES.filter(s => s.key !== 'lead_identified').map(s => {
    const count = deals.filter(d => d.stage === s.key).length
    const rate  = total > 0 ? Math.round((count / total) * 100) : 0
    return { key: s.key, label: s.label, color: s.color, count, rate }
  })

  // Team performance by createdBy
  const creators = ['muan', 'japan', 'kla']
  const teamStats = creators.map(person => {
    const personDeals   = deals.filter(d => d.createdBy === person)
    const personActive  = personDeals.filter(d => d.stage !== 'close_loss')
    const personWon     = personDeals.filter(d => d.stage === 'close_won')
    const value         = personActive.reduce((s, d) => s + Number(d.dealValue), 0)
    const convRate      = personDeals.length > 0 ? Math.round((personWon.length / personDeals.length) * 100) : 0
    const contactCount  = clients.filter(c => c.whoApproach?.toLowerCase() === person).length
    return { person, dealCount: personActive.length, value, convRate, contactCount }
  }).filter(s => s.dealCount > 0 || s.value > 0 || s.contactCount > 0)

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* ── Alert strip ─────────────────────────────────────────────── */}
            {(overdueTasks.length > 0 || stuckDeals.length > 0) && (
              <div className="flex gap-3 flex-wrap">
                {overdueTasks.length > 0 && (
                  <Link href="/tasks" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-100 transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                    <span><strong>{overdueTasks.length}</strong> overdue tasks need attention</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {stuckDeals.length > 0 && (
                  <Link href="/pipeline" className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-100 transition-colors">
                    <Clock className="w-4 h-4" />
                    <span><strong>{stuckDeals.length}</strong> deals stuck for 14+ days</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}

            {/* ── KPI row ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Pipeline', value: formatUSD(totalPipeline), sub: `${activeDeals.length} active deals`,  icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Close Won',      value: formatUSD(wonRevenue),    sub: `${wonDeals.length} deals won`,         icon: TrendingUp, color: 'text-green-600',  bg: 'bg-green-50' },
                { label: 'Total Clients',  value: clients.length.toString(), sub: 'in database',                        icon: Users,      color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                <Card key={label}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                        <p className="text-xs text-slate-400 mt-1">{sub}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Pipeline Funnel + Upcoming ───────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Pipeline Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  {deals.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No deals yet</p>
                  ) : (
                    <div className="space-y-1.5 py-1">
                      {stageBreakdown.map(s => {
                        const pct = Math.max((s.count / maxFunnelCount) * 100, s.count > 0 ? 8 : 0)
                        const isLoss = s.key === 'close_loss'
                        return (
                          <div key={s.key}>
                            <div className="flex items-center justify-between mb-1 px-1">
                              <span className="text-xs font-medium text-slate-600">{s.label}</span>
                              <span className="text-xs text-slate-400">
                                {s.count} deal{s.count !== 1 ? 's' : ''}{s.value > 0 ? ` · ${formatUSD(s.value)}` : ''}
                              </span>
                            </div>
                            <div className="flex justify-center">
                              <div
                                className={`h-7 ${s.color} ${isLoss ? 'opacity-50' : ''} rounded-lg flex items-center justify-center transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              >
                                {s.count > 0 && (
                                  <span className="text-xs font-bold text-white drop-shadow-sm">{s.count}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Conversion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deals.length === 0 ? (
                    <p className="text-xs text-slate-400">No pipeline data yet.</p>
                  ) : conversionSteps.map(step => (
                    <div key={step.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">{step.label}</span>
                        <span className={`text-xs font-semibold ${step.rate >= 50 ? 'text-green-600' : step.rate >= 25 ? 'text-amber-600' : 'text-red-500'}`}>
                          {step.rate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${step.rate >= 50 ? 'bg-green-500' : step.rate >= 25 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${step.rate}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{step.count} of {total} deals</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* ── Team Performance + Tasks ─────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {teamStats.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No deal creators assigned yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b">
                          <th className="text-left pb-2 font-medium">Person</th>
                          <th className="text-right pb-2 font-medium">Accounts</th>
                          <th className="text-right pb-2 font-medium">Active Deals</th>
                          <th className="text-right pb-2 font-medium">Pipeline Value</th>
                          <th className="text-right pb-2 font-medium">Win Rate</th>
                          <th className="pb-2 text-right font-medium">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {teamStats.map(({ person, dealCount, value, convRate, contactCount }) => {
                          const pct = totalPipeline > 0 ? (value / totalPipeline) * 100 : 0
                          return (
                            <tr key={person} className="hover:bg-slate-50">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${WHO_COLORS[person] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {person.charAt(0).toUpperCase()}
                                  </div>
                                  <p className="font-medium text-slate-900 text-xs capitalize">{person}</p>
                                </div>
                              </td>
                              <td className="py-3 text-right text-slate-700 text-xs">{contactCount}</td>
                              <td className="py-3 text-right text-slate-700 text-xs">{dealCount}</td>
                              <td className="py-3 text-right font-medium text-slate-900 text-xs">{formatUSD(value)}</td>
                              <td className="py-3 text-right">
                                <span className={`text-xs font-medium ${convRate >= 30 ? 'text-green-600' : convRate >= 15 ? 'text-yellow-600' : 'text-slate-400'}`}>
                                  {convRate}%
                                </span>
                              </td>
                              <td className="py-3 pl-6">
                                <div className="w-24 ml-auto">
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <p className="text-xs text-slate-400 text-right mt-0.5">{Math.round(pct)}%</p>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-slate-400" />
                    Tasks Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Overdue',  count: overdueTasks.length,  color: 'text-red-600 bg-red-50',      dot: 'bg-red-500' },
                    { label: 'Pending',  count: pendingTasks.length,   color: 'text-slate-700 bg-slate-50',  dot: 'bg-slate-400' },
                    { label: 'Done',     count: tasks.filter(t => t.status === 'done').length, color: 'text-green-700 bg-green-50', dot: 'bg-green-500' },
                  ].map(({ label, count, color, dot }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className="text-xs text-slate-600">{label}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{count}</span>
                    </div>
                  ))}

                  {overdueTasks.length > 0 && (
                    <>
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-red-600 mb-2">Overdue</p>
                        <div className="space-y-1.5">
                          {overdueTasks.slice(0, 4).map(task => (
                            <div key={task.id} className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                              <p className="text-xs text-slate-700 truncate">{task.title}</p>
                            </div>
                          ))}
                          {overdueTasks.length > 4 && (
                            <Link href="/tasks" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                              +{overdueTasks.length - 4} more →
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <Link href="/tasks" className="block text-center text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 rounded-lg py-1.5 hover:bg-violet-50 transition-colors mt-2">
                    View All Tasks
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
