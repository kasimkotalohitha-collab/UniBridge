import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth();

  const getHomePath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-subtle animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          You do not have the required role privileges to access this area of the campus portal.
        </p>
        <div className="mt-6">
          <Link to={getHomePath()}>
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Permitted Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
