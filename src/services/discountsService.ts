import { supabase, isSupabaseConfigured } from './supabase';
import { DiscountCoupon } from '../types';
import { INITIAL_COUPONS } from './mockData';

const LOCAL_STORAGE_COUPONS_KEY = 'pfs_coupons_cache';

function getLocalCoupons(): DiscountCoupon[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COUPONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local coupons', e);
  }
  return INITIAL_COUPONS;
}

function saveLocalCoupons(coupons: DiscountCoupon[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_COUPONS_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error('Error saving local coupons', e);
  }
}

export const discountsService = {
  async getDiscounts(): Promise<DiscountCoupon[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as DiscountCoupon[];
      } catch (err) {
        console.warn('Supabase discounts fetch failed, fallback', err);
      }
    }
    return getLocalCoupons();
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountAmount: number; coupon?: DiscountCoupon; message?: string }> {
    const discounts = await this.getDiscounts();
    const coupon = discounts.find(d => d.code.toUpperCase() === code.trim().toUpperCase() && d.is_active);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code.' };
    }

    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      return {
        valid: false,
        discountAmount: 0,
        message: `This coupon requires a minimum purchase of ₹${coupon.min_order_value}.`,
      };
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * (coupon.discount_value / 100)) * 100) / 100;
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = Math.min(subtotal, coupon.discount_value);
    }

    return {
      valid: true,
      discountAmount,
      coupon,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}.`,
    };
  },

  async createDiscount(coupon: Partial<DiscountCoupon>): Promise<DiscountCoupon> {
    const newCoupon: DiscountCoupon = {
      id: `disc-${Date.now()}`,
      name: coupon.name || 'Special Discount',
      code: (coupon.code || `OFF${Math.floor(Math.random() * 1000)}`).toUpperCase(),
      discount_type: coupon.discount_type || 'percentage',
      discount_value: Number(coupon.discount_value) || 10,
      min_order_value: Number(coupon.min_order_value) || 0,
      max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : undefined,
      is_active: coupon.is_active ?? true,
      used_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('discounts').insert([newCoupon]).select().single();
        if (!error && data) return data as DiscountCoupon;
      } catch (err) {
        console.warn('Supabase discount create failed', err);
      }
    }

    const current = getLocalCoupons();
    const updated = [newCoupon, ...current];
    saveLocalCoupons(updated);
    return newCoupon;
  },

  async toggleDiscountStatus(id: string): Promise<boolean> {
    const current = getLocalCoupons();
    const item = current.find(d => d.id === id);
    if (!item) return false;

    item.is_active = !item.is_active;
    saveLocalCoupons(current);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('discounts').update({ is_active: item.is_active }).eq('id', id);
      } catch (e) {
        // ignore
      }
    }
    return true;
  },

  async deleteDiscount(id: string): Promise<boolean> {
    const current = getLocalCoupons();
    const updated = current.filter(d => d.id !== id);
    saveLocalCoupons(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('discounts').delete().eq('id', id);
      } catch (e) {
        // ignore
      }
    }
    return true;
  }
};
