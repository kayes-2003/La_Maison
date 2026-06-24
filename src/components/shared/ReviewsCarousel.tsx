import { useState, useEffect, useRef, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Review {
  id: string; name: string; profession: string | null
  comment: string; stars: number; created_at: string
}

export function ReviewsCarousel() {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [current, setCurrent]   = useState(0)
  const [paused,  setPaused]    = useState(false)
  const [visible, setVisible]   = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setReviews(data as Review[]) })
  }, [])

  const PER_PAGE = 3
  const pages    = Math.ceil(reviews.length / PER_PAGE)

  const go = useCallback((dir: 'next' | 'prev') => {
    if (pages <= 1) return
    setVisible(false)
    setTimeout(() => {
      setCurrent(c => dir === 'next' ? (c + 1) % pages : (c - 1 + pages) % pages)
      setVisible(true)
    }, 250)
  }, [pages])

  useEffect(() => {
    if (paused || pages <= 1) return
    timerRef.current = setInterval(() => go('next'), 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [go, paused, pages])

  const slice = reviews.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE)

  if (!reviews.length) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 transition-all duration-250"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
      >
        {slice.map((r, i) => (
          <div
            key={r.id}
            className="card-glass rounded-2xl p-6 flex flex-col gap-4 border-brand-800/30 hover:border-brand-700/50 transition-all duration-300 relative overflow-hidden group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Quote icon bg */}
            <Quote size={48} className="absolute -top-2 -right-2 text-brand-900/30 group-hover:text-brand-800/40 transition-colors" />

            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={14} className={j < r.stars ? 'text-brand-400 fill-brand-400' : 'text-brand-800'} />
              ))}
            </div>

            {/* Comment */}
            <p className="text-brand-500 text-sm leading-relaxed flex-1 relative">
              "{r.comment}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600/30 to-brand-800/30 border border-brand-700/30 flex items-center justify-center shrink-0">
                <span className="text-brand-400 font-display font-bold text-sm">
                  {r.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-brand-200 text-sm font-semibold">{r.name}</p>
                {r.profession && <p className="text-brand-700 text-xs">{r.profession}</p>}
              </div>
              <p className="ml-auto text-brand-900 text-[10px]">
                {new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        ))}

        {/* Empty slots to keep grid stable */}
        {slice.length < PER_PAGE && Array.from({ length: PER_PAGE - slice.length }).map((_, i) => (
          <div key={`empty-${i}`} className="hidden md:block" />
        ))}
      </div>

      {/* Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => go('prev')}
            className="w-9 h-9 rounded-full border border-brand-800/40 text-brand-600 hover:border-brand-600/60 hover:text-brand-300 flex items-center justify-center transition-all">
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => {
                setVisible(false)
                setTimeout(() => { setCurrent(i); setVisible(true) }, 250)
              }}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-brand-400' : 'w-2 h-2 bg-brand-800 hover:bg-brand-600'}`}
              />
            ))}
          </div>

          <button onClick={() => go('next')}
            className="w-9 h-9 rounded-full border border-brand-800/40 text-brand-600 hover:border-brand-600/60 hover:text-brand-300 flex items-center justify-center transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Page indicator */}
      <p className="text-center text-brand-800 text-xs mt-3">
        {current * PER_PAGE + 1}–{Math.min((current + 1) * PER_PAGE, reviews.length)} of {reviews.length} reviews
      </p>
    </div>
  )
}