import { ChefHat, MapPin, Phone, Mail, Clock, Heart, Leaf, Users } from 'lucide-react'

const team = [
  {
    name: 'Chef Étienne Moreau',
    role: 'Head Chef & Founder',
    bio: 'Trained in Paris under Joël Robuchon, Étienne brings 30 years of passion and precision to every dish.',
    initials: 'ÉM',
  },
  {
    name: 'Chef Amélie Rousseau',
    role: 'Pastry Chef',
    bio: "'Amélie's desserts are the talk of the city — each one a miniature work of art you\'ll want to savour slowly.'",
    initials: 'AR',
  },
  {
    name: 'Chef Luca Ferrara',
    role: 'Sous Chef',
    bio: 'Luca brings Italian warmth to our kitchen, specialising in house-made pastas and bold Mediterranean flavours.',
    initials: 'LF',
  },
]

const values = [
  {
    icon: Heart,
    title: 'Passion First',
    desc: 'We cook because we love food — it\'s that simple. Every plate leaves our kitchen with care.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    desc: 'Seasonal menus, local suppliers, and zero food waste programmes are at the core of how we operate.',
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'La Maison gives back — from supporting local farms to mentoring aspiring chefs in our community.',
  },
]

const hours = [
  { day: 'Monday – Thursday', time: '12:00 – 22:00' },
  { day: 'Friday – Saturday', time: '12:00 – 23:30' },
  { day: 'Sunday', time: '13:00 – 21:00' },
]

export function AboutPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Story ── */}
      <section className="py-20 px-4 sm:px-6">
        <div id="about-section" className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-700/40 bg-brand-900/30 text-brand-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <ChefHat size={12} />
                Est. 1924 · Paris-Inspired
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-200 mb-6 leading-tight">
                Our Story
              </h1>
              <div className="space-y-4 text-brand-600 leading-relaxed">
                <p>
                  La Maison was born from a simple dream: to create a space where fine food meets
                  genuine hospitality. Chef Étienne Moreau opened our doors in 1998 with twelve tables,
                  a tiny kitchen, and an unwavering belief that great ingredients speak for themselves.
                </p>
                <p>
                  Over two decades later, the dream has grown but the spirit remains unchanged.
                  We still hand-write our menus each season, still greet every guest by name,
                  and still believe that the best dining experiences feel like coming home.
                </p>
                <p>
                  Today La Maison is recognised as one of the city's most beloved restaurants —
                  not just for the food, but for the feeling you carry with you long after the meal is done.
                </p>
              </div>
            </div>

            {/* Decorative card */}
            <div className="relative">
              <div className="card-glass rounded-3xl p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-brand-600/15 border border-brand-700/30 flex items-center justify-center mx-auto mb-6">
                  <ChefHat size={36} className="text-brand-400" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { value: '2+', label: 'Years Open' },
                    { value: '3×', label: 'Michelin Stars' },
                    { value: '12k+', label: 'Happy Guests' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="font-display text-2xl font-bold text-brand-400">{value}</p>
                      <p className="text-brand-700 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-brand-700 text-sm italic">
                  "Good food is the foundation of genuine happiness."
                </p>
                <p className="text-brand-500 text-xs mt-1">— Chef Étienne Moreau</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 px-4 sm:px-6 bg-surface-50/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-brand-300 text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-glass rounded-2xl p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-600/15 border border-brand-700/30 flex items-center justify-center">
                  <Icon size={18} className="text-brand-400" />
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

      {/* ── Team ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-brand-300 text-center mb-12">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {team.map(({ name, role, bio, initials }) => (
              <div key={name} className="card-glass rounded-2xl p-6 flex flex-col gap-4 text-center items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-700/40 to-brand-900/60 border border-brand-600/30 flex items-center justify-center font-display font-bold text-brand-300 text-lg">
                  {initials}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-brand-200">{name}</h3>
                  <p className="text-brand-500 text-xs mb-2">{role}</p>
                  <p className="text-brand-700 text-sm leading-relaxed">{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact & Hours ── */}
      <section className="py-16 px-4 sm:px-6 bg-surface-50/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

          {/* Contact */}
          <div className="card-glass rounded-2xl p-8">
            <h3 className="font-display text-xl font-bold text-brand-200 mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-brand-300 text-sm font-medium">Address</p>
                  <p className="text-brand-600 text-sm">14 Rue de la Paix, 75001 Paris, France</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-brand-300 text-sm font-medium">Phone</p>
                  <p className="text-brand-600 text-sm">+33 1 42 86 00 00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-brand-300 text-sm font-medium">Email</p>
                  <p className="text-brand-600 text-sm">hello@lamaison.fr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="card-glass rounded-2xl p-8">
            <h3 className="font-display text-xl font-bold text-brand-200 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-brand-400" /> Opening Hours
            </h3>
            <div className="space-y-3">
              {hours.map(({ day, time }) => (
                <div key={day} className="flex justify-between items-center py-2 border-b border-brand-900/40 last:border-0">
                  <span className="text-brand-500 text-sm">{day}</span>
                  <span className="text-brand-300 text-sm font-medium">{time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
