import { useState } from 'react'
import { ChefHat, Star, Clock, Award, ArrowRight, MessageSquarePlus } from 'lucide-react'
import { HeroCarousel }     from '@/components/customer/HeroCarousel'
import { ReviewsCarousel }  from '@/components/shared/ReviewsCarousel'
import { TrustedBrands }    from '@/components/shared/TrustedBrands'
import { AwardsSection }    from '@/components/shared/AwardsSection'
import { ReviewForm }       from '@/components/customer/ReviewForm'

interface HomePageProps { onViewMenu: () => void }

const features = [
  { icon: ChefHat, title: 'Expert Chefs',         desc: 'Award-winning chefs bring decades of fine dining mastery to every plate.' },
  { icon: Star,    title: 'Premium Ingredients',  desc: 'Only the finest seasonal ingredients from local farms and trusted suppliers.' },
  { icon: Clock,   title: 'Fresh Daily',           desc: 'Every dish prepared fresh to order. No shortcuts, no reheating — ever.' },
  { icon: Award,   title: 'Award Winning',         desc: 'Recognised by the Michelin Guide. Best Fine Dining restaurant 3 years running.' },
]

export function HomePage({ onViewMenu }: HomePageProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <HeroCarousel onViewMenu={onViewMenu} />

      {/* ── Features ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-300 mb-3">Why Guests Love Us</h2>
            <p className="text-brand-700 text-sm max-w-md mx-auto">From the first bite to the final sip, we make every moment count.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-glass rounded-2xl p-6 flex flex-col gap-4 hover:border-brand-700/50 transition-all duration-300">
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

      {/* ── What Our Guests Say (Carousel) ── */}
      <section id="reviews-section" className="py-20 px-4 sm:px-6 bg-surface-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.25em] mb-3">Real Stories</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-300 mb-3">What Our Guests Say</h2>
            <p className="text-brand-700 text-sm mb-6">Honest words from the people who matter most — our diners.</p>
            <button
              onClick={() => setShowForm(f => !f)}
              className="btn-outline gap-2 rounded-full inline-flex items-center"
            >
              <MessageSquarePlus size={15} />
              {showForm ? 'Hide Form' : 'Leave a Review'}
            </button>
          </div>

          {showForm && (
            <div className="max-w-lg mx-auto mb-12 animate-fade-up">
              <ReviewForm onSuccess={() => setShowForm(false)} />
            </div>
          )}

          <ReviewsCarousel />
        </div>
      </section>

      {/* ── Trusted Brands Marquee ── */}
      <TrustedBrands />

      {/* ── Awards ── */}
      <AwardsSection />

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass rounded-3xl p-10 sm:p-14 border-brand-700/40 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-brand-600/8 blur-2xl" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-200 mb-4 relative">Ready to Order?</h2>
            <p className="text-brand-600 mb-8 relative">Browse our seasonal menu and add your favourites to the cart.</p>
            <button onClick={onViewMenu} className="btn-primary px-8 py-3 text-base rounded-full shadow-lg shadow-brand-950/60 relative gap-2 inline-flex items-center">
              View Full Menu <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}