import { DiscountType } from '../types';

export interface PriceCalculationResult {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  hasDiscount: boolean;
}

/**
 * Accurately calculates final price given original price and discount specification
 */
export function calculateFinalPrice(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number
): PriceCalculationResult {
  const orig = Math.max(0, Number(originalPrice) || 0);
  const val = Math.max(0, Number(discountValue) || 0);

  let final = orig;
  let discountAmt = 0;

  if (discountType === 'percentage' && val > 0) {
    const cappedPercent = Math.min(100, val);
    discountAmt = Math.round((orig * (cappedPercent / 100)) * 100) / 100;
    final = Math.max(0, orig - discountAmt);
  } else if (discountType === 'fixed' && val > 0) {
    discountAmt = Math.min(orig, val);
    final = Math.max(0, orig - discountAmt);
  }

  const discountPercentage = orig > 0 ? Math.round((discountAmt / orig) * 100) : 0;

  return {
    originalPrice: orig,
    finalPrice: final,
    discountAmount: discountAmt,
    discountPercentage,
    hasDiscount: discountAmt > 0 && final < orig,
  };
}

/**
 * Calculates cart subtotal, shipping fee, tax, and grand total based on authoritative settings
 */
export function calculateOrderTotals(
  items: Array<{ price: number; quantity: number }>,
  shippingThreshold: number = 999,
  standardShippingFee: number = 99,
  couponDiscount: number = 0,
  isCod: boolean = false,
  codFee: number = 49
) {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate shipping
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  
  // Additional COD fee if applicable
  const paymentFee = isCod ? codFee : 0;
  
  // Total discount cannot exceed subtotal
  const applicableCouponDiscount = Math.min(subtotal, Math.max(0, couponDiscount));
  
  // Grand total
  const total = Math.max(0, (subtotal - applicableCouponDiscount) + shippingFee + paymentFee);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee,
    paymentFee,
    couponDiscount: applicableCouponDiscount,
    total: Math.round(total * 100) / 100,
    qualifiesForFreeShipping: subtotal >= shippingThreshold,
    amountNeededForFreeShipping: Math.max(0, shippingThreshold - subtotal),
  };
}
