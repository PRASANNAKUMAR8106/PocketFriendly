import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/ordersService';
import { Order } from '../types';
import { formatINR } from '../utils/currency';

export const CustomerAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // If not logged in, prompt to login
      navigate('/login');
      return;
    }

    ordersService.getOrders({ userId: user.id }).then((res) => {
      setOrders(res);
      setLoading(false);
    });
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Hero Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-full bg-maroon-800 text-gold-300 font-serif font-bold text-2xl flex items-center justify-center border-2 border-gold-500/30">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Welcome back, {user.full_name || 'Customer'}!
            </h1>
            <p className="text-xs text-stone-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-stone-500" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders' ? 'border-maroon-800 text-maroon-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" /> My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'profile' ? 'border-maroon-800 text-maroon-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" /> Profile Information
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-stone-500">Loading your orders...</div>
          ) : orders.length > 0 ? (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4 hover:border-gold-subtle transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400">Order ID: </span>
                    <strong className="text-stone-900">{ord.order_number}</strong>
                    <span className="text-stone-400 ml-3">Date: </span>
                    <span className="text-stone-600">{new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ord.order_status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.order_status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {(ord.order_status || 'placed').replace(/_/g, ' ')}
                    </span>
                    <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                      Payment: {(ord.payment_status || 'pending').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {ord.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="w-10 h-14 object-cover rounded bg-stone-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-serif font-bold text-stone-900">{item.product_name}</p>
                          <p className="text-[11px] text-stone-500">Qty: {item.quantity} • {formatINR(item.final_unit_price)} each</p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">{formatINR(item.total_price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-500">Shipping to: </span>
                    <span className="font-semibold text-stone-800">{ord.shipping_address.city}, {ord.shipping_address.pincode}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-stone-500 mr-1">Total:</span>
                      <strong className="text-base text-maroon-800 font-bold">{formatINR(ord.total_amount)}</strong>
                    </div>
                    <Link
                      to={`/order-confirmation/${ord.order_number}`}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-md border border-stone-200 transition-colors"
                    >
                      View Invoice & Tracking
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
              <Package className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">No Orders Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                You have not placed any orders yet. Discover our sarees and drape in pure elegance!
              </p>
              <Link
                to="/shop"
                className="px-5 py-2.5 bg-maroon-800 text-white text-xs font-bold rounded-md shadow"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Saved Info */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-stone-500 block mb-1">Full Name</label>
              <p className="font-bold text-stone-900 bg-stone-50 p-2.5 rounded border border-stone-200">
                {user.full_name || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-stone-500 block mb-1">Email Address</label>
              <p className="font-bold text-stone-900 bg-stone-50 p-2.5 rounded border border-stone-200">
                {user.email}
              </p>
            </div>
            <div>
              <label className="text-stone-500 block mb-1">Mobile Phone</label>
              <p className="font-bold text-stone-900 bg-stone-50 p-2.5 rounded border border-stone-200">
                {user.phone || '+91 98765 43210'}
              </p>
            </div>
            <div>
              <label className="text-stone-500 block mb-1">Account Role</label>
              <p className="font-bold text-stone-900 bg-stone-50 p-2.5 rounded border border-stone-200 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
