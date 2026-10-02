import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login, logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as an authorized administrator, redirect immediately
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail && !cleanPassword) {
      setError('Please enter your administrator email and password.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your administrator email.');
      return;
    }
    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(cleanEmail, cleanPassword);

      if (!res.success || !res.user) {
        setError(res.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Strict role verification: only authorized admin roles can enter
      const userRole = res.user.role;
      if (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'manager') {
        // Authenticated customer attempted admin login: immediately terminate session
        await logout();
        setError('Access Denied: This account does not have administrator privileges.');
        setLoading(false);
        return;
      }

      // Success: proceed to the admin dashboard
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch {
      setError('An unexpected error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
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
                Secure management console for PocketFriendly Sarees. Authorized staff and administrators only.
              </p>
            </div>
          </div>

          <div className="z-10 pt-8 border-t border-stone-800/80 text-[11px] text-stone-400 space-y-2">
            <div className="flex items-center gap-2 text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Real-time Database Authentication</span>
            </div>
            <p className="text-stone-500 text-[10px]">
              Protected with Row-Level Security and strict server-side role validation.
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
              <div className="p-3.5 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pocketfriendlysarees.com"
                    autoComplete="email"
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
                    autoComplete="current-password"
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

            <div className="text-center text-xs text-stone-500 pt-4 border-t border-stone-800">
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
