import React from 'react';

export const Footer: React.FC = () => {
  const handleScrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0B2144] text-slate-300 text-xs border-t border-blue-900/60 pt-8 pb-5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Column 1 – About CityConnect */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-extrabold text-base font-poppins">
              <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                C
              </span>
              <span>CityConnect</span>
            </div>
            <p className="text-slate-300 font-sans font-normal text-xs leading-relaxed">
              A unified smart municipal portal for citizen services, grievance tracking, and utility payments.
            </p>
          </div>

          {/* Column 2 – Quick Links */}
          <div className="space-y-2 md:pl-6">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider font-poppins">
              Quick Links
            </h4>
            <div className="flex flex-wrap md:flex-col gap-2 md:gap-1.5 text-xs">
              <button
                onClick={() => handleScrollTo('home')}
                className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300"
              >
                <i className="fa-solid fa-angle-right text-[10px] text-blue-400"></i>
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleScrollTo('services')}
                className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300"
              >
                <i className="fa-solid fa-angle-right text-[10px] text-blue-400"></i>
                <span>Complaints</span>
              </button>
              <button
                onClick={() => handleScrollTo('services')}
                className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300"
              >
                <i className="fa-solid fa-angle-right text-[10px] text-blue-400"></i>
                <span>Bill Management</span>
              </button>
              <button
                onClick={() => handleScrollTo('services')}
                className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300"
              >
                <i className="fa-solid fa-angle-right text-[10px] text-blue-400"></i>
                <span>Users &amp; Staff</span>
              </button>
              <button
                onClick={() => handleScrollTo('services')}
                className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300"
              >
                <i className="fa-solid fa-angle-right text-[10px] text-blue-400"></i>
                <span>City Map</span>
              </button>
              <button
                onClick={() => handleScrollTo('services')}
                className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300"
              >
                <i className="fa-solid fa-angle-right text-[10px] text-blue-400"></i>
                <span>Reports</span>
              </button>
            </div>
          </div>

          {/* Column 3 – Contact */}
          <div className="space-y-2 md:pl-6">
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider font-poppins">
              Contact
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-blue-400 w-3.5 text-center"></i>
                <span>Coimbatore, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-blue-400 w-3.5 text-center"></i>
                <a href="mailto:support@cityconnect.in" className="hover:text-blue-400 transition">
                  support@cityconnect.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-amber-400 w-3.5 text-center"></i>
                <span className="font-mono text-white font-semibold">+91-422-2390261 / 1913 Municipal Helpline</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-4 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-xs text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="font-semibold text-white">
              © 2026 CityConnect – Smart City Service Portal
            </p>
            <p className="text-[11px] text-slate-400">
              Developed as an MCA Final Year Project.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
            <button onClick={() => handleScrollTo('home')} className="hover:text-blue-400 transition">
              Privacy Policy
            </button>
            <span>|</span>
            <button onClick={() => handleScrollTo('contact')} className="hover:text-blue-400 transition">
              Terms &amp; Help
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
