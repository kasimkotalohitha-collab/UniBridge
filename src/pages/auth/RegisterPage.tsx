import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Department } from '../../types/database.types';
import { departmentService } from '../../services/department.service';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  Hash,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setDeptLoading(true);
    setDeptError(null);
    departmentService
      .getDepartments()
      .then((data) => {
        setDepartments(data);
        setDeptLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load departments:', err);
        setDeptError('Could not load campus departments from Supabase.');
        setDeptLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { error, user, session } = await signUp({
        email,
        password,
        fullName,
        role,
        studentIdNumber: role === 'student' ? studentIdNumber : undefined,
        phone,
        departmentId: role === 'faculty' ? departmentId : undefined,
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (session) {
        setSuccessMessage('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          if (role === 'admin') navigate('/admin/dashboard');
          else if (role === 'faculty') navigate('/faculty/dashboard');
          else navigate('/student/dashboard');
        }, 1200);
      } else {
        setSuccessMessage(
          'Account created successfully! Please check your email inbox to confirm your account before signing in.'
        );
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
      <div className="max-w-md w-full space-y-4 animate-fade-in my-8">
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/25 group-hover:scale-105 transition-transform duration-150">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Uni<span className="text-brand-600">Bridge</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Create your campus account</h2>
          <p className="text-xs text-slate-500">
            Join the UniBridge network to submit, track, or manage campus affairs.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Registering As <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'faculty', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all duration-150 capitalize select-none ${
                      role === r
                        ? 'bg-pastel-lavender-100 border-brand-300 text-brand-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="e.g., Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Campus Email Address"
              type="email"
              placeholder="e.g., alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
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
              minLength={6}
            />

            {/* Student Specific Field */}
            {role === 'student' && (
              <Input
                label="Student Registration / Roll ID"
                type="text"
                placeholder="e.g., 2024-CS-084"
                value={studentIdNumber}
                onChange={(e) => setStudentIdNumber(e.target.value)}
                leftIcon={<Hash className="w-4 h-4" />}
                required
              />
            )}

            {/* Faculty Specific Field */}
            {role === 'faculty' && (
              <Select
                label="Assigned Academic Department"
                placeholder={
                  deptLoading
                    ? 'Loading campus departments...'
                    : deptError
                    ? 'Failed to load departments'
                    : departments.length === 0
                    ? 'No departments found in database'
                    : 'Select Assigned Department...'
                }
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={deptLoading || departments.length === 0}
                required
                error={deptError || undefined}
                helperText={
                  deptLoading
                    ? 'Connecting to Supabase departments directory...'
                    : departments.length === 0
                    ? 'Departments table is empty or migration pending.'
                    : undefined
                }
              />
            )}

            <Input
              label="Contact Phone Number (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={loading}
              disabled={loading || !isConfigured}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
