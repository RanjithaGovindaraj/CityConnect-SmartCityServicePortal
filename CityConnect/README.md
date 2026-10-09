# CityConnect – Coimbatore Smart City Service Portal

A comprehensive Municipal Corporation Governance, Grievance Redressal, and Civic Services Web Application built using **Python Flask, Bootstrap 5, MySQL, and Leaflet OpenStreetMap**.

---

## 🚀 Technology Stack Overview

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome 6 |
| **Backend** | Python 3, Flask, Werkzeug |
| **Database** | MySQL (XAMPP / phpMyAdmin) / SQLite Fallback |
| **GIS Mapping** | Leaflet.js, OpenStreetMap |
| **Development** | VS Code, XAMPP, Git |

---

## 📁 Directory Structure

```
CityConnect/
├── app.py                      # Core Flask Application & Routes
├── config.py                   # Configuration & MySQL credentials
├── requirements.txt            # Python dependencies
│
├── templates/                  # Jinja2 HTML Templates
│   ├── base.html               # Base layout, navbar, profile & password modals, footer
│   ├── login.html              # Role-based login page with quick demo shortcuts
│   ├── citizen/
│   │   └── dashboard.html      # Citizen portal, complaint registration, bill payments
│   ├── employee/
│   │   └── dashboard.html      # Field Officer portal & Manage Complaint Modal
│   └── admin/
│       └── dashboard.html      # Commissioner Admin portal, stats, assignment, GIS map
│
├── static/
│   ├── css/
│   │   └── style.css           # CCMC Government portal custom styles
│   ├── js/
│   │   └── script.js           # Client-side interactions & Leaflet initialization
│   └── uploads/                # Resolution & field photos
│
├── database/
│   └── schema.sql              # Complete MySQL database schema & seed data
│
└── README.md                   # Installation & execution guide
```

---

## 🗄️ Database Setup using XAMPP & phpMyAdmin

1. Open **XAMPP Control Panel** and start **Apache** and **MySQL** services.
2. Open your browser and navigate to `http://localhost/phpmyadmin/`.
3. Click on the **SQL** tab.
4. Copy the entire contents of `CityConnect/database/schema.sql` and paste it into the SQL query box.
5. Click **Go** to create the `cityconnect_db` database, tables, and sample seed records.

---

## 🛠️ How to Run the Flask Application in VS Code

### 1. Prerequisites
- Python 3.10 or higher installed
- VS Code installed
- XAMPP installed and running MySQL

### 2. Install Dependencies
Open VS Code terminal inside the `CityConnect` directory and run:

```bash
pip install -r requirements.txt
```

### 3. Run the Flask Server
Run the Flask application:

```bash
python app.py
```

Or on Linux/macOS:
```bash
python3 app.py
```

The app will start running on `http://127.0.0.1:3000` or `http://localhost:3000`.

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Citizen** | `citizen@gmail.com` | `password123` |
| **Field Officer** | `employee@coimbatore.gov.in` | `password123` |
| **Admin Commissioner** | `admin@ccmc.gov.in` | `password123` |

---

## 🌟 Key Features

1. **Role-Based Portals**:
   - **Citizen**: Register geo-tagged complaints, view complaint status, pay municipal property tax & water bills, access 1913 helpline.
   - **Field Officer / Employee**: Professional 2-column **Manage Complaint** verification modal (Issue Details, GPS Location, Citizen Photo, Status Update, Resolution Remarks, Field Photo Upload).
   - **Admin Commissioner**: Master analytics, assign complaints to officers, publish municipal notices, view Coimbatore GIS Master Map.
2. **Open-Source GIS Mapping**: Powered by Leaflet & OpenStreetMap (no paid Google Maps dependency).
3. **Responsive Design**: Bootstrap 5 grid & custom government CCMC navy blue theme.
