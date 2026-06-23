import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useWishlist(userId: string | null) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(false)

  const fetch = useCallback(async () => {
    if (!userId) { setWishlist(new Set()); return }
    setLoading(true)
    const { data } = await supabase
      .from('wishlists')
      .select('menu_item_id')
      .eq('user_id', userId)
    if (data) setWishlist(new Set(data.map(r => r.menu_item_id)))
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const toggle = async (menuItemId: string) => {
    if (!userId) return false  // caller should prompt login
    const inWish = wishlist.has(menuItemId)
    // optimistic
    setWishlist(prev => {
      const next = new Set(prev)
      inWish ? next.delete(menuItemId) : next.add(menuItemId)
      return next
    })
    if (inWish) {
      await supabase.from('wishlists').delete()
        .eq('user_id', userId).eq('menu_item_id', menuItemId)
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, menu_item_id: menuItemId })
    }
    return !inWish
  }

  return { wishlist, loading, toggle, reload: fetch }
}