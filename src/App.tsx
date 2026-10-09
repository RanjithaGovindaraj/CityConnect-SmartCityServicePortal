import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Complaint,
  Bill,
  MapLocation,
  EmergencyContact,
  NewsItem,
  NotificationItem,
  StatsOverview,
  ComplaintStatus,
} from './types';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { AboutSection } from './components/AboutSection';
import { ServicesOverview } from './components/ServicesOverview';
import { EmergencyServicesSection } from './components/EmergencyServicesSection';
import { ContactSection } from './components/ContactSection';
import { NewsSection } from './components/NewsSection';
import { Footer } from './components/Footer';

import { CitizenDashboard } from './components/CitizenDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AdminDashboard } from './components/AdminDashboard';

import { AuthModal } from './components/AuthModal';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { BillPaymentModal } from './components/BillPaymentModal';
import { ComplaintProgressTimeline } from './components/ComplaintProgressTimeline';
import { AIAssistantWidget } from './components/AIAssistantWidget';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('cityconnect_user');
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      if (!parsed || typeof parsed !== 'object' || !parsed.email) {
        localStorage.removeItem('cityconnect_user');
        return null;
      }
      return {
        ...parsed,
        role: (parsed.role || 'citizen').toString().toLowerCase() as UserRole,
      };
    } catch {
      try {
        localStorage.removeItem('cityconnect_user');
      } catch {}
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [citizenActiveTab, setCitizenActiveTab] = useState<string>('dashboard');
  const [employeeActiveTab, setEmployeeActiveTab] = useState<string>('dashboard');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');

  // Data states with localStorage persistence & defaults
  const defaultUsers: User[] = [
    {
      id: 'usr-citizen-1',
      name: 'Karthik Subramanian',
      email: 'citizen@coimbatore.gov.in',
      phone: '9842212345',
      role: 'citizen',
      wardNo: 'Ward 24 (RS Puram)',
      active: true,
    },
    {
      id: 'usr-employee-1',
      name: 'Sundaram Inspector',
      email: 'employee@coimbatore.gov.in',
      phone: '9842299999',
      role: 'employee',
      department: 'Sanitation & Solid Waste',
      designation: 'Senior Field Inspector',
      wardNo: 'West Zone (Wards 23-45)',
      active: true,
    },
    {
      id: 'usr-admin-1',
      name: 'Dr. Sivakumar IAS',
      email: 'admin@coimbatore.gov.in',
      phone: '0422-2390261',
      role: 'admin',
      department: 'Commissionerate Office',
      designation: 'Municipal Commissioner',
      active: true,
    },
  ];

  const [locations, setLocations] = useState<MapLocation[]>([]);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('cityconnect_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultUsers;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('cityconnect_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem('cityconnect_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('cityconnect_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('cityconnect_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [stats, setStats] = useState<StatsOverview>({
    totalCitizens: 1245000,
    totalEmployees: 480,
    totalComplaints: 842,
    pendingComplaints: 94,
    resolvedComplaints: 748,
    revenueCollected: 142850000,
    categoryBreakdown: [
      { category: 'Garbage & Sanitation', count: 320 },
      { category: 'Water Supply Leakage', count: 195 },
      { category: 'Streetlight Outage', count: 160 },
      { category: 'Pothole & Road Repair', count: 110 },
      { category: 'Others', count: 57 },
    ],
    wardWiseResolution: [
      { ward: 'Ward 24 (RS Puram)', total: 140, resolved: 132 },
      { ward: 'Ward 32 (Gandhipuram)', total: 110, resolved: 98 },
      { ward: 'Ward 58 (Singanallur)', total: 95, resolved: 89 },
      { ward: 'Ward 12 (Town Hall)', total: 130, resolved: 120 },
    ],
  });

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('citizen');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [timelineComplaint, setTimelineComplaint] = useState<Complaint | null>(null);

  const BACKEND_URL = 'https://city-connect-smart-city-service-por.vercel.app';

  const safeApiFetch = async (path: string, options?: RequestInit) => {
    try {
      const res = await fetch(path, options);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    try {
      const targetUrl = `${BACKEND_URL}${path.startsWith('/') ? path : '/' + path}`;
      const res = await fetch(targetUrl, options);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    return null;
  };

  const fetchData = async () => {
    try {
      const locRes = await safeApiFetch('/api/locations');
      const compRes = await safeApiFetch('/api/complaints');
      const billRes = await safeApiFetch('/api/bills');
      const emergRes = await safeApiFetch('/api/emergency');
      const newsRes = await safeApiFetch('/api/news');
      const notifRes = await safeApiFetch('/api/notifications');
      const statsRes = await safeApiFetch('/api/stats');
      const userRes = await safeApiFetch('/api/users');

      if (locRes && (Array.isArray(locRes) || Array.isArray(locRes.locations))) {
        setLocations(Array.isArray(locRes) ? locRes : locRes.locations);
      }

      if (compRes && (Array.isArray(compRes) || Array.isArray(compRes.complaints))) {
        const list = Array.isArray(compRes) ? compRes : compRes.complaints;
        setComplaints(list);
        try { localStorage.setItem('cityconnect_complaints', JSON.stringify(list)); } catch {}
      }

      if (billRes && (Array.isArray(billRes) || Array.isArray(billRes.bills))) {
        const list = Array.isArray(billRes) ? billRes : billRes.bills;
        setBills(list);
        try { localStorage.setItem('cityconnect_bills', JSON.stringify(list)); } catch {}
      }

      if (newsRes && (Array.isArray(newsRes) || Array.isArray(newsRes.news))) {
        const list = Array.isArray(newsRes) ? newsRes : newsRes.news;
        setNews(list);
        try { localStorage.setItem('cityconnect_news', JSON.stringify(list)); } catch {}
      }

      if (notifRes && (Array.isArray(notifRes) || Array.isArray(notifRes.notifications))) {
        const list = Array.isArray(notifRes) ? notifRes : notifRes.notifications;
        setNotifications(list);
        try { localStorage.setItem('cityconnect_notifications', JSON.stringify(list)); } catch {}
      }

      if (userRes && (Array.isArray(userRes) || Array.isArray(userRes.users))) {
        const list = Array.isArray(userRes) ? userRes : userRes.users;
        if (list.length > 0) {
          setUsers(list);
          try { localStorage.setItem('cityconnect_users', JSON.stringify(list)); } catch {}
        }
      }

      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      else if (statsRes && statsRes.totalCitizens) setStats(statsRes);
    } catch (err) {
      console.error('Error fetching CCMC API initial data:', err);
    }
  };

  // Fetch initial API data on mount and set up periodic 10s polling for cross-device sync
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll helper for sections
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handlers
  const handleOpenAuth = (role: UserRole = 'citizen') => {
    setAuthInitialRole(role);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('cityconnect_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
    setShowAuthModal(false);
    setActiveTab('dashboard');
    setCitizenActiveTab('dashboard');
    setEmployeeActiveTab('dashboard');
    setAdminActiveTab('dashboard');
  };

  const handleRegisterUser = async (newUser: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (exists) return prev;
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('cityconnect_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await safeApiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    await fetchData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cityconnect_user');
      localStorage.removeItem('cityconnect_jwt_token');
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
    setActiveTab('home');
    setCitizenActiveTab('dashboard');
    setEmployeeActiveTab('dashboard');
    setAdminActiveTab('dashboard');
  };

  const handleCreateBill = async (billData: any) => {
    let createdBill: Bill | null = null;
    const res = await safeApiFetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData),
    });
    if (res && res.bill) createdBill = res.bill;

    if (!createdBill) {
      createdBill = {
        id: `BILL-${Math.floor(10000 + Math.random() * 90000)}`,
        consumerNumber: billData.consumerNumber || billData.billNumber || `CCMC-PROP-${Math.floor(10000 + Math.random() * 90000)}`,
        citizenName: billData.citizenName || 'Citizen',
        address: billData.address || billData.wardNo || 'Coimbatore',
        wardNo: billData.wardNo || 'Ward 24 (RS Puram)',
        type: billData.type || billData.billType || 'Property Tax',
        period: billData.period || '2026-2027 H1',
        amount: Number(billData.amount) || 1500,
        dueDate: billData.dueDate || '2026-11-30',
        status: 'Unpaid',
      };
    }

    setBills((prev) => {
      const updated = [createdBill!, ...prev];
      try {
        localStorage.setItem('cityconnect_bills', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchData();
  };

  const handleVerifyComplaint = async (complaintId: string) => {
    await handleUpdateComplaintStatus(complaintId, 'Verified', 'Complaint verified by Commissioner Office.');
  };

  const handleCloseComplaint = async (complaintId: string) => {
    await handleUpdateComplaintStatus(complaintId, 'Closed', 'Ticket closed permanently.');
  };

  const handleToggleUserStatus = async (userId: string, active: boolean) => {
    await safeApiFetch(`/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, active } : u));
      try {
        localStorage.setItem('cityconnect_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    await fetchData();
  };

  const handleRegisterComplaint = async (payload: any) => {
    let createdComplaint: Complaint | null = null;
    const res = await safeApiFetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res && res.complaint) createdComplaint = res.complaint;

    if (!createdComplaint) {
      createdComplaint = {
        id: `CBE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        category: payload.category || 'Garbage & Sanitation',
        description: payload.description || payload.title || 'Civic issue reported',
        address: payload.address || payload.location || payload.wardNo || 'City Zone',
        latitude: payload.latitude || 11.0168,
        longitude: payload.longitude || 76.9558,
        wardNo: payload.wardNo || currentUser?.wardNo || 'Ward 24 (RS Puram)',
        status: 'New',
        priority: payload.priority || 'Medium',
        createdAt: new Date().toISOString(),
        citizenId: currentUser?.id || 'usr-citizen-1',
        citizenName: currentUser?.name || 'Karthik Subramanian',
        citizenPhone: currentUser?.phone || '9842212345',
        photoUrl: payload.photoUrl || undefined,
        assignedEmployeeDepartment: payload.category ? `${payload.category} Dept` : 'Sanitation & Solid Waste',
        logs: [
          {
            status: 'New',
            timestamp: 'Just now',
            updatedBy: currentUser?.name || 'Citizen',
            comment: 'Grievance submitted successfully.',
          },
        ],
      };
    }

    setComplaints((prev) => {
      const updated = [createdComplaint!, ...prev];
      try {
        localStorage.setItem('cityconnect_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Complaint Registered',
      message: `Grievance #${createdComplaint.id} filed successfully.`,
      timestamp: 'Just now',
      type: 'complaint',
      userId: currentUser?.id || 'usr-citizen-1',
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('cityconnect_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchData();
  };

  const handlePayBill = async (billId: string, paymentMode: string) => {
    await safeApiFetch('/api/bills/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billId,
        paymentMode,
        citizenName: currentUser?.name || 'Karthik Subramanian',
      }),
    });

    setBills((prev) => {
      const updated = prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' as const } : b));
      try {
        localStorage.setItem('cityconnect_bills', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchData();
    return { success: true };
  };

  const handleUpdateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    notes?: string,
    photoUrl?: string
  ) => {
    await safeApiFetch(`/api/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        updatedBy: currentUser?.name || 'Officer Sundaram',
        comment: notes || `Status updated to ${status}`,
        resolutionPhotoUrl: photoUrl,
      }),
    });

    setComplaints((prev) => {
      const updated = prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status,
              resolutionNotes: notes || c.resolutionNotes,
              resolutionPhotoUrl: photoUrl || c.resolutionPhotoUrl,
              logs: [
                ...(c.logs || []),
                {
                  status,
                  timestamp: 'Just now',
                  updatedBy: currentUser?.name || 'Officer Sundaram',
                  comment: notes || `Status updated to ${status}`,
                  photoUrl,
                },
              ],
            }
          : c
      );
      try {
        localStorage.setItem('cityconnect_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Complaint #${complaintId} Status: ${status}`,
      message: `${currentUser?.name || 'Officer Sundaram'} updated status to '${status}'. Remarks: "${notes || 'Issue updated'}"`,
      timestamp: 'Just now',
      type: 'complaint',
      userId: 'usr-citizen-1',
      read: false,
      relatedId: complaintId,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('cityconnect_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchData();
  };

  const handleAssignComplaint = async (complaintId: string, employeeId: string) => {
    const emp = users.find((u) => u.id === employeeId) || {
      id: 'usr-employee-1',
      name: 'Sundaram Inspector',
      department: 'Sanitation & Solid Waste',
    };

    await safeApiFetch(`/api/complaints/${complaintId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeDepartment: emp.department || 'Civic Services',
      }),
    });

    setComplaints((prev) => {
      const updated = prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'Assigned' as const,
              assignedEmployeeId: emp.id,
              assignedEmployeeName: emp.name,
              assignedEmployeeDepartment: emp.department || c.assignedEmployeeDepartment,
              logs: [
                ...(c.logs || []),
                {
                  status: 'Assigned' as const,
                  timestamp: 'Just now',
                  updatedBy: currentUser?.name || 'Admin',
                  comment: `Assigned to ${emp.name} (${emp.department || 'Field Ops'})`,
                },
              ],
            }
          : c
      );
      try {
        localStorage.setItem('cityconnect_complaints', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchData();
  };

  const handlePublishNews = async (newsData: any) => {
    let createdNews: NewsItem | null = null;
    const res = await safeApiFetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsData),
    });
    if (res && res.newsItem) createdNews = res.newsItem;

    if (!createdNews) {
      createdNews = {
        id: `news-${Date.now()}`,
        title: newsData.title || 'Municipal Announcement',
        category: newsData.category || 'Municipal Notice',
        content: newsData.content || newsData.summary || newsData.title || '',
        publishedAt: new Date().toISOString(),
        author: newsData.author || currentUser?.name || 'Municipal Commissioner',
        urgent: Boolean(newsData.urgent || newsData.important),
      };
    }

    setNews((prev) => {
      const updated = [createdNews!, ...prev];
      try {
        localStorage.setItem('cityconnect_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        currentUser={currentUser}
        onOpenLogin={(role) => handleOpenAuth(role)}
        onLogout={handleLogout}
        notifications={notifications}
        activeTab={activeTab}
        onTabSelect={(tab) => {
          if (tab === 'about' || tab === 'services' || tab === 'emergency' || tab === 'contact') {
            scrollToSection(tab);
          } else {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenAI={() => setShowAIWidget(true)}
        onMarkNotificationsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        citizenActiveTab={citizenActiveTab}
        onSelectCitizenTab={(tab) => setCitizenActiveTab(tab)}
        employeeActiveTab={employeeActiveTab}
        onSelectEmployeeTab={(tab) => setEmployeeActiveTab(tab)}
        adminActiveTab={adminActiveTab}
        onSelectAdminTab={(tab) => setAdminActiveTab(tab)}
      />

      {/* Main Container */}
      <main className="flex-1">
        {currentUser === null ? (
          /* Public Unauthenticated Home View */
          <div>
            {/* 1. Hero Section */}
            <HeroBanner
              onLogin={() => handleOpenAuth('citizen')}
              onLearnMore={() => scrollToSection('about')}
            />

            {/* 2. About Section */}
            <AboutSection />

            {/* 3. Services Section */}
            <ServicesOverview
              isLoggedIn={false}
              onSelectService={(srvKey) => {
                handleOpenAuth('citizen');
              }}
            />

            {/* 4. Contact Section */}
            <ContactSection />

            {/* News & Announcements */}
            <NewsSection news={news} />
          </div>
        ) : (
          /* Authenticated Role-Based Dashboard View */
          <div>
            {(() => {
              const currentRole = (currentUser.role || 'citizen').toString().toLowerCase();
              if (currentRole === 'employee') {
                return (
                  <EmployeeDashboard
                    currentUser={currentUser}
                    locations={locations}
                    complaints={complaints}
                    emergencyContacts={emergencyContacts}
                    onUpdateComplaintStatus={handleUpdateComplaintStatus}
                    onLogout={handleLogout}
                    activeTab={employeeActiveTab}
                    onTabChange={(tab) => setEmployeeActiveTab(tab)}
                  />
                );
              } else if (currentRole === 'admin') {
                return (
                  <AdminDashboard
                    currentUser={currentUser}
                    stats={stats}
                    locations={locations}
                    complaints={complaints}
                    bills={bills}
                    users={users}
                    news={news}
                    emergencyContacts={emergencyContacts}
                    notifications={notifications}
                    onAssignComplaint={handleAssignComplaint}
                    onUpdateComplaintStatus={handleUpdateComplaintStatus}
                    onVerifyComplaint={handleVerifyComplaint}
                    onCloseComplaint={handleCloseComplaint}
                    onCreateBill={handleCreateBill}
                    onToggleUserStatus={handleToggleUserStatus}
                    onPublishNews={handlePublishNews}
                    onLogout={handleLogout}
                    activeTab={adminActiveTab}
                    onTabChange={(tab) => setAdminActiveTab(tab)}
                  />
                );
              } else {
                return (
                  <CitizenDashboard
                    currentUser={currentUser}
                    locations={locations}
                    complaints={complaints}
                    bills={bills}
                    emergencyContacts={emergencyContacts}
                    news={news}
                    notifications={notifications}
                    onOpenComplaintModal={() => setShowComplaintModal(true)}
                    onOpenBillModal={() => setShowBillModal(true)}
                    onOpenAI={() => setShowAIWidget(true)}
                    onViewComplaintTimeline={(c) => setTimelineComplaint(c)}
                    activeTab={citizenActiveTab}
                    onTabChange={(tab) => setCitizenActiveTab(tab)}
                    onUpdateUserProfile={(updated) =>
                      setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null))
                    }
                  />
                );
              }
            })()}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowAIWidget(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-2xl hover:scale-110 transition flex items-center justify-center font-bold border-2 border-white/80 group"
          title="Open CityConnect AI Guide"
        >
          <i className="fa-solid fa-robot text-xl text-amber-300 group-hover:rotate-12 transition"></i>
        </button>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authInitialRole}
        users={users}
        onRegisterUser={handleRegisterUser}
      />

      <ComplaintFormModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onSubmitComplaint={handleRegisterComplaint}
        citizenName={currentUser?.name}
        citizenPhone={currentUser?.phone}
        citizenId={currentUser?.id}
      />

      <BillPaymentModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        bills={bills}
        onPayBill={handlePayBill}
      />

      <ComplaintProgressTimeline
        complaint={timelineComplaint}
        onClose={() => setTimelineComplaint(null)}
      />

      <AIAssistantWidget
        isOpen={showAIWidget}
        onClose={() => setShowAIWidget(false)}
      />
    </div>
  );
}

