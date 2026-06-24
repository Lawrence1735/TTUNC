import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { NotificationPanel } from './NotificationPanel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, MapPin, Clock, Users, LogOut, Bell, Music, User, Award, Settings as SettingsIcon, Lock } from './ui/icons';
import { toast } from 'sonner';
import type { User as UserType, Notification } from '../App';
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
import { SkipToContent, EmptyState } from './accessibility';
import engagementService, { type Engagement as ApiEngagement } from '../services/engagementService';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

interface EngagementDashboardProps {
  user: UserType;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (notificationId: string) => void;
  onNavigate?: (view: 'scholar' | 'member-profile' | 'engagement' | 'scholarship' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
}


export function EngagementDashboard({
  user,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onNavigate
}: EngagementDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'engagements' | 'rehearsals'>('engagements');
  const [hiddenNotifIds, setHiddenNotifIds] = useState<string[]>([]);
  const [engagements, setEngagements] = useState<ApiEngagement[]>([]);
  const [rehearsals, setRehearsals] = useState<ApiEngagement[]>([]);
  const [selectedSession, setSelectedSession] = useState<ApiEngagement | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  useEffect(() => {
    engagementService.getEngagements().then(setEngagements).catch(() => {});
    engagementService.getRehearsals().then(setRehearsals).catch(() => {});
  }, []);

  const visibleNotifications = notifications.filter(n => !hiddenNotifIds.includes(n.id));
  const unreadNotifications = visibleNotifications.filter(n => !n.read);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEngagements = engagements.filter(e => e.date >= today);
  const pastEngagements = engagements.filter(e => e.date < today);
  const upcomingRehearsals = rehearsals.filter(r => r.date >= today);
  const pastRehearsals = rehearsals.filter(r => r.date < today);

  const sortSessions = (rows: ApiEngagement[]) => {
    return [...rows].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const bDate = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      const aIsUpcoming = a.date >= today ? 0 : 1;
      const bIsUpcoming = b.date >= today ? 0 : 1;
      if (aIsUpcoming !== bIsUpcoming) return aIsUpcoming - bIsUpcoming;
      if (aIsUpcoming === 0) return aDate - bDate;
      return bDate - aDate;
    });
  };

  const normalizeAttendanceStatus = (value: any): 'present' | 'absent' | 'excused' => {
    if (value === 'present' || value === true) return 'present';
    if (value === 'excused') return 'excused';
    return 'absent';
  };

  const getAttendanceStatus = (session: ApiEngagement): 'present' | 'absent' | 'excused' | 'pending' => {
    const records = ((session as any).attendanceRecords || (session as any).attendance_records || []) as any[];
    if (!Array.isArray(records) || records.length === 0) return 'pending';
    const record = records.find((r) => r?.attendees && Object.prototype.hasOwnProperty.call(r.attendees, String(user.id)));
    if (!record) return 'pending';
    return normalizeAttendanceStatus(record.attendees[String(user.id)]);
  };

  const getAttendanceBadgeClass = (status: 'present' | 'absent' | 'excused' | 'pending') => {
    if (status === 'present') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'excused') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'absent') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const formatAttendanceLabel = (status: 'present' | 'absent' | 'excused' | 'pending') => {
    if (status === 'present') return 'Present';
    if (status === 'excused') return 'Excused';
    if (status === 'absent') return 'Absent';
    return 'Pending';
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    onMarkNotificationRead(notificationId);
  };

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast.success(`Navigated to ${sectionId.replace('-', ' ')}`);
    }
  };

  const renderSessionTable = (rows: ApiEngagement[], emptyText: string) => {
    if (rows.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{emptyText}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-[#6c757d]">
              <th className="py-2 pr-3 font-medium">Session</th>
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">Time</th>
              <th className="py-2 pr-3 font-medium">Venue</th>
              <th className="py-2 pr-3 font-medium">Schedule</th>
              <th className="py-2 font-medium">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((session) => {
              const attendance = getAttendanceStatus(session);
              const schedule = session.date >= today ? 'Upcoming' : 'Past';
              return (
                <tr
                  key={session.id}
                  className="border-b border-[#F1F5F9] cursor-pointer hover:bg-[#F8FAFC]"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowSessionDetails(true);
                  }}
                >
                  <td className="py-3 pr-3">
                    <div className="font-medium text-[#1A1A1A]">{session.event_name}</div>
                    {session.is_required && <Badge className="mt-1 bg-red-500">Required</Badge>}
                  </td>
                  <td className="py-3 pr-3 text-[#6c757d]">{new Date(session.date).toLocaleDateString()}</td>
                  <td className="py-3 pr-3 text-[#6c757d]">{session.time || '—'}</td>
                  <td className="py-3 pr-3 text-[#6c757d] max-w-[220px] truncate">{session.venue}</td>
                  <td className="py-3 pr-3">
                    <Badge className={schedule === 'Upcoming' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}>
                      {schedule}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge className={`${getAttendanceBadgeClass(attendance)} border`}>
                      {formatAttendanceLabel(attendance)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      {/* Header */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
            {/* Left Section - Logo and Title */}
            <div>
              <div>
                <h1 className="text-xl leading-tight">
                  <span className="font-bold text-[#0F172A]">Talent</span>
                  <span className="text-[#0F172A]">Track</span>
                  <span className="font-bold text-[#7A1E1E]">UNC</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : user.role === "director"
                      ? "Director Dashboard"
                      : user.role === "trainee" || user.trainingStatus === "in_progress"
                        ? "Trainee Dashboard"
                        : user.role === "student"
                          ? "Student Dashboard"
                          : "Scholar Dashboard"}
                </p>
              </div>
            </div>
            
            {/* Right Section */}
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
                  aria-haspopup="dialog"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
                      {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                    </Badge>
                  )}
                </Button>

                {showNotifications && (
                  <NotificationPanel
                    notifications={visibleNotifications}
                    onMarkAsRead={handleMarkNotificationRead}
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

      {/* Dashboard Navigation - Tabs below header */}
      {onNavigate && (
        <nav className="bg-white border-b border-[#E2E8F0]" aria-label="Dashboard sections">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px]">
            <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Dashboard views">
              {([
                { key: 'member-profile', label: 'Member Profile', active: false, cb: () => onNavigate('member-profile'), Icon: User },
                { key: 'engagement',     label: 'Engagement',     active: true,  cb: undefined,                          Icon: Calendar },
                { key: 'scholarship',    label: 'Scholarship',    active: false, cb: () => onNavigate('scholarship'),    Icon: Award },
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

      <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-6">
        {/* Tabs for Engagements and Rehearsals */}
        <div className="mb-6">
          <div className="flex space-x-1 pb-2" role="tablist" aria-label="Engagement views">
            <button
              role="tab"
              onClick={() => setActiveTab('engagements')}
              aria-selected={activeTab === 'engagements'}
              aria-controls="panel-engagements"
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                activeTab === 'engagements'
                  ? 'bg-[#7A1E1E] text-white'
                  : 'text-[#6c757d] hover:bg-gray-100 hover:text-[#1a1a1a]'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
              Engagements
            </button>
            <button
              role="tab"
              onClick={() => setActiveTab('rehearsals')}
              aria-selected={activeTab === 'rehearsals'}
              aria-controls="panel-rehearsals"
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                activeTab === 'rehearsals'
                  ? 'bg-[#7A1E1E] text-white'
                  : 'text-[#6c757d] hover:bg-gray-100 hover:text-[#1a1a1a]'
              }`}
            >
              <Music className="w-4 h-4 shrink-0" aria-hidden="true" />
              Rehearsals
            </button>
          </div>
        </div>

        {/* Engagements Tab Content */}
        {activeTab === 'engagements' && (
          <div id="panel-engagements" role="tabpanel" aria-label="Engagements">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <DashboardQuickStatCard
                label="Upcoming Events"
                value={upcomingEngagements.length}
                onClick={() => scrollToSection('engagement-table')}
              />

              <DashboardQuickStatCard
                label="Completed Events"
                value={pastEngagements.length}
                onClick={() => scrollToSection('engagement-table')}
              />
            </div>

            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="mb-2 text-[#880808]">External Engagements</h2>
              <p className="text-muted-foreground">
                View accepted external performance requests and events.
              </p>
            </div>

            {/* Event Guidelines */}
            <Card className="border-[#e0e0e0] mb-6" id="event-guidelines">
              <CardHeader>
                <CardTitle className="text-[#880808] flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Event Guidelines
                </CardTitle>
                <CardDescription className="text-[#6c757d]">Important reminders for all engagements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#6c757d]">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Arrive at the venue at least 30 minutes before the scheduled time</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Ensure your uniform and instruments are in excellent condition</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Notify your director immediately if you cannot attend due to emergencies</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Maintain professional conduct and represent UNC with pride</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Follow your director's instructions during performances</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[#e0e0e0]" id="engagement-table">
              <CardHeader>
                <CardTitle className="text-[#880808]">Engagements</CardTitle>
                <CardDescription className="text-[#6c757d]">
                  Upcoming and past engagements in one table. Tap a row to view details and attendance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSessionTable(sortSessions(engagements), 'No engagements available')}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rehearsals Tab Content */}
        {activeTab === 'rehearsals' && (
          <div id="panel-rehearsals" role="tabpanel" aria-label="Rehearsals">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <DashboardQuickStatCard
                label="Upcoming Rehearsals"
                value={upcomingRehearsals.length}
                onClick={() => scrollToSection('rehearsal-table')}
              />

              <DashboardQuickStatCard
                label="Completed Rehearsals"
                value={pastRehearsals.length}
                onClick={() => scrollToSection('rehearsal-table')}
              />
            </div>

            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="mb-2 text-[#880808]">Practice & Rehearsals</h2>
              <p className="text-muted-foreground">
                View scheduled practice sessions and rehearsals. Director schedules these sessions directly.
              </p>
            </div>

            {/* Rehearsal Guidelines */}
            <Card className="border-[#e0e0e0] mb-6">
              <CardHeader>
                <CardTitle className="text-[#880808] flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Rehearsal Guidelines
                </CardTitle>
                <CardDescription className="text-[#6c757d]">Important reminders for all rehearsals</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#6c757d]">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Arrive 10 minutes before rehearsal starts for warm-up</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Bring all necessary materials (music sheets, instruments, water)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Required rehearsals are mandatory - absences must be excused by director</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Practice assigned sections at home before rehearsal</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#880808] mt-1">•</span>
                    <span>Maintain focus and discipline during rehearsal time</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[#e0e0e0]" id="rehearsal-table">
              <CardHeader>
                <CardTitle className="text-[#880808]">Rehearsals</CardTitle>
                <CardDescription className="text-[#6c757d]">
                  Upcoming and past rehearsals in one table. Tap a row to view details and attendance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSessionTable(sortSessions(rehearsals), 'No rehearsals available')}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#880808]">Session Details</DialogTitle>
            <DialogDescription>
              Detailed information and your attendance status.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-[#1A1A1A]">{selectedSession.event_name}</h4>
                <Badge className={`${getAttendanceBadgeClass(getAttendanceStatus(selectedSession))} border`}>
                  {formatAttendanceLabel(getAttendanceStatus(selectedSession))}
                </Badge>
              </div>
              {selectedSession.description && (
                <p className="text-sm text-[#6c757d]">{selectedSession.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[#6c757d]">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedSession.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6c757d]">
                  <Clock className="w-4 h-4" />
                  <span>{selectedSession.time || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6c757d] sm:col-span-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedSession.venue}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#6c757d]">
                {selectedSession.date >= today
                  ? 'This session is upcoming. Attendance will be marked by your director during/after the session.'
                  : 'This session already happened. Attendance result shown above is based on recorded attendance.'}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of TalentTrackUNC?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              className="shrink-0 whitespace-nowrap min-h-[44px]"
              onClick={() => setShowLogoutConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="shrink-0 whitespace-nowrap min-h-[44px]"
              onClick={() => {
                setShowLogoutConfirmation(false);
                onLogout();
                toast.success('Logged out successfully');
              }}
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}