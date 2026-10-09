import React, { useState, useRef, useEffect } from 'react';
import { User, NotificationItem } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenLogin: (role?: 'citizen' | 'employee' | 'admin') => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  activeTab: string;
  onTabSelect: (tab: string) => void;
  onOpenAI: () => void;
  onMarkNotificationsRead?: () => void;
  citizenActiveTab?: string;
  onSelectCitizenTab?: (tab: string) => void;
  employeeActiveTab?: string;
  onSelectEmployeeTab?: (tab: string) => void;
  adminActiveTab?: string;
  onSelectAdminTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  notifications,
  activeTab,
  onTabSelect,
  onOpenAI,
  onMarkNotificationsRead,
  citizenActiveTab = 'dashboard',
  onSelectCitizenTab,
  employeeActiveTab = 'dashboard',
  onSelectEmployeeTab,
  adminActiveTab = 'dashboard',
  onSelectAdminTab,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCitizenNavClick = (tabKey: string) => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotifMenu(false);

    if (tabKey === 'ai') {
      onOpenAI();
    } else if (tabKey === 'logout') {
      setShowLogoutConfirm(true);
    } else {
      if (onSelectCitizenTab) {
        onSelectCitizenTab(tabKey);
      }
      onTabSelect('dashboard');
    }
  };

  const handleEmployeeNavClick = (tabKey: string) => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotifMenu(false);

    if (tabKey === 'logout') {
      setShowLogoutConfirm(true);
    } else {
      if (onSelectEmployeeTab) {
        onSelectEmployeeTab(tabKey);
      }
      onTabSelect('dashboard');
    }
  };

  const handleAdminNavClick = (tabKey: string) => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotifMenu(false);

    if (tabKey === 'logout') {
      setShowLogoutConfirm(true);
    } else {
      if (onSelectAdminTab) {
        onSelectAdminTab(tabKey);
      }
      onTabSelect('dashboard');
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const citizenNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
    { key: 'complaints', label: 'My Complaints', icon: 'fa-file-lines' },
    { key: 'bills', label: 'Bill Payment', icon: 'fa-credit-card' },
    { key: 'emergency', label: 'Emergency', icon: 'fa-truck-medical' },
  ];

  const employeeNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { key: 'assigned', label: 'Assigned Complaints', icon: 'fa-list-check' },
    { key: 'emergency', label: 'Emergency', icon: 'fa-truck-medical' },
  ];

  const adminNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { key: 'complaints', label: 'Complaints', icon: 'fa-file-lines' },
    { key: 'bills', label: 'Bill Management', icon: 'fa-receipt' },
    { key: 'users', label: 'Users & Staff', icon: 'fa-users-gear' },
    { key: 'reports', label: 'Reports', icon: 'fa-chart-column' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        {/* Top Government Bar */}
        <div className="bg-[#091E3A] text-slate-100 text-xs border-b border-blue-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
                <i className="fa-solid fa-building-columns text-amber-400"></i> Government of Tamil Nadu
              </span>
              <span className="hidden sm:inline text-blue-900">|</span>
              <span className="hidden sm:inline text-slate-200 font-medium">
                Coimbatore City Municipal Corporation (CCMC)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-200">
                <i className="fa-solid fa-phone text-amber-400 text-xs"></i>
                <span className="font-semibold text-white">
                  24x7 Helpline: <strong className="text-amber-400 font-mono font-extrabold">1913</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4 min-h-16">
          
          {/* Brand Logo & Title */}
          <div
            onClick={() => {
              if (currentUser?.role === 'citizen') {
                handleCitizenNavClick('dashboard');
              } else if (currentUser?.role === 'employee') {
                handleEmployeeNavClick('dashboard');
              } else if (currentUser?.role === 'admin') {
                handleAdminNavClick('dashboard');
              } else {
                onTabSelect('home');
              }
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition transform shrink-0">
              <span className="font-extrabold text-lg sm:text-xl text-white font-poppins">C</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 font-poppins">
                  City<span className="text-blue-600">Connect</span>
                </span>
                <span className="bg-blue-50 text-blue-700 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded border border-blue-200 uppercase tracking-tight whitespace-nowrap">
                  {currentUser?.role === 'citizen'
                    ? 'CITIZEN PORTAL'
                    : currentUser?.role === 'employee'
                    ? 'OFFICER PORTAL'
                    : currentUser?.role === 'admin'
                    ? 'ADMIN PORTAL'
                    : 'SMART CITY SERVICE PORTAL'}
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
                Smart City Service Portal
              </p>
            </div>
          </div>

          {/* CITIZEN LOGGED IN NAVIGATION MENU */}
          {currentUser && (currentUser.role || 'citizen').toLowerCase() === 'citizen' ? (
            <div className="flex items-center gap-2">
              {/* Desktop Citizen Navigation Bar */}
              <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
                {citizenNavItems.map((item) => {
                  const isActive = citizenActiveTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleCitizenNavClick(item.key)}
                      className={`h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-blue-700 hover:bg-white'
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-xs ${isActive ? 'text-white' : ''}`}></i>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Right Controls: Notification Bell, Profile Dropdown, Logout */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                
                {/* 🔔 Notification Bell Icon with Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowProfileMenu(false);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative ${
                      showNotifMenu
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <i className="fa-solid fa-bell text-sm"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-scale-up space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-bell text-amber-500 text-sm"></i>
                          <h4 className="font-extrabold text-xs text-slate-900 font-poppins">
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && onMarkNotificationsRead && (
                          <button
                            onClick={onMarkNotificationsRead}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 4).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                handleCitizenNavClick('notifications');
                                setShowNotifMenu(false);
                              }}
                              className={`p-2.5 rounded-xl text-xs cursor-pointer transition flex items-start gap-2.5 ${
                                n.read
                                  ? 'bg-slate-50 hover:bg-slate-100'
                                  : 'bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200'
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  n.type === 'complaint'
                                    ? 'bg-blue-100 text-blue-700'
                                    : n.type === 'bill'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : n.type === 'emergency'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                <i
                                  className={`fa-solid ${
                                    n.type === 'complaint'
                                      ? 'fa-file-lines'
                                      : n.type === 'bill'
                                      ? 'fa-credit-card'
                                      : n.type === 'emergency'
                                      ? 'fa-triangle-exclamation'
                                      : 'fa-bullhorn'
                                  }`}
                                ></i>
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                                  <span>{n.title}</span>
                                  <span className="text-[9px] text-slate-400 font-normal">
                                    {n.timestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        onClick={() => {
                          handleCitizenNavClick('notifications');
                          setShowNotifMenu(false);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition text-center"
                      >
                        View All Notifications ({notifications.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* 👤 User Profile (Dropdown) */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition text-left"
                    title="User Account"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-semibold text-blue-600">
                        {currentUser.wardNo || 'Ward 24 (RS Puram)'}
                      </div>
                    </div>
                    <i
                      className={`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform ${
                        showProfileMenu ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {/* Profile Dropdown Panel */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-scale-up space-y-1">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-1">
                        <div className="text-xs font-extrabold text-slate-900 font-poppins">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                        <div className="text-[10px] text-blue-600 font-bold mt-1">
                          <i className="fa-solid fa-location-dot mr-1"></i>
                          {currentUser.wardNo || 'Ward 24 (RS Puram)'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCitizenNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                      >
                        <i className="fa-solid fa-user text-blue-600"></i>
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => handleCitizenNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                      >
                        <i className="fa-solid fa-gear text-slate-600"></i>
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => handleCitizenNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                      >
                        <i className="fa-solid fa-key text-amber-600"></i>
                        <span>Change Password</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 🚪 Logout Button (Far Right) */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-extrabold text-xs border border-rose-200 transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                  title="Logout"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs"></i>
                  <span className="hidden md:inline">Logout</span>
                </button>

              </div>

              {/* Mobile Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                aria-label="Toggle Citizen Menu"
              >
                <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
              </button>
            </div>
          ) : currentUser && (currentUser.role || '').toLowerCase() === 'employee' ? (
            /* EMPLOYEE / OFFICER PORTAL NAVIGATION MENU */
            <div className="flex items-center gap-2">
              {/* Desktop Employee Navigation Bar */}
              <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
                {employeeNavItems.map((item) => {
                  const isActive = employeeActiveTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleEmployeeNavClick(item.key)}
                      className={`h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-blue-700 hover:bg-white'
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-xs ${isActive ? 'text-white' : ''}`}></i>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Right Controls: Notification Bell, Employee Profile, Logout */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                
                {/* 🔔 Notification Bell Icon with Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowProfileMenu(false);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative ${
                      showNotifMenu
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <i className="fa-solid fa-bell text-sm"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-scale-up space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-bell text-amber-500 text-sm"></i>
                          <h4 className="font-extrabold text-xs text-slate-900 font-poppins">
                            Field Alerts & Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && onMarkNotificationsRead && (
                          <button
                            onClick={onMarkNotificationsRead}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 4).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                handleEmployeeNavClick('assigned');
                                setShowNotifMenu(false);
                              }}
                              className={`p-2.5 rounded-xl text-xs cursor-pointer transition flex items-start gap-2.5 ${
                                n.read
                                  ? 'bg-slate-50 hover:bg-slate-100'
                                  : 'bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                <i className="fa-solid fa-bell"></i>
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                                  <span>{n.title}</span>
                                  <span className="text-[9px] text-slate-400 font-normal">
                                    {n.timestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 👤 Employee Profile Dropdown Tag */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    className={`hidden lg:flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border transition text-left cursor-pointer ${
                      showProfileMenu || employeeActiveTab === 'profile'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                    }`}
                    title="View / Edit Profile"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        showProfileMenu || employeeActiveTab === 'profile'
                          ? 'bg-white text-blue-700'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <i className="fa-solid fa-user-gear"></i>
                    </div>
                    <div className="text-left pr-1">
                      <div
                        className={`text-xs font-extrabold leading-tight ${
                          showProfileMenu || employeeActiveTab === 'profile'
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {currentUser.name}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          showProfileMenu || employeeActiveTab === 'profile'
                            ? 'text-blue-100'
                            : 'text-blue-600'
                        }`}
                      >
                        {currentUser.designation || 'Senior Field Inspector'}
                      </div>
                    </div>
                    <i
                      className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                        showProfileMenu || employeeActiveTab === 'profile'
                          ? 'text-blue-100'
                          : 'text-slate-500'
                      } ${showProfileMenu ? 'rotate-180' : ''}`}
                    ></i>
                  </button>

                  {/* Profile Dropdown Panel */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-scale-up space-y-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            <i className="fa-solid fa-user-gear"></i>
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-extrabold text-slate-900 font-poppins truncate">
                              {currentUser.name}
                            </div>
                            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider truncate">
                              ROLE: {currentUser.designation || 'SENIOR FIELD INSPECTOR'}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[10px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-building text-slate-400 w-3"></i>
                            <span className="font-semibold text-slate-700">Department:</span>
                            <span className="truncate">{currentUser.department || 'Sanitation & Solid Waste'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-id-badge text-slate-400 w-3"></i>
                            <span className="font-semibold text-slate-700">Employee ID:</span>
                            <span className="font-mono text-slate-800">EMP-CBE-{currentUser.id || 'usr-employee-1'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-envelope text-slate-400 w-3"></i>
                            <span className="truncate">{currentUser.email || 'employee@coimbatore.gov.in'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-phone text-slate-400 w-3"></i>
                            <span>{currentUser.phone || '+91 9842299999'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEmployeeNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-user-pen text-blue-600"></i>
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleEmployeeNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-key text-amber-600"></i>
                        <span>Change Password</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 🚪 Logout Button (Far Right) */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="h-9 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-extrabold text-xs border border-rose-200 transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                  title="Logout"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs"></i>
                  <span className="hidden md:inline">Logout</span>
                </button>

              </div>

              {/* Mobile Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                aria-label="Toggle Employee Menu"
              >
                <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
              </button>
            </div>
          ) : currentUser ? (
            /* ADMIN PORTAL NAVIGATION */
            <div className="flex items-center gap-2">
              {/* Admin Navigation Bar */}
              <nav className="hidden xl:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
                {adminNavItems.map((item) => {
                  const isActive = adminActiveTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleAdminNavClick(item.key)}
                      className={`h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-blue-700 hover:bg-white'
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-xs ${isActive ? 'text-white' : ''}`}></i>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Admin Right Side Controls */}
              <div className="flex items-center gap-2">
                {/* Notifications Icon Button */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center relative transition"
                    title="Notifications"
                  >
                    <i className="fa-solid fa-bell text-sm text-slate-700"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-scale-up">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">Admin Alerts</span>
                        {unreadCount > 0 && onMarkNotificationsRead && (
                          <button
                            onClick={onMarkNotificationsRead}
                            className="text-[10px] text-[#047857] hover:underline font-semibold"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 py-1">
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className="py-2 text-xs">
                              <div className="font-bold text-slate-800">{n.title}</div>
                              <div className="text-slate-500 text-[11px] leading-snug">{n.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1">{n.timestamp}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin User Info Tag */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    className={`hidden lg:flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border transition text-left cursor-pointer ${
                      showProfileMenu || adminActiveTab === 'profile'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                    }`}
                    title="View / Edit Profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <i className="fa-solid fa-user-shield"></i>
                    </div>
                    <div className="text-left pr-1">
                      <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                      <div className="text-[10px] font-semibold text-blue-600">
                        {currentUser.designation || 'Municipal Commissioner'}
                      </div>
                    </div>
                    <i className={`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Profile Dropdown Panel */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-scale-up space-y-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <div className="text-xs font-extrabold text-slate-900 font-poppins">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                          Role: {currentUser.designation || 'Municipal Commissioner'}
                        </div>
                        <div className="text-[10px] text-slate-600 flex items-center gap-1.5 pt-1">
                          <i className="fa-solid fa-envelope text-slate-400 w-3"></i>
                          <span className="truncate">{currentUser.email || 'commissioner@ccmc.gov.in'}</span>
                        </div>
                        <div className="text-[10px] text-slate-600 flex items-center gap-1.5">
                          <i className="fa-solid fa-phone text-slate-400 w-3"></i>
                          <span>{currentUser.phone || '9443210001'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdminNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-user-pen text-blue-600"></i>
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleAdminNavClick('profile')}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-key text-amber-600"></i>
                        <span>Change Password</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Logout Button - LAST ITEM */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="h-9 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-extrabold text-xs border border-rose-200 transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                  title="Logout"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs"></i>
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Mobile Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                  aria-label="Toggle Admin Menu"
                >
                  <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
                </button>
              </div>
            </div>
          ) : (
            /* PUBLIC / GUEST NAVIGATION */
            <>
              <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => onTabSelect('home')}
                  className={`h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'home'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-white'
                  }`}
                >
                  <i className="fa-solid fa-house text-xs"></i>
                  <span>Home</span>
                </button>

                <button
                  onClick={() => onTabSelect('about')}
                  className={`h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'about'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-white'
                  }`}
                >
                  <i className="fa-solid fa-circle-info text-xs"></i>
                  <span>About</span>
                </button>

                <button
                  onClick={() => onTabSelect('services')}
                  className={`h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'services'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-white'
                  }`}
                >
                  <i className="fa-solid fa-building-columns text-xs"></i>
                  <span>Services</span>
                </button>

                {currentUser && (
                  <button
                    onClick={() => onTabSelect('dashboard')}
                    className="h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs"
                  >
                    <i className="fa-solid fa-chart-pie text-xs"></i>
                    <span>Dashboard</span>
                  </button>
                )}

                {!currentUser && (
                  <button
                    onClick={() => onOpenLogin('citizen')}
                    className="h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-lock text-xs"></i>
                    <span>Login</span>
                  </button>
                )}
              </nav>

              {/* Right Action side */}
              <div className="flex items-center gap-2">
                {!currentUser && (
                  <button
                    onClick={() => onOpenLogin('citizen')}
                    className="md:hidden h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-lock text-xs"></i>
                    <span>Login</span>
                  </button>
                )}
                {/* Mobile Toggle Button for Public Guests */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                  aria-label="Toggle Navigation Menu"
                >
                  <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
                </button>
              </div>
            </>
          )}

        </div>

        {/* MOBILE RESPONSIVE DRAWER FOR CITIZEN */}
        {currentUser && currentUser.role === 'citizen' && mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-white border-t border-slate-800 p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-300">
                    {currentUser.wardNo || 'Ward 24 (RS Puram)'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {citizenNavItems.map((item) => {
                const isActive = citizenActiveTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleCitizenNavClick(item.key)}
                    className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <i
                      className={`fa-solid ${item.icon} text-sm ${
                        isActive ? 'text-white' : 'text-blue-400'
                      }`}
                    ></i>
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => handleCitizenNavClick('notifications')}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                  citizenActiveTab === 'notifications'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-200'
                }`}
              >
                <i className="fa-solid fa-bell text-sm text-amber-400"></i>
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>



              <button
                onClick={() => handleCitizenNavClick('logout')}
                className="col-span-2 p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition bg-rose-900/60 text-rose-200 border border-rose-700/50"
              >
                <i className="fa-solid fa-right-from-bracket text-sm"></i>
                <span className="flex-1">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* MOBILE RESPONSIVE DRAWER FOR EMPLOYEE */}
        {currentUser && currentUser.role === 'employee' && mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-white border-t border-slate-800 p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-user-gear"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-300">
                    {currentUser.designation || 'Field Inspector'} • {currentUser.department || 'Sanitation'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {employeeNavItems.map((item) => {
                const isActive = employeeActiveTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleEmployeeNavClick(item.key)}
                    className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <i
                      className={`fa-solid ${item.icon} text-sm ${
                        isActive ? 'text-white' : 'text-blue-400'
                      }`}
                    ></i>
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition bg-slate-800/80 text-slate-200"
              >
                <i className="fa-solid fa-bell text-sm text-amber-400"></i>
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>



              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="col-span-2 p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition bg-rose-900/60 text-rose-200 border border-rose-700/50"
              >
                <i className="fa-solid fa-right-from-bracket text-sm"></i>
                <span className="flex-1">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* MOBILE RESPONSIVE DRAWER FOR ADMIN */}
        {currentUser && currentUser.role === 'admin' && mobileMenuOpen && (
          <div className="xl:hidden bg-slate-900 text-white border-t border-slate-800 p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleAdminNavClick('profile');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-300">
                    {currentUser.designation || 'Municipal Commissioner'}
                  </div>
                </div>
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {adminNavItems.map((item) => {
                const isActive = adminActiveTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleAdminNavClick(item.key)}
                    className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <i
                      className={`fa-solid ${item.icon} text-sm ${
                        isActive ? 'text-white' : 'text-blue-400'
                      }`}
                    ></i>
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="col-span-2 p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition bg-rose-900/60 text-rose-200 border border-rose-700/50"
              >
                <i className="fa-solid fa-right-from-bracket text-sm"></i>
                <span className="flex-1">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* MOBILE RESPONSIVE DRAWER FOR PUBLIC / GUEST */}
        {!currentUser && mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white border-t border-slate-800 p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <div>
                  <div className="text-xs font-bold text-white">CityConnect</div>
                  <div className="text-[10px] text-blue-300">Coimbatore Smart City Portal</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                onClick={() => {
                  onTabSelect('home');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                  activeTab === 'home'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-house text-sm text-blue-400"></i>
                <span className="flex-1">Home</span>
              </button>

              <button
                onClick={() => {
                  onTabSelect('about');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                  activeTab === 'about'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-circle-info text-sm text-blue-400"></i>
                <span className="flex-1">About CityConnect</span>
              </button>

              <button
                onClick={() => {
                  onTabSelect('services');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition ${
                  activeTab === 'services'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-building-columns text-sm text-blue-400"></i>
                <span className="flex-1">Municipal Services</span>
              </button>

              <button
                onClick={() => {
                  onOpenLogin('citizen');
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition bg-blue-600 text-white shadow-xs"
              >
                <i className="fa-solid fa-lock text-sm"></i>
                <span className="flex-1">Login / Register</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* LOGOUT CONFIRMATION DIALOG */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold mx-auto">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
            
            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900 font-poppins">
                Confirm Logout
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Are you sure you want to logout?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

