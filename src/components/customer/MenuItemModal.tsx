import { useState, useEffect, useRef } from 'react'
import {
  X, ShoppingCart, CheckCircle, Tag, Star,
  ZoomIn, ZoomOut, Heart, Share2,
  MessageSquare, Send, Loader2, User,
} from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useProductShare } from '@/hooks/useProductShare'
import type { MenuItem } from '@/types'

interface MenuItemModalProps {
  item:            MenuItem
  inCart:          boolean
  inWishlist:      boolean
  userId:          string | null
  onAddToCart:     () => void
  onToggleWish:    () => void
  onLoginRequired: () => void
  onClose:         () => void
}

interface ItemReview {
  id: string; user_id: string; menu_item_id: string
  stars: number; comment: string; reviewer_name: string; created_at: string
}

const inp = 'w-full bg-surface-100/60 border border-brand-800/50 rounded-xl px-3 py-2.5 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 transition-all'

// ─── Image Zoom Overlay ───────────────────────────────────────
function ImageZoom({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [pos,   setPos]   = useState({ x: 0, y: 0 })
  const [drag,  setDrag]  = useState<{ x: number; y: number } | null>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  const zoom = (delta: number) =>
    setScale(s => Math.max(1, Math.min(4, s + delta)))

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoom(e.deltaY < 0 ? 0.3 : -0.3)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drag) return
    setPos({ x: e.clientX - drag.x, y: e.clientY - drag.y })
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col" onClick={onClose}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <p className="text-white/60 text-xs">{alt} · {Math.round(scale * 100)}%</p>
        <div className="flex items-center gap-2">
          <button onClick={() => zoom(-0.5)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><ZoomOut size={14} /></button>
          <button onClick={() => zoom(0.5)}  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><ZoomIn  size={14} /></button>
          <button onClick={() => { setScale(1); setPos({ x: 0, y: 0 }) }} className="px-3 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors">Reset</button>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><X size={14} /></button>
        </div>
      </div>

      {/* Image */}
      <div
        ref={imgRef}
        className="flex-1 overflow-hidden flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDrag(null)}
        style={{ cursor: scale > 1 ? (drag ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <img
          src={src} alt={alt}
          draggable={false}
          style={{
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: drag ? 'none' : 'transform 0.2s ease',
            maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain',
          }}
          onClick={() => scale === 1 ? zoom(1) : undefined}
        />
      </div>
      <p className="text-white/30 text-[10px] text-center py-2 shrink-0">Scroll or pinch to zoom · Drag to pan</p>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────
export function MenuItemModal({
  item, inCart, inWishlist, userId,
  onAddToCart, onToggleWish, onLoginRequired, onClose,
}: MenuItemModalProps) {
  const finalPrice  = discountedPrice(item.price, item.offer_percent)
  const hasImage    = isValidUrl(item.image_url)
  const { share }   = useProductShare()

  const [avg,          setAvg]          = useState(0)
  const [count,        setCount]        = useState(0)
  const [reviews,      setReviews]      = useState<ItemReview[]>([])
  const [showReviews,  setShowReviews]  = useState(false)
  const [reviewsLoaded,setReviewsLoaded]= useState(false)
  const [showZoom,     setShowZoom]     = useState(false)
  const [copied,       setCopied]       = useState(false)

  // Star-rate state (quick rate from modal, no comment)
  const [rateHover,    setRateHover]    = useState(0)
  const [rateValue,    setRateValue]    = useState(0)
  const [rateSaving,   setRateSaving]   = useState(false)
  const [rateSubmitted,setRateSubmitted]= useState(false)

  // Comment form
  const [comment,      setComment]      = useState('')
  const [commName,     setCommName]     = useState('')
  const [commSaving,   setCommSaving]   = useState(false)
  const [commDone,     setCommDone]     = useState(false)

  useEffect(() => {
    supabase.from('item_reviews').select('stars').eq('menu_item_id', item.id)
      .then(({ data }) => {
        if (data?.length) {
          setAvg(data.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / data.length)
          setCount(data.length)
        }
      })
  }, [item.id])

  const loadReviews = async () => {
    if (reviewsLoaded) { setShowReviews(true); return }
    const { data } = await supabase.from('item_reviews').select('*')
      .eq('menu_item_id', item.id).order('created_at', { ascending: false })
    if (data) { setReviews(data as ItemReview[]); setReviewsLoaded(true) }
    setShowReviews(true)
  }

  const refreshAvg = async () => {
    const { data } = await supabase.from('item_reviews').select('stars').eq('menu_item_id', item.id)
    if (data?.length) {
      setAvg(data.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / data.length)
      setCount(data.length)
    }
  }

  const handleRate = async (stars: number) => {
    if (!userId) { onLoginRequired(); return }
    if (rateSubmitted || rateSaving) return
    setRateValue(stars); setRateSaving(true)
    await supabase.from('item_reviews').insert({
      menu_item_id: item.id, user_id: userId, stars,
      comment: '', reviewer_name: 'Anonymous',
    })
    await refreshAvg()
    setRateSaving(false); setRateSubmitted(true)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { onLoginRequired(); return }
    setCommSaving(true)
    await supabase.from('item_reviews').insert({
      menu_item_id: item.id, user_id: userId,
      stars: rateValue || 5,
      comment, reviewer_name: commName.trim() || 'Anonymous',
    })
    await refreshAvg()
    setCommSaving(false); setCommDone(true)
    setComment(''); setCommName('')
  }

  const handleShare = async (platform: 'link' | 'whatsapp' | 'facebook' | 'twitter' | 'instagram') => {
    await share(item, platform === 'instagram' ? 'link' : platform, userId)
    if (platform === 'link' || platform === 'instagram') {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    }
  }

  const SHARE_BTNS = [
    { id: 'whatsapp'  as const, label: 'WhatsApp',  emoji: '💬', cls: 'bg-[#25D366]/15 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/25' },
    { id: 'facebook'  as const, label: 'Facebook',  emoji: '👍', cls: 'bg-[#1877F2]/15 border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2]/25' },
    { id: 'instagram' as const, label: 'Instagram', emoji: '📸', cls: 'bg-[#E1306C]/15 border-[#E1306C]/40 text-[#E1306C] hover:bg-[#E1306C]/25' },
    { id: 'twitter'   as const, label: 'X',         emoji: '🐦', cls: 'bg-surface-100/60 border-brand-800/40 text-brand-400 hover:bg-brand-800/40' },
    { id: 'link'      as const, label: copied ? 'Copied!' : 'Copy', emoji: copied ? '✓' : '🔗', cls: 'bg-surface-100/60 border-brand-800/40 text-brand-400 hover:bg-brand-800/40' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg bg-surface-50 rounded-3xl border border-brand-800/40 shadow-2xl pointer-events-auto animate-fade-up overflow-hidden max-h-[94vh] flex flex-col">

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-brand-300 hover:text-white hover:bg-black/70 transition-all">
            <X size={16} />
          </button>

          {/* Offer badge */}
          {item.offer_percent > 0 && (
            <span className="absolute top-4 left-4 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Tag size={10} /> -{item.offer_percent}% OFF
            </span>
          )}

          {/* ── Hero image + Zoom button ── */}
          <div className="relative h-64 sm:h-72 w-full bg-surface-100 flex items-center justify-center overflow-hidden shrink-0">
            {hasImage ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-9xl select-none">{item.image_url || '🍽️'}</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-surface-50 to-transparent" />

            {/* Zoom icon */}
            {hasImage && (
              <button
                onClick={() => setShowZoom(true)}
                className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all"
                title="Zoom image"
              >
                <ZoomIn size={15} />
              </button>
            )}

            {/* Wish button */}
            <button
              onClick={() => userId ? onToggleWish() : onLoginRequired()}
              className={cn(
                'absolute top-4 right-14 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg',
                inWishlist ? 'bg-red-500 text-white' : 'bg-black/50 backdrop-blur-sm text-brand-300 hover:bg-red-500 hover:text-white'
              )}
            >
              <Heart size={14} className={inWishlist ? 'fill-white' : ''} />
            </button>
          </div>

          {/* ── Scrollable content ── */}
          <div className="overflow-y-auto flex-1 px-6 pb-6 -mt-4 relative">

            {/* Category */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-800/40 border border-brand-700/30 text-brand-400 text-[11px] font-semibold uppercase tracking-wider mb-3">
              {item.category}
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-100 mb-2 leading-tight">
              {item.name}
            </h2>

            <p className="text-brand-500 text-sm leading-relaxed mb-5">
              {item.description || 'A signature dish crafted with care and the finest ingredients.'}
            </p>

            {/* ── Average stars display ── */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14}
                    className={i < Math.round(avg) ? 'text-brand-400 fill-brand-400' : 'text-brand-800'} />
                ))}
              </div>
              {count > 0 ? (
                <span className="text-brand-500 text-xs">
                  <span className="text-brand-300 font-semibold">{avg.toFixed(1)}</span> ({count} review{count !== 1 ? 's' : ''})
                </span>
              ) : (
                <span className="text-brand-700 text-xs">No reviews yet</span>
              )}
            </div>

            {/* ── Quick star rate (just stars, no text) ── */}
            <div className="flex items-center gap-2 mb-5 p-3 bg-surface-100/40 rounded-xl border border-brand-900/20">
              <span className="text-brand-600 text-xs shrink-0">Rate this dish:</span>
              <div className="flex gap-1" onMouseLeave={() => { if (!rateSubmitted) setRateHover(0) }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button"
                    onMouseEnter={() => { if (!rateSubmitted) setRateHover(i + 1) }}
                    onClick={() => handleRate(i + 1)}
                    disabled={rateSubmitted || rateSaving}
                  >
                    <Star size={20} className={cn(
                      'transition-all cursor-pointer',
                      i < (rateHover || rateValue || (rateSubmitted ? rateValue : 0))
                        ? 'text-brand-400 fill-brand-400 scale-110'
                        : 'text-brand-800 hover:text-brand-600'
                    )} />
                  </button>
                ))}
              </div>
              {rateSaving  && <span className="text-brand-600 text-xs">Saving…</span>}
              {rateSubmitted && <span className="text-green-400 text-xs font-semibold">✓ Rated!</span>}
              <button onClick={loadReviews}
                className="ml-auto text-brand-700 hover:text-brand-400 text-xs flex items-center gap-1 transition-colors">
                <MessageSquare size={11} /> {count > 0 ? `See all ${count}` : 'Reviews'}
              </button>
            </div>

            {/* ── Comment form ── */}
            {!commDone ? (
              <form onSubmit={handleComment} className="mb-5 space-y-2">
                <p className="text-brand-600 text-xs font-semibold">Leave a comment (optional)</p>
                <div className="flex gap-2">
                  <input className={inp + ' text-xs py-2 flex-1'} placeholder="Your name"
                    value={commName} onChange={e => setCommName(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <textarea className={inp + ' text-xs py-2 resize-none flex-1'} rows={2}
                    placeholder="Tell us what you think…"
                    value={comment} onChange={e => setComment(e.target.value)} required />
                  <button type="submit" disabled={commSaving || !comment}
                    className="self-end w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors">
                    {commSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-green-400 text-xs font-semibold mb-5">✓ Comment submitted — thank you!</p>
            )}

            {/* ── Share row ── */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <Share2 size={12} className="text-brand-700 shrink-0" />
              <span className="text-brand-700 text-xs shrink-0">Share:</span>
              {SHARE_BTNS.map(btn => (
                <button key={btn.id} onClick={() => handleShare(btn.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${btn.cls}`}>
                  <span>{btn.emoji}</span> {btn.label}
                </button>
              ))}
            </div>

            {/* ── Price + CTA ── */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-mono font-bold text-brand-200 text-3xl">{formatPrice(finalPrice)}</div>
                {item.offer_percent > 0 && (
                  <div className="text-brand-800 text-sm line-through font-mono">{formatPrice(item.price)}</div>
                )}
              </div>
              <button onClick={() => { onAddToCart(); onClose() }} disabled={!item.available}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  inCart ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                    : 'bg-brand-500 hover:bg-brand-400 active:scale-95 text-surface shadow-lg shadow-brand-900/50',
                  !item.available && 'opacity-40 pointer-events-none'
                )}>
                {inCart ? <><CheckCircle size={15} /> In Cart</> : <><ShoppingCart size={15} /> Add to Cart</>}
              </button>
            </div>

            {!item.available && (
              <p className="text-red-400 text-xs mt-3 text-center">This item is currently unavailable</p>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen reviews list */}
      {showReviews && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowReviews(false)} />
          <div className="relative w-full sm:max-w-md bg-surface-50 border border-brand-800/40 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col animate-fade-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-900/30 shrink-0">
              <h3 className="font-display font-bold text-brand-200">All Reviews</h3>
              <button onClick={() => setShowReviews(false)} className="p-1.5 rounded-lg text-brand-700 hover:text-brand-300 transition-colors"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {reviews.length === 0
                ? <p className="text-center text-brand-700 py-8">No reviews yet.</p>
                : reviews.map(r => (
                  <div key={r.id} className="p-3.5 bg-surface-100/50 border border-brand-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-800/50 flex items-center justify-center shrink-0">
                        <User size={14} className="text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-brand-300 text-sm font-semibold">{r.reviewer_name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({length:5}).map((_,i)=><Star key={i} size={10} className={i<r.stars?'text-brand-400 fill-brand-400':'text-brand-800'} />)}
                          </div>
                        </div>
                        {r.comment && <p className="text-brand-500 text-sm mt-1">"{r.comment}"</p>}
                        <p className="text-brand-800 text-[10px] mt-1">{new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Full-screen image zoom */}
      {showZoom && hasImage && (
        <ImageZoom src={item.image_url} alt={item.name} onClose={() => setShowZoom(false)} />
      )}
    </>
  )
}