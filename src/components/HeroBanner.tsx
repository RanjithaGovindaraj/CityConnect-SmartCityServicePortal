import React from 'react';

interface HeroBannerProps {
  onLogin: () => void;
  onLearnMore: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onLogin, onLearnMore }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text */}
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-extrabold px-3.5 py-1 rounded-full border border-blue-400/30 uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Coimbatore Municipal Corporation
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white font-poppins">
              CityConnect – <br className="hidden sm:inline" />
              <span className="text-blue-400">
                Smart City Service Portal
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              "A Digital Platform for Smart Municipal Services in Coimbatore."
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onLogin}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                <span>Login</span>
              </button>

              <button
                onClick={onLearnMore}
                className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-circle-info text-xs"></i>
                <span>Learn More</span>
              </button>
            </div>
          </div>

          {/* Right Highlights Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="bg-slate-900/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xs hover:border-blue-500/50 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-blue-400 font-poppins">100 Wards</div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">5 Municipal Zones</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xs hover:border-emerald-500/50 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-poppins">98.4%</div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">SLA Resolution Rate</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xs hover:border-amber-500/50 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-poppins">Pilloor 3</div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">24x7 Water Supply</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xs hover:border-teal-500/50 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-poppins">1913</div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">Toll-Free Helpline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
