# UniBridge — Campus Operations & Grievance Resolution Platform

UniBridge is a modern, unified campus platform designed to connect **students**, **faculty**, and **campus administrators** in a single, trustworthy, role-based ecosystem. It features end-to-end issue tracking, transparent resolution timelines, student privacy protection (anonymous reporting), and Google Gemini AI-assisted triage.

---

## 🎨 Design System

UniBridge uses a polished campus-product aesthetic:
- **Base**: Crisp white with slate typography
- **Pastel Pink**: `#fdf2f4` / `#fce7ea` accents
- **Lavender**: `#f4edfa` / `#ebdcf6` backgrounds
- **Brand Purple**: `#7c3aed` / `#6d28d9` highlights & primary actions
- **Cards**: Smooth `rounded-2xl` cards with subtle elevated shadows
- **Responsiveness**: Fully responsive for mobile phones, tablets, and desktop workstations

---

## 🏛️ Platform Architecture

```
UniBridge Client (React 19 + TypeScript + Vite + Tailwind CSS)
   │
   ├─► Supabase Auth (JWT, secure sessions, profile triggers)
   ├─► Supabase Database (PostgreSQL with Row Level Security per role)
   ├─► Supabase Storage (complaint-attachments bucket)
   │
   └─► Secure Server Proxy / Supabase Edge Function (Express / Deno)
         └─► Google Gemini API (gemini-1.5-flash / gemini-2.5)
```

> **Security Note**: Google Gemini API keys are strictly kept server-side in `server/.env` or Supabase secrets and are never exposed to client browsers.

---

## 👥 Core User Roles & Capabilities

### 1. Student
- Register with student roll/registration number
- Submit campus issues (Hostel, Academic, IT & Wi-Fi, Infrastructure, Dining, Transport, Sports, Library)
- **Gemini AI Smart Triage**: Predicts category & priority with explainable reasoning
- **Anonymous Reporting**: Protects student identity from faculty & admin views while retaining personal tracking
- Upload image or document evidence (up to 4 files)
- Step-by-step progress stepper (Submitted → Under Review → Assigned → In Progress → Resolved)
- Real-time audit history & public inquiry discussions
- Browse campus events & announcements

### 2. Faculty & Wardens
- View tickets assigned to their department or individual account
- Quick status updates (`In Progress`, `Resolved`) with mandatory progress remarks
- Timeline audit logging automatically recorded
- Internal staff notes visible only to faculty and administrators

### 3. Administrator
- Campus-wide operations dashboard
- Filter, search, and categorize grievances
- Department & faculty assignment routing
- Priority overrides (`Urgent`, `High`, `Medium`, `Low`)
- Department management & SLA performance matrix
- Campus analytics breakdown (Resolution efficiency, category distribution, backlog tracking)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server proxy dependencies
npm --prefix server install
```

### 2. Configure Environment Variables

Create `.env` in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AI_PROXY_URL=http://localhost:3001/api
```

Create `server/.env` for the secure AI proxy:
```env
PORT=3001
GEMINI_API_KEY=your-google-gemini-api-key
```

### 3. Set Up Supabase Database

Run the provided SQL migrations in your **Supabase SQL Editor**:
1. `supabase/migrations/001_initial_schema.sql` (Creates enums, tables, auto-increment ticket sequence `UB-YYYY-XXXX`, auth trigger, and Row Level Security policies)
2. `supabase/migrations/002_storage_setup.sql` (Configures `complaint-attachments` storage bucket with upload and view policies)
3. `supabase/migrations/003_seed_departments.sql` (Seeds default university departments and sample campus events)

### 4. Start the Application

```bash
# Terminal 1: Run Frontend (Vite)
npm run dev

# Terminal 2: Run Secure AI Proxy (Optional, for live Gemini predictions)
npm run server
```

The frontend will run at `http://localhost:5173`.

---

## 📁 Project Structure

```
uniBridge-main/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql        # Database tables, triggers, and RLS
│   │   ├── 002_storage_setup.sql         # Attachment bucket & policies
│   │   └── 003_seed_departments.sql      # Initial departments & campus events
│   └── functions/
│       └── analyze-complaint/            # Supabase Edge Function alternative
├── server/                               # Node/Express secure AI proxy
│   ├── src/
│   │   ├── gemini.ts                     # Google Gemini SDK caller
│   │   └── index.ts                      # Express API router
│   ├── package.json
│   └── tsconfig.json
└── src/
    ├── components/
    │   ├── common/                       # Button, Card, Badge, Input, Select, Modal, Spinner, Tabs
    │   ├── layout/                       # Navbar, Sidebar, DashboardShell, NotificationBell
    │   ├── complaints/                   # ComplaintCard, ComplaintFiltersBar, ComplaintTimelineView, Modals
    │   ├── analytics/                    # StatCard
    │   └── events/                       # EventCard
    ├── contexts/                         # AuthContext (real Supabase session management)
    ├── lib/                              # Supabase client, utils, constants
    ├── pages/
    │   ├── auth/                         # LoginPage, RegisterPage, UnauthorizedPage
    │   ├── student/                      # StudentDashboard, SubmitComplaintPage, Detail, Events, Profile
    │   ├── faculty/                      # FacultyDashboard, AssignedComplaints, Detail
    │   ├── admin/                        # AdminDashboard, AllComplaints, Departments, Analytics
    │   └── public/                       # LandingPage, NotFoundPage
    ├── services/                         # Complaint, Department, Event, and AI service layers
    └── types/                            # Typed database interfaces and enums
```

---

## 🛡️ Security & Privacy Architecture

- **Row Level Security (RLS)**: Enforced directly on PostgreSQL. Even if a user crafts a direct database request, they cannot modify unauthorized tickets or inspect internal comments.
- **Anonymous Reporting Privacy**: When `is_anonymous` is true, the student profile information (`full_name`, `email`, `student_id_number`) is masked on non-student API views.
- **Role Guards**: Frontend `<ProtectedRoute allowedRoles={[...]}>` shields private student, faculty, and administrative routes while waiting for session hydration without flickering.
