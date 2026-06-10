import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { MenuCard }       from '@/components/customer/MenuCard'
import { MenuItemModal }  from '@/components/customer/MenuItemModal'
import { CategoryTabs }   from '@/components/shared/CategoryTabs'
import { Loader }         from '@/components/shared/Loader'
import type { MenuItem, Category } from '@/types'

interface MenuPageProps {
  items:       MenuItem[]
  loading:     boolean
  cartItemIds: string[]
  onAddToCart: (id: string) => void
}

export function MenuPage({ items, loading, cartItemIds, onAddToCart }: MenuPageProps) {
  const [category,  setCategory]  = useState<Category>('All')
  const [search,    setSearch]    = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter(item => {
      const matchCat    = category === 'All' || item.category === category
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [items, category, search])

  const previewItem = previewId ? items.find(i => i.id === previewId) ?? null : null

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <div className="text-center py-6 mb-2">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-300 mb-2">Our Menu</h1>
        <p className="text-brand-700 text-sm">{items.length} dishes crafted with passion</p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mx-auto mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search dishes, ingredients…"
          className="input-field pl-11 rounded-full py-3"
        />
      </div>

      {/* Category tabs */}
      <CategoryTabs active={category} onChange={setCategory} items={items} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-brand-800">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="font-display text-xl text-brand-600">No dishes found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filtered.map((item, i) => (
            /* Wrapper intercepts clicks that are NOT on the Add-to-cart button */
            <div
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              onClick={() => setPreviewId(item.id)}
            >
              {/*
                Stop propagation inside MenuCard's own add-to-cart button
                so clicking it does NOT open the modal.
                MenuCard receives a wrapped handler that calls stopPropagation.
              */}
              <div onClick={e => e.stopPropagation()} style={{ display: 'contents' }}>
                <MenuCard
                  item={item}
                  inCart={cartItemIds.includes(item.id)}
                  onAddToCart={() => onAddToCart(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen preview modal */}
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
