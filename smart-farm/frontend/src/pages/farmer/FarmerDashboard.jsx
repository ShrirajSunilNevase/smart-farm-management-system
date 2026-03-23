import React, { useEffect, useState } from 'react';
import { MapPin, Sprout, Wrench, Bell, TrendingUp, Sun, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import WeatherAlerts from '../../components/farmer/WeatherAlerts';

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <div className="stat-card" style={{ animation: `fadeUp 0.5s ease-out ${delay}ms both` }}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <TrendingUp className="w-4 h-4 text-leaf-500" />
    </div>
    <div className="text-3xl font-display text-white font-bold mb-1">{value}</div>
    <div className="text-stone-400 text-sm font-medium">{label}</div>
    {sub && <div className="text-xs text-stone-600 mt-1">{sub}</div>}
  </div>
);

const CROP_COLORS = ['#22c55e', '#3b82f6', '#a855f7'];
const CROP_LABELS = { to_be_sown: 'To Be Sown', sown: 'Sown', harvested: 'Harvested' };

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ lands: [], crops: [], equipment: [], loading: true });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [landRes, cropRes, eqRes] = await Promise.all([
          api.get('/land'), api.get('/crops'), api.get('/equipment')
        ]);
        setData({ lands: landRes.data, crops: cropRes.data, equipment: eqRes.data, loading: false });
      } catch {
        setData(d => ({ ...d, loading: false }));
      }
    };
    fetchAll();
  }, []);

  const unreadNotifs = user?.notifications?.filter(n => !n.read) || [];
  const approvedLands = data.lands.filter(l => l.approvalStatus === 'approved').length;
  const activeCrops = data.crops.filter(c => c.cropStatus === 'sown').length;

  // Crop status pie
  const cropStatusData = [
    { name: 'To Be Sown', value: data.crops.filter(c => c.cropStatus === 'to_be_sown').length },
    { name: 'Sown', value: data.crops.filter(c => c.cropStatus === 'sown').length },
    { name: 'Harvested', value: data.crops.filter(c => c.cropStatus === 'harvested').length },
  ].filter(d => d.value > 0);

  // Land approval bar
  const landData = [
    { name: 'Pending', value: data.lands.filter(l => l.approvalStatus === 'pending').length, fill: '#f59e0b' },
    { name: 'Approved', value: approvedLands, fill: '#22c55e' },
    { name: 'Rejected', value: data.lands.filter(l => l.approvalStatus === 'rejected').length, fill: '#ef4444' },
  ];

  if (data.loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-leaf-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">
            Good morning, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 🌾
          </h1>
          <p className="text-stone-400 mt-1">Here's your farm overview for today</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-stone-400 text-sm glass-card px-4 py-2">
          <Sun className="w-4 h-4 text-amber-400" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Land Registered" value={data.lands.length} sub={`${approvedLands} approved`} color="bg-leaf-700" delay={0} />
        <StatCard icon={Sprout} label="Active Crops" value={activeCrops} sub={`${data.crops.length} total`} color="bg-emerald-700" delay={100} />
        <StatCard icon={Wrench} label="Equipment" value={data.equipment.length} sub="Items tracked" color="bg-teal-700" delay={200} />
        <StatCard icon={Bell} label="Notifications" value={unreadNotifs.length} sub="Unread messages" color="bg-amber-700" delay={300} />
      </div>

      {/* Real-Time Weather & Alerts */}
      <WeatherAlerts />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Land Status */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-1">Land Approval Status</h3>
          <p className="text-stone-500 text-sm mb-4">Your submitted land records</p>
          {data.lands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-stone-600">
              <MapPin className="w-10 h-10 mb-2 opacity-30" />
              <p>No land records yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={landData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {landData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Crop Status Pie */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-1">Crop Status Distribution</h3>
          <p className="text-stone-500 text-sm mb-4">Overview of all crop stages</p>
          {cropStatusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-stone-600">
              <Sprout className="w-10 h-10 mb-2 opacity-30" />
              <p>No crops added yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={cropStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {cropStatusData.map((_, i) => <Cell key={i} fill={CROP_COLORS[i % CROP_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          Recent Notifications
          {unreadNotifs.length > 0 && (
            <span className="ml-auto badge-pending">{unreadNotifs.length} new</span>
          )}
        </h3>
        {unreadNotifs.length === 0 ? (
          <div className="text-stone-600 text-sm py-6 text-center">No new notifications from land officers</div>
        ) : (
          <div className="space-y-3">
            {unreadNotifs.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-900/15 border border-amber-700/20 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-stone-200 text-sm">{n.message}</p>
                  <p className="text-stone-600 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-4">Recent Lands</h3>
          {data.lands.length === 0 ? (
            <p className="text-stone-600 text-sm text-center py-4">No lands registered</p>
          ) : (
            <div className="space-y-3">
              {data.lands.slice(0, 4).map(land => (
                <div key={land._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium">{land.location}</p>
                    <p className="text-stone-500 text-xs">{land.landSize} {land.unit} · {land.soilType}</p>
                  </div>
                  <span className={`badge-${land.approvalStatus}`}>{land.approvalStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-4">Recent Crops</h3>
          {data.crops.length === 0 ? (
            <p className="text-stone-600 text-sm text-center py-4">No crops added</p>
          ) : (
            <div className="space-y-3">
              {data.crops.slice(0, 4).map(crop => (
                <div key={crop._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium">{crop.cropName}</p>
                    <p className="text-stone-500 text-xs">{crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'Date not set'}</p>
                  </div>
                  <span className={`badge-${crop.cropStatus === 'to_be_sown' ? 'pending' : crop.cropStatus === 'sown' ? 'sown' : 'harvested'}`}>
                    {CROP_LABELS[crop.cropStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
