import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';
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

  const progressPercent = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-maroon-800" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-amber-50/70 border-b border-amber-100 p-3 text-xs">
            <div className="flex items-center gap-1.5 mb-1.5 text-stone-800 font-medium">
              <Truck className="w-4 h-4 text-maroon-800 shrink-0" />
              {qualifiesForFreeShipping ? (
                <span className="text-emerald-800 font-semibold">
                  🎉 Congratulations! You have unlocked Free All-India Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-maroon-800">{formatINR(amountNeededForFreeShipping)}</strong> more to get <strong className="text-emerald-700">FREE Shipping</strong>!
                </span>
              )}
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-maroon-800 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-semibold text-stone-800 mb-1">
                  Your shopping bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-5">
                  Explore our handcrafted Banarasi, Kanjeevaram, and Chanderi sarees at affordable prices.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-semibold rounded-md shadow-sm transition-all"
                >
                  Explore Sarees
                </button>
              </div>
            ) : (
              items.map((item) => {
                const img = item.product.images?.find(i => i.is_primary)?.image_url || item.product.images?.[0]?.image_url;
                return (
                  <div key={item.id} className="py-3 flex gap-3">
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-16 h-22 object-cover rounded bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <Link
                            to={`/product/${item.product.slug}`}
                            onClick={() => setIsCartOpen(false)}
                            className="font-serif text-xs font-semibold text-stone-900 hover:text-maroon-800 line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500">{item.product.fabric}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-stone-200 rounded text-xs bg-stone-50">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-200"
                          >
                            -
                          </button>
                          <span className="px-2.5 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-900">
                            {formatINR(item.product.final_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatINR(couponDiscount)})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-stone-500 hover:text-stone-800 underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-maroon-800 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}

              {/* Subtotal breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-maroon-800">{formatINR(total)}</span>
                </div>
              </div>

              {/* Primary Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-maroon-800 hover:bg-maroon-900 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-stone-400">
                🔒 Safe & Secure Indian Payment Gateway • Cash on Delivery Available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
