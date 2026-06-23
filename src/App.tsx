import { useState, useEffect } from 'react'
import { useAuth }     from '@/hooks/useAuth'
import { useMenu }     from '@/hooks/useMenu'
import { useCart }     from '@/hooks/useCart'
import { useOrders }   from '@/hooks/useOrders'
import { useWishlist } from '@/hooks/useWishlist'
import { Header }      from '@/components/shared/Header'
import { AnnouncementBanner } from '@/components/shared/AnnouncementBanner'
import { HomePage }    from '@/pages/HomePage'
import { MenuPage }    from '@/pages/MenuPage'
import { AboutPage }   from '@/pages/AboutPage'
import { AdminPage }   from '@/pages/AdminPage'
import { OrderTrackingPage } from '@/components/customer/OrderTrackingPage'
import { AuthModal }   from '@/components/shared/AuthModal'
import { CartDrawer }  from '@/components/customer/CartDrawer'
import { CheckoutPage } from '@/components/customer/CheckoutPage'
import { Loader }      from '@/components/shared/Loader'

export type View = 'home' | 'menu' | 'about' | 'admin' | 'orders'

export default function App() {
  const auth    = useAuth()
  const menu    = useMenu()
  const cart    = useCart(auth.uid)
  const orders  = useOrders(auth.uid)
  const wish    = useWishlist(auth.uid)

  const [view,         setView]         = useState<View>('home')
  const [showAuth,     setShowAuth]     = useState(false)
  const [showCart,     setShowCart]     = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => { if (auth.needsNewPass) setShowAuth(true) }, [auth.needsNewPass])
  useEffect(() => { if (!auth.uid) { setView('home'); setShowCart(false) } }, [auth.uid])

  const handleAddToCart = async (menuItemId: string) => {
    if (!auth.uid) { setShowAuth(true); return }
    await cart.addToCart(menuItemId)
  }

  const handleToggleWish = async (menuItemId: string) => {
    if (!auth.uid) { setShowAuth(true); return }
    await wish.toggle(menuItemId)
  }

  const handleCheckoutSuccess = async () => {
    await cart.clearCart()
    setShowCheckout(false)
    setShowCart(false)
    orders.reload()
    setView('orders')  // take user to order tracking
  }

  if (auth.loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={auth.profile}
        cartCount={cart.summary.count}
        onSignIn={() => setShowAuth(true)}
        onCartOpen={() => setShowCart(true)}
        onSignOut={auth.signOut}
        onAdminPanel={() => setView(v => v === 'admin' ? 'menu' : 'admin')}
        onNavigate={setView}
        activeView={view}
      />

      {/* Global announcement banners */}
      <AnnouncementBanner />

      <main className="flex-1">
        {view === 'admin' && auth.isAdmin ? (
          <AdminPage
            items={menu.items} loading={menu.loading}
            onAdd={menu.addItem} onUpdate={menu.updateItem} onDelete={menu.deleteItem}
          />
        ) : view === 'orders' && auth.uid ? (
          <OrderTrackingPage userId={auth.uid} />
        ) : view === 'menu' ? (
          <MenuPage
            items={menu.items} loading={menu.loading}
            cartItemIds={cart.summary.items.map(i => i.menu_item_id)}
            wishlistIds={wish.wishlist}
            userId={auth.uid}
            onAddToCart={handleAddToCart}
            onToggleWish={handleToggleWish}
            onLoginRequired={() => setShowAuth(true)}
          />
        ) : view === 'about' ? (
          <AboutPage />
        ) : (
          <HomePage onViewMenu={() => setView('menu')} />
        )}
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={() => setShowAuth(false)}
          signIn={auth.signIn}
          signUp={auth.signUp}
          resendConfirmation={auth.resendConfirmation}
          sendPasswordReset={auth.sendPasswordReset}
          updatePassword={auth.updatePassword}
          needsNewPass={auth.needsNewPass}
        />
      )}

      {showCart && !auth.isAdmin && (
        <CartDrawer
          summary={cart.summary}
          userId={auth.uid}
          onClose={() => { setShowCart(false); orders.reload() }}
          onRemove={cart.removeFromCart}
          onUpdateQty={cart.updateQuantity}
          onClear={cart.clearCart}
          onCheckout={() => { setShowCart(false); setShowCheckout(true) }}
        />
      )}

      {showCheckout && auth.uid && !auth.isAdmin && (
        <CheckoutPage
          summary={cart.summary}
          userId={auth.uid}
          onBack={() => { setShowCheckout(false); setShowCart(true) }}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  )
}