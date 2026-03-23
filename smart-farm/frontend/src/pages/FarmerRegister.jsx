import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/common/AuthLayout';

export default function FarmerRegister() {
  const navigate = useNavigate();
  const { register, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(''); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setFormError('Passwords do not match');
    if (form.password.length < 6) return setFormError('Password must be at least 6 characters');
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password });
      navigate('/farmer');
    } catch {}
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the Smart Farm Management System"
      bgImage="https://images.unsplash.com/photo-1500937384654-f843efbb89d5?w=1400&q=85"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || formError) && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error || formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input name="name" type="text" value={form.name} onChange={handleChange} className="input-field pl-11" placeholder="Your name" required />
            </div>
          </div>
          <div>
            <label className="label-text">Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field pl-11" placeholder="Phone no." />
            </div>
          </div>
        </div>

        <div>
          <label className="label-text">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field pl-11" placeholder="email@example.com" required />
          </div>
        </div>

        <div>
          <label className="label-text">Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input name="address" type="text" value={form.address} onChange={handleChange} className="input-field pl-11" placeholder="Village, District, State" />
          </div>
        </div>

        <div>
          <label className="label-text">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} className="input-field pl-11 pr-11" placeholder="Min. 6 characters" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label-text">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input name="confirm" type={showPw ? 'text' : 'password'} value={form.confirm} onChange={handleChange} className="input-field pl-11" placeholder="Repeat password" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-stone-500 text-sm">
          Already have an account?{' '}
          <Link to="/farmer/login" className="text-leaf-400 hover:text-leaf-300 font-semibold transition-colors">Login here</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
