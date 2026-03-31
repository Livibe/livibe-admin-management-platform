'use client'

import { useState, useEffect, useCallback } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, Loader2, CheckSquare, Circle, AlertTriangle, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

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

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  low:    { label: 'Low',    color: 'bg-slate-100 text-slate-600' },
}

const REPEAT_LABELS: Record<string, string> = {
  none: 'None', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
}

const REPEAT_ICONS: Record<string, string> = {
  daily: '1d', weekly: '1w', monthly: '1m', yearly: '1y',
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  function openCreate() {
    setEditTask(null); setForm(EMPTY_FORM); setFormError(null); setShowModal(true)
  }

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

  const overdue = tasks.filter(t => t.status === 'overdue')
  const pending = tasks.filter(t => t.status === 'pending')
  const done    = tasks.filter(t => t.status === 'done')
  const sections = [
    { label: 'Overdue', items: overdue, headerClass: 'text-red-700 bg-red-50 border-red-200' },
    { label: 'Pending', items: pending, headerClass: 'text-slate-700 bg-slate-50 border-slate-200' },
    { label: 'Done',    items: done,    headerClass: 'text-green-700 bg-green-50 border-green-200' },
  ]

  const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all placeholder:text-slate-300"

  return (
    <div>
      <Topbar title="Tasks" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{loading ? '—' : `${tasks.length} tasks`}</p>
          <button onClick={openCreate} className="flex items-center gap-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckSquare className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No tasks yet</p>
            <button onClick={openCreate} className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium">+ Add your first task</button>
          </div>
        ) : (
          sections.filter(s => s.items.length > 0).map(({ label, items, headerClass }) => (
            <div key={label}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold mb-3 ${headerClass}`}>
                {label} · {items.length}
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map(task => {
                      const pCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
                      const isDone = task.status === 'done'
                      const isOverdue = task.status === 'overdue'
                      return (
                        <div key={task.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                          <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0">
                            {isDone ? <CheckSquare className="w-4 h-4 text-green-500" />
                              : isOverdue ? <AlertTriangle className="w-4 h-4 text-red-500" />
                              : <Circle className="w-4 h-4 text-slate-300 hover:text-slate-400" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</p>
                            {task.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {task.assignedTo && <span className="text-xs text-slate-500 capitalize font-medium">{task.assignedTo}</span>}
                              {task.repeat !== 'none' && (
                                <span className="flex items-center gap-0.5 text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md font-medium">
                                  <RefreshCw className="w-2.5 h-2.5" />{REPEAT_ICONS[task.repeat] ?? task.repeat}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pCfg.color}`}>{pCfg.label}</span>
                            {task.dueDate && (
                              <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(task)} className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button onClick={() => setDeleteId(task.id)} className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={closeModal} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setField('priority', e.target.value)} className={inputCls + ' bg-white'}>
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
                      className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-colors ${form.assignedTo === o.value ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
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
                      className={`text-xs py-1.5 rounded-lg border font-medium transition-colors ${form.repeat === value ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 text-sm font-medium text-white bg-violet-600 rounded-lg px-4 py-2.5 hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
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
              <button onClick={() => setDeleteId(null)} className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 text-sm font-medium text-white bg-red-500 rounded-lg px-4 py-2 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
