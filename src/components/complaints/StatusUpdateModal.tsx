import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { COMPLAINT_STATUSES } from '../../lib/constants';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onUpdate: (newStatus: ComplaintStatus, remarks: string) => Promise<void>;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(selectedStatus, remarks);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = COMPLAINT_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status: ${complaint.ticket_number}`}
      description="Update the progress of this campus issue and record remarks for the student."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="New Status"
          options={statusOptions}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
          required
        />

        <Textarea
          label="Progress Remarks / Explanation"
          placeholder="e.g., Electrician inspected the switchboard in Hall 3; replacement scheduled for tomorrow morning."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
          rows={4}
          helperText="These remarks will be visible to the student in the ticket timeline."
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};
