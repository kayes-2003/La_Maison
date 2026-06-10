import { useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReviewFormProps {
  onSuccess: () => void
}

export function ReviewForm({ onSuccess }: ReviewFormProps) {
  const [stars,      setStars]      = useState(5)
  const [hovered,    setHovered]    = useState(0)
  const [name,       setName]       = useState('')
  const [profession, setProfession] = useState('')
  const [comment,    setComment]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim())    { setError('Please enter your name.'); return }
    if (!comment.trim()) { setError('Please write a comment.'); return }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.from('reviews').insert({
      name:       name.trim(),
      profession: profession.trim() || null,
      comment:    comment.trim(),
      stars,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    onSuccess()
  }

  return (
    <div className="card-glass rounded-2xl p-6 flex flex-col gap-5">
      <h3 className="font-display text-lg font-semibold text-brand-200">Share Your Experience</h3>

      {/* Star selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-brand-600 text-xs font-medium uppercase tracking-wide">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(n)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={26}
                className={
                  n <= (hovered || stars)
                    ? 'text-brand-400 fill-brand-400'
                    : 'text-brand-800'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-brand-600 text-xs font-medium uppercase tracking-wide">
          Name <span className="text-brand-500">*</span>
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your full name"
          className="input-field rounded-xl py-2.5"
          maxLength={80}
        />
      </div>

      {/* Profession */}
      <div className="flex flex-col gap-1.5">
        <label className="text-brand-600 text-xs font-medium uppercase tracking-wide">
          Profession <span className="text-brand-800 font-normal">(optional)</span>
        </label>
        <input
          value={profession}
          onChange={e => setProfession(e.target.value)}
          placeholder="e.g. Food Blogger, Chef, Doctor…"
          className="input-field rounded-xl py-2.5"
          maxLength={80}
        />
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <label className="text-brand-600 text-xs font-medium uppercase tracking-wide">
          Comment <span className="text-brand-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Tell us about your dining experience…"
          rows={4}
          className="input-field rounded-xl py-2.5 resize-none"
          maxLength={500}
        />
        <p className="text-brand-800 text-xs text-right">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary rounded-xl py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}
