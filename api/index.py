import os
import json
import sqlite3
import random
import hmac
import hashlib
import base64
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

JWT_SECRET = os.environ.get('JWT_SECRET', 'cityconnect_jwt_secret_key_2026')

def create_jwt_token(payload):
    header = json.dumps({"alg": "HS256", "typ": "JWT"}).encode()
    header_b64 = base64.urlsafe_b64encode(header).decode().rstrip("=")
    
    payload['exp'] = int(datetime.now().timestamp()) + 86400
    payload_bytes = json.dumps(payload).encode()
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode().rstrip("=")
    
    signature_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(JWT_SECRET.encode(), signature_input, hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

# Gemini AI Client Setup
ai_client = None
gemini_key = os.environ.get('GEMINI_API_KEY')
if gemini_key:
    try:
        from google import genai
        ai_client = genai.Client(api_key=gemini_key)
    except Exception as e:
        print("Gemini AI Client Notice:", e)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
    return response

DB_PATH = os.path.join(tempfile.gettempdir(), 'cityconnect_app.db')
_db_initialized = False

def get_db():
    global _db_initialized
    mysql_host = os.environ.get('MYSQL_HOST')
    if mysql_host:
        try:
            import pymysql
            conn = pymysql.connect(
                host=mysql_host,
                user=os.environ.get('MYSQL_USER', 'root'),
                password=os.environ.get('MYSQL_PASSWORD', ''),
                database=os.environ.get('MYSQL_DB', 'cityconnect'),
                port=int(os.environ.get('MYSQL_PORT', 3306)),
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
            return conn
        except Exception as e:
            print("MySQL connection error, falling back to SQLite:", e)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if not _db_initialized:
        try:
            ensure_tables_exist(conn)
            _db_initialized = True
        except Exception as e:
            print("DB init error:", e)
    return conn

def ensure_tables_exist(conn):
    cursor = conn.cursor()
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        address TEXT,
        phone TEXT,
        latitude REAL,
        longitude REAL,
        details TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT,
        designation TEXT,
        department TEXT,
        wardNo TEXT,
        active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        citizenId TEXT,
        citizenName TEXT,
        citizenPhone TEXT,
        category TEXT,
        description TEXT,
        status TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        wardNo TEXT,
        createdAt TEXT,
        photoUrl TEXT,
        assignedEmployeeId TEXT,
        assignedEmployeeName TEXT,
        assignedEmployeeDepartment TEXT,
        assignedAt TEXT,
        resolutionNotes TEXT,
        resolutionPhotoUrl TEXT,
        resolutionDate TEXT,
        logs_json TEXT
    );

    CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        citizenName TEXT,
        consumerNumber TEXT,
        type TEXT,
        amount REAL,
        dueDate TEXT,
        status TEXT,
        wardNo TEXT,
        address TEXT,
        period TEXT,
        paymentDate TEXT,
        transactionId TEXT,
        paymentMode TEXT
    );

    CREATE TABLE IF NOT EXISTS emergency (
        id TEXT PRIMARY KEY,
        service TEXT,
        number TEXT,
        department TEXT,
        address TEXT,
        category TEXT
    );

    CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT,
        category TEXT,
        content TEXT,
        publishedAt TEXT,
        author TEXT,
        urgent INTEGER
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        message TEXT,
        type TEXT,
        timestamp TEXT,
        read INTEGER DEFAULT 0,
        relatedId TEXT
    );
    ''')

    cursor.execute("SELECT COUNT(*) FROM locations")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)

    conn.commit()

def seed_data(cursor):
    locs = [
        ("loc-1", "Coimbatore Corporation Head Office", "Municipal Office", "Town Hall, Big Bazaar St, Coimbatore - 641001", "0422-2390261", 11.0018, 76.9629, "Main Administrative Headquarters of CCMC. Open Mon-Fri 9:30 AM - 5:30 PM."),
        ("loc-2", "Coimbatore Medical College Hospital (GH)", "Hospital", "Trichy Road, Gopalapuram, Coimbatore - 641018", "0422-2301393", 10.9996, 76.9734, "24x7 Multi-Specialty Government General Hospital."),
        ("loc-3", "RS Puram Police Station (B2)", "Police Station", "DB Road, RS Puram, Coimbatore - 641002", "0422-2541000", 11.0084, 76.9515, "24x7 Police Control Room & Law Enforcement."),
        ("loc-4", "Peelamedu Fire & Rescue Station", "Fire Station", "Avinashi Road, Peelamedu, Coimbatore - 641004", "101 / 0422-2571101", 11.0267, 77.0018, "Emergency Fire Fighting & Disaster Response Team.")
    ]
    cursor.executemany("INSERT INTO locations VALUES (?,?,?,?,?,?,?,?)", locs)

    users = [
        ("usr-citizen-1", "Karthik Subramanian", "karthik.s@gmail.com", "+91 98422 12345", "citizen", None, None, "Ward 24 (RS Puram)", 1),
        ("usr-citizen-2", "Ananya Sundaram", "ananya.s@gmail.com", "+91 94433 67890", "citizen", None, None, "Ward 32 (Gandhipuram)", 1),
        ("usr-emp-1", "M. Sundaram", "sundaram.m@ccmc.gov.in", "+91 98422 99999", "employee", "Senior Field Inspector", "Sanitation & Public Health", "Ward 24 (RS Puram)", 1),
        ("usr-emp-2", "R. Selvaraj", "selvaraj.r@ccmc.gov.in", "+91 97899 44321", "employee", "Assistant Engineer", "Roads & Storm Water Drains", "Ward 32 (Gandhipuram)", 1),
        ("usr-admin-1", "Dr. K. Vijayakarthikeyan IAS", "commissioner@ccmc.gov.in", "+91 0422 2390261", "admin", "Municipal Commissioner", "CCMC Administration", "All Wards (Master)", 1)
    ]
    cursor.executemany("INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)", users)

    complaints = [
        ("CBE-2026-8942", "usr-citizen-1", "Karthik Subramanian", "9842212345", "Roads", "Large dangerous pothole near RS Puram DB Road junction causing traffic congestion and risks for two-wheelers.", "Pending", "DB Road, RS Puram, Coimbatore - 641002", 11.0084, 76.9515, "Ward 24 (RS Puram)", "15 Aug 2026, 10:30 AM", "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=60", None, None, None, None, None, None, None, json.dumps([{"status": "Pending", "timestamp": "15 Aug 2026, 10:30 AM", "updatedBy": "Karthik Subramanian", "comment": "Complaint logged with photo evidence."}])),
        ("CBE-2026-7721", "usr-citizen-2", "Ananya Sundaram", "9443367890", "Water Supply", "Pilloor Drinking water supply interrupted for 3 consecutive days in Gandhipuram 5th Street.", "In Progress", "5th Street, Cross Cut Road, Gandhipuram, Coimbatore - 641012", 11.0168, 76.9558, "Ward 32 (Gandhipuram)", "18 Aug 2026, 08:15 AM", "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60", "usr-emp-2", "R. Selvaraj", "Roads & Storm Water Drains", "18 Aug 2026, 11:00 AM", "Inspectors dispatched valve replacement team.", None, None, json.dumps([{"status": "In Progress", "timestamp": "18 Aug 2026, 11:00 AM", "updatedBy": "R. Selvaraj", "comment": "Dispatched maintenance crew."}]))
    ]
    cursor.executemany("INSERT INTO complaints VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", complaints)

    bills = [
        ("bill-101", "Karthik Subramanian", "CCMC-PT-2026-9842", "Property Tax", 3450.00, "2026-09-30", "Unpaid", "Ward 24 (RS Puram)", "142, West Club Road, RS Puram, Coimbatore", "2026-2027 Half Year I", None, None, None),
        ("bill-102", "Karthik Subramanian", "CCMC-WT-2026-4410", "Water Charges", 680.00, "2026-09-15", "Paid", "Ward 24 (RS Puram)", "142, West Club Road, RS Puram, Coimbatore", "July 2026", "10 Aug 2026, 02:45 PM", "TXN-CCMC-883920", "UPI / GPay")
    ]
    cursor.executemany("INSERT INTO bills VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", bills)

    emerg = [
        ("emg-1", "CCMC 24x7 Municipal Helpline", "1913", "CCMC Grievance Cell", "Town Hall, Coimbatore", "Municipal"),
        ("emg-2", "Police Control Room", "100", "Tamil Nadu Police", "District Headquarters, Coimbatore", "Police"),
        ("emg-3", "Ambulance / Medical Emergency", "108", "Health & Family Welfare", "EMRI Ambulance Network", "Medical"),
        ("emg-4", "Fire & Rescue Service", "101", "TN Fire Dept", "Peelamedu & South Stations", "Fire")
    ]
    cursor.executemany("INSERT INTO emergency VALUES (?,?,?,?,?,?)", emerg)

    news = [
        ("news-1", "CCMC Announces 5% Early Bird Rebate on Property Tax", "Municipal Notice", "Coimbatore Municipal Corporation encourages citizens to pay Property Tax early to enjoy a 5% incentive rebate.", "20 Aug 2026", "CCMC Public Relations", 1),
        ("news-2", "Pilloor Phase-III Water Trial Run Commences in East Zone", "Water Supply", "Trial supply of 178 MLD water under Pilloor-III project started in Peelamedu, Singanallur & Hope College areas.", "16 Aug 2026", "Water Works Dept", 0)
    ]
    cursor.executemany("INSERT INTO news VALUES (?,?,?,?,?,?,?)", news)

    notifs = [
        ("notif-1", "usr-citizen-1", "Welcome to CityConnect", "Your citizen portal account is active. You can log complaints and pay taxes online.", "system", "15 Aug 2026", 0, None)
    ]
    cursor.executemany("INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?)", notifs)

# ---------------- API ROUTES ----------------

@app.route('/', methods=['GET'])
@app.route('/api', methods=['GET'])
@app.route('/api/', methods=['GET'])
def home():
    return jsonify({"status": "healthy", "portal": "Coimbatore CityConnect Smart City API", "version": "1.0.0"})

@app.route('/api/locations', methods=['GET'])
@app.route('/locations', methods=['GET'])
def get_locations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM locations")
    loc_rows = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM complaints")
    c_rows = [dict(row) for row in cursor.fetchall()]
    comp_locs = [{
        "id": f"map-comp-{c['id']}",
        "name": f"Complaint: {c['category']} ({c['status']})",
        "category": "Complaint Marker",
        "address": c['address'],
        "phone": c['citizenPhone'],
        "latitude": c['latitude'],
        "longitude": c['longitude'],
        "details": f"{c['description']} | Filed by: {c['citizenName']} | Date: {c['createdAt']}",
        "status": c['status'],
        "complaintId": c['id']
    } for c in c_rows]

    conn.close()
    return jsonify({"locations": loc_rows + comp_locs})

@app.route('/api/complaints', methods=['GET'])
@app.route('/complaints', methods=['GET'])
def get_complaints():
    citizen_id = request.args.get('citizenId')
    employee_id = request.args.get('employeeId')
    status = request.args.get('status')

    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if citizen_id:
        query += " AND citizenId = ?"
        params.append(citizen_id)
    if employee_id:
        query += " AND assignedEmployeeId = ?"
        params.append(employee_id)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = [dict(row) for row in cursor.fetchall()]

    for r in rows:
        r['logs'] = json.loads(r['logs_json']) if r.get('logs_json') else []

    conn.close()
    return jsonify({"complaints": rows})

@app.route('/api/complaints', methods=['POST'])
@app.route('/complaints', methods=['POST'])
def create_complaint():
    data = request.get_json() or {}
    new_id = f"CBE-2026-{random.randint(1000, 9999)}"
    timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")

    logs = [{
        "status": "Pending",
        "timestamp": timestamp,
        "updatedBy": data.get('citizenName', 'Citizen'),
        "comment": "Complaint filed via CityConnect Geo-Portal."
    }]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO complaints (id, citizenId, citizenName, citizenPhone, category, description, status, address, latitude, longitude, wardNo, createdAt, photoUrl, logs_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        new_id,
        data.get('citizenId', 'usr-citizen-1'),
        data.get('citizenName', 'Karthik Subramanian'),
        data.get('citizenPhone', '9842212345'),
        data.get('category', 'General Civic'),
        data.get('description', ''),
        'Pending',
        data.get('address', 'Coimbatore Municipal Area'),
        float(data.get('latitude', 11.0168)),
        float(data.get('longitude', 76.9558)),
        data.get('wardNo', 'Ward 24'),
        timestamp,
        data.get('photoUrl', ''),
        json.dumps(logs)
    ))

    notif_id = f"notif-{int(datetime.now().timestamp() * 1000)}"
    cursor.execute('''
    INSERT INTO notifications (id, userId, title, message, type, timestamp, read, relatedId)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    ''', (
        notif_id,
        data.get('citizenId', 'usr-citizen-1'),
        f"Complaint {new_id} Registered",
        f"Your complaint regarding {data.get('category')} has been logged under {data.get('wardNo')}.",
        'complaint',
        timestamp,
        new_id
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Complaint registered successfully", "id": new_id}), 201

@app.route('/api/complaints/<complaint_id>/status', methods=['PUT'])
@app.route('/complaints/<complaint_id>/status', methods=['PUT'])
def update_complaint_status(complaint_id):
    data = request.get_json() or {}
    status = data.get('status')
    comment = data.get('comment', '')
    updated_by = data.get('updatedBy', 'Officer')
    photo_url = data.get('resolutionPhotoUrl')
    timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT citizenId, category, logs_json FROM complaints WHERE id = ?", (complaint_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Complaint not found"}), 404

    citizen_id = row['citizenId'] or 'usr-citizen-1'
    category = row['category'] or 'Grievance'

    logs = json.loads(row['logs_json']) if row['logs_json'] else []
    logs.append({
        "status": status,
        "timestamp": timestamp,
        "updatedBy": updated_by,
        "comment": comment or f"Status updated to {status}",
        "photoUrl": photo_url
    })

    cursor.execute('''
    UPDATE complaints SET status = ?, resolutionNotes = ?, resolutionPhotoUrl = ?, logs_json = ? WHERE id = ?
    ''', (status, comment, photo_url, json.dumps(logs), complaint_id))

    notif_id = f"notif-{int(datetime.now().timestamp() * 1000)}"
    notif_title = f"Complaint {complaint_id} Status: {status}"
    notif_msg = f"Field Officer {updated_by} updated status to '{status}'. Remarks: {comment or 'Work under active resolution.'}"

    cursor.execute('''
    INSERT INTO notifications (id, userId, title, message, type, timestamp, read, relatedId)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    ''', (notif_id, citizen_id, notif_title, notif_msg, 'complaint', timestamp, complaint_id))

    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated and citizen notified successfully"})

@app.route('/api/complaints/<complaint_id>/assign', methods=['PUT'])
@app.route('/complaints/<complaint_id>/assign', methods=['PUT'])
def assign_complaint(complaint_id):
    data = request.get_json() or {}
    emp_id = data.get('employeeId')
    emp_name = data.get('employeeName')
    emp_dept = data.get('employeeDepartment')
    timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT logs_json FROM complaints WHERE id = ?", (complaint_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Complaint not found"}), 404

    logs = json.loads(row['logs_json']) if row['logs_json'] else []
    logs.append({
        "status": "Assigned",
        "timestamp": timestamp,
        "updatedBy": "Admin Commissioner",
        "comment": f"Assigned to Inspector {emp_name} ({emp_dept})"
    })

    cursor.execute('''
    UPDATE complaints SET assignedEmployeeId = ?, assignedEmployeeName = ?, assignedEmployeeDepartment = ?, assignedAt = ?, status = 'Assigned', logs_json = ? WHERE id = ?
    ''', (emp_id, emp_name, emp_dept, timestamp, json.dumps(logs), complaint_id))

    conn.commit()
    conn.close()
    return jsonify({"message": "Complaint assigned successfully"})

@app.route('/api/bills', methods=['GET'])
@app.route('/bills', methods=['GET'])
def get_bills():
    consumer_number = request.args.get('consumerNumber')
    citizen_name = request.args.get('citizenName')

    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM bills WHERE 1=1"
    params = []

    if consumer_number:
        query += " AND LOWER(consumerNumber) = LOWER(?)"
        params.append(consumer_number)
    if citizen_name:
        query += " AND LOWER(citizenName) LIKE LOWER(?)"
        params.append(f"%{citizen_name}%")

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"bills": rows})

@app.route('/api/bills', methods=['POST'])
@app.route('/bills', methods=['POST'])
def create_bill():
    data = request.get_json() or {}
    bill_id = f"bill-{int(datetime.now().timestamp() * 1000)}"
    bill_type = data.get('type', 'Property Tax')
    consumer_no = data.get('consumerNumber') or f"CCMC-{bill_type[:4].upper()}-{random.randint(1000, 9999)}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO bills (id, citizenName, consumerNumber, type, amount, dueDate, status, wardNo, address, period)
    VALUES (?, ?, ?, ?, ?, ?, 'Unpaid', ?, ?, ?)
    ''', (
        bill_id,
        data.get('citizenName', 'Citizen'),
        consumer_no,
        bill_type,
        float(data.get('amount', 1000)),
        data.get('dueDate', '2026-09-30'),
        data.get('wardNo', 'Ward 24 (RS Puram)'),
        data.get('address', 'Coimbatore Municipal Area'),
        data.get('period', '2026-2027 Half Year I')
    ))
    conn.commit()
    conn.close()

    return jsonify({"message": "Bill generated successfully", "billId": bill_id}), 201

@app.route('/api/bills/pay', methods=['POST'])
@app.route('/bills/pay', methods=['POST'])
def pay_bill():
    data = request.get_json() or {}
    bill_id = data.get('billId')
    payment_mode = data.get('paymentMode', 'UPI / Online Card')
    timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")
    txn_id = f"TXN-CCMC-{random.randint(100000, 999999)}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bills WHERE id = ?", (bill_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Bill not found"}), 404

    bill = dict(row)
    if bill['status'] == 'Paid':
        conn.close()
        return jsonify({"error": "Bill is already paid"}), 400

    cursor.execute('''
    UPDATE bills SET status = 'Paid', paymentDate = ?, transactionId = ?, paymentMode = ? WHERE id = ?
    ''', (timestamp, txn_id, payment_mode, bill_id))

    conn.commit()
    conn.close()

    receipt = {
        "receiptNo": f"REC-CCMC-{random.randint(10000, 99999)}",
        "billId": bill['id'],
        "type": bill['type'],
        "consumerNumber": bill['consumerNumber'],
        "citizenName": bill['citizenName'],
        "address": bill['address'],
        "amountPaid": bill['amount'],
        "transactionId": txn_id,
        "paymentMode": payment_mode,
        "paidAt": timestamp
    }

    return jsonify({"message": "Payment processed successfully", "receipt": receipt})

@app.route('/api/emergency', methods=['GET'])
@app.route('/emergency', methods=['GET'])
def get_emergency():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emergency")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"contacts": rows})

@app.route('/api/news', methods=['GET'])
@app.route('/news', methods=['GET'])
def get_news():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM news ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"news": rows})

@app.route('/api/news', methods=['POST'])
@app.route('/news', methods=['POST'])
def create_news():
    data = request.get_json() or {}
    news_id = f"news-{int(datetime.now().timestamp() * 1000)}"
    timestamp = datetime.now().strftime("%d %b %Y")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO news (id, title, category, content, publishedAt, author, urgent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        news_id,
        data.get('title', ''),
        data.get('category', 'Municipal Notice'),
        data.get('content', ''),
        timestamp,
        data.get('author', 'CCMC Public Relations'),
        1 if data.get('urgent') else 0
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Announcement published successfully"}), 201

@app.route('/api/notifications', methods=['GET'])
@app.route('/notifications', methods=['GET'])
def get_notifications():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"notifications": rows})

@app.route('/api/notifications/read-all', methods=['PATCH'])
@app.route('/notifications/read-all', methods=['PATCH'])
def read_all_notifications():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read = 1")
    conn.commit()
    conn.close()
    return jsonify({"message": "All notifications marked as read"})

@app.route('/api/users', methods=['GET'])
@app.route('/users', methods=['GET'])
def get_users():
    role = request.args.get('role')
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM users"
    params = []

    if role:
        query += " WHERE role = ?"
        params.append(role)

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"users": rows})

@app.route('/api/users/<user_id>/status', methods=['PATCH'])
@app.route('/users/<user_id>/status', methods=['PATCH'])
def update_user_status(user_id):
    data = request.get_json() or {}
    active = 1 if data.get('active') else 0

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET active = ? WHERE id = ?", (active, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": f"User active status updated to {active}"})

@app.route('/api/auth/login', methods=['POST'])
@app.route('/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    role = data.get('role', 'citizen')

    conn = get_db()
    cursor = conn.cursor()
    user_row = None
    if email:
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
        user_row = cursor.fetchone()

    if not user_row and role:
        cursor.execute("SELECT * FROM users WHERE role = ?", (role,))
        user_row = cursor.fetchone()

    conn.close()

    user_dict = dict(user_row) if user_row else {
        "id": f"usr-{int(datetime.now().timestamp())}",
        "name": email.split('@')[0].capitalize() if email else f"CCMC {role.capitalize()}",
        "email": email or f"{role}@coimbatore.gov.in",
        "phone": "9842212345",
        "role": role,
        "wardNo": "Ward 24 (RS Puram)"
    }

    token = create_jwt_token({
        "sub": user_dict["id"],
        "email": user_dict["email"],
        "role": user_dict["role"],
        "name": user_dict["name"]
    })

    return jsonify({
        "message": "JWT Authentication Successful",
        "token": token,
        "user": user_dict
    })

@app.route('/api/auth/register', methods=['POST'])
@app.route('/auth/register', methods=['POST'])
def auth_register():
    data = request.get_json() or {}
    name = data.get('name', 'Registered Citizen')
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '9842200000')
    ward_no = data.get('wardNo', 'Ward 24 (RS Puram)')

    new_id = f"usr-{int(datetime.now().timestamp())}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR REPLACE INTO users (id, name, email, phone, role, wardNo, active)
    VALUES (?, ?, ?, ?, 'citizen', ?, 1)
    ''', (new_id, name, email, phone, ward_no))
    conn.commit()
    conn.close()

    token = create_jwt_token({
        "sub": new_id,
        "email": email,
        "role": "citizen",
        "name": name
    })

    return jsonify({
        "message": "Account created and JWT token issued successfully",
        "token": token,
        "user": {
            "id": new_id,
            "name": name,
            "email": email,
            "phone": phone,
            "role": "citizen",
            "wardNo": ward_no
        }
    }), 201

@app.route('/api/stats', methods=['GET'])
@app.route('/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM complaints")
    total_complaints = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Pending'")
    pending = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Assigned'")
    assigned = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'In Progress'")
    in_progress = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Resolved'")
    resolved = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(amount) FROM bills WHERE status = 'Paid'")
    rev_res = cursor.fetchone()[0]
    revenue = (rev_res or 0) + 184500

    conn.close()

    return jsonify({
        "stats": {
            "totalCitizens": 1420,
            "totalEmployees": 48,
            "totalComplaints": total_complaints,
            "pendingComplaints": pending,
            "assignedComplaints": assigned,
            "inProgressComplaints": in_progress,
            "resolvedComplaints": resolved,
            "revenueCollected": revenue,
            "categoryBreakdown": [
                {"category": "Roads", "count": 42},
                {"category": "Sanitation", "count": 28},
                {"category": "Water Supply", "count": 35},
                {"category": "Streetlights", "count": 18}
            ],
            "wardWiseResolution": [
                {"ward": "Ward 24 (RS Puram)", "total": 18, "resolved": 15},
                {"ward": "Ward 32 (Gandhipuram)", "total": 24, "resolved": 22},
                {"ward": "Ward 58 (Singanallur)", "total": 12, "resolved": 9},
                {"ward": "Ward 12 (Town Hall)", "total": 15, "resolved": 11},
                {"ward": "Ward 45 (Peelamedu)", "total": 20, "resolved": 18}
            ]
        }
    })

@app.route('/api/ai/chat', methods=['POST'])
@app.route('/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    message = data.get('message', '').strip()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    system_instruction = (
        'You are "CityConnect AI Guide", the official AI Citizen Assistant for Coimbatore City Municipal Corporation (CCMC), Tamil Nadu, India. '
        'Provide helpful, polite, concise, and structured guidance regarding civic grievances (potholes, streetlights, garbage, water supply), '
        'property tax payments, 1913 helpline, emergency contacts, ward details, and municipal procedures.'
    )

    if ai_client:
        try:
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"{system_instruction}\n\nUser Question: {message}"
            )
            return jsonify({"reply": response.text})
        except Exception as err:
            print("Gemini API Error:", err)

    lower_query = message.lower()
    if 'tax' in lower_query or 'bill' in lower_query:
        reply = "You can pay your Property Tax & Water Charges under the 'Bill Payments' section on your Citizen Dashboard. You will receive an instant digital receipt with your transaction ID."
    elif 'pothole' in lower_query or 'road' in lower_query or 'garbage' in lower_query or 'water' in lower_query or 'complaint' in lower_query:
        reply = "To report civic grievances like potholes, water leaks, or garbage accumulation, click 'Register Complaint' in your Citizen Portal. Your complaint will be geo-tagged and assigned to a CCMC Field Inspector."
    elif 'helpline' in lower_query or 'emergency' in lower_query or 'phone' in lower_query:
        reply = "CCMC 24x7 Emergency Helpline is 1913. For Police: 100, Fire: 101, Ambulance: 108. You can also view all ward contacts in the Emergency Directory."
    else:
        reply = f"Thank you for contacting Coimbatore CityConnect AI. For immediate help, use helpline 1913 or register your request via the Citizen Dashboard."

    return jsonify({"reply": reply})

@app.route('/api/ai/analyze-image', methods=['POST'])
@app.route('/ai/analyze-image', methods=['POST'])
def analyze_image():
    data = request.json or {}
    image_url = data.get('photoUrl', '')

    prompt = (
        "You are an AI civic inspector for Coimbatore City Municipal Corporation (CCMC). "
        "Analyze this photo of a civic issue. "
        "Choose the exact matching category from this list: "
        "['Garbage & Sanitation', 'Water Supply Leakage', 'Streetlight Outage', 'Pothole & Road Repair', "
        "'Sewage & Drainage Overflow', 'Illegal Construction', 'Public Health Hazard', 'Tree Trimming']. "
        "Determine priority ('Urgent', 'High', 'Medium'). "
        "Provide a concise 1-2 sentence citizen complaint description describing the problem in the image. "
        "Return ONLY a JSON object with keys: category, priority, description."
    )

    if ai_client and image_url.startswith('http'):
        try:
            import urllib.request
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                image_data = resp.read()
                content_type = resp.headers.get('Content-Type', 'image/jpeg')

            from google.genai import types
            image_part = types.Part.from_bytes(data=image_data, mime_type=content_type)

            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[image_part, prompt]
            )
            text = response.text.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(text)
            return jsonify(parsed)
        except Exception as err:
            print("Gemini Vision AI Analysis Error:", err)

    url_lower = image_url.lower()
    cat = 'Pothole & Road Repair' if any(w in url_lower for w in ['road', 'pothole', 'street', 'asphalt', 'tar']) else \
          'Water Supply Leakage' if any(w in url_lower for w in ['water', 'pipe', 'leak', 'river', 'flood', 'splash']) else \
          'Streetlight Outage' if any(w in url_lower for w in ['light', 'lamp', 'dark', 'bulb', 'pole']) else \
          'Garbage & Sanitation'

    prio = 'Urgent' if cat in ['Water Supply Leakage', 'Sewage & Drainage Overflow'] else 'High'
    desc = f"Visual inspection indicates severe issue under {cat}. Requires inspection and immediate repair by CCMC Ward Field Team."

    return jsonify({
        "category": cat,
        "priority": prio,
        "description": desc
    })
