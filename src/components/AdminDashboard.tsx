import React, { useState } from 'react';
import {
  User,
  Complaint,
  Bill,
  MapLocation,
  EmergencyContact,
  NewsItem,
  NotificationItem,
  StatsOverview,
  ComplaintStatus,
} from '../types';
import { CoimbatoreMap } from './CoimbatoreMap';

interface AdminDashboardProps {
  currentUser: User;
  stats: StatsOverview;
  locations: MapLocation[];
  complaints: Complaint[];
  bills: Bill[];
  users: User[];
  news: NewsItem[];
  emergencyContacts: EmergencyContact[];
  notifications: NotificationItem[];
  onAssignComplaint: (complaintId: string, employeeId: string) => void;
  onUpdateComplaintStatus?: (complaintId: string, status: ComplaintStatus, notes?: string) => void;
  onVerifyComplaint?: (complaintId: string) => void;
  onCloseComplaint?: (complaintId: string) => void;
  onCreateBill?: (billData: Partial<Bill>) => void;
  onToggleUserStatus?: (userId: string, active: boolean) => void;
  onPublishNews: (newsData: any) => void;
  onLogout: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  stats,
  locations,
  complaints,
  bills = [],
  users,
  news,
  emergencyContacts,
  notifications = [],
  onAssignComplaint,
  onUpdateComplaintStatus,
  onVerifyComplaint,
  onCloseComplaint,
  onCreateBill,
  onToggleUserStatus,
  onPublishNews,
  onLogout,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  // Modals & Sub-state
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);
  const [locationModalComplaint, setLocationModalComplaint] = useState<Complaint | null>(null);

  // Resolution Modal
  const [resolveModalComplaint, setResolveModalComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // News Publish Modal
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<any>('Municipal Notice');
  const [newsContent, setNewsContent] = useState('');
  const [newsUrgent, setNewsUrgent] = useState(false);

  // Bill Generation Modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [billCitizenName, setBillCitizenName] = useState('');
  const [billConsumerNo, setBillConsumerNo] = useState('');
  const [billType, setBillType] = useState<any>('Property Tax');
  const [billAmount, setBillAmount] = useState<number>(1500);
  const [billDueDate, setBillDueDate] = useState('2026-09-30');
  const [billWardNo, setBillWardNo] = useState('Ward 24 (RS Puram)');
  const [billAddress, setBillAddress] = useState('Coimbatore Ward Area');

  // Edit Bill Modal
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editBillAmount, setEditBillAmount] = useState<number>(0);
  const [editBillDueDate, setEditBillDueDate] = useState<string>('');
  const [editBillStatus, setEditBillStatus] = useState<'Unpaid' | 'Paid'>('Unpaid');

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserDept, setNewUserDept] = useState('Sanitation');
  const [newUserDesig, setNewUserDesig] = useState('Sanitation Inspector');

  // Admin Profile State & Editing
  const [profileState, setProfileState] = useState({
    name: currentUser.name || 'Thiru. M. Pradeep Kumar, IAS',
    email: currentUser.email || 'commissioner@ccmc.gov.in',
    phone: currentUser.phone || '9443210001',
    avatarUrl: currentUser.avatarUrl || '',
    department: currentUser.department || 'Commissionerate Office',
    office: currentUser.office || 'Town Hall, CCMC Headquarters, Big Bazaar Street, Coimbatore - 641001',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profileState.name);
  const [editEmail, setEditEmail] = useState(profileState.email);
  const [editPhone, setEditPhone] = useState(profileState.phone);
  const [editPhoto, setEditPhoto] = useState(profileState.avatarUrl);
  const [editDept, setEditDept] = useState(profileState.department);
  const [editOffice, setEditOffice] = useState(profileState.office);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Filters
  const [complaintFilterStatus, setComplaintFilterStatus] = useState<string>('All');
  const [billFilterStatus, setBillFilterStatus] = useState<string>('All');
  const [billSearchTerm, setBillSearchTerm] = useState('');
  const [userTabRole, setUserTabRole] = useState<'all' | 'citizen' | 'employee' | 'admin'>('all');

  const employees = users.filter((u) => u.role === 'employee');
  const citizens = users.filter((u) => u.role === 'citizen');
  const admins = users.filter((u) => u.role === 'admin');

  const pendingBills = bills.filter((b) => b.status === 'Unpaid' || b.status === 'Pending');
  const paidBills = bills.filter((b) => b.status === 'Paid');

  // Handlers
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalComplaint || !selectedOfficerId) return;
    onAssignComplaint(assignModalComplaint.id, selectedOfficerId);
    setAssignModalComplaint(null);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalComplaint) return;
    if (onUpdateComplaintStatus) {
      onUpdateComplaintStatus(resolveModalComplaint.id, 'Resolved', resolutionNotes);
    }
    setResolveModalComplaint(null);
    setResolutionNotes('');
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;
    onPublishNews({
      title: newsTitle,
      category: newsCategory,
      content: newsContent,
      urgent: newsUrgent,
      author: 'CCMC Public Relations',
    });
    setShowNewsModal(false);
    setNewsTitle('');
    setNewsContent('');
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateBill) {
      onCreateBill({
        citizenName: billCitizenName || 'Citizen User',
        consumerNumber: billConsumerNo || `CCMC-${billType.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: billType,
        amount: Number(billAmount) || 1000,
        dueDate: billDueDate,
        wardNo: billWardNo,
        address: billAddress,
        period: '2026-2027 Half Year I',
        status: 'Unpaid',
      });
    }
    setShowBillModal(false);
    setBillCitizenName('');
    setBillConsumerNo('');
  };

  const handleSaveBillEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;
    editingBill.amount = Number(editBillAmount);
    editingBill.dueDate = editBillDueDate;
    editingBill.status = editBillStatus;
    setEditingBill(null);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`New field inspector "${newUserName}" added successfully to ${newUserDept} department.`);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      alert('New Password and Confirm Password do not match!');
      return;
    }
    const updated = {
      name: editName,
      email: editEmail,
      phone: editPhone,
      avatarUrl: editPhoto,
      department: editDept,
      office: editOffice,
    };
    setProfileState(updated);
    currentUser.name = editName;
    currentUser.email = editEmail;
    currentUser.phone = editPhone;
    if (editPhoto) currentUser.avatarUrl = editPhoto;

    setIsEditingProfile(false);
    setProfileSuccessMsg('Profile details and credentials updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Filtered complaints
  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilterStatus === 'All') return true;
    if (complaintFilterStatus === 'Open') return c.status !== 'Resolved' && c.status !== 'Closed';
    return c.status === complaintFilterStatus;
  });

  // Filtered bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.consumerNumber.toLowerCase().includes(billSearchTerm.toLowerCase()) ||
      b.citizenName.toLowerCase().includes(billSearchTerm.toLowerCase());
    if (billFilterStatus === 'All') return matchesSearch;
    if (billFilterStatus === 'Pending') return matchesSearch && (b.status === 'Unpaid' || b.status === 'Pending');
    if (billFilterStatus === 'Paid') return matchesSearch && b.status === 'Paid';
    return matchesSearch;
  });

  // Analytics & Reports Filters
  const [reportMonthFilter, setReportMonthFilter] = useState<string>('All');
  const [reportWardFilter, setReportWardFilter] = useState<string>('All');

  // CSV Export Utility
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCell = (cell: any) => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent =
      headers.map(escapeCell).join(',') +
      '\n' +
      rows.map((row) => row.map(escapeCell).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportComplaintsCSV = () => {
    const headers = [
      'Ticket ID',
      'Category',
      'Priority',
      'Status',
      'Citizen Name',
      'Citizen Phone',
      'Ward Location',
      'Address',
      'Date Created',
      'Assigned Inspector',
      'Department',
      'Resolution Notes',
    ];

    const rows = complaints.map((c) => [
      c.id,
      c.category,
      c.priority || 'Medium',
      c.status,
      c.citizenName,
      c.citizenPhone,
      c.wardNo,
      c.address,
      c.createdAt,
      c.assignedEmployeeName || 'Unassigned',
      c.assignedEmployeeDepartment || 'N/A',
      c.resolutionNotes || 'N/A',
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`CCMC_Grievance_Resolution_Report_${dateStr}.csv`, headers, rows);
  };

  const handleExportBillsCSV = () => {
    const headers = [
      'Bill ID',
      'Consumer Assessment Number',
      'Citizen Name',
      'Tax Type',
      'Amount (INR)',
      'Status',
      'Ward Location',
      'Property Address',
      'Billing Period',
      'Due Date',
      'Payment Date',
      'Transaction ID',
      'Payment Mode',
    ];

    const rows = bills.map((b) => [
      b.id,
      b.consumerNumber,
      b.citizenName,
      b.type,
      b.amount,
      b.status,
      b.wardNo,
      b.address,
      b.period,
      b.dueDate,
      b.paymentDate || 'Pending',
      b.transactionId || 'N/A',
      b.paymentMode || 'N/A',
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`CCMC_Tax_Revenue_Collection_Report_${dateStr}.csv`, headers, rows);
  };

  const handleExportExecutiveSummaryCSV = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const totalComp = complaints.length;
    const resolvedComp = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const pendingComp = totalComp - resolvedComp;
    const resRate = totalComp > 0 ? Math.round((resolvedComp / totalComp) * 100) : 0;

    const totalCollected = bills.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const totalPendingRev = bills.filter((b) => b.status === 'Unpaid' || b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);

    const headers = ['Metric Category', 'KPI Indicator', 'Value / Metric', 'Notes & Commissioner Summary'];
    const rows: (string | number)[][] = [
      ['EXECUTIVE SUMMARY', 'Reporting Date', dateStr, 'Coimbatore City Municipal Corporation'],
      ['EXECUTIVE SUMMARY', 'Reporting Authority', 'Municipal Commissionerate Office', 'CCMC Headquarters'],
      ['GRIEVANCE METRICS', 'Total Complaints Filed', totalComp, 'All 100 Coimbatore Wards'],
      ['GRIEVANCE METRICS', 'Resolved Complaints', resolvedComp, 'Successfully closed'],
      ['GRIEVANCE METRICS', 'Pending / In Progress', pendingComp, 'Action underway by field staff'],
      ['GRIEVANCE METRICS', 'City SLA Resolution Rate', `${resRate}%`, 'Target SLA benchmark is 85%'],
      ['REVENUE METRICS', 'Total Tax Collected (INR)', `₹${totalCollected.toLocaleString('en-IN')}`, 'Property & Water tax payments'],
      ['REVENUE METRICS', 'Pending Dues (INR)', `₹${totalPendingRev.toLocaleString('en-IN')}`, 'Outstanding municipal bills'],
      ['REVENUE METRICS', 'Collection Efficiency', `${bills.length > 0 ? Math.round((paidBills.length / bills.length) * 100) : 0}%`, 'Paid bills ratio'],
    ];

    rows.push(['---', '---', '---', '---']);
    rows.push(['WARD PERFORMANCE', 'Ward Name', 'Resolved / Total', 'Resolution %']);
    stats.wardWiseResolution.forEach((w) => {
      const pct = w.total > 0 ? Math.round((w.resolved / w.total) * 100) : 0;
      rows.push(['WARD PERFORMANCE', w.ward, `${w.resolved}/${w.total}`, `${pct}%`]);
    });

    rows.push(['---', '---', '---', '---']);
    rows.push(['CATEGORY ANALYSIS', 'Grievance Category', 'Ticket Count', 'Share of Total %']);
    stats.categoryBreakdown.forEach((cat) => {
      const pct = totalComp > 0 ? Math.round((cat.count / totalComp) * 100) : 0;
      rows.push(['CATEGORY ANALYSIS', cat.category, cat.count, `${pct}%`]);
    });

    downloadCSV(`CCMC_Executive_Commissioner_Monthly_Report_${dateStr}.csv`, headers, rows);
  };

  const currentTab = activeTab || 'dashboard';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* --- ADMIN HEADER SECTION --- */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3 max-w-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              ADMIN PORTAL ACTIVE
            </span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              • Coimbatore City Municipal Corporation
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-poppins text-white">
            Administrative Control Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Integrated Municipal Operations &amp; Governance System • CCMC Smart City Headquarters
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={handleExportComplaintsCSV}
            title="Download Grievances Resolution Report CSV"
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-file-csv"></i> Grievances CSV
          </button>
          <button
            onClick={handleExportBillsCSV}
            title="Download Tax Revenue Report CSV"
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-file-excel"></i> Revenue CSV
          </button>
          <button
            onClick={() => setShowNewsModal(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-bullhorn"></i> Broadcast Notice
          </button>
        </div>
      </div>

      {/* --- SIX STATISTICS CARDS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Total Citizens</div>
          <div className="text-2xl font-extrabold text-blue-600 font-poppins mt-1">
            {citizens.length}
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Registered Citizens</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Total Employees</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-poppins mt-1">
            {employees.length}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active Field Staff</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Total Complaints</div>
          <div className="text-2xl font-extrabold text-slate-900 font-poppins mt-1">
            {complaints.length}
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Logged Tickets</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Pending Complaints</div>
          <div className="text-2xl font-extrabold text-rose-600 font-poppins mt-1">
            {complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length}
          </div>
          <p className="text-[10px] text-rose-600 font-semibold mt-1">Awaiting Resolution</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Resolved Complaints</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-poppins mt-1">
            {complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Successfully Resolved</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Pending Bills</div>
          <div className="text-2xl font-extrabold text-amber-600 font-poppins mt-1">
            {pendingBills.length}
          </div>
          <p className="text-[10px] text-amber-600 font-semibold mt-1">Unpaid Dues</p>
        </div>
      </div>

      {/* --- DASHBOARD VIEW (STRICT SPEC) --- */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Administrative Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 font-poppins uppercase tracking-wider">
              Quick Administrative Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                onClick={() => onTabChange && onTabChange('complaints')}
                className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-2xl border border-blue-200/80 text-left transition space-y-1.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-list-check"></i>
                </div>
                <div className="text-xs font-extrabold">Assign Complaints</div>
                <div className="text-[10px] text-blue-700">Dispatch field inspectors</div>
              </button>

              <button
                onClick={() => onTabChange && onTabChange('bills')}
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200/80 text-left transition space-y-1.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <div className="text-xs font-extrabold">Generate Bills</div>
                <div className="text-[10px] text-emerald-700">Manage utility charges</div>
              </button>

              <button
                onClick={() => onTabChange && onTabChange('users')}
                className="p-3.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-2xl border border-purple-200/80 text-left transition space-y-1.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-users-gear"></i>
                </div>
                <div className="text-xs font-extrabold">Users &amp; Staff</div>
                <div className="text-[10px] text-purple-700">Manage municipal users</div>
              </button>

              <button
                onClick={() => setShowNewsModal(true)}
                className="p-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-200/80 text-left transition space-y-1.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <div className="text-xs font-extrabold">Publish Notice</div>
                <div className="text-[10px] text-amber-700">Broadcast municipal updates</div>
              </button>

              <button
                onClick={() => onTabChange && onTabChange('reports')}
                className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl border border-slate-200 text-left transition space-y-1.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div className="text-xs font-extrabold">View Reports</div>
                <div className="text-[10px] text-slate-600">Analyze performance</div>
              </button>
            </div>
          </div>

          {/* Compact Coimbatore GIS Map Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-poppins">
                  Coimbatore GIS Overview – Infrastructure &amp; Complaints
                </h3>
                <p className="text-xs text-slate-500">
                  Compact map preview. Select "City Map" from navigation or click below for the full interactive map.
                </p>
              </div>
              {onTabChange && (
                <button
                  onClick={() => onTabChange('map')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-expand text-xs"></i> View Full City Map
                </button>
              )}
            </div>
            <CoimbatoreMap locations={locations} heightClassName="h-[500px]" />
          </div>
        </div>
      )}

      {/* --- COMPLAINT MANAGEMENT TAB --- */}
      {currentTab === 'complaints' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 font-poppins">
                Grievance &amp; Complaint Management System
              </h2>
              <p className="text-xs text-slate-500">
                Verify, geotag, assign, track, and resolve citizen grievances across all 100 Coimbatore wards
              </p>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'New', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    complaintFilterStatus === st
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No complaints found matching status filter "{complaintFilterStatus}".
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        #{c.id}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">{c.category}</span>
                      {c.priority && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            c.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : c.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {c.priority} Priority
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold">{c.createdAt}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          c.status === 'Resolved' || c.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Verified'
                            ? 'bg-teal-100 text-teal-800'
                            : c.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-800">{c.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-500 font-medium space-y-0.5">
                      <div>
                        <i className="fa-solid fa-location-dot text-rose-500 mr-1"></i>
                        {c.address} ({c.wardNo})
                      </div>
                      <div>
                        <i className="fa-solid fa-user text-slate-400 mr-1"></i>
                        Citizen: {c.citizenName} ({c.citizenPhone})
                      </div>
                      {c.assignedEmployeeName && (
                        <div className="text-xs font-semibold text-blue-700 pt-0.5">
                          Assigned Inspector: <strong>{c.assignedEmployeeName}</strong> ({c.assignedEmployeeDepartment})
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {c.photoUrl && (
                        <button
                          onClick={() => setPhotoModalUrl(c.photoUrl || null)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-image text-xs"></i> View Photo
                        </button>
                      )}

                      <button
                        onClick={() => setLocationModalComplaint(c)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-map-pin text-rose-500 text-xs"></i> Geotag
                      </button>

                      {/* Verify Action */}
                      {(c.status === 'Pending' || c.status === 'New') && (
                        <button
                          onClick={() => {
                            if (onVerifyComplaint) onVerifyComplaint(c.id);
                            else if (onUpdateComplaintStatus) onUpdateComplaintStatus(c.id, 'Verified');
                          }}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-check-double text-xs"></i> Verify
                        </button>
                      )}

                      {/* Assign Action */}
                      {c.status !== 'Resolved' && c.status !== 'Closed' && (
                        <button
                          onClick={() => {
                            setAssignModalComplaint(c);
                            setSelectedOfficerId(employees[0]?.id || '');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-user-plus text-xs"></i>
                          {c.assignedEmployeeId ? 'Re-assign' : 'Assign'}
                        </button>
                      )}

                      {/* Resolve Action */}
                      {c.status !== 'Resolved' && c.status !== 'Closed' && (
                        <button
                          onClick={() => setResolveModalComplaint(c)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-circle-check text-xs"></i> Resolve
                        </button>
                      )}

                      {/* Close Action */}
                      {c.status === 'Resolved' && (
                        <button
                          onClick={() => {
                            if (onCloseComplaint) onCloseComplaint(c.id);
                            else if (onUpdateComplaintStatus) onUpdateComplaintStatus(c.id, 'Closed');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-lock text-xs"></i> Close Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Complaint Audit Logs */}
                  {c.logs && c.logs.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                      <div className="font-bold text-slate-700 uppercase tracking-tight text-[10px]">
                        Lifecycle Activity Log ({c.logs.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {c.logs.slice(-3).map((l, idx) => (
                          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            <strong>{l.status}</strong>: {l.comment} ({l.timestamp})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- BILL MANAGEMENT TAB --- */}
      {currentTab === 'bills' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 font-poppins">
                Municipal Revenue &amp; Utility Bill Management
              </h2>
              <p className="text-xs text-slate-500">
                Generate property tax, water charge, and municipal bills. Monitor payments and citizen dues.
              </p>
            </div>

            <button
              onClick={() => setShowBillModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i> Generate New Bill
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={billSearchTerm}
                onChange={(e) => setBillSearchTerm(e.target.value)}
                placeholder="Search consumer no or citizen..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {['All', 'Pending', 'Paid'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBillFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    billFilterStatus === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Bills Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-3.5">Consumer No</th>
                  <th className="p-3.5">Citizen Name</th>
                  <th className="p-3.5">Bill Type</th>
                  <th className="p-3.5">Ward / Location</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-700">{b.consumerNumber}</td>
                    <td className="p-3.5 font-bold">{b.citizenName}</td>
                    <td className="p-3.5">
                      <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {b.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{b.wardNo}</td>
                    <td className="p-3.5 text-slate-600">{b.dueDate}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">₹{b.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span
                        className={`font-extrabold text-[10px] px-2.5 py-0.5 rounded-full ${
                          b.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status === 'Paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingBill(b);
                          setEditBillAmount(b.amount);
                          setEditBillDueDate(b.dueDate);
                          setEditBillStatus(b.status as any);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- USERS & STAFF TAB --- */}
      {currentTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 font-poppins">
                Municipal Directory, Staff &amp; Citizens
              </h2>
              <p className="text-xs text-slate-500">
                Manage accounts, activate/deactivate inspectors, view inspector workload assignments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-user-plus"></i> Add Field Staff
              </button>
            </div>
          </div>

          {/* User Role Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {[
              { key: 'all', label: `All Users (${users.length})` },
              { key: 'employee', label: `Field Staff (${employees.length})` },
              { key: 'citizen', label: `Citizens (${citizens.length})` },
              { key: 'admin', label: `Administrators (${admins.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setUserTabRole(t.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  userTabRole === t.key
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* User Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter((u) => userTabRole === 'all' || u.role === userTabRole)
              .map((u) => {
                const assignedCount = complaints.filter(
                  (c) => c.assignedEmployeeId === u.id && c.status !== 'Resolved'
                ).length;
                const isActive = u.active !== false;

                return (
                  <div
                    key={u.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm ${
                            u.role === 'admin'
                              ? 'bg-purple-600'
                              : u.role === 'employee'
                              ? 'bg-blue-600'
                              : 'bg-teal-600'
                          }`}
                        >
                          <i
                            className={`fa-solid ${
                              u.role === 'admin'
                                ? 'fa-user-shield'
                                : u.role === 'employee'
                                ? 'fa-user-gear'
                                : 'fa-user'
                            }`}
                          ></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{u.name}</h4>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {u.role}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onToggleUserStatus) {
                            onToggleUserStatus(u.id, !isActive);
                          } else {
                            u.active = !isActive;
                            alert(`User ${u.name} status updated to ${!isActive ? 'Active' : 'Deactivated'}`);
                          }
                        }}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 font-medium pt-1 border-t border-slate-200">
                      <div>
                        <i className="fa-solid fa-envelope text-slate-400 w-4"></i> {u.email}
                      </div>
                      <div>
                        <i className="fa-solid fa-phone text-slate-400 w-4"></i> {u.phone}
                      </div>
                      {u.department && (
                        <div>
                          <i className="fa-solid fa-building text-blue-500 w-4"></i> {u.department} ({u.designation})
                        </div>
                      )}
                      {u.wardNo && (
                        <div>
                          <i className="fa-solid fa-map-pin text-rose-500 w-4"></i> {u.wardNo}
                        </div>
                      )}
                    </div>

                    {u.role === 'employee' && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Active Workload:</span>
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {assignedCount} tickets assigned
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* --- CITY MAP TAB --- */}
      {currentTab === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 font-poppins">
                Coimbatore Interactive GIS Municipal Map
              </h2>
              <p className="text-xs text-slate-500">
                Full-scale spatial view of offices, hospitals, police, fire, waste points, and complaint hotspots
              </p>
            </div>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
              CCMC Smart GIS Layer
            </span>
          </div>

          <CoimbatoreMap locations={locations} heightClassName="h-[620px]" />
        </div>
      )}

      {/* --- REPORTS & ANALYTICS TAB --- */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          {/* Header Banner & Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <i className="fa-solid fa-chart-line"></i> Commissioner Executive Suite
                </div>
                <h2 className="font-extrabold text-xl text-slate-900 font-poppins">
                  Coimbatore Municipal Analytics &amp; Official CSV Reports
                </h2>
                <p className="text-xs text-slate-500">
                  Generate downloadable CSV/Excel audit files for City Commissioners, Zone Chairmen, and Department Heads
                </p>
              </div>

              {/* Month & Ward Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-tight mb-1">
                    Reporting Month
                  </label>
                  <select
                    value={reportMonthFilter}
                    onChange={(e) => setReportMonthFilter(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Months (2026)</option>
                    <option value="Oct 2026">October 2026</option>
                    <option value="Sep 2026">September 2026</option>
                    <option value="Aug 2026">August 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-tight mb-1">
                    Ward Selection
                  </label>
                  <select
                    value={reportWardFilter}
                    onChange={(e) => setReportWardFilter(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Wards (Master)</option>
                    <option value="Ward 24 (RS Puram)">Ward 24 (RS Puram)</option>
                    <option value="Ward 32 (Gandhipuram)">Ward 32 (Gandhipuram)</option>
                    <option value="Ward 58 (Singanallur)">Ward 58 (Singanallur)</option>
                    <option value="Ward 12 (Town Hall)">Ward 12 (Town Hall)</option>
                    <option value="Ward 72 (Peelamedu)">Ward 72 (Peelamedu)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CSV Exporters Action Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-download"></i> Official Municipal Report Exporters
                </div>
                <div className="text-sm font-bold text-white">
                  Export Monthly Grievance &amp; Revenue Ledger Files
                </div>
                <div className="text-xs text-slate-300">
                  Compatible with Microsoft Excel, Google Sheets, and Government Auditing Systems
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleExportComplaintsCSV}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-file-csv text-base"></i> Grievances CSV
                </button>

                <button
                  onClick={handleExportBillsCSV}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-file-excel text-base"></i> Tax Revenue CSV
                </button>

                <button
                  onClick={handleExportExecutiveSummaryCSV}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-clipboard-list text-base"></i> Commissioner Summary CSV
                </button>
              </div>
            </div>
          </div>

          {/* Key Executive KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-tight">
                  SLA Resolution Rate
                </span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-circle-check"></i>
                </span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 font-poppins">
                {complaints.length > 0
                  ? Math.round(
                      (complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length /
                        complaints.length) *
                        100
                    )
                  : 0}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${
                      complaints.length > 0
                        ? Math.round(
                            (complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length /
                              complaints.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                Target SLA Benchmark: <strong>85.0%</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-tight">
                  Avg Turnaround Time
                </span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-stopwatch"></i>
                </span>
              </div>
              <div className="text-2xl font-extrabold text-blue-600 font-poppins">1.8 Days</div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-[80%]"></div>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                SLA Max Limit: <strong>3.0 Days</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-tight">
                  Tax Collection Rate
                </span>
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                </span>
              </div>
              <div className="text-2xl font-extrabold text-purple-600 font-poppins">
                {bills.length > 0 ? Math.round((paidBills.length / bills.length) * 100) : 0}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{
                    width: `${bills.length > 0 ? Math.round((paidBills.length / bills.length) * 100) : 0}%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                Total Collected: ₹{bills.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-tight">
                  Inspector Efficiency
                </span>
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  <i className="fa-solid fa-user-check"></i>
                </span>
              </div>
              <div className="text-2xl font-extrabold text-amber-600 font-poppins">92.4%</div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[92%]"></div>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                Active Inspectors: <strong>{employees.length} Officers</strong>
              </div>
            </div>
          </div>

          {/* Visual Category & Ward Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Category Grievance Share
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Total: {complaints.length} Tickets</span>
              </div>
              <div className="space-y-3.5">
                {stats.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{cat.category}</span>
                      <span>
                        {cat.count} tickets ({Math.round((cat.count / (stats.totalComplaints || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (cat.count / (stats.totalComplaints || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ward Resolution SLA Progress */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Ward SLA Resolution Progress
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">High Target Wards</span>
              </div>
              <div className="space-y-3.5">
                {stats.wardWiseResolution.map((w) => (
                  <div key={w.ward} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{w.ward}</span>
                      <span>
                        {w.resolved}/{w.total} resolved ({Math.round((w.resolved / w.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${(w.resolved / w.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Field Inspector Performance Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-poppins">
                  Field Inspector Productivity &amp; Workload Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Track assigned ticket loads, resolution throughput, and inspector SLA scores
                </p>
              </div>
              <button
                onClick={handleExportComplaintsCSV}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-blue-200"
              >
                <i className="fa-solid fa-download text-xs"></i> Export Matrix CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                    <th className="p-3 rounded-l-xl">Inspector Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Ward Location</th>
                    <th className="p-3 text-center">Assigned Tickets</th>
                    <th className="p-3 text-center">Resolved Tickets</th>
                    <th className="p-3 text-right rounded-r-xl">Efficiency SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employees.map((emp) => {
                    const empAssigned = complaints.filter((c) => c.assignedEmployeeId === emp.id);
                    const empResolved = empAssigned.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
                    const effRate = empAssigned.length > 0 ? Math.round((empResolved.length / empAssigned.length) * 100) : 100;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            <i className="fa-solid fa-user-gear"></i>
                          </div>
                          {emp.name}
                        </td>
                        <td className="p-3 text-slate-600">{emp.department || 'Sanitation & Health'}</td>
                        <td className="p-3 text-slate-600">{emp.wardNo || 'Ward 24 (RS Puram)'}</td>
                        <td className="p-3 text-center font-bold text-blue-700">{empAssigned.length}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{empResolved.length}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                              effRate >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : effRate >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {effRate}% SLA
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS TAB --- */}
      {currentTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 font-poppins">
                System Alerts &amp; Municipal Press Releases
              </h2>
              <p className="text-xs text-slate-500">
                Logged notifications, citizen complaint alerts, and broadcast announcements
              </p>
            </div>
            <button
              onClick={() => setShowNewsModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-bullhorn mr-1"></i> New Notice
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No notifications recorded yet.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- PROFILE TAB --- */}
      {currentTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              {profileState.avatarUrl ? (
                <img
                  src={profileState.avatarUrl}
                  alt={profileState.name}
                  className="w-16 h-16 rounded-3xl object-cover border-2 border-blue-600 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-3xl bg-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
              )}
              <div>
                <h2 className="font-extrabold text-xl text-slate-900 font-poppins">{profileState.name}</h2>
                <div className="inline-block bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mt-0.5">
                  Role: Administrator
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {profileState.department}
                </p>
              </div>
            </div>

            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square"></i> Edit Profile
              </button>
            )}
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {!isEditingProfile ? (
            /* Read-Only Profile View */
            <div className="space-y-3 text-xs font-medium text-slate-700">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Admin Name</span>
                <span className="font-bold text-slate-900">{profileState.name}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Official Role</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Administrator
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Official Email</span>
                <span className="font-bold text-slate-900">{profileState.email}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Phone Number</span>
                <span className="font-bold text-slate-900">{profileState.phone}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Department</span>
                <span className="font-bold text-slate-900">{profileState.department}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Office / Organization</span>
                <span className="font-bold text-slate-900">{profileState.office}</span>
              </div>
            </div>
          ) : (
            /* Edit Profile Form */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                  Personal &amp; Contact Details
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profile Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Office / Organization</label>
                    <input
                      type="text"
                      value={editOffice}
                      onChange={(e) => setEditOffice(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                  Security &amp; Change Password
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Leave blank if unchanged"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="New password"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* --- ALL MODALS --- */}

      {/* 1. ASSIGN OFFICER MODAL */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Assign Inspector to #{assignModalComplaint.id}
              </h3>
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Field Inspector
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Set Complaint Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent / SLA Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalComplaint(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. RESOLUTION NOTES MODAL */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Mark #{resolveModalComplaint.id} as Resolved
              </h3>
              <button
                onClick={() => setResolveModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Resolution Summary / Inspector Notes
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Pipeline repaired and garbage cleared under Ward Inspector supervision..."
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalComplaint(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. GENERATE BILL MODAL */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Generate Municipal Utility / Tax Bill
              </h3>
              <button
                onClick={() => setShowBillModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleBillSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Citizen Name
                  </label>
                  <input
                    type="text"
                    value={billCitizenName}
                    onChange={(e) => setBillCitizenName(e.target.value)}
                    placeholder="e.g. Karthik Subramanian"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Consumer / Assessment No
                  </label>
                  <input
                    type="text"
                    value={billConsumerNo}
                    onChange={(e) => setBillConsumerNo(e.target.value)}
                    placeholder="e.g. CCMC-PROP-98214"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bill Type
                  </label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="Property Tax">Property Tax</option>
                    <option value="Water Bill font-semibold">Water Bill</option>
                    <option value="Electricity Bill">Electricity Bill</option>
                    <option value="Solid Waste Charge">Solid Waste Charge</option>
                    <option value="Professional Tax">Professional Tax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-extrabold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ward No
                  </label>
                  <input
                    type="text"
                    value={billWardNo}
                    onChange={(e) => setBillWardNo(e.target.value)}
                    placeholder="Ward 24 (RS Puram)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT BILL DETAILS MODAL */}
      {editingBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Update Bill #{editingBill.consumerNumber}
              </h3>
              <button
                onClick={() => setEditingBill(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveBillEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Citizen &amp; Type</label>
                <p className="text-xs font-bold text-slate-900">{editingBill.citizenName} ({editingBill.type})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bill Amount (₹)</label>
                <input
                  type="number"
                  value={editBillAmount}
                  onChange={(e) => setEditBillAmount(Number(e.target.value))}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  value={editBillDueDate}
                  onChange={(e) => setEditBillDueDate(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Status</label>
                <select
                  value={editBillStatus}
                  onChange={(e) => setEditBillStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="Unpaid">Unpaid / Outstanding</option>
                  <option value="Paid">Paid / Settled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Save Bill Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. PUBLISH NEWS MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Publish Municipal Announcement
              </h3>
              <button
                onClick={() => setShowNewsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g. Pilloor Phase 3 Pipeline Maintenance Schedule"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="Municipal Notice">Municipal Notice</option>
                  <option value="Water Supply Update">Water Supply Update</option>
                  <option value="Road Maintenance">Road Maintenance</option>
                  <option value="Public Health">Public Health</option>
                  <option value="City Event">City Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Notice Content
                </label>
                <textarea
                  rows={4}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Announcement details..."
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentChk"
                  checked={newsUrgent}
                  onChange={(e) => setNewsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="urgentChk" className="text-xs font-bold text-rose-600">
                  Mark as Urgent Alert (Sends notification to citizens)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD FIELD STAFF MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Register New Field Inspector / Staff
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="ramesh@ccmc.gov.in"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="98422XXXXX"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="Sanitation">Sanitation</option>
                    <option value="Water Works">Water Works</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Roads & Works">Roads &amp; Works</option>
                    <option value="Public Health">Public Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={newUserDesig}
                    onChange={(e) => setNewUserDesig(e.target.value)}
                    placeholder="Sanitation Inspector"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Add Inspector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PHOTO MODAL */}
      {photoModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Complaint Photographic Evidence</h3>
              <button
                onClick={() => setPhotoModalUrl(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <img
              src={photoModalUrl}
              alt="Complaint Evidence"
              className="w-full h-72 object-cover rounded-2xl border border-slate-200"
            />
          </div>
        </div>
      )}

      {/* 8. GEOTAG LOCATION MODAL */}
      {locationModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Geotag Location details for #{locationModalComplaint.id}
              </h3>
              <button
                onClick={() => setLocationModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Address</span>
                <span className="font-bold text-slate-900">{locationModalComplaint.address}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Ward Jurisdiction</span>
                <span className="font-bold text-slate-900">{locationModalComplaint.wardNo}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Latitude</span>
                  <span className="font-mono font-bold text-blue-700">{locationModalComplaint.latitude}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Longitude</span>
                  <span className="font-mono font-bold text-blue-700">{locationModalComplaint.longitude}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setLocationModalComplaint(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close Geotag View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
