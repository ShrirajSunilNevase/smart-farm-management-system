import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/common/AuthLayout';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password, 'admin');
      navigate('/admin');
    } catch {}
  };

  return (
    <AuthLayout
      title="Land Officer Portal"
      subtitle="Secure access for land verification officers"
      bgImage="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=85"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3">
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">This portal is restricted to authorized land officers only.</p>
        </div>

        <div>
          <label className="label-text">Official Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field pl-11" placeholder="officer@department.gov.in" required />
          </div>
        </div>

        <div>
          <label className="label-text">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} className="input-field pl-11 pr-11" placeholder="••••••••" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {loading ? 'Signing in...' : 'Access Officer Portal'}
        </button>

        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 text-sm">
          <p className="text-stone-400 font-semibold mb-1">Demo Officer Account:</p>
          <p className="text-stone-400">Email: <span className="text-stone-200 font-mono">admin@smartfarm.com</span></p>
          <p className="text-stone-400">Password: <span className="text-stone-200 font-mono">admin123</span></p>
          <p className="text-stone-500 text-xs mt-2">Run <span className="font-mono text-amber-400">POST /api/admin/seed</span> first to create admin.</p>
        </div>
      </form>
    </AuthLayout>
  );
}
