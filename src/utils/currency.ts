/**
 * Formats a number into Indian Rupee Currency string (e.g. ₹1,999 or ₹12,499.00)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return formatted;
}

/**
 * Returns clean discount percentage or fixed off text
 */
export function getDiscountBadge(originalPrice: number, finalPrice: number, discountType?: string, discountValue?: number): string | null {
  if (originalPrice <= finalPrice || finalPrice <= 0) return null;

  if (discountType === 'fixed' && discountValue) {
    return `₹${Math.round(discountValue)} OFF`;
  }

  const percent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  return percent > 0 ? `${percent}% OFF` : null;
}
