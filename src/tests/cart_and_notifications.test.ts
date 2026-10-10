import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeCartItem, LOCAL_STORAGE_CART_KEY } from '../context/CartContext';
import { personalizationService, STORAGE_KEYS } from '../services/personalizationService';

describe('Cart Badge & State Integrity Audit', () => {
  const dummyProduct = {
    id: 'prod-kanjeevaram-1',
    name: 'Royal Crimson Kanjeevaram Silk Saree',
    slug: 'royal-crimson-kanjeevaram',
    description: 'Handwoven pure silk saree',
    original_price: 3999,
    final_price: 2499,
    discount_value: 37,
    discount_type: 'percentage' as const,
    sku: 'PFS-KAN-001',
    stock_quantity: 15,
    low_stock_threshold: 3,
    is_active: true,
    is_featured: true,
    is_new_arrival: false,
    rating: 4.8,
    reviews_count: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('TEST: Discards null or corrupt cart entries without valid product object', () => {
    expect(sanitizeCartItem(null)).toBeNull();
    expect(sanitizeCartItem({})).toBeNull();
    expect(sanitizeCartItem({ product: null, quantity: 1 })).toBeNull();
    expect(sanitizeCartItem({ product: 'not-an-object', quantity: 1 })).toBeNull();
    expect(sanitizeCartItem({ product: { name: 'Incomplete' }, quantity: 1 })).toBeNull();
  });

  it('TEST: Discards items with negative, zero, or non-numeric quantity', () => {
    expect(sanitizeCartItem({ product: dummyProduct, quantity: 0 })).toBeNull();
    expect(sanitizeCartItem({ product: dummyProduct, quantity: -5 })).toBeNull();
    expect(sanitizeCartItem({ product: dummyProduct, quantity: NaN })).toBeNull();
    expect(sanitizeCartItem({ product: dummyProduct, quantity: 'invalid' })).toBeNull();
  });

  it('TEST: Clamps quantity to available stock quantity', () => {
    // Product has stock_quantity: 15. Attempting to seed 22 units must be clamped:
    const item = sanitizeCartItem({ product: dummyProduct, quantity: 22 });
    expect(item).not.toBeNull();
    expect(item?.quantity).toBe(15);
  });

  it('TEST: Accurately calculates total units vs unique items', () => {
    const items = [
      { id: '1', product_id: 'prod-1', product: dummyProduct, quantity: 3 },
      { id: '2', product_id: 'prod-2', product: { ...dummyProduct, id: 'prod-2' }, quantity: 2 },
    ];

    const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
    const uniqueItems = items.length;

    expect(totalUnits).toBe(5);
    expect(uniqueItems).toBe(2);
  });

  it('TEST: Empty cart strictly yields 0 units and 0 unique items (no badge)', () => {
    const items: any[] = [];
    const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
    expect(totalUnits).toBe(0);
    expect(items.length).toBe(0);
  });
});

describe('Abandoned Cart & Notification Protection Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('TEST: Rejects abandoned cart nudge when cart is empty', () => {
    expect(personalizationService.isEligibleForAbandonedCartNudge(0)).toBe(false);
  });

  it('TEST: Rejects abandoned cart nudge when user has active recent activity (< 15 mins dwell time)', () => {
    // Simulate user modified cart 2 minutes ago
    localStorage.setItem(STORAGE_KEYS.CART_ACTIVITY_TS, (Date.now() - 2 * 60 * 1000).toString());
    expect(personalizationService.isEligibleForAbandonedCartNudge(3)).toBe(false);
  });

  it('TEST: Accepts abandoned cart nudge when cart has genuine dwell time (> 15 mins)', () => {
    // Simulate user modified cart 20 minutes ago
    localStorage.setItem(STORAGE_KEYS.CART_ACTIVITY_TS, (Date.now() - 20 * 60 * 1000).toString());
    expect(personalizationService.isEligibleForAbandonedCartNudge(2)).toBe(true);
  });

  it('TEST: Enforces 24-hour cooldown once abandoned cart nudge is triggered', () => {
    localStorage.setItem(STORAGE_KEYS.CART_ACTIVITY_TS, (Date.now() - 30 * 60 * 1000).toString());
    // First check is eligible
    expect(personalizationService.isEligibleForAbandonedCartNudge(1)).toBe(true);

    // After triggering getContextualNudge, timestamp is recorded
    const nudge = personalizationService.getContextualNudge(1, 'Crimson Saree', 'https://example.com/img.jpg');
    expect(nudge).not.toBeNull();
    expect(nudge?.type).toBe('cart_abandoned');

    // Subsequent check within 24h must be rejected
    expect(personalizationService.isEligibleForAbandonedCartNudge(1)).toBe(false);
  });

  it('TEST: Suppresses abandoned cart nudge when customer opted out of notifications', () => {
    localStorage.setItem(STORAGE_KEYS.CART_ACTIVITY_TS, (Date.now() - 30 * 60 * 1000).toString());
    personalizationService.setNotificationOptOut(true);

    expect(personalizationService.isNotificationOptedOut()).toBe(true);
    expect(personalizationService.isEligibleForAbandonedCartNudge(2)).toBe(false);
    expect(personalizationService.getContextualNudge(2)).toBeNull();
  });

  it('TEST: Suppresses abandoned cart nudge when user completed an order recently', () => {
    localStorage.setItem(STORAGE_KEYS.CART_ACTIVITY_TS, (Date.now() - 30 * 60 * 1000).toString());
    personalizationService.recordOrderCompleted();

    expect(personalizationService.isEligibleForAbandonedCartNudge(1)).toBe(false);
  });

  it('TEST: Respects session dismissal of abandoned cart nudge', () => {
    localStorage.setItem(STORAGE_KEYS.CART_ACTIVITY_TS, (Date.now() - 30 * 60 * 1000).toString());
    personalizationService.dismissNudge('cart_abandoned');

    expect(personalizationService.isEligibleForAbandonedCartNudge(1)).toBe(false);
  });

  it('TEST: Never manufactures fabricated popups when cart is empty', () => {
    const nudge = personalizationService.getContextualNudge(0);
    expect(nudge).toBeNull();
  });
});
