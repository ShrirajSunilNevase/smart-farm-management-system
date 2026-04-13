import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Plus, X, Loader2, MapPin, Package, Tag, Edit2, Trash2,
  CheckCircle, Clock, XCircle, Users, Sprout, Search
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/**
 * KisanBazaar — Farmer E-Commerce Marketplace
 * Team Antigravity | Smart Farm Management System
 *
 * Farmers list produce, admin approves, all can browse approved listings.
 * BUG FIX: Immediate re-fetch after create/update/delete operations.
 */

const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'piece'];
const initForm = {
  cropName: '', quantity: '', quantityUnit: 'kg', pricePerUnit: '',
  location: '', description: '', imageUrl: ''
};

const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { class: 'badge-pending',  icon: Clock,        label: 'Pending Approval' },
    approved: { class: 'badge-approved', icon: CheckCircle,  label: 'Live' },
    rejected: { class: 'badge-rejected', icon: XCircle,      label: 'Rejected' },
  }[status] || {};
  const Icon = cfg.icon;
  return (
    <span className={`${cfg.class} inline-flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

function InterestModal({ listing, onClose }) {
  const [form, setForm] = useState({ buyerName: '', buyerPhone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/listings/${listing._id}/interest`, form);
      setDone(true);
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-white font-bold">Express Interest</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-leaf-400 mx-auto mb-4" />
            <h4 className="text-white font-bold text-xl mb-2">Interest Registered!</h4>
            <p className="text-stone-400 text-sm">The farmer will contact you soon.</p>
            <button onClick={onClose} className="btn-primary mt-6">Close</button>
          </div>
        ) : (
          <>
            <div className="bg-leaf-900/30 border border-leaf-700/30 rounded-xl p-3 mb-5">
              <div className="text-white font-semibold">{listing.cropName}</div>
              <div className="text-stone-400 text-sm">{listing.quantity} {listing.quantityUnit} · ₹{listing.pricePerUnit}/{listing.quantityUnit}</div>
              <div className="text-stone-500 text-xs">{listing.location}</div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Your Name</label>
                <input value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })}
                  className="input-field" placeholder="Enter your full name" required />
              </div>
              <div>
                <label className="label-text">Phone Number</label>
                <input value={form.buyerPhone} onChange={e => setForm({ ...form, buyerPhone: e.target.value })}
                  className="input-field" placeholder="+91 9800000000" required />
              </div>
              <div>
                <label className="label-text">Message (Optional)</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none h-20" placeholder="Any specific requirements..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Interest'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function FarmerMarket() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'mine'
  const [interestListing, setInterestListing] = useState(null);
  const [search, setSearch] = useState('');

  // BUG FIX: fetchListings is extracted so it can be called after mutations
  const fetchListings = async () => {
    try {
      const { data } = await api.get('/listings');
      setListings(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  const myListings = listings.filter(l => l.farmerId?._id === user._id || l.farmerId === user._id);
  const approvedListings = listings.filter(l => l.approvalStatus === 'approved' && l.isAvailable);

  const openAdd = () => { setForm(initForm); setEditing(null); setError(''); setModal(true); };
  const openEdit = (l) => {
    setForm({
      cropName: l.cropName, quantity: l.quantity, quantityUnit: l.quantityUnit,
      pricePerUnit: l.pricePerUnit, location: l.location, description: l.description || '', imageUrl: l.imageUrl || ''
    });
    setEditing(l._id); setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/listings/${editing}`, form);
      else await api.post('/listings', form);
      await fetchListings(); // Immediate re-fetch (Bug Fix 2)
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save listing');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      await fetchListings(); // Immediate re-fetch
    } catch {}
  };

  const handleToggleAvail = async (l) => {
    try {
      await api.put(`/listings/${l._id}`, { isAvailable: !l.isAvailable });
      await fetchListings();
    } catch {}
  };

  const displayList = tab === 'mine'
    ? myListings.filter(l => l.cropName.toLowerCase().includes(search.toLowerCase()))
    : approvedListings.filter(l => l.cropName.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-indigo-700 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-white">KisanBazaar</h1>
            <p className="text-stone-400">Antigravity Farm Market — Buy & Sell Produce</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2" id="add-listing-btn">
          <Plus className="w-4 h-4" /> List My Produce
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 glass-card">
          <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'all' ? 'bg-purple-700 text-white' : 'text-stone-400 hover:text-white'}`}>
            🛒 All ({approvedListings.length})
          </button>
          <button onClick={() => setTab('mine')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'mine' ? 'bg-purple-700 text-white' : 'text-stone-400 hover:text-white'}`}>
            🌾 My Listings ({myListings.length})
          </button>
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop or location..." className="input-field pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
      ) : displayList.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ShoppingBag className="w-16 h-16 text-stone-700 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">{tab === 'mine' ? 'No listings yet' : 'No approved listings'}</h3>
          <p className="text-stone-500 mb-6">{tab === 'mine' ? 'Create your first listing to sell produce' : 'Check back soon for fresh listings'}</p>
          {tab === 'mine' && <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Listing</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayList.map((listing, i) => {
            const isOwner = listing.farmerId?._id === user._id || listing.farmerId === user._id;
            return (
              <div key={listing._id} className="glass-card p-5 hover:border-purple-700/40 transition-all duration-300" style={{ animation: `fadeUp 0.4s ease-out ${i * 60}ms both` }}>
                {/* Image placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-leaf-900/60 to-emerald-900/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.cropName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Sprout className="w-10 h-10 text-leaf-700 mx-auto mb-1" />
                      <span className="text-leaf-700 text-xs">No photo</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold text-xl font-display">{listing.cropName}</h3>
                  {isOwner && <StatusBadge status={listing.approvalStatus} />}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    <span>{listing.quantity} {listing.quantityUnit} available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-bold text-base">₹{Number(listing.pricePerUnit).toLocaleString('en-IN')}</span>
                    <span className="text-stone-500">per {listing.quantityUnit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{listing.location}</span>
                  </div>
                  {listing.description && (
                    <p className="text-stone-500 text-xs leading-relaxed">{listing.description}</p>
                  )}
                  {/* Farmer info (for buyer view) */}
                  {!isOwner && listing.farmerId && (
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-xs">
                      <span className="text-stone-500">Seller: </span>
                      <span className="text-stone-300 font-medium">{listing.farmerId.name}</span>
                      {listing.farmerId.phone && <span className="text-stone-500"> · {listing.farmerId.phone}</span>}
                    </div>
                  )}
                  {/* Admin remarks for owner */}
                  {isOwner && listing.adminRemarks && (
                    <div className="bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2 text-xs text-red-400">
                      Officer: {listing.adminRemarks}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                  {isOwner ? (
                    <>
                      <button onClick={() => handleToggleAvail(listing)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${listing.isAvailable ? 'text-leaf-400 bg-leaf-900/30 hover:bg-leaf-900/50' : 'text-stone-500 bg-stone-800 hover:bg-stone-700'}`}>
                        {listing.isAvailable ? '✅ Available' : '❌ Sold Out'}
                      </button>
                      <button onClick={() => openEdit(listing)} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(listing._id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 px-3 py-1.5 hover:bg-red-900/20 rounded-lg transition-colors ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setInterestListing(listing)}
                      className="w-full btn-primary text-center py-2 text-sm flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Express Interest
                    </button>
                  )}
                </div>

                {/* Interest count for owner */}
                {isOwner && listing.interests?.length > 0 && (
                  <div className="mt-2 text-xs text-blue-400 text-center">
                    👁️ {listing.interests.length} buyer(s) interested
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Listing Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-white font-bold">{editing ? 'Edit Listing' : 'List Your Produce'}</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            {error && <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Crop / Produce Name</label>
                <input value={form.cropName} onChange={e => setForm({ ...form, cropName: e.target.value })}
                  className="input-field" placeholder="e.g. Wheat, Onion, Tomato" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="input-field" placeholder="e.g. 50" required min="0" />
                </div>
                <div>
                  <label className="label-text">Unit</label>
                  <select value={form.quantityUnit} onChange={e => setForm({ ...form, quantityUnit: e.target.value })} className="select-field">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">Price per Unit (₹)</label>
                <input type="number" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                  className="input-field" placeholder="e.g. 2000" required min="0" />
              </div>
              <div>
                <label className="label-text">Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="input-field" placeholder="e.g. Nashik, Maharashtra" required />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none h-20" placeholder="Quality details, organic/non-organic, harvest date..." />
              </div>
              <div>
                <label className="label-text">Photo URL (Optional)</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  className="input-field" placeholder="https://... (image link)" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                  {saving ? 'Saving...' : editing ? 'Update Listing' : 'Submit for Approval'}
                </button>
              </div>
              <p className="text-stone-600 text-xs text-center">
                📋 Listing will be reviewed by a land officer before going live on KisanBazaar.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Interest Modal */}
      {interestListing && <InterestModal listing={interestListing} onClose={() => setInterestListing(null)} />}
    </div>
  );
}
