

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react'
import type { Order } from '@/types'

interface OrderHistoryProps {
  userId: string
  onClose: () => void
}

const statusIcon = {
  paid:      <CheckCircle size={14} className="text-green-400" />,
  pending:   <Clock size={14} className="text-yellow-400" />,
  failed:    <XCircle size={14} className="text-red-400" />,
  cancelled: <XCircle size={14} className="text-brand-600" />,
}

const statusLabel = {
  paid:      'Paid',
  pending:   'Pending',
  failed:    'Failed',
  cancelled: 'Cancelled',
}

const statusColor = {
  paid:      'text-green-400 bg-green-900/20 border-green-800/30',
  pending:   'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
  failed:    'text-red-400 bg-red-900/20 border-red-800/30',
  cancelled: 'text-brand-600 bg-surface-100 border-brand-800/30',
}

export function OrderHistory({ userId, onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) setOrders(data as Order[])
      setLoading(false)
    }
    fetchOrders()
  }, [userId])

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg max-h-[85vh] flex flex-col bg-surface-50 rounded-3xl border border-brand-800/40 shadow-2xl pointer-events-auto animate-fade-up overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-brand-900/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600/15 border border-brand-700/30 flex items-center justify-center">
                <Package size={16} className="text-brand-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-brand-100 text-lg">Order History</h2>
                <p className="text-brand-700 text-xs">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-brand-700 hover:text-brand-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-900/30 text-sm"
            >
              Close
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-brand-700">
                <span className="text-5xl opacity-40">📋</span>
                <p className="font-display text-lg text-brand-600">No orders yet</p>
                <p className="text-sm">Your order history will appear here</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="bg-surface-100/60 border border-brand-900/30 rounded-2xl overflow-hidden hover:border-brand-800/50 transition-all"
                >
                  {/* Order header row */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    onClick={() => setExpanded(e => e === order.id ? null : order.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusColor[order.status]}`}>
                        {statusIcon[order.status]}
                        {statusLabel[order.status]}
                      </div>
                      <div>
                        <p className="text-brand-300 text-xs font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-brand-700 text-[11px] mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-200 text-sm">
                        {formatPrice(order.total)}
                      </span>
                      {expanded === order.id
                        ? <ChevronUp size={14} className="text-brand-600" />
                        : <ChevronDown size={14} className="text-brand-600" />
                      }
                    </div>
                  </button>

                  {/* Expanded items */}
                  {expanded === order.id && (
                    <div className="border-t border-brand-900/30 px-4 py-3 space-y-2">
                      {(order.items as any[]).map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-brand-800/40 text-brand-500 text-[10px] flex items-center justify-center font-bold">
                              {item.quantity}
                            </span>
                            <span className="text-brand-300 text-sm">{item.name}</span>
                          </div>
                          <span className="text-brand-600 text-xs font-mono">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-brand-900/20 flex justify-between">
                        <span className="text-brand-700 text-xs">Total</span>
                        <span className="text-brand-200 font-mono font-bold text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
