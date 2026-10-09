import React, { useState } from 'react';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
    }, 5000);
  };

  const handleScrollToMap = () => {
    const mapElement = document.getElementById('ccmc-google-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mapElement.classList.add('ring-4', 'ring-blue-600', 'transition-all');
      setTimeout(() => {
        mapElement.classList.remove('ring-4', 'ring-blue-600');
      }, 2000);
    }
  };

  return (
    <section id="contact" className="py-14 bg-white border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            CITIZEN SUPPORT HUB
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-poppins">
            Contact CityConnect Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            Need assistance with municipal services, complaint registration, bill payments, or general enquiries? Our support team is here to help.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <i className="fa-solid fa-circle-check text-blue-600 text-xs"></i>
              Fast Support
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <i className="fa-solid fa-lock text-emerald-600 text-xs"></i>
              Secure Communication
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
              <i className="fa-solid fa-bolt text-amber-600 text-xs"></i>
              Response within 24 Hours
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs">
              <i className="fa-solid fa-hand-holding-heart text-teal-600 text-xs"></i>
              Citizen Friendly
            </span>
          </div>
        </div>

        {/* Main Grid: Left Contact Card & Right Map/Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Card & Academic Disclaimer */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Contact Information Card */}
            <div className="bg-[#0B2144] text-white p-6 rounded-2xl shadow-md border border-blue-900/60 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-blue-900/60 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white font-poppins tracking-tight">
                    CityConnect Support Center
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold">
                    Coimbatore City Municipal Services
                  </p>
                </div>
              </div>

              {/* Contact Details List */}
              <div className="space-y-4 text-xs text-slate-300 relative z-10">
                
                {/* Office Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <strong className="block text-white font-bold mb-0.5">Office Address</strong>
                    <span className="text-slate-300 leading-relaxed">
                      CCMC Head Office, Big Bazaar Street, Town Hall, Coimbatore, Tamil Nadu - 641001
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <strong className="block text-white font-bold mb-0.5">Phone Number</strong>
                    <div className="text-slate-300 space-y-0.5">
                      <div>Control Room: <strong className="text-amber-400 font-mono font-bold">0422-2390261</strong></div>
                      <div>Toll-Free Helpline: <strong className="text-amber-400 font-mono font-bold">1913</strong></div>
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-800 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <strong className="block text-white font-bold mb-0.5">Email Address</strong>
                    <div className="text-slate-300 space-y-0.5">
                      <span>support@coimbatore.gov.in</span>
                      <br />
                      <span className="text-slate-400 text-[11px]">commr.coimbatore@tn.gov.in</span>
                    </div>
                  </div>
                </div>

                {/* Office Working Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <strong className="block text-white font-bold mb-0.5">Office Working Hours</strong>
                    <span className="text-slate-300">Monday – Saturday: 9:00 AM – 5:30 PM</span>
                    <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                      (Closed on Sundays & Public Holidays)
                    </p>
                  </div>
                </div>
              </div>

              {/* View on Map Button */}
              <div className="mt-6 pt-4 border-t border-blue-900/60 relative z-10">
                <button
                  type="button"
                  onClick={handleScrollToMap}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <i className="fa-solid fa-map-location-dot"></i>
                  <span>View on Map</span>
                </button>
              </div>
            </div>

            {/* MCA Academic Project Disclaimer Box */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm shrink-0 font-bold mt-0.5">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="text-xs text-slate-800 leading-relaxed font-medium">
                <strong className="block text-slate-900 font-extrabold mb-0.5">Academic Notice</strong>
                CityConnect is a Smart City Service Portal developed as an MCA academic project to demonstrate digital municipal service management. This portal is created for educational purposes.
              </div>
            </div>

          </div>

          {/* Right Column: Google Map & Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Google Map Container */}
            <div
              id="ccmc-google-map"
              className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm relative h-64 sm:h-72 transition-all duration-300"
            >
              <iframe
                title="CCMC Head Office Google Map"
                src="https://maps.google.com/maps?q=Coimbatore+City+Municipal+Corporation+Town+Hall&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              ></iframe>
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-[#DC2626]"></i>
                <span>CCMC Town Hall Headquarters, Kovai</span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-base font-extrabold text-slate-900 font-poppins flex items-center gap-2">
                  <i className="fa-solid fa-paper-plane text-blue-600 text-sm"></i>
                  Send a Direct Message
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Fill out the form below to submit your enquiry to the CityConnect Support Desk.
                </p>
              </div>

              {formSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-xs font-bold flex items-start gap-3 shadow-2xs animate-fade-in">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-xl shrink-0 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 mb-1">Enquiry Received</div>
                    ✅ Thank you! Your enquiry has been submitted successfully. Our support team will contact you soon.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 98422 12345"
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition cursor-pointer"
                      >
                        <option value="Complaint Support">Complaint Support</option>
                        <option value="Bill Payment Support">Bill Payment Support</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Emergency Assistance">Emergency Assistance</option>
                        <option value="Feedback">Feedback</option>
                        <option value="General Enquiry">General Enquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your query, feedback, or support request details here..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
