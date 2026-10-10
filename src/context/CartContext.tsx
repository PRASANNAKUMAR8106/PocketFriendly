import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, DiscountCoupon } from '../types';
import { calculateOrderTotals } from '../utils/pricing';
import { discountsService } from '../services/discountsService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;         // Total saree units count in cart
  uniqueItemCount: number;   // Total distinct saree products in cart
  subtotal: number;
  shippingFee: number;
  couponDiscount: number;
  total: number;
  appliedCoupon: DiscountCoupon | null;
  qualifiesForFreeShipping: boolean;
  amountNeededForFreeShipping: number;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const LOCAL_STORAGE_CART_KEY = 'pfs_cart_items';
export const LOCAL_STORAGE_COUPON_KEY = 'pfs_applied_coupon';
export const LOCAL_STORAGE_CART_ACTIVITY_KEY = 'pfs_cart_last_activity_ts';

export const sanitizeCartItem = (raw: any): CartItem | null => {
  if (!raw || !raw.product || typeof raw.product !== 'object' || !raw.product.id) {
    return null;
  }
  const rawQty = Number(raw.quantity);
  if (!Number.isFinite(rawQty) || rawQty <= 0) {
    return null;
  }
  const quantity = Math.floor(rawQty);
  const maxStock = typeof raw.product.stock_quantity === 'number' && raw.product.stock_quantity > 0
    ? raw.product.stock_quantity
    : 50;
  return {
    id: raw.id || `ci-${Date.now()}-${raw.product.id}`,
    product_id: raw.product_id || raw.product.id,
    product: raw.product,
    quantity: Math.min(quantity, maxStock),
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeCartItem).filter(Boolean) as CartItem[];
        }
      }
    } catch (e) {
      console.error('Failed to parse cart items:', e);
    }
    return [];
  });

  // Sync cart from Supabase when user logs in
  useEffect(() => {
    if (user && isSupabaseConfigured) {
      supabase
        .from('carts')
        .select('id, cart_items(id, product_id, quantity, product:products(*, images:product_images(*), category:categories(*)))')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data?.cart_items && data.cart_items.length > 0) {
            const dbItems: CartItem[] = data.cart_items.map((ci: any) => ({
              id: ci.id,
              product_id: ci.product_id,
              product: ci.product,
              quantity: ci.quantity,
            })).filter((i: any) => Boolean(i.product));
            if (dbItems.length > 0) {
              setItems(dbItems);
            }
          }
        });
    }
  }, [user]);

  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COUPON_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items));
      if (items.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_CART_ACTIVITY_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(LOCAL_STORAGE_CART_ACTIVITY_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(LOCAL_STORAGE_COUPON_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_COUPON_KEY);
    }
  }, [appliedCoupon]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueItemCount = items.length;

  // Authoritative calculation
  const totals = calculateOrderTotals(
    items.map(i => ({ price: i.product.final_price, quantity: i.quantity })),
    999, // Free shipping threshold
    99,  // Std shipping fee
    appliedCoupon?.discount_type === 'percentage'
      ? (items.reduce((acc, i) => acc + (i.product.final_price * i.quantity), 0) * (appliedCoupon.discount_value / 100))
      : (appliedCoupon?.discount_value || 0),
    false,
    0
  );

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock_quantity <= 0) {
      return { success: false, message: 'Sorry, this saree is currently out of stock.' };
    }

    let message = '';
    let success = true;

    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(i => i.product_id === product.id);

      if (existingIndex > -1) {
        const currentQty = currentItems[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > product.stock_quantity) {
          message = `Only ${product.stock_quantity} available in stock.`;
          success = false;
          return currentItems;
        }

        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product, // refresh latest price
        };
        message = `Updated "${product.name}" quantity to ${newQty}.`;
        return updated;
      } else {
        if (quantity > product.stock_quantity) {
          message = `Only ${product.stock_quantity} available in stock.`;
          success = false;
          return currentItems;
        }

        message = `Added "${product.name}" to your shopping bag.`;
        return [
          ...currentItems,
          {
            id: `ci-${Date.now()}-${product.id}`,
            product_id: product.id,
            product,
            quantity,
          },
        ];
      }
    });

    if (success) {
      setIsCartOpen(true);
    }

    return { success, message };
  };

  const removeFromCart = (productId: string) => {
    setItems(current => current.filter(i => i.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(current =>
      current.map(i => {
        if (i.product_id === productId) {
          const clamped = Math.min(i.product.stock_quantity, quantity);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const applyCoupon = async (code: string) => {
    const res = await discountsService.validateCoupon(code, totals.subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      return { success: true, message: res.message || 'Coupon applied!' };
    }
    return { success: false, message: res.message || 'Invalid coupon code.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      localStorage.removeItem(LOCAL_STORAGE_COUPON_KEY);
      localStorage.removeItem(LOCAL_STORAGE_CART_ACTIVITY_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        uniqueItemCount,
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        couponDiscount: totals.couponDiscount,
        total: totals.total,
        appliedCoupon,
        qualifiesForFreeShipping: totals.qualifiesForFreeShipping,
        amountNeededForFreeShipping: totals.amountNeededForFreeShipping,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
