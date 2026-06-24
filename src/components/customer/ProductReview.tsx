import { useState, useEffect, useId } from 'react'
import { Star, X, Loader2, Send, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProductReviewProps {
  menuItemId:      string
  userId:          string | null
  onLoginRequired: () => void
  starsOnly?:      boolean  // card mode: show stars only, no text click handler
}

interface ItemReview {
  id: string; user_id: string; menu_item_id: string
  stars: number; comment: string; reviewer_name: string; created_at: string
}

const inp = 'w-full bg-surface-50 border border-brand-800/50 rounded-xl px-3 py-2.5 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 transition-all'

// ─── Partial-fill star (handles 4.3 → fills 30% of 5th star) ─
function StarFill({ fill }: { fill: number }) {
  // fill: 0–1
  const id = useId()
  const pct = Math.round(Math.max(0, Math.min(1, fill)) * 100)
  if (pct === 0)   return <Star size={11} className="text-brand-900" />
  if (pct === 100) return <Star size={11} className="text-brand-400 fill-brand-400" />
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset={`${pct}%`} stopColor="currentColor" className="text-brand-400" />
          <stop offset={`${pct}%`} stopColor="currentColor" stopOpacity="0.15" className="text-brand-900" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth="1"
        className="text-brand-400"
      />
    </svg>
  )
}

// ─── 5-star row with partial fill support ─────────────────────
function StarRow({ avg, size = 11 }: { avg: number; size?: number }) {
  return (
    <div className="flex gap-0.5 shrink-0">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, avg - i))
        return <StarFill key={i} fill={fill} />
      })}
    </div>
  )
}

// ─── Full review modal ────────────────────────────────────────
export function ReviewModal({ menuItemId, userId, reviews, loading, onClose, onLoginRequired, onRefresh }: {
  menuItemId: string; userId: string | null; reviews: ItemReview[]
  loading: boolean; onClose: () => void; onLoginRequired: () => void; onRefresh: () => void
}) {
  const [stars,      setStars]      = useState(5)
  const [hover,      setHover]      = useState(0)
  const [comment,    setComment]    = useState('')
  const [name,       setName]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { onLoginRequired(); onClose(); return }
    setSubmitting(true)
    await supabase.from('item_reviews').insert({
      menu_item_id: menuItemId, user_id: userId, stars,
      comment, reviewer_name: name.trim() || 'Anonymous',
    })
    setSubmitting(false); setSuccess(true)
    setComment(''); setName(''); setStars(5)
    onRefresh()
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface-50 border border-brand-800/40 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-900/30 shrink-0">
          <div>
            <h3 className="font-display font-bold text-brand-200 text-base">Customer Reviews</h3>
            {avg > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <StarRow avg={avg} />
                <span className="text-brand-400 text-xs font-semibold">{avg.toFixed(1)}</span>
                <span className="text-brand-700 text-xs">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-700 hover:text-brand-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-brand-700">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No reviews yet — be the first!</p>
            </div>
          ) : reviews.map(r => (
            <div key={r.id} className="p-3.5 bg-surface-100/50 border border-brand-900/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-800/50 flex items-center justify-center shrink-0">
                  <User size={14} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-brand-300 text-sm font-semibold">{r.reviewer_name}</span>
                    <StarRow avg={r.stars} />
                  </div>
                  <p className="text-brand-500 text-sm mt-1 leading-relaxed">"{r.comment}"</p>
                  <p className="text-brand-800 text-[10px] mt-1.5">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit form */}
        <div className="border-t border-brand-900/30 px-5 py-4 shrink-0 bg-surface-50">
          {success ? (
            <p className="text-center text-green-400 text-sm py-2 font-semibold">✓ Review submitted!</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-brand-500 text-xs font-semibold uppercase tracking-wide">Leave a Review</p>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp + ' text-xs py-2'} placeholder="Your name"
                  value={name} onChange={e => setName(e.target.value)} />
                {/* Interactive star picker */}
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button type="button" key={i}
                      onMouseEnter={() => setHover(i + 1)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setStars(i + 1)}
                    >
                      <Star size={20} className={`transition-colors cursor-pointer ${
                        i < (hover || stars)
                          ? 'text-brand-400 fill-brand-400'
                          : 'text-brand-800 hover:text-brand-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <textarea
                  className={inp + ' text-xs py-2 resize-none flex-1'} rows={2}
                  placeholder="Share your experience…"
                  value={comment} onChange={e => setComment(e.target.value)} required
                />
                <button type="submit" disabled={submitting || !comment}
                  className="self-end shrink-0 w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white flex items-center justify-center transition-colors">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inline compact widget ────────────────────────────────────
export function ProductReview({ menuItemId, userId, onLoginRequired, starsOnly }: ProductReviewProps) {
  const [reviews,  setReviews]  = useState<ItemReview[]>([])
  const [avg,      setAvg]      = useState<number | null>(null)
  const [count,    setCount]    = useState<number | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [fullLoad, setFullLoad] = useState(false)
  const [open,     setOpen]     = useState(false)

  // Fetch only the aggregate (avg + count) on mount — lightweight
  useEffect(() => {
    supabase
      .from('item_reviews')
      .select('stars')
      .eq('menu_item_id', menuItemId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const total = data.reduce((s: number, r: { stars: number }) => s + r.stars, 0)
          setAvg(total / data.length)
          setCount(data.length)
        } else {
          setAvg(0)
          setCount(0)
        }
      })
  }, [menuItemId])

  // Fetch full reviews only when modal opens
  const fetchFull = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('item_reviews').select('*')
      .eq('menu_item_id', menuItemId)
      .order('created_at', { ascending: false })
    if (data) {
      setReviews(data as ItemReview[])
      if (data.length > 0) {
        const total = data.reduce((s, r) => s + r.stars, 0)
        setAvg(total / data.length)
        setCount(data.length)
      }
    }
    setLoading(false)
    setFullLoad(true)
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!fullLoad) fetchFull()
    setOpen(true)
  }

  // starsOnly mode: just the stars row, no text, clicking is handled by parent card
  if (starsOnly) {
    return (
      <div className="flex items-center gap-1">
        {avg === null ? (
          <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={10} className="text-brand-900/40 animate-pulse"/>)}</div>
        ) : avg > 0 ? (
          <>
            <StarRow avg={avg} size={10} />
            <span className="text-[10px] text-brand-600 font-mono">{avg.toFixed(1)}</span>
            <span className="text-[10px] text-brand-800">({count})</span>
          </>
        ) : (
          <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={10} className="text-brand-900"/>)}</div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── Compact inline row — always shows correct avg ── */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-1.5 mt-2 pt-2 border-t border-brand-900/25 group/rev"
      >
        {/* Stars — shown immediately from lightweight fetch */}
        {avg !== null && avg > 0 ? (
          <>
            <StarRow avg={avg} />
            <span className="text-[10px] group-hover/rev:text-brand-400 transition-colors">
              <span className="text-brand-400 font-semibold">{avg.toFixed(1)}</span>
              <span className="text-brand-700 ml-0.5">({count})</span>
            </span>
          </>
        ) : avg === 0 ? (
          <>
            <div className="flex gap-0.5 shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className="text-brand-900" />
              ))}
            </div>
            <span className="text-brand-800 text-[10px] group-hover/rev:text-brand-600 transition-colors">
              Rate & Review
            </span>
          </>
        ) : (
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className="text-brand-900/50 animate-pulse" />
            ))}
          </div>
        )}
      </button>

      {open && (
        <ReviewModal
          menuItemId={menuItemId}
          userId={userId}
          reviews={reviews}
          loading={loading}
          onClose={() => setOpen(false)}
          onLoginRequired={onLoginRequired}
          onRefresh={fetchFull}
        />
      )}
    </>
  )
}