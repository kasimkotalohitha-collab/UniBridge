import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService, ComplaintFilters } from '../../services/complaint.service';
import { departmentService } from '../../services/department.service';
import { Complaint, Department, ComplaintStatus } from '../../types/database.types';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintFiltersBar } from '../../components/complaints/ComplaintFiltersBar';
import { AssignComplaintModal } from '../../components/complaints/AssignComplaintModal';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { UserCheck, ShieldCheck } from 'lucide-react';

export const AllComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ComplaintFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    department_id: 'all',
    searchQuery: '',
  });

  // Modal triggers
  const [assignComplaint, setAssignComplaint] = useState<Complaint | null>(null);
  const [statusComplaint, setStatusComplaint] = useState<Complaint | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compList, deptList] = await Promise.all([
        complaintService.getComplaints(filters),
        departmentService.getDepartments(),
      ]);
      setComplaints(compList);
      setDepartments(deptList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleAssign = async (deptId: string, facultyId: string, remarks?: string) => {
    if (!assignComplaint || !user) return;
    const ok = await complaintService.assignComplaint(
      assignComplaint.id,
      deptId,
      facultyId,
      user.id,
      remarks
    );
    if (ok) {
      await loadData();
    } else {
      throw new Error('Failed to update complaint assignment in database.');
    }
  };

  const handleStatusUpdate = async (newStatus: ComplaintStatus, remarks: string) => {
    if (!statusComplaint || !user) return;
    const ok = await complaintService.updateStatus(
      statusComplaint.id,
      newStatus,
      remarks,
      user.id,
      statusComplaint.status
    );
    if (ok) {
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          All Campus Grievances
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review, categorize, assign, and override priorities for all university issues.
        </p>
      </div>

      <ComplaintFiltersBar
        filters={filters}
        onChange={setFilters}
        departments={departments}
        showDepartmentFilter
      />

      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-100 flex justify-center">
          <Spinner label="Loading campus grievances..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No matching grievances found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting or resetting your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="relative flex flex-col justify-between">
              <ComplaintCard
                complaint={complaint}
                baseUrl="/admin/complaints"
              />
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusComplaint(complaint)}
                  className="text-xs"
                >
                  Change Status
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAssignComplaint(complaint)}
                  leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {complaint.assigned_faculty_id ? 'Reassign' : 'Assign Faculty'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignComplaint && (
        <AssignComplaintModal
          isOpen={Boolean(assignComplaint)}
          onClose={() => setAssignComplaint(null)}
          complaint={assignComplaint}
          departments={departments}
          onAssign={handleAssign}
        />
      )}

      {/* Status Modal */}
      {statusComplaint && (
        <StatusUpdateModal
          isOpen={Boolean(statusComplaint)}
          onClose={() => setStatusComplaint(null)}
          complaint={statusComplaint}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};
