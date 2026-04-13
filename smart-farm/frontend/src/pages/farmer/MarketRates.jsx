import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Search, Droplets, Sun, Leaf, BarChart3, Info, RefreshCw } from 'lucide-react';

/**
 * Market Rates Page — KisanBazaar Market Intelligence
 * Team Antigravity | Smart Farm Management System
 *
 * Uses MSP (Minimum Support Price) data from Government of India 2024-25
 * and mock market rates for college demo purposes.
 * Last updated: March 2025
 */

const MARKET_DATA = [
  // name, msp, market, unit, trend, season, soil, water, yield, category, region
  { name: 'Wheat',      msp: 2275, market: 2380, unit: '₹/quintal', trend: 'up',   season: 'Rabi (Oct–Mar)',  soil: 'Loamy/Clay',      water: 'Moderate (4–6 irrigations)', avgYield: '45 q/acre',  category: 'Grain',      region: 'Pan India',      icon: '🌾', desc: 'India\'s most grown Rabi crop. Best for UP, MP, Punjab, Haryana.' },
  { name: 'Rice',       msp: 2183, market: 2250, unit: '₹/quintal', trend: 'up',   season: 'Kharif (Jun–Nov)', soil: 'Clayey/Loamy',   water: 'High (Flooded)',             avgYield: '40 q/acre',  category: 'Grain',      region: 'East India',     icon: '🍚', desc: 'Staple grain. Requires standing water. Best in West Bengal, AP, UP.' },
  { name: 'Cotton',     msp: 7020, market: 7340, unit: '₹/quintal', trend: 'up',   season: 'Kharif (Apr–Nov)', soil: 'Black Cotton',   water: 'Moderate',                   avgYield: '8 q/acre',   category: 'Fiber',      region: 'Maharashtra',    icon: '☁️', desc: 'Major cash crop. Needs black soil (Vertisol). Maharashtra, Gujarat.' },
  { name: 'Sugarcane',  msp: 340,  market: 355,  unit: '₹/quintal', trend: 'stable', season: 'Year Round',     soil: 'Loamy',          water: 'High',                       avgYield: '300 q/acre', category: 'Plantation', region: 'UP, Maharashtra', icon: '🎋', desc: 'Long-duration crop (12–18 months). Needs consistent moisture.' },
  { name: 'Soybean',    msp: 4892, market: 5100, unit: '₹/quintal', trend: 'up',   season: 'Kharif (Jun–Sep)', soil: 'Well-drained',   water: 'Low–Moderate',               avgYield: '10 q/acre',  category: 'Oilseed',    region: 'MP, Maharashtra', icon: '🫘', desc: 'Protein-rich oilseed. Good for nitrogen fixation. Kharif season.' },
  { name: 'Onion',      msp: null, market: 1800, unit: '₹/quintal', trend: 'down', season: 'Rabi (Oct–Feb)',  soil: 'Sandy Loam',     water: 'Moderate',                   avgYield: '120 q/acre', category: 'Vegetable',  region: 'Maharashtra',    icon: '🧅', desc: 'High-demand vegetable crop. Price fluctuates seasonally.' },
  { name: 'Grapes',     msp: null, market: 5500, unit: '₹/quintal', trend: 'up',   season: 'Oct–Mar harvest', soil: 'Sandy Loam',     water: 'Drip Irrigation',            avgYield: '100 q/acre', category: 'Fruit',      region: 'Nashik, MH',    icon: '🍇', desc: 'Premium fruit crop. Nashik is global grape hub. Drip essential.' },
  { name: 'Turmeric',   msp: 7000, market: 13500, unit: '₹/quintal', trend: 'up', season: 'Kharif (Jun–Jan)', soil: 'Loamy/Red',      water: 'Moderate',                   avgYield: '80 q/acre',  category: 'Spice',      region: 'Telangana, MH',  icon: '🌿', desc: 'High-value spice crop. Prices surged in 2024-25.' },
  { name: 'Jowar',      msp: 3371, market: 3450, unit: '₹/quintal', trend: 'stable', season: 'Kharif (Jun–Oct)', soil: 'Black/Red',    water: 'Low (Rain-fed)',             avgYield: '20 q/acre',  category: 'Grain',      region: 'Maharashtra',    icon: '🌾', desc: 'Drought-tolerant millet. Great for dry regions. Maharashtra, Karnataka.' },
  { name: 'Tomato',     msp: null, market: 2200, unit: '₹/quintal', trend: 'down', season: 'Oct–Dec, Feb–May', soil: 'Sandy Loam',    water: 'Moderate',                   avgYield: '150 q/acre', category: 'Vegetable',  region: 'Pan India',      icon: '🍅', desc: 'High-demand vegetable. Prices very volatile (₹5 to ₹80/kg range).' },
  { name: 'Pomegranate',msp: null, market: 8000, unit: '₹/quintal', trend: 'up',   season: 'Kharif harvest',  soil: 'Sandy Loam',     water: 'Drip Irrigation',            avgYield: '60 q/acre',  category: 'Fruit',      region: 'Solapur, MH',   icon: '🍎', desc: 'Drought-tolerant fruit. Solapur is India\'s pomegranate capital.' },
  { name: 'DAP Price',  msp: null, market: 1350, unit: '₹/50kg bag', trend: 'stable', season: 'Year Round',   soil: 'All types',      water: 'N/A',                        avgYield: 'N/A',        category: 'Input',      region: 'Pan India',      icon: '🧪', desc: 'Di-Ammonium Phosphate fertilizer. Government subsidized rate.' },
];

const CATEGORIES = ['All', 'Grain', 'Oilseed', 'Fiber', 'Vegetable', 'Fruit', 'Spice', 'Plantation', 'Input'];

export default function MarketRates() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const lastUpdated = 'March 31, 2025 | Source: Government of India MSP 2024-25 + Mock Market Data';

  const filtered = useMemo(() => {
    return MARKET_DATA.filter(crop => {
      const matchSearch = crop.name.toLowerCase().includes(search.toLowerCase()) ||
                          crop.region.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || crop.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-white">Market Rates</h1>
              <p className="text-stone-400 text-sm">MSP & Live Market Prices for Crops</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500 glass-card px-4 py-2">
          <RefreshCw className="w-3.5 h-3.5 text-leaf-500" />
          <span>Updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Wheat MSP', value: '₹2,275/q', icon: '🌾', color: 'bg-amber-700', sub: '+1.5% from last year' },
          { label: 'Cotton MSP', value: '₹7,020/q', icon: '☁️', color: 'bg-stone-700', sub: 'Medium fiber' },
          { label: 'Soybean MSP', value: '₹4,892/q', icon: '🫘', color: 'bg-emerald-700', sub: '+10% increase' },
          { label: 'Turmeric Market', value: '₹13,500/q', icon: '🌿', color: 'bg-yellow-700', sub: '↑ High demand season' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 hover:-translate-y-1 transition-all duration-300" style={{ animation: `fadeUp 0.4s ease-out ${i * 80}ms both` }}>
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-lg mb-3`}>{item.icon}</div>
            <div className="text-white font-bold text-xl">{item.value}</div>
            <div className="text-stone-400 text-xs font-medium">{item.label}</div>
            <div className="text-stone-600 text-xs mt-1">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search crop or region..."
            className="input-field pl-10"
            id="market-search"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                category === cat ? 'bg-leaf-700 text-white' : 'glass-card text-stone-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((crop, i) => (
          <div
            key={crop.name}
            className="glass-card p-5 hover:border-leaf-700/40 transition-all duration-300 hover:-translate-y-1"
            style={{ animation: `fadeUp 0.4s ease-out ${i * 50}ms both` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{crop.icon}</span>
                <div>
                  <h3 className="text-white font-bold font-display text-lg">{crop.name}</h3>
                  <span className="text-stone-500 text-xs">{crop.category} · {crop.region}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                crop.trend === 'up' ? 'bg-green-900/40 text-green-400 border border-green-700/30' :
                crop.trend === 'down' ? 'bg-red-900/40 text-red-400 border border-red-700/30' :
                'bg-stone-800 text-stone-400 border border-stone-700/30'
              }`}>
                {crop.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : crop.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <span>—</span>}
                {crop.trend === 'stable' ? 'Stable' : crop.trend}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-stone-500 text-xs mb-1">MSP (Gov.)</div>
                <div className="text-white font-bold text-base">
                  {crop.msp ? `₹${crop.msp?.toLocaleString('en-IN')}` : 'No MSP'}
                </div>
                <div className="text-stone-600 text-xs">{crop.unit}</div>
              </div>
              <div className="bg-leaf-900/30 border border-leaf-700/20 rounded-xl p-3">
                <div className="text-leaf-500 text-xs mb-1">Market Rate</div>
                <div className="text-leaf-300 font-bold text-base">₹{crop.market?.toLocaleString('en-IN')}</div>
                <div className="text-stone-600 text-xs">{crop.unit}</div>
              </div>
            </div>

            {/* Crop Info */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-stone-400">
                <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-medium text-stone-300">Season:</span> {crop.season}
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <Leaf className="w-3.5 h-3.5 text-leaf-500 flex-shrink-0" />
                <span className="font-medium text-stone-300">Soil:</span> {crop.soil}
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="font-medium text-stone-300">Water:</span> {crop.water}
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="font-medium text-stone-300">Avg Yield:</span> {crop.avgYield}
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-stone-500 text-xs leading-relaxed">{crop.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Search className="w-12 h-12 text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500">No crops found matching "{search}"</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-stone-400 text-xs leading-relaxed">
            <span className="text-white font-semibold">Disclaimer:</span> MSP (Minimum Support Price) data sourced from Government of India Cabinet Committee on Economic Affairs 2024-25.
            Market rates are mock/indicative for demonstration purposes. Actual market prices vary by region, quality, and season.
            Always verify with your local APMC (Agricultural Produce Market Committee) before selling.
          </p>
        </div>
      </div>
    </div>
  );
}
