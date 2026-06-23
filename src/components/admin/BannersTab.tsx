import { useState, useEffect } from 'react'
import {
  Plus, Trash2, Edit3, Save, X, Image, Type,
  Megaphone, Clock, ToggleLeft, ToggleRight, ChevronUp, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement, AnnouncementType } from '@/types'

// ─── Types ────────────────────────────────────────────────────

interface Banner {
  id: string; title: string; subtitle: string; cta_label: string
  image_url: string; bg_color: string; sort_order: number; active: boolean
}

const inp = 'w-full bg-surface-100 border border-brand-800/50 rounded-xl px-3 py-2 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all'
const lbl = 'block text-xs font-semibold text-brand-500 mb-1 uppercase tracking-wide'

// ─── Banner Form ──────────────────────────────────────────────

const defaultBanner: Omit<Banner, 'id'> = {
  title: '', subtitle: '', cta_label: 'Explore Our Menu',
  image_url: '', bg_color: '#1a0e05', sort_order: 0, active: true,
}

function BannerForm({ initial, onSave, onCancel }: {
  initial?: Partial<Banner>
  onSave: (data: Omit<Banner, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...defaultBanner, ...initial })
  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-3 p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={lbl}><Type size={10} className="inline mr-1" />Title</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="A Table for Every Occasion" />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Subtitle</label>
          <textarea className={inp + ' resize-none'} rows={2} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Description text under title…" />
        </div>
        <div>
          <label className={lbl}>CTA Button Label</label>
          <input className={inp} value={form.cta_label} onChange={e => set('cta_label', e.target.value)} placeholder="Explore Our Menu" />
        </div>
        <div>
          <label className={lbl}>Sort Order</label>
          <input className={inp} type="number" min={0} value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}><Image size={10} className="inline mr-1" />Image URL</label>
          <input className={inp} value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className={lbl}>Background Colour</label>
          <div className="flex gap-2">
            <input type="color" value={form.bg_color} onChange={e => set('bg_color', e.target.value)}
              className="h-10 w-12 rounded-lg border border-brand-800/50 bg-surface-100 cursor-pointer p-1" />
            <input className={inp} value={form.bg_color} onChange={e => set('bg_color', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <button type="button" onClick={() => set('active', !form.active)} className="text-brand-500 hover:text-brand-300 transition-colors">
            {form.active ? <ToggleRight size={26} className="text-brand-400" /> : <ToggleLeft size={26} />}
          </button>
          <span className="text-brand-500 text-sm">{form.active ? 'Active' : 'Hidden'}</span>
        </div>
      </div>
      {form.image_url && (
        <div className="relative h-24 rounded-xl overflow-hidden border border-brand-800/30">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${form.image_url})` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${form.bg_color}dd, transparent)` }} />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <p className="text-white font-bold text-sm drop-shadow">{form.title || 'Title Preview'}</p>
            <p className="text-white/70 text-xs drop-shadow line-clamp-1">{form.subtitle || 'Subtitle preview'}</p>
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-ghost gap-1.5"><X size={14} /> Cancel</button>
        <button onClick={() => onSave(form)} className="btn-primary gap-1.5"><Save size={14} /> Save Banner</button>
      </div>
    </div>
  )
}

// ─── Announcement Form ────────────────────────────────────────

const annTypes: { id: AnnouncementType; label: string; colour: string }[] = [
  { id: 'info',    label: 'Info',    colour: 'text-blue-400 bg-blue-950/30 border-blue-700/40' },
  { id: 'success', label: 'Success', colour: 'text-green-400 bg-green-950/30 border-green-700/40' },
  { id: 'warning', label: 'Warning', colour: 'text-amber-400 bg-amber-950/30 border-amber-700/40' },
  { id: 'alert',   label: 'Alert',   colour: 'text-red-400 bg-red-950/30 border-red-700/40' },
]

const defaultAnn = {
  title: '', body: '', type: 'info' as AnnouncementType,
  show_from: new Date().toISOString().slice(0, 16),
  show_until: '',
  active: true,
}

function AnnForm({ initial, onSave, onCancel }: {
  initial?: Partial<typeof defaultAnn>
  onSave: (d: typeof defaultAnn) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...defaultAnn, ...initial })
  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-3 p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={lbl}>Title</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="🎉 Grand Opening Weekend!" />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Message</label>
          <textarea className={inp + ' resize-none'} rows={2} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Free dessert with every order this weekend only…" />
        </div>
        <div>
          <label className={lbl}>Type</label>
          <div className="flex gap-2 flex-wrap">
            {annTypes.map(t => (
              <button key={t.id} type="button" onClick={() => set('type', t.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.type === t.id ? t.colour : 'border-brand-800/30 text-brand-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <button type="button" onClick={() => set('active', !form.active)} className="text-brand-500 hover:text-brand-300 transition-colors">
            {form.active ? <ToggleRight size={26} className="text-brand-400" /> : <ToggleLeft size={26} />}
          </button>
          <span className="text-brand-500 text-sm">{form.active ? 'Active' : 'Paused'}</span>
        </div>
        <div>
          <label className={lbl}><Clock size={10} className="inline mr-1" />Show From</label>
          <input type="datetime-local" className={inp} value={form.show_from} onChange={e => set('show_from', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Show Until (leave blank = always)</label>
          <input type="datetime-local" className={inp} value={form.show_until} onChange={e => set('show_until', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-ghost gap-1.5"><X size={14} /> Cancel</button>
        <button onClick={() => onSave(form)} className="btn-primary gap-1.5"><Save size={14} /> Save Announcement</button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────

export function BannersTab() {
  const [banners,       setBanners]       = useState<Banner[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading,       setLoading]       = useState(true)
  const [addingBanner,  setAddingBanner]  = useState(false)
  const [editBanner,    setEditBanner]    = useState<string | null>(null)
  const [addingAnn,     setAddingAnn]     = useState(false)
  const [editAnn,       setEditAnn]       = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const [{ data: b }, { data: a }] = await Promise.all([
      supabase.from('hero_banners').select('*').order('sort_order'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    ])
    if (b) setBanners(b as Banner[])
    if (a) setAnnouncements(a as Announcement[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Banner CRUD ───────────────────────────────────────────────

  const saveBanner = async (data: Omit<Banner, 'id'>, id?: string) => {
    if (id) {
      await supabase.from('hero_banners').update(data).eq('id', id)
    } else {
      await supabase.from('hero_banners').insert(data)
    }
    setAddingBanner(false); setEditBanner(null); load()
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    await supabase.from('hero_banners').delete().eq('id', id)
    load()
  }

  const moveBanner = async (id: string, dir: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === banners.length - 1) return
    const swap = banners[dir === 'up' ? idx - 1 : idx + 1]
    await Promise.all([
      supabase.from('hero_banners').update({ sort_order: swap.sort_order }).eq('id', id),
      supabase.from('hero_banners').update({ sort_order: banners[idx].sort_order }).eq('id', swap.id),
    ])
    load()
  }

  const toggleBannerActive = async (id: string, active: boolean) => {
    await supabase.from('hero_banners').update({ active: !active }).eq('id', id)
    load()
  }

  // ── Announcement CRUD ─────────────────────────────────────────

  const saveAnn = async (data: typeof defaultAnn, id?: string) => {
    const payload = {
      ...data,
      show_until: data.show_until || null,
    }
    if (id) {
      await supabase.from('announcements').update(payload).eq('id', id)
    } else {
      await supabase.from('announcements').insert(payload)
    }
    setAddingAnn(false); setEditAnn(null); load()
  }

  const deleteAnn = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', id)
    load()
  }

  const toggleAnn = async (id: string, active: boolean) => {
    await supabase.from('announcements').update({ active: !active }).eq('id', id)
    load()
  }

  if (loading) return <div className="text-brand-700 text-sm py-8 text-center">Loading…</div>

  return (
    <div className="space-y-10">

      {/* ── Hero Banners ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-300">Hero Banners</h2>
            <p className="text-brand-700 text-xs mt-0.5">Carousel slides on the homepage — drag to reorder</p>
          </div>
          <button onClick={() => { setAddingBanner(true); setEditBanner(null) }} className="btn-primary gap-1.5">
            <Plus size={14} /> Add Banner
          </button>
        </div>

        {addingBanner && (
          <div className="mb-4">
            <BannerForm onSave={d => saveBanner(d)} onCancel={() => setAddingBanner(false)} />
          </div>
        )}

        <div className="space-y-3">
          {banners.map((b, i) => (
            <div key={b.id}>
              {editBanner === b.id ? (
                <BannerForm initial={b} onSave={d => saveBanner(d, b.id)} onCancel={() => setEditBanner(null)} />
              ) : (
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${b.active ? 'border-brand-800/40 bg-surface-100/40' : 'border-brand-900/20 bg-surface-100/10 opacity-60'}`}>
                  {/* Thumb */}
                  <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-brand-900/30">
                    {b.image_url
                      ? <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full" style={{ backgroundColor: b.bg_color }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-200 text-sm font-semibold truncate">{b.title || '(No title)'}</p>
                    <p className="text-brand-700 text-xs truncate">{b.subtitle || '—'}</p>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveBanner(b.id, 'up')}   className="p-1 text-brand-700 hover:text-brand-300 disabled:opacity-30" disabled={i === 0}><ChevronUp size={14} /></button>
                    <button onClick={() => moveBanner(b.id, 'down')} className="p-1 text-brand-700 hover:text-brand-300 disabled:opacity-30" disabled={i === banners.length - 1}><ChevronDown size={14} /></button>
                    <button onClick={() => toggleBannerActive(b.id, b.active)} className="p-1 text-brand-700 hover:text-brand-300 ml-1">
                      {b.active ? <ToggleRight size={18} className="text-brand-400" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => { setEditBanner(b.id); setAddingBanner(false) }} className="p-1 text-brand-700 hover:text-brand-300"><Edit3 size={14} /></button>
                    <button onClick={() => deleteBanner(b.id)} className="p-1 text-red-700 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {banners.length === 0 && !addingBanner && (
            <p className="text-brand-800 text-sm text-center py-6">No banners yet — add one above.</p>
          )}
        </div>
      </section>

      {/* ── Announcements ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-300 flex items-center gap-2">
              <Megaphone size={18} className="text-brand-400" /> Announcements
            </h2>
            <p className="text-brand-700 text-xs mt-0.5">Time-limited banners shown at top of the site to all visitors</p>
          </div>
          <button onClick={() => { setAddingAnn(true); setEditAnn(null) }} className="btn-primary gap-1.5">
            <Plus size={14} /> New
          </button>
        </div>

        {addingAnn && (
          <div className="mb-4">
            <AnnForm onSave={d => saveAnn(d)} onCancel={() => setAddingAnn(false)} />
          </div>
        )}

        <div className="space-y-3">
          {announcements.map(a => {
            const t = annTypes.find(x => x.id === a.type)!
            return (
              <div key={a.id}>
                {editAnn === a.id ? (
                  <AnnForm
                    initial={{ ...a, show_from: a.show_from.slice(0, 16), show_until: a.show_until?.slice(0, 16) ?? '' }}
                    onSave={d => saveAnn(d, a.id)}
                    onCancel={() => setEditAnn(null)}
                  />
                ) : (
                  <div className={`flex items-start gap-3 p-3 rounded-xl border ${a.active ? 'border-brand-800/40 bg-surface-100/40' : 'border-brand-900/20 bg-surface-100/10 opacity-60'}`}>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border shrink-0 ${t.colour}`}>{t.label.toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-200 text-sm font-semibold truncate">{a.title || a.body}</p>
                      <p className="text-brand-700 text-xs mt-0.5">
                        From {new Date(a.show_from).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {a.show_until ? ` → ${new Date(a.show_until).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ' → Always'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleAnn(a.id, a.active)} className="p-1 text-brand-700 hover:text-brand-300">
                        {a.active ? <ToggleRight size={18} className="text-brand-400" /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => { setEditAnn(a.id); setAddingAnn(false) }} className="p-1 text-brand-700 hover:text-brand-300"><Edit3 size={14} /></button>
                      <button onClick={() => deleteAnn(a.id)} className="p-1 text-red-700 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {announcements.length === 0 && !addingAnn && (
            <p className="text-brand-800 text-sm text-center py-6">No announcements yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}