import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MapPin, Sprout,
  LogOut, Menu, X, Bell, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/farmers', icon: Users, label: 'Farmers' },
  { to: '/admin/land', icon: MapPin, label: 'Land Verification' },
  { to: '/admin/crops', icon: Sprout, label: 'Crop Monitor' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-display text-white font-bold text-lg leading-none">SmartFarm</div>
            <div className="text-amber-500 text-xs font-medium">Officer Portal</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
            {sidebarOpen && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-stone-500 text-xs truncate">Land Officer</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=85')`,
          filter: 'brightness(0.2) saturate(0.85)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-stone-950/85 via-stone-950/80 to-stone-950/92 pointer-events-none -z-10" />
      <aside className={`hidden lg:flex flex-col bg-stone-900/80 border-r border-white/5 transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-[68px]'}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-stone-900 border-r border-white/5 h-full z-10"><SidebarContent /></aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-stone-900/50 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }} className="p-2 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h2 className="text-white font-semibold hidden sm:block">Land Officer Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
