import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { departmentService } from '../../services/department.service';
import { Complaint, Department } from '../../types/database.types';
import { StatCard } from '../../components/analytics/StatCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [complaintsData, deptsData] = await Promise.all([
          complaintService.getComplaints(),
          departmentService.getDepartments(),
        ]);
        setComplaints(complaintsData);
        setDepartments(deptsData);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const totalCount = complaints.length;
  const unassignedCount = complaints.filter(
    (c) => !c.assigned_faculty_id && c.status !== 'resolved'
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned' || c.status === 'under_review'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const urgentCount = complaints.filter(
    (c) => (c.priority === 'urgent' || c.priority === 'high') && c.status !== 'resolved'
  ).length;

  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-pastel-lavender-100 via-white to-pastel-pink-100 rounded-3xl p-6 sm:p-8 border border-pastel-lavender-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Central Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Campus Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Monitor campus-wide grievance resolution, assign tickets across departments, and review Gemini AI triage insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/complaints">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Manage Complaints
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issues Logged"
          value={totalCount}
          subtitle={`${resolutionRate}% resolved campus-wide`}
          icon={<Building2 className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Needs Assignment"
          value={unassignedCount}
          subtitle="Awaiting faculty routing"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Active In-Progress"
          value={inProgressCount}
          subtitle="Currently under investigation"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="High & Urgent"
          value={urgentCount}
          subtitle="Requires immediate attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="pink"
        />
      </div>

      {/* Department Load Breakdown Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Department Workload Distribution</h3>
            <p className="text-xs text-slate-500">Active tickets categorized by department</p>
          </div>
          <Link to="/admin/departments" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Manage Departments →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {departments.slice(0, 4).map((dept) => {
            const count = complaints.filter(
              (c) => c.department_id === dept.id && c.status !== 'resolved'
            ).length;
            return (
              <div
                key={dept.id}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {dept.code}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">
                    {dept.name}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-700 bg-pastel-lavender-100 px-2 py-1 rounded-xl">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Latest Campus Reports</h2>
            <p className="text-xs text-slate-500">Real-time incoming student issues</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All complaints ({totalCount}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-100 flex justify-center">
            <Spinner label="Loading campus operations..." />
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-xs text-slate-400">
            No complaints currently recorded in the database.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {complaints.slice(0, 4).map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                baseUrl="/admin/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
