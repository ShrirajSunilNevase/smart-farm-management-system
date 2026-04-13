import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Shield, BarChart3, ArrowRight, Leaf, Sun, Droplets, Wind,
  MessageCircle, ShoppingBag, TrendingUp, Bot, Phone, Users, Star
} from 'lucide-react';

const StatBadge = ({ icon: Icon, value, label, delay }) => (
  <div
    className="glass-card px-5 py-4 text-center hover:-translate-y-2 transition-all duration-300"
    style={{ animationDelay: `${delay}ms`, animation: 'fadeUp 0.7s ease-out both' }}
  >
    <Icon className="w-6 h-6 text-leaf-400 mx-auto mb-2" />
    <div className="text-2xl font-display text-white font-bold">{value}</div>
    <div className="text-stone-400 text-xs font-medium">{label}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
  <div
    className="glass-card p-6 hover:border-leaf-700/60 hover:-translate-y-2 transition-all duration-400 group"
    style={{ animationDelay: `${delay}ms`, animation: 'fadeUp 0.7s ease-out both' }}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-white font-bold text-lg mb-2 font-display">{title}</h3>
    <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500937384654-f843efbb89d5?w=1920&q=85')`,
            transform: `translateY(${scrollY * 0.25}px) scale(1.02)`,
            filter: 'brightness(0.22) saturate(1.1) sepia(0.08)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/35 to-stone-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 via-transparent to-stone-950/40" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-leaf-500/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-25 grain" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-leaf-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-leaf-900/50">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-display text-white text-xl font-bold">SmartFarm</span>
            <span className="hidden sm:inline ml-2 text-leaf-500 text-xs font-medium bg-leaf-950/60 border border-leaf-700/40 px-2 py-0.5 rounded-full"></span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-stone-400 text-sm font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/farmer/login')} className="btn-secondary text-sm py-2 px-4" id="nav-farmer-login">
            Farmer Login
          </button>
          <button onClick={() => navigate('/admin/login')} className="btn-primary text-sm py-2 px-4" id="nav-admin-login">
            Officer Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">



          <div
            className="inline-flex items-center gap-2 bg-leaf-900/50 border border-leaf-700/40 text-leaf-400 text-sm px-4 py-2 rounded-full mb-8 font-medium"
            style={{ animation: 'fadeUp 0.5s ease-out both' }}
          >
            <Leaf className="w-4 h-4" />
            Empowering Agriculture in the Digital Age
          </div>

          <h1
            className="font-display text-6xl md:text-7xl lg:text-8xl text-white leading-tight mb-6"
            style={{ animation: 'fadeUp 0.6s ease-out 0.1s both' }}
          >
            Smart Farm{' '}
            <span className="text-gradient italic">Management</span>
            <br />System
          </h1>

          <p
            className="text-stone-400 text-xl leading-relaxed max-w-2xl mx-auto mb-12"
            style={{ animation: 'fadeUp 0.6s ease-out 0.2s both' }}
          >
            Bridging the gap between <span className="text-white font-semibold">farmers</span> and{' '}
            <span className="text-white font-semibold">land officers</span> — manage lands, monitor crops,
            sell produce, and grow smarter together.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            style={{ animation: 'fadeUp 0.6s ease-out 0.3s both' }}
          >
            <button
              onClick={() => navigate('/farmer/register')}
              className="group flex items-center gap-3 bg-leaf-600 hover:bg-leaf-500 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-leaf-900/50 hover:-translate-y-1 text-lg"
              id="hero-register-btn"
            >
              <Sprout className="w-5 h-5" />
              Register as Farmer
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="group flex items-center gap-3 glass-card text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-leaf-600/50 text-lg"
              id="hero-officer-btn"
            >
              <Shield className="w-5 h-5 text-leaf-400" />
              Land Officer Portal
            </button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            style={{ animation: 'fadeUp 0.6s ease-out 0.4s both' }}
          >
            <StatBadge icon={Sprout} value="2,400+" label="Farmers Registered" delay={0} />
            <StatBadge icon={BarChart3} value="12,000+" label="Land Records" delay={100} />
            <StatBadge icon={Leaf} value="45,000+" label="Crops Monitored" delay={200} />
            <StatBadge icon={Shield} value="98%" label="Verification Rate" delay={300} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Everything You Need to{' '}
            <span className="text-gradient italic">Farm Smart</span>
          </h2>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            A complete platform for modern agricultural management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Sprout} title="Land Registration" desc="Register and manage multiple land parcels with soil types, irrigation details, and survey numbers." color="bg-leaf-700" delay={0} />
          <FeatureCard icon={Leaf} title="Crop Management" desc="Track crop lifecycle from sowing to harvest with fertilizer usage and growth notes." color="bg-emerald-700" delay={100} />
          <FeatureCard icon={BarChart3} title="Analytics Dashboard" desc="Visualize farm data with live charts, statistics, and performance insights." color="bg-teal-700" delay={200} />
          <FeatureCard icon={Shield} title="Land Verification" desc="Land officers can review, approve, or reject land records with official remarks." color="bg-stone-700" delay={300} />
          <FeatureCard icon={ShoppingBag} title="KisanBazaar Market" desc="List your produce for sale, connect with buyers, and earn more for your hard work." color="bg-purple-700" delay={400} />
          <FeatureCard icon={TrendingUp} title="Live Market Rates" desc="Check today's MSP and market prices for common crops so you always sell at the right price." color="bg-blue-700" delay={500} />
          <FeatureCard icon={MessageCircle} title="Admin Messaging" desc="Direct communication channel between farmers and land officers for instant support." color="bg-indigo-700" delay={600} />
          <FeatureCard icon={Bot} title="KisanBot AI Helper" desc="24/7 chatbot for crop advice, government schemes, weather tips, and platform guidance." color="bg-cyan-700" delay={700} />
          <FeatureCard icon={Droplets} title="Smart Notifications" desc="Stay updated with real-time alerts from land officers about approval status and feedback." color="bg-sky-700" delay={800} />
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-leaf-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-leaf-900/50">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-4xl text-white mb-4">How It Works</h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto mb-12">
            Simple 3-step process to get your farm digitally managed
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Farmers sign up and create their digital farm profile with personal and land information.' },
              { step: '02', title: 'Submit', desc: 'Add land records, crop details, and equipment. Submit for official land officer review.' },
              { step: '03', title: 'Manage', desc: 'Officers verify records. Farmers get notifications, sell on KisanBazaar, and track everything.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-6xl font-display text-leaf-800 font-bold mb-3">{item.step}</div>
                <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Antigravity Section */}
      <section id="team" className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-900/40 border border-amber-700/40 text-amber-400 text-sm px-4 py-2 rounded-full mb-6 font-medium">
            <Star className="w-4 h-4" />
            College Project
          </div>

          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            We believe in empowering farmers through technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: '🌾', title: 'Farmer First', desc: 'Every feature designed with farmers in mind. Simple, accessible, and effective.' },
            { icon: '💻', title: 'Tech Powered', desc: 'Built with React, Node.js, and MongoDB — modern full-stack web development.' },

          ].map((item, i) => (
            <div key={i} className="glass-card p-6 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-stone-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #052e16 0%, #166534 60%, #15803d 100%)' }}
        >
          <div className="absolute inset-0 opacity-20 grain" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              Ready to Transform Your Farm?
            </h2>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => navigate('/farmer/register')}
                className="flex items-center gap-2 bg-white text-leaf-800 hover:bg-leaf-50 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl"
                id="cta-register-btn"
              >
                <Sprout className="w-5 h-5" />
                Get Started Free
              </button>
              <div className="flex items-center gap-2 text-leaf-200">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">Helpline: 1800-180-1551</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <div className="glass-card p-8 text-center">
          <h3 className="text-white font-display text-2xl mb-4">📞 Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-leaf-400 font-bold mb-1">Kisan Call Centre</div>
              <div className="text-white text-xl font-bold">1800-180-1551</div>
              <div className="text-stone-500 text-xs">Toll Free | Mon–Sat 6AM–10PM</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-amber-400 font-bold mb-1">PM Kisan Helpline</div>
              <div className="text-white text-xl font-bold">155261</div>
              <div className="text-stone-500 text-xs">For PM Kisan scheme queries</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">

              <div className="text-white text-xl font-bold">Support Portal</div>
              <div className="text-stone-500 text-xs">Message admin through SmartFarm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-stone-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sprout className="w-4 h-4 text-leaf-600" />
          <span className="font-display text-white font-bold">SmartFarm</span>
        </div>
        <p className="mb-1">© 2024 Smart Farm Management System. Built for Modern Agriculture.</p>

        <p className="text-stone-600 text-xs mt-1">Kisan Helpline: 1800-180-1551 (Toll Free)</p>
      </footer>
    </div>
  );
}
