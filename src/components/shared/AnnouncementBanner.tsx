import { useState, useEffect } from 'react'
import { X, Megaphone, CheckCircle2, AlertTriangle, Zap, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement, AnnouncementType } from '@/types'

const TYPE_CONFIG: Record<AnnouncementType, {
  bar: string; iconComp: React.ElementType; glow: string; pulse: string
}> = {
  info:    { bar: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500',          iconComp: Megaphone,     glow: 'shadow-blue-500/40',   pulse: 'bg-blue-400'    },
  success: { bar: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500',      iconComp: CheckCircle2,  glow: 'shadow-green-500/40',  pulse: 'bg-emerald-400' },
  warning: { bar: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500',     iconComp: Zap,           glow: 'shadow-amber-500/40',  pulse: 'bg-amber-400'   },
  alert:   { bar: 'bg-gradient-to-r from-red-600 via-rose-500 to-pink-500',           iconComp: AlertTriangle, glow: 'shadow-red-500/40',    pulse: 'bg-red-400'     },
}

function Countdown({ until }: { until: string }) {
  const [left, setLeft] = useState('')
  useEffect(() => {
    const calc = () => {
      const diff = new Date(until).getTime() - Date.now()
      if (diff <= 0) { setLeft('Ended'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setLeft(h > 0 ? `${h}h ${m}m left` : m > 0 ? `${m}m ${s}s left` : `${s}s left`)
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [until])
  return <span className="font-mono font-bold text-white/90 text-xs bg-black/20 px-2 py-0.5 rounded-full">⏱ {left}</span>
}

export function AnnouncementBanner() {
  const [items,     setItems]     = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [current,   setCurrent]   = useState(0)

  useEffect(() => {
    const now = new Date().toISOString()
    supabase.from('announcements').select('*').eq('active', true)
      .lte('show_from', now).or(`show_until.is.null,show_until.gte.${now}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data as Announcement[]) })
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [items.length])

  const visible = items.filter(a => !dismissed.has(a.id))
  if (!visible.length) return null

  const ann     = visible[current % visible.length]
  const cfg     = TYPE_CONFIG[ann.type]
  const Icon    = cfg.iconComp
  const urgent  = ann.type === 'alert' || ann.type === 'warning'

  return (
    <div className={`relative w-full z-40 ${cfg.bar} shadow-lg ${cfg.glow}`}>
      {/* Shimmer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 -left-full w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
        {/* Pulse dot */}
        <span className="relative shrink-0 hidden sm:flex">
          <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.pulse} opacity-75 animate-ping`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.pulse}`} />
        </span>

        <Icon size={16} className={`text-white shrink-0 ${urgent ? 'animate-bounce' : ''}`} />

        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
          {ann.title && (
            <span className="text-white font-bold text-sm shrink-0 flex items-center gap-1.5">
              {ann.type === 'success' && <Sparkles size={11} />}
              {ann.title}
            </span>
          )}
          {ann.body && <span className="text-white/85 text-xs leading-relaxed">{ann.body}</span>}
          {ann.show_until && <Countdown until={ann.show_until} />}
        </div>

        {visible.length > 1 && (
          <div className="flex gap-1 shrink-0">
            {visible.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current % visible.length ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        )}

        <button onClick={() => { setDismissed(prev => new Set([...prev, ann.id])); setCurrent(0) }}
          className="shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors ml-1">
          <X size={12} />
        </button>
      </div>
    </div>
  )
}