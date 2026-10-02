import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Sparkles,
  Tag,
  Warehouse,
  Users,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Loading session state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Unauthenticated: Redirect immediately to admin login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated customer, but NOT an admin: Deny access strictly
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-950 text-stone-200">
        <div className="max-w-md w-full bg-stone-900 p-8 rounded-2xl border border-stone-800 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Your account (<strong className="text-stone-300">{user.email}</strong>) does not have administrator privileges.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => logout()}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors"
            >
              Sign Out & Switch Account
            </button>
            <Link
              to="/"
              className="w-full py-2 text-stone-400 hover:text-white text-xs font-medium text-center"
            >
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Orders', path: '/admin/orders', icon: Package },
    { title: 'Products', path: '/admin/products', icon: ShoppingBag },
    { title: 'Categories', path: '/admin/categories', icon: Layers },
    { title: 'Collections', path: '/admin/collections', icon: Sparkles },
    { title: 'Discounts & Coupons', path: '/admin/discounts', icon: Tag },
    { title: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { title: 'Customers', path: '/admin/customers', icon: Users },
    { title: 'Website Settings', path: '/admin/settings', icon: Settings },
    { title: 'Audit Logs', path: '/admin/audit', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-stone-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo in Admin */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-maroon-800 flex items-center justify-center text-gold-400 font-serif font-bold text-lg border border-gold-500/40">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-white tracking-tight">
                  PocketFriendly
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
                  Admin Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-maroon-800 text-white shadow-sm'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-stone-400'}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Store Link */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" /> View Storefront
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center font-bold text-xs text-gold-400 shrink-0">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-stone-700 hover:text-stone-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-lg font-bold text-stone-900 hidden sm:block">
              PocketFriendly Sarees • Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Store Engine
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
