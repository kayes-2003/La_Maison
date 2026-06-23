import { useState, useMemo } from 'react'
import { Search, Heart } from 'lucide-react'
import { MenuCard }       from '@/components/customer/MenuCard'
import { MenuItemModal }  from '@/components/customer/MenuItemModal'
import { CategoryTabs }   from '@/components/shared/CategoryTabs'
import { Loader }         from '@/components/shared/Loader'
import type { MenuItem, Category } from '@/types'

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

export function MenuPage({
  items, loading, cartItemIds, wishlistIds, userId,
  onAddToCart, onToggleWish, onLoginRequired,
}: MenuPageProps) {
  const [category,    setCategory]    = useState<Category>('All')
  const [search,      setSearch]      = useState('')
  const [previewId,   setPreviewId]   = useState<string | null>(null)
  const [wishOnly,    setWishOnly]    = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter(item => {
      const matchCat    = category === 'All' || item.category === category
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      const matchWish   = !wishOnly || wishlistIds.has(item.id)
      return matchCat && matchSearch && matchWish
    })
  }, [items, category, search, wishOnly, wishlistIds])

  const previewItem = previewId ? items.find(i => i.id === previewId) ?? null : null

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <div className="text-center py-6 mb-2">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-300 mb-2">Our Menu</h1>
        <p className="text-brand-700 text-sm">{items.length} dishes crafted with passion</p>
      </div>

      {/* Search + Wishlist toggle */}
      <div className="flex items-center gap-2 max-w-md mx-auto mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes, ingredients…"
            className="input-field pl-11 rounded-full py-3 w-full"
          />
        </div>
        <button
          onClick={() => { if (!userId) { onLoginRequired(); return } setWishOnly(w => !w) }}
          title="Show wishlist only"
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
            wishOnly
              ? 'bg-red-950/40 border-red-700/50 text-red-400'
              : 'border-brand-800/40 text-brand-700 hover:text-red-400 hover:border-red-800/40'
          }`}
        >
          <Heart size={16} className={wishOnly ? 'fill-red-400' : ''} />
        </button>
      </div>

      {/* Category tabs */}
      <CategoryTabs active={category} onChange={setCategory} items={items} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-brand-800">
          <p className="text-5xl mb-4">{wishOnly ? '💝' : '🍽️'}</p>
          <p className="font-display text-xl text-brand-600">
            {wishOnly ? 'No wishlist items in this category' : 'No dishes found'}
          </p>
          <p className="text-sm mt-1">
            {wishOnly ? 'Heart items from the menu to add them here' : 'Try a different search or category'}
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