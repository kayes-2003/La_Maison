import { useState, useEffect } from 'react'
import { Star, MessageSquarePlus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProductReviewProps {
  menuItemId: string
  userId: string | null
  onLoginRequired: () => void
}

interface ItemReview {
  id: string
  user_id: string
  menu_item_id: string
  stars: number
  comment: string
  reviewer_name: string
  created_at: string
}

const inp = 'w-full bg-surface-100 border border-brand-800/50 rounded-xl px-3.5 py-2.5 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all'

export function ProductReview({ menuItemId, userId, onLoginRequired }: ProductReviewProps) {
  const [reviews, setReviews]   = useState<ItemReview[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [stars, setStars]     = useState(5)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName]       = useState('')
  const [success, setSuccess] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('item_reviews')
      .select('*')
      .eq('menu_item_id', menuItemId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setReviews(data as ItemReview[])
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [menuItemId])

  const avgStars = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { onLoginRequired(); return }
    setSubmitting(true)
    await supabase.from('item_reviews').insert({
      menu_item_id: menuItemId,
      user_id: userId,
      stars,
      comment,
      reviewer_name: name || 'Anonymous',
    })
    setSubmitting(false)
    setSuccess(true)
    setComment('')
    setName('')
    setStars(5)
    setShowForm(false)
    setTimeout(() => setSuccess(false), 2500)
    fetchReviews()
  }

  return (
    <div className="mt-3 pt-3 border-t border-brand-900/30">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < Math.round(Number(avgStars) || 0)
                ? 'text-brand-400 fill-brand-400' : 'text-brand-800'} />
            ))}
          </div>
          <span className="text-brand-700 text-[11px]">
            {avgStars ? `${avgStars} (${reviews.length})` : 'No reviews yet'}
          </span>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); if (!userId) onLoginRequired() }}
          className="flex items-center gap-1 text-brand-600 hover:text-brand-400 text-[11px] transition-colors"
        >
          <MessageSquarePlus size={11} />
          Review
        </button>
      </div>

      {/* Success flash */}
      {success && (
        <p className="text-green-400 text-xs mb-2 animate-fade-up">✓ Review submitted!</p>
      )}

      {/* Review form */}
      {showForm && userId && (
        <form onSubmit={handleSubmit} className="space-y-2 mb-3 p-3 bg-surface-100/40 border border-brand-800/30 rounded-xl animate-fade-up">
          <div>
            <label className="label text-[11px]">Your name</label>
            <input className={inp + ' py-2 text-xs'} placeholder="Anonymous"
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          {/* Star picker */}
          <div>
            <label className="label text-[11px]">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onMouseEnter={() => setHover(i + 1)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setStars(i + 1)}
                  className="p-0.5"
                >
                  <Star
                    size={16}
                    className={`transition-colors ${
                      i < (hover || stars)
                        ? 'text-brand-400 fill-brand-400'
                        : 'text-brand-800'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label text-[11px]">Comment</label>
            <textarea
              className={inp + ' py-2 text-xs resize-none'}
              rows={2}
              placeholder="Share your experience…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !comment}
            className="btn-primary w-full py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? <><Loader2 size={11} className="animate-spin" />Submitting…</> : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {reviews.map(r => (
            <div key={r.id} className="text-xs text-brand-600 border-l-2 border-brand-800/40 pl-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={9} className={i < r.stars ? 'text-brand-400 fill-brand-400' : 'text-brand-800'} />
                  ))}
                </div>
                <span className="text-brand-400 font-medium">{r.reviewer_name}</span>
              </div>
              <p className="text-brand-700 italic">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}