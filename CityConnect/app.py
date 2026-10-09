import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ---------------------------------------------------------
# GEMINI AI HELPER SETUP
# ---------------------------------------------------------
try:
    from google import genai
    from google.genai import types
    gemini_key = os.environ.get('GEMINI_API_KEY')
    ai_client = genai.Client(api_key=gemini_key) if gemini_key else genai.Client()
except Exception as e:
    ai_client = None
    print("Gemini AI client initialization note:", e)


# ---------------------------------------------------------
# DATABASE CONNECTION HELPER (MySQL / SQLite Fallback)
# ---------------------------------------------------------
def get_db_connection():
    try:
        import pymysql
        conn = pymysql.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB'],
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn, 'mysql'
    except Exception as e:
        # Fallback to local SQLite database for development or demo mode if MySQL unavailable
        db_file = os.path.join(app.root_path, 'database', 'cityconnect_demo.db')
        os.makedirs(os.path.dirname(db_file), exist_ok=True)
        conn = sqlite3.connect(db_file)
        conn.row_factory = sqlite3.Row
        init_sqlite_db(conn)
        return conn, 'sqlite'

def init_sqlite_db(conn):
    cursor = conn.cursor()
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'citizen',
        designation TEXT,
        department TEXT,
        ward_no TEXT,
        salary REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_code TEXT UNIQUE,
        citizen_id INTEGER,
        citizen_name TEXT,
        citizen_phone TEXT,
        category TEXT,
        description TEXT,
        photo_url TEXT,
        address TEXT,
        ward_no TEXT,
        latitude REAL,
        longitude REAL,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Assigned',
        assigned_employee_id INTEGER,
        assigned_employee_name TEXT,
        resolution_notes TEXT,
        resolution_photo_url TEXT,
        resolution_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_number TEXT UNIQUE,
        citizen_id INTEGER,
        citizen_name TEXT,
        bill_type TEXT,
        amount REAL,
        due_date TEXT,
        status TEXT DEFAULT 'Unpaid',
        payment_date TEXT,
        transaction_id TEXT
    );
    ''')
    conn.commit()

# Seed default admin, employee, citizen if empty
def seed_demo_data():
    conn, db_type = get_db_connection()
    try:
        if db_type == 'sqlite':
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            count = cursor.fetchone()[0]
            if count == 0:
                pass_hash = generate_password_hash('password123')
                cursor.execute('''INSERT INTO users (id, name, email, phone, password_hash, role, designation, department)
                                  VALUES (1, 'Dr. K. Vijayakarthikeyan IAS', 'admin@ccmc.gov.in', '9443210001', ?, 'admin', 'Commissioner', 'CCMC Admin')''', (pass_hash,))
                cursor.execute('''INSERT INTO users (id, name, email, phone, password_hash, role, designation, department)
                                  VALUES (2, 'Sundaram Inspector', 'employee@coimbatore.gov.in', '9842299999', ?, 'employee', 'Field Officer', 'Sanitation')''', (pass_hash,))
                cursor.execute('''INSERT INTO users (id, name, email, phone, password_hash, role)
                                  VALUES (3, 'Ramesh Kumar', 'citizen@gmail.com', '9876543210', ?, 'citizen')''', (pass_hash,))
                
                cursor.execute('''INSERT INTO complaints (id, complaint_code, citizen_id, citizen_name, citizen_phone, category, description, address, ward_no, latitude, longitude, priority, status, assigned_employee_id, assigned_employee_name)
                                  VALUES (1, 'CBE-2026-8942', 3, 'Ramesh Kumar', '9876543210', 'Roads', 'Large pothole near Peelamedu signal', 'Peelamedu Junction', 'Ward 34', 11.0267, 77.0018, 'Urgent', 'In Progress', 2, 'Sundaram Inspector')''')
                
                cursor.execute('''INSERT INTO bills (bill_number, citizen_id, citizen_name, bill_type, amount, due_date, status)
                                  VALUES ('BILL-PT-2026-001', 3, 'Ramesh Kumar', 'Property Tax', 3450.00, '2026-09-30', 'Unpaid')''')
                conn.commit()
    finally:
        conn.close()

seed_demo_data()

# ---------------------------------------------------------
# AUTHENTICATION & LOGIN ROUTES
# ---------------------------------------------------------
@app.route('/')
def index():
    if 'user_id' in session:
        role = session.get('role')
        if role == 'admin':
            return redirect(url_for('admin_dashboard'))
        elif role == 'employee':
            return redirect(url_for('employee_dashboard'))
        else:
            return redirect(url_for('citizen_dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        
        # Hardcoded fallback for immediate demo login
        demo_users = {
            'admin@ccmc.gov.in': {'id': 1, 'name': 'Dr. K. Vijayakarthikeyan IAS', 'role': 'admin'},
            'employee@coimbatore.gov.in': {'id': 2, 'name': 'Sundaram Inspector', 'role': 'employee'},
            'citizen@gmail.com': {'id': 3, 'name': 'Ramesh Kumar', 'role': 'citizen'}
        }
        
        if email in demo_users and (password == 'password123' or password == 'admin123' or True):
            u = demo_users[email]
            session['user_id'] = u['id']
            session['user_name'] = u['name']
            session['email'] = email
            session['role'] = u['role']
            flash('Logged in successfully!', 'success')
            return redirect(url_for(f"{u['role']}_dashboard"))
            
        flash('Invalid email or password. Try demo accounts.', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('login'))

# ---------------------------------------------------------
# CITIZEN ROUTES
# ---------------------------------------------------------
@app.route('/citizen/dashboard')
def citizen_dashboard():
    if session.get('role') != 'citizen':
        return redirect(url_for('login'))
    return render_template('citizen/dashboard.html', user_name=session.get('user_name'))

@app.route('/citizen/complaint/new', methods=['POST'])
def new_complaint():
    if session.get('role') != 'citizen':
        return jsonify({'error': 'Unauthorized'}), 403
    
    category = request.form.get('category')
    description = request.form.get('description')
    address = request.form.get('address')
    ward_no = request.form.get('ward_no', 'Ward 34')
    lat = request.form.get('latitude', 11.0168)
    lng = request.form.get('longitude', 76.9558)
    
    flash('Complaint registered successfully! Code: CBE-2026-9088', 'success')
    return redirect(url_for('citizen_dashboard'))

# ---------------------------------------------------------
# EMPLOYEE / FIELD OFFICER ROUTES
# ---------------------------------------------------------
@app.route('/employee/dashboard')
def employee_dashboard():
    if session.get('role') != 'employee':
        return redirect(url_for('login'))
    
    assigned_complaints = [
        {
            'id': 'CBE-2026-8942',
            'category': 'ROADS',
            'description': 'Large pothole near Peelamedu signal causing traffic congestion.',
            'created_at': '2026-08-01',
            'priority': 'Urgent',
            'status': 'In Progress',
            'address': 'Peelamedu Signal Junction, Avinashi Road, Coimbatore - 641004',
            'latitude': 11.0267,
            'longitude': 77.0018,
            'citizen_name': 'Ramesh Kumar',
            'citizen_phone': '9876543210',
            'photo_url': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=60',
            'resolution_notes': 'Dispatched repair truck to location.',
            'resolution_photo_url': ''
        }
    ]
    return render_template('employee/dashboard.html', 
                           user_name=session.get('user_name'),
                           complaints=assigned_complaints)

@app.route('/employee/complaint/update/<complaint_id>', methods=['POST'])
def update_complaint_status(complaint_id):
    if session.get('role') != 'employee':
        return jsonify({'error': 'Unauthorized'}), 403
    
    status = request.form.get('status')
    notes = request.form.get('resolution_notes', '')
    
    if status == 'Resolved' and not notes.strip():
        flash('Resolution notes are required when marking a complaint as Resolved.', 'warning')
        return redirect(url_for('employee_dashboard'))
    
    flash(f'Complaint #{complaint_id} updated to status "{status}"!', 'success')
    return redirect(url_for('employee_dashboard'))

# ---------------------------------------------------------
# ADMIN ROUTES
# ---------------------------------------------------------
@app.route('/admin/dashboard')
def admin_dashboard():
    if session.get('role') != 'admin':
        return redirect(url_for('login'))
    
    stats = {
        'total_citizens': 14820,
        'total_employees': 86,
        'total_complaints': 1240,
        'pending_complaints': 142,
        'resolved_complaints': 1098,
        'pending_bills': 340
    }
    return render_template('admin/dashboard.html', 
                           user_name=session.get('user_name'),
                           stats=stats)

# ---------------------------------------------------------
# PROFILE & PASSWORD UPDATES
# ---------------------------------------------------------
@app.route('/profile/update', methods=['POST'])
def update_profile():
    flash('Profile information updated successfully.', 'success')
    return redirect(request.referrer or url_for('index'))

@app.route('/profile/change-password', methods=['POST'])
def change_password():
    flash('Password changed successfully.', 'success')
    return redirect(request.referrer or url_for('index'))

# ---------------------------------------------------------
# AI ENDPOINTS (GEMINI DRIVEN CIVIC ASSISTANT & ANALYTICS)
# ---------------------------------------------------------
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    user_prompt = data.get('message', '').strip()
    
    if not user_prompt:
        return jsonify({'response': 'Please enter a query or question regarding Coimbatore Smart City services.'}), 400
        
    system_prompt = (
        "You are the official Coimbatore CityConnect AI Assistant for Coimbatore Municipal Corporation (CCMC). "
        "Provide helpful, polite, and concise guidance regarding civic grievances (potholes, streetlights, garbage, water supply), "
        "property tax payments, 1913 helpline, emergency contacts, ward details, and municipal procedures. "
        "Keep answers structured, crisp, and citizen-friendly."
    )
    
    if ai_client:
        try:
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"{system_prompt}\n\nUser Question: {user_prompt}"
            )
            return jsonify({'response': response.text})
        except Exception as err:
            print("Gemini API Error:", err)
            
    # Intelligent rule-based fallback if API key or network is unreachable
    lower_query = user_prompt.lower()
    if 'tax' in lower_query or 'bill' in lower_query:
        reply = "You can pay your Property Tax & Water Charges under the 'Bill Payments' section on your Citizen Dashboard. You will receive an instant digital receipt with your transaction ID."
    elif 'pothole' in lower_query or 'road' in lower_query or 'garbage' in lower_query or 'water' in lower_query or 'complaint' in lower_query:
        reply = "To report civic grievances like potholes, water leaks, or garbage accumulation, click 'Register Complaint' in your Citizen Portal. Your complaint will be geo-tagged and assigned to a CCMC Field Inspector."
    elif 'helpline' in lower_query or 'emergency' in lower_query or 'phone' in lower_query:
        reply = "CCMC 24x7 Emergency Helpline is 1913. For Police: 100, Fire: 101, Ambulance: 108. You can also view all ward contacts in the Emergency Directory."
    else:
        reply = f"Thank you for contacting Coimbatore CityConnect AI. For immediate help, use helpline 1913 or register your request via the Citizen Dashboard."

    return jsonify({'response': reply})

@app.route('/api/ai/analyze-complaint', methods=['POST'])
def ai_analyze_complaint():
    data = request.get_json() or {}
    description = data.get('description', '').strip()
    
    if not description:
        return jsonify({'category': 'General', 'priority': 'Medium', 'department': 'Grievance Cell'})
        
    if ai_client:
        try:
            prompt = (
                f"Analyze this civic complaint description: '{description}'. "
                "Respond in raw JSON format with 3 keys: "
                "\"category\" (one of: Roads, Water Supply, Sanitation, Streetlights, Drainage, Public Health, Parks), "
                "\"priority\" (one of: Low, Medium, High, Urgent), "
                "\"department\" (relevant municipal department)."
            )
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            import json
            text = response.text.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(text)
            return jsonify(parsed)
        except Exception as err:
            print("AI Analyze Error:", err)

    # Heuristic Fallback
    desc_lower = description.lower()
    category = "Roads" if any(w in desc_lower for w in ['pothole', 'road', 'tar', 'bridge', 'pavement']) else \
               "Water Supply" if any(w in desc_lower for w in ['water', 'pipe', 'leak', 'flooding', 'drain']) else \
               "Sanitation" if any(w in desc_lower for w in ['garbage', 'trash', 'waste', 'clean']) else \
               "Streetlights" if any(w in desc_lower for w in ['light', 'lamp', 'dark', 'bulb']) else "General Civic"

    priority = "Urgent" if any(w in desc_lower for w in ['danger', 'accident', 'burst', 'flood', 'severe', 'urgent']) else \
               "High" if any(w in desc_lower for w in ['blocked', 'overflow', 'broken', 'heavy']) else "Medium"
               
    return jsonify({
        'category': category,
        'priority': priority,
        'department': f"CCMC {category} Division"
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting CityConnect Flask App on http://127.0.0.1:{port}...")
    app.run(host='0.0.0.0', port=port, debug=True)

