import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Sprout, Wrench, User,
  LogOut, Menu, X, Bell, ChevronRight, Leaf,
  MessageCircle, ShoppingBag, TrendingUp, Bot,
  Send, Minimize2, Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

// ── KisanBot AI Chatbot ────────────────────────────────────────────────────
const KISANBOT_RESPONSES = {
  greeting: [
    "Namaste 🙏 Mera naam KisanBot hai! Main Smart Farm ka sahayak chatbot hoon. Aap mujhse kheti, mausam, ya platform ke baare mein pooch sakte hain!",
    "Hello Kisan Dost! 🌾 I'm KisanBot, your farming assistant. Ask me about crops, weather, schemes, or how to use SmartFarm!"
  ],
  crop: [
    "🌱 **Crop Tips:**\n• Wheat: Sow Nov–Dec, water 4–6 times\n• Rice: Best in Kharif season (June–Nov)\n• Cotton: Needs black soil, April–May sowing\n• Sugarcane: Plant Jan–March, 12–18 month cycle\n\nWhich crop would you like to know more about?",
    "🌾 Common crops in Maharashtra:\n• **Rabi** (Winter): Wheat, Gram, Onion\n• **Kharif** (Monsoon): Rice, Cotton, Soybean\n• **Zaid** (Summer): Watermelon, Cucumber\n\nTell me your crop and I'll give specific advice!"
  ],
  weather: [
    "🌤️ **Weather Tips for Farmers:**\n• Check IMD (India Meteorological Department) for daily updates\n• Don't spray pesticides before rain\n• Irrigate in early morning or evening to reduce evaporation\n• In extreme heat, provide shade nets for vegetables",
    "☁️ Current weather data is shown on your Dashboard > Weather Alerts section. It updates automatically based on your location!"
  ],
  scheme: [
    "🏛️ **Government Schemes for Farmers:**\n• **PM Kisan Samman Nidhi** – ₹6,000/year direct benefit\n• **Pradhan Mantri Fasal Bima Yojana** – Crop insurance\n• **Kisan Credit Card (KCC)** – Easy credit at low interest\n• **eNAM** – Online crop market platform\n\nContact your local Krishi Vibhag for eligibility!",
    "💰 **Subsidy Schemes:**\n• Drip/Sprinkler irrigation subsidy up to 55%\n• Solar pump scheme for irrigation\n• Soil health card for free soil testing\n\nAsk your land officer for more details!"
  ],
  platform: [
    "📱 **How to use SmartFarm:**\n1. **Land Tab** – Register your land parcels\n2. **Crops Tab** – Track crop from sowing to harvest\n3. **Equipment** – Record your farming machinery\n4. **Messages** – Get direct support from admin\n5. **KisanBazaar** – Sell your produce online\n\nNeed help with any specific feature?",
    "✅ **Quick Tips:**\n• Add your lands first, then crops\n• Land verification takes 1–3 working days\n• Check notifications for admin updates\n• Use KisanBazaar to reach more buyers!"
  ],
  market: [
    "💹 **Market Rate Tips:**\n• Check the Market Rates section for today's MSP\n• Minimum Support Price for Wheat 2024: ₹2,275/quintal\n• Cotton (Medium fiber): ₹7,020/quintal MSP\n• Rice (Common): ₹2,183/quintal\n\nVisit the Market Rates page for real-time updates!",
    "🛒 **KisanBazaar Tips:**\n• List your produce before harvest for better planning\n• Good photos increase buyer interest\n• Set fair prices near MSP for quick sale\n• Admin approval takes 24 hours"
  ],
  help: [
    "📞 **Helpline Numbers:**\n• Kisan Call Centre: **1800-180-1551** (Toll Free)\n• PM Kisan Helpline: **155261**\n• SmartFarm Team Antigravity: **+91 9800-KISAN**\n\n🕐 Available Mon–Sat, 6 AM to 10 PM",
    "🆘 Need urgent help?\n• Call Kisan helpline: **1800-180-1551**\n• Message your admin through the Messages tab\n• Visit your local Krishi Seva Kendra"
  ],
  default: [
    "🌾 I can help you with:\n• **Crop advice** – Type 'crop'\n• **Weather tips** – Type 'weather'\n• **Govt schemes** – Type 'scheme'\n• **Platform help** – Type 'platform'\n• **Market rates** – Type 'market'\n• **Helpline** – Type 'help'\n\nWhat would you like to know?",
    "Mujhe maafi chahiye, yeh sawaal samajh nahi aaya 🙏 Please try:\n'crop', 'weather', 'scheme', 'market', 'platform', or 'help'"
  ]
};

function getKisanBotReply(input) {
  const text = input.toLowerCase();
  if (text.includes('crop') || text.includes('fasal') || text.includes('wheat') || text.includes('rice') || text.includes('cotton')) {
    return KISANBOT_RESPONSES.crop[Math.floor(Math.random() * KISANBOT_RESPONSES.crop.length)];
  }
  if (text.includes('weather') || text.includes('mausam') || text.includes('rain') || text.includes('barish')) {
    return KISANBOT_RESPONSES.weather[Math.floor(Math.random() * KISANBOT_RESPONSES.weather.length)];
  }
  if (text.includes('scheme') || text.includes('yojana') || text.includes('subsidy') || text.includes('sarkar') || text.includes('government')) {
    return KISANBOT_RESPONSES.scheme[Math.floor(Math.random() * KISANBOT_RESPONSES.scheme.length)];
  }
  if (text.includes('platform') || text.includes('use') || text.includes('how') || text.includes('kaise')) {
    return KISANBOT_RESPONSES.platform[Math.floor(Math.random() * KISANBOT_RESPONSES.platform.length)];
  }
  if (text.includes('market') || text.includes('price') || text.includes('rate') || text.includes('msp') || text.includes('bhav')) {
    return KISANBOT_RESPONSES.market[Math.floor(Math.random() * KISANBOT_RESPONSES.market.length)];
  }
  if (text.includes('help') || text.includes('helpline') || text.includes('phone') || text.includes('contact') || text.includes('number')) {
    return KISANBOT_RESPONSES.help[Math.floor(Math.random() * KISANBOT_RESPONSES.help.length)];
  }
  if (text.includes('hello') || text.includes('hi') || text.includes('namaste') || text.includes('hey')) {
    return KISANBOT_RESPONSES.greeting[Math.floor(Math.random() * KISANBOT_RESPONSES.greeting.length)];
  }
  return KISANBOT_RESPONSES.default[Math.floor(Math.random() * KISANBOT_RESPONSES.default.length)];
}

function KisanBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: KISANBOT_RESPONSES.greeting[0], time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = React.useRef(null);

  useEffect(() => {
    if (open && !minimized) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimized]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const reply = getKisanBotReply(text);
    setTyping(false);
    setMessages(m => [...m, { from: 'bot', text: reply, time: new Date() }]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setOpen(true); setMinimized(false); }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-leaf-600 to-emerald-600 rounded-full shadow-2xl shadow-leaf-900/60 flex items-center justify-center hover:scale-110 transition-all duration-300 ${open && !minimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title="Chat with KisanBot"
        id="kisanbot-toggle"
      >
        <Bot className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-xs text-stone-900 font-bold flex items-center justify-center animate-pulse">✦</span>
      </button>

      {/* Chat Window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 bg-stone-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col transition-all duration-300 ${minimized ? 'h-14' : 'h-[450px]'}`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-leaf-800 to-emerald-900 rounded-t-2xl flex-shrink-0">
            <div className="w-8 h-8 bg-leaf-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm">KisanBot 🌾</div>
              <div className="text-leaf-300 text-xs">Smart Farm Assistant</div>
            </div>
            <button onClick={() => setMinimized(m => !m)} className="text-white/60 hover:text-white p-1">
              {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.from === 'bot' && (
                      <div className="w-6 h-6 bg-leaf-700 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs whitespace-pre-line leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-leaf-700 text-white rounded-br-none'
                        : 'bg-white/8 text-stone-200 rounded-bl-none border border-white/10'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-6 h-6 bg-leaf-700 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white/8 border border-white/10 px-3 py-2 rounded-xl rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-leaf-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-leaf-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-leaf-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-3 pb-1 flex gap-1 flex-wrap">
                {['Crop Tips', 'Schemes', 'Market', 'Help'].map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs bg-leaf-900/60 border border-leaf-700/40 text-leaf-300 px-2 py-1 rounded-full hover:bg-leaf-800/60 transition-colors">
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 p-3 border-t border-white/5 flex-shrink-0">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask KisanBot..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-leaf-500"
                  id="kisanbot-input"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="w-8 h-8 bg-leaf-700 hover:bg-leaf-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  id="kisanbot-send"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Nav Items ──────────────────────────────────────────────────────────────
const navItems = [
  { to: '/farmer',           icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/farmer/land',      icon: MapPin,           label: 'My Land' },
  { to: '/farmer/crops',     icon: Sprout,           label: 'Crops' },
  { to: '/farmer/equipment', icon: Wrench,           label: 'Equipment' },
  { to: '/farmer/market',    icon: ShoppingBag,      label: 'KisanBazaar' },
  { to: '/farmer/rates',     icon: TrendingUp,       label: 'Market Rates' },
  { to: '/farmer/messages',  icon: MessageCircle,    label: 'Messages',   badge: true },
  { to: '/farmer/profile',   icon: User,             label: 'Profile' },
];

export default function FarmerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  const unreadNotifs = user?.notifications?.filter(n => !n.read).length || 0;

  // BUG FIX: Fetch unread message count periodically
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/messages/unread-count');
        setUnreadMsgs(data.count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-leaf-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-leaf-900/50">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-display text-white font-bold text-base leading-none">SmartFarm</div>
            <div className="text-leaf-500 text-xs font-medium">Farmer Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1">{label}</span>}
            {sidebarOpen && badge && unreadMsgs > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadMsgs}</span>
            )}
            {sidebarOpen && !badge && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
          </NavLink>
        ))}
      </nav>



      {/* User info + Logout */}
      <div className="px-3 py-3 border-t border-white/5">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-leaf-700 to-emerald-700 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-stone-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full"
          id="farmer-logout-btn"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=1920&q=85')`,
          filter: 'brightness(0.18) saturate(0.9)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-stone-950/88 via-stone-950/82 to-stone-950/95 pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-stone-900/80 border-r border-white/5 transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-[68px]'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-stone-900 border-r border-white/5 h-full z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-stone-900/50 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }}
              className="p-2 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              id="sidebar-toggle"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-leaf-500" />
              <h2 className="text-white font-semibold hidden sm:block">SmartFarm Farmer Portal</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => navigate('/farmer/messages')}
              className="relative p-2 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              id="farmer-notif-bell"
            >
              <Bell className="w-5 h-5" />
              {(unreadNotifs + unreadMsgs) > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadNotifs + unreadMsgs}
                </span>
              )}
            </button>
            {/* Avatar */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/farmer/profile')}>
              <div className="w-8 h-8 bg-gradient-to-br from-leaf-700 to-emerald-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer branding */}
        <footer className="px-6 py-2 bg-stone-900/30 border-t border-white/5 text-center">
          <p className="text-stone-600 text-xs">Developed by Team Antigravity | College Project | Helpline: 1800-180-1551</p>
        </footer>
      </div>

      {/* KisanBot Floating Chatbot */}
      <KisanBot />
    </div>
  );
}
