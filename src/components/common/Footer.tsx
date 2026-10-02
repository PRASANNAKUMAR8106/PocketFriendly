import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-maroon-900/60 border border-maroon-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Authentic Sarees</h4>
              <p className="text-xs text-stone-400">Direct from artisan looms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-maroon-900/60 border border-maroon-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Free All-India Delivery</h4>
              <p className="text-xs text-stone-400">On all orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-maroon-900/60 border border-maroon-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-stone-400">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-maroon-900/60 border border-maroon-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Secure Payments & COD</h4>
              <p className="text-xs text-stone-400">UPI, Cards & Pay on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-maroon-800 flex items-center justify-center text-gold-400 font-serif font-bold text-lg border border-gold-500/40">
                P
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">
                PocketFriendly Sarees
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-6 max-w-sm">
              {settings.footer_about}
            </p>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{settings.store_address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{settings.store_phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{settings.store_email}</span>
              </div>
            </div>
          </div>

          {/* Popular Collections */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4 text-gold-400">
              Shop Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/collections/latest" className="hover:text-gold-300 transition-colors">
                  Latest Festive Collection
                </Link>
              </li>
              <li>
                <Link to="/category/banarasi-silk" className="hover:text-gold-300 transition-colors">
                  Banarasi Silk Sarees
                </Link>
              </li>
              <li>
                <Link to="/category/kanjeevaram-silk" className="hover:text-gold-300 transition-colors">
                  Kanjeevaram Temple Silks
                </Link>
              </li>
              <li>
                <Link to="/category/organza-embroidered" className="hover:text-gold-300 transition-colors">
                  Organza Embroidered
                </Link>
              </li>
              <li>
                <Link to="/category/chanderi-cotton-silk" className="hover:text-gold-300 transition-colors">
                  Chanderi Cotton Silk
                </Link>
              </li>
              <li>
                <Link to="/category/pure-cotton-mulmul" className="hover:text-gold-300 transition-colors">
                  Mulmul Daily Wear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4 text-gold-400">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/account/orders" className="hover:text-gold-300 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-gold-300 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-gold-300 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold-300 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-300 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-gold-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand & Newsletter */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase mb-4 text-gold-400">
              The Brand
            </h4>
            <ul className="space-y-2.5 text-xs mb-6">
              <li>
                <Link to="/about" className="hover:text-gold-300 transition-colors">
                  Our Handloom Story
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-gold-300 transition-colors">
                  Current Festive Offers
                </Link>
              </li>
            </ul>

            <h5 className="text-xs font-semibold text-stone-200 mb-2">Join the Saree Family</h5>
            <p className="text-[11px] text-stone-400 mb-2">
              Receive secret festive promo codes and first-access to limited drops.
            </p>
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-2.5 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded text-white focus:outline-none focus:border-gold-400 w-full"
              />
              <button className="px-3 py-1.5 bg-maroon-800 hover:bg-maroon-900 text-gold-300 font-semibold text-xs rounded transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
        <p>© {new Date().getFullYear()} PocketFriendly Sarees. Handcrafted with pride in India. All Rights Reserved.</p>
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="hover:text-stone-400">Privacy</Link>
          <Link to="/terms" className="hover:text-stone-400">Terms</Link>
          <Link to="/shipping-policy" className="hover:text-stone-400">Shipping</Link>
          <Link to="/returns-policy" className="hover:text-stone-400">Returns</Link>
        </div>
      </div>
    </footer>
  );
};
