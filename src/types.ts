export type UserRole = 'citizen' | 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  wardNo?: string;
  address?: string;
  department?: string; // For employees (e.g., 'Sanitation', 'Water Works', 'Electrical', 'Roads')
  designation?: string; // e.g. 'Assistant Engineer', 'Sanitation Inspector'
  avatar?: string;
  active?: boolean;
}

export type ComplaintCategory =
  | 'Garbage & Sanitation'
  | 'Water Supply Leakage'
  | 'Streetlight Outage'
  | 'Pothole & Road Repair'
  | 'Sewage & Drainage Overflow'
  | 'Illegal Construction'
  | 'Public Health Hazard'
  | 'Tree Trimming';

export type ComplaintStatus = 'New' | 'Verified' | 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';

export interface ComplaintLog {
  status: ComplaintStatus;
  timestamp: string;
  updatedBy: string;
  comment: string;
  photoUrl?: string;
}

export interface Complaint {
  id: string; // e.g. CBE-2026-8492
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  address: string;
  latitude: number;
  longitude: number;
  wardNo: string;
  createdAt: string;
  photoUrl?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeDepartment?: string;
  assignedAt?: string;
  resolutionDate?: string;
  resolutionPhotoUrl?: string;
  resolutionNotes?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  logs: ComplaintLog[];
}

export type BillType = 'Electricity Bill' | 'Water Bill' | 'Property Tax' | 'Solid Waste Charge' | 'Professional Tax';

export interface Bill {
  id: string;
  consumerNumber: string; // e.g. CCMC-PROP-98214
  citizenName: string;
  address: string;
  wardNo: string;
  type: BillType;
  period: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Pending' | 'Paid';
  paymentDate?: string;
  transactionId?: string;
  paymentMode?: string;
}

export interface PaymentReceipt {
  receiptNo: string;
  billId: string;
  type: BillType;
  consumerNumber: string;
  citizenName: string;
  address: string;
  amountPaid: number;
  transactionId: string;
  paymentMode: string;
  paidAt: string;
}

export interface EmergencyContact {
  id: string;
  category: 'Police' | 'Ambulance' | 'Fire & Rescue' | 'Government Hospitals' | 'Municipal Helpline';
  title: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  availableHours: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Municipal Notice' | 'Water Supply Update' | 'Road Maintenance' | 'Public Health' | 'City Event';
  content: string;
  publishedAt: string;
  author: string;
  urgent?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'complaint' | 'bill' | 'emergency' | 'announcement';
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export type LocationCategory =
  | 'Municipal Office'
  | 'Hospital'
  | 'Police Station'
  | 'Fire Station'
  | 'Bus Stand'
  | 'Railway Station'
  | 'Garbage Collection'
  | 'Recycling Center'
  | 'Complaint Marker';

export interface MapLocation {
  id: string;
  name: string;
  category: LocationCategory;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  details: string;
  hours?: string;
  status?: string; // For complaint markers
  complaintId?: string;
}

export interface StatsOverview {
  totalCitizens: number;
  totalEmployees: number;
  totalComplaints: number;
  pendingComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  revenueCollected: number;
  categoryBreakdown: { category: string; count: number }[];
  wardWiseResolution: { ward: string; total: number; resolved: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}
