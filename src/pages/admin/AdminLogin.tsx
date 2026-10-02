import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@pocketfriendlysarees.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password, 'admin');
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Invalid administrator credentials');
    }
  };

  const handleInstantAdminAccess = () => {
    switchRole('admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Visual Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-gradient-to-br from-maroon-950 via-stone-900 to-stone-950 text-stone-200 border-r border-stone-800">
          <div className="space-y-6 z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-maroon-800 flex items-center justify-center text-white font-serif font-bold text-lg border border-gold-500/40">
                <span className="text-gold-300">P</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-white tracking-tight">
                  PocketFriendly
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-gold-500 font-semibold">
                  Admin Console
                </span>
              </div>
            </Link>

            <div className="pt-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-maroon-900/60 border border-gold-500/30 text-gold-300 text-[10px] font-semibold tracking-wider uppercase">
                <Shield className="w-3 h-3 text-gold-400" />
                <span>Restricted Access</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white leading-snug">
                Store Operations & Catalog Engine
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                Manage live saree collections, inventory thresholds, discount codes, customer orders, and storefront settings.
              </p>
            </div>
          </div>

          <div className="z-10 pt-8 border-t border-stone-800/80 text-[11px] text-stone-400 space-y-2">
            <div className="flex items-center gap-2 text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Real-time Supabase Database Sync</span>
            </div>
            <p className="text-stone-500 text-[10px]">
              Session protected with Row-Level Security and role-based access control.
            </p>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-maroon-700/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Credentials Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-stone-900/90 text-stone-200">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-maroon-900/80 border border-gold-500/30 text-gold-300 flex items-center justify-center mb-4 lg:hidden">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Staff Authentication
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Enter your authorized credentials to access the administration dashboard.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pocketfriendlysarees.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-stone-950 border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-stone-950 border border-stone-700 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-maroon-950/50 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In as Administrator'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Development-Only Shortcut (Completely excluded in production) */}
            {import.meta.env.DEV && (
              <div className="pt-4 border-t border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-semibold text-gold-400 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Local Dev Environment
                  </span>
                  <span className="text-[10px] text-stone-500">import.meta.env.DEV</span>
                </div>
                <button
                  type="button"
                  onClick={handleInstantAdminAccess}
                  className="w-full py-2.5 px-4 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-gold-400" /> Instant 1-Click Dev Admin Access
                </button>
              </div>
            )}

            <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-800">
              <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                ← Return to PocketFriendly Sarees Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
