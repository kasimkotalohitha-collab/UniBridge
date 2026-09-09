import React, { useState, useEffect } from 'react';
import { Complaint, Department, Profile } from '../../types/database.types';
import { departmentService } from '../../services/department.service';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { AlertCircle } from 'lucide-react';

interface AssignComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  departments: Department[];
  onAssign: (departmentId: string, facultyId: string, remarks?: string) => Promise<void>;
}

export const AssignComplaintModal: React.FC<AssignComplaintModalProps> = ({
  isOpen,
  onClose,
  complaint,
  departments,
  onAssign,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(complaint.department_id || '');
  const [facultyMembers, setFacultyMembers] = useState<Profile[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    complaint.assigned_faculty_id || ''
  );
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    const fetchFaculty = async () => {
      setLoadingFaculty(true);
      try {
        const list = await departmentService.getFacultyMembers(
          selectedDeptId || undefined
        );
        setFacultyMembers(list);
        if (complaint.assigned_faculty_id && !selectedFacultyId) {
          setSelectedFacultyId(complaint.assigned_faculty_id);
        }
      } finally {
        setLoadingFaculty(false);
      }
    };
    fetchFaculty();
  }, [isOpen, selectedDeptId, complaint.assigned_faculty_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId) {
      setErrorMessage('Please select a registered faculty member to assign.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onAssign(selectedDeptId, selectedFacultyId, remarks);
      onClose();
    } catch (err: any) {
      console.error('[UniBridge] Assignment submission error:', err);
      setErrorMessage(err.message || 'Failed to assign complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const facultyOptions = facultyMembers.map((f) => ({
    value: f.id,
    label: `${f.full_name} (${f.email})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Ticket: ${complaint.ticket_number}`}
      description="Select the responsible campus department and faculty lead to handle this issue."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Select
          label="Campus Department"
          placeholder="Select Department..."
          options={departmentOptions}
          value={selectedDeptId}
          onChange={(e) => {
            setSelectedDeptId(e.target.value);
            setSelectedFacultyId('');
          }}
          required
        />

        <Select
          label="Assigned Faculty Member"
          placeholder={
            loadingFaculty
              ? 'Loading registered faculty...'
              : facultyMembers.length === 0
              ? 'No registered faculty available'
              : 'Select Faculty Member...'
          }
          options={facultyOptions}
          value={selectedFacultyId}
          onChange={(e) => setSelectedFacultyId(e.target.value)}
          disabled={loadingFaculty || facultyMembers.length === 0}
          required
          helperText={
            !loadingFaculty && facultyMembers.length === 0
              ? 'No faculty accounts are registered in the system for this department yet.'
              : undefined
          }
        />

        <Textarea
          label="Internal Assignment Instructions"
          placeholder="e.g. Please prioritize inspection of circuit breaker; reported by 3 students."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !selectedFacultyId}
          >
            Assign Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
