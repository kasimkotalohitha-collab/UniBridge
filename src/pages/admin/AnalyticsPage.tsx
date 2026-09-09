import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaint.service';
import { departmentService } from '../../services/department.service';
import { Complaint, Department } from '../../types/database.types';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/analytics/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { getCategoryLabel } from '../../lib/utils';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const inProgress = complaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned' || c.status === 'under_review'
  ).length;
  const urgent = complaints.filter((c) => c.priority === 'urgent' || c.priority === 'high').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category counts
  const categoryCounts = complaints.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  // Priority counts
  const priorityCounts = complaints.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner label="Generating campus analytics..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Campus Analytics & SLA Performance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics on grievance resolution rates, recurring campus failure points, and department workloads.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resolution Efficiency"
          value={`${resolutionRate}%`}
          subtitle={`${resolved} of ${total} resolved`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Active Backlog"
          value={inProgress}
          subtitle="Currently under action"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Critical Issues"
          value={urgent}
          subtitle="Urgent or high severity"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="pink"
        />
        <StatCard
          title="Operational Departments"
          value={departments.length}
          subtitle="Routing channels active"
          icon={<Building2 className="w-5 h-5" />}
          variant="purple"
        />
      </div>

      {/* 2-Column Visual Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Grievance Distribution by Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Identifies top complaint domains across residences and facilities
          </p>

          {Object.keys(categoryCounts).length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No data recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {getCategoryLabel(cat)}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Priority & Urgency Breakdown */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Priority Severity Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Evaluates safety risk and SLA urgency classifications
          </p>

          <div className="space-y-3">
            {[
              { key: 'urgent', label: 'Urgent Priority', color: 'bg-rose-500' },
              { key: 'high', label: 'High Priority', color: 'bg-amber-500' },
              { key: 'medium', label: 'Medium Priority', color: 'bg-sky-500' },
              { key: 'low', label: 'Low Priority', color: 'bg-emerald-500' },
            ].map((p) => {
              const count = priorityCounts[p.key] || 0;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={p.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{p.label}</span>
                    <span className="text-slate-400 font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Department SLA Matrix */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Departmental Workload & Resolution Ratio
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracking resolution rates across distinct campus facilities
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="pb-3">Department</th>
                <th className="pb-3">Total Routed</th>
                <th className="pb-3">Active Backlog</th>
                <th className="pb-3">Resolved</th>
                <th className="pb-3">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map((dept) => {
                const deptComplaints = complaints.filter((c) => c.department_id === dept.id);
                const dTotal = deptComplaints.length;
                const dResolved = deptComplaints.filter((c) => c.status === 'resolved').length;
                const dActive = dTotal - dResolved;
                const dRate = dTotal > 0 ? Math.round((dResolved / dTotal) * 100) : 0;

                return (
                  <tr key={dept.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">
                      {dept.name} <span className="text-slate-400 font-mono text-[10px]">({dept.code})</span>
                    </td>
                    <td className="py-3 text-slate-600">{dTotal}</td>
                    <td className="py-3 font-medium text-amber-600">{dActive}</td>
                    <td className="py-3 font-medium text-emerald-600">{dResolved}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${dRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{dRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
