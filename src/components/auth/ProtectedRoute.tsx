import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/database.types';
import { Spinner } from '../common/Spinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, loading, profileLoading, profileLoaded } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth session is initializing OR profile is still being loaded
  if (loading || profileLoading || !profileLoaded || (user && !role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 flex items-center justify-center border border-pastel-lavender-200">
            <Spinner size="md" />
          </div>
          <p className="text-xs font-medium text-slate-500 tracking-wide animate-pulse">
            Authenticating UniBridge session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, ensure user has loaded profile and valid role
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedRole = (role || '').toLowerCase().trim();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!normalizedAllowed.includes(normalizedRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
