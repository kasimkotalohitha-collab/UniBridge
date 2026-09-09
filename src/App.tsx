import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardShell } from './components/layout/DashboardShell';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

// Common Pages
import { NotificationsPage } from './pages/common/NotificationsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/student/ComplaintDetailPage';
import { CampusEventsPage } from './pages/student/CampusEventsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { TimetablePage } from './pages/student/TimetablePage';
import { StudentQueriesPage } from './pages/student/StudentQueriesPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { AssignedComplaintsPage } from './pages/faculty/AssignedComplaintsPage';
import { FacultyComplaintDetailPage } from './pages/faculty/FacultyComplaintDetailPage';
import { FacultyQueriesPage } from './pages/faculty/FacultyQueriesPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { AdminComplaintDetailPage } from './pages/admin/AdminComplaintDetailPage';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { AdminQueriesPage } from './pages/admin/AdminQueriesPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Authenticated Application Shell */}
          <Route element={<DashboardShell />}>
            {/* Common Authenticated Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'faculty', 'admin']} />}>
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'faculty', 'admin']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/complaints/new" element={<SubmitComplaintPage />} />
              <Route path="/student/complaints" element={<MyComplaintsPage />} />
              <Route path="/student/complaints/:id" element={<ComplaintDetailPage />} />
              <Route path="/student/timetable" element={<TimetablePage />} />
              <Route path="/student/queries" element={<StudentQueriesPage />} />
              <Route path="/student/events" element={<CampusEventsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/complaints" element={<AssignedComplaintsPage />} />
              <Route path="/faculty/complaints/:id" element={<FacultyComplaintDetailPage />} />
              <Route path="/faculty/queries" element={<FacultyQueriesPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/complaints" element={<AllComplaintsPage />} />
              <Route path="/admin/complaints/:id" element={<AdminComplaintDetailPage />} />
              <Route path="/admin/queries" element={<AdminQueriesPage />} />
              <Route path="/admin/departments" element={<DepartmentManagementPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
