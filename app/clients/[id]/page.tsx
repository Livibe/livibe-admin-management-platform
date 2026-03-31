import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { clients, getUser, getClientContacts, getClientDeals, getClientActivities, getClientTasks, INDUSTRY_LABELS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/shared/status-badge"
import { StageBadge } from "@/components/shared/status-badge"
import { Building2, MapPin, Globe, Phone, Mail, Calendar, MessageSquare, FileText, PhoneCall, CheckSquare } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import Link from "next/link"

const activityIcons: Record<string, React.ReactNode> = {
  meeting: <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center"><Calendar className="w-3.5 h-3.5 text-blue-600" /></div>,
  email: <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center"><Mail className="w-3.5 h-3.5 text-green-600" /></div>,
  call: <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center"><PhoneCall className="w-3.5 h-3.5 text-yellow-600" /></div>,
  proposal: <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-purple-600" /></div>,
  whatsapp: <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center"><MessageSquare className="w-3.5 h-3.5 text-emerald-600" /></div>,
  note: <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-slate-600" /></div>,
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = clients.find(c => c.id === params.id)
  if (!client) notFound()

  const clientContacts = getClientContacts(client.id)
  const clientDeals = getClientDeals(client.id)
  const clientActivities = getClientActivities(client.id)
  const clientTasks = getClientTasks(client.id)
  const owner = getUser(client.ownerId)

  return (
    <div>
      <Topbar title="Client Detail" />
      <div className="p-6 space-y-5">

        {/* Header card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {client.companyName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{client.companyName}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge status={client.status} />
                    <span className="text-sm text-slate-400">{INDUSTRY_LABELS[client.industry]}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{client.city}, {client.country}</span>
                    {client.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{client.website}</span>}
                    {owner && <span className="flex items-center gap-1">Owner: <strong className="text-slate-700">{owner.name}</strong></span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {client.tags.map(tag => (
                  <span key={tag} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-5">
          {/* Left column: Contacts + Tasks */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Contacts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {clientContacts.map(contact => (
                  <div key={contact.id} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                        <p className="text-xs text-slate-400">{contact.position}</p>
                      </div>
                      {contact.isPrimary && <Badge variant="blue" className="ml-auto">Primary</Badge>}
                    </div>
                    <div className="mt-2 space-y-1 pl-9">
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Open Tasks</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {clientTasks.filter(t => t.status !== 'done').length === 0 && (
                  <p className="text-xs text-slate-400">No open tasks.</p>
                )}
                {clientTasks.filter(t => t.status !== 'done').map(task => (
                  <div key={task.id} className="flex items-start gap-2">
                    <CheckSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${task.status === 'overdue' ? 'text-red-500' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-medium text-slate-800">{task.title}</p>
                      <p className={`text-xs ${task.status === 'overdue' ? 'text-red-500' : 'text-slate-400'}`}>
                        Due {format(new Date(task.dueDate), 'MMM d')} · {task.priority} priority
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle: Deals */}
          <div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Active Deals</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {clientDeals.length === 0 && <p className="text-xs text-slate-400">No deals yet.</p>}
                {clientDeals.map(deal => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="p-3 rounded-lg border hover:border-violet-200 hover:bg-violet-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{deal.eventName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{deal.eventCity} · {format(new Date(deal.eventDate), 'MMM d, yyyy')}</p>
                        </div>
                        <StageBadge stage={deal.stage} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-slate-900">${deal.dealValue.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">{deal.probability}% probability</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Activity timeline */}
          <div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Activity Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientActivities.length === 0 && <p className="text-xs text-slate-400">No activities yet.</p>}
                  {clientActivities.map((activity) => {
                    const actOwner = getUser(activity.ownerId)
                    return (
                      <div key={activity.id} className="flex gap-3">
                        {activityIcons[activity.type] || activityIcons.note}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900">{activity.subject}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activity.body}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {format(new Date(activity.occurredAt), 'MMM d, yyyy')} · {actOwner?.name.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
