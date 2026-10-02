import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield, Sparkles, ChevronDown, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300">
      {/* Top Announcement Bar */}
      {settings.announcement_enabled && (
        <div className="bg-maroon-800 text-white text-[11px] md:text-xs font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-maroon-900/30">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
          <span className="truncate">{settings.announcement_text}</span>
          <span className="hidden sm:inline text-gold-300 font-semibold underline cursor-pointer" onClick={() => navigate('/collections/latest')}>
            Shop Now
          </span>
        </div>
      )}

      {/* Main Header Container */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-200 ${scrolled ? 'py-2.5 shadow-sm' : 'py-4'}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-stone-700 hover:text-maroon-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo Treatment */}
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-maroon-800 flex items-center justify-center text-white font-serif font-bold text-lg md:text-xl shadow-sm border border-gold-500/40 group-hover:scale-105 transition-transform">
              <span className="text-gold-300">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg md:text-2xl text-stone-900 tracking-tight leading-none group-hover:text-maroon-800 transition-colors">
                PocketFriendly
              </span>
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-gold-700 font-semibold leading-tight">
                Sarees • Authentic Luxury
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-stone-700">
            <Link to="/" className="hover:text-maroon-800 transition-colors py-1">
              Home
            </Link>
            <Link to="/shop" className="hover:text-maroon-800 transition-colors py-1">
              Shop All
            </Link>
            <Link to="/collections/latest" className="text-maroon-800 hover:text-maroon-900 font-bold transition-colors py-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-maroon-800 animate-pulse"></span>
              Latest Collection
            </Link>
            <Link to="/category/banarasi-silk" className="hover:text-maroon-800 transition-colors py-1">
              Banarasi
            </Link>
            <Link to="/category/kanjeevaram-silk" className="hover:text-maroon-800 transition-colors py-1">
              Kanjeevaram
            </Link>
            <Link to="/category/organza-embroidered" className="hover:text-maroon-800 transition-colors py-1">
              Organza
            </Link>
            <Link to="/offers" className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors py-1">
              Offers
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-stone-700 hover:text-maroon-800 hover:bg-stone-50 rounded-full transition-colors"
              aria-label="Search sarees"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-stone-700 hover:text-maroon-800 hover:bg-stone-50 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-maroon-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="p-2 text-stone-700 hover:text-maroon-800 hover:bg-stone-50 rounded-full transition-colors flex items-center gap-1"
                aria-label="Account Menu"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:block" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {user.full_name || 'Customer'}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] bg-maroon-100 text-maroon-800 font-bold px-1.5 py-0.5 rounded">
                            Admin Role
                          </span>
                        )}
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                      >
                        <User className="w-4 h-4 text-stone-400" /> My Profile
                      </Link>
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                      >
                        <Package className="w-4 h-4 text-stone-400" /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-maroon-800 hover:bg-maroon-50"
                        >
                          <Shield className="w-4 h-4 text-maroon-800" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-stone-50"
                      >
                        Customer Login / Register
                      </Link>
                      <div className="border-t border-stone-100 my-1"></div>
                      <Link
                        to="/admin/login"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-maroon-800 hover:bg-maroon-50 font-medium"
                      >
                        <Shield className="w-3.5 h-3.5" /> Admin Portal
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 bg-maroon-800 text-white rounded-full hover:bg-maroon-900 transition-colors relative shadow-sm"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-stone-900 text-xs font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 bg-white border-b border-stone-200 shadow-xl py-4 px-6 z-50 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3 text-sm font-semibold uppercase text-stone-800">
            <Link to="/" className="py-2 border-b border-stone-100">Home</Link>
            <Link to="/shop" className="py-2 border-b border-stone-100">Shop All Sarees</Link>
            <Link to="/collections/latest" className="py-2 border-b border-stone-100 text-maroon-800 font-bold flex items-center justify-between">
              Latest Collection <span className="text-[10px] bg-maroon-100 px-2 py-0.5 rounded text-maroon-800">New</span>
            </Link>
            <Link to="/category/banarasi-silk" className="py-2 border-b border-stone-100">Banarasi Silk</Link>
            <Link to="/category/kanjeevaram-silk" className="py-2 border-b border-stone-100">Kanjeevaram Silk</Link>
            <Link to="/category/organza-embroidered" className="py-2 border-b border-stone-100">Organza Sarees</Link>
            <Link to="/category/chanderi-cotton-silk" className="py-2 border-b border-stone-100">Chanderi Sarees</Link>
            <Link to="/offers" className="py-2 border-b border-stone-100 text-emerald-700">Special Offers</Link>
            <Link to="/about" className="py-2 border-b border-stone-100">About Us</Link>
            <Link to="/contact" className="py-2">Contact</Link>
            {isAdmin && (
              <Link to="/admin" className="mt-2 py-2.5 px-4 bg-maroon-800 text-white rounded text-center font-bold flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Go to Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
