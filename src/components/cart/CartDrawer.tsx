import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Truck, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    couponDiscount,
    total,
    appliedCoupon,
    qualifiesForFreeShipping,
    amountNeededForFreeShipping,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  const progressPercent = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-full max-w-[480px] sm:w-[480px] bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-maroon-800" />
              <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
                Shopping Bag <span className="text-maroon-800 font-sans text-sm font-semibold">({itemCount})</span>
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-stone-200/70 text-stone-500 hover:text-stone-900 transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-6 py-3">
            <div className="flex items-center gap-2 mb-1.5 text-xs text-stone-800">
              <Truck className="w-4 h-4 text-maroon-800 shrink-0" />
              {qualifiesForFreeShipping ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> You have unlocked FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-maroon-800 font-bold">{formatINR(amountNeededForFreeShipping)}</strong> more for <strong className="text-emerald-700">FREE Express Delivery</strong>!
                </span>
              )}
            </div>
            <div className="w-full bg-stone-200/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-maroon-800 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4 border border-stone-200/60 shadow-inner">
                  <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-1.5">
                  Your shopping bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6 leading-relaxed">
                  Add something beautiful to your collection from our direct-from-weaver festive edit.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/collections/latest');
                  }}
                  className="px-6 py-3 bg-maroon-800 hover:bg-maroon-900 text-white text-xs uppercase tracking-wider font-bold rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  Explore Latest Collection <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              items.map((item) => {
                const img =
                  item.product.images?.find((i) => i.is_primary)?.image_url ||
                  item.product.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

                return (
                  <div key={item.id} className="py-4 flex gap-4">
                    {/* Generous 110-140px Saree Thumbnail */}
                    <div className="w-24 h-32 sm:w-28 sm:h-36 shrink-0 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs relative">
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>

                    {/* Saree Details & Controls */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            to={`/product/${item.product.slug}`}
                            onClick={() => setIsCartOpen(false)}
                            className="font-serif text-sm font-semibold text-stone-900 hover:text-maroon-800 line-clamp-2 leading-snug transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 shrink-0"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                          <span className="truncate">{item.product.fabric}</span>
                          {item.product.color && <span>• {item.product.color}</span>}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-3 pt-2 border-t border-stone-100">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors font-bold text-sm"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors font-bold text-sm disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-stone-900">
                            {formatINR(item.product.final_price * item.quantity)}
                          </div>
                          {item.product.original_price > item.product.final_price && (
                            <div className="text-[11px] text-stone-400 line-through">
                              {formatINR(item.product.original_price * item.quantity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/90 space-y-3 shrink-0">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-lg text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatINR(couponDiscount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-stone-500 hover:text-stone-900 underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800 uppercase placeholder:normal-case shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}

              {/* Subtotal breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatINR(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Savings</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">FREE</span>
                    ) : (
                      formatINR(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-maroon-800">{formatINR(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 bg-maroon-800 hover:bg-maroon-900 text-white text-xs uppercase tracking-widest font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors text-center"
                >
                  View Full Shopping Bag
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-around text-[10px] text-stone-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-maroon-800" /> 100% Authentic Handloom
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-maroon-800" /> 7-Day Easy Returns
                </span>
                <span>•</span>
                <span>🔒 Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
