import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone } from 'lucide-react';
import { ordersService } from '../../services/ordersService';
import { Order } from '../../types';
import { formatINR } from '../../utils/currency';

interface CustomerSummary {
  email: string;
  name: string;
  phone: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService.getOrders().then((orders) => {
      // Aggregate customers from orders
      const map = new Map<string, CustomerSummary>();

      orders.forEach((o) => {
        const key = o.customer_email.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            email: o.customer_email,
            name: o.customer_name,
            phone: o.customer_phone,
            city: o.shipping_address?.city || 'India',
            orderCount: 1,
            totalSpent: Number(o.total_amount),
            lastOrderDate: o.created_at,
          });
        } else {
          const item = map.get(key)!;
          item.orderCount += 1;
          item.totalSpent += Number(o.total_amount);
          if (new Date(o.created_at) > new Date(item.lastOrderDate)) {
            item.lastOrderDate = o.created_at;
          }
        }
      });

      // If no orders yet, add demo customer
      if (map.size === 0) {
        map.set('ananya@example.com', {
          email: 'ananya@example.com',
          name: 'Ananya Sharma',
          phone: '9876543210',
          city: 'Bangalore',
          orderCount: 2,
          totalSpent: 4923.45,
          lastOrderDate: new Date().toISOString(),
        });
      }

      setCustomers(Array.from(map.values()));
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Customer Directory & Spends
        </h1>
        <p className="text-xs text-stone-500">
          View customer profiles, total lifetime spending, and order history.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by customer name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs focus:outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Information</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Orders Placed</th>
                <th className="p-3.5">Lifetime Spend</th>
                <th className="p-3.5 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3.5 font-bold text-stone-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-maroon-100 text-maroon-800 font-bold flex items-center justify-center text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-stone-600">
                    <p>{c.email}</p>
                    <p className="text-[11px] text-stone-400">+91 {c.phone}</p>
                  </td>
                  <td className="p-3.5 text-stone-600">{c.city}</td>
                  <td className="p-3.5 font-bold text-stone-800">{c.orderCount} orders</td>
                  <td className="p-3.5 font-bold text-maroon-800">{formatINR(c.totalSpent)}</td>
                  <td className="p-3.5 text-stone-500 text-right">
                    {new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
