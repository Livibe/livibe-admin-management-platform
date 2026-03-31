'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Plus, X, Loader2, CheckSquare, Square, AlertTriangle, Pencil, Trash2, RefreshCw, Calendar, Clock, Inbox, ChevronDown } from 'lucide-react'
import { format, isToday, isBefore, differenceInDays, parseISO, startOfDay } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: string
  status: string
  assignedTo?: string
  repeat: string
  createdAt: string
  updatedAt: string
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50',      dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50',  dot: 'bg-amber-400' },
  low:    { label: 'Low',    color: 'text-slate-500 bg-slate-100', dot: 'bg-slate-300' },
}

const AVATAR_COLORS: Record<string, string> = {
  muan:  'bg-blue-500',
  japan: 'bg-violet-500',
  kla:   'bg-amber-400',
}

const REPEAT_LABELS: Record<string, string> = {
  none: 'None', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
}

const ASSIGNEE_OPTIONS = [
  { value: 'muan',  label: 'Muan' },
  { value: 'japan', label: 'Japan' },
  { value: 'kla',   label: 'Kla' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const EMPTY_FORM = {
  title: '', description: '', dueDate: '', priority: 'medium', assignedTo: 'muan', repeat: 'none',
}

// ── Filter select ─────────────────────────────────────────────────────────────
function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
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
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 160) })
    }
    setOpen(o => !o)
  }

  return (
    <>
      <button ref={btnRef} type="button" onClick={handleOpen}
        className={`flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm border rounded-lg transition-all cursor-pointer bg-white ${value ? 'border-violet-400 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
        {selected && (
          <span className={`w-4 h-4 rounded-full ${AVATAR_COLORS[selected.value] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
            {selected.label.charAt(0)}
          </span>
        )}
        <span className="text-xs font-medium">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1">
          <button type="button" onMouseDown={() => { onChange(''); setOpen(false) }}
            className="w-full flex items-center px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
            {placeholder}
          </button>
          <div className="h-px bg-slate-100 mx-3 mb-1" />
          {options.map(o => (
            <button key={o.value} type="button" onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer ${value === o.value ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
              <span className={`w-5 h-5 rounded-full ${AVATAR_COLORS[o.value] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                {o.label.charAt(0)}
              </span>
              {o.label}
              {value === o.value && <span className="ml-auto text-violet-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({
  task, onToggle, onEdit, onDelete, fullDate = false, canToggle = false,
}: {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  fullDate?: boolean
  canToggle?: boolean
}) {
  const isDone    = task.status === 'done'
  const isOverdue = task.status === 'overdue' || (
    task.dueDate && !isDone && isBefore(parseISO(task.dueDate), startOfDay(new Date()))
  )
  const pCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium

  return (
    <div className={`flex items-start gap-3 px-4 py-3 group hover:bg-slate-50 transition-colors ${isDone ? 'opacity-60' : ''}`}>
      {/* Checkbox — only shown for today's tasks and done tasks */}
      {canToggle ? (
        <button onClick={onToggle} className="mt-0.5 shrink-0 cursor-pointer">
          {isDone
            ? <CheckSquare className="w-4 h-4 text-violet-500" />
            : <Square className="w-4 h-4 text-slate-300 hover:text-slate-400 transition-colors" />
          }
        </button>
      ) : (
        <div className="mt-0.5 w-4 shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <span className={`w-4 h-4 rounded-full ${AVATAR_COLORS[task.assignedTo] ?? 'bg-slate-400'} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                {task.assignedTo.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 capitalize">{task.assignedTo}</span>
            </div>
          )}
          {task.repeat !== 'none' && (
            <span className="flex items-center gap-0.5 text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md font-medium">
              <RefreshCw className="w-2.5 h-2.5" />{task.repeat}
            </span>
          )}
        </div>
      </div>

      {/* Right meta */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
        {task.dueDate && (
          <span className={`text-xs font-medium ${isOverdue && !isDone ? 'text-red-500' : 'text-slate-400'}`}>
            {format(parseISO(task.dueDate), fullDate ? 'EEE, MMM d' : 'MMM d')}
          </span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition-colors cursor-pointer">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  icon, title, count, accent, children, collapsible = false, alwaysShow = false,
}: {
  icon: React.ReactNode
  title: string
  count: number
  accent: string
  children: React.ReactNode
  collapsible?: boolean
  alwaysShow?: boolean
}) {
  const [open, setOpen] = useState(true)
  if (count === 0 && !alwaysShow) return null
  return (
    <div>
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        className={`flex items-center gap-2 mb-2 w-full text-left ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${accent}`}>
          {icon}{title}
        </span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${accent} opacity-70`}>{count}</span>
        {collapsible && (
          <ChevronDown className={`w-3.5 h-3.5 ml-auto text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        )}
      </button>
      {open && (
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50 shadow-sm">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterAssignee, setFilterAssignee] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API_URL}/tasks`)
      if (!res.ok) throw new Error()
      setTasks(await res.json())
    } catch {
      setError('Could not connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function openCreate() { setEditTask(null); setForm(EMPTY_FORM); setFormError(null); setShowModal(true) }
  function openEdit(task: Task) {
    setEditTask(task)
    setForm({
      title: task.title, description: task.description ?? '',
      dueDate: task.dueDate ?? '', priority: task.priority,
      assignedTo: task.assignedTo ?? 'muan', repeat: task.repeat,
    })
    setFormError(null); setShowModal(true)
  }
  function closeModal() { setShowModal(false); setEditTask(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setFormError(null)
    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      assignedTo: form.assignedTo || undefined,
      repeat: form.repeat,
    }
    try {
      const url = editTask ? `${API_URL}/tasks/${editTask.id}` : `${API_URL}/tasks`
      const res = await fetch(url, {
        method: editTask ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.message || 'Failed') }
      closeModal(); await fetchTasks()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  async function toggleDone(task: Task) {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await fetchTasks()
  }

  async function confirmDelete() {
    if (!deleteId) return
    await fetch(`${API_URL}/tasks/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); await fetchTasks()
  }

  // ── Partition tasks ──────────────────────────────────────────────────────
  const todayStart = startOfDay(new Date())
  const filtered  = filterAssignee ? tasks.filter(t => t.assignedTo === filterAssignee) : tasks

  const overdue   = filtered.filter(t => t.status !== 'done' && t.dueDate && isBefore(parseISO(t.dueDate), todayStart))
  const todayList = filtered.filter(t => t.status !== 'done' && t.dueDate && isToday(parseISO(t.dueDate)))
  const thisWeek  = filtered.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false
    const diff = differenceInDays(parseISO(t.dueDate), todayStart)
    return diff > 0 && diff <= 7
  })
  const upcoming  = filtered.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false
    return differenceInDays(parseISO(t.dueDate), todayStart) > 7
  })
  const noDate    = filtered.filter(t => t.status !== 'done' && !t.dueDate)
  const done      = filtered.filter(t => t.status === 'done')

  const activePending = overdue.length + todayList.length + thisWeek.length + upcoming.length + noDate.length

  const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all placeholder:text-slate-300"

  return (
    <div>
      <Topbar title="Tasks" />
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {loading ? '—' : activePending === 0 ? 'All caught up!' : `${activePending} task${activePending !== 1 ? 's' : ''} remaining`}
              </p>
            </div>
            <FilterSelect
              value={filterAssignee}
              onChange={setFilterAssignee}
              placeholder="All Members"
              options={ASSIGNEE_OPTIONS}
            />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 px-3 py-2 rounded-lg transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckSquare className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No tasks yet</p>
            <button onClick={openCreate} className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium cursor-pointer">
              + Add your first task
            </button>
          </div>
        ) : (
          <>
            {/* Overdue */}
            <Section icon={<AlertTriangle className="w-3.5 h-3.5" />} title="Overdue" count={overdue.length} accent="text-red-600">
              {overdue.map(task => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => openEdit(task)} onDelete={() => setDeleteId(task.id)} canToggle={false} />
              ))}
            </Section>

            {/* Today */}
            <Section icon={<Calendar className="w-3.5 h-3.5" />} title={`Today — ${format(new Date(), 'MMM d')}`} count={todayList.length} accent="text-violet-600" alwaysShow>
              {todayList.length === 0
                ? <div className="px-4 py-4 text-xs text-slate-400">No tasks for today</div>
                : todayList.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => openEdit(task)} onDelete={() => setDeleteId(task.id)} canToggle />
                  ))
              }
            </Section>

            {/* This week */}
            <Section icon={<Clock className="w-3.5 h-3.5" />} title="This Week" count={thisWeek.length} accent="text-blue-600">
              {thisWeek
                .sort((a, b) => parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime())
                .map(task => (
                  <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => openEdit(task)} onDelete={() => setDeleteId(task.id)} fullDate canToggle={false} />
                ))}
            </Section>

            {/* Upcoming */}
            <Section icon={<Calendar className="w-3.5 h-3.5" />} title="Upcoming" count={upcoming.length} accent="text-slate-500">
              {upcoming
                .sort((a, b) => parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime())
                .map(task => (
                  <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => openEdit(task)} onDelete={() => setDeleteId(task.id)} fullDate canToggle={false} />
                ))}
            </Section>

            {/* No due date */}
            <Section icon={<Inbox className="w-3.5 h-3.5" />} title="No Due Date" count={noDate.length} accent="text-slate-400">
              {noDate.map(task => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => openEdit(task)} onDelete={() => setDeleteId(task.id)} canToggle={false} />
              ))}
            </Section>

            {/* Done — collapsible, always allow unchecking */}
            <Section icon={<CheckSquare className="w-3.5 h-3.5" />} title="Done" count={done.length} accent="text-green-600" collapsible>
              {done
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map(task => (
                  <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task)} onEdit={() => openEdit(task)} onDelete={() => setDeleteId(task.id)} canToggle />
                ))}
            </Section>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={closeModal} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" required value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Follow up proposal" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Optional details..." rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Task Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setField('priority', e.target.value)} className={inputCls + ' bg-white cursor-pointer'}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assigned To</label>
                <div className="flex gap-2">
                  {ASSIGNEE_OPTIONS.map(o => (
                    <button key={o.value} type="button" onClick={() => setField('assignedTo', o.value)}
                      className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-colors cursor-pointer ${form.assignedTo === o.value ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Repeat <span className="text-slate-400 font-normal">(auto-creates next when done)</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(REPEAT_LABELS).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setField('repeat', value)}
                      className={`text-xs py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${form.repeat === value ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 text-sm font-medium text-white bg-violet-600 rounded-lg px-4 py-2.5 hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editTask ? 'Save Changes' : 'Create Task'}
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
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Task?</h3>
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
