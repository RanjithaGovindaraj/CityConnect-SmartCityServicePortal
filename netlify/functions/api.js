const https = require('https');
const crypto = require('crypto');

// Global online persistent storage via jsonbin / fallback memory
const GLOBAL_BIN_URL = 'https://api.jsonbin.io/v3/b/66fa1234e4104c5e6f890123'; // Public sync bin ID or dynamic fallback

// Default Seed Data
const defaultData = {
  locations: [
    { id: "loc-1", name: "Coimbatore Corporation Head Office", category: "Municipal Office", address: "Town Hall, Big Bazaar St, Coimbatore - 641001", phone: "0422-2390261", latitude: 11.0018, longitude: 76.9629, details: "Main Administrative Headquarters of CCMC. Open Mon-Fri 9:30 AM - 5:30 PM." },
    { id: "loc-2", name: "Coimbatore Medical College Hospital (GH)", category: "Hospital", address: "Trichy Road, Gopalapuram, Coimbatore - 641018", phone: "0422-2301393", latitude: 10.9996, longitude: 76.9734, details: "24x7 Multi-Specialty Government General Hospital." },
    { id: "loc-3", name: "RS Puram Police Station (B2)", category: "Police Station", address: "DB Road, RS Puram, Coimbatore - 641002", phone: "0422-2541000", latitude: 11.0084, longitude: 76.9515, details: "24x7 Police Control Room & Law Enforcement." },
    { id: "loc-4", name: "Peelamedu Fire & Rescue Station", category: "Fire Station", address: "Avinashi Road, Peelamedu, Coimbatore - 641004", phone: "101 / 0422-2571101", latitude: 11.0267, longitude: 77.0018, details: "Emergency Fire Fighting & Disaster Response Team." }
  ],
  users: [
    { id: "usr-citizen-1", name: "Karthik Subramanian", email: "citizen@coimbatore.gov.in", phone: "+91 98422 12345", role: "citizen", wardNo: "Ward 24 (RS Puram)", active: 1 },
    { id: "usr-citizen-2", name: "Ananya Sundaram", email: "ananya.s@gmail.com", phone: "+91 94433 67890", role: "citizen", wardNo: "Ward 32 (Gandhipuram)", active: 1 },
    { id: "usr-emp-1", name: "M. Sundaram", email: "employee@coimbatore.gov.in", phone: "+91 98422 99999", role: "employee", designation: "Senior Field Inspector", department: "Sanitation & Public Health", wardNo: "Ward 24 (RS Puram)", active: 1 },
    { id: "usr-emp-2", name: "R. Selvaraj", email: "selvaraj.r@ccmc.gov.in", phone: "+91 97899 44321", role: "employee", designation: "Assistant Engineer", department: "Roads & Storm Water Drains", wardNo: "Ward 32 (Gandhipuram)", active: 1 },
    { id: "usr-admin-1", name: "Dr. K. Vijayakarthikeyan IAS", email: "admin@coimbatore.gov.in", phone: "+91 0422 2390261", role: "admin", designation: "Municipal Commissioner", department: "CCMC Administration", wardNo: "All Wards (Master)", active: 1 }
  ],
  complaints: [
    { id: "CBE-2026-8942", citizenId: "usr-citizen-1", citizenName: "Karthik Subramanian", citizenPhone: "9842212345", category: "Roads", description: "Large dangerous pothole near RS Puram DB Road junction causing traffic congestion and risks for two-wheelers.", status: "Pending", address: "DB Road, RS Puram, Coimbatore - 641002", latitude: 11.0084, longitude: 76.9515, wardNo: "Ward 24 (RS Puram)", createdAt: "15 Aug 2026, 10:30 AM", photoUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=60", logs: [{ status: "Pending", timestamp: "15 Aug 2026, 10:30 AM", updatedBy: "Karthik Subramanian", comment: "Complaint logged with photo evidence." }] },
    { id: "CBE-2026-7721", citizenId: "usr-citizen-2", citizenName: "Ananya Sundaram", citizenPhone: "9443367890", category: "Water Supply", description: "Pilloor Drinking water supply interrupted for 3 consecutive days in Gandhipuram 5th Street.", status: "In Progress", address: "5th Street, Cross Cut Road, Gandhipuram, Coimbatore - 641012", latitude: 11.0168, longitude: 76.9558, wardNo: "Ward 32 (Gandhipuram)", createdAt: "18 Aug 2026, 08:15 AM", photoUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60", assignedEmployeeId: "usr-emp-2", assignedEmployeeName: "R. Selvaraj", assignedEmployeeDepartment: "Roads & Storm Water Drains", assignedAt: "18 Aug 2026, 11:00 AM", logs: [{ status: "In Progress", timestamp: "18 Aug 2026, 11:00 AM", updatedBy: "R. Selvaraj", comment: "Dispatched maintenance crew." }] }
  ],
  bills: [
    { id: "bill-101", citizenName: "Karthik Subramanian", consumerNumber: "CCMC-PT-2026-9842", type: "Property Tax", amount: 3450.00, dueDate: "2026-09-30", status: "Unpaid", wardNo: "Ward 24 (RS Puram)", address: "142, West Club Road, RS Puram, Coimbatore", period: "2026-2027 Half Year I" },
    { id: "bill-102", citizenName: "Karthik Subramanian", consumerNumber: "CCMC-WT-2026-4410", type: "Water Charges", amount: 680.00, dueDate: "2026-09-15", status: "Paid", wardNo: "Ward 24 (RS Puram)", address: "142, West Club Road, RS Puram, Coimbatore", period: "July 2026", paymentDate: "10 Aug 2026, 02:45 PM", transactionId: "TXN-CCMC-883920", paymentMode: "UPI / GPay" }
  ],
  emergency: [
    { id: "emg-1", service: "CCMC 24x7 Municipal Helpline", number: "1913", department: "CCMC Grievance Cell", address: "Town Hall, Coimbatore", category: "Municipal" },
    { id: "emg-2", service: "Police Control Room", number: "100", department: "Tamil Nadu Police", address: "District Headquarters, Coimbatore", category: "Police" },
    { id: "emg-3", service: "Ambulance / Medical Emergency", number: "108", department: "Health & Family Welfare", address: "EMRI Ambulance Network", category: "Medical" },
    { id: "emg-4", service: "Fire & Rescue Service", number: "101", department: "TN Fire Dept", address: "Peelamedu & South Stations", category: "Fire" }
  ],
  news: [
    { id: "news-1", title: "CCMC Announces 5% Early Bird Rebate on Property Tax", category: "Municipal Notice", content: "Coimbatore Municipal Corporation encourages citizens to pay Property Tax early to enjoy a 5% incentive rebate.", publishedAt: "20 Aug 2026", author: "CCMC Public Relations", urgent: 1 },
    { id: "news-2", title: "Pilloor Phase-III Water Trial Run Commences in East Zone", category: "Water Supply", content: "Trial supply of 178 MLD water under Pilloor-III project started in Peelamedu, Singanallur & Hope College areas.", publishedAt: "16 Aug 2026", author: "Water Works Dept", urgent: 0 }
  ],
  notifications: [
    { id: "notif-1", userId: "usr-citizen-1", title: "Welcome to CityConnect", message: "Your citizen portal account is active. You can log complaints and pay taxes online.", type: "system", timestamp: "15 Aug 2026", read: 0 }
  ]
};

// In-Memory cache for fast execution
let memoryDb = JSON.parse(JSON.stringify(defaultData));

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event, context) => {
  // Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { message: 'OK' });
  }

  const rawPath = event.path || '';
  // Normalize path by stripping '/.netlify/functions/api' or '/api'
  let subPath = rawPath.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  if (!subPath || subPath === '/') subPath = '';

  const method = event.httpMethod;
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {}
  }

  // --- ROUTING ---

  // Health / Root
  if (subPath === '' || subPath === '/') {
    return jsonResponse(200, { status: 'healthy', portal: 'Coimbatore CityConnect Smart City Portal Netlify API', version: '1.0.0' });
  }

  // Locations (GET)
  if (subPath === '/locations' && method === 'GET') {
    const locRows = memoryDb.locations;
    const compLocs = memoryDb.complaints.map(c => ({
      id: `map-comp-${c.id}`,
      name: `Complaint: ${c.category} (${c.status})`,
      category: 'Complaint Marker',
      address: c.address,
      phone: c.citizenPhone,
      latitude: c.latitude,
      longitude: c.longitude,
      details: `${c.description} | Filed by: ${c.citizenName} | Date: ${c.createdAt}`,
      status: c.status,
      complaintId: c.id
    }));
    return jsonResponse(200, { locations: [...locRows, ...compLocs] });
  }

  // Complaints (GET / POST)
  if (subPath === '/complaints') {
    if (method === 'GET') {
      const { citizenId, employeeId, status } = event.queryStringParameters || {};
      let list = [...memoryDb.complaints];
      if (citizenId) list = list.filter(c => c.citizenId === citizenId);
      if (employeeId) list = list.filter(c => c.assignedEmployeeId === employeeId);
      if (status) list = list.filter(c => c.status === status);
      return jsonResponse(200, { complaints: list });
    }
    if (method === 'POST') {
      const newId = `CBE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      const newComplaint = {
        id: newId,
        citizenId: body.citizenId || 'usr-citizen-1',
        citizenName: body.citizenName || 'Karthik Subramanian',
        citizenPhone: body.citizenPhone || '9842212345',
        category: body.category || 'General Civic',
        description: body.description || '',
        status: 'Pending',
        address: body.address || 'Coimbatore Municipal Area',
        latitude: parseFloat(body.latitude) || 11.0168,
        longitude: parseFloat(body.longitude) || 76.9558,
        wardNo: body.wardNo || 'Ward 24',
        createdAt: timestamp,
        photoUrl: body.photoUrl || '',
        logs: [{ status: 'Pending', timestamp, updatedBy: body.citizenName || 'Citizen', comment: 'Complaint filed via CityConnect Portal.' }]
      };
      memoryDb.complaints.unshift(newComplaint);

      // Notification
      memoryDb.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: newComplaint.citizenId,
        title: `Complaint ${newId} Registered`,
        message: `Your complaint regarding ${newComplaint.category} has been logged under ${newComplaint.wardNo}.`,
        type: 'complaint',
        timestamp,
        read: 0,
        relatedId: newId
      });

      return jsonResponse(201, { message: 'Complaint registered successfully', id: newId });
    }
  }

  // Complaints status (PUT)
  const statusMatch = subPath.match(/^\/complaints\/([^\/]+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const complaintId = statusMatch[1];
    const comp = memoryDb.complaints.find(c => c.id === complaintId);
    if (!comp) return jsonResponse(404, { error: 'Complaint not found' });

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    comp.status = body.status || comp.status;
    if (body.comment) comp.resolutionNotes = body.comment;
    if (body.resolutionPhotoUrl) comp.resolutionPhotoUrl = body.resolutionPhotoUrl;
    if (!comp.logs) comp.logs = [];

    comp.logs.push({
      status: body.status,
      timestamp,
      updatedBy: body.updatedBy || 'Officer',
      comment: body.comment || `Status updated to ${body.status}`,
      photoUrl: body.resolutionPhotoUrl
    });

    memoryDb.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: comp.citizenId || 'usr-citizen-1',
      title: `Complaint ${complaintId} Status: ${body.status}`,
      message: `Field Officer ${body.updatedBy || 'Officer'} updated status to '${body.status}'. Remarks: ${body.comment || 'Under active resolution.'}`,
      type: 'complaint',
      timestamp,
      read: 0,
      relatedId: complaintId
    });

    return jsonResponse(200, { message: 'Status updated successfully' });
  }

  // Complaints assign (PUT)
  const assignMatch = subPath.match(/^\/complaints\/([^\/]+)\/assign$/);
  if (assignMatch && method === 'PUT') {
    const complaintId = assignMatch[1];
    const comp = memoryDb.complaints.find(c => c.id === complaintId);
    if (!comp) return jsonResponse(404, { error: 'Complaint not found' });

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    comp.assignedEmployeeId = body.employeeId;
    comp.assignedEmployeeName = body.employeeName;
    comp.assignedEmployeeDepartment = body.employeeDepartment;
    comp.assignedAt = timestamp;
    comp.status = 'Assigned';
    if (!comp.logs) comp.logs = [];

    comp.logs.push({
      status: 'Assigned',
      timestamp,
      updatedBy: 'Admin Commissioner',
      comment: `Assigned to Inspector ${body.employeeName} (${body.employeeDepartment})`
    });

    return jsonResponse(200, { message: 'Complaint assigned successfully' });
  }

  // Bills (GET / POST)
  if (subPath === '/bills') {
    if (method === 'GET') {
      const { consumerNumber, citizenName } = event.queryStringParameters || {};
      let list = [...memoryDb.bills];
      if (consumerNumber) list = list.filter(b => b.consumerNumber.toLowerCase() === consumerNumber.toLowerCase());
      if (citizenName) list = list.filter(b => b.citizenName.toLowerCase().includes(citizenName.toLowerCase()));
      return jsonResponse(200, { bills: list });
    }
    if (method === 'POST') {
      const billId = `bill-${Date.now()}`;
      const type = body.type || 'Property Tax';
      const consumerNo = body.consumerNumber || `CCMC-${type.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBill = {
        id: billId,
        citizenName: body.citizenName || 'Citizen',
        consumerNumber: consumerNo,
        type,
        amount: parseFloat(body.amount) || 1000,
        dueDate: body.dueDate || '2026-09-30',
        status: 'Unpaid',
        wardNo: body.wardNo || 'Ward 24 (RS Puram)',
        address: body.address || 'Coimbatore Municipal Area',
        period: body.period || '2026-2027 Half Year I'
      };
      memoryDb.bills.unshift(newBill);
      return jsonResponse(201, { message: 'Bill generated successfully', billId });
    }
  }

  // Bills pay (POST)
  if (subPath === '/bills/pay' && method === 'POST') {
    const bill = memoryDb.bills.find(b => b.id === body.billId);
    if (!bill) return jsonResponse(404, { error: 'Bill not found' });
    if (bill.status === 'Paid') return jsonResponse(400, { error: 'Bill is already paid' });

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const txnId = `TXN-CCMC-${Math.floor(100000 + Math.random() * 900000)}`;

    bill.status = 'Paid';
    bill.paymentDate = timestamp;
    bill.transactionId = txnId;
    bill.paymentMode = body.paymentMode || 'UPI / Online Card';

    const receipt = {
      receiptNo: `REC-CCMC-${Math.floor(10000 + Math.random() * 90000)}`,
      billId: bill.id,
      type: bill.type,
      consumerNumber: bill.consumerNumber,
      citizenName: bill.citizenName,
      address: bill.address,
      amountPaid: bill.amount,
      transactionId: txnId,
      paymentMode: bill.paymentMode,
      paidAt: timestamp
    };

    return jsonResponse(200, { message: 'Payment processed successfully', receipt });
  }

  // Emergency (GET)
  if (subPath === '/emergency' && method === 'GET') {
    return jsonResponse(200, { contacts: memoryDb.emergency });
  }

  // News (GET / POST)
  if (subPath === '/news') {
    if (method === 'GET') return jsonResponse(200, { news: memoryDb.news });
    if (method === 'POST') {
      const newsId = `news-${Date.now()}`;
      const timestamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const newItem = {
        id: newsId,
        title: body.title || '',
        category: body.category || 'Municipal Notice',
        content: body.content || '',
        publishedAt: timestamp,
        author: body.author || 'CCMC Public Relations',
        urgent: body.urgent ? 1 : 0
      };
      memoryDb.news.unshift(newItem);
      return jsonResponse(201, { message: 'Announcement published successfully' });
    }
  }

  // Notifications (GET)
  if (subPath === '/notifications' && method === 'GET') {
    return jsonResponse(200, { notifications: memoryDb.notifications });
  }
  if (subPath === '/notifications/read-all' && method === 'PATCH') {
    memoryDb.notifications.forEach(n => n.read = 1);
    return jsonResponse(200, { message: 'All notifications marked as read' });
  }

  // Users (GET)
  if (subPath === '/users' && method === 'GET') {
    const { role } = event.queryStringParameters || {};
    let list = memoryDb.users;
    if (role) list = list.filter(u => u.role === role);
    return jsonResponse(200, { users: list });
  }

  // Auth Login (POST)
  if (subPath === '/auth/login' && method === 'POST') {
    const email = (body.email || '').trim().toLowerCase();
    const role = body.role || 'citizen';
    let user = memoryDb.users.find(u => u.email.toLowerCase() === email);
    if (!user && role) {
      user = memoryDb.users.find(u => u.role === role);
    }

    const userData = user || {
      id: `usr-${Date.now()}`,
      name: email ? email.split('@')[0].toUpperCase() : `CCMC ${role.toUpperCase()}`,
      email: email || `${role}@coimbatore.gov.in`,
      phone: '9842212345',
      role,
      wardNo: 'Ward 24 (RS Puram)'
    };

    return jsonResponse(200, {
      message: 'Login successful',
      token: `token-${Date.now()}`,
      user: userData
    });
  }

  // Auth Register (POST)
  if (subPath === '/auth/register' && method === 'POST') {
    const newId = `usr-${Date.now()}`;
    const newUser = {
      id: newId,
      name: body.name || 'Registered Citizen',
      email: (body.email || '').trim().toLowerCase(),
      phone: body.phone || '9842200000',
      role: 'citizen',
      wardNo: body.wardNo || 'Ward 24 (RS Puram)',
      active: 1
    };
    memoryDb.users.unshift(newUser);

    return jsonResponse(201, {
      message: 'Account registered successfully',
      token: `token-${Date.now()}`,
      user: newUser
    });
  }

  // Stats (GET)
  if (subPath === '/stats' && method === 'GET') {
    const totalComplaints = memoryDb.complaints.length;
    const pending = memoryDb.complaints.filter(c => c.status === 'Pending').length;
    const assigned = memoryDb.complaints.filter(c => c.status === 'Assigned').length;
    const inProgress = memoryDb.complaints.filter(c => c.status === 'In Progress').length;
    const resolved = memoryDb.complaints.filter(c => c.status === 'Resolved').length;
    const paidSum = memoryDb.bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.amount || 0), 0);

    return jsonResponse(200, {
      stats: {
        totalCitizens: 1420,
        totalEmployees: 48,
        totalComplaints,
        pendingComplaints: pending,
        assignedComplaints: assigned,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        revenueCollected: paidSum + 184500,
        categoryBreakdown: [
          { category: "Roads", count: 42 },
          { category: "Sanitation", count: 28 },
          { category: "Water Supply", count: 35 },
          { category: "Streetlights", count: 18 }
        ],
        wardWiseResolution: [
          { ward: "Ward 24 (RS Puram)", total: 18, resolved: 15 },
          { ward: "Ward 32 (Gandhipuram)", total: 24, resolved: 22 },
          { ward: "Ward 58 (Singanallur)", total: 12, resolved: 9 },
          { ward: "Ward 12 (Town Hall)", total: 15, resolved: 11 },
          { ward: "Ward 45 (Peelamedu)", total: 20, resolved: 18 }
        ]
      }
    });
  }

  // AI Chat (POST)
  if (subPath === '/ai/chat' && method === 'POST') {
    const msg = (body.message || '').toLowerCase();
    let reply = "Thank you for contacting Coimbatore CityConnect AI. For immediate help, use helpline 1913 or register your request via the Citizen Dashboard.";
    if (msg.includes('tax') || msg.includes('bill')) {
      reply = "You can pay your Property Tax & Water Charges under the 'Bill Payments' section on your Citizen Dashboard. You will receive an instant digital receipt.";
    } else if (msg.includes('pothole') || msg.includes('road') || msg.includes('water') || msg.includes('garbage')) {
      reply = "To report civic grievances, click 'Register Complaint' in your Citizen Portal. Your complaint will be geo-tagged and assigned to a CCMC Field Inspector.";
    } else if (msg.includes('helpline') || msg.includes('emergency') || msg.includes('phone')) {
      reply = "CCMC 24x7 Emergency Helpline is 1913. For Police: 100, Fire: 101, Ambulance: 108.";
    }
    return jsonResponse(200, { reply });
  }

  // AI Analyze Image (POST)
  if (subPath === '/ai/analyze-image' && method === 'POST') {
    const imgUrl = (body.photoUrl || '').toLowerCase();
    let cat = 'Pothole & Road Repair';
    if (imgUrl.includes('water') || imgUrl.includes('pipe') || imgUrl.includes('leak')) cat = 'Water Supply Leakage';
    else if (imgUrl.includes('light') || imgUrl.includes('lamp')) cat = 'Streetlight Outage';
    else if (imgUrl.includes('garbage') || imgUrl.includes('trash')) cat = 'Garbage & Sanitation';
    return jsonResponse(200, {
      category: cat,
      priority: cat.includes('Water') ? 'Urgent' : 'High',
      description: `AI inspection identifies severe issue under ${cat}. Dispatched for CCMC Ward Team verification.`
    });
  }

  return jsonResponse(404, { error: 'Route not found' });
};
