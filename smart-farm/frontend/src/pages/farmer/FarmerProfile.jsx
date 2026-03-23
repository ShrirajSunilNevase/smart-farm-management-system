import React, { useState } from 'react';
import { User, Phone, MapPin, CreditCard, Save, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function FarmerProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    aadhaar: user?.aadhaar || '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const notifications = user?.notifications || [];

  return (
    <div className="space-y-6 page-enter max-w-4xl">
      <div>
        <h1 className="font-display text-3xl text-white">My Profile</h1>
        <p className="text-stone-400 mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-leaf-600 to-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-leaf-900/50">
            <span className="text-4xl font-display text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h3 className="text-white font-bold text-xl">{user?.name}</h3>
          <p className="text-stone-400 text-sm mt-1">{user?.email}</p>
          <div className="mt-3 badge-approved">Farmer</div>
          <div className="mt-4 text-stone-600 text-xs">
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-white font-bold mb-5">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input name="name" value={form.name} onChange={handleChange} className="input-field pl-11" placeholder="Full name" required />
                </div>
              </div>
              <div>
                <label className="label-text">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field pl-11" placeholder="10-digit number" />
                </div>
              </div>
            </div>

            <div>
              <label className="label-text">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input name="address" value={form.address} onChange={handleChange} className="input-field pl-11" placeholder="Village, Taluka, District, State" />
              </div>
            </div>

            <div>
              <label className="label-text">Aadhaar Number <span className="text-stone-600 normal-case font-normal">(optional)</span></label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange} className="input-field pl-11" placeholder="XXXX XXXX XXXX" maxLength={14} />
              </div>
              <p className="text-stone-600 text-xs mt-1">Your Aadhaar is encrypted and stored securely</p>
            </div>

            <div className="pt-2">
              <label className="label-text">Email Address</label>
              <input value={user?.email} className="input-field opacity-50 cursor-not-allowed" disabled />
              <p className="text-stone-600 text-xs mt-1">Email cannot be changed</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          All Notifications
          <span className="ml-auto text-stone-500 text-sm font-normal">{notifications.length} total</span>
        </h3>
        {notifications.length === 0 ? (
          <p className="text-stone-600 text-sm text-center py-8">No notifications yet. Land officer messages will appear here.</p>
        ) : (
          <div className="space-y-3">
            {[...notifications].reverse().map((n, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${n.read ? 'bg-white/3 border-white/5' : 'bg-amber-900/15 border-amber-700/20'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-stone-600' : 'bg-amber-400'}`} />
                <div className="flex-1">
                  <p className="text-stone-200 text-sm">{n.message}</p>
                  <p className="text-stone-600 text-xs mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                </div>
                {!n.read && <span className="badge-pending text-xs">New</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
