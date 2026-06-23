import { useState, useEffect } from 'react'
import {
  Package, CheckCircle2, Truck, ShoppingBag,
  Star, Receipt, Phone, User, X, RefreshCw,
  Clock, MapPin, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { Order, TrackingStatus } from '@/types'

// ─── Step config ──────────────────────────────────────────────

const STEPS: { id: TrackingStatus; label: string; desc: string; icon: typeof Clock }[] = [
  { id: 'pending',      label: 'Order Placed',        desc: 'Your order has been received.',           icon: Clock },
  { id: 'confirmed',    label: 'Confirmed',            desc: 'Restaurant confirmed your order.',        icon: CheckCircle2 },
  { id: 'preparing',   label: 'Preparing',            desc: 'Your food is being prepared.',            icon: ShoppingBag },
  { id: 'parcel_picked',label: 'Parcel Picked',        desc: 'Delivery partner picked up your order.',  icon: Package },
  { id: 'on_the_way',  label: 'On the Way',           desc: 'Your order is out for delivery!',         icon: Truck },
  { id: 'delivered',   label: 'Delivered',            desc: 'Enjoy your meal! 🎉',                     icon: Star },
]

const stepIndex = (s: TrackingStatus) => STEPS.findIndex(x => x.id === s)

// ─── Invoice modal ────────────────────────────────────────────

function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const print = () => window.print()
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 print:shadow-none">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 print:hidden"><X size={16} /></button>

        {/* Invoice */}
        <div className="text-center mb-5">
          <p className="text-2xl font-bold font-serif">La Maison</p>
          <p className="text-xs text-gray-500 mt-1">Fine Dining · Est. 2024</p>
          <p className="text-xs text-gray-400 mt-0.5">Tax Invoice</p>
        </div>

        <div className="border-t border-b border-dashed border-gray-300 py-3 space-y-1 text-xs text-gray-500 mb-4">
          <div className="flex justify-between"><span>Order ID</span><span className="font-mono text-gray-700">#{order.id.slice(0,8).toUpperCase()}</span></div>
          <div className="flex justify-between"><span>Date</span><span>{new Date(order.created_at).toLocaleString('en-GB')}</span></div>
          {order.payment_method && <div className="flex justify-between"><span>Payment</span><span className="capitalize">{order.payment_method}</span></div>}
          {order.delivery_address?.full_name && <div className="flex justify-between"><span>Customer</span><span>{order.delivery_address.full_name}</span></div>}
        </div>

        <div className="space-y-1.5 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.quantity}× {item.name}</span>
              <span className="font-mono text-gray-600">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="font-mono">{formatPrice(order.total)}</span>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">Thank you for dining with us!</p>

        <button onClick={print} className="mt-4 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors print:hidden">
          🖨️ Print Invoice
        </button>
      </div>
    </div>
  )
}

// ─── Single Order Card ────────────────────────────────────────

function OrderTrackCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const [expanded,    setExpanded]    = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)

  const current    = order.tracking_status ?? 'pending'
  const curIdx     = stepIndex(current)
  const cancelled  = current === 'cancelled'

  return (
    <div className="card-glass rounded-2xl overflow-hidden border-brand-800/40">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          cancelled              ? 'bg-red-950/50 border border-red-800/40'
          : current === 'delivered' ? 'bg-green-950/50 border border-green-800/40'
          : 'bg-brand-900/60 border border-brand-800/40'
        }`}>
          {cancelled ? <X size={16} className="text-red-400" />
            : current === 'delivered' ? <Star size={16} className="text-green-400 fill-green-400" />
            : <Truck size={16} className="text-brand-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-brand-200 text-xs font-bold">#{order.id.slice(0,8).toUpperCase()}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
              cancelled              ? 'bg-red-950/50 text-red-400 border-red-800/40'
              : current === 'delivered' ? 'bg-green-950/50 text-green-400 border-green-800/40'
              : 'bg-brand-900/60 text-brand-400 border-brand-800/40'
            }`}>
              {STEPS.find(s => s.id === current)?.label ?? current}
            </span>
          </div>
          <p className="text-brand-700 text-xs mt-0.5">
            {new Date(order.created_at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
            {' · '}{formatPrice(order.total)}
          </p>
        </div>

        {expanded ? <ChevronUp size={14} className="text-brand-700 shrink-0" /> : <ChevronDown size={14} className="text-brand-700 shrink-0" />}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-brand-900/20 space-y-5 pt-4">

          {/* Progress tracker */}
          {!cancelled ? (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-brand-900/60" />
              <div
                className="absolute left-4 top-4 w-px bg-brand-500 transition-all duration-700"
                style={{ height: `${(curIdx / (STEPS.length - 1)) * 100}%` }}
              />

              <div className="space-y-4">
                {STEPS.map((step, i) => {
                  const done    = i <= curIdx
                  const active  = i === curIdx
                  const Icon    = step.icon
                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                        active ? 'bg-brand-400 border-brand-400 shadow-lg shadow-brand-500/30'
                          : done ? 'bg-brand-700 border-brand-600'
                          : 'bg-surface-100 border-brand-900/40'
                      }`}>
                        <Icon size={13} className={active ? 'text-surface' : done ? 'text-brand-300' : 'text-brand-800'} />
                      </div>
                      <div className={`pt-1 transition-opacity duration-300 ${done ? 'opacity-100' : 'opacity-40'}`}>
                        <p className={`text-sm font-semibold ${active ? 'text-brand-200' : done ? 'text-brand-400' : 'text-brand-700'}`}>
                          {step.label}
                          {active && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />}
                        </p>
                        <p className="text-brand-700 text-xs">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-xl text-center">
              <p className="text-red-300 font-semibold">Order Cancelled</p>
              {order.tracking_note && <p className="text-red-400/70 text-xs mt-1">{order.tracking_note}</p>}
            </div>
          )}

          {/* Delivery person card */}
          {current === 'on_the_way' && (order.delivery_name || order.delivery_phone) && (
            <div className="p-3.5 bg-brand-900/30 border border-brand-800/30 rounded-xl space-y-2">
              <p className="text-brand-500 text-xs font-semibold uppercase tracking-wide">Delivery Partner</p>
              {order.delivery_name && (
                <div className="flex items-center gap-2 text-sm text-brand-300">
                  <User size={13} className="text-brand-600" /> {order.delivery_name}
                </div>
              )}
              {order.delivery_phone && (
                <a href={`tel:${order.delivery_phone}`}
                  className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-200 transition-colors">
                  <Phone size={13} className="text-brand-600" /> {order.delivery_phone}
                </a>
              )}
            </div>
          )}

          {/* Delivery address */}
          {order.delivery_address?.address_line1 && (
            <div className="flex items-start gap-2 text-xs text-brand-600">
              <MapPin size={12} className="shrink-0 mt-0.5 text-brand-700" />
              <span>{[order.delivery_address.address_line1, order.delivery_address.city, order.delivery_address.district].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {/* Items summary */}
          <div className="space-y-1.5 pt-2 border-t border-brand-900/20">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-brand-600">{item.quantity}× {item.name}</span>
                <span className="font-mono text-brand-500">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-brand-900/20">
              <span className="text-brand-400">Total</span>
              <span className="font-mono text-brand-200">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onRefresh} className="btn-ghost flex-1 gap-1.5 text-xs py-2">
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={() => setShowInvoice(true)} className="btn-outline flex-1 gap-1.5 text-xs py-2">
              <Receipt size={12} /> Invoice
            </button>
          </div>
        </div>
      )}

      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

interface OrderTrackingPageProps {
  userId: string
}

export function OrderTrackingPage({ userId }: OrderTrackingPageProps) {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setOrders(data as Order[])
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${userId}`,
      }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-300 mb-2">My Orders</h1>
        <p className="text-brand-700 text-sm">Track your deliveries in real time</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-brand-800">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="font-display text-xl text-brand-600">No orders yet</p>
          <p className="text-sm mt-1">Place your first order from the menu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderTrackCard key={order.id} order={order} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  )
}