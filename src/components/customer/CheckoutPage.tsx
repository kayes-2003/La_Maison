import React, { useState } from 'react'
import {
  MapPin, Phone, User, Home, Building2,
  Banknote, CreditCard, Smartphone, Lock,
  CheckCircle2, Loader2, ArrowLeft, ShieldCheck,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CartSummary } from '@/types'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'cod' | 'card' | 'bkash' | 'nagad' | 'rocket'

interface AddressForm {
  full_name: string
  phone: string
  alt_phone: string
  address_line1: string
  address_line2: string
  city: string
  district: string
  postal_code: string
  delivery_note: string
}

interface MobilePayForm {
  mobile_number: string
  trx_id: string
}

interface CardForm {
  name: string
  number: string
  expiry: string
  cvc: string
}

interface CheckoutPageProps {
  summary: CartSummary
  userId: string
  onBack: () => void
  onSuccess: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BD_DISTRICTS = [
  'Dhaka','Chittagong','Sylhet','Rajshahi','Khulna',
  'Barisal','Rangpur','Mymensingh','Comilla','Narayanganj',
  'Gazipur','Narsingdi','Tangail','Faridpur','Jessore',
  'Bogra','Dinajpur','Cox\'s Bazar','Noakhali','Brahmanbaria',
]

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  {
    id: 'cod', label: 'Cash on Delivery', color: 'border-green-700/50 bg-green-950/20',
    icon: <Banknote size={20} className="text-green-400" />,
    desc: 'Pay with cash when your order arrives',
  },
  {
    id: 'card', label: 'Credit / Debit Card', color: 'border-blue-700/50 bg-blue-950/20',
    icon: <CreditCard size={20} className="text-blue-400" />,
    desc: 'Visa, Mastercard, American Express',
  },
  {
    id: 'bkash', label: 'bKash', color: 'border-pink-700/50 bg-pink-950/20',
    icon: <span className="text-lg font-bold text-pink-400">b</span>,
    desc: 'Pay via bKash mobile banking',
  },
  {
    id: 'nagad', label: 'Nagad', color: 'border-orange-700/50 bg-orange-950/20',
    icon: <Smartphone size={20} className="text-orange-400" />,
    desc: 'Pay via Nagad digital financial service',
  },
  {
    id: 'rocket', label: 'Rocket (DBBL)', color: 'border-violet-700/50 bg-violet-950/20',
    icon: <span className="text-lg font-bold text-violet-400">🚀</span>,
    desc: 'Dutch-Bangla Bank mobile banking',
  },
]

const MERCHANT_NUMBERS: Record<string, string> = {
  bkash:  '01XXXXXXXXX (bKash Merchant)',
  nagad:  '01XXXXXXXXX (Nagad Merchant)',
  rocket: '01XXXXXXXXX (Rocket Merchant)',
}

// ─── Input styling ─────────────────────────────────────────────────────────────

const inp = 'w-full bg-surface-100 border border-brand-800/50 rounded-xl px-3.5 py-2.5 text-brand-100 text-sm placeholder-brand-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all'

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckoutPage({ summary, userId, onBack, onSuccess }: CheckoutPageProps) {
  const [step, setStep]   = useState<'address' | 'payment' | 'confirm' | 'done'>('address')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [address, setAddress] = useState<AddressForm>({
    full_name: '', phone: '', alt_phone: '', address_line1: '',
    address_line2: '', city: '', district: '', postal_code: '', delivery_note: '',
  })

  const [payMethod, setPayMethod] = useState<PaymentMethod>('cod')

  const [mobileForm, setMobileForm] = useState<MobilePayForm>({ mobile_number: '', trx_id: '' })
  const [cardForm, setCardForm]     = useState<CardForm>({ name: '', number: '', expiry: '', cvc: '' })

  // ── helpers ──────────────────────────────────────────────────────────────────

  const setAddr = (k: keyof AddressForm, v: string) =>
    setAddress(a => ({ ...a, [k]: v }))

  const fmtCard   = (v: string) => v.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19)
  const fmtExpiry = (v: string) => { const c = v.replace(/\D/g,''); return c.length >= 2 ? c.slice(0,2)+'/'+c.slice(2,4) : c }
  const fmtPhone  = (v: string) => v.replace(/[^\d+]/g,'').slice(0,14)

  const addrValid = address.full_name && address.phone && address.address_line1 && address.district

  // ── submit ───────────────────────────────────────────────────────────────────

  const placeOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const items = summary.items.map(ci => ({
        id: ci.menu_item_id, name: ci.menu_items.name,
        price: ci.menu_items.price, quantity: ci.quantity,
      }))
      // Build payment_ref: last 4 of card, or TrxID for mobile banking
      let paymentRef: string | null = null
      if (payMethod === 'card' && cardForm.number) {
        paymentRef = 'CARD ending ' + cardForm.number.replace(/\s/g, '').slice(-4)
      } else if ((payMethod === 'bkash' || payMethod === 'nagad' || payMethod === 'rocket') && mobileForm.trx_id) {
        paymentRef = mobileForm.trx_id
      }

      const { error: err } = await supabase.from('orders').insert({
        user_id:          userId,
        items,
        total:            summary.total,
        status:           'pending',
        delivery_address: address,
        payment_method:   payMethod,
        payment_ref:      paymentRef,
      })
      if (err) throw new Error(err.message)
      setStep('done')
      setTimeout(onSuccess, 2200)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onBack} />

      <div className="relative w-full sm:max-w-xl bg-surface-50 border border-brand-900/40 sm:rounded-2xl shadow-2xl animate-fade-up max-h-[96vh] flex flex-col rounded-t-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-900/30 shrink-0">
          <div className="flex items-center gap-3">
            {step !== 'done' && step !== 'address' && (
              <button onClick={() => setStep(step === 'payment' ? 'address' : 'payment')}
                className="p-1.5 rounded-lg text-brand-600 hover:text-brand-300 hover:bg-brand-900/40 transition-colors">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="font-display font-bold text-brand-200 text-base leading-tight">
                {step === 'address' ? 'Delivery Address'
                  : step === 'payment' ? 'Payment Method'
                  : step === 'confirm' ? 'Confirm Order'
                  : 'Order Placed!'}
              </h2>
              <p className="text-brand-700 text-xs">
                {summary.count} item{summary.count !== 1 ? 's' : ''} · {formatPrice(summary.total)}
              </p>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 items-center">
            {(['address','payment','confirm'] as const).map((s, i) => (
              <div key={s} className={`rounded-full transition-all duration-300 ${
                step === s ? 'w-5 h-2 bg-brand-400'
                  : (['address','payment','confirm'].indexOf(step) > i || step === 'done')
                    ? 'w-2 h-2 bg-brand-500'
                    : 'w-2 h-2 bg-brand-800'
              }`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">

          {/* ── STEP 1: ADDRESS ── */}
          {step === 'address' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1.5"><User size={11} /> Full Name *</label>
                  <input className={inp} placeholder="e.g. Rahim Uddin" value={address.full_name}
                    onChange={e => setAddr('full_name', e.target.value)} required />
                </div>

                <div>
                  <label className="label flex items-center gap-1.5"><Phone size={11} /> Mobile Number *</label>
                  <input className={inp} placeholder="+880 1X XX XX XXXX" value={address.phone}
                    onChange={e => setAddr('phone', fmtPhone(e.target.value))} required />
                </div>
                <div>
                  <label className="label">Alt. Number (optional)</label>
                  <input className={inp} placeholder="+880 1X XX XX XXXX" value={address.alt_phone}
                    onChange={e => setAddr('alt_phone', fmtPhone(e.target.value))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1.5"><Home size={11} /> Address Line 1 *</label>
                  <input className={inp} placeholder="House/Flat no, Road no, Area" value={address.address_line1}
                    onChange={e => setAddr('address_line1', e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address Line 2 (optional)</label>
                  <input className={inp} placeholder="Landmark, Neighbourhood" value={address.address_line2}
                    onChange={e => setAddr('address_line2', e.target.value)} />
                </div>

                <div>
                  <label className="label flex items-center gap-1.5"><Building2 size={11} /> City / Thana *</label>
                  <input className={inp} placeholder="e.g. Gulshan, Dhanmondi…" value={address.city}
                    onChange={e => setAddr('city', e.target.value)} required />
                </div>
                <div>
                  <label className="label">District *</label>
                  <select className={inp} value={address.district}
                    onChange={e => setAddr('district', e.target.value)} required>
                    <option value="">Select district</option>
                    {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Postal Code</label>
                  <input className={inp} placeholder="e.g. 1212" value={address.postal_code}
                    onChange={e => setAddr('postal_code', e.target.value.replace(/\D/g,'').slice(0,6))} />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><MapPin size={11} /> Delivery Note</label>
                  <input className={inp} placeholder="Ring bell, leave at door…" value={address.delivery_note}
                    onChange={e => setAddr('delivery_note', e.target.value)} />
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                disabled={!addrValid}
                className="btn-primary w-full py-3 rounded-xl mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 'payment' && (
            <>
              <div className="space-y-2.5">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPayMethod(pm.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                      payMethod === pm.id
                        ? pm.color + ' ring-1 ring-brand-500/40'
                        : 'border-brand-800/40 bg-surface-100/40 hover:border-brand-700/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-surface-50/50 border border-brand-800/30 flex items-center justify-center shrink-0">
                      {pm.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-200 text-sm font-semibold">{pm.label}</p>
                      <p className="text-brand-700 text-xs">{pm.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                      payMethod === pm.id ? 'border-brand-400 bg-brand-400' : 'border-brand-700'
                    }`} />
                  </button>
                ))}
              </div>

              {/* Card form */}
              {payMethod === 'card' && (
                <div className="mt-4 space-y-3 p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl">
                  <p className="text-brand-400 text-xs font-semibold uppercase tracking-wider">Card Details</p>
                  <input className={inp} placeholder="Cardholder Name" value={cardForm.name}
                    onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} />
                  <input className={inp} placeholder="Card Number" value={cardForm.number}
                    onChange={e => setCardForm(f => ({ ...f, number: fmtCard(e.target.value) }))}
                    maxLength={19} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inp} placeholder="MM/YY" value={cardForm.expiry}
                      onChange={e => setCardForm(f => ({ ...f, expiry: fmtExpiry(e.target.value) }))}
                      maxLength={5} />
                    <input className={inp} placeholder="CVC" value={cardForm.cvc}
                      onChange={e => setCardForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                      maxLength={4} />
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-800 text-xs">
                    <ShieldCheck size={11} /> 256-bit SSL encrypted
                  </div>
                </div>
              )}

              {/* Mobile banking form */}
              {(payMethod === 'bkash' || payMethod === 'nagad' || payMethod === 'rocket') && (
                <div className="mt-4 space-y-3 p-4 bg-surface-100/40 border border-brand-800/30 rounded-xl">
                  <div className="p-3 bg-brand-900/40 rounded-lg text-brand-400 text-xs leading-relaxed border border-brand-800/30">
                    <p className="font-semibold mb-1">How to pay via {PAYMENT_METHODS.find(p=>p.id===payMethod)?.label}:</p>
                    <p>1. Send <span className="text-brand-300 font-bold">{formatPrice(summary.total)}</span> to merchant:</p>
                    <p className="font-mono text-brand-300 mt-0.5 mb-2">  {MERCHANT_NUMBERS[payMethod]}</p>
                    <p>2. Enter your number & transaction ID below.</p>
                  </div>
                  <input className={inp} placeholder={`${PAYMENT_METHODS.find(p=>p.id===payMethod)?.label} Number`}
                    value={mobileForm.mobile_number}
                    onChange={e => setMobileForm(f => ({ ...f, mobile_number: fmtPhone(e.target.value) }))} />
                  <input className={inp} placeholder="Transaction ID (TrxID)"
                    value={mobileForm.trx_id}
                    onChange={e => setMobileForm(f => ({ ...f, trx_id: e.target.value }))} />
                </div>
              )}

              <button onClick={() => setStep('confirm')} className="btn-primary w-full py-3 rounded-xl mt-2">
                Review Order
              </button>
            </>
          )}

          {/* ── STEP 3: CONFIRM ── */}
          {step === 'confirm' && (
            <>
              {/* Order items */}
              <div className="bg-surface-100/60 border border-brand-900/30 rounded-xl p-4 space-y-2">
                <p className="text-brand-500 text-xs font-semibold uppercase tracking-wider mb-3">Order Summary</p>
                {summary.items.map(ci => (
                  <div key={ci.id} className="flex justify-between text-sm">
                    <span className="text-brand-500 truncate max-w-[200px]">{ci.quantity}× {ci.menu_items.name}</span>
                    <span className="text-brand-400 font-mono text-xs">{formatPrice(ci.menu_items.price * ci.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-brand-900/30">
                  <span className="text-brand-400 text-sm font-medium">Total</span>
                  <span className="font-display font-bold text-brand-300 text-xl">{formatPrice(summary.total)}</span>
                </div>
              </div>

              {/* Delivery address summary */}
              <div className="bg-surface-100/60 border border-brand-900/30 rounded-xl p-4 space-y-1.5">
                <p className="text-brand-500 text-xs font-semibold uppercase tracking-wider mb-2">Delivery To</p>
                <p className="text-brand-200 text-sm font-semibold">{address.full_name}</p>
                <p className="text-brand-500 text-xs">{address.phone}</p>
                <p className="text-brand-500 text-xs">{address.address_line1}{address.address_line2 ? ', '+address.address_line2 : ''}</p>
                <p className="text-brand-500 text-xs">{address.city}, {address.district} {address.postal_code}</p>
                {address.delivery_note && <p className="text-brand-700 text-xs italic">Note: {address.delivery_note}</p>}
              </div>

              {/* Payment method summary */}
              <div className="bg-surface-100/60 border border-brand-900/30 rounded-xl p-4">
                <p className="text-brand-500 text-xs font-semibold uppercase tracking-wider mb-2">Payment</p>
                <p className="text-brand-200 text-sm flex items-center gap-2">
                  {PAYMENT_METHODS.find(p => p.id === payMethod)?.icon}
                  {PAYMENT_METHODS.find(p => p.id === payMethod)?.label}
                </p>
                {(payMethod === 'bkash' || payMethod === 'nagad' || payMethod === 'rocket') && mobileForm.trx_id && (
                  <p className="text-brand-700 text-xs mt-1">TrxID: {mobileForm.trx_id}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-950/40 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Placing Order…</>
                ) : (
                  <><Lock size={14} /> Place Order · {formatPrice(summary.total)}</>
                )}
              </button>
            </>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center py-10 space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-950/50 border border-green-700/50 flex items-center justify-center animate-fade-up">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl text-brand-200 mb-2">Order Placed! 🎉</h3>
                <p className="text-brand-600 text-sm max-w-xs mx-auto">
                  Thank you, {address.full_name}! Your order is confirmed and will be delivered to {address.city}.
                </p>
              </div>
              {payMethod === 'cod' && (
                <p className="text-brand-700 text-xs">Please have <span className="text-brand-400 font-semibold">{formatPrice(summary.total)}</span> ready on delivery.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}