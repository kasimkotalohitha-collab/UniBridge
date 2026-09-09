import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService, ComplaintFilters } from '../../services/complaint.service';
import { Complaint } from '../../types/database.types';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintFiltersBar } from '../../components/complaints/ComplaintFiltersBar';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { FilePlus2, ListTodo } from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    searchQuery: '',
  });

  const loadComplaints = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await complaintService.getComplaints({
        ...filters,
        student_id: user.id,
      });
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user, filters]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Campus Grievances
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor resolution progress, read faculty responses, and review submitted complaints.
          </p>
        </div>
        <Link to="/student/complaints/new">
          <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-4 h-4" />}>
            Submit New Issue
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <ComplaintFiltersBar filters={filters} onChange={setFilters} />

      {/* Complaint List */}
      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-100 flex justify-center">
          <Spinner label="Loading your complaints..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center mx-auto">
            <ListTodo className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No complaints match your selected filters. Try clearing your filters or create a new issue.
          </p>
          <div className="pt-2">
            <Link to="/student/complaints/new">
              <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-4 h-4" />}>
                Submit New Issue
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              baseUrl="/student/complaints"
            />
          ))}
        </div>
      )}
    </div>
  );
};
