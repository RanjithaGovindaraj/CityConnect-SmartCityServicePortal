import React, { useState } from 'react';
import { User, Complaint, MapLocation, ComplaintStatus, EmergencyContact } from '../types';
import { CoimbatoreMap } from './CoimbatoreMap';

interface EmployeeDashboardProps {
  currentUser: User;
  locations: MapLocation[];
  complaints: Complaint[];
  emergencyContacts?: EmergencyContact[];
  onUpdateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    notes?: string,
    photoUrl?: string
  ) => void;
  onLogout: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  locations,
  complaints,
  emergencyContacts = [],
  onUpdateComplaintStatus,
  onLogout,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const [managingComplaint, setManagingComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mapModalLocation, setMapModalLocation] = useState<MapLocation | null>(null);
  const [saveSuccessAlert, setSaveSuccessAlert] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filters
  const [assignedStatusFilter, setAssignedStatusFilter] = useState<'all' | 'assigned' | 'in_progress' | 'resolved'>('all');
  const [assignedSearch, setAssignedSearch] = useState('');
  const [emergencyCategory, setEmergencyCategory] = useState<string>('All');
  const [mapCategoryFilter, setMapCategoryFilter] = useState<string>('All');

  // Profile Edit State
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '9876543210');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || 'officer@ccmc.gov.in');
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Daily Tasks List
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Sanitation Inspection DB Road Ward 24', done: true },
    { id: 't2', text: 'Clear waste bin complaint CBE-2026-8492', done: false },
    { id: 't3', text: 'Verify micro-composting output Vellalore yard', done: false },
    { id: 't4', text: 'Submit daily zonal SLA report to Commissioner', done: false },
  ]);

  // Assigned Complaints for Logged-In Officer
  const assignedComplaints = complaints.filter(
    (c) => c.assignedEmployeeId === currentUser.id || c.assignedEmployeeName === currentUser.name
  );

  // Convert assigned complaints to MapLocation markers for GIS rendering
  const assignedComplaintMapLocations: MapLocation[] = assignedComplaints.map((c) => ({
    id: `assigned-map-${c.id}`,
    name: `Complaint #${c.id} - ${c.category}`,
    address: `${c.address} (${c.wardNo})`,
    latitude: c.latitude || 11.0168,
    longitude: c.longitude || 76.9558,
    category: 'Complaint Marker',
    description: `${c.description} | Status: ${c.status}`,
    wardNo: c.wardNo,
    phone: c.citizenPhone || '1913',
    availableHours: `Priority: Medium`,
  }));

  // Compact preview locations for Dashboard (Assigned complaints + key municipal hubs)
  const dashboardPreviewLocations: MapLocation[] = [
    ...assignedComplaintMapLocations,
    ...locations.filter((l) => l.category === 'Municipal Office' || l.category === 'Hospital').slice(0, 3),
  ];

  // Full GIS map locations for dedicated City Map page
  const fullCityMapLocations: MapLocation[] = [
    ...locations,
    ...assignedComplaintMapLocations.filter(
      (al) => !locations.some((l) => l.id === al.id || l.name === al.name)
    ),
  ];

  const pendingCount = assignedComplaints.filter((c) => c.status === 'Assigned' || c.status === 'Pending').length;
  const inProgressCount = assignedComplaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = assignedComplaints.filter((c) => c.status === 'Resolved').length;

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleOpenManageModal = (c: Complaint) => {
    setManagingComplaint(c);
    setNewStatus(c.status || 'Assigned');
    setResolutionNotes(c.resolutionNotes || '');
    setCompletionPhotoUrl(c.resolutionPhotoUrl || '');
    setPhotoPreview(c.resolutionPhotoUrl || null);
    setValidationError(null);
    setSaveSuccessAlert(null);
  };

  const handleSaveAndUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingComplaint) return;

    if (newStatus === 'Resolved' && !resolutionNotes.trim()) {
      setValidationError('Resolution notes/remarks are required before marking a complaint as Resolved. Please describe the work completed.');
      return;
    }

    setValidationError(null);

    await onUpdateComplaintStatus(
      managingComplaint.id,
      newStatus,
      resolutionNotes.trim(),
      completionPhotoUrl.trim() || undefined
    );

    setSaveSuccessAlert(`Grievance #${managingComplaint.id} status successfully updated to "${newStatus}"!`);

    setTimeout(() => {
      setSaveSuccessAlert(null);
      setManagingComplaint(null);
    }, 1800);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('Officer account settings and contact information saved successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordNew || passwordNew !== passwordConfirm) {
      alert('New passwords do not match. Please re-enter.');
      return;
    }
    setProfileSuccessMsg('Password updated successfully!');
    setPasswordCurrent('');
    setPasswordNew('');
    setPasswordConfirm('');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Filtered assigned complaints
  const filteredAssignedComplaints = assignedComplaints.filter((c) => {
    const matchesStatus =
      assignedStatusFilter === 'all'
        ? true
        : assignedStatusFilter === 'assigned'
        ? c.status === 'Assigned' || c.status === 'Pending'
        : assignedStatusFilter === 'in_progress'
        ? c.status === 'In Progress'
        : c.status === 'Resolved';

    const query = assignedSearch.toLowerCase();
    const matchesQuery =
      !assignedSearch ||
      c.id.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query) ||
      c.wardNo.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  // Emergency contacts default
  const defaultEmergencyContacts: EmergencyContact[] = [
    {
      id: 'ec1',
      title: 'CCMC Zonal Control Room (24x7)',
      phone: '1913',
      category: 'Municipal Helpline',
      address: 'Town Hall, Coimbatore',
      latitude: 11.0018,
      longitude: 76.9629,
      availableHours: '24 Hours',
      description: 'CCMC Main Municipal Control Room Helpline'
    },
    {
      id: 'ec2',
      title: 'Commissioner Office Helpline',
      phone: '0422-2390261',
      category: 'Municipal Helpline',
      address: 'Big Bazaar Street, Town Hall',
      latitude: 11.0022,
      longitude: 76.9635,
      availableHours: '24 Hours',
      description: 'CCMC Commissioner Zonal Operations Center'
    },
    {
      id: 'ec3',
      title: 'Coimbatore City Police Command',
      phone: '100',
      category: 'Police',
      address: 'Police Commissionerate, Hosur Road',
      latitude: 10.9982,
      longitude: 76.9712,
      availableHours: '24 Hours',
      description: 'Coimbatore City Police Main Command Center'
    },
    {
      id: 'ec4',
      title: 'Fire & Rescue Command Center',
      phone: '101',
      category: 'Fire & Rescue',
      address: 'State Bank Road, Railway Station Area',
      latitude: 10.9995,
      longitude: 76.9678,
      availableHours: '24 Hours',
      description: 'District Fire & Rescue Emergency Control'
    },
    {
      id: 'ec5',
      title: 'CMCH Medical Emergency Ambulance',
      phone: '108',
      category: 'Ambulance',
      address: 'Coimbatore Medical College Hospital, Trichy Road',
      latitude: 10.9998,
      longitude: 76.9745,
      availableHours: '24 Hours',
      description: 'CMCH Government Medical Emergency Center'
    },
    {
      id: 'ec6',
      title: 'Government Medical College Hospital',
      phone: '0422-2301393',
      category: 'Government Hospitals',
      address: 'Trichy Road, Gopalapuram',
      latitude: 11.0012,
      longitude: 76.9760,
      availableHours: '24 Hours',
      description: 'CMCH Zonal Casualty & Trauma Care'
    },
  ];

  const displayEmergencyContacts = emergencyContacts.length > 0 ? emergencyContacts : defaultEmergencyContacts;
  const filteredEmergencyContacts = displayEmergencyContacts.filter((ec) => {
    if (emergencyCategory === 'All') return true;
    return ec.category === emergencyCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ==================== VIEW 1: DASHBOARD ==================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* SECTION 1: EMPLOYEE WELCOME / IDENTITY CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden transition">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span>OFFICER PORTAL ACTIVE</span>
                  </span>
                  <span className="bg-white/10 text-slate-200 text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20">
                    EMP-CBE-{currentUser.id.startsWith('usr-') ? currentUser.id : `usr-${currentUser.id}`}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-400/30">
                    {currentUser.designation || 'Senior Field Inspector'}
                  </span>
                  <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                    • Coimbatore City Municipal Corporation
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-poppins tracking-tight">
                  Welcome back, {currentUser.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium pt-0.5">
                  <span>Department: <strong className="text-amber-400">{currentUser.department || 'Sanitation & Solid Waste'}</strong></span>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span>Jurisdiction: <strong className="text-amber-400">{currentUser.wardNo || 'West Zone (Wards 23-45)'}</strong></span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium pt-1">
                  Welcome to the Officer Field Operations Console. Review assigned civic grievances, navigate municipal GIS map layers, record field inspection resolution notes, and access emergency contacts.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {onTabChange && (
                  <>
                    <button
                      onClick={() => onTabChange('assigned')}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-list-check"></i>
                      <span>Assigned Complaints ({assignedComplaints.length})</span>
                    </button>
                    <button
                      onClick={() => onTabChange('emergency')}
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-truck-medical"></i>
                      <span>Emergency Contacts</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: OFFICER CITY MAP */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                    GIS Field Operations
                  </span>
                  <span className="text-xs text-slate-500 font-medium">• Coimbatore Municipal GIS</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-poppins flex items-center gap-2 mt-1">
                  <i className="fa-solid fa-map-location-dot text-amber-500"></i>
                  Officer City Map
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive GIS map displaying assigned complaint locations, CCMC zonal offices, CMCH government hospitals, police stations, fire stations, bus stands, railway stations, garbage collection points, and recycling centers across Coimbatore.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                  <i className="fa-solid fa-location-dot text-rose-500 mr-1.5"></i>
                  {fullCityMapLocations.length} Points Mapped
                </span>
                <span className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600 mr-1.5"></i>
                  {assignedComplaints.length} Assigned Complaints
                </span>
              </div>
            </div>

            {/* Complete Interactive Map Component with Filter Pills */}
            <CoimbatoreMap locations={fullCityMapLocations} heightClassName="h-[500px]" />
          </div>

          {/* SECTION 3: QUICK ACTIONS */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-poppins uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500"></i>
              Quick Actions &amp; Officer Utilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Action 1: View Assigned Complaints */}
              <div
                onClick={() => onTabChange && onTabChange('assigned')}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-list-check text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Assigned Complaints
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Review queue ({assignedComplaints.length} tickets)
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-blue-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>View Queue</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

              {/* Action 2: Officer Settings */}
              <div
                onClick={() => onTabChange && onTabChange('profile')}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-amber-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-user-gear text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Account Settings
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Manage profile &amp; security</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-amber-700 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>View Settings</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

              {/* Action 3: Update Complaint Status */}
              <div
                onClick={() => {
                  if (assignedComplaints.length > 0) {
                    handleOpenManageModal(assignedComplaints[0]);
                  } else if (onTabChange) {
                    onTabChange('assigned');
                  }
                }}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-emerald-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-pen-to-square text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Update Complaint Status
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Record inspection logs</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Update Tickets</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

              {/* Action 4: Emergency Contacts */}
              <div
                onClick={() => onTabChange && onTabChange('emergency')}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3 hover:border-rose-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold group-hover:scale-110 transition shrink-0">
                    <i className="fa-solid fa-truck-medical text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs font-poppins">
                      Emergency Contacts
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">24x7 Control room</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-rose-600 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>View Directory</span>
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 4: ASSIGNED COMPLAINTS QUEUE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-poppins">
                  Active Assigned Grievances
                </h3>
                <p className="text-xs text-slate-500">
                  Grievances assigned to your officer account requiring field inspection or status updates.
                </p>
              </div>
              {onTabChange && (
                <button
                  onClick={() => onTabChange('assigned')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All ({assignedComplaints.length})
                </button>
              )}
            </div>

            {assignedComplaints.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                <i className="fa-solid fa-clipboard-check text-3xl text-slate-300"></i>
                <p>No complaints currently assigned to your queue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedComplaints.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col justify-between gap-3 hover:border-amber-400/80 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            #{c.id}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                            {c.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              c.priority === 'High' || c.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {c.priority || 'Medium'} Priority
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : c.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-snug">{c.description}</p>
                      
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-rose-500 text-xs"></i>
                        <span>{c.address} ({c.wardNo})</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenManageModal(c)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <i className="fa-solid fa-list-check"></i> Manage Complaint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================== VIEW 2: ASSIGNED COMPLAINTS ==================== */}
      {activeTab === 'assigned' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-poppins flex items-center gap-2">
                <i className="fa-solid fa-list-check text-blue-600"></i>
                Assigned Complaints Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Grievances assigned to your officer account. Filter by SLA state, inspect location details, record field notes, and upload work completion photos.
              </p>
            </div>
            <span className="bg-blue-100 text-blue-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-blue-200">
              {assignedComplaints.length} Total Assigned
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => setAssignedStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  assignedStatusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                All ({assignedComplaints.length})
              </button>
              <button
                onClick={() => setAssignedStatusFilter('assigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  assignedStatusFilter === 'assigned'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setAssignedStatusFilter('in_progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  assignedStatusFilter === 'in_progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setAssignedStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  assignedStatusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                placeholder="Search ticket ID, category, ward, address..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* List of Assigned Complaints */}
          {filteredAssignedComplaints.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <i className="fa-solid fa-folder-open text-4xl text-slate-300"></i>
              <p className="text-xs font-semibold">No complaints found matching the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignedComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-blue-300 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          #{c.id}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {c.category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : c.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{c.description}</p>
                      <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                        <i className="fa-solid fa-location-dot text-rose-500"></i>
                        <span>{c.address} ({c.wardNo})</span>
                      </p>
                    </div>

                    {/* Citizen & Time details */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Citizen: <strong>{c.citizenName}</strong></span>
                        <span className="text-slate-500">{c.createdAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Phone: <strong className="font-mono">{c.citizenPhone}</strong></span>
                        <a
                          href={`tel:${c.citizenPhone}`}
                          className="text-blue-600 hover:underline font-bold text-[10px] flex items-center gap-1"
                        >
                          <i className="fa-solid fa-phone"></i> Call Citizen
                        </a>
                      </div>
                    </div>

                    {c.resolutionNotes && (
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px]">
                        <span className="font-bold text-amber-900 block mb-0.5">Officer Field Note:</span>
                        <p className="text-amber-800">{c.resolutionNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenManageModal(c)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-list-check"></i> Manage Complaint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== VIEW 4: EMERGENCY SERVICES ==================== */}
      {activeTab === 'emergency' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-poppins flex items-center gap-2">
              <i className="fa-solid fa-truck-medical text-rose-600"></i>
              Field Officer Emergency & Municipal Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct emergency helplines, disaster response centers, and zonal executive engineering contacts for field officers in Coimbatore.
            </p>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Control Room', 'Municipal', 'Police', 'Fire', 'Medical', 'Disaster'].map((cat) => (
              <button
                key={cat}
                onClick={() => setEmergencyCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  emergencyCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of Emergency Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEmergencyContacts.map((ec) => (
              <div
                key={ec.id}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-rose-300 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {ec.category || ec.department}
                  </span>
                  <h3 className="font-extrabold text-xs text-slate-900 leading-snug font-poppins">
                    {ec.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{ec.department}</p>
                  <p className="text-base font-black font-mono text-blue-700">{ec.phone}</p>
                </div>

                <a
                  href={`tel:${ec.phone}`}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <i className="fa-solid fa-phone"></i> Call Emergency
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== VIEW 5: EMPLOYEE PROFILE ==================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Officer Official Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold text-2xl border-2 border-blue-400 shadow-md shrink-0">
                  <i className="fa-solid fa-user-gear"></i>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-poppins">
                    {currentUser.name}
                  </h2>
                  <p className="text-xs font-bold text-blue-700">
                    {currentUser.designation || 'Senior Field Inspector'} • {currentUser.department || 'Sanitation & Solid Waste'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Coimbatore City Municipal Corporation (CCMC)
                  </p>
                </div>
              </div>

              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-emerald-300">
                Active Duty Officer
              </span>
            </div>

            {profileSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Officer Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <i className="fa-solid fa-id-badge text-blue-600"></i> Employee ID
                </span>
                <p className="font-mono font-extrabold text-slate-900">EMP-CBE-{currentUser.id || 'usr-employee-1'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <i className="fa-solid fa-map-location-dot text-indigo-600"></i> Ward/Zone Jurisdiction
                </span>
                <p className="font-extrabold text-slate-900">{currentUser.wardNo || 'West Zone (Wards 23-45)'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <i className="fa-solid fa-envelope text-teal-600"></i> Official Email
                </span>
                <p className="font-extrabold text-slate-900 truncate">{profileEmail}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <i className="fa-solid fa-phone text-blue-600"></i> Official Contact
                </span>
                <p className="font-mono font-extrabold text-slate-900">+91 {profilePhone}</p>
              </div>
            </div>

            {/* Account Settings Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Personal Information */}
              <form onSubmit={handleProfileUpdate} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                    <i className="fa-solid fa-id-card text-blue-600"></i> Contact & Account Info
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Editable Personal Fields
                  </span>
                </div>

                {/* Read-only Administrative Information Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5 text-[11px]">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <i className="fa-solid fa-shield-halved text-blue-700"></i> Administrative Assignment Details (Read-Only)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 text-[10px]">
                    <div><span className="font-bold text-slate-900">Designation:</span> {currentUser.designation || 'Senior Field Inspector'}</div>
                    <div><span className="font-bold text-slate-900">Department:</span> {currentUser.department || 'Sanitation & Solid Waste'}</div>
                    <div><span className="font-bold text-slate-900">Employee ID:</span> EMP-CBE-{currentUser.id || 'usr-employee-1'}</div>
                    <div><span className="font-bold text-slate-900">Ward:</span> {currentUser.wardNo || 'West Zone'}</div>
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    Note: Department, Designation, and Ward Jurisdiction are strictly controlled by CCMC Admin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Profile Info
                </button>
              </form>

              {/* Security & Password */}
              <form onSubmit={handlePasswordChange} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                  <i className="fa-solid fa-lock text-amber-500"></i> Change Officer Password
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordCurrent}
                    onChange={(e) => setPasswordCurrent(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MANAGE COMPLAINT FIELD-WORK VERIFICATION MODAL ==================== */}
      {managingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* MODAL HEADER */}
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                      {managingComplaint.id}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-blue-900 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-700">
                      {managingComplaint.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-poppins mt-0.5">
                    Manage Complaint
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setManagingComplaint(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                title="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* SUCCESS / ERROR ALERTS */}
            {saveSuccessAlert && (
              <div className="bg-emerald-600 text-white p-3.5 px-6 text-xs font-extrabold flex items-center gap-2 border-b border-emerald-700 animate-fade-in shrink-0">
                <i className="fa-solid fa-circle-check text-base"></i>
                <span>{saveSuccessAlert}</span>
              </div>
            )}

            {validationError && (
              <div className="bg-rose-50 border-b border-rose-200 text-rose-800 p-3.5 px-6 text-xs font-bold flex items-center gap-2 animate-fade-in shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-base"></i>
                <span>{validationError}</span>
              </div>
            )}

            {/* MODAL BODY (Scrollable content with two-column responsive layout) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: ISSUE DETAILS, GPS SITE LOCATION, CITIZEN PHOTO */}
                <div className="space-y-5">
                  
                  {/* 1. ISSUE DETAILS */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                        <i className="fa-solid fa-circle-info text-blue-600"></i>
                        1. Issue Details
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                        Read-Only Citizen Record
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block font-medium">Complaint ID</span>
                        <span className="font-mono font-extrabold text-slate-900">{managingComplaint.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block font-medium">Category</span>
                        <span className="font-bold text-slate-900">{managingComplaint.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block font-medium">Date Submitted</span>
                        <span className="font-medium text-slate-800">{managingComplaint.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block font-medium">Priority</span>
                        <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          managingComplaint.priority === 'High' || managingComplaint.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {managingComplaint.priority || 'Medium'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium mb-1">Current Status</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full border ${
                        managingComplaint.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : managingComplaint.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : managingComplaint.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          managingComplaint.status === 'Resolved'
                            ? 'bg-emerald-500'
                            : managingComplaint.status === 'In Progress'
                            ? 'bg-blue-600'
                            : managingComplaint.status === 'Rejected'
                            ? 'bg-rose-600'
                            : 'bg-amber-500'
                        }`}></span>
                        {managingComplaint.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium mb-1">Issue Description</span>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium leading-relaxed min-h-[60px] whitespace-pre-wrap">
                        {managingComplaint.description}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-slate-500 text-[11px]">Citizen:</span>
                        <span className="font-bold text-slate-900 ml-1">{managingComplaint.citizenName}</span>
                      </div>
                      <a
                        href={`tel:${managingComplaint.citizenPhone}`}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition flex items-center gap-1"
                      >
                        <i className="fa-solid fa-phone"></i> {managingComplaint.citizenPhone}
                      </a>
                    </div>
                  </div>

                  {/* 2. GPS SITE LOCATION */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-rose-500"></i>
                        2. GPS Site Location
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                        CCMC GIS Coordinates
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block font-medium">Exact Complaint Location</span>
                        <p className="font-extrabold text-slate-900 leading-snug">
                          {managingComplaint.address}, {managingComplaint.wardNo}, Coimbatore – 641004
                        </p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-700">
                        <span>Lat: <strong className="text-slate-900">{managingComplaint.latitude || 11.0267}°N</strong></span>
                        <span className="text-slate-300">|</span>
                        <span>Long: <strong className="text-slate-900">{managingComplaint.longitude || 77.0018}°E</strong></span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMapModalLocation({
                            id: managingComplaint.id,
                            name: `Complaint #${managingComplaint.id}`,
                            address: managingComplaint.address,
                            latitude: managingComplaint.latitude || 11.0267,
                            longitude: managingComplaint.longitude || 77.0018,
                            category: 'Complaint Marker',
                            description: managingComplaint.description,
                            wardNo: managingComplaint.wardNo,
                          });
                        }}
                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <i className="fa-solid fa-map-location-dot text-blue-600"></i> View on Map
                      </button>
                    </div>
                  </div>

                  {/* 3. CITIZEN PHOTO */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                        <i className="fa-solid fa-camera text-teal-600"></i>
                        3. Citizen Photo
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                        Inspection Photo
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group">
                      <img
                        src={
                          managingComplaint.photoUrl ||
                          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=60'
                        }
                        alt="Citizen Complaint Photo"
                        className="w-full h-52 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        Uploaded by Citizen
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: UPDATE STATUS, RESOLUTION NOTES, FIELD WORK PHOTO, ACTION BUTTON */}
                <div className="space-y-5">
                  
                  {/* 4. UPDATE COMPLAINT STATUS */}
                  <div className="bg-white rounded-2xl p-4.5 border border-blue-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                        <i className="fa-solid fa-pen-to-square text-amber-500"></i>
                        4. Update Complaint Status
                      </h4>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Officer Controls
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Status State
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                        className="w-full text-xs p-3 rounded-xl border-2 border-blue-200 bg-blue-50/30 font-extrabold text-slate-900 focus:border-blue-600 outline-none transition"
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">Work In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Note: Changing status to <strong>Resolved</strong> requires entering resolution remarks.
                      </p>
                    </div>
                  </div>

                  {/* 5. RESOLUTION NOTES / REMARKS */}
                  <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                        <i className="fa-solid fa-file-signature text-blue-700"></i>
                        5. Resolution Notes / Remarks
                      </h4>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        Mandatory for Resolved
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Inspection &amp; Action Taken Details
                      </label>
                      <textarea
                        rows={4}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Describe the work completed, action taken, materials used, or reason for rejection..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* 6. FIELD WORK PHOTO */}
                  <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-poppins flex items-center gap-2">
                        <i className="fa-solid fa-upload text-purple-600"></i>
                        6. Field Work Photo
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Upload Evidence
                      </span>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700">
                        Upload Resolution Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const result = reader.result as string;
                              setCompletionPhotoUrl(result);
                              setPhotoPreview(result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400">OR Image URL:</span>
                        <input
                          type="text"
                          value={completionPhotoUrl}
                          onChange={(e) => {
                            setCompletionPhotoUrl(e.target.value);
                            setPhotoPreview(e.target.value || null);
                          }}
                          placeholder="https://..."
                          className="flex-1 text-[11px] p-2 rounded-xl border border-slate-200 font-mono"
                        />
                      </div>

                      {photoPreview && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 mt-2">
                          <img
                            src={photoPreview}
                            alt="Field Work Completion Photo"
                            className="w-full h-36 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCompletionPhotoUrl('');
                              setPhotoPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full text-xs hover:bg-rose-600 transition"
                            title="Remove Photo"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 7. ACTION BUTTON */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAndUpdate}
                      className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-floppy-disk text-base"></i>
                      <span>Save &amp; Update Status</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* GIS MAP LOCATION PREVIEW MODAL */}
      {mapModalLocation && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  GIS Field Location
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-poppins mt-0.5">
                  {mapModalLocation.name}
                </h3>
                <p className="text-xs text-slate-500">{mapModalLocation.address} ({mapModalLocation.wardNo})</p>
              </div>
              <button
                onClick={() => setMapModalLocation(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <CoimbatoreMap locations={[mapModalLocation]} heightClassName="h-[380px]" />

            <div className="flex justify-between items-center pt-2 text-xs">
              <div className="font-mono text-slate-600">
                Lat: {mapModalLocation.latitude}°N | Long: {mapModalLocation.longitude}°E
              </div>
              <button
                onClick={() => setMapModalLocation(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Close Map View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
