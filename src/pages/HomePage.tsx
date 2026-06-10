
import { useState, useEffect } from 'react'
import { ChefHat, Star, Clock, Award, ArrowRight, UtensilsCrossed, MessageSquarePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ReviewForm } from '@/components/customer/ReviewForm'

interface HomePageProps {
  onViewMenu: () => void
}


const features = [
  {
    icon: ChefHat,
    title: 'Expert Chefs',
    desc: 'Our team of award-winning chefs bring decades of fine dining experience to every plate.',
  },
  {
    icon: Star,
    title: 'Premium Ingredients',
    desc: 'We source only the finest seasonal ingredients from local farms and trusted suppliers.',
  },
  {
    icon: Clock,
    title: 'Fresh Daily',
    desc: 'Every dish is prepared fresh to order. No shortcuts, no reheating — ever.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    desc: 'Recognised by the Michelin Guide and named Best Fine Dining restaurant 3 years running.',
  },
]

interface Review {
  id: string
  name: string
  profession: string | null
  comment: string
  stars: number
  created_at: string
}

export function HomePage({ onViewMenu }: HomePageProps) {
  const [reviews, setReviews]       = useState<Review[]>([])
  const [showForm, setShowForm]     = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const fetchReviews = async () => {
    setReviewsLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setReviews(data as Review[])
    setReviewsLoading(false)
  }

  useEffect(() => { fetchReviews() }, [])

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-700/40 bg-brand-900/30 text-brand-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <UtensilsCrossed size={12} />
            Fine Dining · Est. 2024
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-brand-200 leading-tight mb-6">
            A Table for Every
            <span className="text-brand-400"> Occasion</span>
          </h1>

          <p className="text-brand-600 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
            La Maison blends classical French technique with bold seasonal flavours.
            Every dish is a love letter to the art of cooking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onViewMenu}
              className="btn-primary px-7 py-3 text-base gap-2 rounded-full shadow-lg shadow-brand-900/50"
            >
              Explore Our Menu <ArrowRight size={16} />
            </button>
            
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-300 mb-3">
              Why Guests Love Us
            </h2>
            <p className="text-brand-700 text-sm max-w-md mx-auto">
              From the first bite to the final sip, we make every moment count.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="card-glass rounded-2xl p-6 flex flex-col gap-4 hover:border-brand-700/50 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-600/15 border border-brand-700/30 flex items-center justify-center">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-brand-200 mb-1">{title}</h3>
                  <p className="text-brand-700 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guest Reviews ── */}
      <section id="reviews-section" className="py-20 px-4 sm:px-6 bg-surface-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-300 mb-3">
              What Our Guests Say
            </h2>
            <p className="text-brand-700 text-sm mb-6">
              Real stories from the people who matter most — our diners.
            </p>
            <button
              onClick={() => setShowForm(f => !f)}
              className="btn-outline gap-2 rounded-full"
            >
              <MessageSquarePlus size={15} />
              {showForm ? 'Hide Form' : 'Leave a Review'}
            </button>
          </div>

          {/* Review form */}
          {showForm && (
            <div className="max-w-lg mx-auto mb-10 animate-fade-up">
              <ReviewForm onSuccess={() => { fetchReviews(); setShowForm(false) }} />
            </div>
          )}

          {/* Reviews grid */}
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-brand-700">
              <p className="text-4xl mb-3">✨</p>
              <p className="font-display text-lg text-brand-500">Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map(review => (
                <div key={review.id} className="card-glass rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < review.stars ? 'text-brand-400 fill-brand-400' : 'text-brand-800'}
                      />
                    ))}
                  </div>
                  <p className="text-brand-500 text-sm leading-relaxed italic flex-1">"{review.comment}"</p>
                  <div>
                    <p className="text-brand-200 text-sm font-semibold">{review.name}</p>
                    {review.profession && (
                      <p className="text-brand-700 text-xs">{review.profession}</p>
                    )}
                    <p className="text-brand-900 text-[10px] mt-0.5">
                      {new Date(review.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass rounded-3xl p-10 sm:p-14 border-brand-700/40 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-brand-600/8 blur-2xl" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-200 mb-4 relative">
              Ready to Order?
            </h2>
            <p className="text-brand-600 mb-8 relative">
              Browse our seasonal menu and add your favourites to the cart.
            </p>
            <button
              onClick={onViewMenu}
              className="btn-primary px-8 py-3 text-base rounded-full shadow-lg shadow-brand-950/60 relative"
            >
              View Full Menu <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
