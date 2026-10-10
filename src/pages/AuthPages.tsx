import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-maroon-800 text-gold-300 font-serif font-bold text-xl flex items-center justify-center mx-auto mb-3">
            P
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Welcome Back
          </h1>
          <p className="text-xs text-stone-500">
            Sign in to your PocketFriendly Sarees account.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-800">Supabase Backend Not Connected</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Authentication requires valid Supabase credentials in your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> file (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>).
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">Password</label>
              <Link to="/contact" className="text-[11px] text-stone-500 hover:text-maroon-800">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-maroon-800 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setConfirmationNotice(null);

    const res = await signup(email, password, fullName);
    setLoading(false);

    if (res.success) {
      if (res.requiresEmailConfirmation) {
        setConfirmationNotice(res.error || 'Account created! Please check your email to confirm registration before signing in.');
      } else {
        navigate('/account');
      }
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-maroon-800 text-gold-300 font-serif font-bold text-xl flex items-center justify-center mx-auto mb-3">
            P
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Create an Account
          </h1>
          <p className="text-xs text-stone-500">
            Join the PocketFriendly Sarees family for exclusive festive offers and effortless checkout.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-800">Supabase Backend Not Connected</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Registration requires your real Supabase Project credentials. Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> file.
              </p>
            </div>
          </div>
        )}

        {confirmationNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-800">Account Created Successfully!</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">{confirmationNotice}</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {!confirmationNotice && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-maroon-800"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-stone-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-maroon-800 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
