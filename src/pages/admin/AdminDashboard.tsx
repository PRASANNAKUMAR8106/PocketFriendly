import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle,
  IndianRupee,
  ArrowUpRight,
  ChevronRight,
  Eye,
  Plus
} from 'lucide-react';
import { ordersService } from '../../services/ordersService';
import { productsService } from '../../services/productsService';
import { Order, Product } from '../../types';
import { formatINR } from '../../utils/currency';

export const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    pendingOrdersCount: 0,
    deliveredOrdersCount: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [kpiData, orders, { products }] = await Promise.all([
          ordersService.getAdminKPIs(),
          ordersService.getOrders(),
          productsService.getProducts(),
        ]);

        setKpis(kpiData);
        setRecentOrders(orders.slice(0, 5));
        setLowStockProducts(products.filter(p => p.stock_quantity <= p.low_stock_threshold));
      } catch (e) {
        console.error('Failed to load admin dashboard data', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [dateRange]);

  const cards = [
    { title: 'Total Revenue', value: formatINR(kpis.totalRevenue), sub: `Today: ${formatINR(kpis.todayRevenue)}`, icon: IndianRupee, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { title: 'Total Orders', value: kpis.totalOrders, sub: `Today: ${kpis.todayOrders} orders`, icon: Package, color: 'text-maroon-800', bg: 'bg-maroon-50' },
    { title: 'Active Products', value: kpis.totalProducts, sub: 'In store catalog', icon: ShoppingBag, color: 'text-blue-700', bg: 'bg-blue-50' },
    { title: 'Low Stock Sarees', value: kpis.lowStockCount, sub: 'Needs re-ordering', icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Overview & Store Analytics
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time performance metrics and inventory status for PocketFriendly Sarees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-lg border border-stone-300 shadow-sm flex text-xs">
            {(['today', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md font-semibold uppercase transition-all ${
                  dateRange === range
                    ? 'bg-maroon-800 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {range === 'today' ? 'Today' : range === '7d' ? 'Last 7D' : range === '30d' ? 'Last 30D' : 'All Time'}
              </button>
            ))}
          </div>

          <Link
            to="/admin/products?action=new"
            className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Saree
          </Link>
        </div>
      </div>

      {/* 1. KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-start justify-between"
            >
              <div>
                <p className="text-xs text-stone-500 font-medium">{card.title}</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  {card.value}
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">{card.sub}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Visual */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Sales & Revenue Trajectory
              </h3>
              <p className="text-xs text-stone-500">Gross revenue performance over recent periods</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% YoY
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-stone-100">
            {[
              { day: 'Mon', amount: 14200, height: '40%' },
              { day: 'Tue', amount: 18900, height: '55%' },
              { day: 'Wed', amount: 22400, height: '65%' },
              { day: 'Thu', amount: 16800, height: '50%' },
              { day: 'Fri', amount: 28900, height: '80%' },
              { day: 'Sat', amount: 36500, height: '95%' },
              { day: 'Sun', amount: 31200, height: '88%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-maroon-800 transition-opacity">
                  {formatINR(bar.amount)}
                </div>
                <div
                  className="w-full bg-maroon-800/85 hover:bg-maroon-800 rounded-t-md transition-all duration-300 shadow-sm"
                  style={{ height: bar.height }}
                />
                <span className="text-xs text-stone-500 font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>Average Order Value: <strong>₹2,450</strong></span>
            <span>Total Orders Handled: <strong>{kpis.totalOrders}</strong></span>
          </div>
        </div>

        {/* Category Breakdown & Delivery Status */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Sales by Category
          </h3>
          <div className="space-y-3 pt-2">
            {[
              { name: 'Banarasi Silk', percent: 38, count: '38%', color: 'bg-maroon-800' },
              { name: 'Kanjeevaram Temple Silk', percent: 26, count: '26%', color: 'bg-gold-500' },
              { name: 'Organza Embroidered', percent: 18, count: '18%', color: 'bg-emerald-600' },
              { name: 'Chanderi Cotton Silk', percent: 12, count: '12%', color: 'bg-blue-600' },
              { name: 'Other Festive & Mulmul', percent: 6, count: '6%', color: 'bg-stone-500' },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-stone-800">{cat.name}</span>
                  <span className="font-bold text-stone-600">{cat.count}</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECENT ORDERS & LOW STOCK WARNINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Recent Customer Orders</h3>
              <p className="text-xs text-stone-500">Live order stream across India</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-maroon-800 hover:underline flex items-center gap-1">
              View All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{ord.order_number}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-800">{ord.customer_name}</div>
                        <div className="text-[11px] text-stone-400">{ord.shipping_address?.city}</div>
                      </td>
                      <td className="p-3.5 font-bold text-maroon-800">{formatINR(ord.total_amount)}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.order_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.order_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/admin/orders?id=${ord.id}`}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-semibold text-[11px] transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-400">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Saree Alert (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Alerts
            </h3>
            <Link to="/admin/inventory" className="text-xs font-semibold text-maroon-800 hover:underline">
              Inventory
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-stone-400">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                      {p.stock_quantity} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 text-center py-6">All stock levels are optimal.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
