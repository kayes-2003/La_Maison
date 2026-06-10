
import { X, ShoppingCart, CheckCircle, Tag, Star } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface MenuItemModalProps {
  item: MenuItem
  inCart: boolean
  onAddToCart: () => void
  onClose: () => void
}

export function MenuItemModal({ item, inCart, onAddToCart, onClose }: MenuItemModalProps) {
  const finalPrice = discountedPrice(item.price, item.offer_percent)
  const hasImage = isValidUrl(item.image_url)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg bg-surface-50 rounded-3xl border border-brand-800/40 shadow-2xl pointer-events-auto animate-fade-up overflow-hidden">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-brand-300 hover:text-white hover:bg-black/70 transition-all"
          >
            <X size={16} />
          </button>

          {/* Offer badge */}
          {item.offer_percent > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full font-mono flex items-center gap-1">
              <Tag size={10} />
              -{item.offer_percent}% OFF
            </span>
          )}

          {/* Image / Emoji hero */}
          <div className="relative h-64 sm:h-80 w-full bg-surface-100 flex items-center justify-center overflow-hidden">
            {hasImage ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-9xl select-none">{item.image_url || '🍽️'}</span>
            )}
            {/* gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-50 to-transparent" />
          </div>

          {/* Content */}
          <div className="px-6 pb-6 -mt-4 relative">
            {/* Category pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-800/40 border border-brand-700/30 text-brand-400 text-[11px] font-semibold uppercase tracking-wider mb-3">
              {item.category}
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-100 mb-2 leading-tight">
              {item.name}
            </h2>

            <p className="text-brand-500 text-sm leading-relaxed mb-5">
              {item.description || 'A signature dish crafted with care and the finest ingredients.'}
            </p>

            {/* Stars decoration */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="text-brand-500 fill-brand-500" />
              ))}
              <span className="text-brand-700 text-[11px] ml-1">Chef's favourite</span>
            </div>

            {/* Price + CTA row */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-mono font-bold text-brand-200 text-3xl">
                  {formatPrice(finalPrice)}
                </div>
                {item.offer_percent > 0 && (
                  <div className="text-brand-800 text-sm line-through font-mono">
                    {formatPrice(item.price)}
                  </div>
                )}
              </div>

              <button
                onClick={() => { onAddToCart(); onClose() }}
                disabled={!item.available}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  inCart
                    ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                    : 'bg-brand-500 hover:bg-brand-400 active:scale-95 text-surface shadow-lg shadow-brand-900/50',
                  !item.available && 'opacity-40 pointer-events-none'
                )}
              >
                {inCart ? (
                  <><CheckCircle size={15} /> Already in Cart</>
                ) : (
                  <><ShoppingCart size={15} /> Add to Cart</>
                )}
              </button>
            </div>

            {!item.available && (
              <p className="text-red-400 text-xs mt-3 text-center">This item is currently unavailable</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
