import { useState, useEffect } from 'react'
import { useAuth }    from '@/hooks/useAuth'
import { useMenu }    from '@/hooks/useMenu'
import { useCart }    from '@/hooks/useCart'
import { useOrders }  from '@/hooks/useOrders'
import { Header }     from '@/components/shared/Header'
import { HomePage }   from '@/pages/HomePage'
import { MenuPage }   from '@/pages/MenuPage'
import { AboutPage}  from '@/pages/AboutPage'
import { AdminPage }  from '@/pages/AdminPage'
import { OrderHistoryPage } from '@/components/admin/OrderHistoryPage'
import { AuthModal }  from '@/components/shared/AuthModal'
import { CartDrawer } from '@/components/customer/CartDrawer'
import { Loader }     from '@/components/shared/Loader'

export type View = 'home' | 'menu' | 'about' | 'admin' | 'orders'

export default function App() {
  const auth   = useAuth()
  const menu   = useMenu()
  const cart   = useCart(auth.uid)
  const orders = useOrders(auth.uid)

  const [view,     setView]     = useState<View>('home')
  const [showAuth, setShowAuth] = useState(false)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    if (auth.needsNewPass) setShowAuth(true)
  }, [auth.needsNewPass])

  useEffect(() => {
    if (!auth.uid) { setView('home'); setShowCart(false) }
  }, [auth.uid])

  const handleAddToCart = async (menuItemId: string) => {
    if (!auth.uid) { setShowAuth(true); return }
    await cart.addToCart(menuItemId)
  }

  const handleSignOut = async () => {
    await auth.signOut()
  }

  // Reload orders when checkout succeeds (cart gets cleared)
  const handleCartClose = () => {
    setShowCart(false)
    orders.reload()
  }

  if (auth.loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={auth.profile}
        cartCount={cart.summary.count}
        onSignIn={() => setShowAuth(true)}
        onCartOpen={() => setShowCart(true)}
        onSignOut={handleSignOut}
        onAdminPanel={() => setView(v => v === 'admin' ? 'menu' : 'admin')}
        onNavigate={setView}
        activeView={view}
      />

      <main className="flex-1">
        {view === 'admin' && auth.isAdmin ? (
          <AdminPage
            items={menu.items}
            loading={menu.loading}
            onAdd={menu.addItem}
            onUpdate={menu.updateItem}
            onDelete={menu.deleteItem}
          />
        ) : view === 'orders' && auth.uid ? (
          <OrderHistoryPage
            orders={orders.orders}
            loading={orders.loading}
            onViewMenu={() => setView('menu')}
          />
        ) : view === 'menu' ? (
          <MenuPage
            items={menu.items}
            loading={menu.loading}
            cartItemIds={cart.summary.items.map(i => i.menu_item_id)}
            onAddToCart={handleAddToCart}
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
          onClose={handleCartClose}
          onRemove={cart.removeFromCart}
          onUpdateQty={cart.updateQuantity}
          onClear={cart.clearCart}
        />
      )}
    </div>
  )
}
