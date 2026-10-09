import React, { useState } from 'react';

interface ServicesOverviewProps {
  onSelectService: (serviceKey: string) => void;
  isLoggedIn?: boolean;
}

export const ServicesOverview: React.FC<ServicesOverviewProps> = ({
  onSelectService,
  isLoggedIn = false,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const services = [
    {
      key: 'complaint_management',
      icon: 'fa-triangle-exclamation',
      title: 'Smart Complaint Management',
      badge: 'Geo-Tagged',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Register geotagged civic grievances for potholes, garbage dumps, drainage issues, or streetlight outages with photo proof.',
      actionText: 'File Complaint',
      color: 'bg-amber-500 text-white',
    },
    {
      key: 'bill_payment',
      icon: 'fa-credit-card',
      title: 'Online Bill Payment',
      badge: 'Property & Water Tax',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Pay Property Tax, Water Charges, and Professional Tax securely with instant downloadable official CCMC digital receipts.',
      actionText: 'Pay Tax & Bills',
      color: 'bg-emerald-600 text-white',
    },
    {
      key: 'emergency_services',
      icon: 'fa-truck-medical',
      title: 'Emergency Services',
      badge: '24x7 Hotlines',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Quick access to emergency contacts for Police, Ambulance, Fire & Rescue, Hospital beds, and Disaster Control Room.',
      actionText: 'View Helplines',
      color: 'bg-rose-600 text-white',
    },
    {
      key: 'ai_assistant',
      icon: 'fa-robot',
      title: 'AI Assistant',
      badge: '24x7 Citizen Guide',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Ask instant queries in Tamil or English about municipal procedures, birth certificate applications, office hours, and contacts.',
      actionText: 'Ask AI Guide',
      color: 'bg-teal-600 text-white',
    },
    {
      key: 'news_announcements',
      icon: 'fa-bullhorn',
      title: 'News & Announcements',
      badge: 'Official Press',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Stay informed on CCMC water supply schedules, road work notices, vaccination drives, and smart city developments.',
      actionText: 'Read Notices',
      color: 'bg-blue-600 text-white',
    },
  ];

  const handleCardClick = (serviceKey: string) => {
    if (!isLoggedIn) {
      setToastMessage('Please login to access this service.');
      setTimeout(() => setToastMessage(null), 3500);
      onSelectService(serviceKey);
    } else {
      onSelectService(serviceKey);
    }
  };

  return (
    <section id="services" className="py-14 bg-slate-50 relative">
      {/* Toast Notice when Guest clicks */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 max-w-sm z-50 bg-slate-900 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-blue-500 flex items-center gap-3 animate-bounce">
          <i className="fa-solid fa-lock text-sm text-blue-400"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              PREVIEW MUNICIPAL SERVICES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-poppins">
              Key Smart City Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Explore essential municipal services available on the CityConnect portal. Login required for transaction access.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.key}
              onClick={() => handleCardClick(srv.key)}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between cursor-pointer group hover:border-blue-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${srv.color} shadow-xs group-hover:scale-105 transition`}
                  >
                    <i className={`fa-solid ${srv.icon}`}></i>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${srv.badgeColor}`}
                  >
                    {srv.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition font-poppins">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {srv.description}
                </p>
              </div>

              <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1.5">
                  <span>{srv.actionText}</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </span>
                {!isLoggedIn && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    🔒 Login Required
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
