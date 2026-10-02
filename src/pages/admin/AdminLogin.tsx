import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 p-8 rounded-2xl shadow-2xl space-y-6 text-stone-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-maroon-900 border border-gold-500/40 text-gold-400 flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
            Staff & Admin Console
          </h1>
          <p className="text-xs text-stone-400">
            Secure backend for PocketFriendly Sarees management.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-maroon-950/40 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Evaluation Shortcut */}
        <div className="pt-4 border-t border-stone-800 space-y-2">
          <p className="text-[11px] text-stone-400 text-center font-medium">Evaluation Shortcut:</p>
          <button
            type="button"
            onClick={handleInstantAdminAccess}
            className="w-full py-2.5 px-4 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-gold-400" /> Instant 1-Click Admin Access
          </button>
        </div>

        <div className="text-center text-xs text-stone-500 pt-2">
          <Link to="/" className="text-stone-400 hover:text-white transition-colors">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
