import React from 'react';

export const SmartCityHighlights: React.FC = () => {
  const highlights = [
    {
      title: 'RS Puram DB Road Model Corridor',
      subtitle: 'Smart Pedestrian-friendly Streetscape',
      description: 'Underground utility ducting, continuous footpaths, smart street furniture, and LED sensor illumination.',
      icon: 'fa-road',
      tag: 'Completed Phase I',
    },
    {
      title: 'Ukkadam Lake Eco-Front',
      subtitle: 'Waterbody Rejuvenation & Parks',
      description: 'Desilted lakefront with cycle tracks, open gym, floating solar aerators, and biodiversity park.',
      icon: 'fa-water',
      tag: 'Eco-Tourism',
    },
    {
      title: 'Integrated Command Control Centre (ICCC)',
      subtitle: 'Town Hall Central Operations Hub',
      description: 'Real-time surveillance of 450+ traffic junctions, smart waste bin fill levels, and flood monitoring sensors.',
      icon: 'fa-desktop',
      tag: '24x7 IoT Surveillance',
    },
    {
      title: 'Micro-Composting & Bio-Mining',
      subtitle: 'Vellalore Waste Management Park',
      description: 'Converting 600 tonnes/day of organic wet waste into nutrient-rich vermicompost for Kovai farmers.',
      icon: 'fa-recycle',
      tag: 'Zero Landfill Target',
    },
  ];

  return (
    <section className="py-12 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
            FLAGSHIP INITIATIVES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-poppins">
            Coimbatore Smart City Highlights
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Redefining urban infrastructure, environmental sustainability, and public mobility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-500/50 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30 group-hover:scale-105 transition">
                    <i className={`fa-solid ${h.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                    {h.tag}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-1 font-poppins group-hover:text-blue-400 transition">
                  {h.title}
                </h3>
                <div className="text-xs font-semibold text-teal-400 mb-2">
                  {h.subtitle}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {h.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
