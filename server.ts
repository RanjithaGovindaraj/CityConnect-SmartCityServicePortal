import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_LOCATIONS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_NEWS,
  INITIAL_USERS,
  INITIAL_COMPLAINTS,
  INITIAL_BILLS,
  INITIAL_NOTIFICATIONS,
} from './src/data/coimbatoreData';
import { Complaint, Bill, NewsItem, NotificationItem, User, MapLocation } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Database State
let locations: MapLocation[] = [...INITIAL_LOCATIONS];
let emergencyContacts = [...INITIAL_EMERGENCY_CONTACTS];
let newsList: NewsItem[] = [...INITIAL_NEWS];
let users: User[] = [...INITIAL_USERS];
let complaints: Complaint[] = [...INITIAL_COMPLAINTS];
let bills: Bill[] = [...INITIAL_BILLS];
let notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ------------------- API ROUTES -------------------

// 1. Locations
app.get('/api/locations', (req, res) => {
  // Combine static locations with active complaint locations for map
  const complaintLocations: MapLocation[] = complaints.map((c) => ({
    id: `map-comp-${c.id}`,
    name: `Complaint: ${c.category} (${c.status})`,
    category: 'Complaint Marker',
    address: c.address,
    phone: c.citizenPhone,
    latitude: c.latitude,
    longitude: c.longitude,
    details: `${c.description} | Filed by: ${c.citizenName} | Date: ${c.createdAt}`,
    status: c.status,
    complaintId: c.id,
  }));

  res.json({ locations: [...locations, ...complaintLocations] });
});

// 2. Complaints
app.get('/api/complaints', (req, res) => {
  const { citizenId, employeeId, status } = req.query;
  let filtered = [...complaints];

  if (citizenId) {
    filtered = filtered.filter((c) => c.citizenId === citizenId);
  }
  if (employeeId) {
    filtered = filtered.filter((c) => c.assignedEmployeeId === employeeId);
  }
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  res.json({ complaints: filtered });
});

app.post('/api/complaints', (req, res) => {
  const {
    citizenId,
    citizenName,
    citizenPhone,
    category,
    description,
    address,
    latitude,
    longitude,
    wardNo,
    photoUrl,
  } = req.body;

  const newId = `CBE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const newComplaint: Complaint = {
    id: newId,
    citizenId: citizenId || 'usr-citizen-1',
    citizenName: citizenName || 'Karthik Subramanian',
    citizenPhone: citizenPhone || '9842212345',
    category,
    description,
    status: 'Pending',
    address: address || 'Coimbatore Municipal Area',
    latitude: Number(latitude) || 11.0168,
    longitude: Number(longitude) || 76.9558,
    wardNo: wardNo || 'Ward 24',
    createdAt: timestamp,
    photoUrl,
    logs: [
      {
        status: 'Pending',
        timestamp,
        updatedBy: citizenName || 'Citizen',
        comment: 'Complaint filed via CityConnect Geo-Portal.',
      },
    ],
  };

  complaints.unshift(newComplaint);

  // Add Notification for Admin/Citizen
  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    userId: citizenId || 'usr-citizen-1',
    title: `Complaint ${newId} Registered`,
    message: `Your complaint regarding ${category} has been logged successfully under ${newComplaint.wardNo}.`,
    type: 'complaint',
    timestamp,
    read: false,
    relatedId: newId,
  };
  notifications.unshift(notif);

  res.status(201).json({ complaint: newComplaint, message: 'Complaint registered successfully' });
});

app.patch('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignedEmployeeId, resolutionNotes, resolutionPhotoUrl, updatedBy } = req.body;

  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (assignedEmployeeId) {
    const emp = users.find((u) => u.id === assignedEmployeeId);
    if (emp) {
      complaint.assignedEmployeeId = emp.id;
      complaint.assignedEmployeeName = emp.name;
      complaint.assignedEmployeeDepartment = emp.department;
      complaint.assignedAt = timestamp;
      complaint.status = 'Assigned';
    }
  }

  if (status) {
    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolutionDate = timestamp;
      if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
      if (resolutionPhotoUrl) complaint.resolutionPhotoUrl = resolutionPhotoUrl;
    }
  }

  // Push Log
  complaint.logs.push({
    status: complaint.status,
    timestamp,
    updatedBy: updatedBy || 'Municipal Official',
    comment:
      resolutionNotes ||
      (assignedEmployeeId
        ? `Assigned to ${complaint.assignedEmployeeName}`
        : `Status changed to ${complaint.status}`),
    photoUrl: resolutionPhotoUrl,
  });

  // Notify Citizen
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: complaint.citizenId,
    title: `Complaint ${complaint.id} Update`,
    message: `Your complaint is now ${complaint.status}. ${resolutionNotes ? `Notes: ${resolutionNotes}` : ''}`,
    type: 'complaint',
    timestamp,
    read: false,
    relatedId: complaint.id,
  });

  res.json({ complaint, message: 'Complaint updated successfully' });
});

app.put('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, comment, updatedBy, resolutionPhotoUrl } = req.body;
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  complaint.status = status;
  if (comment) complaint.resolutionNotes = comment;
  if (resolutionPhotoUrl) complaint.resolutionPhotoUrl = resolutionPhotoUrl;
  if (status === 'Resolved') {
    complaint.resolutionDate = timestamp;
  }
  complaint.logs.push({
    status,
    timestamp,
    updatedBy: updatedBy || 'Officer',
    comment: comment || `Status updated to ${status}`,
    photoUrl: resolutionPhotoUrl,
  });

  res.json({ complaint, message: 'Status updated successfully' });
});

app.put('/api/complaints/:id/assign', (req, res) => {
  const { id } = req.params;
  const { employeeId, employeeName, employeeDepartment } = req.body;
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  complaint.assignedEmployeeId = employeeId;
  complaint.assignedEmployeeName = employeeName;
  complaint.assignedEmployeeDepartment = employeeDepartment;
  complaint.assignedAt = timestamp;
  complaint.status = 'Assigned';

  complaint.logs.push({
    status: 'Assigned',
    timestamp,
    updatedBy: 'Admin Commissioner',
    comment: `Assigned to Inspector ${employeeName} (${employeeDepartment})`,
  });

  res.json({ complaint, message: 'Complaint assigned successfully' });
});

app.patch('/api/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  const usr = users.find((u) => u.id === id);
  if (!usr) return res.status(404).json({ error: 'User not found' });

  usr.active = active;
  res.json({ user: usr, message: `User active status set to ${active}` });
});

// 3. Bills
app.get('/api/bills', (req, res) => {
  const { consumerNumber, citizenName } = req.query;
  let filtered = [...bills];

  if (consumerNumber) {
    filtered = filtered.filter(
      (b) => b.consumerNumber.toLowerCase() === String(consumerNumber).toLowerCase()
    );
  }
  if (citizenName) {
    filtered = filtered.filter((b) => b.citizenName.toLowerCase().includes(String(citizenName).toLowerCase()));
  }

  res.json({ bills: filtered });
});

app.post('/api/bills', (req, res) => {
  const { citizenName, consumerNumber, type, amount, dueDate, wardNo, address, period } = req.body;
  const newBill: Bill = {
    id: `bill-${Date.now()}`,
    citizenName: citizenName || 'Citizen',
    consumerNumber: consumerNumber || `CCMC-${type ? type.slice(0, 4).toUpperCase() : 'TAX'}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: type || 'Property Tax',
    amount: Number(amount) || 1000,
    dueDate: dueDate || '2026-09-30',
    status: 'Unpaid',
    wardNo: wardNo || 'Ward 24 (RS Puram)',
    address: address || 'Coimbatore Municipal Area',
    period: period || '2026-2027 Half Year I',
  };

  bills.unshift(newBill);
  res.status(201).json({ bill: newBill, message: 'Bill generated successfully' });
});

app.post('/api/bills/pay', (req, res) => {
  const { billId, paymentMode } = req.body;
  const bill = bills.find((b) => b.id === billId);

  if (!bill) {
    return res.status(404).json({ error: 'Bill record not found' });
  }

  if (bill.status === 'Paid') {
    return res.status(400).json({ error: 'Bill is already paid' });
  }

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const txnId = `TXN-CCMC-${Math.floor(100000 + Math.random() * 900000)}`;

  bill.status = 'Paid';
  bill.paymentDate = timestamp;
  bill.transactionId = txnId;
  bill.paymentMode = paymentMode || 'UPI / Online Card';

  res.json({
    message: 'Payment processed successfully',
    receipt: {
      receiptNo: `REC-CCMC-${Math.floor(10000 + Math.random() * 90000)}`,
      billId: bill.id,
      type: bill.type,
      consumerNumber: bill.consumerNumber,
      citizenName: bill.citizenName,
      address: bill.address,
      amountPaid: bill.amount,
      transactionId: txnId,
      paymentMode: bill.paymentMode,
      paidAt: timestamp,
    },
    bill,
  });
});

// 4. Emergency Contacts & News
app.get('/api/emergency', (req, res) => {
  res.json({ contacts: emergencyContacts });
});

app.get('/api/news', (req, res) => {
  res.json({ news: newsList });
});

app.post('/api/news', (req, res) => {
  const { title, category, content, urgent, author } = req.body;
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const newNotice: NewsItem = {
    id: `news-${Date.now()}`,
    title,
    category: category || 'Municipal Notice',
    content,
    publishedAt: timestamp,
    author: author || 'CCMC Public Relations',
    urgent: Boolean(urgent),
  };

  newsList.unshift(newNotice);

  // Broadcast Notification
  users.forEach((u) => {
    notifications.unshift({
      id: `notif-${Date.now()}-${u.id}`,
      userId: u.id,
      title: `Notice: ${title}`,
      message: content.slice(0, 100) + '...',
      type: 'announcement',
      timestamp,
      read: false,
    });
  });

  res.status(201).json({ news: newNotice, message: 'Announcement published successfully' });
});

// 5. Notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const userNotifs = notifications.filter((n) => !userId || n.userId === userId || n.userId === 'usr-citizen-1');
  res.json({ notifications: userNotifs });
});

app.patch('/api/notifications/read-all', (req, res) => {
  notifications.forEach((n) => (n.read = true));
  res.json({ message: 'All notifications marked as read' });
});

// 6. Users & Stats
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  const filtered = role ? users.filter((u) => u.role === role) : users;
  res.json({ users: filtered });
});

app.get('/api/stats', (req, res) => {
  const totalCitizens = users.filter((u) => u.role === citizen_role()).length;
  const totalEmployees = users.filter((u) => u.role === 'employee').length;
  const totalComplaints = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const assigned = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const revenue = bills.filter((b) => b.status === 'Paid').reduce((acc, b) => acc + b.amount, 0);

  // Category Breakdown
  const catMap: Record<string, number> = {};
  complaints.forEach((c) => {
    catMap[c.category] = (catMap[c.category] || 0) + 1;
  });
  const categoryBreakdown = Object.keys(catMap).map((k) => ({ category: k, count: catMap[k] }));

  function citizen_role() { return 'citizen'; }

  res.json({
    stats: {
      totalCitizens: totalCitizens || 1420,
      totalEmployees: totalEmployees || 48,
      totalComplaints,
      pendingComplaints: pending,
      assignedComplaints: assigned,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      revenueCollected: revenue + 184500, // Real simulation total
      categoryBreakdown,
      wardWiseResolution: [
        { ward: 'Ward 24 (RS Puram)', total: 18, resolved: 15 },
        { ward: 'Ward 32 (Gandhipuram)', total: 24, resolved: 22 },
        { ward: 'Ward 58 (Singanallur)', total: 12, resolved: 9 },
        { ward: 'Ward 12 (Town Hall)', total: 15, resolved: 11 },
        { ward: 'Ward 45 (Peelamedu)', total: 20, resolved: 18 },
      ],
    },
  });
});

// 7. Gemini AI Assistant endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "CityConnect AI Guide", the official AI Citizen Assistant for Coimbatore City Municipal Corporation (CCMC), Tamil Nadu, India.
Your mission is to politely, accurately, and clearly assist citizens, employees, and visitors with CCMC municipal services.

Current Knowledge Base:
- Coimbatore City Municipal Corporation (CCMC) Headquarters: Town Hall, Big Bazaar Street, Coimbatore - 641001. Helpline: 1913 / 0422-2390261.
- Water Supply: Pilloor Phase-I, II & Phase-III 24x7 water supply scheme, Siruvani Water Reservoir, Bhavani River.
- Smart City Projects: Ukkadam Lakefront Re-development, RS Puram Model Road, Smart Bin Monitoring, Micro-composting centers in Vellalore, Smart Streetlights.
- Online Bill Payments: Property Tax (5% early bird rebate available in August), Water Charges, Electricity (TANGEDCO link). Citizens can search by Consumer / Assessment Number.
- Complaint Management: Citizens can file geotagged complaints for Garbage/Sanitation, Water Leaks, Streetlights, Potholes, Drainage Overflow, Illegal Construction, Public Health. Complaints receive unique tracking IDs like CBE-2026-XXXX.
- Emergency Helplines: Police: 100, Ambulance: 108, Fire: 101, CCMC Civic Helpline: 1913, GH Hospital: 0422-2301393.
- Key Locations: CCMC Head Office (Town Hall), Coimbatore Medical College Hospital (GH), RS Puram Police Station, Peelamedu Fire Station, Gandhipuram Bus Stand, Coimbatore Junction Railway Station.

Formatting & Tone:
- Professional, helpful, government-official yet friendly and clear.
- Use bullet points for steps or numbers.
- If asked how to file a complaint or pay a bill, provide direct step-by-step instructions on using the CityConnect Portal buttons!
- Respond concisely (150-250 words max).`;

    const promptText = `User Query: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I am here to assist you with Coimbatore Municipal Corporation services. How can I help you?';

    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini AI API Error:', err);
    res.status(500).json({
      error: 'AI Assistant service temporarily unavailable',
      reply:
        'Hello! I am currently unable to reach the CCMC AI server. You can still use the portal buttons to Pay Bills, Register Complaints, view Emergency Contacts, or explore the City Map!',
    });
  }
});

// ------------------- VITE / STATIC SERVING -------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Coimbatore CityConnect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
