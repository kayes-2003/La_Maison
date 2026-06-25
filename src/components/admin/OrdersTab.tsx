import { useState } from 'react'
import {
  Receipt, Search, Filter, ChevronDown, ChevronUp,
  Truck, Package, CheckCircle2, X, Clock, ShoppingBag,
  Star, User, Phone, Edit3, Save,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ReceiptModal } from '@/components/admin/ReceiptModal'
import { formatPrice } from '@/lib/utils'
import type { Order, TrackingStatus } from '@/types'

interface Props { orders: Order[]; onRefresh?: () => void }

const STATUS_STEPS: { id: TrackingStatus; label: string; icon: React.ElementType; colour: string }[] = [
  { id: 'pending',       label: 'Pending',       icon: Clock,        colour: 'text-gray-400 bg-gray-900/40 border-gray-700/40' },
  { id: 'confirmed',     label: 'Confirmed',     icon: CheckCircle2, colour: 'text-blue-400 bg-blue-950/40 border-blue-700/40' },
  { id: 'preparing',     label: 'Preparing',     icon: ShoppingBag,  colour: 'text-yellow-400 bg-yellow-950/40 border-yellow-700/40' },
  { id: 'parcel_picked', label: 'Parcel Picked', icon: Package,      colour: 'text-purple-400 bg-purple-950/40 border-purple-700/40' },
  { id: 'on_the_way',    label: 'On the Way',    icon: Truck,        colour: 'text-orange-400 bg-orange-950/40 border-orange-700/40' },
  { id: 'delivered',     label: 'Delivered',     icon: Star,         colour: 'text-green-400 bg-green-950/40 border-green-700/40' },
  { id: 'cancelled',     label: 'Cancelled',     icon: X,            colour: 'text-red-400 bg-red-950/40 border-red-700/40' },
]

const inp = 'w-full bg-surface-100 border border-brand-800/50 rounded-xl px-3 py-2 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 transition-all'

function TrackingPanel({ order, onDone }: { order: Order; onDone: () => void }) {
  const [status, setStatus] = useState<TrackingStatus>(order.tracking_status ?? 'pending')
  const [dName,  setDName]  = useState(order.delivery_name  ?? '')
  const [dPhone, setDPhone] = useState(order.delivery_phone ?? '')
  const [note,   setNote]   = useState(order.tracking_note  ?? '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('orders').update({
      tracking_status: status,
      delivery_name:   dName  || null,
      delivery_phone:  dPhone || null,
      tracking_note:   note   || null,
      delivered_at:    status === 'delivered' ? new Date().toISOString() : null,
    }).eq('id', order.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      // Customer gets the update via Supabase Realtime automatically
      setTimeout(() => { setSaved(false); onDone() }, 1200)
    }
  }

  return (
    <div className="mt-3 p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl space-y-4">
      <p className="text-brand-400 text-xs font-semibold uppercase tracking-wide">Update Tracking</p>
      <div className="flex flex-wrap gap-2">
        {STATUS_STEPS.map(s => {
          const Icon = s.icon
          return (
            <button key={s.id} onClick={() => setStatus(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${status === s.id ? s.colour : 'border-brand-900/30 text-brand-700 hover:border-brand-700/40'}`}>
              <Icon size={11} /> {s.label}
            </button>
          )
        })}
      </div>
      {(status === 'on_the_way' || status === 'parcel_picked') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-brand-600 mb-1 block">Delivery Person Name</label>
            <input className={inp} value={dName} onChange={e => setDName(e.target.value)} placeholder="Rahim Uddin" />
          </div>
          <div>
            <label className="text-xs text-brand-600 mb-1 block">Contact Number</label>
            <input className={inp} value={dPhone} onChange={e => setDPhone(e.target.value)} placeholder="+880 1X…" />
          </div>
        </div>
      )}
      <div>
        <label className="text-xs text-brand-600 mb-1 block">Note to customer</label>
        <input className={inp} value={note} onChange={e => setNote(e.target.value)} placeholder="Arrived at gate…" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="btn-ghost gap-1.5 text-sm"><X size={13} /> Cancel</button>
        <button onClick={save} disabled={saving || saved} className="btn-primary gap-1.5 text-sm">
          {saved ? <span className="flex items-center gap-1.5 text-green-300">✓ Sent live to customer</span> : saving ? 'Saving…' : <><Save size={13} /> Update & Notify</>}
        </button>
      </div>
    </div>
  )
}

export function OrdersTab({ orders, onRefresh }: Props) {
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState<string>('all')
  const [expanded,     setExpanded]     = useState<string | null>(null)
  const [editing,      setEditing]      = useState<string | null>(null)
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null)

  const today   = new Date().toDateString()
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)

  const filtered = orders.filter(o => {
    const addr = o.delivery_address as Record<string,string> | undefined
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())) ||
      addr?.full_name?.toLowerCase().includes(search.toLowerCase())
    const d = new Date(o.created_at)
    const matchFilter =
      filter === 'today' ? d.toDateString() === today :
      filter === 'week'  ? d >= weekAgo :
      filter === 'all'   ? true :
      (o.tracking_status ?? 'pending') === filter
    return matchSearch && matchFilter
  })

  const total = filtered.reduce((s, o) => s + Number(o.total), 0)

  const filterOpts = [
    { id: 'all', label: 'All' }, { id: 'today', label: 'Today' }, { id: 'week', label: 'Week' },
    { id: 'pending', label: 'Pending' }, { id: 'on_the_way', label: 'On Way' },
    { id: 'delivered', label: 'Delivered' }, { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order, customer, item…"
            className="w-full bg-surface-100 border border-brand-800/40 rounded-xl pl-9 pr-4 py-2.5 text-brand-200 text-sm placeholder-brand-800 outline-none focus:border-brand-600 transition-colors" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterOpts.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filter === f.id ? 'bg-brand-700/50 text-brand-200 border-brand-700/40' : 'border-brand-900/30 text-brand-700 hover:text-brand-400'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-100/60 border border-brand-900/30 rounded-lg">
        <span className="text-brand-600 text-sm flex items-center gap-1.5"><Filter size={13} /> {filtered.length} orders</span>
        <span className="font-mono font-bold text-brand-300 text-sm">{formatPrice(total)}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-700"><p className="font-display text-lg">No orders found</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const isOpen    = expanded === order.id
            const isEditing = editing  === order.id
            const cur = order.tracking_status ?? 'pending'
            const s   = STATUS_STEPS.find(x => x.id === cur)!
            const Icon = s.icon
            const addr = order.delivery_address as Record<string,string> | undefined

            return (
              <div key={order.id} className="bg-surface-50 border border-brand-900/30 rounded-xl overflow-hidden hover:border-brand-800/50 transition-colors">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${s.colour}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-brand-300 text-xs font-bold">#{order.id.slice(0,8).toUpperCase()}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${s.colour}`}>{s.label}</span>
                      {addr?.full_name && <span className="text-brand-700 text-xs">{addr.full_name}</span>}
                    </div>
                    <p className="text-brand-700 text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      {' · '}{order.items.length} item{order.items.length!==1?'s':''}
                      {order.payment_method && ` · ${order.payment_method}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-brand-200 text-sm">{formatPrice(Number(order.total))}</span>
                    {isOpen ? <ChevronUp size={14} className="text-brand-600" /> : <ChevronDown size={14} className="text-brand-600" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-brand-900/20 space-y-4 pt-4">
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-brand-500 text-sm">{item.quantity}× {item.name}</span>
                          <span className="text-brand-400 font-mono text-xs">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-brand-900/20">
                        <span className="text-brand-400 text-sm font-semibold">Total</span>
                        <span className="font-mono font-bold text-brand-200">{formatPrice(Number(order.total))}</span>
                      </div>
                    </div>

                    {addr?.address_line1 && (
                      <div className="text-xs text-brand-600 space-y-0.5 p-3 bg-surface-100/40 border border-brand-900/20 rounded-lg">
                        <p className="font-semibold text-brand-400">{addr.full_name}</p>
                        <p>{addr.phone}</p>
                        <p>{addr.address_line1}{addr.address_line2 ? ', '+addr.address_line2 : ''}</p>
                        <p>{addr.city}, {addr.district}</p>
                        {addr.delivery_note && <p className="italic text-brand-700">"{addr.delivery_note}"</p>}
                      </div>
                    )}

                    {(order.delivery_name || order.delivery_phone) && (
                      <div className="text-xs text-brand-600 p-3 bg-surface-100/40 border border-brand-900/20 rounded-lg">
                        <p className="font-semibold text-brand-400 mb-1">Delivery Partner</p>
                        {order.delivery_name  && <p><User  size={10} className="inline mr-1" />{order.delivery_name}</p>}
                        {order.delivery_phone && <p><Phone size={10} className="inline mr-1" />{order.delivery_phone}</p>}
                      </div>
                    )}

                    {isEditing ? (
                      <TrackingPanel order={order} onDone={() => { setEditing(null); onRefresh?.() }} />
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(order.id)} className="btn-outline flex-1 gap-1.5 text-xs py-2">
                          <Edit3 size={12} /> Update Tracking
                        </button>
                        <button onClick={() => setReceiptOrder(order)} className="btn-ghost flex-1 gap-1.5 text-xs py-2">
                          <Receipt size={12} /> Receipt
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
    </div>
  )
}