import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Mail,
  Hash,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export const StudentProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [phone, setPhone] = useState(profile?.phone || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setSuccessMsg('Profile information updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Campus Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your enrolled university details and verified role credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-pastel-lavender-100 border border-pastel-lavender-200 flex items-center justify-center text-brand-700 font-bold text-2xl">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 leading-none">
                {profile?.full_name || 'Campus Member'}
              </h3>
              <Badge variant="purple" size="sm" className="capitalize">
                {profile?.role || 'student'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Campus Email Address"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Your official university email is authenticated and cannot be modified."
          />

          {profile?.role === 'student' && (
            <Input
              label="Student Registration / Roll ID"
              value={profile?.student_id_number || 'N/A'}
              disabled
              leftIcon={<Hash className="w-4 h-4" />}
              helperText="Verified student credential issued upon enrolment."
            />
          )}

          <Input
            label="Contact Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Enrolled:{' '}
              {formatDateTime(profile?.created_at)}
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
              disabled={isUpdating}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
