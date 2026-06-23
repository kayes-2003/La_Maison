import { supabase } from '@/lib/supabase'
import type { MenuItem } from '@/types'

export type SharePlatform = 'link' | 'whatsapp' | 'facebook' | 'twitter'

export function useProductShare() {

  const share = async (item: MenuItem, platform: SharePlatform, userId: string | null) => {
    const url = `${window.location.origin}/?item=${item.id}`
    const text = `Check out "${item.name}" at La Maison! 🍽️`

    // Persist share record
    if (userId) {
      await supabase.from('product_shares').insert({
        menu_item_id: item.id,
        shared_by: userId,
        platform,
      }).select().single()
    }

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    } else {
      // Copy link
      try {
        await navigator.clipboard.writeText(url)
        return 'copied'
      } catch {
        return 'error'
      }
    }
    return 'shared'
  }

  return { share }
}