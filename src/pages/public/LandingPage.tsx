import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  Users,
  ChevronRight,
  Send,
  CalendarDays,
  FilePlus2,
  ListTodo,
  Layers,
  Lock,
  EyeOff,
  Bell,
  BarChart3,
  CheckSquare,
  Building,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const LandingPage: React.FC = () => {
  const { user, role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/25 group-hover:scale-105 transition-transform duration-150">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Uni<span className="text-brand-600">Bridge</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="hover:text-brand-600 transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-brand-600 transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('roles')}
              className="hover:text-brand-600 transition-colors"
            >
              Roles
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-brand-600 transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('trust')}
              className="hover:text-brand-600 transition-colors"
            >
              Privacy & Trust
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm shadow-brand-500/20"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="hero"
        className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-pastel-lavender-50/40 to-white"
      >
        {/* Soft pastel ambient gradient circles */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-pastel-pink-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-pastel-lavender-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pastel-lavender-100/90 border border-pastel-lavender-200 text-brand-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Next-Generation University Operations Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                One Campus.
                <br />
                <span className="text-brand-600">Every Voice.</span>
                <br />
                Better Resolution.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                UniBridge connects students, faculty, and administration in a unified ecosystem. From faculty-related concerns to infrastructure grievances and class timetables, campus operations are made transparent, accountable, and prompt.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                {user ? (
                  <Link to={getDashboardLink()} className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto shadow-sm shadow-brand-500/25"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Go to Your Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto shadow-sm shadow-brand-500/25"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Get Started
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => scrollToSection('how-it-works')}
                      className="w-full sm:w-auto"
                    >
                      See How It Works
                    </Button>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Role Auth
                </span>
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-brand-600" />
                  Anonymous Reporting
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Audit Timelines
                </span>
              </div>
            </div>

            {/* Visual Hero Dashboard Preview Mockup */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Decorative border wrap */}
                <div className="rounded-3xl p-2 bg-gradient-to-tr from-pastel-pink-200/60 via-pastel-lavender-200 to-pastel-pink-100 shadow-xl shadow-brand-500/10 border border-pastel-lavender-200/80">
                  <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-subtle border border-slate-100">
                    {/* Mock Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pastel-lavender-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                          UB
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Student Portal • Live Triage
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Computer Science & Engineering
                          </span>
                        </div>
                      </div>
                      <Badge variant="purple" size="sm">
                        Verified Student
                      </Badge>
                    </div>

                    {/* Active Grievance Card */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          UB-2026-0042
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          In Progress
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Lab 4 GPU Workstations Not Booting Prior to Algorithms Exam
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>Dept: CSE</span>
                        <span>•</span>
                        <span>Assigned: Dr. Ananya Rao</span>
                      </div>

                      {/* Mini Stepper */}
                      <div className="pt-2 flex items-center gap-1">
                        <div className="h-1.5 flex-1 rounded-full bg-brand-600" />
                        <div className="h-1.5 flex-1 rounded-full bg-brand-600" />
                        <div className="h-1.5 flex-1 rounded-full bg-brand-600" />
                        <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
                        <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
                      </div>
                    </div>

                    {/* Today's Schedule Snapshot */}
                    <div className="p-3.5 rounded-xl bg-pastel-lavender-50/50 border border-pastel-lavender-200/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-600 shadow-2xs">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            Data Structures & Algorithms
                          </span>
                          <span className="text-[11px] text-slate-500">
                            09:00 AM • LH-201 (Dr. Ananya Rao)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Next
                      </span>
                    </div>

                    {/* AI Smart Triage Banner */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-pastel-pink-50 to-pastel-lavender-50 border border-pastel-lavender-200/60 flex items-center gap-2.5 text-xs text-slate-700">
                      <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>
                        <strong>Gemini AI</strong> auto-assigned department & priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-pastel-lavender-100 px-3 py-1 rounded-full">
              Streamlined Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How UniBridge Resolves Campus Issues
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              A transparent, 4-step grievance resolution and campus management lifecycle designed for university accountability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01 */}
            <Card className="p-6 space-y-4 hover:border-brand-300 transition-all hover:shadow-xs group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  01
                </div>
                <FilePlus2 className="w-5 h-5 text-brand-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Report</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students log a concern — choose faculty-related grievances, hostel, or classroom infrastructure. Opt for anonymous reporting to safeguard student privacy.
              </p>
            </Card>

            {/* Step 02 */}
            <Card className="p-6 space-y-4 hover:border-brand-300 transition-all hover:shadow-xs group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-pastel-pink-100 text-rose-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  02
                </div>
                <Sparkles className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Routing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                UniBridge analyzes category and priority, instantly routing the ticket to the right department head or assigned faculty member.
              </p>
            </Card>

            {/* Step 03 */}
            <Card className="p-6 space-y-4 hover:border-brand-300 transition-all hover:shadow-xs group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-purple-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  03
                </div>
                <CheckSquare className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Resolve</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Faculty or campus administrative staff inspect the issue, record status updates, provide progress remarks, and resolve the grievance.
              </p>
            </Card>

            {/* Step 04 */}
            <Card className="p-6 space-y-4 hover:border-brand-300 transition-all hover:shadow-xs group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  04
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Track</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow resolution milestones in real time on the visual stepper, read updates, participate in inquiry threads, and confirm satisfaction.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. ROLES SECTION */}
      <section id="roles" className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-pastel-lavender-100 px-3 py-1 rounded-full">
              University Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored for Every Campus Role
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Dedicated, permission-governed workspaces for students, professors, and administrative officers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <Card className="p-7 space-y-4 border border-slate-200/80 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Students</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowered to raise their voice with complete confidence and safety.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Submit faculty-specific or facility grievances</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Choose anonymous reporting when privacy is required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Live academic timetable and class room allocations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Transparent 5-stage progress timeline</span>
                </li>
              </ul>
            </Card>

            {/* Faculty Card */}
            <Card className="p-7 space-y-4 border border-brand-200 bg-white shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-pastel-pink-100 text-rose-600 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Faculty & Wardens</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct oversight into concerns assigned to their department or teaching units.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Review grievances routed to their department</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Update ticket status with mandatory resolution notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Staff-only internal notes for faculty collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Direct communication with student inquiries</span>
                </li>
              </ul>
            </Card>

            {/* Admin Card */}
            <Card className="p-7 space-y-4 border border-slate-200/80 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Administration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Campus-wide governance, SLA oversight, and operational analytics.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>All-campus operations and grievance dispatch desk</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Department management and faculty assignment routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Priority overrides for critical health and safety matters</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Analytics on resolution rates and category trends</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. FEATURE SECTION */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-pastel-lavender-100 px-3 py-1 rounded-full">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Real Campus Needs
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Built with modern web standards, PostgreSQL Row Level Security, and Google Gemini AI assistance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Faculty Complaint Reporting */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pastel-lavender-100 text-brand-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Faculty Complaint Routing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit grievances specifically linked to academic faculty with department-level routing and confidential management.
              </p>
            </div>

            {/* Feature 2: AI-Assisted Categorization */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pastel-pink-100 text-rose-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">AI-Assisted Categorization</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini AI parses issue titles and descriptions to predict category, severity, and recommend target departments.
              </p>
            </div>

            {/* Feature 3: Complaint Timeline */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Auditable Timelines</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immutable audit trail tracking every step: submission, faculty review, status transition, and resolution sign-off.
              </p>
            </div>

            {/* Feature 4: Department Routing */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pastel-lavender-100 text-brand-700 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Department Routing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organized across 10 official university departments (CSE, IT, ECE, EEE, ME, CE, AI & DS, Mathematics, Physics, English).
              </p>
            </div>

            {/* Feature 5: Anonymous Reporting */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Anonymous Reporting</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student identifiers are scrubbed from faculty and public views while still allowing the submitting student to track updates.
              </p>
            </div>

            {/* Feature 6: Class Timetable */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Student Timetable</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Weekly class schedules, room allocations, faculty identifiers, and real-time &apos;in-session&apos; course trackers.
              </p>
            </div>

            {/* Feature 7: Evidence Attachments */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Evidence Uploads</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attach photographic or PDF proof directly to tickets, securely hosted via Supabase Storage buckets.
              </p>
            </div>

            {/* Feature 8: Campus Notifications */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Real-Time Alerts</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant notification bells alerting stakeholders when remarks are added or resolution status progresses.
              </p>
            </div>

            {/* Feature 9: Admin Analytics */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Executive Analytics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data-driven charts detailing resolution efficiency, backlog volume, and department service level compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & PRIVACY SECTION */}
      <section id="trust" className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy by Design & Enterprise Trust
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Universities require strict data boundaries. UniBridge enforces PostgreSQL Row Level Security (RLS) on every table, ensuring members only view data permitted by their verified campus credential.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-600" />
                Row-Level Security
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                PostgreSQL policies verify JWT signatures directly at the database layer before allowing query execution.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-brand-600" />
                Protected Identity
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anonymous grievance flags mask student roll numbers and names from faculty review cards.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                Role Separation
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students, faculty, and administrative portals are strictly partitioned with zero privilege leakage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            Make campus communication simpler.
          </h2>
          <p className="text-base text-purple-100 max-w-xl mx-auto leading-relaxed">
            Join hundreds of students and faculty on UniBridge. Submit concerns, review departmental progress, and build a better university together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {user ? (
              <Link to={getDashboardLink()} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-50 font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Go to Campus Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-50 font-bold shadow-md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 font-semibold text-sm transition-all"
                  >
                    Log In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-14 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Col 1 & 2: Brand */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  Uni<span className="text-brand-400">Bridge</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Unified campus operations, grievance tracking, and academic coordination platform. Bridging students, faculty, and administrative leadership.
              </p>
              <p className="text-[11px] text-slate-500">
                PostgreSQL • Row Level Security • Google Gemini AI Triage
              </p>
            </div>

            {/* Col 3: Platform */}
            <div className="space-y-3">
              <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Platform
              </p>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('roles')}
                    className="hover:text-white transition-colors"
                  >
                    Campus Roles
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('trust')}
                    className="hover:text-white transition-colors"
                  >
                    Trust & Privacy
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Portals */}
            <div className="space-y-3">
              <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Portals
              </p>
              <ul className="space-y-2">
                <li>
                  <Link to="/student/dashboard" className="hover:text-white transition-colors">
                    Student Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/faculty/dashboard" className="hover:text-white transition-colors">
                    Faculty Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                    Admin Operations
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Account Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Campus Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Campus Policies */}
            <div className="space-y-3">
              <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Governance
              </p>
              <ul className="space-y-2">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Academic Integrity
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Terms of Campus Use
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Campus Grievance SLA
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} UniBridge Campus Platform. All rights reserved.</p>
            <p>Empowering transparent and responsive university communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
