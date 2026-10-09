import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            ABOUT CITYCONNECT
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 font-poppins">
            Coimbatore Smart City Service Portal
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            CityConnect is an integrated digital governance platform commissioned by the Coimbatore City Municipal Corporation (CCMC) to deliver transparent, accessible, and citizen-first civic administration across all 100 municipal wards.
          </p>
        </div>

        {/* 3 Pillar Cards: What it is, Objectives, Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: What CityConnect Is */}
          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-5">
              <i className="fa-solid fa-city"></i>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-3 font-poppins">
              What is CityConnect?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CityConnect is Coimbatore’s unified Smart City Service Portal. It serves as a single-window digital gateway connecting citizens, municipal officers, and administrators to streamline civic complaints, bill payments, emergency responses, and public notifications in real time.
            </p>
          </div>

          {/* Pillar 2: Portal Objectives */}
          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-5">
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-3 font-poppins">
              Objectives of the Portal
            </h3>
            <ul className="text-xs text-slate-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>Digitize and automate all 100 ward municipal workflows.</li>
              <li>Ensure 100% geotagged complaint logging & strict SLA timelines.</li>
              <li>Provide instant digital tax payment with official receipts.</li>
              <li>Establish transparent 24x7 communication between citizens & CCMC.</li>
            </ul>
          </div>

          {/* Pillar 3: Benefits for Citizens */}
          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-5">
              <i className="fa-solid fa-people-roof"></i>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-3 font-poppins">
              Benefits for Citizens
            </h3>
            <ul className="text-xs text-slate-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>Zero physical visits needed to zonal municipal offices.</li>
              <li>Real-time status updates via SMS & portal notifications.</li>
              <li>24x7 instant AI assistant support for queries and certificates.</li>
              <li>One-touch rapid access to verified emergency hotlines.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
