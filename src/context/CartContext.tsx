import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, DiscountCoupon } from '../types';
import { calculateOrderTotals } from '../utils/pricing';
import { discountsService } from '../services/discountsService';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
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

const LOCAL_STORAGE_CART_KEY = 'pfs_cart_items';
const LOCAL_STORAGE_COUPON_KEY = 'pfs_applied_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

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
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
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
