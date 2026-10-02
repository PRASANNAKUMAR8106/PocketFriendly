import { describe, it, expect } from 'vitest';
import { calculateFinalPrice, calculateOrderTotals } from '../utils/pricing';

describe('Pricing and Discount Calculation Engine', () => {
  it('correctly calculates percentage discounts', () => {
    // Example: ₹2,499 with 20% discount
    const res = calculateFinalPrice(2499, 'percentage', 20);
    expect(res.originalPrice).toBe(2499);
    expect(res.discountPercentage).toBe(20);
    expect(res.hasDiscount).toBe(true);
    expect(res.finalPrice).toBe(1999.2);
  });

  it('correctly calculates fixed amount discounts', () => {
    // Example: ₹2,499 with ₹500 discount
    const res = calculateFinalPrice(2499, 'fixed', 500);
    expect(res.originalPrice).toBe(2499);
    expect(res.discountAmount).toBe(500);
    expect(res.hasDiscount).toBe(true);
    expect(res.finalPrice).toBe(1999);
  });

  it('handles products without discount correctly', () => {
    const res = calculateFinalPrice(1899, 'none', 0);
    expect(res.originalPrice).toBe(1899);
    expect(res.finalPrice).toBe(1899);
    expect(res.hasDiscount).toBe(false);
  });

  it('prevents negative final prices', () => {
    const res = calculateFinalPrice(500, 'fixed', 1000);
    expect(res.finalPrice).toBe(0);
  });

  it('calculates cart totals and grants free shipping when threshold is met', () => {
    const items = [
      { price: 1200, quantity: 1 },
      { price: 800, quantity: 1 },
    ];
    // Subtotal: 2000 >= 999 threshold -> free shipping
    const totals = calculateOrderTotals(items, 999, 99, 0, false, 0);
    expect(totals.subtotal).toBe(2000);
    expect(totals.shippingFee).toBe(0);
    expect(totals.qualifiesForFreeShipping).toBe(true);
    expect(totals.total).toBe(2000);
  });

  it('applies standard shipping fee when subtotal is below threshold', () => {
    const items = [{ price: 499, quantity: 1 }];
    // Subtotal: 499 < 999 threshold -> 99 shipping fee
    const totals = calculateOrderTotals(items, 999, 99, 0, false, 0);
    expect(totals.subtotal).toBe(499);
    expect(totals.shippingFee).toBe(99);
    expect(totals.qualifiesForFreeShipping).toBe(false);
    expect(totals.amountNeededForFreeShipping).toBe(500);
    expect(totals.total).toBe(598);
  });

  it('applies COD fee when Cash on Delivery is selected', () => {
    const items = [{ price: 1500, quantity: 1 }];
    // Free shipping (subtotal >= 999) + ₹49 COD fee
    const totals = calculateOrderTotals(items, 999, 99, 0, true, 49);
    expect(totals.shippingFee).toBe(0);
    expect(totals.paymentFee).toBe(49);
    expect(totals.total).toBe(1549);
  });
});
