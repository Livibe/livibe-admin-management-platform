'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  useDroppable, PointerSensor, useSensor, useSensors,
  closestCenter, pointerWithin,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Topbar } from '@/components/layout/topbar'
import { Plus, X, Loader2, GripVertical, ChevronDown, MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react'

type DealStage =
  | 'lead_identified'
  | 'contacted'
  | 'meeting_scheduled'
  | 'proposal_in_negotiation'
  | 'close_won'
  | 'close_loss'

interface Deal {
  id: string
  eventName: string
  clientName: string
  dealValue: number
  currency: string
  stage: DealStage
  probability: number
  approachEndDate?: string
  note?: string
  createdBy?: string
  order?: number | null
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  companyName: string
}

const STAGES: DealStage[] = [
  'lead_identified',
  'contacted',
  'meeting_scheduled',
  'proposal_in_negotiation',
  'close_won',
  'close_loss',
]

const STAGE_LABELS: Record<DealStage, string> = {
  lead_identified:          'Lead Identified',
  contacted:                'Contacted',
  meeting_scheduled:        'Meeting Scheduled',
  proposal_in_negotiation:  'Negotiation',
  close_won:                'Close Won',
  close_loss:               'Close Loss',
}

const STAGE_COLORS: Record<DealStage, { dot: string; badge: string }> = {
  lead_identified:         { dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600' },
  contacted:               { dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700' },
  meeting_scheduled:       { dot: 'bg-violet-400', badge: 'bg-violet-100 text-violet-700' },
  proposal_in_negotiation: { dot: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700' },
  close_won:               { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  close_loss:              { dot: 'bg-red-400',    badge: 'bg-red-100 text-red-700' },
}

const ASSIGNEE_OPTIONS = [
  { value: 'muan',  label: 'Muan' },
  { value: 'japan', label: 'Japan' },
  { value: 'kla',   label: 'Kla' },
]

const AVATAR_COLORS: Record<string, string> = {
  muan:  'bg-blue-500',
  japan: 'bg-violet-500',
  kla:   'bg-amber-400',
}

// ── Avatar select dropdown ────────────────────────────────────────────────────
function AvatarSelect({
  value, onChange, options, placeholder = '— Unassigned',
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all cursor-pointer"
      >
        {selected ? (
          <>
            <span className={`w-5 h-5 rounded-full ${AVATAR_COLORS[selected.value] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {selected.label.charAt(0).toUpperCase()}
            </span>
            <span className="text-slate-800 flex-1 text-left">{selected.label}</span>
          </>
        ) : (
          <span className="text-slate-400 flex-1 text-left">{placeholder}</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          <button
            type="button"
            onMouseDown={() => { onChange(''); setOpen(false) }}
            className="w-full flex items-center px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {placeholder}
          </button>
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer"
            >
              <span className={`w-5 h-5 rounded-full ${AVATAR_COLORS[o.value] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                {o.label.charAt(0).toUpperCase()}
              </span>
              {o.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

function formatUSD(n: number) {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000)      return `฿${(n / 1000).toFixed(0)}K`
  return `฿${n}`
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const EMPTY_FORM = { eventName: '', clientName: '', dealValue: '', eventDate: '', createdBy: '', note: '' }

// ── Card action menu (portal to escape overflow) ───────────────────────────
function CardMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen(o => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        onPointerDown={e => e.stopPropagation()}
        onClick={handleOpen}
        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Pure card UI ──────────────────────────────────────────────────────────────
function DealCard({
  deal, ghost = false, onEdit, onDelete,
}: {
  deal: Deal
  ghost?: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  const days     = daysUntil(deal.approachEndDate)
  const isUrgent = days !== null && days <= 30 && days >= 0
  const isPast   = days !== null && days < 0

  return (
    <div className={`bg-white rounded-xl border p-3 transition-all select-none group ${
      ghost
        ? 'border-violet-300 shadow-xl rotate-1 opacity-95 cursor-grabbing'
        : 'border-slate-200 hover:shadow-md hover:border-slate-300 cursor-grab active:cursor-grabbing'
    }`}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs font-semibold text-slate-900 leading-tight flex-1">{deal.clientName}</p>
        {!ghost && onEdit && onDelete
          ? <CardMenu onEdit={onEdit} onDelete={onDelete} />
          : <GripVertical className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
        }
      </div>
      {deal.eventName && <p className="text-xs text-slate-400 mt-0.5">{deal.eventName}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold text-slate-900">{formatUSD(Number(deal.dealValue))}</span>
      </div>
      {days !== null && (
        <div className="mt-2">
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${
            isPast   ? 'bg-slate-100 text-slate-400'
            : isUrgent ? 'bg-red-50 text-red-600 font-medium'
            : 'bg-slate-50 text-slate-500'
          }`}>
            {isPast ? 'Passed' : `${days}d left`}
          </span>
        </div>
      )}
      {(deal.createdBy || deal.note) && (
        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
          {deal.createdBy && (
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${AVATAR_COLORS[deal.createdBy] ?? 'bg-slate-400'}`}>
                {deal.createdBy.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 capitalize">{deal.createdBy}</span>
            </div>
          )}
          {deal.note && <p className="text-xs text-slate-400 line-clamp-2 italic">{deal.note}</p>}
        </div>
      )}
    </div>
  )
}

function DraggableCard({
  deal, onEdit, onDelete,
}: {
  deal: Deal
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })
  const startPos = useRef({ x: 0, y: 0 })
  const wasDragged = useRef(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { onPointerDown: dndPointerDown, ...restListeners } = listeners ?? {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...restListeners}
      className={isDragging ? 'opacity-0' : ''}
      onPointerDown={e => {
        startPos.current = { x: e.clientX, y: e.clientY }
        wasDragged.current = false
        dndPointerDown?.(e)
      }}
      onPointerMove={e => {
        const dx = e.clientX - startPos.current.x
        const dy = e.clientY - startPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) > 8) wasDragged.current = true
      }}
      onClick={() => { if (!wasDragged.current) onEdit() }}
    >
      <DealCard deal={deal} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function DroppableColumn({ stage, children }: { stage: DealStage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div ref={setNodeRef} className={`space-y-2 flex-1 rounded-xl p-1 -m-1 transition-colors ${isOver ? 'bg-violet-50/60' : ''}`}>
      {children}
    </div>
  )
}

// ── Filter select (custom portal dropdown) ────────────────────────────────────
function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; avatar?: boolean }[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 180) })
    }
    setOpen(o => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm border rounded-lg transition-all cursor-pointer bg-white ${value ? 'border-violet-400 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
      >
        {selected?.avatar && (
          <span className={`w-4 h-4 rounded-full ${AVATAR_COLORS[selected.value] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
            {selected.label.charAt(0)}
          </span>
        )}
        <span className="text-xs font-medium">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1"
        >
          <button
            type="button"
            onMouseDown={() => { onChange(''); setOpen(false) }}
            className="w-full flex items-center px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {placeholder}
          </button>
          <div className="h-px bg-slate-100 mx-3 mb-1" />
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer ${value === o.value ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {o.avatar && (
                <span className={`w-5 h-5 rounded-full ${AVATAR_COLORS[o.value] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                  {o.label.charAt(0)}
                </span>
              )}
              {o.label}
              {value === o.value && <span className="ml-auto text-violet-500">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [deals, setDeals]   = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)


  const [modalStage, setModalStage] = useState<DealStage | null>(null)
  const [editDeal, setEditDeal]     = useState<Deal | null>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const dealsBeforeDrag = useRef<Deal[]>([])

  const [filterAssignee, setFilterAssignee] = useState('')

  const [form, setForm]           = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [showClientList, setShowClientList] = useState(false)
  const [clientListPos, setClientListPos] = useState({ top: 0, left: 0, width: 0 })
  const clientInputRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const fetchDeals = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API_URL}/deals`)
      if (!res.ok) throw new Error()
      setDeals(await res.json())
    } catch {
      setError('Could not connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/clients`)
      if (res.ok) setClients(await res.json())
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchDeals(); fetchClients() }, [fetchDeals, fetchClients])


  function handleDragStart(e: { active: { id: string | number } }) {
    setActiveId(e.active.id as string)
    dealsBeforeDrag.current = deals
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return

    const dealId = active.id as string
    const overId = over.id as string
    const overIsStage = (STAGES as string[]).includes(overId)
    const targetStage = overIsStage
      ? (overId as DealStage)
      : (deals.find(d => d.id === overId)?.stage)

    if (!targetStage) return

    setDeals(prev => {
      const activeDeal = prev.find(d => d.id === dealId)
      if (!activeDeal) return prev

      // Move card to new column if needed
      const updated = activeDeal.stage !== targetStage
        ? prev.map(d => d.id === dealId ? { ...d, stage: targetStage } : d)
        : prev

      // Reorder within target column
      if (!overIsStage) {
        const colDeals  = updated.filter(d => d.stage === targetStage)
        const rest      = updated.filter(d => d.stage !== targetStage)
        const activeIdx = colDeals.findIndex(d => d.id === dealId)
        const overIdx   = colDeals.findIndex(d => d.id === overId)
        if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
          return [...rest, ...arrayMove(colDeals, activeIdx, overIdx)]
        }
        return [...rest, ...colDeals]
      }
      return updated
    })
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e

    if (!over) {
      // Cancelled — restore original
      setDeals(dealsBeforeDrag.current)
      return
    }

    const dealId      = active.id as string
    const finalDeal   = deals.find(d => d.id === dealId)
    const beforeDeal  = dealsBeforeDrag.current.find(d => d.id === dealId)
    if (!finalDeal || !beforeDeal) return

    const stageChanged = finalDeal.stage !== beforeDeal.stage

    // Persist order for all cards in the affected column(s)
    const colDeals = deals.filter(d => d.stage === finalDeal.stage)
    colDeals.forEach((d, i) => {
      const body: Record<string, unknown> = { order: i }
      if (d.id === dealId && stageChanged) body.stage = finalDeal.stage
      fetch(`${API_URL}/deals/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    })
  }

  function handleDragCancel() {
    setActiveId(null)
    setDeals(dealsBeforeDrag.current)
  }

  function openCreate(stage: DealStage) {
    setEditDeal(null); setModalStage(stage); setForm(EMPTY_FORM); setFormError(null); setShowClientList(false)
  }

  function openEdit(deal: Deal) {
    setEditDeal(deal)
    setModalStage(deal.stage)
    setForm({
      eventName: deal.eventName,
      clientName: deal.clientName,
      dealValue: String(deal.dealValue),
      eventDate: deal.approachEndDate ?? '',
      createdBy: deal.createdBy ?? '',
      note: deal.note ?? '',
    })
    setFormError(null); setShowClientList(false)
  }

  function closeModal() { setModalStage(null); setEditDeal(null) }
  function setField(key: keyof typeof EMPTY_FORM, value: string) { setForm(f => ({ ...f, [key]: value })) }

  const filteredClients = form.clientName.trim()
    ? clients.filter(c => c.companyName.toLowerCase().includes(form.clientName.toLowerCase()))
    : clients

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!modalStage) return
    setSubmitting(true); setFormError(null)
    const body = {
      eventName:       form.eventName.trim(),
      clientName:      form.clientName.trim(),
      dealValue:       form.dealValue ? parseFloat(form.dealValue) : 0,
      approachEndDate: form.eventDate || undefined,
      stage:           editDeal ? undefined : modalStage,
      createdBy:       form.createdBy || undefined,
      note:            editDeal ? form.note.trim() : (form.note.trim() || undefined),
    }
    try {
      const url    = editDeal ? `${API_URL}/deals/${editDeal.id}` : `${API_URL}/deals`
      const method = editDeal ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.message || 'Failed')
      }
      const saved = await res.json()
      closeModal()
      await fetchDeals()

      if (!editDeal && saved?.id) {
        // Put new card at the top of its column and persist order
        setDeals(prev => {
          const stage    = saved.stage as DealStage
          const colDeals = prev.filter(d => d.stage === stage)
          const rest     = prev.filter(d => d.stage !== stage)
          const newFirst = [colDeals.find(d => d.id === saved.id)!, ...colDeals.filter(d => d.id !== saved.id)].filter(Boolean)
          newFirst.forEach((d, i) => fetch(`${API_URL}/deals/${d.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: i }),
          }))
          return [...rest, ...newFirst]
        })
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  async function confirmDelete() {
    if (!deleteId) return
    await fetch(`${API_URL}/deals/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); await fetchDeals()
  }

  function exportCSV() {
    const rows = deals.map(d => ({
      'Event Name':        d.eventName,
      'Company':           d.clientName,
      'Deal Value (THB)':  d.dealValue,
      'Stage':             STAGE_LABELS[d.stage as DealStage] ?? d.stage,
      'Event Date':        d.approachEndDate ?? '',
      'Assigned To':       d.createdBy ?? '',
      'Note':              d.note ?? '',
      'Created At':        new Date(d.createdAt).toLocaleDateString(),
    }))
    const headers = Object.keys(rows[0] ?? {})
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(',')),
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `pipeline-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all placeholder:text-slate-300"

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Pipeline" />
      <div className="flex flex-col p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              value={filterAssignee}
              onChange={setFilterAssignee}
              placeholder="All Assignees"
              options={ASSIGNEE_OPTIONS.map(o => ({ ...o, avatar: true }))}
            />
            {filterAssignee && (
              <button onClick={() => setFilterAssignee('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 cursor-pointer">
                Clear
              </button>
            )}
          </div>
          <button onClick={exportCSV} disabled={deals.length === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={args => pointerWithin(args).length > 0 ? pointerWithin(args) : closestCenter(args)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3 min-w-max pb-4">
                {STAGES.map(stage => {
                  const stageDeals = deals.filter(d =>
                    d.stage === stage &&
                    (!filterAssignee || d.createdBy === filterAssignee)
                  )
                  const stageValue = stageDeals.reduce((s, d) => s + Number(d.dealValue), 0)
                  const colors     = STAGE_COLORS[stage]
                  const isClosed   = stage === 'close_won' || stage === 'close_loss'

                  return (
                    <div key={stage} className="w-64 shrink-0 flex flex-col self-stretch">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          <div>
                            <h3 className="text-xs font-semibold text-slate-700">{STAGE_LABELS[stage]}</h3>
                            <p className="text-xs text-slate-400">{stageDeals.length} · {formatUSD(stageValue)}</p>
                          </div>
                        </div>
                        {!isClosed && (
                          <button onClick={() => openCreate(stage)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <DroppableColumn stage={stage}>
                        <SortableContext items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                        {stageDeals.map(deal => (
                          <DraggableCard
                            key={deal.id}
                            deal={deal}
                            onEdit={() => openEdit(deal)}
                            onDelete={() => setDeleteId(deal.id)}
                          />
                        ))}
                        </SortableContext>
                        {stageDeals.length === 0 && !isClosed && (
                          <button onClick={() => openCreate(stage)} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-violet-300 hover:bg-violet-50/30 transition-colors cursor-pointer">
                            <Plus className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                            <p className="text-xs text-slate-400">Add</p>
                          </button>
                        )}
                        {stageDeals.length === 0 && isClosed && (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                            <p className="text-xs text-slate-300">Drag deals here</p>
                          </div>
                        )}
                      </DroppableColumn>
                    </div>
                  )
                })}
              </div>
            </div>
            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <DealCard deal={deals.find(d => d.id === activeId)!} ghost />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Create / Edit Deal Modal */}
      {modalStage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{editDeal ? 'Edit Card' : 'New Card'}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${STAGE_COLORS[modalStage].badge}`}>
                  {STAGE_LABELS[modalStage]}
                </span>
              </div>
              <button onClick={closeModal} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Left column */}
                <div className="flex-1 space-y-4">
                  {/* Company autocomplete — first field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company <span className="text-red-500">*</span></label>
                    <div className="relative" ref={clientInputRef}>
                      <input
                        type="text"
                        required
                        value={form.clientName}
                        onChange={e => {
                          setField('clientName', e.target.value)
                          if (clientInputRef.current) {
                            const r = clientInputRef.current.getBoundingClientRect()
                            setClientListPos({ top: r.bottom + 4, left: r.left, width: r.width })
                          }
                          setShowClientList(true)
                        }}
                        onFocus={() => {
                          if (clientInputRef.current) {
                            const r = clientInputRef.current.getBoundingClientRect()
                            setClientListPos({ top: r.bottom + 4, left: r.left, width: r.width })
                          }
                          setShowClientList(true)
                        }}
                        onBlur={() => setTimeout(() => setShowClientList(false), 150)}
                        placeholder="Type to search or enter new..."
                        className={inputCls + ' pr-8'}
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {showClientList && filteredClients.length > 0 && createPortal(
                      <div style={{ position: 'fixed', top: clientListPos.top, left: clientListPos.left, width: clientListPos.width, zIndex: 9999 }}
                        className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredClients.map(c => (
                          <button key={c.id} type="button"
                            onMouseDown={() => { setField('clientName', c.companyName); setShowClientList(false) }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer">
                            {c.companyName}
                          </button>
                        ))}
                      </div>,
                      document.body
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Event Name <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                    <input type="text" value={form.eventName} onChange={e => setField('eventName', e.target.value)} placeholder="e.g. Summer Sonic 2026" className={inputCls} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Deal Value (THB)</label>
                      <input type="number" min="0" step="0.01" value={form.dealValue} onChange={e => setField('dealValue', e.target.value)} placeholder="0" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Event Date</label>
                      <input type="date" value={form.eventDate} onChange={e => setField('eventDate', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-slate-100 self-stretch" />

                {/* Right column */}
                <div className="md:w-52 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Assigned To</label>
                    <AvatarSelect value={form.createdBy} onChange={v => setField('createdBy', v)} options={ASSIGNEE_OPTIONS} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Note</label>
                    <textarea value={form.note} onChange={e => setField('note', e.target.value)} placeholder="Any notes..." rows={5} className={`${inputCls} resize-none`} />
                  </div>
                </div>
              </div>

              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mt-4">{formError}</p>}

              <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 text-sm font-medium text-white bg-violet-600 rounded-lg px-4 py-2.5 hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editDeal ? 'Save Changes' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Deal?</h3>
            <p className="text-xs text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 text-sm font-medium text-white bg-red-500 rounded-lg px-4 py-2 hover:bg-red-600 transition-colors cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
