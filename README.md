# CityConnect — Smart City Service Portal

CityConnect is a modern, responsive Smart City Service Portal built for municipal administration, citizen grievance redressal, utility bill payment, and city announcements.

## Features
- **Citizen Portal**: Register accounts, file civic complaints with photo & location, pay utility bills, view announcements.
- **Employee Portal**: Inspect assigned field complaints, update resolution status with notes & photo evidence.
- **Admin Portal**: Oversee city stats, assign complaints to field staff, issue utility bills, and publish official announcements.
- **Data Persistence**: Integrated local persistence and REST API endpoints.
- **Fully Responsive**: Mobile, tablet, and desktop layout support.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Python Flask (`backend_server.py` & `CityConnect/app.py`)
- **Database**: MySQL / SQLite fallback (`cityconnect_demo.db`)

## Local Setup
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Frontend Dev Server:**
   ```bash
   npm run dev
   ```
3. **Run Backend Server:**
   ```bash
   python backend_server.py
   ```
4. **Build Production Bundle:**
   ```bash
   npm run build
   ```

