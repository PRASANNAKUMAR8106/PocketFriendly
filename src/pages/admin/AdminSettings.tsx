import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { auditService } from '../../services/auditService';
import { SiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formData);
    await auditService.logAction('UPDATE_SITE_SETTINGS', 'SETTINGS', '1', formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Store & Website Configuration
          </h1>
          <p className="text-xs text-stone-500">
            Customize announcements, shipping rules, payment methods, and branding.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings successfully saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Brand & Contact Information */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Store Profile & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.store_email}
                onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                value={formData.store_phone}
                onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency_symbol}
                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Store Physical Address</label>
              <input
                type="text"
                value={formData.store_address}
                onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>
          </div>
        </div>

        {/* 2. Announcement Bar */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
            <span>Top Announcement Strip</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcement_enabled}
                onChange={(e) => setFormData({ ...formData, announcement_enabled: e.target.checked })}
                className="accent-maroon-800"
              />
              <span className="text-xs font-semibold text-stone-800">Enabled</span>
            </label>
          </h2>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Announcement Text</label>
            <input
              type="text"
              value={formData.announcement_text}
              onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
            />
          </div>
        </div>

        {/* 3. Homepage Hero Banner */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Homepage Hero Section
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Hero Banner Image URL</label>
                <input
                  type="url"
                  value={formData.hero_image_url}
                  onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Hero CTA Link</label>
                <input
                  type="text"
                  value={formData.hero_cta_link}
                  onChange={(e) => setFormData({ ...formData, hero_cta_link: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Shipping, COD, and Taxes */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Shipping & Payment Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={formData.free_shipping_threshold}
                onChange={(e) => setFormData({ ...formData, free_shipping_threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={formData.standard_shipping_fee}
                onChange={(e) => setFormData({ ...formData, standard_shipping_fee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">GST / Tax Percentage (%)</label>
              <input
                type="number"
                value={formData.tax_percentage}
                onChange={(e) => setFormData({ ...formData, tax_percentage: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cod_enabled}
                onChange={(e) => setFormData({ ...formData, cod_enabled: e.target.checked })}
                className="accent-maroon-800"
              />
              Enable Cash on Delivery (COD) in Checkout
            </label>

            <div className="flex items-center gap-2">
              <span className="text-stone-600">COD Handling Fee:</span>
              <input
                type="number"
                value={formData.cod_fee}
                onChange={(e) => setFormData({ ...formData, cod_fee: Number(e.target.value) })}
                className="w-20 px-2 py-1 border border-stone-300 rounded text-center"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
