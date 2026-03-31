'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Topbar } from '@/components/layout/topbar'
import { Plus, X, Loader2, Search, Phone, Mail, ChevronDown, Building2, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react'

interface Client {
  id: string
  companyName: string
  industry?: string
  country?: string
  website?: string
  status: string
  notes?: string
  contact1Name?: string
  contact1Phone?: string
  contact1Email?: string
  contact2Name?: string
  contact2Phone?: string
  contact2Email?: string
  contactPersonGmail?: string
  whoApproach?: string
  createdAt: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  'Music Event',
  'Concert / Music Record',
  'International Music Records',
  'EDM Festival',
  'Alcohol Brands',
  'Organizer',
  'Venue Partner',
  'Music Livehouse',
  'Night Club',
  'Sport',
  'E-Sport',
  'TV Show / Event',
  'Partners',
]

const COUNTRY_OPTIONS = [
  'Thailand', 'United States', 'Japan', 'South Korea', 'Singapore',
  'United Kingdom', 'Germany', 'France', 'Australia', 'China',
  'India', 'Indonesia', 'Malaysia', 'Philippines', 'Vietnam',
  'United Arab Emirates', 'Brazil', 'Mexico', 'Canada', 'Netherlands',
  'Hong Kong', 'Taiwan', 'New Zealand', 'Italy', 'Spain',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Russia',
  'Turkey', 'Saudi Arabia', 'Egypt', 'South Africa', 'Nigeria',
]

const WHO_OPTIONS = [
  { value: 'muan',  label: 'Muan' },
  { value: 'japan', label: 'Japan' },
  { value: 'kla',   label: 'Kla' },
]

const PAGE_SIZE = 15
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const EMPTY_FORM = {
  companyName: '', industry: '', country: 'Thailand', website: '', notes: '',
  contact1Name: '', contact1Phone: '', contact1Email: '',
  contact2Name: '', contact2Phone: '', contact2Email: '',
  contactPersonGmail: '', whoApproach: '',
}

// ── Autocomplete input ────────────────────────────────────────────────────────
function AutocompleteInput({
  value, onChange, options, placeholder, className,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase())).slice(0, 8)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button key={o} type="button"
              onMouseDown={() => { onChange(o); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Key Contact badge pill ──────────────────────────────────────────────────────────
const WHO_COLORS: Record<string, string> = {
  muan:  'bg-blue-50 text-blue-600',
  japan: 'bg-violet-50 text-violet-600',
  kla:   'bg-amber-50 text-amber-600',
}

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

// ── Row action menu (portal-based to escape overflow-hidden) ──────────────────
function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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

  function handleOpen() {
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
        onClick={handleOpen}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-36 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API_URL}/clients`)
      if (!res.ok) throw new Error()
      setClients(await res.json())
    } catch {
      setError('Could not connect to backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function openCreate() {
    setEditClient(null); setForm(EMPTY_FORM); setFormError(null); setShowModal(true)
  }

  function openEdit(client: Client) {
    setEditClient(client)
    setForm({
      companyName: client.companyName,
      industry: client.industry ?? '',
      country: client.country ?? 'Thailand',
      website: client.website ?? '',
      notes: client.notes ?? '',
      contact1Name: client.contact1Name ?? '',
      contact1Phone: client.contact1Phone ?? '',
      contact1Email: client.contact1Email ?? '',
      contact2Name: client.contact2Name ?? '',
      contact2Phone: client.contact2Phone ?? '',
      contact2Email: client.contact2Email ?? '',
      contactPersonGmail: client.contactPersonGmail ?? '',
      whoApproach: client.whoApproach ?? '',
    })
    setFormError(null); setShowModal(true)
  }

  function closeModal() { setShowModal(false); setEditClient(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setFormError(null)
    const body = {
      companyName: form.companyName.trim(),
      industry: form.industry.trim() || undefined,
      country: form.country.trim() || undefined,
      website: form.website.trim() || undefined,
      notes: form.notes.trim() || undefined,
      contact1Name: form.contact1Name.trim() || undefined,
      contact1Phone: form.contact1Phone.trim() || undefined,
      contact1Email: form.contact1Email.trim() || undefined,
      contact2Name: form.contact2Name.trim() || undefined,
      contact2Phone: form.contact2Phone.trim() || undefined,
      contact2Email: form.contact2Email.trim() || undefined,
      contactPersonGmail: form.contactPersonGmail.trim() || undefined,
      whoApproach: form.whoApproach || undefined,
    }
    try {
      const url = editClient ? `${API_URL}/clients/${editClient.id}` : `${API_URL}/clients`
      const res = await fetch(url, {
        method: editClient ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.message || 'Failed')
      }
      closeModal(); await fetchClients()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  async function confirmDelete() {
    if (!deleteId) return
    await fetch(`${API_URL}/clients/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); await fetchClients()
  }

  function exportCSV() {
    const rows = filtered.map(c => ({
      'Company Name':    c.companyName,
      'Country':         c.country ?? '',
      'Industry':        c.industry ?? '',
      'Contact 1 Name':  c.contact1Name ?? '',
      'Contact 1 Phone': c.contact1Phone ?? '',
      'Contact 1 Email': c.contact1Email ?? '',
      'Contact 2 Name':  c.contact2Name ?? '',
      'Contact 2 Phone': c.contact2Phone ?? '',
      'Contact 2 Email': c.contact2Email ?? '',
      'Personal Email':  c.contactPersonGmail ?? '',
      'Key Contact':     c.whoApproach ?? '',
      'Website':         c.website ?? '',
      'Notes':           c.notes ?? '',
    }))
    const headers = Object.keys(rows[0] ?? {})
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(',')),
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // Filter + paginate
  const filtered = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.country?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all placeholder:text-slate-300 pr-8"

  return (
    <div>
      <Topbar title="Clients" />
      <div className="p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search companies, country..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{filtered.length} companies</span>
            <button onClick={exportCSV} disabled={filtered.length === 0}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Client
            </button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">{search ? 'No results found' : 'No clients yet'}</p>
              {!search && <button onClick={openCreate} className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium cursor-pointer">+ Add Client</button>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-64">Company Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Country</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Industry</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Contact</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Key Contact</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                        {/* Company */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {client.companyName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm leading-tight">{client.companyName}</p>
                              {client.website && <p className="text-xs text-slate-400">{client.website}</p>}
                            </div>
                          </div>
                        </td>
                        {/* Country */}
                        <td className="px-4 py-3 text-xs text-slate-600">{client.country || '—'}</td>
                        {/* Industry */}
                        <td className="px-4 py-3 text-xs text-slate-600">{client.industry || '—'}</td>
                        {/* Contact */}
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            {client.contact1Name ? (
                              <div>
                                <p className="text-xs font-medium text-slate-700">{client.contact1Name}</p>
                                {client.contact1Phone && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-2.5 h-2.5" />{client.contact1Phone}</p>}
                                {client.contact1Email && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-2.5 h-2.5" />{client.contact1Email}</p>}
                              </div>
                            ) : null}
                            {client.contact2Name ? (
                              <div className={client.contact1Name ? 'pt-1.5 border-t border-slate-100' : ''}>
                                <p className="text-xs font-medium text-slate-700">{client.contact2Name}</p>
                                {client.contact2Phone && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-2.5 h-2.5" />{client.contact2Phone}</p>}
                                {client.contact2Email && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-2.5 h-2.5" />{client.contact2Email}</p>}
                              </div>
                            ) : null}
                            {!client.contact1Name && !client.contact2Name && <span className="text-xs text-slate-300">—</span>}
                          </div>
                        </td>
                        {/* Key Contact */}
                        <td className="px-4 py-3">
                          {client.whoApproach
                            ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${WHO_COLORS[client.whoApproach] ?? 'bg-slate-100 text-slate-600'}`}>
                                {client.whoApproach}
                              </span>
                            : <span className="text-xs text-slate-300">—</span>
                          }
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-3">
                          <RowMenu
                            onEdit={() => openEdit(client)}
                            onDelete={() => setDeleteId(client.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors cursor-pointer ${p === page ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">{editClient ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={closeModal} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* ── Basic Info ── */}
              <section>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Basic Info</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.companyName} onChange={e => setField('companyName', e.target.value)}
                      placeholder="e.g. AEG Presents Asia" className={inputCls + ' pr-3'} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Industry</label>
                      <AutocompleteInput
                        value={form.industry}
                        onChange={v => setField('industry', v)}
                        options={INDUSTRY_OPTIONS}
                        placeholder="Select or type..."
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                      <AutocompleteInput
                        value={form.country}
                        onChange={v => setField('country', v)}
                        options={COUNTRY_OPTIONS}
                        placeholder="e.g. Thailand"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                    <input type="text" value={form.website} onChange={e => setField('website', e.target.value)}
                      placeholder="e.g. aegpresents.jp" className={inputCls + ' pr-3'} />
                  </div>
                </div>
              </section>

              {/* ── Contacts side by side ── */}
              <section>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contacts</p>
                <div className="grid grid-cols-2 gap-5">
                  {/* Contact 1 */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">Contact 1</p>
                    <div className="mb-2">
                      <input type="text" value={form.contact1Name} onChange={e => setField('contact1Name', e.target.value)}
                        placeholder="Full name" className={inputCls + ' pr-3'} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input type="text" value={form.contact1Phone} onChange={e => setField('contact1Phone', e.target.value)}
                        placeholder="Phone" className={inputCls.replace('px-3', 'pl-8 pr-3')} />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input type="email" value={form.contact1Email} onChange={e => setField('contact1Email', e.target.value)}
                        placeholder="Email" className={inputCls.replace('px-3', 'pl-8 pr-3')} />
                    </div>
                  </div>
                  {/* Contact 2 */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">Contact 2</p>
                    <div className="mb-2">
                      <input type="text" value={form.contact2Name} onChange={e => setField('contact2Name', e.target.value)}
                        placeholder="Full name" className={inputCls + ' pr-3'} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input type="text" value={form.contact2Phone} onChange={e => setField('contact2Phone', e.target.value)}
                        placeholder="Phone" className={inputCls.replace('px-3', 'pl-8 pr-3')} />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input type="email" value={form.contact2Email} onChange={e => setField('contact2Email', e.target.value)}
                        placeholder="Email" className={inputCls.replace('px-3', 'pl-8 pr-3')} />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Key Contact ── */}
              <section>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Key Contact</p>
                <AvatarSelect value={form.whoApproach} onChange={v => setField('whoApproach', v)} options={WHO_OPTIONS} />
              </section>

              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal}
                  className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 text-sm font-medium text-white bg-violet-600 rounded-lg px-4 py-2.5 hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editClient ? 'Save Changes' : 'Add Client'}
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
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Delete Client?</h3>
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
