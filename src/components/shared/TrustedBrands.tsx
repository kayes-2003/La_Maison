import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Brand { id: string; name: string; logo_url: string; sort_order: number; active: boolean }

export function TrustedBrands() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    supabase.from('trusted_brands').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => { if (data) setBrands(data as Brand[]) })
  }, [])

  if (!brands.length) return null

  // Duplicate for seamless loop
  const items = [...brands, ...brands, ...brands]

  return (
    <section className="py-14 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

      <div className="text-center mb-8">
        <p className="text-brand-700 text-xs font-semibold uppercase tracking-[0.25em]">As Featured In & Recognised By</p>
      </div>

      <div className="flex gap-0 w-max animate-marquee hover:[animation-play-state:paused]">
        {items.map((b, i) => (
          <div
            key={`${b.id}-${i}`}
            className="flex items-center gap-3 mx-10 shrink-0 group"
          >
            {b.logo_url ? (
              <img
                src={b.logo_url}
                alt={b.name}
                className="h-8 object-contain opacity-40 group-hover:opacity-90 transition-opacity duration-300 max-w-[120px] filter grayscale group-hover:grayscale-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : null}
            <span className="text-brand-700 text-sm font-semibold font-display tracking-wide group-hover:text-brand-300 transition-colors whitespace-nowrap">
              {b.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}