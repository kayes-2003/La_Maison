import { useState } from 'react'
import { ShoppingCart, CheckCircle, Heart, Sparkles, Flame, ZoomIn, Star } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { MenuItem } from '@/types'

interface MenuCardProps {
  item:            MenuItem
  inCart:          boolean
  inWishlist:      boolean
  userId:          string | null
  onAddToCart:     () => void
  onToggleWish:    () => void
  onLoginRequired: () => void
  onOpenModal:     () => void   // opens the full Quick View / Product Zoom modal
}

// ─── Inline star-rating widget (no name, no comment) ─────────
function InlineStarRate({
  menuItemId, userId, onLoginRequired,
}: { menuItemId: string; userId: string | null; onLoginRequired: () => void }) {
  const [avg,       setAvg]       = useState<number | null>(null)
  const [count,     setCount]     = useState(0)
  const [hover,     setHover]     = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [saving,    setSaving]    = useState(false)

  // Fetch avg on first render
  useState(() => {
    supabase.from('item_reviews').select('stars').eq('menu_item_id', menuItemId)
      .then(({ data }) => {
        if (data?.length) {
          setAvg(data.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / data.length)
          setCount(data.length)
        } else {
          setAvg(0); setCount(0)
        }
      })
  })

  const handleRate = async (stars: number) => {
    if (!userId) { onLoginRequired(); return }
    if (submitted || saving) return
    setSaving(true)
    await supabase.from('item_reviews').insert({
      menu_item_id: menuItemId, user_id: userId, stars,
      comment: '', reviewer_name: 'Anonymous',
    })
    // Refresh avg
    const { data } = await supabase.from('item_reviews').select('stars').eq('menu_item_id', menuItemId)
    if (data?.length) {
      setAvg(data.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / data.length)
      setCount(data.length)
    }
    setSaving(false); setSubmitted(true)
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Interactive stars */}
      <div className="flex gap-0.5"
        onMouseLeave={() => setHover(0)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = avg !== null && avg > 0 && !hover
            ? i < Math.round(avg)
            : i < hover
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => { if (!submitted) setHover(i + 1) }}
              onClick={e => { e.stopPropagation(); handleRate(i + 1) }}
              className="focus:outline-none"
              disabled={saving}
            >
              <Star
                size={12}
                className={cn(
                  'transition-all duration-100',
                  filled
                    ? 'text-brand-400 fill-brand-400'
                    : hover && i < hover && !submitted
                      ? 'text-brand-500 fill-brand-500/40'
                      : 'text-brand-900'
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Count / feedback */}
      <span className="text-[10px] text-brand-700 leading-none">
        {submitted
          ? <span className="text-green-500">✓</span>
          : avg !== null && avg > 0
            ? <><span className="text-brand-500 font-semibold">{avg.toFixed(1)}</span><span className="text-brand-800 ml-0.5">({count})</span></>
            : <span className="text-brand-900">Rate</span>
        }
      </span>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────
export function MenuCard({
  item, inCart, inWishlist, userId,
  onAddToCart, onToggleWish, onLoginRequired, onOpenModal,
}: MenuCardProps) {
  const finalPrice = discountedPrice(item.price, item.offer_percent)
  const hasImage   = isValidUrl(item.image_url)

  return (
    <div className={cn(
      'group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 h-[280px]',
      'bg-surface-50 border border-brand-900/30',
      'hover:border-brand-700/60 hover:shadow-xl hover:shadow-brand-950/50 hover:-translate-y-0.5',
      !item.available && 'opacity-55'
    )}>

      {/* ── Badges top-left ── */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {item.is_new && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
            <Sparkles size={9} /> NEW
          </span>
        )}
        {item.offer_percent > 0 && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold shadow">
            <Flame size={9} /> -{item.offer_percent}%
          </span>
        )}
      </div>

      {/* ── Wishlist top-right ── */}
      <button
        onClick={e => { e.stopPropagation(); userId ? onToggleWish() : onLoginRequired() }}
        className={cn(
          'absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow',
          'opacity-0 group-hover:opacity-100',
          inWishlist ? 'bg-red-500 text-white opacity-100' : 'bg-surface-50/90 text-brand-700 hover:bg-red-500 hover:text-white border border-brand-800/30'
        )}
      >
        <Heart size={12} className={inWishlist ? 'fill-white' : ''} />
      </button>

      {/* ── Image — clickable for Quick View / Zoom ── */}
      <div
        className="relative h-[120px] shrink-0 overflow-hidden bg-gradient-to-br from-brand-950 to-surface-100 cursor-pointer"
        onClick={onOpenModal}
        title="Quick View"
      >
        {hasImage ? (
          <img src={item.image_url} alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none drop-shadow-lg">
              {item.image_url || '🍽️'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-transparent to-transparent opacity-50" />

        {/* Quick View / Zoom overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
            <ZoomIn size={12} /> Quick View
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-3 overflow-hidden">
        <span className="self-start text-[9px] px-1.5 py-0.5 rounded-full bg-brand-900/60 text-brand-600 font-medium border border-brand-800/30 mb-1.5 truncate max-w-full">
          {item.category}
        </span>

        {/* Name — clickable for modal */}
        <h3
          className="font-display text-brand-100 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors mb-1 cursor-pointer"
          onClick={onOpenModal}
        >
          {item.name}
        </h3>

        <p className="text-brand-700 text-[11px] leading-relaxed line-clamp-1 mb-auto">
          {item.description}
        </p>

        {/* ── Inline star rate (no name, no comment) ── */}
        <div className="mt-1.5">
          <InlineStarRate
            menuItemId={item.id}
            userId={userId}
            onLoginRequired={onLoginRequired}
          />
        </div>

        {/* ── Price + Add ── */}
        <div className="flex items-center justify-between gap-1 mt-2">
          <div className="leading-tight">
            <span className="font-mono font-bold text-brand-200 text-sm">{formatPrice(finalPrice)}</span>
            {item.offer_percent > 0 && (
              <span className="block text-[9px] text-brand-800 line-through">{formatPrice(item.price)}</span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onAddToCart() }}
            disabled={!item.available}
            className={cn(
              'shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200',
              inCart ? 'bg-green-900/40 text-green-300 border border-green-800/40' : 'bg-brand-500 hover:bg-brand-400 active:scale-95 text-surface',
              !item.available && 'opacity-40 pointer-events-none'
            )}
          >
            {inCart ? <><CheckCircle size={11} /> Added</> : <><ShoppingCart size={11} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  )
}