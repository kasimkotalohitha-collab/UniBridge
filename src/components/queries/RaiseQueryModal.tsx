import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TimetableEntry } from '../../services/timetable.service';
import { queryService } from '../../services/query.service';
import { ClassQuery } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import {
  HelpCircle,
  User,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface RaiseQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  classEntry: TimetableEntry | null;
  onSuccess?: (query: ClassQuery) => void;
}

export const RaiseQueryModal: React.FC<RaiseQueryModalProps> = ({
  isOpen,
  onClose,
  classEntry,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!classEntry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !classEntry) return;

    setError(null);
    setLoading(true);

    try {
      // Default to jyothi if faculty_id isn't explicit
      const facultyId =
        classEntry.faculty_id || '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba';

      const res = await queryService.createQuery({
        student_id: user.id,
        faculty_id: facultyId,
        department_id: classEntry.department_id || profile?.department_id || null,
        subject: classEntry.subject,
        course_code: classEntry.courseCode,
        room: classEntry.room,
        title: title.trim(),
        description: description.trim(),
        category,
        student_name: profile?.full_name || 'Student',
      });

      if (res.error) {
        throw res.error;
      }

      setSuccess(true);
      if (res.data && onSuccess) {
        onSuccess(res.data);
      }

      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise a Class Query"
      description="Directly ask a question or request clarification from your course instructor."
      maxWidth="lg"
    >
      {success ? (
        <div className="py-8 text-center space-y-3 animate-fade-in">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Query Submitted Successfully!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your query has been routed directly to <span className="font-semibold text-slate-700">{classEntry.faculty}</span>. You will receive a notification as soon as they respond.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Class Context Card */}
          <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md">
                {classEntry.courseCode}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {classEntry.startTime} - {classEntry.endTime}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-600" />
              {classEntry.subject}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">Instructor:</strong> {classEntry.faculty}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {classEntry.room}
              </span>
            </div>
          </div>

          {/* Student Sender Context */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
            <span>
              Query Sender:{' '}
              <strong className="text-slate-800">
                {profile?.full_name || 'Enrolled Student'}
              </strong>{' '}
              {profile?.student_id_number && (
                <span className="text-slate-400">({profile.student_id_number})</span>
              )}
            </span>
            <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Verified Student
            </span>
          </div>

          {/* Query Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Query Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="academic">Academic / Concept Doubt</option>
              <option value="assignment">Assignment & Homework Clarification</option>
              <option value="lab_practical">Lab Experiment & Code Debugging</option>
              <option value="attendance">Class Attendance & Absence Follow-up</option>
              <option value="exam_prep">Exam Preparation & Study Material</option>
              <option value="general">Other Course Inquiry</option>
            </select>
          </div>

          {/* Query Title */}
          <Input
            label="Query Subject / Topic"
            placeholder="e.g., Question on Time Complexity of QuickSort in today's lecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            leftIcon={<HelpCircle className="w-4 h-4" />}
            required
          />

          {/* Query Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Question / Doubt
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your question in detail, including specific slides, problems, or code snippets..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={loading}
              disabled={loading || !title.trim() || !description.trim()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Query to Faculty
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
