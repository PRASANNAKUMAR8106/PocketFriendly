export type UserRole = 'customer' | 'admin' | 'manager' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DiscountType = 'none' | 'percentage' | 'fixed';
export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  category?: Category | null;
  sku: string;
  original_price: number;
  discount_type: DiscountType;
  discount_value: number;
  final_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  product_status: ProductStatus;
  is_featured: boolean;
  is_latest_collection: boolean;
  is_new_arrival: boolean;
  is_sale: boolean;
  fabric: string;
  color: string;
  pattern: string;
  occasion: string;
  saree_length: string;
  blouse_included: boolean;
  blouse_length: string;
  care_instructions: string;
  shipping_info: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  banner_image_url: string | null;
  is_active: boolean;
  is_latest: boolean;
  start_date?: string | null;
  end_date?: string | null;
  display_order: number;
  products?: Product[];
  created_at?: string;
  updated_at?: string;
}

export interface DiscountCoupon {
  id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string | null;
  is_active: boolean;
  usage_limit?: number | null;
  used_count: number;
  created_at?: string;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default?: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cod_pending';
export type PaymentMethod = 'razorpay' | 'cod' | 'upi' | 'card';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  image_url?: string | null;
  unit_price: number;
  discount_amount: number;
  final_unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  billing_address?: Address | null;
  subtotal: number;
  discount_total: number;
  shipping_fee: number;
  tax_total: number;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_id?: string | null;
  payment_signature?: string | null;
  tracking_number?: string | null;
  carrier_name?: string | null;
  notes?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  customer_name: string;
  rating: number;
  review_title?: string;
  review_text: string;
  is_approved: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency_symbol: string;
  announcement_text: string;
  announcement_enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  hero_cta_text: string;
  hero_cta_link: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  cod_enabled: boolean;
  cod_fee: number;
  tax_percentage: number;
  social_links: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    youtube?: string;
  };
  footer_about: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  admin_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  change_quantity: number;
  previous_quantity: number;
  new_quantity: number;
  change_reason: string;
  admin_id?: string;
  created_at: string;
}
