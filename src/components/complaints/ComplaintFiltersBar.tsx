import React from 'react';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../../lib/constants';
import { ComplaintFilters } from '../../services/complaint.service';
import { Department } from '../../types/database.types';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Button } from '../common/Button';

interface ComplaintFiltersBarProps {
  filters: ComplaintFilters;
  onChange: (filters: ComplaintFilters) => void;
  departments?: Department[];
  showDepartmentFilter?: boolean;
}

export const ComplaintFiltersBar: React.FC<ComplaintFiltersBarProps> = ({
  filters,
  onChange,
  departments = [],
  showDepartmentFilter = false,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const handleReset = () => {
    onChange({
      searchQuery: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      department_id: 'all',
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    (filters.department_id && filters.department_id !== 'all');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-subtle space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by ticket #, title, keyword..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400"
          />
        </div>

        {/* Action button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-slate-500 hover:text-slate-800"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filter Selectors Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-50">
        {/* Status */}
        <div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={filters.priority || 'all'}
            onChange={(e) => onChange({ ...filters, priority: e.target.value as any })}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            {COMPLAINT_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} Priority
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={filters.category || 'all'}
            onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department (Admin only) */}
        {showDepartmentFilter && (
          <div>
            <select
              value={filters.department_id || 'all'}
              onChange={(e) => onChange({ ...filters, department_id: e.target.value })}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
