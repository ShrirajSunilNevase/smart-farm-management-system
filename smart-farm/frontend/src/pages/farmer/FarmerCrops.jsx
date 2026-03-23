import React, { useState, useEffect } from 'react';
import { Plus, Sprout, Edit2, Trash2, X, Loader2, Calendar } from 'lucide-react';
import api from '../../utils/api';

const STATUS_LABELS = { to_be_sown: 'To Be Sown', sown: 'Sown', harvested: 'Harvested' };
const STATUS_BADGES = { to_be_sown: 'badge-pending', sown: 'badge-sown', harvested: 'badge-harvested' };

const initForm = { cropName: '', cropStatus: 'to_be_sown', sowingDate: '', harvestDate: '', fertilizer: '', notes: '' };

export default function FarmerCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchCrops = async () => {
    try { const { data } = await api.get('/crops'); setCrops(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCrops(); }, []);

  const openAdd = () => { setForm(initForm); setEditing(null); setError(''); setModal(true); };
  const openEdit = (crop) => {
    setForm({
      cropName: crop.cropName, cropStatus: crop.cropStatus,
      sowingDate: crop.sowingDate ? crop.sowingDate.slice(0,10) : '',
      harvestDate: crop.harvestDate ? crop.harvestDate.slice(0,10) : '',
      fertilizer: crop.fertilizer || '', notes: crop.notes || ''
    });
    setEditing(crop._id); setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/crops/${editing}`, form);
      else await api.post('/crops', form);
      await fetchCrops(); setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this crop?')) return;
    try { await api.delete(`/crops/${id}`); setCrops(c => c.filter(x => x._id !== id)); } catch {}
  };

  const filtered = filter === 'all' ? crops : crops.filter(c => c.cropStatus === filter);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Crop Management</h1>
          <p className="text-stone-400 mt-1">Track your crops through every growth stage</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Crop
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 glass-card w-fit">
        {['all', 'to_be_sown', 'sown', 'harvested'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${filter === s ? 'bg-leaf-700 text-white' : 'text-stone-400 hover:text-white'}`}>
            {s === 'all' ? `All (${crops.length})` : `${STATUS_LABELS[s]} (${crops.filter(c => c.cropStatus === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-leaf-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Sprout className="w-16 h-16 text-stone-700 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">No Crops {filter !== 'all' ? `with status "${STATUS_LABELS[filter]}"` : 'Added'}</h3>
          <p className="text-stone-500 mb-6">Start tracking your crop lifecycle</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Crop</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((crop, i) => (
            <div key={crop._id} className="glass-card p-5 hover:border-leaf-700/40 transition-all duration-300" style={{ animation: `fadeUp 0.4s ease-out ${i * 60}ms both` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-800/50 rounded-xl flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
                <span className={STATUS_BADGES[crop.cropStatus]}>{STATUS_LABELS[crop.cropStatus]}</span>
              </div>

              <h3 className="text-white font-bold text-xl mb-4 font-display">{crop.cropName}</h3>

              <div className="space-y-2 text-sm mb-4">
                {crop.sowingDate && (
                  <div className="flex items-center gap-2 text-stone-400">
                    <Calendar className="w-3.5 h-3.5 text-leaf-500" />
                    Sown: {new Date(crop.sowingDate).toLocaleDateString('en-IN')}
                  </div>
                )}
                {crop.harvestDate && (
                  <div className="flex items-center gap-2 text-stone-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Harvest: {new Date(crop.harvestDate).toLocaleDateString('en-IN')}
                  </div>
                )}
                {crop.fertilizer && (
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-stone-500 text-xs">Fertilizer: </span>
                    <span className="text-stone-300">{crop.fertilizer}</span>
                  </div>
                )}
                {crop.notes && (
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-stone-300 text-xs italic">{crop.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button onClick={() => openEdit(crop)} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/10 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(crop._id)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-900/20 rounded-lg ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-white font-bold">{editing ? 'Edit Crop' : 'Add New Crop'}</h3>
              <button onClick={() => setModal(false)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}
              
              <div>
                <label className="label-text">Crop Name</label>
                <input value={form.cropName} onChange={e => setForm({...form, cropName: e.target.value})} className="input-field" placeholder="e.g. Wheat, Rice, Cotton" required />
              </div>

              <div>
                <label className="label-text">Crop Status</label>
                <select value={form.cropStatus} onChange={e => setForm({...form, cropStatus: e.target.value})} className="select-field">
                  <option value="to_be_sown">To Be Sown</option>
                  <option value="sown">Already Sown</option>
                  <option value="harvested">Harvested</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Sowing Date</label>
                  <input type="date" value={form.sowingDate} onChange={e => setForm({...form, sowingDate: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Expected Harvest</label>
                  <input type="date" value={form.harvestDate} onChange={e => setForm({...form, harvestDate: e.target.value})} className="input-field" />
                </div>
              </div>

              <div>
                <label className="label-text">Fertilizer Used</label>
                <input value={form.fertilizer} onChange={e => setForm({...form, fertilizer: e.target.value})} className="input-field" placeholder="e.g. Urea, DAP, Organic compost" />
              </div>

              <div>
                <label className="label-text">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field resize-none h-20" placeholder="Any additional observations..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
