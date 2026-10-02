import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Truck, Lock, CreditCard, Banknote, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { checkoutSchema, CheckoutFormData } from '../utils/validation';
import { ordersService } from '../services/ordersService';
import { formatINR } from '../utils/currency';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, shippingFee, couponDiscount, total, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      paymentMethod: 'cod',
      notes: '',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');
  const codFee = selectedPaymentMethod === 'cod' ? settings.cod_fee : 0;
  const finalPayable = total + codFee;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-stone-500 mb-6">
          Add sarees to your shopping bag before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-maroon-800 text-white rounded font-medium text-xs shadow hover:bg-maroon-900 transition-colors"
        >
          Browse Sarees
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderRes = await ordersService.placeOrder({
        userId: user?.id || null,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          full_name: data.fullName,
          phone: data.phone,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: 'India',
        },
        items: items.map(i => ({ productId: i.product_id, quantity: i.quantity })),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      });

      if (!orderRes.success || !orderRes.order) {
        setOrderError(orderRes.error || 'Failed to place order. Please review your cart.');
        setIsSubmitting(false);
        return;
      }

      const createdOrder = orderRes.order;

      // Handle Razorpay Online Gateway if selected
      if (data.paymentMethod === 'razorpay') {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890ABCD';
        
        if (typeof (window as any).Razorpay !== 'undefined') {
          const options = {
            key: razorpayKey,
            amount: Math.round(createdOrder.total_amount * 100),
            currency: 'INR',
            name: 'PocketFriendly Sarees',
            description: `Order #${createdOrder.order_number}`,
            image: '/favicon.svg',
            handler: async function (response: any) {
              await ordersService.updateOrderStatus(
                createdOrder.id,
                'confirmed',
                'paid',
                undefined,
                undefined
              );
              clearCart();
              navigate(`/order-confirmation/${createdOrder.order_number}`);
            },
            prefill: {
              name: data.fullName,
              email: data.email,
              contact: data.phone,
            },
            theme: {
              color: '#800020',
            },
            modal: {
              ondismiss: function () {
                // If user closes modal, keep order as confirmed/pending
                clearCart();
                navigate(`/order-confirmation/${createdOrder.order_number}`);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }
      }

      // Cash on Delivery or fallback
      clearCart();
      navigate(`/order-confirmation/${createdOrder.order_number}`);
    } catch (err: any) {
      setOrderError(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          256-bit SSL Encrypted • Direct Weaver Verification
        </p>
      </div>

      {orderError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{orderError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer & Delivery Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact Information */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                1. Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="e.g. ananya@example.com"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Indian Mobile Number * (10 Digits for Delivery Updates)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs bg-stone-100 border border-r-0 border-stone-300 rounded-l-lg text-stone-600 font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      {...register('phone')}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-r-lg focus:outline-none focus:border-maroon-800"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>2. Delivery Address (India)</span>
                <Truck className="w-4 h-4 text-maroon-800" />
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Flat / House No., Apartment, Street *</label>
                  <input
                    type="text"
                    {...register('addressLine1')}
                    placeholder="e.g. Flat 402, Royal Residency, M.G. Road"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                  {errors.addressLine1 && <p className="text-[11px] text-rose-600 mt-1">{errors.addressLine1.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Area / Colony / Street</label>
                    <input
                      type="text"
                      {...register('addressLine2')}
                      placeholder="e.g. Indiranagar"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      {...register('landmark')}
                      placeholder="e.g. Near Metro Station"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City / Town *</label>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder="e.g. Bangalore"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                    <input
                      type="text"
                      {...register('state')}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                    />
                    {errors.state && <p className="text-[11px] text-rose-600 mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code * (6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      {...register('pincode')}
                      placeholder="e.g. 560038"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                    />
                    {errors.pincode && <p className="text-[11px] text-rose-600 mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Notes (Optional)</label>
                  <input
                    type="text"
                    {...register('notes')}
                    placeholder="e.g. Call before delivery, leave with security"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>3. Payment Method</span>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                {settings.cod_enabled && (
                  <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'cod' ? 'border-maroon-800 bg-maroon-50/40 ring-1 ring-maroon-800' : 'border-stone-200 hover:bg-stone-50'
                  }`}>
                    <input
                      type="radio"
                      value="cod"
                      {...register('paymentMethod')}
                      className="mt-1 accent-maroon-800"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-maroon-800" /> Cash on Delivery (COD)
                        </span>
                        {settings.cod_fee > 0 && (
                          <span className="text-[11px] text-stone-500 font-medium">+{formatINR(settings.cod_fee)} handling</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Pay cash or scan UPI upon receiving your saree delivery package.
                      </p>
                    </div>
                  </label>
                )}

                {/* Razorpay Online */}
                <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedPaymentMethod === 'razorpay' ? 'border-maroon-800 bg-maroon-50/40 ring-1 ring-maroon-800' : 'border-stone-200 hover:bg-stone-50'
                }`}>
                  <input
                    type="radio"
                    value="razorpay"
                    {...register('paymentMethod')}
                    className="mt-1 accent-maroon-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-maroon-800" /> Online Payment (UPI, Cards, NetBanking)
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Fastest Dispatch</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Pay instantly via Google Pay, PhonePe, Paytm, Any UPI app, or Credit/Debit Cards.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Authoritative Order Review (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-serif text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
                Order Review ({items.length} {items.length === 1 ? 'saree' : 'sarees'})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => {
                  const img = item.product.images?.find(i => i.is_primary)?.image_url || item.product.images?.[0]?.image_url;
                  return (
                    <div key={item.id} className="flex gap-3 text-xs items-center">
                      <img src={img} alt="" className="w-12 h-16 object-cover rounded bg-stone-100 shrink-0 border border-stone-200" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-stone-900 truncate">{item.product.name}</p>
                        <p className="text-stone-500 text-[11px]">{item.product.fabric}</p>
                        <p className="text-stone-500 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-stone-900 shrink-0">
                        {formatINR(item.product.final_price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Savings</span>
                    <span>-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>All-India Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingFee)}</span>
                </div>
                {selectedPaymentMethod === 'cod' && codFee > 0 && (
                  <div className="flex justify-between">
                    <span>COD Handling Fee</span>
                    <span>{formatINR(codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-maroon-800">{formatINR(finalPayable)}</span>
                </div>
              </div>

              {/* Confirm & Place Order CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-maroon-950/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <span>
                    Place Order • {formatINR(finalPayable)}
                  </span>
                )}
              </button>

              <div className="text-[10px] text-center text-stone-400 space-y-1">
                <p>By placing order, you agree to our Terms and 7-Day Return Policy.</p>
                <p className="text-emerald-700 font-medium">✓ Safe & Verified Transaction</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
