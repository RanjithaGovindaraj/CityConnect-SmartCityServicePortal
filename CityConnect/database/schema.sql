-- ========================================================
-- CityConnect – Coimbatore Smart City Service Portal
-- Database Schema for MySQL (XAMPP / phpMyAdmin)
-- ========================================================

CREATE DATABASE IF NOT EXISTS cityconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cityconnect_db;

-- 1. USERS TABLE
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'employee', 'admin') NOT NULL DEFAULT 'citizen',
    designation VARCHAR(100) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    ward_no VARCHAR(50) DEFAULT NULL,
    salary DECIMAL(10,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CITIZENS TABLE
DROP TABLE IF EXISTS citizens;
CREATE TABLE citizens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address TEXT DEFAULT NULL,
    property_tax_id VARCHAR(50) DEFAULT NULL,
    water_connection_id VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. EMPLOYEES TABLE
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    ward_jurisdiction VARCHAR(100) DEFAULT 'West Zone',
    salary DECIMAL(10,2) DEFAULT 45000.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. COMPLAINTS TABLE
DROP TABLE IF EXISTS complaints;
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_code VARCHAR(20) NOT NULL UNIQUE,
    citizen_id INT NOT NULL,
    citizen_name VARCHAR(100) NOT NULL,
    citizen_phone VARCHAR(15) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(500) DEFAULT NULL,
    address TEXT NOT NULL,
    ward_no VARCHAR(50) NOT NULL,
    latitude DECIMAL(10,8) DEFAULT 11.0168,
    longitude DECIMAL(11,8) DEFAULT 76.9558,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('New', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed') DEFAULT 'Assigned',
    assigned_employee_id INT DEFAULT NULL,
    assigned_employee_name VARCHAR(100) DEFAULT NULL,
    resolution_notes TEXT DEFAULT NULL,
    resolution_photo_url VARCHAR(500) DEFAULT NULL,
    resolution_date TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. COMPLAINT ASSIGNMENTS LOG
DROP TABLE IF EXISTS complaint_assignments;
CREATE TABLE complaint_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_by_admin_id INT NOT NULL,
    status_notes VARCHAR(255) DEFAULT 'Assigned by Commissioner Office',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. BILLS TABLE
DROP TABLE IF EXISTS bills;
CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    citizen_id INT NOT NULL,
    citizen_name VARCHAR(100) NOT NULL,
    bill_type ENUM('Property Tax', 'Water Bill', 'Utility Bill') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Unpaid', 'Paid', 'Overdue') DEFAULT 'Unpaid',
    payment_date TIMESTAMP NULL DEFAULT NULL,
    transaction_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. NOTICES TABLE
DROP TABLE IF EXISTS notices;
CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    department VARCHAR(100) DEFAULT 'General Administration',
    priority ENUM('Low', 'Important', 'Urgent') DEFAULT 'Important',
    is_active TINYINT(1) DEFAULT 1,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. EMERGENCY CONTACTS TABLE
DROP TABLE IF EXISTS emergency_contacts;
CREATE TABLE emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    description TEXT,
    icon_class VARCHAR(50) DEFAULT 'fa-phone'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

-- Insert Sample Users
-- Passwords below are pbkdf2 hashed or plain 'password123'
INSERT INTO users (id, name, email, phone, password_hash, role, designation, department, ward_no, salary) VALUES
(1, 'Dr. K. Vijayakarthikeyan IAS', 'admin@ccmc.gov.in', '9443210001', 'scrypt:32768:8:1$password123_hash', 'admin', 'Municipal Commissioner', 'Executive Office', 'Central Zone', 185000.00),
(2, 'Sundaram Inspector', 'employee@coimbatore.gov.in', '9842299999', 'scrypt:32768:8:1$password123_hash', 'employee', 'Senior Field Inspector', 'Sanitation & Solid Waste', 'West Zone (Wards 23-45)', 58000.00),
(3, 'Ramesh Kumar', 'citizen@gmail.com', '9876543210', 'scrypt:32768:8:1$password123_hash', 'citizen', NULL, NULL, 'Ward 34 - Peelamedu', NULL);

-- Insert Citizens Data
INSERT INTO citizens (user_id, address, property_tax_id, water_connection_id) VALUES
(3, '142 Avinashi Road, Peelamedu, Coimbatore - 641004', 'PT-CBE-2026-8891', 'WC-CBE-9942');

-- Insert Employees Data
INSERT INTO employees (user_id, employee_code, department, designation, ward_jurisdiction, salary) VALUES
(2, 'EMP-CBE-usr-employee-1', 'Sanitation & Solid Waste', 'Senior Field Inspector', 'West Zone (Wards 23-45)', 58000.00);

-- Insert Sample Complaints
INSERT INTO complaints (id, complaint_code, citizen_id, citizen_name, citizen_phone, category, description, photo_url, address, ward_no, latitude, longitude, priority, status, assigned_employee_id, assigned_employee_name, resolution_notes, resolution_photo_url) VALUES
(1, 'CBE-2026-8942', 3, 'Ramesh Kumar', '9876543210', 'Roads & Potholes', 'Large pothole near Peelamedu signal causing traffic congestion and hazard for two-wheelers.', 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=60', 'Peelamedu Signal Junction, Avinashi Road', 'Ward 34 - Peelamedu', 11.02670000, 77.00180000, 'Urgent', 'In Progress', 2, 'Sundaram Inspector', 'Dispatched asphalt repair crew and heavy roller truck to peelamedu junction.', NULL),
(2, 'CBE-2026-9011', 3, 'Ramesh Kumar', '9876543210', 'Garbage Dump', 'Overflowing garbage bin near Nava India junction needs immediate clearance.', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60', 'Nava India Bus Stop, Avinashi Road', 'Ward 28 - RS Puram', 11.01820000, 76.97420000, 'High', 'Assigned', 2, 'Sundaram Inspector', NULL, NULL);

-- Insert Sample Bills
INSERT INTO bills (bill_number, citizen_id, citizen_name, bill_type, amount, due_date, status) VALUES
('BILL-PT-2026-001', 3, 'Ramesh Kumar', 'Property Tax', 3450.00, '2026-09-30', 'Unpaid'),
('BILL-WC-2026-088', 3, 'Ramesh Kumar', 'Water Bill', 680.00, '2026-08-25', 'Unpaid');

-- Insert Sample Emergency Contacts
INSERT INTO emergency_contacts (department_name, contact_number, description, icon_class) VALUES
('CCMC Municipal Helpline', '1913', '24x7 Smart City Citizen Assistance', 'fa-headset'),
('Fire & Rescue Control', '101', 'Coimbatore Central Fire Station', 'fa-fire-extinguisher'),
('City Police Control', '100', 'Coimbatore City Police Headquarters', 'fa-shield-halved'),
('Ambulance / Medical', '108', 'Emergency Medical Response Team', 'fa-truck-medical');

-- Insert Sample Notices
INSERT INTO notices (title, content, department, priority) VALUES
('Special Property Tax Concession Camp', 'CCMC announces 5% early bird rebate on Property Tax payments cleared before August 31, 2026. Visit nearest Zonal Office or pay online.', 'Revenue Department', 'Important'),
('Water Supply Schedule - West Zone', 'Pilloor Phase II maintenance work scheduled on Aug 12. Water supply will be provided on alternate days for Wards 23-45.', 'Water Works Department', 'Urgent');
