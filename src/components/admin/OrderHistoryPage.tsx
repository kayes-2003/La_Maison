import { Receipt, ShoppingBag, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react'
import { Loader } from '@/components/shared/Loader'
import type { Order, OrderStatus } from '@/types'

interface OrderHistoryPageProps {
  orders:  Order[]
  loading: boolean
  onViewMenu: () => void
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending:   { label: 'Pending',   icon: Clock,         className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  paid:      { label: 'Paid',      icon: CheckCircle2,  className: 'text-green-400  bg-green-400/10  border-green-400/20'  },
  failed:    { label: 'Failed',    icon: XCircle,       className: 'text-red-400    bg-red-400/10    border-red-400/20'    },
  cancelled: { label: 'Cancelled', icon: Ban,           className: 'text-brand-600  bg-brand-600/10  border-brand-600/20'  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  )
}

export function OrderHistoryPage({ orders, loading, onViewMenu }: OrderHistoryPageProps) {
  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-brand-600/15 border border-brand-700/30 flex items-center justify-center">
          <Receipt size={20} className="text-brand-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-200">Order History</h1>
          <p className="text-brand-700 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card-glass rounded-3xl p-14 text-center">
          <ShoppingBag size={40} className="text-brand-700 mx-auto mb-4" />
          <p className="font-display text-xl text-brand-400 mb-2">No orders yet</p>
          <p className="text-brand-700 text-sm mb-6">Once you checkout, your orders will appear here.</p>
          <button onClick={onViewMenu} className="btn-primary rounded-full px-6 py-2.5 text-sm">
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order.id} className="card-glass rounded-2xl overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-800/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-brand-200 font-semibold text-sm">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-brand-700 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="px-5 py-3 flex flex-col gap-2">
                {order.items.map((item, idx) => (
                  <div key={`${order.id}-${idx}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-500 text-[10px] font-bold shrink-0">
                        {item.quantity}
                      </span>
                      <span className="text-brand-400 text-sm">{item.name}</span>
                    </div>
                    <span className="text-brand-600 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-brand-800/30 bg-brand-900/20">
                <span className="text-brand-600 text-sm">Total</span>
                <span className="font-display text-brand-300 font-bold text-base">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
