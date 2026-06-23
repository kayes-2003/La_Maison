import { ShoppingCart, CheckCircle, Heart, Sparkles, Flame } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ShareMenu } from '@/components/customer/ShareMenu'
import { ProductReview } from '@/components/customer/ProductReview'
import type { MenuItem } from '@/types'

interface MenuCardProps {
  item:            MenuItem
  inCart:          boolean
  inWishlist:      boolean
  userId:          string | null
  onAddToCart:     () => void
  onToggleWish:    () => void
  onLoginRequired: () => void
}

export function MenuCard({ item, inCart, inWishlist, userId, onAddToCart, onToggleWish, onLoginRequired }: MenuCardProps) {
  const finalPrice = discountedPrice(item.price, item.offer_percent)
  const hasImage   = isValidUrl(item.image_url)

  return (
    <div className={cn(
      'group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer',
      'bg-surface-50 border border-brand-900/30',
      'hover:border-brand-700/60 hover:shadow-xl hover:shadow-brand-950/50 hover:-translate-y-0.5',
      !item.available && 'opacity-55'
    )}>

      {/* ── Top badges ─────────────────────────────────── */}
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
        {!item.available && (
          <span className="px-2 py-0.5 rounded-full bg-brand-900/80 text-brand-600 text-[10px] font-bold">
            Unavailable
          </span>
        )}
      </div>

      {/* ── Wish + Share (top-right, hover reveal) ───── */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
        <button
          onClick={e => { e.stopPropagation(); userId ? onToggleWish() : onLoginRequired() }}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center transition-all shadow',
            inWishlist
              ? 'bg-red-500 text-white'
              : 'bg-surface-50/90 text-brand-700 hover:bg-red-500 hover:text-white border border-brand-800/30'
          )}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={12} className={inWishlist ? 'fill-white' : ''} />
        </button>
        <div className="bg-surface-50/90 rounded-full border border-brand-800/30 shadow">
          <ShareMenu item={item} userId={userId} compact />
        </div>
      </div>

      {/* ── Image / Emoji ────────────────────────────── */}
      <div className="relative h-28 sm:h-32 overflow-hidden bg-gradient-to-br from-brand-950 to-surface-100 shrink-0">
        {hasImage ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none drop-shadow-lg">
              {item.image_url || '🍽️'}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-transparent to-transparent opacity-60" />
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Category chip */}
        <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-brand-900/60 text-brand-600 font-medium border border-brand-800/30">
          {item.category}
        </span>

        {/* Name */}
        <h3 className="font-display text-brand-100 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-brand-700 text-[11px] leading-relaxed line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Price + Add to cart */}
        <div className="flex items-end justify-between gap-1 mt-auto pt-1">
          <div>
            <span className="font-mono font-bold text-brand-200 text-base leading-none">
              {formatPrice(finalPrice)}
            </span>
            {item.offer_percent > 0 && (
              <span className="block text-[10px] text-brand-800 line-through mt-0.5">
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          <button
            onClick={e => { e.stopPropagation(); onAddToCart() }}
            disabled={!item.available}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm',
              inCart
                ? 'bg-green-900/40 text-green-300 border border-green-800/40'
                : 'bg-brand-500 hover:bg-brand-400 active:scale-95 text-surface shadow-brand-900/40',
              !item.available && 'opacity-40 pointer-events-none'
            )}
          >
            {inCart
              ? <><CheckCircle size={12} /> Added</>
              : <><ShoppingCart size={12} /> Add</>
            }
          </button>
        </div>

        {/* Reviews */}
        <ProductReview
          menuItemId={item.id}
          userId={userId}
          onLoginRequired={onLoginRequired}
        />
      </div>
    </div>
  )
}