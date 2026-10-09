import React, { useState } from 'react';
import { User, Complaint, Bill, MapLocation, EmergencyContact, NewsItem, NotificationItem } from '../types';
import { CoimbatoreMap } from './CoimbatoreMap';

interface CitizenDashboardProps {
  currentUser: User;
  locations: MapLocation[];
  complaints: Complaint[];
  bills: Bill[];
  emergencyContacts: EmergencyContact[];
  news: NewsItem[];
  notifications?: NotificationItem[];
  onOpenComplaintModal: () => void;
  onOpenBillModal: () => void;
  onOpenAI: () => void;
  onViewComplaintTimeline: (complaint: Complaint) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUpdateUserProfile?: (updatedUser: Partial<User>) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  locations,
  complaints,
  bills,
  emergencyContacts,
  news,
  notifications = [],
  onOpenComplaintModal,
  onOpenBillModal,
  onOpenAI,
  onViewComplaintTimeline,
  activeTab: externalActiveTab,
  onTabChange,
  onUpdateUserProfile,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>('dashboard');
  const currentTab = externalActiveTab || internalActiveTab;

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Complaint filters state
  const [complaintFilter, setComplaintFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');

  // Emergency Map location preview modal state
  const [activeEmergencyMap, setActiveEmergencyMap] = useState<EmergencyContact | null>(null);

  // Digital Receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<Bill | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileWard, setProfileWard] = useState(currentUser.wardNo || 'Ward 24 (RS Puram)');
  const [profileAddress, setProfileAddress] = useState(currentUser.address || 'No. 42, DB Road, RS Puram, Coimbatore - 641002');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Filtered Citizen Data
  const myComplaints = complaints.filter(
    (c) => c.citizenId === currentUser.id || c.citizenName === currentUser.name
  );

  const filteredComplaints = myComplaints.filter((c) => {
    if (complaintFilter === 'All') return true;
    if (complaintFilter === 'Pending') return c.status === 'Pending' || c.status === 'Assigned';
    if (complaintFilter === 'In Progress') return c.status === 'In Progress';
    if (complaintFilter === 'Resolved') return c.status === 'Resolved';
    return true;
  });

  const myBills = bills.filter(
    (b) => b.citizenName === currentUser.name || b.citizenName === 'Karthik Subramanian'
  );

  const paidBills = myBills.filter((b) => b.status === 'Paid');

  const handleDownloadReceiptPDF = (bill: Bill) => {
    const receiptId = `REC-CCMC-2026-${bill.id.replace('bill-', '00')}`;
    const printWindow = window.open('', '_blank', 'width=750,height=900');
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CCMC Official e-Receipt - ${receiptId}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Poppins', sans-serif; padding: 40px; color: #0f172a; max-width: 680px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #0B2144; margin: 0; }
          .subtitle { font-size: 11px; color: #0284c7; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .receipt-box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: #f8fafc; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
          .label { color: #64748b; font-weight: 600; }
          .value { font-weight: 700; color: #0f172a; }
          .total-row { background: #0b2144; color: white; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
          .total-label { font-weight: 700; font-size: 14px; }
          .total-amount { font-size: 22px; font-weight: 800; color: #38bdf8; }
          .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .stamp { color: #16a34a; font-weight: 700; display: inline-block; padding: 4px 10px; border: 2px solid #16a34a; border-radius: 6px; transform: rotate(-3deg); margin-top: 10px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">COIMBATORE CITY MUNICIPAL CORPORATION</h1>
          <div class="subtitle">Government of Tamil Nadu • Revenue & Tax e-Services</div>
          <div style="font-size:11px; color:#475569; margin-top:4px;">Town Hall, Big Bazaar Street, Coimbatore - 641001</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; font-size:12px;">
          <div><strong>Receipt No:</strong> <span style="font-family:monospace; color:#0284c7;">${receiptId}</span></div>
          <div><strong>Payment Date:</strong> ${bill.paymentDate || '02 Aug 2026'}</div>
        </div>

        <div class="receipt-box">
          <div class="row">
            <span class="label">Taxpayer Name:</span>
            <span class="value">${bill.citizenName}</span>
          </div>
          <div class="row">
            <span class="label">Consumer / Assessment No:</span>
            <span class="value" style="font-family:monospace;">${bill.consumerNumber}</span>
          </div>
          <div class="row">
            <span class="label">Bill Category:</span>
            <span class="value">${bill.type}</span>
          </div>
          <div class="row">
            <span class="label">Municipal Ward / Zone:</span>
            <span class="value">${bill.wardNo}</span>
          </div>
          <div class="row">
            <span class="label">Billing Period:</span>
            <span class="value">${bill.period}</span>
          </div>
          <div class="row">
            <span class="label">Payment Mode:</span>
            <span class="value">${bill.paymentMode || 'Online NetBanking / UPI'}</span>
          </div>

          <div class="total-row">
            <span class="total-label">NET AMOUNT PAID:</span>
            <span class="total-amount">₹${bill.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="text-align:center;">
          <div class="stamp">✓ DIGITALLY VERIFIED CCMC E-SEAL</div>
        </div>

        <div class="footer">
          This is an official computer-generated municipal receipt issued by Coimbatore City Municipal Corporation. No physical signature required.<br>
          Verification Reference: <strong>${receiptId}</strong>
        </div>

        <div class="no-print" style="text-align:center; margin-top:20px;">
          <button onclick="window.print()" style="padding:10px 24px; background:#0284c7; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">🖨️ Print / Save as PDF</button>
        </div>

        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // Standard 5 Emergency Helplines
  const defaultEmergencyList: EmergencyContact[] = [
    {
      id: 'em-police',
      title: 'Coimbatore City Police Control Room',
      category: 'Police',
      phone: '100 / 0422-2300250',
      address: 'Police Commissionerate, Hosur Road, Near Collectorate, Coimbatore - 641018',
      description: '24x7 Law enforcement, emergency police response, traffic helpline, and citizen safety.',
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
      description: 'Premier government multi-specialty hospital with 24x7 trauma center, blood bank, and ICU.',
      availableHours: '24 Hours / 7 Days',
      latitude: 10.9992,
      longitude: 76.9621,
    },
    {
      id: 'em-helpline',
      title: 'CCMC Disaster & Municipal Helpline',
      category: 'Municipal Helpline',
      phone: '1913 / 0422-2390261',
      address: 'CCMC Head Office Control Room, Big Bazaar Street, Town Hall, Coimbatore - 641001',
      description: 'Monsoon flood response, tree fall clearance, water logging, and municipal relief.',
      availableHours: '24 Hours / 7 Days',
      latitude: 10.9961,
      longitude: 76.9588,
    },
  ];

  const emergencyContactsList =
    emergencyContacts && emergencyContacts.length >= 5 ? emergencyContacts : defaultEmergencyList;

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        wardNo: profileWard,
        address: profileAddress,
      });
    }
    setProfileSuccessMsg('Profile information updated successfully!');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  // Handle Password Update
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      return;
    }

    setPasswordSuccessMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* 1. DASHBOARD HOME VIEW */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* SECTION 1: Welcome Card */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden transition">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span>CITIZEN PORTAL ACTIVE</span>
                  </span>
                  <span className="bg-white/10 text-slate-200 text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                    <i className="fa-solid fa-location-dot mr-1 text-amber-400"></i>
                    {currentUser.wardNo || 'Ward 24 (RS Puram)'}
                  </span>
                  <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                    • Coimbatore City Municipal Corporation
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-poppins tracking-tight">
                  Welcome back, {currentUser.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Welcome to your unified Municipal Services Dashboard. Explore the interactive city map, register geotagged grievances, pay utility bills, and access 24x7 municipal assistance.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onOpenComplaintModal}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-circle-plus"></i>
                  <span>Register Complaint</span>
                </button>
                <button
                  onClick={onOpenBillModal}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-credit-card"></i>
                  <span>Pay Bills</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Interactive Coimbatore City Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase border border-blue-200">
                    GIS Mapping
                  </span>
                  <span className="text-xs text-slate-500 font-medium">• Live Municipal Data</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-poppins flex items-center gap-2 mt-1">
                  <i className="fa-solid fa-map-location-dot text-blue-600"></i>
                  Interactive Coimbatore City Map
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time municipal GIS map showing Zonal Offices, Hospitals, Police &amp; Fire Stations, Bus &amp; Railway Stations, Waste Collection Points, and active citizen grievance pins across Coimbatore.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={onOpenComplaintModal}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-location-crosshairs"></i>
                  <span>Drop Geo-Pin Complaint</span>
                </button>
              </div>
            </div>

            <CoimbatoreMap
              locations={locations}
              onRegisterComplaintClick={onOpenComplaintModal}
              heightClassName="h-[500px]"
            />
          </div>

          {/* SECTION 3: Quick Action Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-poppins uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500"></i>
              Quick Actions &amp; Municipal Services
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Action 1: Register Complaint */}
              <div
                onClick={onOpenComplaintModal}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-circle-plus text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Register Complaint
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">File geotagged issue</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-blue-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>New Ticket</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

              {/* Action 2: Pay Bills */}
              <div
                onClick={onOpenBillModal}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-emerald-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-credit-card text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Pay Bills
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Water, Property, Power</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Pay &amp; Get Receipts</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

              {/* Action 3: Emergency Services */}
              <div
                onClick={() => handleTabClick('emergency')}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-rose-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-truck-medical text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Emergency Services
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Police, Fire, Hospital</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-rose-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>24x7 Hotlines</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

              {/* Action 4: AI Assistant */}
              <div
                onClick={onOpenAI}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-purple-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-robot text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      AI Assistant
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Interactive Support</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-purple-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Ask AI Assistant</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. MY COMPLAINTS VIEW */}
      {currentTab === 'complaints' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                Grievance Tracking Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-poppins">
                My Submitted Complaints
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Monitor status updates, assigned municipal field officers, and official resolution logs.
              </p>
            </div>

            <button
              onClick={onOpenComplaintModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
            >
              <i className="fa-solid fa-plus"></i>
              <span>File New Complaint</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setComplaintFilter(statusKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  complaintFilter === statusKey
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {statusKey === 'All' ? 'All Grievances' : statusKey}
              </button>
            ))}
          </div>

          {/* Complaint List */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <i className="fa-solid fa-folder-open text-3xl text-slate-400 mb-2"></i>
              <p className="text-xs text-slate-600 font-bold">No complaints found under "{complaintFilter}" filter.</p>
              <button
                onClick={onOpenComplaintModal}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Click here to file a new complaint
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                        #{c.id}
                      </span>
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
                        {c.category}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : c.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : c.status === 'Assigned'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        ● {c.status}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500">
                      <i className="fa-solid fa-calendar-day mr-1.5 text-slate-400"></i>
                      {c.createdAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <i className="fa-solid fa-location-dot text-rose-600"></i>
                        <span>{c.address} ({c.wardNo})</span>
                      </div>

                      {/* Assigned Officer Details if available */}
                      {c.assignedEmployeeName && (
                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-900 border border-purple-200 text-xs px-3 py-1.5 rounded-xl font-semibold mt-2">
                          <i className="fa-solid fa-user-gear text-purple-600"></i>
                          <span>Assigned Officer: <strong>{c.assignedEmployeeName}</strong> ({c.assignedEmployeeDepartment || 'Field Inspection'})</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-4 flex md:flex-col justify-end items-end gap-2">
                      <button
                        onClick={() => onViewComplaintTimeline(c)}
                        className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        <span>Progress Timeline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. BILL PAYMENT VIEW */}
      {currentTab === 'bills' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                Online Revenue Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-poppins">
                Municipal Tax & Utility Bills
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Pay Electricity Bill, Water Supply Charges, and Property Tax securely with downloadable digital receipts.
              </p>
            </div>

            <button
              onClick={onOpenBillModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
            >
              <i className="fa-solid fa-credit-card"></i>
              <span>Pay Tax / Bills Online</span>
            </button>
          </div>

          {/* Active Bills Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {myBills.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-900 font-poppins flex items-center gap-2">
                      <i className={`fa-solid ${
                        b.type === 'Electricity Bill' ? 'fa-bolt text-amber-500' :
                        b.type === 'Water Bill' ? 'fa-droplet text-blue-500' : 'fa-building-user text-emerald-600'
                      }`}></i>
                      {b.type}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        b.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      ● {b.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mb-2">
                    Consumer No: <strong>{b.consumerNumber}</strong>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mb-1 font-poppins">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Due Date: <strong className="text-slate-800">{b.dueDate}</strong> ({b.period})
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  {b.status === 'Unpaid' ? (
                    <button
                      onClick={onOpenBillModal}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveReceipt(b)}
                      className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-receipt text-blue-600"></i>
                      <span>View & Download Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment History Table */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-poppins flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-blue-600"></i>
              Payment History & Downloadable Receipts
            </h3>

            {paidBills.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl text-center">
                No past payment receipts recorded yet. Paid bills will generate official downloadable receipts here.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Receipt No</th>
                      <th className="p-3">Bill Type</th>
                      <th className="p-3">Consumer ID</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium bg-white">
                    {paidBills.map((pb) => (
                      <tr key={pb.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">
                          REC-{pb.id.replace('bill-', '2026-')}
                        </td>
                        <td className="p-3">{pb.type}</td>
                        <td className="p-3 font-mono">{pb.consumerNumber}</td>
                        <td className="p-3 font-bold text-slate-900">₹{pb.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3">{pb.paymentDate || '02 Aug 2026'}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setActiveReceipt(pb)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-[11px] transition"
                          >
                            Download Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. EMERGENCY VIEW */}
      {currentTab === 'emergency' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                24x7 Emergency Hotlines
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-poppins">
                City Emergency & Safety Services
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Direct helplines for Police, Ambulance, Fire & Rescue, CMCH Hospital, and Municipal Control Room.
              </p>
            </div>

            <a
              href="tel:1913"
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
            >
              <i className="fa-solid fa-phone-volume animate-pulse text-amber-300"></i>
              <span>Toll-Free Helpline: 1913</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyContactsList.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-rose-300 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {c.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      <i className="fa-solid fa-clock mr-1 text-slate-400"></i>
                      {c.availableHours}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mb-2 font-poppins">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {c.description}
                  </p>

                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-phone text-emerald-600 font-bold"></i>
                      <strong className="text-slate-900 font-mono text-sm">{c.phone}</strong>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fa-solid fa-location-dot text-rose-600 mt-0.5"></i>
                      <span className="text-slate-600 leading-tight">{c.address}</span>
                    </div>
                  </div>
                </div>

                {/* 4 Action Buttons: Phone Number, View on Map, Navigate, Call Now */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <a
                    href={`tel:${c.phone.split('/')[0].trim()}`}
                    className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-phone"></i>
                    <span>Call Now</span>
                  </a>

                  <button
                    onClick={() => setActiveEmergencyMap(c)}
                    className="py-2.5 px-3 bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-map-location-dot text-blue-600"></i>
                    <span>View on Map</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-2 py-2 bg-slate-100 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition text-center flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-route text-blue-600"></i>
                    <span>Navigate Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. NOTIFICATIONS VIEW */}
      {currentTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                Real-Time Citizen Alerts
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-poppins">
                Municipal Notifications
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Complaint status updates, bill payment reminders, government press notices, and emergency alerts.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No new notifications at this time.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                    n.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/80 border-blue-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    n.type === 'complaint' ? 'bg-blue-100 text-blue-700' :
                    n.type === 'bill' ? 'bg-emerald-100 text-emerald-700' :
                    n.type === 'emergency' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <i className={`fa-solid ${
                      n.type === 'complaint' ? 'fa-file-lines' :
                      n.type === 'bill' ? 'fa-credit-card' :
                      n.type === 'emergency' ? 'fa-triangle-exclamation' : 'fa-bullhorn'
                    }`}></i>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 font-poppins">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. PROFILE VIEW */}
      {currentTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
              Citizen Account Management
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-poppins">
              My Profile & Account Settings
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Update your personal details, ward location address, and account credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Citizen Overview Card */}
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-3xl mx-auto flex items-center justify-center shadow-md">
                <i className="fa-solid fa-user"></i>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg font-poppins">{currentUser.name}</h3>
                <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                  {currentUser.wardNo || 'Ward 24 (RS Puram)'}
                </span>
              </div>

              <div className="space-y-3 text-left text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 font-medium">
                <div>
                  <strong className="block text-slate-900">Email Address:</strong>
                  <span>{currentUser.email}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">Mobile Number:</strong>
                  <span>+91 {currentUser.phone}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">Residential Address:</strong>
                  <span>{currentUser.address || 'No. 42, DB Road, RS Puram, Coimbatore - 641002'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Edit Forms */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Profile Details Form */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 font-poppins flex items-center gap-2">
                  <i className="fa-solid fa-user-pen text-blue-600"></i>
                  Edit Citizen Information
                </h3>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    {profileSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Coimbatore Ward Location
                      </label>
                      <select
                        value={profileWard}
                        onChange={(e) => setProfileWard(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="Ward 24 (RS Puram)">Ward 24 (RS Puram)</option>
                        <option value="Ward 32 (Gandhipuram)">Ward 32 (Gandhipuram)</option>
                        <option value="Ward 58 (Singanallur)">Ward 58 (Singanallur)</option>
                        <option value="Ward 12 (Town Hall)">Ward 12 (Town Hall)</option>
                        <option value="Ward 72 (Peelamedu)">Ward 72 (Peelamedu)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Residential Address
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 font-poppins flex items-center gap-2">
                  <i className="fa-solid fa-key text-amber-600"></i>
                  Change Password
                </h3>

                {passwordSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    {passwordSuccessMsg}
                  </div>
                )}

                {passwordErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 font-bold text-xs rounded-xl flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
                    {passwordErrorMsg}
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Emergency Map Modal */}
      {activeEmergencyMap && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[#0B2144] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-rose-400"></i>
                <h4 className="font-bold text-sm text-white font-poppins">{activeEmergencyMap.title}</h4>
              </div>
              <button
                onClick={() => setActiveEmergencyMap(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                <strong>Address:</strong> {activeEmergencyMap.address}
              </p>
              <div className="h-60 rounded-xl overflow-hidden border border-slate-200 relative">
                <iframe
                  title={`Map location for ${activeEmergencyMap.title}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    activeEmergencyMap.address
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="flex justify-end gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeEmergencyMap.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-route"></i>
                  <span>Navigate</span>
                </a>
                <button
                  onClick={() => setActiveEmergencyMap(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official CCMC Digital Receipt Download Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-up">
            
            {/* Header branding */}
            <div className="text-center pb-3 border-b border-slate-200 space-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#0B2144] text-amber-400 mx-auto flex items-center justify-center text-xl font-bold shadow-xs">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 font-poppins">
                Coimbatore City Municipal Corporation
              </h3>
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">
                Official Digital Payment Receipt
              </p>
            </div>

            {/* Receipt Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <strong className="font-mono text-slate-900">REC-2026-{activeReceipt.id.replace('bill-', '')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Category:</span>
                <strong className="text-slate-900">{activeReceipt.type}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consumer No:</span>
                <strong className="font-mono text-slate-900">{activeReceipt.consumerNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen Name:</span>
                <strong className="text-slate-900">{activeReceipt.citizenName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <strong className="text-slate-900">{activeReceipt.paymentDate || '02 Aug 2026'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <strong className="text-slate-900">{activeReceipt.paymentMode || 'UPI / NetBanking'}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Amount Paid:</span>
                <span className="text-emerald-700 font-poppins">₹{activeReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  handleDownloadReceiptPDF(activeReceipt);
                  setActiveReceipt(null);
                }}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-file-pdf"></i>
                <span>Download Official PDF</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
