import { useState, useEffect } from 'react'
import { Award, Star, X, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AwardItem {
  id: string; title: string; issuer: string
  year: string; icon_url: string; description: string
  sort_order: number; active: boolean
}

const TROPHY_ICONS = ['🏆','🥇','🎖️','⭐','🌟','🏅']

// ─── Full-screen award detail modal ──────────────────────────
function AwardModal({ award, icon, onClose }: { award: AwardItem; icon: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-50 border border-brand-700/40 rounded-3xl shadow-2xl overflow-hidden animate-fade-up">

        {/* Gold gradient header */}
        <div className="relative h-40 bg-gradient-to-br from-brand-700/40 via-brand-600/30 to-brand-900/60 flex items-center justify-center overflow-hidden">
          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-brand-400/10 blur-3xl" />
          </div>
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-2 border-brand-600/20" />
            <div className="absolute w-28 h-28 rounded-full border border-brand-500/20" />
          </div>

          {award.icon_url ? (
            <img src={award.icon_url} alt={award.title}
              className="relative z-10 w-20 h-20 object-contain drop-shadow-2xl"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <span className="relative z-10 text-7xl drop-shadow-2xl">{icon}</span>
          )}

          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Year badge */}
          <span className="inline-block text-[11px] px-3 py-1 rounded-full bg-brand-800/50 text-brand-400 border border-brand-700/30 font-mono mb-4">
            {award.year}
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-100 mb-2 leading-tight">
            {award.title}
          </h2>
          <p className="text-brand-400 font-semibold text-base mb-4">{award.issuer}</p>

          {award.description && (
            <p className="text-brand-600 text-sm leading-relaxed max-w-sm mx-auto mb-6">
              {award.description}
            </p>
          )}

          {/* Decorative stars */}
          <div className="flex justify-center gap-1.5 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="text-brand-400 fill-brand-400" />
            ))}
          </div>

          {/* Divider with quote */}
          <div className="border-t border-brand-900/30 pt-5">
            <p className="text-brand-700 text-xs italic">
              "A testament to our commitment to culinary excellence and outstanding guest experience."
            </p>
            <p className="text-brand-600 text-xs mt-1 font-semibold">— La Maison Team</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────
export function AwardsSection() {
  const [awards,   setAwards]   = useState<AwardItem[]>([])
  const [selected, setSelected] = useState<AwardItem | null>(null)

  useEffect(() => {
    supabase.from('awards').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => { if (data) setAwards(data as AwardItem[]) })
  }, [])

  if (!awards.length) return null

  return (
    <>
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-700/40 bg-brand-900/30 text-brand-400 text-xs font-semibold tracking-widest uppercase mb-4">
              <Award size={12} /> Certifications & Recognition
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-300">
              Awarded for Excellence
            </h2>
            <p className="text-brand-700 text-xs mt-2">Click any award to view in full detail</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {awards.map((award, i) => (
              <button
                key={award.id}
                onClick={() => setSelected(award)}
                className="group card-glass rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-950/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left w-full"
              >
                {/* Icon container */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-700/30 to-brand-900/40 border border-brand-700/30 flex items-center justify-center group-hover:border-brand-500/50 group-hover:from-brand-600/30 transition-all duration-300 shrink-0">
                  {award.icon_url ? (
                    <img src={award.icon_url} alt={award.title}
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {TROPHY_ICONS[i % TROPHY_ICONS.length]}
                    </span>
                  )}
                  {/* Expand hint */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={9} className="text-white" />
                  </div>
                </div>

                {/* Year badge */}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-800/50 text-brand-500 border border-brand-800/30 font-mono">
                  {award.year}
                </span>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-brand-200 text-base leading-tight">
                    {award.title}
                  </h3>
                  <p className="text-brand-500 text-xs font-semibold">{award.issuer}</p>
                  {award.description && (
                    <p className="text-brand-700 text-xs leading-relaxed line-clamp-2">{award.description}</p>
                  )}
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mt-auto">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={11} className="text-brand-700 fill-brand-700 group-hover:text-brand-400 group-hover:fill-brand-400 transition-colors duration-300" />
                  ))}
                </div>

                <span className="text-brand-700 text-[10px] group-hover:text-brand-500 transition-colors flex items-center gap-1">
                  <ExternalLink size={9} /> Click to view full certificate
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <AwardModal
          award={selected}
          icon={TROPHY_ICONS[awards.indexOf(selected) % TROPHY_ICONS.length]}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}