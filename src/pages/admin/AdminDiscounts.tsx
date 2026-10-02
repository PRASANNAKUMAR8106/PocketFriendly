import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, Check, X } from 'lucide-react';
import { discountsService } from '../../services/discountsService';
import { auditService } from '../../services/auditService';
import { DiscountCoupon } from '../../types';
import { formatINR } from '../../utils/currency';

export const AdminDiscounts: React.FC = () => {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_value: 999,
    max_discount_amount: 500,
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    const data = await discountsService.getDiscounts();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string) => {
    await discountsService.toggleDiscountStatus(id);
    await auditService.logAction('TOGGLE_DISCOUNT', 'DISCOUNT', id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this coupon code?')) {
      await discountsService.deleteDiscount(id);
      await auditService.logAction('DELETE_DISCOUNT', 'DISCOUNT', id);
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const created = await discountsService.createDiscount(formData);
    await auditService.logAction('CREATE_DISCOUNT', 'DISCOUNT', created.id, { code: formData.code });
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Discounts & Coupons Management
          </h1>
          <p className="text-xs text-stone-500">
            Create promotional voucher codes for festive sales and first-time shoppers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Coupon Name</th>
                <th className="p-3.5">Promo Code</th>
                <th className="p-3.5">Discount Offer</th>
                <th className="p-3.5">Min Order</th>
                <th className="p-3.5">Times Used</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3.5 font-bold text-stone-900">{coupon.name}</td>
                  <td className="p-3.5 font-mono font-bold text-maroon-800 tracking-wider">
                    {coupon.code}
                  </td>
                  <td className="p-3.5 font-semibold text-stone-800">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% OFF`
                      : formatINR(coupon.discount_value) + ' OFF'}
                  </td>
                  <td className="p-3.5 text-stone-600">
                    {formatINR(coupon.min_order_value || 0)}
                  </td>
                  <td className="p-3.5 text-stone-700 font-bold">{coupon.used_count || 0}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggle(coupon.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        coupon.is_active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Create New Coupon
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Coupon Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Festive Special 15%"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Promo Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE15"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Minimum Order Subtotal (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-maroon-800"
                  />
                  Coupon Active & Usable Immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-lg shadow"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
