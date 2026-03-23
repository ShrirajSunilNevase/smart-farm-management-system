import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sprout } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle, bgImage }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-transparent pointer-events-none" />
      {/* Left: Form */}
      <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-stone-500 hover:text-white mb-10 transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-leaf-600 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-white text-xl font-bold">SmartFarm</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">{title}</h1>
          <p className="text-stone-400 mb-8">{subtitle}</p>

          {children}
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16">
          <div className="glass-card p-8 max-w-sm text-center">
            <div className="text-5xl mb-4">🌾</div>
            <h3 className="font-display text-2xl text-white mb-3">Digital Agriculture</h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Manage your farm resources, track crop cycles, and connect with land officers — all in one platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
