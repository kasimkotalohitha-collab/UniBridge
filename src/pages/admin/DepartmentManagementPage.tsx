import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/department.service';
import { supabase } from '../../lib/supabase';
import { Department } from '../../types/database.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Building2, Plus, Users, Hash } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name,
          code: code.toUpperCase(),
          description,
        })
        .select('*')
        .single();

      if (!error && data) {
        setDepartments((prev) => [...prev, data as Department]);
        setIsModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            University Departments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campus departments responsible for servicing student and facility grievances.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Department
        </Button>
      </div>

      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-100 flex justify-center">
          <Spinner label="Loading departments..." />
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-xs text-slate-400">
          No departments found. Click &quot;Add Department&quot; above to create one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200/50">
                    {dept.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {dept.description || 'No description specified.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Active Routing Service</span>
                <span className="text-emerald-600 font-semibold">• Enabled</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Campus Department"
        description="Register a new academic or operational unit on the platform."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Electrical Maintenance & Utilities"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Department Short Code"
            placeholder="e.g. ELEC_UTIL"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            helperText="Used by AI triage engine to auto-route complaints."
          />

          <Textarea
            label="Department Description & Scope"
            placeholder="Specify scope of issues this department manages..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
