import { useState, useEffect } from 'react'
import { X, Megaphone, CheckCircle2, AlertTriangle, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement, AnnouncementType } from '@/types'

const typeStyles: Record<AnnouncementType, { bg: string; border: string; text: string; icon: typeof Bell }> = {
  info:    { bg: 'bg-blue-950/60',   border: 'border-blue-700/50',   text: 'text-blue-300',   icon: Megaphone },
  success: { bg: 'bg-green-950/60',  border: 'border-green-700/50',  text: 'text-green-300',  icon: CheckCircle2 },
  warning: { bg: 'bg-amber-950/60',  border: 'border-amber-700/50',  text: 'text-amber-300',  icon: AlertTriangle },
  alert:   { bg: 'bg-red-950/60',    border: 'border-red-700/50',    text: 'text-red-300',    icon: Bell },
}

export function AnnouncementBanner() {
  const [items,     setItems]     = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const now = new Date().toISOString()
    supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .lte('show_from', now)
      .or(`show_until.is.null,show_until.gte.${now}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data as Announcement[]) })
  }, [])

  const visible = items.filter(a => !dismissed.has(a.id))
  if (!visible.length) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex flex-col gap-2 px-3 pt-2 pointer-events-none">
      {visible.map(ann => {
        const s = typeStyles[ann.type]
        const Icon = s.icon
        return (
          <div
            key={ann.id}
            className={`
              pointer-events-auto max-w-3xl mx-auto w-full
              flex items-start gap-3 px-4 py-3 rounded-xl
              border backdrop-blur-md shadow-xl animate-fade-up
              ${s.bg} ${s.border}
            `}
          >
            <Icon size={16} className={`${s.text} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              {ann.title && (
                <p className={`text-sm font-semibold ${s.text} leading-tight`}>{ann.title}</p>
              )}
              {ann.body && (
                <p className="text-brand-500 text-xs mt-0.5 leading-relaxed">{ann.body}</p>
              )}
              {ann.show_until && (
                <p className="text-brand-800 text-[10px] mt-1">
                  Showing until {new Date(ann.show_until).toLocaleString('en-GB', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            <button
              onClick={() => setDismissed(prev => new Set([...prev, ann.id]))}
              className="shrink-0 text-brand-700 hover:text-brand-300 transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}