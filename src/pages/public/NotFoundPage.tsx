import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-subtle animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h2>
        <h3 className="text-base font-semibold text-slate-700 mt-1">Page Not Found</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The campus resource or page you are searching for does not exist or has been relocated.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Campus Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
