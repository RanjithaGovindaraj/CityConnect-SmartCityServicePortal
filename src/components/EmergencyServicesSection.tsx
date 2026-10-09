import React, { useState } from 'react';
import { EmergencyContact } from '../types';

interface EmergencyServicesSectionProps {
  contacts: EmergencyContact[];
  onSelectMapLocation?: (lat: number, lng: number, name: string) => void;
}

export const EmergencyServicesSection: React.FC<EmergencyServicesSectionProps> = ({
  contacts,
  onSelectMapLocation,
}) => {
  const [activeMapModal, setActiveMapModal] = useState<EmergencyContact | null>(null);

  // Standard 5 Required Emergency Categories
  const defaultEmergencyContacts: EmergencyContact[] = [
    {
      id: 'em-police',
      title: 'Coimbatore City Police Control Room',
      category: 'Police',
      phone: '100 / 0422-2300250',
      address: 'Police Commissionerate, Hosur Road, Near Collectorate, Coimbatore - 641018',
      description: '24x7 Law enforcement, emergency response, traffic helpline, and citizen safety.',
      availableHours: '24 Hours / 7 Days',
      latitude: 11.0018,
      longitude: 76.9629,
    },
    {
      id: 'em-ambulance',
      title: 'Tamil Nadu 108 Emergency Ambulance',
      category: 'Ambulance',
      phone: '108',
      address: 'Central Dispatch Center, Coimbatore Medical College Hospital, Town Hall',
      description: 'Free emergency medical transport with advanced life support equipment and paramedics.',
      availableHours: '24 Hours / 7 Days',
      latitude: 10.9983,
      longitude: 76.9614,
    },
    {
      id: 'em-fire',
      title: 'Fire & Rescue Services Headquarters',
      category: 'Fire & Rescue',
      phone: '101 / 0422-2300101',
      address: 'State Bank Road, Near Railway Station, Town Hall, Coimbatore - 641018',
      description: 'Firefighting, chemical hazard response, building rescue, and flood control operations.',
      availableHours: '24 Hours / 7 Days',
      latitude: 11.0005,
      longitude: 76.9658,
    },
    {
      id: 'em-hospital',
      title: 'Coimbatore Medical College Hospital (CMCH)',
      category: 'Government Hospitals',
      phone: '0422-2301393 / 0422-2301394',
      address: 'Trichy Road, Opposite Collectorate, Town Hall, Coimbatore - 641018',
      description: 'Premier government multi-specialty hospital with trauma center, blood bank, and ICU.',
      availableHours: '24 Hours / 7 Days',
      latitude: 10.9992,
      longitude: 76.9621,
    },
    {
      id: 'em-helpline',
      title: 'CCMC Disaster & Civic Helpline',
      category: 'Municipal Helpline',
      phone: '1913 / 0422-2390261',
      address: 'CCMC Head Office Control Room, Big Bazaar Street, Town Hall, Coimbatore - 641001',
      description: 'Monsoon flood response, tree fall clearance, water logging, and municipal relief.',
      availableHours: '24 Hours / 7 Days',
      latitude: 10.9961,
      longitude: 76.9588,
    },
  ];

  const listToRender = contacts && contacts.length >= 5 ? contacts : defaultEmergencyContacts;

  return (
    <section id="emergency" className="py-14 bg-slate-50 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
              24x7 RAPID EMERGENCY ASSISTANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-poppins">
              Emergency Contact Helplines
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct emergency hotlines for police, ambulance, fire rescue, hospital care, and municipal control room.
            </p>
          </div>

          <a
            href="tel:1913"
            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2.5 self-start sm:self-auto"
          >
            <i className="fa-solid fa-phone-volume animate-pulse text-sm"></i>
            <span>Toll-Free Helpline: 1913</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listToRender.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-rose-300 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    {c.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    <i className="fa-solid fa-clock mr-1 text-amber-500"></i>
                    {c.availableHours}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 font-poppins">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {c.description}
                </p>

                {/* Phone & Address details */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-phone text-rose-600 font-bold"></i>
                    <strong className="text-slate-900 font-mono text-sm">{c.phone}</strong>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-location-dot text-amber-500 mt-0.5"></i>
                    <span className="text-slate-600 leading-tight">{c.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${c.phone.split('/')[0].trim()}`}
                  className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-phone"></i>
                  <span>Call Hotline</span>
                </a>

                <button
                  onClick={() => {
                    if (onSelectMapLocation) {
                      onSelectMapLocation(c.latitude, c.longitude, c.title);
                    }
                    setActiveMapModal(c);
                  }}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-map-location-dot text-blue-600"></i>
                  <span>View on Map</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Location Modal */}
      {activeMapModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-rose-500"></i>
                <h4 className="font-bold text-sm text-white font-poppins">{activeMapModal.title}</h4>
              </div>
              <button
                onClick={() => setActiveMapModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600">
                <strong>Address:</strong> {activeMapModal.address}
              </p>
              <div className="h-60 rounded-xl overflow-hidden border border-slate-200 relative">
                <iframe
                  title={`Map location for ${activeMapModal.title}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    activeMapModal.address
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveMapModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Close Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
