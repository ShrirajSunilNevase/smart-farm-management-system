import React, { useState, useEffect } from 'react';
import {
  MapPin, Search, CheckCircle, XCircle, Clock, Filter,
  Loader2, X, MessageSquare, Eye
} from 'lucide-react';
import api from '../../utils/api';

const STATUS_CONFIG = {
  pending:  { badge: 'badge-pending',  icon: Clock,       label: 'Pending'  },
  approved: { badge: 'badge-approved', icon: CheckCircle, label: 'Approved' },
  rejected: { badge: 'badge-rejected', icon: XCircle,     label: 'Rejected' },
};

export default function AdminLandVerification() {
  const [lands, setLands]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [verifyModal, setVerifyModal] = useState(null);
  const [remarks, setRemarks]       = useState('');
  const [saving, setSaving]         = useState(false);
  const [viewModal, setViewModal]   = useState(null);

  const fetchLands = async () => {
    try { const { data } = await api.get('/land'); setLands(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLands(); }, []);

  const handleVerify = async (status) => {
    setSaving(true);
    try {
      await api.put(`/land/${verifyModal._id}/verify`, { approvalStatus: status, remarks });
      await fetchLands();
      setVerifyModal(null);
      setRemarks('');
    } catch {}
    finally { setSaving(false); }
  };

  const filtered = lands.filter(l => {
    const matchSearch =
      l.location?.toLowerCase().includes(search.toLowerCase()) ||
      l.farmerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.surveyNumber?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.approvalStatus === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: lands.length,
    pending: lands.filter(l => l.approvalStatus === 'pending').length,
    approved: lands.filter(l => l.approvalStatus === 'approved').length,
    rejected: lands.filter(l => l.approvalStatus === 'rejected').length,
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white">Land Verification</h1>
        <p className="text-stone-400 mt-1">Review and approve farmer land submissions</p>
      </div>

      {/* Summary Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`glass-card px-4 py-3 text-center transition-all duration-200 ${filter === key ? 'border-amber-600/50 bg-amber-900/15' : 'hover:border-white/20'}`}
          >
            <div className={`text-2xl font-display font-bold ${
              key === 'pending' ? 'text-amber-400' :
              key === 'approved' ? 'text-leaf-400' :
              key === 'rejected' ? 'text-red-400' : 'text-white'
            }`}>{count}</div>
            <div className="text-stone-500 text-xs capitalize">{key}</div>
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-11" placeholder="Search by location, farmer or survey no..."
          />
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-2">
          <Filter className="w-4 h-4 text-stone-500" />
          {['all','pending','approved','rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${filter === s ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide">Farmer</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">Land Info</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-stone-600">No land records match your filter</td></tr>
                ) : filtered.map((land, i) => {
                  const Cfg = STATUS_CONFIG[land.approvalStatus] || STATUS_CONFIG.pending;
                  return (
                    <tr key={land._id} className="table-row" style={{ animation: `fadeIn 0.3s ease-out ${i * 40}ms both` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-800/50 rounded-full flex items-center justify-center text-xs font-bold text-amber-300 flex-shrink-0">
                            {land.farmerId?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{land.farmerId?.name || 'Unknown'}</div>
                            <div className="text-stone-500 text-xs">{land.farmerId?.email || ''}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-stone-300 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                          <span className="max-w-[180px] truncate">{land.location}</span>
                        </div>
                        <div className="text-stone-600 text-xs mt-0.5">Survey: {land.surveyNumber}</div>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-stone-300 text-sm">{land.landSize} {land.unit}</div>
                        <div className="text-stone-600 text-xs">{land.soilType} · {land.irrigationType}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={Cfg.badge}>{Cfg.label}</span>
                        {land.remarks && (
                          <div className="flex items-center gap-1 mt-1 text-stone-600 text-xs">
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{land.remarks}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewModal(land)}
                            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {land.approvalStatus === 'pending' && (
                            <button
                              onClick={() => { setVerifyModal(land); setRemarks(''); }}
                              className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/30 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Review
                            </button>
                          )}
                          {land.approvalStatus !== 'pending' && (
                            <button
                              onClick={() => { setVerifyModal(land); setRemarks(land.remarks || ''); }}
                              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setVerifyModal(null)}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-white font-bold">Review Land Record</h3>
              <button onClick={() => setVerifyModal(null)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Land summary */}
            <div className="bg-white/5 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Farmer</span>
                <span className="text-white font-medium">{verifyModal.farmerId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Location</span>
                <span className="text-stone-200">{verifyModal.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Survey Number</span>
                <span className="text-stone-200">{verifyModal.surveyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Land Size</span>
                <span className="text-stone-200">{verifyModal.landSize} {verifyModal.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Soil / Irrigation</span>
                <span className="text-stone-200">{verifyModal.soilType} · {verifyModal.irrigationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Current Status</span>
                <span className={`badge-${verifyModal.approvalStatus}`}>{verifyModal.approvalStatus}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="label-text">Remarks / Feedback (optional)</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="input-field resize-none h-24"
                placeholder="Add official remarks for the farmer..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVerify('rejected')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600/80 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
              <button
                onClick={() => handleVerify('approved')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-leaf-600 hover:bg-leaf-500 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-white font-bold">Land Details</h3>
              <button onClick={() => setViewModal(null)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Farmer', viewModal.farmerId?.name],
                ['Email', viewModal.farmerId?.email],
                ['Phone', viewModal.farmerId?.phone || '—'],
                ['Location', viewModal.location],
                ['Survey Number', viewModal.surveyNumber],
                ['Land Size', `${viewModal.landSize} ${viewModal.unit}`],
                ['Soil Type', viewModal.soilType],
                ['Irrigation', viewModal.irrigationType],
                ['Submitted', new Date(viewModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Status', viewModal.approvalStatus],
                ['Remarks', viewModal.remarks || 'None'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-white/5 last:border-0">
                  <span className="text-stone-500 flex-shrink-0 w-32">{label}</span>
                  <span className={`text-right ${label === 'Status' ? `badge-${viewModal.approvalStatus}` : 'text-stone-200'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
