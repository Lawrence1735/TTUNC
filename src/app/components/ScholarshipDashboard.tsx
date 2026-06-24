import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { NotificationPanel } from './NotificationPanel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  X,
  XCircle,
  CheckCircle,
  Upload,
  AlertCircle,
  Calendar,
  Users,
  Award,
  FileText,
  Edit,
  ChevronDown,
  Clock,
  Music,
  Trophy,
  Target,
  Gift,
  User,
  Bell,
  LogOut,
  Settings as SettingsIcon,
  Lock,
  Shield
} from './ui/icons';
import type { User as UserType, Benefit, ScholarshipRenewal, Notification } from '../App';
import type { Evaluation } from './DirectorDashboardEnhanced';
import { getTalentGroupName } from './ui/unc-colors';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
// ── Accessibility components (WCAG 2.1 AA / ISO 9241 / ISO 25010) ──────────────
import { SkipToContent, EmptyState, ResponsiveTable } from './accessibility';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

interface ScholarshipDashboardProps {
  user: UserType;
  onLogout: () => void;
  benefits: Benefit[];
  renewals: ScholarshipRenewal[];
  evaluations: Evaluation[];
  notifications: Notification[];
  onSubmitRenewal: (renewalData: Omit<ScholarshipRenewal, 'id' | 'submittedAt'>) => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onNavigate?: (view: 'scholar' | 'member-profile' | 'engagement' | 'scholarship' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
}

export function ScholarshipDashboard({ 
  user, 
  onLogout, 
  benefits,
  renewals,
  evaluations,
  notifications,
  onSubmitRenewal,
  onMarkNotificationRead,
  onNavigate
}: ScholarshipDashboardProps) {
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hiddenNotifIds, setHiddenNotifIds] = useState<string[]>([]);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showEvaluationDetails, setShowEvaluationDetails] = useState(false);
  const [uploadedRequirement, setUploadedRequirement] = useState<string>('');
  const [renewalData, setRenewalData] = useState({
    semester: '',
    year: new Date().getFullYear(),
    gpa: 0,
    gradeDocument: ''
  });

  const scholarshipPercentage = user.scholarshipPercentage || 100;

  const visibleNotifications = notifications.filter(n => !hiddenNotifIds.includes(n.id));
  const unreadNotifications = visibleNotifications.filter(n => !n.read);
  const currentRenewal = renewals.find(r => r.userId === user.id && r.status === 'pending');
  
  const latestEvaluation = evaluations.length > 0 
    ? evaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast.success(`Navigated to ${sectionId.replace('-', ' ')}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedRequirement(file.name);
      setRenewalData(prev => ({ ...prev, gradeDocument: file.name }));
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const handleSubmitRenewal = () => {
    if (!renewalData.semester) {
      toast.error('Please select a semester');
      return;
    }
    if (!Number.isFinite(Number(renewalData.year)) || Number(renewalData.year) < 2000 || Number(renewalData.year) > 2100) {
      toast.error('Please enter a valid year');
      return;
    }
    if (renewalData.gpa < 1.0) {
      toast.error('Please enter a valid GPA');
      return;
    }
    if (!renewalData.gradeDocument) {
      toast.error('Please upload your grade document');
      return;
    }
    if (renewalData.gpa < 2.5) {
      toast.warning('Warning: GPA below required minimum of 2.5. Your application may be rejected.');
    }

    onSubmitRenewal({
      userId: user.id!,
      semester: renewalData.semester,
      year: Number(renewalData.year),
      gpa: renewalData.gpa,
      documents: [renewalData.gradeDocument],
      status: 'pending',
      reviewedAt: undefined,
      reviewNotes: undefined
    });
    
    toast.success('Grade submission successful! Your director will review it for scholarship renewal.');
    setShowRenewalForm(false);
    setRenewalData({ semester: '', year: new Date().getFullYear(), gpa: 0, gradeDocument: '' });
    setUploadedRequirement('');
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    onMarkNotificationRead(notificationId);
    toast.success('Notification marked as read');
  };

  const getBenefitStatusColor = (status: string) => {
    switch (status) {
      case 'active':  return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  };

  const roleLabelMap: Record<string, string> = {
    admin:    'Admin Dashboard',
    director: 'Director Dashboard',
    scholar:  'Scholar Dashboard',
    trainee:  'Trainee Dashboard',
    student:  'Student Dashboard',
  };
  const dashboardLabel =
    user.role === 'trainee' || user.trainingStatus === 'in_progress'
      ? 'Trainee Dashboard'
      : roleLabelMap[user.role] ?? 'Scholar Dashboard';

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
            {/* Logo + Title */}
            <div>
              <div>
                <h1 className="text-xl leading-tight">
                  <span className="font-bold text-[#0F172A]">Talent</span>
                  <span className="text-[#0F172A]">Track</span>
                  <span className="font-bold text-[#7A1E1E]">UNC</span>
                </h1>
                <p className="text-xs text-muted-foreground">{dashboardLabel}</p>
              </div>
            </div>
            
            {/* Right: Notifications + User + Settings */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-9 h-9 p-0 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:border-[#7A1E1E] hover:text-[#7A1E1E] text-[#475569] transition-colors"
                  aria-label={
                    unreadNotifications.length > 0
                      ? `Notifications — ${unreadNotifications.length} unread`
                      : 'Notifications — no unread'
                  }
                  aria-expanded={showNotifications}
                  aria-controls="notifications-panel"
                  aria-haspopup="dialog"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {unreadNotifications.length > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-[9px] font-bold"
                      aria-hidden="true"
                    >
                      {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                    </Badge>
                  )}
                </Button>
                
                {showNotifications && (
                  <NotificationPanel
                    notifications={visibleNotifications}
                    onMarkAsRead={(id) => onMarkNotificationRead(id)}
                    onMarkAllAsRead={() => visibleNotifications.filter(n => !n.read).forEach(n => onMarkNotificationRead(n.id))}
                    onDeleteNotification={(id) => setHiddenNotifIds(prev => [...prev, id])}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* User Info */}
              <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
                <div className="w-8 h-8 rounded-full bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#7A1E1E]" aria-hidden="true" />
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{user.name}</p>
                  <p className="text-[11px] text-[#64748B] leading-none mt-0.5">
                    {user.talentGroup
                      ? getTalentGroupName(user.talentGroup)
                      : user.role === 'admin'
                        ? 'Admin'
                        : user.role === 'director'
                          ? 'Director'
                          : user.role === 'scholar'
                            ? 'Scholar'
                            : user.role === 'trainee' || user.trainingStatus === 'in_progress'
                              ? 'Trainee'
                              : 'Student'}
                  </p>
                </div>
              </div>
              
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="flex items-center gap-1.5 border border-[#7A1E1E] rounded-lg px-3 py-1.5 text-sm font-medium text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors duration-200 h-auto min-h-0"
                    aria-label="Open settings menu"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate?.('settings', 'account')}>
                    <User className="w-4 h-4 mr-2" aria-hidden="true" />Account Settings                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate?.('settings', 'security')}>
                    <Lock className="w-4 h-4 mr-2" aria-hidden="true" />Security                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowLogoutConfirmation(true)} variant="destructive">
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />Logout                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
      </header>

      {/* ── Dashboard Navigation ─────────────────────────────────────────────── */}
      {onNavigate && (
        <nav className="bg-white border-b border-[#E2E8F0]" aria-label="Dashboard sections">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px]">
            <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Dashboard views">
              {([
                { key: 'member-profile', label: 'Member Profile', active: false, cb: () => onNavigate('member-profile'), Icon: User },
                { key: 'engagement',     label: 'Engagement',     active: false, cb: () => onNavigate('engagement'),    Icon: Calendar },
                { key: 'scholarship',    label: 'Scholarship',    active: true,  cb: undefined,                          Icon: Award },
              ] as const).map(({ key, label, active, cb, Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? 'page' : undefined}
                  onClick={cb}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-b-2 ${
                    active
                      ? 'border-[#7A1E1E] text-[#7A1E1E]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-6">

        {/* Quick Stats — Dashboard Overview */}
        <section aria-labelledby="quick-stats-heading" className="mb-8">
          <h2 id="quick-stats-heading" className="sr-only">Quick Statistics</h2>
          <div
            className="grid grid-cols-2 gap-4"
            role="list"
            aria-label="Scholarship quick statistics"
          >
            <div role="listitem" aria-label={`Scholarship Status: ${scholarshipPercentage}%. Activate to view details.`}>
              <DashboardQuickStatCard
                label="Scholarship Status"
                value={`${scholarshipPercentage}%`}
                onClick={() => scrollToSection('scholarship-details')}
              />
            </div>

            <div role="listitem" aria-label={`Renewal Status: ${currentRenewal ? 'Pending' : 'Ready to apply'}. Activate to view renewal section.`}>
              <DashboardQuickStatCard
                label="Renewal Status"
                value={currentRenewal ? 'Pending' : 'Ready'}
                onClick={() => scrollToSection('renewal-section')}
              />
            </div>
          </div>
        </section>

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="mb-2 text-[#880808]">Scholarship Management</h2>
          <p className="text-muted-foreground">
            Manage your scholarship benefits and renewal applications.
          </p>
        </div>

        {/* Scholarship Status Alert */}
        {currentRenewal && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50" role="status" aria-live="polite">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <AlertDescription>
              You have a pending scholarship renewal application submitted on{' '}
              {currentRenewal.submittedAt?.toLocaleDateString()}.{' '}
              Please wait for the review results.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">

          {/* ── Scholarship Details ──────────────────────────────────────────── */}
          <section aria-labelledby="scholarship-details-heading">
            <Card className="border-[#e0e0e0]" id="scholarship-details">
              <CardHeader>
                <CardTitle className="text-[#880808] flex items-center" id="scholarship-details-heading">
                  <Award className="w-5 h-5 mr-2" aria-hidden="true" />
                  Scholarship Details
                </CardTitle>
                <CardDescription className="text-[#6c757d]">
                  Your current scholarship grant information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-[#e0e0e0]">
                    <div>
                      <p className="text-sm text-[#6c757d]">Current Scholarship Grant</p>
                      <p
                        className="text-3xl text-[#880808] mt-1"
                        aria-label={`Current scholarship grant: ${scholarshipPercentage} percent`}
                      >
                        {scholarshipPercentage}%
                      </p>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
                  </div>

                  <dl className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-[#e0e0e0] rounded-lg">
                      <dt className="text-sm text-[#6c757d] mb-2">Talent Group</dt>
                      <dd className="text-sm">{user.talentGroup?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</dd>
                    </div>
                    <div className="p-4 border border-[#e0e0e0] rounded-lg">
                      <dt className="text-sm text-[#6c757d] mb-2">Student ID</dt>
                      <dd className="text-sm">{user.studentId}</dd>
                    </div>
                  </dl>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note" aria-label="Scholarship requirements">
                    <h3 className="text-sm text-blue-900 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" aria-hidden="true" />Scholarship Requirements                    </h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1" aria-hidden="true">•</span>
                        <span>Maintain a minimum GPA of 2.5</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1" aria-hidden="true">•</span>
                        <span>Attend all required practices and engagements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1" aria-hidden="true">•</span>
                        <span>Submit renewal application each semester</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1" aria-hidden="true">•</span>
                        <span>Maintain good standing with the university</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Renewal Application ──────────────────────────────────────────── */}
          <section aria-labelledby="renewal-section-heading">
            <Card className="border-[#e0e0e0]" id="renewal-section">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-[#880808] flex items-center" id="renewal-section-heading">
                      <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
                      Renewal Application
                    </CardTitle>
                    <CardDescription className="text-[#6c757d]">
                      Submit your scholarship renewal for the next semester
                    </CardDescription>
                  </div>
                  {!currentRenewal && (
                    <Dialog open={showRenewalForm} onOpenChange={setShowRenewalForm}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#880808] hover:bg-[#660606] min-h-[44px]">
                          <Upload className="w-4 h-4 mr-2" aria-hidden="true" />Apply for Renewal                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#880808]">Scholarship Renewal Application</DialogTitle>
                          <DialogDescription className="text-[#6c757d]">
                            Please provide the required information for your scholarship renewal
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          aria-label="Scholarship renewal application form"
                          onSubmit={(e) => { e.preventDefault(); handleSubmitRenewal(); }}
                          noValidate
                        >
                          <div className="space-y-4">
                            {/* Semester */}
                            <div>
                              <Label htmlFor="renewal-semester">
                                Semester <span className="text-red-600" aria-hidden="true">*</span>
                                <span className="sr-only">(required)</span>
                              </Label>
                              <Select
                                value={renewalData.semester}
                                onValueChange={(value) => setRenewalData(prev => ({ ...prev, semester: value }))}
                              >
                                <SelectTrigger id="renewal-semester" className="mt-1 h-[44px]" aria-required="true">
                                  <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1st">1st</SelectItem>
                                  <SelectItem value="2nd">2nd</SelectItem>
                                  <SelectItem value="Summer">Summer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Year */}
                            <div>
                              <Label htmlFor="renewal-year">
                                Year <span className="text-red-600" aria-hidden="true">*</span>
                                <span className="sr-only">(required)</span>
                              </Label>
                              <Input
                                id="renewal-year"
                                type="number"
                                min="2000"
                                max="2100"
                                step="1"
                                inputMode="numeric"
                                placeholder="e.g., 2026"
                                value={renewalData.year}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  const parsed = parseInt(raw, 10);
                                  const safeYear = Number.isNaN(parsed)
                                    ? new Date().getFullYear()
                                    : Math.min(2100, Math.max(2000, parsed));
                                  setRenewalData(prev => ({ ...prev, year: safeYear }));
                                }}
                                className="mt-1 h-[44px]"
                                required
                                aria-required="true"
                              />
                            </div>

                            {/* GPA */}
                            <div>
                              <Label htmlFor="gpa">
                                Current GPA <span className="text-red-600" aria-hidden="true">*</span>
                                <span className="sr-only">(required)</span>
                              </Label>
                              <Input
                                id="gpa"
                                type="number"
                                step="0.01"
                                min="1.0"
                                max="4.0"
                                inputMode="decimal"
                                placeholder="e.g., 3.5"
                                value={renewalData.gpa || ''}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = parseFloat(raw);
                                  const safeGpa = Number.isNaN(parsed)
                                    ? 0
                                    : Math.min(4, Math.max(1, Number(parsed.toFixed(2))));
                                  setRenewalData(prev => ({ ...prev, gpa: safeGpa }));
                                }}
                                className="mt-1 h-[44px]"
                                required
                                aria-required="true"
                                aria-describedby="gpa-hint"
                              />
                              <p id="gpa-hint" className="text-xs text-[#6c757d] mt-1">
                                Minimum required GPA: 2.5
                              </p>
                            </div>

                            {/* Grade Document */}
                            <div>
                              <Label htmlFor="gradeDocument">
                                Upload Grade Document <span className="text-red-600" aria-hidden="true">*</span>
                                <span className="sr-only">(required)</span>
                              </Label>
                              <Input
                                id="gradeDocument"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="mt-1"
                                aria-required="true"
                                aria-describedby="grade-doc-hint"
                              />
                              <p id="grade-doc-hint" className="text-xs text-[#6c757d] mt-1">
                                Only PDF format accepted
                              </p>
                              {uploadedRequirement && (
                                <Alert className="border-green-500 bg-green-50 mt-2" role="status" aria-live="polite">
                                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                  <AlertDescription>
                                    File "{uploadedRequirement}" uploaded successfully
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="min-h-[44px]"
                                onClick={() => setShowRenewalForm(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                className="bg-[#880808] hover:bg-[#660606] min-h-[44px]"
                              >
                                Submit Application
                              </Button>
                            </div>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentRenewal ? (
                  <div>
                    <ResponsiveTable
                      caption="Current scholarship renewal application"
                      ariaLabel="Current scholarship renewal application"
                      columns={[
                        { key: 'submittedAt',   label: 'Date Submitted' },
                        { key: 'semester',      label: 'Semester' },
                        { key: 'year',          label: 'Year' },
                        { key: 'gpa',           label: 'GPA' },
                        { key: 'gradeDocument', label: 'Grade Document' },
                        { key: 'status',        label: 'Status' },
                      ]}
                      data={[currentRenewal]}
                      renderCell={(renewal, column) => {
                        if (column.key === 'submittedAt') return <span>{renewal.submittedAt?.toLocaleDateString()}</span>;
                        if (column.key === 'semester')    return <span>{renewal.semester}</span>;
                        if (column.key === 'year')        return <span>{renewal.year}</span>;
                        if (column.key === 'gpa')         return <span>{renewal.gpa.toFixed(2)}</span>;
                        if (column.key === 'gradeDocument') return renewal.documents && renewal.documents.length > 0 ? (
                          <span className="text-blue-600 flex items-center">
                            <FileText className="w-4 h-4 mr-1" aria-hidden="true" />
                            {renewal.documents[0]}
                          </span>
                        ) : <span>No document</span>;
                        if (column.key === 'status') return (
                          <Badge className="bg-yellow-600 hover:bg-yellow-600">
                            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                            Pending
                          </Badge>
                        );
                        return null;
                      }}
                    />
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded" role="status" aria-live="polite">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4 inline mr-2" aria-hidden="true" />
                        Your renewal application is being reviewed by the director. You will be notified once the review is complete.
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="w-12 h-12" />}
                    title="No pending renewal application"
                    description='Click "Apply for Renewal" above to submit your grades for scholarship renewal.'
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* ── Renewal History & Evaluations ───────────────────────────────── */}
          <section aria-labelledby="renewal-history-heading">
            <Card className="border-[#e0e0e0]" id="renewal-history">
              <CardHeader>
                <CardTitle className="text-[#880808] flex items-center" id="renewal-history-heading">
                  <FileText className="w-5 h-5 mr-2" aria-hidden="true" />
                  Renewal History &amp; Evaluations
                </CardTitle>
                <CardDescription className="text-[#6c757d]">
                  Your previous scholarship evaluations and renewal applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluations.length > 0 ? (
                  <ol className="space-y-4" aria-label="Evaluation history, most recent first">
                    {evaluations
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((evaluation) => {
                        const matchingRenewal = renewals.find(r => 
                          r.userId === user.id && 
                          r.status !== 'pending' &&
                          new Date(r.submittedAt || '').getFullYear() === new Date(evaluation.date).getFullYear()
                        );

                        return (
                          <li key={evaluation.id}>
                            <article
                              className="p-5 border-2 border-[#e0e0e0] rounded-lg bg-gradient-to-r from-white to-gray-50"
                              aria-label={`Evaluation dated ${new Date(evaluation.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-bold text-[#1A1A1A] text-[16px]">
                                    {new Date(evaluation.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </h3>
                                  <p className="text-[12px] text-[#6c757d] mt-1">
                                    Evaluated by: {evaluation.ratedBy || 'Director'}
                                  </p>
                                </div>
                                <div className="text-right space-y-2">
                                  {evaluation.recommendForRenewal !== undefined && (
                                    <Badge className={evaluation.recommendForRenewal 
                                      ? 'bg-green-600 hover:bg-green-600 text-white text-[12px]' 
                                      : 'bg-red-600 hover:bg-red-600 text-white text-[12px]'
                                    }>
                                      {evaluation.recommendForRenewal ? (
                                        <>
                                          <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                                          Recommended
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                                          Not Recommended
                                        </>
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Performance Summary Grid */}
                              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                {evaluation.overallRating && (
                                  <div className="p-3 bg-white rounded-lg border border-[#e0e0e0] text-center">
                                    <dt className="text-[10px] text-[#6c757d] mb-1">Overall Rating</dt>
                                    <dd className="text-[20px] font-bold text-[#880808]">{evaluation.overallRating}/5.00</dd>
                                  </div>
                                )}
                                {evaluation.adjectivalRating && (
                                  <div className="p-3 bg-white rounded-lg border border-[#e0e0e0] text-center">
                                    <dt className="text-[10px] text-[#6c757d] mb-1">Rating</dt>
                                    <dd className="text-[14px] font-bold text-[#1A1A1A]">{evaluation.adjectivalRating}</dd>
                                  </div>
                                )}
                                {evaluation.scholarshipPercentage && (
                                  <div className="p-3 bg-gradient-to-br from-[#880808] to-[#6B0606] rounded-lg text-center">
                                    <dt className="text-[10px] text-white mb-1">Scholarship</dt>
                                    <dd className="text-[20px] font-bold text-white" aria-label={`${evaluation.scholarshipPercentage} percent scholarship`}>
                                      {evaluation.scholarshipPercentage}%
                                    </dd>
                                  </div>
                                )}
                              </dl>

                              {/* GPA info from matching renewal */}
                              {matchingRenewal && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-[12px] text-blue-800 font-medium">
                                        {matchingRenewal.semester} — Year: {matchingRenewal.year}
                                      </p>
                                      <p className="text-[10px] text-blue-600 mt-1">
                                        Submitted GPA: <strong>{matchingRenewal.gpa.toFixed(2)}</strong>
                                      </p>
                                    </div>
                                    {matchingRenewal.reviewedAt && (
                                      <p className="text-[10px] text-blue-600">
                                        Reviewed: {matchingRenewal.reviewedAt.toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Feedback */}
                              {(evaluation.strengths || evaluation.improvements) && (
                                <div className="space-y-2">
                                  {evaluation.strengths && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                      <p className="text-[10px] font-bold text-green-800 mb-1">STRENGTHS</p>
                                      <p className="text-[12px] text-green-900 leading-[18px]">{evaluation.strengths}</p>
                                    </div>
                                  )}
                                  {evaluation.improvements && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <p className="text-[10px] font-bold text-blue-800 mb-1">AREAS FOR IMPROVEMENT</p>
                                      <p className="text-[12px] text-blue-900 leading-[18px]">{evaluation.improvements}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Renewal review notes */}
                              {matchingRenewal?.reviewNotes && (
                                <div className="mt-3 p-3 bg-gray-100 rounded border border-gray-300">
                                  <p className="text-[10px] text-[#6c757d] mb-1">RENEWAL REVIEW NOTES:</p>
                                  <p className="text-[12px] text-[#1A1A1A]">{matchingRenewal.reviewNotes}</p>
                                </div>
                              )}
                            </article>
                          </li>
                        );
                      })}
                  </ol>
                ) : (
                  <EmptyState
                    icon={<FileText className="w-12 h-12" />}
                    title="No evaluation history"
                    description="No evaluation records are available yet. Your director will submit evaluations at the end of each semester."
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* ── Evaluation Details Dialog ─────────────────────────────────────────── */}
      {latestEvaluation && (
        <Dialog open={showEvaluationDetails} onOpenChange={setShowEvaluationDetails}>
          <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#880808] text-[20px] font-bold">
                My Performance Evaluation Details
              </DialogTitle>
              <DialogDescription className="text-[#6C757D] text-[14px]">
                Complete evaluation breakdown from your director
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(80vh-150px)] pr-4">
              <div className="space-y-6 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section aria-labelledby="eval-info-heading" className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                    <h3 id="eval-info-heading" className="text-[#880808] text-[16px] font-bold mb-3">Evaluation Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Scholar Name</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{user.name}</dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Student ID</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{user.studentId}</dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Talent Group</dt>
                        <dd>
                          <Badge className="text-white text-[12px] mt-1 bg-[#880808]">
                            {user.talentGroup?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Evaluation Date</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">
                          {new Date(latestEvaluation.date).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section aria-labelledby="perf-summary-heading" className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                    <h3 id="perf-summary-heading" className="text-[#880808] text-[16px] font-bold mb-3">Performance Summary</h3>
                    <dl className="space-y-3">
                      {latestEvaluation.overallRating && (
                        <div>
                          <dt className="text-[#6C757D] text-[12px] mb-1">Overall Rating</dt>
                          <dd className="text-[#1A1A1A] text-[20px] font-bold">{latestEvaluation.overallRating}/5.00</dd>
                        </div>
                      )}
                      {latestEvaluation.adjectivalRating && (
                        <div>
                          <dt className="text-[#6C757D] text-[12px] mb-1">Adjectival Rating</dt>
                          <dd className="text-[#1A1A1A] text-[16px] font-bold">{latestEvaluation.adjectivalRating}</dd>
                        </div>
                      )}
                      {latestEvaluation.recommendForRenewal !== undefined && (
                        <div>
                          <dt className="text-[#6C757D] text-[12px] mb-1">Renewal Status</dt>
                          <dd>
                            <Badge className={latestEvaluation.recommendForRenewal ? 'bg-green-600 text-white text-[12px]' : 'bg-red-600 text-white text-[12px]'}>
                              {latestEvaluation.recommendForRenewal ? 'Recommended' : 'Not Recommended'}
                            </Badge>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </section>
                </div>

                {/* Detailed Evaluation Breakdown */}
                <section aria-labelledby="detailed-eval-heading" className="p-4 bg-white rounded-lg border border-[#E0E0E0]">
                  <h3 id="detailed-eval-heading" className="text-[#880808] text-[16px] font-bold mb-4">Detailed Performance Evaluation</h3>
                  
                  {latestEvaluation.sectionA && (
                    <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
                      <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-3">Section A: Attendance &amp; Punctuality</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                        <div><dt className="text-[#6C757D] inline">Reports on time: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.reportsOnTime}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Reports regularly: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.reportsRegularly}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Practices on time: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.practicesOnTime}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Practices regularly: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.practicesRegularly}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">No unnecessary absence: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.noUnnecessaryAbsence}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Mastery of tasks: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.mastersyTasks}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Maintains cleanliness: </dt><dd className="font-bold inline">{latestEvaluation.sectionA.maintainsCleanliness}/5</dd></div>
                      </dl>
                    </div>
                  )}

                  {latestEvaluation.sectionB && (
                    <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
                      <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-3">Section B: Commitment &amp; Dedication</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                        <div><dt className="text-[#6C757D] inline">Improvement interest: </dt><dd className="font-bold inline">{latestEvaluation.sectionB.improvementInterest}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Performance interest: </dt><dd className="font-bold inline">{latestEvaluation.sectionB.performanceInterest}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Work ethic: </dt><dd className="font-bold inline">{latestEvaluation.sectionB.workEthic}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Initiative: </dt><dd className="font-bold inline">{latestEvaluation.sectionB.initiative}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Efficiency: </dt><dd className="font-bold inline">{latestEvaluation.sectionB.efficiency}/5</dd></div>
                      </dl>
                    </div>
                  )}

                  {latestEvaluation.sectionC && (
                    <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
                      <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-3">Section C: Interpersonal Skills</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                        <div><dt className="text-[#6C757D] inline">Teamwork: </dt><dd className="font-bold inline">{latestEvaluation.sectionC.teamwork}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Tact: </dt><dd className="font-bold inline">{latestEvaluation.sectionC.tact}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Courtesy: </dt><dd className="font-bold inline">{latestEvaluation.sectionC.courtesy}/5</dd></div>
                        <div><dt className="text-[#6C757D] inline">Disposition: </dt><dd className="font-bold inline">{latestEvaluation.sectionC.disposition}/5</dd></div>
                      </dl>
                    </div>
                  )}

                  {latestEvaluation.scholarshipPercentage && (
                    <div className="p-4 bg-gradient-to-br from-[#880808] to-[#6B0606] rounded-lg text-center">
                      <Award className="w-10 h-10 text-white mx-auto mb-2" aria-hidden="true" />
                      <p className="text-white text-[12px] mb-1">Scholarship Grant</p>
                      <p
                        className="text-white text-[32px] font-bold"
                        aria-label={`${latestEvaluation.scholarshipPercentage} percent scholarship grant`}
                      >
                        {latestEvaluation.scholarshipPercentage}%
                      </p>
                    </div>
                  )}
                </section>

                {/* Performance Feedback */}
                <section aria-labelledby="feedback-heading" className="p-4 bg-white rounded-lg border border-[#E0E0E0]">
                  <h3 id="feedback-heading" className="text-[#880808] text-[16px] font-bold mb-3">Performance Feedback</h3>
                  
                  {latestEvaluation.strengths || latestEvaluation.improvements ? (
                    <div className="space-y-4">
                      {latestEvaluation.strengths && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="text-green-800 text-[14px] font-bold mb-2">Strengths</h4>
                          <p className="text-green-900 text-[14px] leading-[22px]">
                            {latestEvaluation.strengths}
                          </p>
                        </div>
                      )}
                      {latestEvaluation.improvements && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-blue-800 text-[14px] font-bold mb-2">Areas for Improvement</h4>
                          <p className="text-blue-900 text-[14px] leading-[22px]">
                            {latestEvaluation.improvements}
                          </p>
                        </div>
                      )}
                      {latestEvaluation.ratedBy && (
                        <div className="flex items-center space-x-2 text-[#6C757D] text-[12px] pt-3 border-t border-[#E0E0E0]">
                          <User className="w-4 h-4" aria-hidden="true" />
                          <span>Evaluated by: <strong>{latestEvaluation.ratedBy}</strong></span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F8F9FA] rounded-lg">
                      <p className="text-[#1A1A1A] text-[14px] leading-[22px] mb-3">
                        {latestEvaluation.notes || 'No additional notes provided.'}
                      </p>
                      {latestEvaluation.ratedBy && (
                        <div className="flex items-center space-x-2 text-[#6C757D] text-[12px] pt-3 border-t border-[#E0E0E0]">
                          <User className="w-4 h-4" aria-hidden="true" />
                          <span>Evaluated by: <strong>{latestEvaluation.ratedBy}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Logout Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <DialogContent className="border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A]">Confirm Logout</DialogTitle>
            <DialogDescription className="text-[#6C757D]">
              Are you sure you want to logout? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => setShowLogoutConfirmation(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="min-h-[44px]"
              onClick={() => {
                setShowLogoutConfirmation(false);
                onLogout();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />Logout            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
