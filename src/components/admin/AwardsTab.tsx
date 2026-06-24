import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AwardItem {
  id: string; title: string; issuer: string; year: string
  icon_url: string; description: string; sort_order: number; active: boolean
}

const inp = 'w-full bg-surface-100 border border-brand-800/50 rounded-xl px-3 py-2 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 transition-all'

function AwardForm({ initial, onSave, onCancel }: {
  initial?: Partial<AwardItem>
  onSave: (d: Omit<AwardItem, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '', issuer: initial?.issuer ?? '',
    year: initial?.year ?? new Date().getFullYear().toString(),
    icon_url: initial?.icon_url ?? '', description: initial?.description ?? '',
    sort_order: initial?.sort_order ?? 0, active: initial?.active ?? true,
  })
  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl space-y-3 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Award Title *</label>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Michelin Star" />
        </div>
        <div>
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Issuing Body *</label>
          <input className={inp} value={form.issuer} onChange={e => set('issuer', e.target.value)} placeholder="Michelin Guide" />
        </div>
        <div>
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Year</label>
          <input className={inp} value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" />
        </div>
        <div>
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Sort Order</label>
          <input className={inp} type="number" min={0} value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Icon / Logo URL (optional)</label>
          <input className={inp} value={form.icon_url} onChange={e => set('icon_url', e.target.value)} placeholder="https://…logo.svg" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Short Description</label>
          <textarea className={inp + ' resize-none'} rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Recognised for outstanding culinary excellence…" />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => set('active', !form.active)} className="text-brand-500 hover:text-brand-300 transition-colors">
            {form.active ? <ToggleRight size={26} className="text-brand-400" /> : <ToggleLeft size={26} />}
          </button>
          <span className="text-brand-500 text-sm">{form.active ? 'Visible on homepage' : 'Hidden'}</span>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-ghost gap-1.5 text-sm"><X size={13} /> Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.title || !form.issuer}
          className="btn-primary gap-1.5 text-sm disabled:opacity-40"><Save size={13} /> Save Award</button>
      </div>
    </div>
  )
}

export function AwardsTab() {
  const [awards,  setAwards]  = useState<AwardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding,  setAdding]  = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('awards').select('*').order('sort_order')
    if (data) setAwards(data as AwardItem[])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const save = async (data: Omit<AwardItem, 'id'>, id?: string) => {
    if (id) await supabase.from('awards').update(data).eq('id', id)
    else    await supabase.from('awards').insert(data)
    setAdding(false); setEditing(null); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this award?')) return
    await supabase.from('awards').delete().eq('id', id)
    load()
  }

  const move = async (id: string, dir: 'up' | 'down') => {
    const idx  = awards.findIndex(a => a.id === id)
    const swap = awards[dir === 'up' ? idx - 1 : idx + 1]
    if (!swap) return
    await Promise.all([
      supabase.from('awards').update({ sort_order: swap.sort_order }).eq('id', id),
      supabase.from('awards').update({ sort_order: awards[idx].sort_order }).eq('id', swap.id),
    ])
    load()
  }

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('awards').update({ active: !active }).eq('id', id); load()
  }

  if (loading) return <div className="text-brand-700 text-sm py-8 text-center">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-300 flex items-center gap-2">
            <Award size={18} className="text-brand-400" /> Awards & Recognition
          </h2>
          <p className="text-brand-700 text-xs mt-0.5">Certificates and accolades shown on the homepage</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null) }} className="btn-primary gap-1.5">
          <Plus size={14} /> Add Award
        </button>
      </div>

      {adding && <AwardForm onSave={d => save(d)} onCancel={() => setAdding(false)} />}

      <div className="space-y-2">
        {awards.map((a, i) => (
          <div key={a.id}>
            {editing === a.id ? (
              <AwardForm initial={a} onSave={d => save(d, a.id)} onCancel={() => setEditing(null)} />
            ) : (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${a.active ? 'border-brand-800/40 bg-surface-100/40' : 'border-brand-900/20 bg-surface-100/10 opacity-50'}`}>
                <div className="w-10 h-10 rounded-xl bg-brand-900/50 border border-brand-800/30 flex items-center justify-center shrink-0">
                  {a.icon_url
                    ? <img src={a.icon_url} alt={a.title} className="w-7 h-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                    : <Award size={16} className="text-brand-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brand-200 text-sm font-semibold truncate">{a.title}</p>
                  <p className="text-brand-600 text-xs">{a.issuer} · {a.year}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(a.id,'up')}   disabled={i===0}             className="p-1 text-brand-700 hover:text-brand-300 disabled:opacity-20"><ChevronUp size={14} /></button>
                  <button onClick={() => move(a.id,'down')} disabled={i===awards.length-1} className="p-1 text-brand-700 hover:text-brand-300 disabled:opacity-20"><ChevronDown size={14} /></button>
                  <button onClick={() => toggle(a.id, a.active)} className="p-1 text-brand-700 hover:text-brand-300 ml-1">
                    {a.active ? <ToggleRight size={18} className="text-brand-400" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => { setEditing(a.id); setAdding(false) }} className="p-1 text-brand-700 hover:text-brand-300"><Edit3 size={14} /></button>
                  <button onClick={() => del(a.id)} className="p-1 text-red-700 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!awards.length && !adding && (
          <p className="text-brand-800 text-sm text-center py-8">No awards yet — add one above.</p>
        )}
      </div>
    </div>
  )
}