import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, CheckCircle, XCircle, Clock, Package, MapPin, Tag,
  Loader2, Eye, Search, Filter, Users
} from 'lucide-react';
import api from '../../utils/api';

/**
 * Admin Market — KisanBazaar Listing Moderation
 * Team Antigravity | Smart Farm Management System
 *
 * Admin can approve/reject farmer produce listings.
 * BUG FIX: Re-fetches after every action for immediate data reflection.
 */
export default function AdminMarket() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(null);
  const [remarkModal, setRemarkModal] = useState(null); // { listing, action }
  const [remark, setRemark] = useState('');

  const fetchListings = async () => {
    try {
      const { data } = await api.get('/listings');
      setListings(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleAction = async (id, approvalStatus, remarks) => {
    setProcessing(id);
    try {
      await api.put(`/listings/${id}/approve`, { approvalStatus, adminRemarks: remarks || '' });
      await fetchListings(); // BUG FIX: Immediate re-fetch
    } catch {}
    finally { setProcessing(null); setRemarkModal(null); setRemark(''); }
  };

  const filtered = listings.filter(l => {
    const matchFilter = filter === 'all' || l.approvalStatus === filter;
    const matchSearch = l.cropName.toLowerCase().includes(search.toLowerCase()) ||
      (l.farmerId?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: listings.length,
    pending: listings.filter(l => l.approvalStatus === 'pending').length,
    approved: listings.filter(l => l.approvalStatus === 'approved').length,
    rejected: listings.filter(l => l.approvalStatus === 'rejected').length,
  };

  const badgeClass = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
  const badgeLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-indigo-700 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-white">KisanBazaar Moderation</h1>
            <p className="text-stone-400">Review and approve farmer produce listings</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: counts.all,     icon: ShoppingBag, color: 'bg-stone-700' },
          { label: 'Pending Review', value: counts.pending,  icon: Clock,        color: 'bg-amber-700' },
          { label: 'Approved Live',  value: counts.approved, icon: CheckCircle,  color: 'bg-leaf-700' },
          { label: 'Rejected',       value: counts.rejected, icon: XCircle,      color: 'bg-red-700' },
        ].map((card, i) => (
          <div key={i} className="glass-card p-4" style={{ animation: `fadeUp 0.4s ease-out ${i * 80}ms both` }}>
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-white font-bold text-2xl">{card.value}</div>
            <div className="text-stone-400 text-xs">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 glass-card">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-purple-700 text-white' : 'text-stone-400 hover:text-white'}`}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop or farmer..." className="input-field pl-10" />
        </div>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ShoppingBag className="w-14 h-14 text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500">No listings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((listing, i) => (
            <div key={listing._id} className="glass-card p-5" style={{ animation: `fadeUp 0.4s ease-out ${i * 50}ms both` }}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-leaf-900/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-leaf-700/20 text-2xl">
                    🌾
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="text-white font-bold text-lg">{listing.cropName}</h3>
                      <span className={badgeClass[listing.approvalStatus]}>
                        {badgeLabel[listing.approvalStatus]}
                      </span>
                      {!listing.isAvailable && (
                        <span className="text-xs text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">Sold Out</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-stone-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-purple-400" />
                        {listing.quantity} {listing.quantityUnit}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        ₹{Number(listing.pricePerUnit).toLocaleString('en-IN')}/{listing.quantityUnit}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {listing.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-leaf-400" />
                        {listing.farmerId?.name || 'Unknown'}
                      </span>
                    </div>
                    {listing.description && <p className="text-stone-500 text-xs">{listing.description}</p>}
                    {listing.adminRemarks && (
                      <div className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-700/20 rounded-lg px-3 py-1.5 inline-block">
                        Remarks: {listing.adminRemarks}
                      </div>
                    )}
                    {listing.interests?.length > 0 && (
                      <div className="mt-2 text-xs text-blue-400">
                        👁️ {listing.interests.length} buyer interest(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {listing.approvalStatus === 'pending' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(listing._id, 'approved', '')}
                      disabled={processing === listing._id}
                      className="flex items-center gap-2 bg-leaf-700 hover:bg-leaf-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      id={`approve-${listing._id}`}
                    >
                      {processing === listing._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => { setRemarkModal({ listing, action: 'rejected' }); setRemark(''); }}
                      disabled={processing === listing._id}
                      className="flex items-center gap-2 bg-red-700/80 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      id={`reject-${listing._id}`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {listing.approvalStatus === 'approved' && (
                  <button
                    onClick={() => { setRemarkModal({ listing, action: 'rejected' }); setRemark(''); }}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-700/30 hover:border-red-600/60 px-3 py-2 rounded-xl transition-all"
                  >
                    Revoke
                  </button>
                )}

                {listing.approvalStatus === 'rejected' && (
                  <button
                    onClick={() => handleAction(listing._id, 'approved', '')}
                    className="text-xs text-leaf-400 hover:text-leaf-300 border border-leaf-700/30 hover:border-leaf-600/60 px-3 py-2 rounded-xl transition-all"
                  >
                    Re-approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject with Remarks Modal */}
      {remarkModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRemarkModal(null)}>
          <div className="modal-box max-w-md">
            <h3 className="font-display text-xl text-white font-bold mb-4">
              {remarkModal.action === 'rejected' ? 'Reject Listing' : 'Approve Listing'}
            </h3>
            <div className="glass-card p-3 mb-4">
              <div className="text-white font-semibold">{remarkModal.listing.cropName}</div>
              <div className="text-stone-400 text-sm">by {remarkModal.listing.farmerId?.name}</div>
            </div>
            <div className="mb-4">
              <label className="label-text">Remarks for Farmer</label>
              <textarea
                value={remark}
                onChange={e => setRemark(e.target.value)}
                className="input-field resize-none h-24"
                placeholder="Reason for rejection or additional notes..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRemarkModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleAction(remarkModal.listing._id, remarkModal.action, remark)}
                className={`flex-1 font-bold py-2.5 rounded-xl transition-all ${
                  remarkModal.action === 'rejected'
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'btn-primary'
                }`}
              >
                {remarkModal.action === 'rejected' ? 'Confirm Reject' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
