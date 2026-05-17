import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { NotificationPanel } from './NotificationPanel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, MapPin, Clock, Users, LogOut, Bell, Music, User, Award, Settings as SettingsIcon, Lock } from './ui/icons';
import { toast } from 'sonner';
import type { User as UserType, Notification } from '../App';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
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

interface EngagementDashboardProps {
  user: UserType;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (notificationId: string) => void;
  onNavigate?: (view: 'scholar' | 'member-profile' | 'engagement' | 'scholarship' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
}

// Mock accepted engagement data (only accepted events shown to scholars)
const ACCEPTED_ENGAGEMENTS = [
  {
    id: 'eng1',
    eventName: 'University Foundation Day',
    date: new Date('2024-12-15'),
    time: '14:00',
    venue: 'UNC Main Auditorium',
    description: 'Annual foundation day celebration performance',
    attendanceMarked: true
  },
  {
    id: 'eng2',
    eventName: 'City Christmas Festival',
    date: new Date('2024-12-20'),
    time: '18:00',
    venue: 'Naga City Plaza',
    description: 'Community Christmas celebration',
    attendanceMarked: false
  },
  {
    id: 'eng3',
    eventName: 'Bicol Cultural Festival',
    date: new Date('2025-01-10'),
    time: '16:00',
    venue: 'Naga City Convention Center',
    description: 'Regional cultural showcase',
    attendanceMarked: false
  }
];

// Mock rehearsal data (scheduled by Director/Admin, no approval needed)
const REHEARSALS = [
  {
    id: 'reh1',
    title: 'Weekly Practice Session',
    date: new Date('2026-02-18'),
    time: '15:00',
    venue: 'Band Room, Music Building',
    description: 'Regular weekly rehearsal for marching formations',
    type: 'rehearsal' as const,
    isRequired: true,
    attendanceMarked: false
  },
  {
    id: 'reh2',
    title: 'Competition Preparation',
    date: new Date('2026-02-22'),
    time: '14:00',
    venue: 'UNC Main Auditorium',
    description: 'Intensive practice for upcoming regional competition',
    type: 'rehearsal' as const,
    isRequired: true,
    attendanceMarked: false
  },
  {
    id: 'reh3',
    title: 'Sectional Practice',
    date: new Date('2026-02-16'),
    time: '16:00',
    venue: 'Practice Room 3',
    description: 'Brass section practice',
    type: 'rehearsal' as const,
    isRequired: false,
    attendanceMarked: true
  }
];

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

  const visibleNotifications = notifications.filter(n => !hiddenNotifIds.includes(n.id));
  const unreadNotifications = visibleNotifications.filter(n => !n.read);

  // Engagements
  const upcomingEngagements = ACCEPTED_ENGAGEMENTS.filter(e => e.date >= new Date());
  const pastEngagements = ACCEPTED_ENGAGEMENTS.filter(e => e.date < new Date());

  // Rehearsals
  const upcomingRehearsals = REHEARSALS.filter(r => r.date >= new Date());
  const pastRehearsals = REHEARSALS.filter(r => r.date < new Date());

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

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50" role="banner">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={uncLogo} 
                  alt="University of Nueva Caceres Logo"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="unc-burgundy-text">TalentTrackUNC</h1>
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
            </div>
            
            {/* Right Section - User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative min-h-[44px] min-w-[44px]"
                  aria-label={
                    unreadNotifications.length > 0
                      ? `Notifications — ${unreadNotifications.length} unread`
                      : 'Notifications — no unread'
                  }
                  aria-expanded={showNotifications}
                  aria-haspopup="dialog"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-xs" aria-hidden="true">
                      {unreadNotifications.length}
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
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <div className="flex items-center justify-end space-x-2">
                  {user.role === "admin" && (
                    <Badge className="bg-[#6c757d] text-white">Admin</Badge>
                  )}
                  {user.role === "director" && user.talentGroup && (
                    <Badge className="bg-[#7A1E1E] text-white">
                      {getTalentGroupName(user.talentGroup)}
                    </Badge>
                  )}
                  {user.role === "scholar" && user.talentGroup && user.trainingStatus !== "in_progress" && (
                    <>
                      <Badge className="bg-[#7A1E1E] text-white">
                        {getTalentGroupName(user.talentGroup)}
                      </Badge>
                      {user.studentId && (
                        <span className="text-xs text-muted-foreground">{user.studentId}</span>
                      )}
                    </>
                  )}
                  {(user.role === "trainee" || user.trainingStatus === "in_progress") && user.talentGroup && (
                    <Badge className="bg-[#7A1E1E] text-white">
                      {getTalentGroupName(user.talentGroup)}
                    </Badge>
                  )}
                  {user.role === "student" && !user.talentGroup && user.email && (
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  )}
                </div>
              </div>
              
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors min-h-[44px]"
                    aria-label="Open settings menu"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" aria-hidden="true" />
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
        </div>
      </header>

      {/* Dashboard Navigation - Tabs below header */}
      {onNavigate && (
        <nav className="bg-white border-b" aria-label="Dashboard sections">
          <div className="container mx-auto px-4 py-3">
            <div className="flex overflow-x-auto scrollbar-hide pb-1 gap-1" role="tablist" aria-label="Dashboard views">
              <Button
                role="tab"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('member-profile')}
                className="shrink-0 whitespace-nowrap min-h-[44px]"
                aria-selected={false}
              >
                <User className="w-4 h-4 mr-2" aria-hidden="true" /><span className="hidden sm:inline">Member Profile</span>              </Button>
              <Button
                role="tab"
                variant="default"
                size="sm"
                className="shrink-0 whitespace-nowrap bg-[#7A1E1E] text-white hover:bg-[#7A1E1E] min-h-[44px]"
                aria-selected={true}
                aria-current="page"
              >
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" /><span className="hidden sm:inline">Engagement</span>              </Button>
              <Button
                role="tab"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('scholarship')}
                className="shrink-0 whitespace-nowrap min-h-[44px]"
                aria-selected={false}
              >
                <Award className="w-4 h-4 mr-2" aria-hidden="true" /><span className="hidden sm:inline">Scholarship</span>              </Button>
            </div>
          </div>
        </nav>
      )}

      <main id="main-content" className="container mx-auto px-4 py-8">
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
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8">
              <Card
                className="bg-white border-[#e0e0e0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:border-[#880808] hover:shadow-lg transition-all"
                onClick={() => scrollToSection('upcoming-engagements')}
              >
                <CardContent className="p-2 sm:p-3">
                  <p className="text-[#6c757d] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Upcoming Events</p>
                  <p className="text-[#880808] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{upcomingEngagements.length}</p>
                </CardContent>
              </Card>

              <Card
                className="bg-white border-[#e0e0e0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:border-[#880808] hover:shadow-lg transition-all"
                onClick={() => scrollToSection('past-engagements')}
              >
                <CardContent className="p-2 sm:p-3">
                  <p className="text-[#6c757d] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Completed Events</p>
                  <p className="text-[#880808] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{pastEngagements.length}</p>
                </CardContent>
              </Card>
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

            {/* Upcoming Engagements */}
            <Card className="border-[#e0e0e0] mb-6" id="upcoming-engagements">
              <CardHeader>
                <CardTitle className="text-[#880808]">Upcoming Engagements</CardTitle>
                <CardDescription className="text-[#6c757d]">External events you're scheduled to attend</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEngagements.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEngagements.map((engagement) => (
                      <div key={engagement.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#880808]">{engagement.eventName}</h4>
                            <p className="text-sm text-[#6c757d] mt-1">{engagement.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-[#6c757d]">
                              <div className="flex items-center shrink-0">
                                <Calendar className="w-4 h-4 mr-1" />
                                {engagement.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center shrink-0">
                                <Clock className="w-4 h-4 mr-1" />
                                {engagement.time}
                              </div>
                              <div className="flex items-center min-w-0">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{engagement.venue}</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`shrink-0 ${engagement.attendanceMarked ? "bg-green-500" : "bg-yellow-500"}`}
                          >
                            {engagement.attendanceMarked ? "Attendance Recorded" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming engagements scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Engagements */}
            <Card className="border-[#e0e0e0]" id="past-engagements">
              <CardHeader>
                <CardTitle className="text-[#880808]">Past Engagements</CardTitle>
                <CardDescription className="text-[#6c757d]">Completed external events</CardDescription>
              </CardHeader>
              <CardContent>
                {pastEngagements.length > 0 ? (
                  <div className="space-y-4">
                    {pastEngagements.map((engagement) => (
                      <div key={engagement.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#6c757d]">{engagement.eventName}</h4>
                            <p className="text-sm text-[#6c757d] mt-1">{engagement.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-[#6c757d]">
                              <div className="flex items-center shrink-0">
                                <Calendar className="w-4 h-4 mr-1" />
                                {engagement.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center shrink-0">
                                <Clock className="w-4 h-4 mr-1" />
                                {engagement.time}
                              </div>
                              <div className="flex items-center min-w-0">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{engagement.venue}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="shrink-0 bg-gray-400">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No past engagements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rehearsals Tab Content */}
        {activeTab === 'rehearsals' && (
          <div id="panel-rehearsals" role="tabpanel" aria-label="Rehearsals">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8">
              <Card
                className="bg-white border-[#e0e0e0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:border-[#880808] hover:shadow-lg transition-all"
                onClick={() => scrollToSection('upcoming-rehearsals')}
              >
                <CardContent className="p-2 sm:p-3">
                  <p className="text-[#6c757d] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Upcoming Rehearsals</p>
                  <p className="text-[#880808] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{upcomingRehearsals.length}</p>
                </CardContent>
              </Card>

              <Card
                className="bg-white border-[#e0e0e0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:border-[#880808] hover:shadow-lg transition-all"
                onClick={() => scrollToSection('past-rehearsals')}
              >
                <CardContent className="p-2 sm:p-3">
                  <p className="text-[#6c757d] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Completed Rehearsals</p>
                  <p className="text-[#880808] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{pastRehearsals.length}</p>
                </CardContent>
              </Card>
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

            {/* Upcoming Rehearsals */}
            <Card className="border-[#e0e0e0] mb-6" id="upcoming-rehearsals">
              <CardHeader>
                <CardTitle className="text-[#880808]">Upcoming Rehearsals</CardTitle>
                <CardDescription className="text-[#6c757d]">Scheduled practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingRehearsals.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingRehearsals.map((rehearsal) => (
                      <div key={rehearsal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="font-medium text-[#880808]">{rehearsal.title}</h4>
                              {rehearsal.isRequired && (
                                <Badge className="bg-red-500 shrink-0">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#6c757d] mt-1">{rehearsal.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-[#6c757d]">
                              <div className="flex items-center shrink-0">
                                <Calendar className="w-4 h-4 mr-1" />
                                {rehearsal.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center shrink-0">
                                <Clock className="w-4 h-4 mr-1" />
                                {rehearsal.time}
                              </div>
                              <div className="flex items-center min-w-0">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{rehearsal.venue}</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`shrink-0 ${rehearsal.attendanceMarked ? "bg-green-500" : "bg-yellow-500"}`}
                          >
                            {rehearsal.attendanceMarked ? "Attendance Recorded" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming rehearsals scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Rehearsals */}
            <Card className="border-[#e0e0e0]" id="past-rehearsals">
              <CardHeader>
                <CardTitle className="text-[#880808]">Past Rehearsals</CardTitle>
                <CardDescription className="text-[#6c757d]">Completed practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {pastRehearsals.length > 0 ? (
                  <div className="space-y-4">
                    {pastRehearsals.map((rehearsal) => (
                      <div key={rehearsal.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="font-medium text-[#6c757d]">{rehearsal.title}</h4>
                              {rehearsal.isRequired && (
                                <Badge className="bg-gray-400 shrink-0">Was Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#6c757d] mt-1">{rehearsal.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-[#6c757d]">
                              <div className="flex items-center shrink-0">
                                <Calendar className="w-4 h-4 mr-1" />
                                {rehearsal.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center shrink-0">
                                <Clock className="w-4 h-4 mr-1" />
                                {rehearsal.time}
                              </div>
                              <div className="flex items-center min-w-0">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{rehearsal.venue}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="shrink-0 bg-gray-400">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No past rehearsals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

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