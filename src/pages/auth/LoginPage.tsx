import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user, role, loading: authLoading, signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPathAllowedForRole = (path: string | undefined, userRole: string | null | undefined): boolean => {
    if (!path || !userRole) return false;
    const normalized = userRole.toLowerCase().trim();
    if (path === '/' || path === '/login' || path === '/unauthorized' || path === '/register') return false;
    if (path.startsWith('/admin')) return normalized === 'admin';
    if (path.startsWith('/faculty')) return normalized === 'faculty';
    if (path.startsWith('/student')) return normalized === 'student';
    if (path === '/notifications') return true;
    return false;
  };

  const getRoleDashboard = (userRole: string | null | undefined): string => {
    const normalized = (userRole || '').toLowerCase().trim();
    if (normalized === 'admin') return '/admin/dashboard';
    if (normalized === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && user && role) {
      const from = (location.state as any)?.from?.pathname;
      if (from && isPathAllowedForRole(from, role)) {
        navigate(from, { replace: true });
      } else {
        navigate(getRoleDashboard(role), { replace: true });
      }
    }
  }, [user, role, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { error, role: resolvedRole } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message);
      } else {
        const targetRole = resolvedRole || role;
        const from = (location.state as any)?.from?.pathname;
        if (from && isPathAllowedForRole(from, targetRole)) {
          navigate(from, { replace: true });
        } else {
          navigate(getRoleDashboard(targetRole), { replace: true });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
      <div className="max-w-md w-full space-y-4 animate-fade-in">
        {/* Brand logo header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/25 group-hover:scale-105 transition-transform duration-150">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Uni<span className="text-brand-600">Bridge</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500">
            Access your student, faculty, or administrative campus dashboard.
          </p>
        </div>

        {/* Supabase unconfigured alert */}
        {!isConfigured && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase Credentials Required</p>
              <p className="text-[11px] mt-0.5 text-amber-700">
                Please add your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code> file.
              </p>
            </div>
          </div>
        )}

        {/* Login Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Campus Email Address"
              type="email"
              placeholder="e.g., student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={loading}
              disabled={loading || !isConfigured}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to UniBridge?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Create an account
              </Link>
            </p>
          </div>
        </Card>

        {/* Helper Note for testing */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-500" />
          <span>Authenticated via Supabase Auth with PostgreSQL Row Level Security</span>
        </div>
      </div>
    </div>
  );
};
