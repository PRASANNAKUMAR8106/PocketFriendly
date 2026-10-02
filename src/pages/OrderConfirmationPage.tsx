import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, MapPin, Calendar, Clock } from 'lucide-react';
import { ordersService } from '../services/ordersService';
import { Order } from '../types';
import { formatINR } from '../utils/currency';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#800020', '#C5A059', '#10B981'],
      });
    } catch (e) {
      // ignore
    }

    if (orderNumber) {
      ordersService.getOrderById(orderNumber).then(res => {
        setOrder(res);
        setLoading(false);
      });
    }
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-maroon-800 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
          Retrieving your order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">
          We couldn't locate the details for this order. Please verify your order number.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-maroon-800 text-white rounded font-medium text-xs shadow hover:bg-maroon-900"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const timelineSteps = [
    { title: 'Order Confirmed', desc: 'We have received your order', done: true },
    { title: 'Processing & Quality Check', desc: 'Handcrafted inspection', done: ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.order_status) },
    { title: 'Packed', desc: 'Sealed in protective wrap', done: ['packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.order_status) },
    { title: 'Dispatched & On the Way', desc: 'Handed to courier', done: ['shipped', 'out_for_delivery', 'delivered'].includes(order.order_status) },
    { title: 'Delivered', desc: 'At your doorstep', done: order.order_status === 'delivered' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm text-center space-y-3 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Thank you, {order.customer_name}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          We have sent an order confirmation with invoice details to <strong className="text-stone-900">{order.customer_email}</strong>.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          <span className="bg-stone-100 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200">
            Order ID: <strong>{order.order_number}</strong>
          </span>
          <span className="bg-stone-100 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200">
            Payment: <strong className="uppercase">{order.payment_method}</strong> ({order.payment_status})
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Status Pipeline Timeline */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mb-8 print:hidden">
        <h2 className="font-serif text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-maroon-800" /> Order Status Timeline
        </h2>
        <div className="relative pl-6 space-y-6 border-l-2 border-stone-200 ml-3">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative">
              <span
                className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-white ${
                  step.done ? 'border-maroon-800 bg-maroon-800 ring-4 ring-maroon-100' : 'border-stone-300'
                }`}
              />
              <h3 className={`text-xs font-bold ${step.done ? 'text-stone-900' : 'text-stone-400'}`}>
                {step.title}
              </h3>
              <p className="text-[11px] text-stone-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary & Delivery Address Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-maroon-800" /> Delivery Address
          </h2>
          <div className="text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-900">{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.address_line1}</p>
            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
            {order.shipping_address.landmark && <p>Landmark: {order.shipping_address.landmark}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
            <p>Phone: +91 {order.shipping_address.phone}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">
            Payment Summary
          </h2>
          <div className="text-xs text-stone-600 space-y-2">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount Applied</span>
                <span>-{formatINR(order.discount_total)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{order.shipping_fee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Paid / Payable</span>
              <span className="text-maroon-800">{formatINR(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Ordered Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <h2 className="font-serif text-sm font-bold text-stone-900">
            Items Ordered ({order.items?.length || 0})
          </h2>
        </div>
        <div className="divide-y divide-stone-100 p-4">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt="" className="w-12 h-16 object-cover rounded bg-stone-100 border border-stone-200 shrink-0" />
                )}
                <div>
                  <p className="font-serif font-bold text-stone-900">{item.product_name}</p>
                  <p className="text-[11px] text-stone-500">SKU: {item.sku} • Qty: {item.quantity}</p>
                  <p className="text-[11px] text-stone-500">Unit Price: {formatINR(item.final_unit_price)}</p>
                </div>
              </div>
              <span className="font-bold text-stone-900 shrink-0">
                {formatINR(item.total_price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/account/orders"
          className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-lg border border-stone-300 transition-colors text-center"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
};
