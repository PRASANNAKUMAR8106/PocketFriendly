import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';

export const CartPage: React.FC = () => {
  const {
    items,
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
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

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

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
          Looks like you haven't added any sarees to your bag yet. Discover our latest festive collections at affordable prices!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs uppercase tracking-wider font-bold rounded-lg shadow-md transition-all active:scale-95"
        >
          Explore Sarees <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-stone-900 mb-8 pb-4 border-b border-stone-200">
        Shopping Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert Banner */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-stone-800 font-medium mb-2">
              <Truck className="w-4 h-4 text-maroon-800" />
              {qualifiesForFreeShipping ? (
                <span className="text-emerald-800 font-bold">
                  🎉 Congratulations! Your order qualifies for Free All-India Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-maroon-800">{formatINR(amountNeededForFreeShipping)}</strong> more to get <strong className="text-emerald-700">FREE Shipping</strong>!
                </span>
              )}
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-maroon-800 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
            {items.map((item) => {
              const img = item.product.images?.find(i => i.is_primary)?.image_url || item.product.images?.[0]?.image_url;
              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-20 h-26 object-cover rounded-lg bg-stone-100 border border-stone-200 shrink-0"
                    />
                    <div>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-base font-bold text-stone-900 hover:text-maroon-800 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">Fabric: {item.product.fabric}</p>
                      <p className="text-xs text-stone-500">Color: {item.product.color}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-sm font-bold text-stone-900">
                          {formatINR(item.product.final_price)}
                        </span>
                        {item.product.original_price > item.product.final_price && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatINR(item.product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-200 font-bold text-xs disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal for line item */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-base font-bold text-stone-900">
                        {formatINR(item.product.final_price * item.quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link to="/shop" className="text-xs font-semibold text-maroon-800 hover:underline">
              ← Continue Shopping Sarees
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-stone-500 hover:text-stone-800 underline font-medium">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated All-India Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                <span>Grand Total</span>
                <span className="text-maroon-800">{formatINR(total)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-maroon-950/20 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-around text-[11px] text-stone-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600" /> 100% Secure
              </div>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" /> Easy 7-Day Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
