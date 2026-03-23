import React, { useState, useEffect } from 'react';
import { Sprout, Search, Calendar, Filter, Loader2, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '../../utils/api';

const STATUS_LABELS = { to_be_sown: 'To Be Sown', sown: 'Sown', harvested: 'Harvested' };
const STATUS_BADGES = { to_be_sown: 'badge-pending', sown: 'badge-sown', harvested: 'badge-harvested' };
const STATUS_COLORS = { to_be_sown: '#f59e0b', sown: '#3b82f6', harvested: '#a855f7' };

export default function AdminCropMonitor() {
  const [crops, setCrops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/crops').then(r => setCrops(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = crops.filter(c => {
    const matchSearch =
      c.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      c.farmerId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.cropStatus === filter;
    return matchSearch && matchFilter;
  });

  // Aggregate crop type counts for the bar chart
  const cropTypeMap = {};
  crops.forEach(c => {
    cropTypeMap[c.cropName] = (cropTypeMap[c.cropName] || 0) + 1;
  });
  const topCrops = Object.entries(cropTypeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const counts = {
    all:        crops.length,
    to_be_sown: crops.filter(c => c.cropStatus === 'to_be_sown').length,
    sown:       crops.filter(c => c.cropStatus === 'sown').length,
    harvested:  crops.filter(c => c.cropStatus === 'harvested').length,
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="font-display text-3xl text-white">Crop Monitoring</h1>
        <p className="text-stone-400 mt-1">Monitor crop types and growth stages across all farms</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'all',        label: 'Total Crops',   color: 'text-white'       },
          { key: 'to_be_sown', label: 'To Be Sown',    color: 'text-amber-400'   },
          { key: 'sown',       label: 'Currently Sown', color: 'text-blue-400'   },
          { key: 'harvested',  label: 'Harvested',      color: 'text-purple-400' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`glass-card px-4 py-3 text-center transition-all duration-200 ${filter === key ? 'border-leaf-600/50 bg-leaf-900/15' : 'hover:border-white/20'}`}
          >
            <div className={`text-2xl font-display font-bold ${color}`}>{counts[key]}</div>
            <div className="text-stone-500 text-xs">{label}</div>
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      {topCrops.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-leaf-400" />
            <h3 className="text-white font-bold">Top Crops by Volume</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCrops} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1c1917', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff' }}
                cursor={{ fill: '#ffffff08' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {topCrops.map((_, i) => (
                  <Cell key={i} fill={['#22c55e','#16a34a','#15803d','#166534','#3b82f6','#f59e0b','#a855f7','#ec4899'][i % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-11" placeholder="Search by crop name or farmer..."
          />
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-2">
          <Filter className="w-4 h-4 text-stone-500" />
          {['all', 'to_be_sown', 'sown', 'harvested'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filter === s ? 'bg-leaf-700 text-white' : 'text-stone-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-leaf-500 animate-spin" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide">Crop</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden md:table-cell">Farmer</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">Sowing Date</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">Harvest Date</th>
                  <th className="text-left px-6 py-4 text-stone-500 text-xs font-semibold uppercase tracking-wide hidden xl:table-cell">Fertilizer</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-stone-600">
                      <Sprout className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No crops found
                    </td>
                  </tr>
                ) : filtered.map((crop, i) => (
                  <tr key={crop._id} className="table-row" style={{ animation: `fadeIn 0.3s ease-out ${i * 40}ms both` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-leaf-800/50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                          🌱
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{crop.cropName}</div>
                          {crop.notes && (
                            <div className="text-stone-600 text-xs truncate max-w-[140px]">{crop.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-stone-300 text-sm">{crop.farmerId?.name || '—'}</div>
                      <div className="text-stone-600 text-xs">{crop.farmerId?.email || ''}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={STATUS_BADGES[crop.cropStatus]}>
                        {STATUS_LABELS[crop.cropStatus]}
                      </span>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell">
                      {crop.sowingDate ? (
                        <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-leaf-600" />
                          {new Date(crop.sowingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      ) : <span className="text-stone-700 text-sm">—</span>}
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell">
                      {crop.harvestDate ? (
                        <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {new Date(crop.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      ) : <span className="text-stone-700 text-sm">—</span>}
                    </td>

                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span className="text-stone-400 text-sm">{crop.fertilizer || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
