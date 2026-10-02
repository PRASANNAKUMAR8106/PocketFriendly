import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Truck, RotateCcw, Tag, Copy, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { INITIAL_COUPONS } from '../services/mockData';
import { formatINR } from '../utils/currency';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-maroon-800 font-bold">Our Heritage & Mission</span>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-stone-900">
          The Story of PocketFriendly Sarees
        </h1>
        <div className="w-16 h-1 bg-gold-500 mx-auto rounded" />
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
        <p className="text-base sm:text-lg font-serif text-stone-900 leading-relaxed">
          Founded with a simple yet passionate vision: <em>Every Indian woman deserves to drape herself in authentic, heirloom-quality handloom sarees without paying an exorbitant boutique markup.</em>
        </p>

        <p>
          For generations, the traditional Indian textile industry has been burdened by layers of middlemen, wholesalers, and retail markups that often triple the cost of a Banarasi or Kanjeevaram silk saree before it reaches the customer.
        </p>

        <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <h3 className="font-serif text-2xl font-bold text-maroon-800">Direct-From-Loom</h3>
            <p className="text-xs text-stone-600">Sourced directly from weaving clusters in Varanasi, Kanchipuram, Chanderi, and Surat.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <h3 className="font-serif text-2xl font-bold text-maroon-800">Pocket-Friendly</h3>
            <p className="text-xs text-stone-600">We pass on direct cost savings so luxury fashion is accessible to every family.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <h3 className="font-serif text-2xl font-bold text-maroon-800">Rigorous Quality</h3>
            <p className="text-xs text-stone-600">Each saree undergoes a 5-point zari, thread, and border inspection before packaging.</p>
          </div>
        </div>

        <h3 className="font-serif text-xl font-bold text-stone-900 mt-6">Our Promise to You</h3>
        <p>
          Whether you are choosing an auspicious crimson Banarasi saree for a wedding ceremony, a pastel organza for a summer engagement, or breathable Mulmul cotton for your daily routine, you can trust <strong>PocketFriendly Sarees</strong> to deliver uncompromised beauty, reliable shipping, and genuine warmth.
        </p>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs uppercase tracking-widest text-maroon-800 font-bold">We’d Love to Hear From You</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Contact Customer Support</h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Need assistance with choosing a saree, tracking an ongoing shipment, or bulk wedding orders? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card (5 cols) */}
        <div className="md:col-span-5 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
            Store Contact Details
          </h2>

          <div className="space-y-4 text-xs text-stone-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-maroon-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800 font-semibold mb-0.5">Corporate & Warehouse Address:</strong>
                <span>{settings.store_address}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-maroon-800 shrink-0" />
              <div>
                <strong className="block text-stone-800 font-semibold mb-0.5">Phone & WhatsApp:</strong>
                <span>{settings.store_phone} (Mon - Sat, 10 AM - 7 PM)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-maroon-800 shrink-0" />
              <div>
                <strong className="block text-stone-800 font-semibold mb-0.5">Email Support:</strong>
                <span>{settings.store_email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-stone-900">Message Received!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Thank you for reaching out. One of our customer care specialists will reply to your email within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs text-maroon-800 font-bold underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
                Send Us a Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shalini Roy"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. shalini@example.com"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Inquiry regarding Banarasi Silk Saree"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you today?"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'Are the sarees genuine and true to the photos?',
      a: 'Yes, 100%. All photography is conducted using real daylight studio lighting to accurately depict the saree fabric, zari luster, and color tone.',
    },
    {
      q: 'Do your sarees include a blouse piece?',
      a: 'Yes! Almost all sarees in our catalog come with an attached 0.8-meter unstitched blouse piece in matching or contrast zari pattern.',
    },
    {
      q: 'What are the delivery timelines across India?',
      a: 'Orders are dispatched within 24-48 hours. Metro cities generally receive delivery in 2-3 business days, while other towns receive delivery in 4-6 business days.',
    },
    {
      q: 'Is Cash on Delivery (COD) supported?',
      a: 'Yes, we provide Cash on Delivery across almost all serviceable PIN codes in India.',
    },
    {
      q: 'What is your return & exchange policy?',
      a: 'We offer an easy 7-day return policy. If there is any defect or damage during transit, we arrange a hassle-free pickup and immediate replacement or refund.',
    },
    {
      q: 'How should I care for my silk and zari sarees?',
      a: 'We strongly advise dry cleaning for all pure silk, zari, and delicate organza sarees. Always store folded in soft cotton or muslin cloth.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs uppercase tracking-widest text-maroon-800 font-bold">Help Center</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
            <h3 className="font-serif text-sm font-bold text-stone-900">{f.q}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-stone text-xs sm:text-sm">
    <h1 className="font-serif text-3xl font-bold text-stone-900">Shipping & Delivery Policy</h1>
    <p>Last updated: October 2026</p>
    <h3>Free Shipping Eligibility</h3>
    <p>We are delighted to offer <strong>FREE All-India Delivery</strong> on all prepaid and eligible orders with a cart subtotal of <strong>₹999 or above</strong>.</p>
    <h3>Dispatch Time</h3>
    <p>All in-stock sarees are packed and dispatched within 24 to 48 hours of order confirmation. You will receive an SMS and email notification with your live tracking URL.</p>
    <h3>Estimated Delivery Timelines</h3>
    <ul>
      <li>Metro Cities (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata): 2-4 business days.</li>
      <li>Tier 2 and Tier 3 Cities: 3-5 business days.</li>
      <li>Remote / North-East regions: 5-7 business days.</li>
    </ul>
  </div>
);

export const ReturnsPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-stone text-xs sm:text-sm">
    <h1 className="font-serif text-3xl font-bold text-stone-900">Returns & Refund Policy</h1>
    <p>Last updated: October 2026</p>
    <h3>7-Day Hassle-Free Return Policy</h3>
    <p>At PocketFriendly Sarees, your satisfaction is paramount. If you are not satisfied with your purchase, you may initiate a return within 7 calendar days from the date of delivery.</p>
    <h3>Conditions for Returns</h3>
    <ul>
      <li>The saree must be unworn, unwashed, and undamaged.</li>
      <li>The blouse piece must remain unstitched and uncut.</li>
      <li>All original tags, folds, and packaging must be intact.</li>
    </ul>
    <h3>Refund Process</h3>
    <p>Once the returned package reaches our warehouse and passes quality check, refunds will be credited within 3-5 business days to your original payment method or bank account for COD orders.</p>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-stone text-xs sm:text-sm">
    <h1 className="font-serif text-3xl font-bold text-stone-900">Privacy Policy</h1>
    <p>Last updated: October 2026</p>
    <p>PocketFriendly Sarees respects your privacy and is committed to protecting your personal information. We collect contact details, delivery addresses, and order history strictly to fulfill your transactions and provide shipment updates.</p>
    <p>We do not store complete credit card or debit card numbers on our servers. Payment processing is safely handled through RBI-authorized payment aggregators.</p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-stone text-xs sm:text-sm">
    <h1 className="font-serif text-3xl font-bold text-stone-900">Terms & Conditions</h1>
    <p>Last updated: October 2026</p>
    <p>By browsing, accessing, or purchasing sarees on PocketFriendlySarees.com, you agree to comply with our Terms of Service, pricing policies, and delivery procedures.</p>
    <p>All prices listed on the site are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST).</p>
  </div>
);

export const OffersPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-maroon-800 font-bold">Festive Savings</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Active Coupons & Special Offers</h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Apply these coupon codes during checkout to enjoy additional discounts on your favorite sarees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_COUPONS.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white p-6 rounded-2xl border-2 border-dashed border-gold-400 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 mt-2">
                {coupon.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Applicable on orders above {formatINR(coupon.min_order_value || 0)}.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="font-mono text-sm font-bold text-maroon-800 tracking-wider">
                {coupon.code}
              </span>
              <button
                onClick={() => handleCopy(coupon.code)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-md border border-stone-200 transition-colors"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
