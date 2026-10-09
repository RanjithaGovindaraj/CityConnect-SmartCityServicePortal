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

  // Fetch initial API data on mount and merge with local persistence
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, compRes, billRes, emergRes, newsRes, notifRes, statsRes, userRes] =
          await Promise.all([
            fetch('/api/locations').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/complaints').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/bills').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/emergency').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/news').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/notifications').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/stats').then((r) => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/users').then((r) => r.ok ? r.json() : null).catch(() => null),
          ]);

        if (Array.isArray(locRes)) setLocations(locRes);
        else if (locRes && Array.isArray(locRes.locations)) setLocations(locRes.locations);

        let fetchedComplaints: Complaint[] | null = null;
        if (Array.isArray(compRes)) fetchedComplaints = compRes;
        else if (compRes && Array.isArray(compRes.complaints)) fetchedComplaints = compRes.complaints;
        if (fetchedComplaints && fetchedComplaints.length > 0) {
          setComplaints((prev) => {
            const localIds = new Set(prev.map(c => c.id));
            const newFromApi = fetchedComplaints!.filter(c => !localIds.has(c.id));
            const merged = [...prev, ...newFromApi];
            try { localStorage.setItem('cityconnect_complaints', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        let fetchedBills: Bill[] | null = null;
        if (Array.isArray(billRes)) fetchedBills = billRes;
        else if (billRes && Array.isArray(billRes.bills)) fetchedBills = billRes.bills;
        if (fetchedBills && fetchedBills.length > 0) {
          setBills((prev) => {
            const localIds = new Set(prev.map(b => b.id));
            const newFromApi = fetchedBills!.filter(b => !localIds.has(b.id));
            const merged = [...prev, ...newFromApi];
            try { localStorage.setItem('cityconnect_bills', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        if (Array.isArray(emergRes)) setEmergencyContacts(emergRes);
        else if (emergRes && Array.isArray(emergRes.contacts)) setEmergencyContacts(emergRes.contacts);

        let fetchedNews: NewsItem[] | null = null;
        if (Array.isArray(newsRes)) fetchedNews = newsRes;
        else if (newsRes && Array.isArray(newsRes.news)) fetchedNews = newsRes.news;
        if (fetchedNews && fetchedNews.length > 0) {
          setNews((prev) => {
            const localIds = new Set(prev.map(n => n.id));
            const newFromApi = fetchedNews!.filter(n => !localIds.has(n.id));
            const merged = [...prev, ...newFromApi];
            try { localStorage.setItem('cityconnect_news', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        if (Array.isArray(notifRes)) setNotifications(notifRes);
        else if (notifRes && Array.isArray(notifRes.notifications)) setNotifications(notifRes.notifications);

        let fetchedUsers: User[] | null = null;
        if (userRes && Array.isArray(userRes.users) && userRes.users.length > 0) {
          fetchedUsers = userRes.users;
        }
        if (fetchedUsers) {
          setUsers((prev) => {
            const localEmails = new Set(prev.map(u => u.email.toLowerCase()));
            const newFromApi = fetchedUsers!.filter(u => !localEmails.has(u.email.toLowerCase()));
            const merged = [...prev, ...newFromApi];
            try { localStorage.setItem('cityconnect_users', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        if (statsRes && statsRes.stats) setStats(statsRes.stats);
        else if (statsRes && statsRes.totalCitizens) setStats(statsRes);
      } catch (err) {
        console.error('Error fetching CCMC API initial data:', err);
      }
    };

    fetchData();
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

  const handleRegisterUser = (newUser: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (exists) return prev;
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('cityconnect_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Fire & forget sync to API backend
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(() => {});
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
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bill) createdBill = data.bill;
      }
    } catch (err) {
      console.error('Failed to create bill via API:', err);
    }

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
  };

  const handleVerifyComplaint = async (complaintId: string) => {
    await handleUpdateComplaintStatus(complaintId, 'Verified', 'Complaint verified by Commissioner Office.');
  };

  const handleCloseComplaint = async (complaintId: string) => {
    await handleUpdateComplaintStatus(complaintId, 'Closed', 'Ticket closed permanently.');
  };

  const handleToggleUserStatus = async (userId: string, active: boolean) => {
    try {
      await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, active } : u));
      try {
        localStorage.setItem('cityconnect_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRegisterComplaint = async (payload: any) => {
    let createdComplaint: Complaint | null = null;
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.complaint) createdComplaint = data.complaint;
      }
    } catch (err) {
      console.error('Failed to register complaint via API:', err);
    }

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
  };

  const handlePayBill = async (billId: string, paymentMode: string) => {
    try {
      await fetch('/api/bills/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          paymentMode,
          citizenName: currentUser?.name || 'Karthik Subramanian',
        }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to pay bill via API:', err);
    }

    setBills((prev) => {
      const updated = prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' as const } : b));
      try {
        localStorage.setItem('cityconnect_bills', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return { success: true };
  };

  const handleUpdateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    notes?: string,
    photoUrl?: string
  ) => {
    try {
      await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          updatedBy: currentUser?.name || 'Officer Sundaram',
          comment: notes || `Status updated to ${status}`,
          resolutionPhotoUrl: photoUrl,
        }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to update complaint status via API:', err);
    }

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
  };

  const handleAssignComplaint = async (complaintId: string, employeeId: string) => {
    const emp = users.find((u) => u.id === employeeId) || {
      id: 'usr-employee-1',
      name: 'Sundaram Inspector',
      department: 'Sanitation & Solid Waste',
    };

    try {
      await fetch(`/api/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.name,
          employeeDepartment: emp.department || 'Civic Services',
        }),
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to assign complaint via API:', err);
    }

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
  };

  const handlePublishNews = async (newsData: any) => {
    let createdNews: NewsItem | null = null;
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newsItem) createdNews = data.newsItem;
      }
    } catch (err) {
      console.error('Failed to publish news via API:', err);
    }

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

