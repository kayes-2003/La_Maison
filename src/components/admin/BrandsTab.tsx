import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Brand { id: string; name: string; logo_url: string; sort_order: number; active: boolean }

const inp = 'w-full bg-surface-100 border border-brand-800/50 rounded-xl px-3 py-2 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 transition-all'

function BrandForm({ initial, onSave, onCancel }: {
  initial?: Partial<Brand>
  onSave: (d: Omit<Brand, 'id'>) => void
  onCancel: () => void
}) {
  const [name,    setName]    = useState(initial?.name     ?? '')
  const [logo,    setLogo]    = useState(initial?.logo_url ?? '')
  const [active,  setActive]  = useState(initial?.active   ?? true)
  const [order,   setOrder]   = useState(initial?.sort_order ?? 0)

  return (
    <div className="p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl space-y-3 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Brand / Award Name *</label>
          <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Michelin Guide" />
        </div>
        <div>
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 block">Sort Order</label>
          <input className={inp} type="number" min={0} value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1"><Globe size={10} /> Logo Image URL (optional)</label>
          <input className={inp} value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://…logo.svg" />
        </div>
        {logo && (
          <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-surface-50/60 border border-brand-900/20 rounded-xl">
            <img src={logo} alt={name} className="h-8 object-contain max-w-[100px] opacity-70"
              onError={e => { (e.target as HTMLImageElement).src = '' }} />
            <span className="text-brand-500 text-sm font-semibold">{name || 'Preview'}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setActive(a => !a)} className="text-brand-500 hover:text-brand-300 transition-colors">
            {active ? <ToggleRight size={26} className="text-brand-400" /> : <ToggleLeft size={26} />}
          </button>
          <span className="text-brand-500 text-sm">{active ? 'Visible in marquee' : 'Hidden'}</span>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-ghost gap-1.5 text-sm"><X size={13} /> Cancel</button>
        <button onClick={() => onSave({ name, logo_url: logo, sort_order: order, active })} disabled={!name}
          className="btn-primary gap-1.5 text-sm disabled:opacity-40"><Save size={13} /> Save Brand</button>
      </div>
    </div>
  )
}

export function BrandsTab() {
  const [brands,  setBrands]  = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [adding,  setAdding]  = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('trusted_brands').select('*').order('sort_order')
    if (data) setBrands(data as Brand[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (data: Omit<Brand, 'id'>, id?: string) => {
    if (id) await supabase.from('trusted_brands').update(data).eq('id', id)
    else    await supabase.from('trusted_brands').insert(data)
    setAdding(false); setEditing(null); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this brand?')) return
    await supabase.from('trusted_brands').delete().eq('id', id)
    load()
  }

  const move = async (id: string, dir: 'up' | 'down') => {
    const idx  = brands.findIndex(b => b.id === id)
    const swap = brands[dir === 'up' ? idx - 1 : idx + 1]
    if (!swap) return
    await Promise.all([
      supabase.from('trusted_brands').update({ sort_order: swap.sort_order }).eq('id', id),
      supabase.from('trusted_brands').update({ sort_order: brands[idx].sort_order }).eq('id', swap.id),
    ])
    load()
  }

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('trusted_brands').update({ active: !active }).eq('id', id)
    load()
  }

  if (loading) return <div className="text-brand-700 text-sm py-8 text-center">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-300">Trusted Brands Marquee</h2>
          <p className="text-brand-700 text-xs mt-0.5">Logos and award names that scroll below the reviews section</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null) }} className="btn-primary gap-1.5">
          <Plus size={14} /> Add Brand
        </button>
      </div>

      {adding && <BrandForm onSave={d => save(d)} onCancel={() => setAdding(false)} />}

      <div className="space-y-2">
        {brands.map((b, i) => (
          <div key={b.id}>
            {editing === b.id ? (
              <BrandForm initial={b} onSave={d => save(d, b.id)} onCancel={() => setEditing(null)} />
            ) : (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${b.active ? 'border-brand-800/40 bg-surface-100/40' : 'border-brand-900/20 bg-surface-100/10 opacity-50'}`}>
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name} className="h-7 object-contain max-w-[80px] opacity-60 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                ) : (
                  <div className="w-14 h-7 rounded bg-brand-900/40 border border-brand-800/30 shrink-0 flex items-center justify-center">
                    <Globe size={12} className="text-brand-700" />
                  </div>
                )}
                <p className="flex-1 text-brand-200 text-sm font-semibold">{b.name}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(b.id, 'up')}   disabled={i === 0}              className="p-1 text-brand-700 hover:text-brand-300 disabled:opacity-20"><ChevronUp size={14} /></button>
                  <button onClick={() => move(b.id, 'down')} disabled={i === brands.length-1} className="p-1 text-brand-700 hover:text-brand-300 disabled:opacity-20"><ChevronDown size={14} /></button>
                  <button onClick={() => toggle(b.id, b.active)} className="p-1 text-brand-700 hover:text-brand-300 ml-1">
                    {b.active ? <ToggleRight size={18} className="text-brand-400" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => { setEditing(b.id); setAdding(false) }} className="p-1 text-brand-700 hover:text-brand-300"><Edit3 size={14} /></button>
                  <button onClick={() => del(b.id)} className="p-1 text-red-700 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!brands.length && !adding && (
          <p className="text-brand-800 text-sm text-center py-8">No brands yet — add one above.</p>
        )}
      </div>
    </div>
  )
}