import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Banner {
  id: string
  title: string
  subtitle: string
  cta_label: string
  image_url: string
  bg_color: string
  sort_order: number
  active: boolean
}

interface HeroCarouselProps {
  onViewMenu: () => void
}

export function HeroCarousel({ onViewMenu }: HeroCarouselProps) {
  const [banners, setBanners]     = useState<Banner[]>([])
  const [current, setCurrent]     = useState(0)
  const [loading, setLoading]     = useState(true)
  const [paused, setPaused]       = useState(false)
  const [animDir, setAnimDir]     = useState<'left' | 'right'>('left')
  const [visible, setVisible]     = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('active', true)
      .order('sort_order')
    if (data && data.length > 0) setBanners(data as Banner[])
    setLoading(false)
  }

  const go = useCallback((dir: 'prev' | 'next') => {
    if (banners.length <= 1) return
    setAnimDir(dir === 'next' ? 'left' : 'right')
    setVisible(false)
    setTimeout(() => {
      setCurrent(c =>
        dir === 'next'
          ? (c + 1) % banners.length
          : (c - 1 + banners.length) % banners.length
      )
      setVisible(true)
    }, 280)
  }, [banners.length])

  useEffect(() => {
    if (paused || banners.length <= 1) return
    timerRef.current = setInterval(() => go('next'), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, go, banners.length])

  // Fallback static hero when no banners loaded
  if (loading) {
    return (
      <section className="relative min-h-[88vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </section>
    )
  }

  if (banners.length === 0) {
    return (
      <section className="relative min-h-[88vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-700/40 bg-brand-900/30 text-brand-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <UtensilsCrossed size={12} />
            Fine Dining · Est. 2024
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold text-brand-200 leading-tight mb-6">
            A Table for Every<span className="text-brand-400"> Occasion</span>
          </h1>
          <p className="text-brand-600 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
            La Maison blends classical French technique with bold seasonal flavours.
          </p>
          <button onClick={onViewMenu} className="btn-primary px-7 py-3 text-base gap-2 rounded-full shadow-lg shadow-brand-900/50">
            Explore Our Menu <ArrowRight size={16} />
          </button>
        </div>
      </section>
    )
  }

  const banner = banners[current]

  return (
    <section
      className="relative min-h-[88vh] flex items-center justify-center text-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${banner.image_url})` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${banner.bg_color}cc 0%, ${banner.bg_color}ee 60%, ${banner.bg_color} 100%)` }}
        />
      </div>

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div
        className="relative z-10 max-w-3xl mx-auto px-4 transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'translateX(0)'
            : animDir === 'left' ? 'translateX(-30px)' : 'translateX(30px)',
        }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-700/40 bg-brand-900/40 text-brand-400 text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
          <UtensilsCrossed size={12} />
          Fine Dining · Est. 2024
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-brand-200 leading-tight mb-6 drop-shadow-lg">
          {banner.title.split(' ').map((word, i, arr) =>
            i === arr.length - 1
              ? <span key={i} className="text-brand-400"> {word}</span>
              : <span key={i}>{word} </span>
          )}
        </h1>

        <p className="text-brand-300/90 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10 drop-shadow">
          {banner.subtitle}
        </p>

        <button
          onClick={onViewMenu}
          className="btn-primary px-7 py-3 text-base gap-2 rounded-full shadow-lg shadow-brand-900/60"
        >
          {banner.cta_label} <ArrowRight size={16} />
        </button>
      </div>

      {/* Prev / Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => go('prev')}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 hover:bg-brand-700/60 hover:text-brand-100 transition-all flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go('next')}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 hover:bg-brand-700/60 hover:text-brand-100 transition-all flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAnimDir(i > current ? 'left' : 'right')
                setVisible(false)
                setTimeout(() => { setCurrent(i); setVisible(true) }, 280)
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-brand-400'
                  : 'w-2 bg-brand-700 hover:bg-brand-500'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}