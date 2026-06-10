import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'

export function useOrders(uid: string | null) {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!uid) { setOrders([]); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data as Order[])
    setLoading(false)
  }, [uid])

  useEffect(() => { load() }, [load])

  return { orders, loading, reload: load }
}
