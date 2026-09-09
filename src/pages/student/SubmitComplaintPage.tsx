import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { departmentService } from '../../services/department.service';
import { aiService, AIComplaintAnalysis } from '../../services/ai.service';
import {
  ComplaintCategory,
  ComplaintPriority,
  Department,
  Profile,
} from '../../types/database.types';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
} from '../../lib/constants';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import {
  Sparkles,
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

export const SubmitComplaintPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('infrastructure');
  const [complaintType, setComplaintType] = useState<
    'Faculty' | 'Classroom' | 'Infrastructure' | 'Academic' | 'Hostel' | 'Transport' | 'Other'
  >('Infrastructure');
  const [location, setLocation] = useState('');
  const [buildingRoom, setBuildingRoom] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyId, setFacultyId] = useState('');
  const [facultyMembers, setFacultyMembers] = useState<Profile[]>([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Assistance State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIComplaintAnalysis | null>(null);

  useEffect(() => {
    departmentService.getDepartments().then((data) => setDepartments(data));
  }, []);

  // Fetch faculty members when department changes
  useEffect(() => {
    if (!departmentId) {
      setFacultyMembers([]);
      setFacultyId('');
      return;
    }
    const selectedDept = departments.find((d) => d.id === departmentId);
    setLoadingFaculty(true);
    departmentService
      .getFacultyMembers(departmentId, selectedDept?.code)
      .then((data) => {
        setFacultyMembers(data);
        setLoadingFaculty(false);
      })
      .catch(() => setLoadingFaculty(false));
  }, [departmentId, departments]);

  const handleTypeChange = (type: typeof complaintType) => {
    setComplaintType(type);
    if (type === 'Faculty') {
      setCategory('academic');
    } else if (type === 'Classroom') {
      setCategory('infrastructure');
    } else if (type === 'Infrastructure') {
      setCategory('infrastructure');
    } else if (type === 'Academic') {
      setCategory('academic');
    } else if (type === 'Hostel') {
      setCategory('hostel');
    } else if (type === 'Transport') {
      setCategory('transport');
    } else {
      setCategory('other');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 4)); // max 4 files
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Run AI Analysis on Title and Description
  const handleRunAiAnalysis = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please enter both a title and description before running AI analysis.');
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeComplaint(title, description);
      setAiAnalysis(result);
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply AI Suggestions to form fields
  const applyAiSuggestions = () => {
    if (!aiAnalysis) return;
    setCategory(aiAnalysis.predictedCategory);
    setPriority(aiAnalysis.predictedPriority);

    // If department code matches any department, preselect it
    const matchingDept = departments.find(
      (d) => d.code === aiAnalysis.suggestedDepartmentCode
    );
    if (matchingDept) {
      setDepartmentId(matchingDept.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await complaintService.createComplaint(
        {
          title,
          description,
          category,
          location,
          building_room: buildingRoom,
          is_anonymous: isAnonymous,
          priority,
          department_id: departmentId || undefined,
          assigned_faculty_id: complaintType === 'Faculty' ? facultyId || undefined : undefined,
          ai_predicted_category: aiAnalysis?.predictedCategory,
          ai_predicted_priority: aiAnalysis?.predictedPriority,
          ai_summary: aiAnalysis?.summary,
        },
        user.id,
        files
      );

      if (error) {
        setErrorMessage(error.message || 'Failed to submit complaint.');
      } else if (data) {
        navigate(`/student/complaints/${data.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = COMPLAINT_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const priorityOptions = COMPLAINT_PRIORITIES.map((p) => ({
    value: p.value,
    label: `${p.label} - ${p.description}`,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Submit Campus Issue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide accurate details so the responsible campus department can triage and resolve your request quickly.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2.5">
            1. Issue Description
          </h3>

          <Input
            label="Issue Title"
            placeholder="e.g., Water leakage in Hostel B 2nd floor washroom"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
          />

          <Textarea
            label="Detailed Description"
            placeholder="Describe what is broken or malfunctioning, when you noticed it, and any immediate impact..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            maxLength={1000}
            showCount
          />

          {/* AI Assistance Action Card */}
          <div className="bg-gradient-to-r from-pastel-lavender-50 to-pastel-pink-50 rounded-2xl p-4 border border-pastel-lavender-200/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-brand-700">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Gemini AI Triage Assistant
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Analyze title & description to suggest category and urgency priority.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRunAiAnalysis}
                isLoading={isAnalyzing}
                disabled={isAnalyzing || !title.trim() || !description.trim()}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Analyze with AI
              </Button>
            </div>

            {/* AI Results Preview */}
            {aiAnalysis && (
              <div className="mt-3 pt-3 border-t border-pastel-lavender-200/60 text-xs space-y-2 animate-slide-up">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-pastel-lavender-200/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Suggested Category
                    </span>
                    <p className="font-semibold capitalize text-brand-700 mt-0.5">
                      {aiAnalysis.predictedCategory.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-pastel-lavender-200/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Severity Urgency
                    </span>
                    <p className="font-semibold capitalize text-brand-700 mt-0.5">
                      {aiAnalysis.predictedPriority} Priority
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic bg-white/50 p-2 rounded-lg">
                  💡 Reasoning: {aiAnalysis.reasoning}
                </p>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="pastel"
                    size="sm"
                    onClick={applyAiSuggestions}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Apply AI Suggestions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Classification & Location Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2.5">
            2. Issue Classification & Routing
          </h3>

          {/* Complaint Type Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Complaint Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'Faculty',
                  'Classroom',
                  'Infrastructure',
                  'Academic',
                  'Hostel',
                  'Transport',
                  'Other',
                ] as const
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all select-none ${
                    complaintType === type
                      ? 'bg-pastel-lavender-100 border-brand-300 text-brand-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type === 'Faculty' ? '👨‍🏫 Faculty Member' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Special Faculty Routing Section */}
          {complaintType === 'Faculty' ? (
            <div className="p-4 rounded-2xl bg-pastel-lavender-50/70 border border-pastel-lavender-200/80 space-y-4">
              <div className="flex items-start gap-2.5 text-xs text-brand-900">
                <GraduationCap className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Faculty-Related Issue Routing</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Select the academic department and the respective faculty member so the complaint is directly assigned and tracked for departmental resolution.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="1. Academic Department"
                  placeholder="Select Department..."
                  options={departmentOptions}
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                />

                <Select
                  label="2. Faculty Member"
                  placeholder={
                    !departmentId
                      ? 'Select department first...'
                      : loadingFaculty
                      ? 'Loading department faculty...'
                      : facultyMembers.length === 0
                      ? 'No faculty found for department'
                      : 'Select Faculty Member...'
                  }
                  options={facultyMembers.map((f) => ({
                    value: f.id,
                    label: `${f.full_name} (${f.email})`,
                  }))}
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  disabled={!departmentId || loadingFaculty}
                  required
                  helperText={
                    departmentId && facultyMembers.length > 0
                      ? `Found ${facultyMembers.length} faculty member(s) in this department.`
                      : undefined
                  }
                />
              </div>
            </div>
          ) : (
            departments.length > 0 && (
              <Select
                label="Assigned Department (Optional)"
                placeholder="Let Administration route automatically..."
                options={departmentOptions}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                helperText="Leave blank if you are unsure which campus department handles this."
              />
            )
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Issue Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              required
            />

            <Select
              label="Priority Level"
              options={priorityOptions}
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Campus Location / Zone"
              placeholder="e.g., North Campus, Science Block"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <Input
              label="Specific Building & Room / Lab #"
              placeholder="e.g., Building 4, Lab 203"
              value={buildingRoom}
              onChange={(e) => setBuildingRoom(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
            />
          </div>
        </Card>

        {/* Attachments & Privacy Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2.5">
            3. Supporting Photos & Privacy
          </h3>

          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Attach Images or PDF Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-brand-300 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-5 h-5 text-brand-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Click or drag images / documents to upload
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports PNG, JPG, WebP, PDF (Max 10MB per file, up to 4 attachments)
                </p>
              </div>
            </div>

            {/* Uploaded files preview list */}
            {files.length > 0 && (
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate max-w-[180px] font-medium">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Option Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3.5 bg-pastel-lavender-50/50 rounded-2xl border border-pastel-lavender-200/60">
              <input
                type="checkbox"
                id="anonymous-toggle"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="anonymous-toggle" className="cursor-pointer">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Submit as Anonymous Grievance</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Your name and contact info will be masked as &quot;Anonymous Student&quot; on faculty and administrative inspection views. You will still be able to track resolution under your personal account.
                </p>
              </label>
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/student/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Grievance
          </Button>
        </div>
      </form>
    </div>
  );
};
