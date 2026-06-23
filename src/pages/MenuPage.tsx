import { useState, useMemo } from 'react'
import { Search, Heart, Sparkles, Flame, Tag } from 'lucide-react'
import { MenuCard }       from '@/components/customer/MenuCard'
import { MenuItemModal }  from '@/components/customer/MenuItemModal'
import { CategoryTabs }   from '@/components/shared/CategoryTabs'
import { Loader }         from '@/components/shared/Loader'
import type { MenuItem, Category } from '@/types'

type SpecialFilter = 'all' | 'new' | 'offers' | 'wishlist'

interface MenuPageProps {
  items:           MenuItem[]
  loading:         boolean
  cartItemIds:     string[]
  wishlistIds:     Set<string>
  userId:          string | null
  onAddToCart:     (id: string) => void
  onToggleWish:    (id: string) => void
  onLoginRequired: () => void
}

const SPECIAL_FILTERS: { id: SpecialFilter; label: string; icon: React.ElementType; colour: string }[] = [
  { id: 'all',      label: 'All Items',   icon: Tag,      colour: 'bg-brand-700/50 text-brand-200 border-brand-700/40' },
  { id: 'new',      label: 'New Items',   icon: Sparkles, colour: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/40' },
  { id: 'offers',   label: 'On Offer',    icon: Flame,    colour: 'bg-brand-700/50 text-brand-200 border-brand-700/40' },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart,    colour: 'bg-red-950/50 text-red-300 border-red-700/40' },
]

export function MenuPage({
  items, loading, cartItemIds, wishlistIds, userId,
  onAddToCart, onToggleWish, onLoginRequired,
}: MenuPageProps) {
  const [category,  setCategory]  = useState<Category>('All')
  const [search,    setSearch]    = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [special,   setSpecial]   = useState<SpecialFilter>('all')

  const newCount  = useMemo(() => items.filter(i => i.is_new).length, [items])
  const offerCount = useMemo(() => items.filter(i => i.offer_percent > 0).length, [items])
  const wishCount = useMemo(() => wishlistIds.size, [wishlistIds])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter(item => {
      const matchCat     = category === 'All' || item.category === category
      const matchSearch  = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      const matchSpecial =
        special === 'all'      ? true :
        special === 'new'      ? item.is_new :
        special === 'offers'   ? item.offer_percent > 0 :
        special === 'wishlist' ? wishlistIds.has(item.id) : true
      return matchCat && matchSearch && matchSpecial
    })
  }, [items, category, search, special, wishlistIds])

  const previewItem = previewId ? items.find(i => i.id === previewId) ?? null : null

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="text-center py-6 mb-4">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-300 mb-2">Our Menu</h1>
        <p className="text-brand-700 text-sm">{items.length} dishes crafted with passion</p>
      </div>

      {/* Special filter pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {SPECIAL_FILTERS.map(f => {
          const Icon   = f.icon
          const count  = f.id === 'new' ? newCount : f.id === 'offers' ? offerCount : f.id === 'wishlist' ? wishCount : null
          const active = special === f.id
          return (
            <button
              key={f.id}
              onClick={() => { if (f.id === 'wishlist' && !userId) { onLoginRequired(); return } setSpecial(f.id) }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 ${
                active ? f.colour : 'border-brand-900/30 text-brand-700 hover:border-brand-800/50 hover:text-brand-400'
              }`}
            >
              <Icon size={13} />
              {f.label}
              {count !== null && count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${active ? 'bg-white/20' : 'bg-brand-800/50 text-brand-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search dishes, ingredients…"
          className="input-field pl-11 rounded-full py-3 w-full"
        />
      </div>

      {/* Category tabs */}
      <CategoryTabs active={category} onChange={setCategory} items={items} />

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-brand-700 text-xs">
          Showing <span className="text-brand-400 font-semibold">{filtered.length}</span> of {items.length} dishes
        </p>
        {special === 'new' && (
          <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <Sparkles size={11} /> Just added to the menu
          </span>
        )}
        {special === 'offers' && (
          <span className="flex items-center gap-1 text-brand-400 text-xs font-semibold">
            <Flame size={11} /> Limited time deals
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-brand-800">
          <p className="text-5xl mb-4">{special === 'wishlist' ? '💝' : special === 'new' ? '✨' : '🍽️'}</p>
          <p className="font-display text-xl text-brand-600">
            {special === 'wishlist' ? 'Your wishlist is empty' : special === 'new' ? 'No new items yet' : 'No dishes found'}
          </p>
          <p className="text-sm mt-1 text-brand-700">
            {special === 'wishlist' ? 'Tap ♥ on any dish to save it here' : 'Try a different filter or category'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              onClick={() => setPreviewId(item.id)}
            >
              <div onClick={e => e.stopPropagation()} style={{ display: 'contents' }}>
                <MenuCard
                  item={item}
                  inCart={cartItemIds.includes(item.id)}
                  inWishlist={wishlistIds.has(item.id)}
                  userId={userId}
                  onAddToCart={() => onAddToCart(item.id)}
                  onToggleWish={() => onToggleWish(item.id)}
                  onLoginRequired={onLoginRequired}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {previewItem && (
        <MenuItemModal
          item={previewItem}
          inCart={cartItemIds.includes(previewItem.id)}
          onAddToCart={() => onAddToCart(previewItem.id)}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  )
}