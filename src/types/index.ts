// ─── Database row types ───────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  offer_percent: number
  available: boolean
  is_new: boolean
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  menu_item_id: string
  quantity: number
  created_at: string
  menu_items: MenuItem
}

// ─── App-layer types ──────────────────────────────────────────────────────────

export type Category = 'All' | 'Pizza' | 'Burgers' | 'Salads' | 'Pasta' | 'Drinks' | 'Desserts'

export interface CartSummary {
  items: CartItem[]
  count: number
  total: number
}

export interface MenuItemFormData {
  name: string
  description: string
  price: string
  category: string
  image_url: string
  offer_percent: string
  available: boolean
  is_new: boolean
}

// ─── Auth flow ────────────────────────────────────────────────────────────────

export type AuthView =
  | 'sign_in'
  | 'sign_up'
  | 'confirm_pending'
  | 'forgot_password'
  | 'update_password'

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export type TrackingStatus =
  | 'pending' | 'confirmed' | 'preparing'
  | 'parcel_picked' | 'on_the_way' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  user_id: string
  items: CheckoutItem[]
  total: number
  status: OrderStatus
  tracking_status: TrackingStatus
  delivery_address?: Record<string, string>
  payment_method?: string
  payment_ref?: string
  delivery_name?: string
  delivery_phone?: string
  tracking_note?: string
  delivered_at?: string
  created_at: string
}

export interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id:         string
  name:       string
  profession: string | null
  comment:    string
  stars:      number
  created_at: string
}

// ─── Announcements ────────────────────────────────────────────────────────────

export type AnnouncementType = 'info' | 'success' | 'warning' | 'alert'

export interface Announcement {
  id:         string
  title:      string
  body:       string
  type:       AnnouncementType
  show_from:  string
  show_until: string | null
  active:     boolean
  created_at: string
}