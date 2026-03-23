import React, { useState, useEffect } from 'react';
import { Plus, Wrench, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const EQUIPMENT_TYPES = ['Tractor', 'Harvester', 'Irrigation Pump', 'Thresher', 'Plough', 'Rotavator', 'Sprayer', 'Transplanter', 'Other'];
const CONDITION_COLORS = { excellent: 'text-leaf-400', good: 'text-blue-400', fair: 'text-amber-400', poor: 'text-red-400' };
const initForm = { equipmentName: '', type: '', purchaseYear: '', condition: 'good' };

export default function FarmerEquipment() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try { const { data } = await api.get('/equipment'); setItems(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setForm(initForm); setEditing(null); setError(''); setModal(true); };
  const openEdit = (item) => {
    setForm({ equipmentName: item.equipmentName, type: item.type, purchaseYear: item.purchaseYear, condition: item.condition });
    setEditing(item._id); setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/equipment/${editing}`, form);
      else await api.post('/equipment', form);
      await fetchItems(); setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this equipment?')) return;
    try { await api.delete(`/equipment/${id}`); setItems(i => i.filter(x => x._id !== id)); } catch {}
  };

  const ICONS = { Tractor: '🚜', Harvester: '🌾', 'Irrigation Pump': '💧', Thresher: '⚙️', Plough: '🔧', Rotavator: '🔩', Sprayer: '💦', Transplanter: '🌱', Other: '🔧' };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Equipment</h1>
          <p className="text-stone-400 mt-1">Track all your farm machinery and tools</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['excellent', 'good', 'fair', 'poor'].map(c => (
            <div key={c} className="glass-card px-4 py-3 text-center">
              <div className={`text-2xl font-display font-bold ${CONDITION_COLORS[c]}`}>
                {items.filter(i => i.condition === c).length}
              </div>
              <div className="text-stone-500 text-xs capitalize">{c} condition</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-leaf-500 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Wrench className="w-16 h-16 text-stone-700 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">No Equipment Added</h3>
          <p className="text-stone-500 mb-6">Add your farm machinery and tools to track them</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Equipment</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <div key={item._id} className="glass-card p-5 hover:border-leaf-700/40 transition-all duration-300" style={{ animation: `fadeUp 0.4s ease-out ${i * 60}ms both` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{ICONS[item.type] || '🔧'}</div>
                <span className={`text-xs font-bold uppercase tracking-wide ${CONDITION_COLORS[item.condition]}`}>{item.condition}</span>
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{item.equipmentName}</h3>
              <p className="text-stone-400 text-sm mb-4">{item.type}</p>

              <div className="flex items-center gap-3">
                <div className="bg-white/5 rounded-lg px-3 py-2 text-center flex-1">
                  <div className="text-stone-500 text-xs">Purchase Year</div>
                  <div className="text-white font-bold">{item.purchaseYear}</div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2 text-center flex-1">
                  <div className="text-stone-500 text-xs">Age</div>
                  <div className="text-white font-bold">{new Date().getFullYear() - item.purchaseYear} yrs</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/10 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(item._id)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-900/20 rounded-lg ml-auto">
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
              <h3 className="font-display text-xl text-white font-bold">{editing ? 'Edit Equipment' : 'Add Equipment'}</h3>
              <button onClick={() => setModal(false)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <div>
                <label className="label-text">Equipment Name</label>
                <input value={form.equipmentName} onChange={e => setForm({...form, equipmentName: e.target.value})} className="input-field" placeholder="e.g. John Deere 5310 Tractor" required />
              </div>

              <div>
                <label className="label-text">Equipment Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="select-field" required>
                  <option value="">Select type...</option>
                  {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Purchase Year</label>
                  <input type="number" value={form.purchaseYear} onChange={e => setForm({...form, purchaseYear: e.target.value})} className="input-field" placeholder="e.g. 2020" min="1990" max={new Date().getFullYear()} required />
                </div>
                <div>
                  <label className="label-text">Condition</label>
                  <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="select-field">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
