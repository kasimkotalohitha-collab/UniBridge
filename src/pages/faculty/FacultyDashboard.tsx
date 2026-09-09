import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { Complaint, ComplaintStatus } from '../../types/database.types';
import { StatCard } from '../../components/analytics/StatCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected complaint for status update modal
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  const loadComplaints = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await complaintService.getComplaints({
        assigned_faculty_id: user.id,
      });
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const handleUpdateStatus = async (newStatus: ComplaintStatus, remarks: string) => {
    if (!activeComplaint || !user) return;
    const success = await complaintService.updateStatus(
      activeComplaint.id,
      newStatus,
      remarks,
      user.id,
      activeComplaint.status
    );
    if (success) {
      loadComplaints();
    }
  };

  const assignedCount = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const urgentCount = complaints.filter(
    (c) => (c.priority === 'urgent' || c.priority === 'high') && c.status !== 'resolved'
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-pastel-lavender-100 via-white to-pastel-pink-100 rounded-3xl p-6 sm:p-8 border border-pastel-lavender-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-subtle">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Faculty Portal: {profile?.full_name || 'Faculty Member'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Manage your assigned student complaints, record inspection updates, and coordinate with campus administrators.
          </p>
        </div>
        <Link to="/faculty/complaints" className="shrink-0">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View Assigned Queue
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned to Me"
          value={assignedCount}
          subtitle="Direct student tickets"
          icon={<CheckSquare className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Under Action"
          value={inProgressCount}
          subtitle="Currently being resolved"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Successfully closed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Urgent Priority"
          value={urgentCount}
          subtitle="High impact grievances"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="pink"
        />
      </div>

      {/* Assigned Complaints Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pending Action Items</h2>
            <p className="text-xs text-slate-500">
              Complaints requiring investigation or progress remarks
            </p>
          </div>
          {complaints.length > 0 && (
            <Link
              to="/faculty/complaints"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View full queue ({complaints.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-100 flex justify-center">
            <Spinner label="Loading assigned issues..." />
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No pending complaints assigned</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All complaints assigned to your department are currently up to date.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {complaints.slice(0, 4).map((complaint) => (
              <div key={complaint.id} className="relative">
                <ComplaintCard
                  complaint={complaint}
                  baseUrl="/faculty/complaints"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {activeComplaint && (
        <StatusUpdateModal
          isOpen={Boolean(activeComplaint)}
          onClose={() => setActiveComplaint(null)}
          complaint={activeComplaint}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
};
