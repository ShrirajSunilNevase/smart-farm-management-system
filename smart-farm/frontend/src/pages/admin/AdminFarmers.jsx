import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MapPin, Calendar, ChevronRight, Loader2, X } from 'lucide-react';
import api from '../../utils/api';

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    api.get('/admin/farmers').then(r => setFarmers(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openDetails = async (farmer) => {
    setSelected(farmer); setLoadingDetails(true);
    try {
      const { data } = await api.get(`/admin/farmers/${farmer._id}/details`);
      setDetails(data);
    } catch {} finally { setLoadingDetails(false); }
  };

  const filtered = farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    (f.phone || '').includes(search)
  );

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Registered Farmers</h1>
          <p className="text-stone-400 mt-1">{farmers.length} farmers in the system</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-11" placeholder="Search by name, email or phone..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide">Farmer</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden md:table-cell">Contact</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">Address</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-stone-600">No farmers found</td></tr>
                ) : filtered.map((farmer, i) => (
                  <tr key={farmer._id} className="table-row" style={{ animation: `fadeIn 0.3s ease-out ${i * 40}ms both` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-leaf-800 rounded-full flex items-center justify-center text-sm font-bold text-leaf-300 flex-shrink-0">
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{farmer.name}</div>
                          <div className="text-stone-500 text-xs">{farmer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {farmer.phone ? (
                        <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                          <Phone className="w-3.5 h-3.5" /> {farmer.phone}
                        </div>
                      ) : <span className="text-stone-700 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {farmer.address ? (
                        <div className="flex items-center gap-1.5 text-stone-400 text-sm max-w-xs truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {farmer.address}
                        </div>
                      ) : <span className="text-stone-700 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-stone-500 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(farmer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openDetails(farmer)} className="flex items-center gap-1 text-leaf-400 hover:text-leaf-300 text-sm font-medium transition-colors">
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-leaf-700 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl font-display">{selected.name}</h3>
                  <p className="text-stone-400 text-sm">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {loadingDetails ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-leaf-500 animate-spin" /></div>
            ) : details && (
              <div className="space-y-5">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  {[['Phone', details.farmer?.phone], ['Address', details.farmer?.address]].map(([l, v]) => (
                    <div key={l} className="bg-white/5 rounded-xl p-3">
                      <div className="text-stone-500 text-xs mb-1">{l}</div>
                      <div className="text-white text-sm">{v || '—'}</div>
                    </div>
                  ))}
                </div>

                {/* Lands */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-leaf-400" /> Land Records ({details.lands?.length || 0})
                  </h4>
                  {details.lands?.length === 0 ? <p className="text-stone-600 text-sm">No land records</p> : (
                    <div className="space-y-2">
                      {details.lands.map(land => (
                        <div key={land._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 text-sm">
                          <span className="text-stone-200">{land.location} — {land.landSize} {land.unit}</span>
                          <span className={`badge-${land.approvalStatus}`}>{land.approvalStatus}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Crops */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>🌱</span> Crops ({details.crops?.length || 0})
                  </h4>
                  {details.crops?.length === 0 ? <p className="text-stone-600 text-sm">No crops recorded</p> : (
                    <div className="space-y-2">
                      {details.crops.map(crop => (
                        <div key={crop._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 text-sm">
                          <span className="text-stone-200">{crop.cropName}</span>
                          <span className={`badge-${crop.cropStatus === 'to_be_sown' ? 'pending' : crop.cropStatus === 'sown' ? 'sown' : 'harvested'}`}>
                            {crop.cropStatus.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equipment */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>🔧</span> Equipment ({details.equipment?.length || 0})
                  </h4>
                  {details.equipment?.length === 0 ? <p className="text-stone-600 text-sm">No equipment recorded</p> : (
                    <div className="grid grid-cols-2 gap-2">
                      {details.equipment.map(eq => (
                        <div key={eq._id} className="bg-white/5 rounded-xl px-4 py-3 text-sm">
                          <div className="text-stone-200 font-medium">{eq.equipmentName}</div>
                          <div className="text-stone-500 text-xs">{eq.type} · {eq.condition}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
