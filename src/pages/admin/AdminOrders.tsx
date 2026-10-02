import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
  ChevronDown,
  X,
  Printer
} from 'lucide-react';
import { ordersService } from '../../services/ordersService';
import { auditService } from '../../services/auditService';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatINR } from '../../utils/currency';

export const AdminOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Status Update modal state
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierName, setCarrierName] = useState('Blue Dart');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const data = await ordersService.getOrders();
    setOrders(data);
    setLoading(false);

    // If query param id is passed
    const targetId = searchParams.get('id');
    if (targetId) {
      const match = data.find(o => o.id === targetId || o.order_number === targetId);
      if (match) handleOpenOrder(match);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenOrder = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status);
    setNewPaymentStatus(ord.payment_status);
    setTrackingNumber(ord.tracking_number || '');
    setCarrierName(ord.carrier_name || 'Delhivery');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);

    const updated = await ordersService.updateOrderStatus(
      selectedOrder.id,
      newStatus,
      newPaymentStatus,
      trackingNumber,
      carrierName
    );

    await auditService.logAction('UPDATE_ORDER_STATUS', 'ORDER', selectedOrder.id, {
      order_number: selectedOrder.order_number,
      old_status: selectedOrder.order_status,
      new_status: newStatus,
    });

    setIsUpdating(false);
    if (updated) {
      setSelectedOrder(updated);
      loadOrders();
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const allStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refunded',
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Order Fulfillment & Management
          </h1>
          <p className="text-xs text-stone-500">
            Track customer orders, manage shipping carriers, and update fulfillment statuses.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 border border-stone-300 rounded-lg px-3 py-1.5 bg-stone-50">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-maroon-800 font-semibold"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">City / State</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3.5 font-bold text-stone-900">{ord.order_number}</td>
                    <td className="p-3.5 text-stone-500">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-stone-800">{ord.customer_name}</p>
                      <p className="text-[11px] text-stone-500">{ord.customer_phone}</p>
                    </td>
                    <td className="p-3.5 text-stone-600">
                      {ord.shipping_address?.city}, {ord.shipping_address?.state}
                    </td>
                    <td className="p-3.5 font-bold text-maroon-800">
                      {formatINR(ord.total_amount)}
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {ord.payment_method} ({ord.payment_status})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.order_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.order_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenOrder(ord)}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold rounded border border-stone-200 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-400">
                    No orders found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Status Manager Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">Order Details</span>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                <p className="text-stone-500 font-semibold mb-1">Customer</p>
                <p className="font-bold text-stone-900">{selectedOrder.customer_name}</p>
                <p className="text-stone-600">{selectedOrder.customer_email}</p>
                <p className="text-stone-600">+91 {selectedOrder.customer_phone}</p>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                <p className="text-stone-500 font-semibold mb-1">Delivery Address</p>
                <p className="text-stone-800">{selectedOrder.shipping_address?.address_line1}</p>
                <p className="text-stone-800">{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}</p>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                <p className="text-stone-500 font-semibold mb-1">Payment & Total</p>
                <p className="font-bold text-maroon-800 text-sm">{formatINR(selectedOrder.total_amount)}</p>
                <p className="text-stone-600 uppercase font-semibold">Method: {selectedOrder.payment_method}</p>
                <p className="text-stone-600">Status: {selectedOrder.payment_status}</p>
              </div>
            </div>

            {/* Ordered Sarees List */}
            <div>
              <h3 className="font-serif text-sm font-bold text-stone-900 mb-2">Items in Order</h3>
              <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-10 h-14 object-cover rounded bg-stone-100 border border-stone-200 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-stone-900">{item.product_name}</p>
                        <p className="text-[11px] text-stone-500">SKU: {item.sku} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">{formatINR(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-sm font-bold text-stone-900">Update Order Pipeline Status</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Order Pipeline Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-semibold"
                  >
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="pending">PENDING</option>
                    <option value="paid">PAID</option>
                    <option value="cod_pending">COD PENDING</option>
                    <option value="failed">FAILED</option>
                    <option value="refunded">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Shipping Courier Carrier</label>
                  <input
                    type="text"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="e.g. Blue Dart / Delhivery / DTDC"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tracking Number (AWB)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART12345678"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
