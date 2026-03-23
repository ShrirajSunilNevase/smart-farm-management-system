import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, X, Loader2, FileText } from 'lucide-react';
import api from '../../utils/api';

const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky', 'Black Cotton'];
const IRRIGATION = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Canal', 'Borewell', 'Pond'];

const initForm = { landSize: '', unit: 'acres', soilType: '', irrigationType: '', location: '', surveyNumber: '' };

export default function FarmerLand() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchLands = async () => {
    try {
      const { data } = await api.get('/land');
      setLands(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLands(); }, []);

  const openAdd = () => { setForm(initForm); setEditing(null); setError(''); setModal(true); };
  const openEdit = (land) => {
    setForm({ landSize: land.landSize, unit: land.unit, soilType: land.soilType, irrigationType: land.irrigationType, location: land.location, surveyNumber: land.surveyNumber });
    setEditing(land._id); setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/land/${editing}`, form);
      else await api.post('/land', form);
      await fetchLands();
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this land record?')) return;
    try { await api.delete(`/land/${id}`); setLands(l => l.filter(x => x._id !== id)); }
    catch {}
  };

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
    return <span className={map[s] || 'badge-pending'}>{s}</span>;
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">My Land Records</h1>
          <p className="text-stone-400 mt-1">Register and manage your agricultural land</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Land
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-leaf-500 animate-spin" /></div>
      ) : lands.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <MapPin className="w-16 h-16 text-stone-700 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">No Land Records</h3>
          <p className="text-stone-500 mb-6">Start by adding your first land parcel for verification</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add First Land</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {lands.map((land, i) => (
            <div key={land._id} className="glass-card p-5 hover:border-leaf-700/40 transition-all duration-300" style={{ animation: `fadeUp 0.4s ease-out ${i * 60}ms both` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-leaf-800/50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-leaf-400" />
                </div>
                {statusBadge(land.approvalStatus)}
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{land.location}</h3>
              <p className="text-stone-400 text-sm mb-4">Survey No: {land.surveyNumber}</p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-white/5 rounded-lg p-2.5">
                  <div className="text-stone-500 text-xs mb-0.5">Land Size</div>
                  <div className="text-white font-semibold">{land.landSize} {land.unit}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <div className="text-stone-500 text-xs mb-0.5">Soil Type</div>
                  <div className="text-white font-semibold">{land.soilType}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 col-span-2">
                  <div className="text-stone-500 text-xs mb-0.5">Irrigation</div>
                  <div className="text-white font-semibold">{land.irrigationType}</div>
                </div>
              </div>

              {land.remarks && (
                <div className="bg-stone-800/50 rounded-lg p-3 mb-3 text-sm">
                  <span className="text-stone-500 text-xs font-semibold uppercase tracking-wide">Officer Remarks: </span>
                  <span className="text-stone-300">{land.remarks}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button onClick={() => openEdit(land)} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/10 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(land._id)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-900/20 rounded-lg ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl font-display">{editing ? 'Edit Land Record' : 'Add New Land'}</h3>
              <button onClick={() => setModal(false)} className="text-stone-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Land Size</label>
                  <input name="landSize" type="number" step="0.01" value={form.landSize} onChange={e => setForm({...form, landSize: e.target.value})} className="input-field" placeholder="e.g. 2.5" required />
                </div>
                <div>
                  <label className="label-text">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="select-field">
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-text">Location / Village</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="Village name, Taluka, District" required />
              </div>

              <div>
                <label className="label-text">Survey Number</label>
                <input value={form.surveyNumber} onChange={e => setForm({...form, surveyNumber: e.target.value})} className="input-field" placeholder="e.g. 45/A/2" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Soil Type</label>
                  <select value={form.soilType} onChange={e => setForm({...form, soilType: e.target.value})} className="select-field" required>
                    <option value="">Select...</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Irrigation Type</label>
                  <select value={form.irrigationType} onChange={e => setForm({...form, irrigationType: e.target.value})} className="select-field" required>
                    <option value="">Select...</option>
                    {IRRIGATION.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editing ? 'Update Land' : 'Add Land'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
