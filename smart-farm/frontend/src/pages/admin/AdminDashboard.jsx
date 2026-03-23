import React, { useEffect, useState } from 'react';
import { Users, MapPin, Sprout, Clock, TrendingUp, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../utils/api';
import AdminWeatherWidget from '../../components/admin/AdminWeatherWidget';

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <div className="stat-card" style={{ animation: `fadeUp 0.5s ease-out ${delay}ms both` }}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <TrendingUp className="w-4 h-4 text-amber-500" />
    </div>
    <div className="text-3xl font-display text-white font-bold mb-1">{value}</div>
    <div className="text-stone-400 text-sm font-medium">{label}</div>
    {sub && <div className="text-xs text-stone-600 mt-1">{sub}</div>}
  </div>
);

const COLORS = ['#f59e0b', '#22c55e', '#ef4444'];
const CROP_COLORS = ['#22c55e', '#3b82f6', '#a855f7'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;

  const landStatusData = [
    { name: 'Pending', value: stats?.pendingLands || 0 },
    { name: 'Approved', value: stats?.approvedLands || 0 },
    { name: 'Rejected', value: (stats?.totalLands || 0) - (stats?.pendingLands || 0) - (stats?.approvedLands || 0) },
  ].filter(d => d.value >= 0);

  const cropStats = (stats?.cropStatusStats || []).map(s => ({
    name: s._id === 'to_be_sown' ? 'To Sow' : s._id === 'sown' ? 'Sown' : 'Harvested',
    value: s.count
  }));

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="font-display text-3xl text-white">Officer Dashboard</h1>
        <p className="text-stone-400 mt-1">Overview of all registered farms and pending actions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Farmers" value={stats?.totalFarmers || 0} sub="Registered farmers" color="bg-blue-700" delay={0} />
        <StatCard icon={MapPin} label="Land Records" value={stats?.totalLands || 0} sub={`${stats?.pendingLands || 0} pending`} color="bg-amber-700" delay={100} />
        <StatCard icon={Sprout} label="Active Crops" value={stats?.activeCrops || 0} sub={`${stats?.totalCrops || 0} total`} color="bg-leaf-700" delay={200} />
        <StatCard icon={Clock} label="Pending Review" value={stats?.pendingLands || 0} sub="Needs attention" color="bg-red-700" delay={300} />
      </div>

      <AdminWeatherWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-1">Land Approval Distribution</h3>
          <p className="text-stone-500 text-sm mb-4">Status of all submitted land records</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={landStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {landStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-1">Crop Status Overview</h3>
          <p className="text-stone-500 text-sm mb-4">Distribution of crop growth stages</p>
          {cropStats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-stone-600"><p>No crop data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cropStats} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {cropStats.map((_, i) => <Cell key={i} fill={CROP_COLORS[i % CROP_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/land" className="flex items-center gap-4 p-4 bg-amber-900/20 border border-amber-700/30 rounded-xl hover:border-amber-600/50 transition-all group">
            <div className="w-10 h-10 bg-amber-700/50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Review Pending Lands</div>
              <div className="text-amber-400 text-xs">{stats?.pendingLands || 0} awaiting review</div>
            </div>
          </a>
          <a href="/admin/farmers" className="flex items-center gap-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl hover:border-blue-600/50 transition-all">
            <div className="w-10 h-10 bg-blue-700/50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">View All Farmers</div>
              <div className="text-blue-400 text-xs">{stats?.totalFarmers || 0} registered</div>
            </div>
          </a>
          <a href="/admin/crops" className="flex items-center gap-4 p-4 bg-leaf-900/20 border border-leaf-700/30 rounded-xl hover:border-leaf-600/50 transition-all">
            <div className="w-10 h-10 bg-leaf-700/50 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-leaf-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Monitor Crops</div>
              <div className="text-leaf-400 text-xs">{stats?.activeCrops || 0} currently growing</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
