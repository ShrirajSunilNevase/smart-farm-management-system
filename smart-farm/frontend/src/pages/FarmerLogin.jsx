import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/common/AuthLayout';

export default function FarmerLogin() {
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
      await login(form.email, form.password, 'farmer');
      navigate('/farmer');
    } catch {}
  };

  return (
    <AuthLayout
      title="Farmer Login"
      subtitle="Access your farm management dashboard"
      bgImage="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=85"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label-text">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-field pl-11"
              placeholder="farmer@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="label-text">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              className="input-field pl-11 pr-11"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Demo credentials */}
        <div className="bg-leaf-900/30 border border-leaf-700/30 rounded-xl p-4 text-sm">
          <p className="text-leaf-400 font-semibold mb-1">Demo Farmer Account:</p>
          <p className="text-stone-400">Email: <span className="text-stone-200 font-mono">farmer@demo.com</span></p>
          <p className="text-stone-400">Password: <span className="text-stone-200 font-mono">farmer123</span></p>
        </div>

        <p className="text-center text-stone-500 text-sm">
          Don't have an account?{' '}
          <Link to="/farmer/register" className="text-leaf-400 hover:text-leaf-300 font-semibold transition-colors">
            Register here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
