import { supabase, isSupabaseConfigured } from './supabase';
import { Order, OrderItem, OrderStatus, PaymentStatus, Address } from '../types';
import { productsService } from './productsService';
import { calculateOrderTotals } from '../utils/pricing';

const LOCAL_STORAGE_ORDERS_KEY = 'pfs_orders_cache';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local orders', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving local orders', e);
  }
}

export interface PlaceOrderInput {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress?: Address | null;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: 'cod' | 'razorpay';
  couponCode?: string;
  notes?: string;
}

export const ordersService = {
  async placeOrder(input: PlaceOrderInput): Promise<{ success: boolean; order?: Order; error?: string }> {
    // 1. Fetch authoritative product records to ensure price & stock integrity
    const orderItems: OrderItem[] = [];
    const pricingItems: Array<{ price: number; quantity: number }> = [];

    for (const item of input.items) {
      const product = await productsService.getProductById(item.productId);
      if (!product) {
        return { success: false, error: `Product not found.` };
      }
      if (product.product_status !== 'active') {
        return { success: false, error: `"${product.name}" is no longer available.` };
      }
      if (product.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} left.`,
        };
      }

      const primaryImg = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;

      orderItems.push({
        id: `oi-${Date.now()}-${item.productId}`,
        order_id: '',
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        image_url: primaryImg,
        unit_price: product.original_price,
        discount_amount: product.original_price - product.final_price,
        final_unit_price: product.final_price,
        quantity: item.quantity,
        total_price: product.final_price * item.quantity,
      });

      pricingItems.push({
        price: product.final_price,
        quantity: item.quantity,
      });
    }

    // 2. Authoritative calculation of totals
    const totals = calculateOrderTotals(
      pricingItems,
      999, // Free shipping threshold
      99,  // Std shipping
      0,   // coupon handled if any
      input.paymentMethod === 'cod',
      49   // COD fee
    );

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `PFS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: input.userId || null,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress || input.shippingAddress,
      subtotal: totals.subtotal,
      discount_total: totals.couponDiscount,
      shipping_fee: totals.shippingFee,
      tax_total: Math.round(totals.subtotal * 0.05 * 100) / 100, // 5% GST
      total_amount: totals.total,
      order_status: 'confirmed',
      payment_status: input.paymentMethod === 'cod' ? 'cod_pending' : 'pending',
      payment_method: input.paymentMethod,
      notes: input.notes,
      items: orderItems.map(oi => ({ ...oi, order_id: orderId })),
      created_at: new Date().toISOString(),
    };

    // 3. If Supabase is configured, execute via atomic function or database insert
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('place_order_atomic', {
          p_user_id: input.userId || null,
          p_customer_name: input.customerName,
          p_customer_email: input.customerEmail,
          p_customer_phone: input.customerPhone,
          p_shipping_address: input.shippingAddress,
          p_billing_address: input.billingAddress || input.shippingAddress,
          p_items: input.items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
          p_payment_method: input.paymentMethod,
          p_notes: input.notes || null,
        });

        if (!error && data?.success) {
          newOrder.id = data.order_id;
          newOrder.order_number = data.order_number;
          newOrder.total_amount = Number(data.total_amount);
          return { success: true, order: newOrder };
        }
      } catch (err) {
        console.warn('Supabase atomic order call failed, continuing with direct update', err);
      }
    }

    // 4. Update product stocks
    for (const item of input.items) {
      const prod = await productsService.getProductById(item.productId);
      if (prod) {
        await productsService.updateStock(prod.id, prod.stock_quantity - item.quantity);
      }
    }

    // 5. Persist order
    const localOrders = getLocalOrders();
    saveLocalOrders([newOrder, ...localOrders]);

    return { success: true, order: newOrder };
  },

  async getOrders(params?: { userId?: string; status?: OrderStatus }): Promise<Order[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
        if (params?.userId) q = q.eq('user_id', params.userId);
        if (params?.status) q = q.eq('order_status', params.status);
        const { data, error } = await q;
        if (!error && data) return data as Order[];
      } catch (err) {
        console.warn('Supabase getOrders failed', err);
      }
    }

    let orders = getLocalOrders();
    if (params?.userId) {
      orders = orders.filter(o => o.user_id === params.userId);
    }
    if (params?.status) {
      orders = orders.filter(o => o.order_status === params.status);
    }
    return orders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data as Order;
      } catch (err) {
        console.warn('Supabase order fetch failed', err);
      }
    }

    const local = getLocalOrders().find(o => o.id === id || o.order_number === id);
    return local || null;
  },

  async updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    trackingNumber?: string,
    carrierName?: string
  ): Promise<Order | null> {
    const updates: Partial<Order> = {
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (paymentStatus) updates.payment_status = paymentStatus;
    if (trackingNumber) updates.tracking_number = trackingNumber;
    if (carrierName) updates.carrier_name = carrierName;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Order;
      } catch (err) {
        console.warn('Supabase update status failed', err);
      }
    }

    const current = getLocalOrders();
    const index = current.findIndex(o => o.id === id);
    if (index === -1) return null;

    current[index] = { ...current[index], ...updates };
    saveLocalOrders(current);
    return current[index];
  },

  async getAdminKPIs() {
    const orders = await this.getOrders();
    const { products } = await productsService.getProducts();

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.created_at?.startsWith(todayStr));

    const totalRevenue = orders
      .filter(o => o.payment_status === 'paid' || o.order_status === 'delivered')
      .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

    const todayRevenue = todayOrders
      .filter(o => o.payment_status === 'paid' || o.order_status === 'delivered')
      .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

    const lowStockCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;
    const pendingOrdersCount = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.order_status)).length;
    const deliveredOrdersCount = orders.filter(o => o.order_status === 'delivered').length;

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      totalProducts: products.length,
      lowStockCount,
      pendingOrdersCount,
      deliveredOrdersCount,
    };
  }
};
