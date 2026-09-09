import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService, ComplaintFilters } from '../../services/complaint.service';
import { Complaint, ComplaintStatus } from '../../types/database.types';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintFiltersBar } from '../../components/complaints/ComplaintFiltersBar';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { CheckSquare } from 'lucide-react';

export const AssignedComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    searchQuery: '',
  });

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  const loadComplaints = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await complaintService.getComplaints({
        ...filters,
        assigned_faculty_id: user.id,
      });
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user, filters]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Faculty Assigned Complaints
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tickets assigned directly to you for investigation, maintenance, or administrative action.
        </p>
      </div>

      <ComplaintFiltersBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-100 flex justify-center">
          <Spinner label="Loading assigned complaints..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No complaints currently match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="relative flex flex-col justify-between">
              <ComplaintCard
                complaint={complaint}
                baseUrl="/faculty/complaints"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveComplaint(complaint)}
                  className="text-xs"
                >
                  Quick Status Update
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
