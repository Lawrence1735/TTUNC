import { useState, useEffect } from 'react';
import engagementService from '../services/engagementService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { 
  LogOut, 
  Users, 
  FileText, 
  Calendar,
  Bell,
  Search,
  User,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  GraduationCap,
  Eye,
  Download,
  Trash2,
  Package,
  Settings,
  Lock
} from './ui/icons';
import type { User as UserType, Application, Event, TrainingRecord, Announcement } from '../App';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import { getTalentGroupColor, getTalentGroupName } from './ui/unc-colors';
import { DocumentsDashboard } from './DocumentsDashboardTabs';
import { Evaluation } from './DirectorDashboardEnhanced';
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

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  applications: Application[];
  users: UserType[];
  events: Event[];
  announcements: Announcement[];
  trainingRecords: TrainingRecord[];
  evaluations?: Evaluation[];
  onUpdateApplicationStatus: (applicationId: string, status: 'approved' | 'disapproved') => void;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
  onViewChange?: (view: 'overview' | 'applications' | 'roster' | 'events' | 'documents' | 'reports' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
}

export function AdminDashboard({ 
  user, 
  onLogout, 
  users, 
  trainingRecords,
  evaluations = [],
  unreadNotifications = 0,
  onNotificationsClick,
  onViewChange
}: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<'member-profile' | 'engagement' | 'scholarship' | 'documents'>('member-profile');
  const [engagementTab, setEngagementTab] = useState<'create' | 'requests' | 'events' | 'reports'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedScholar, setSelectedScholar] = useState<UserType | null>(null);
  const [showScholarProfile, setShowScholarProfile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [reportGroupFilter, setReportGroupFilter] = useState<string>('all');
  const [eventListFilter, setEventListFilter] = useState<'upcoming' | 'completed'>('upcoming');
  
  // Scholarship renewal state
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null);
  const [showRenewalDetails, setShowRenewalDetails] = useState(false);
  const [scholarshipGroupFilter, setScholarshipGroupFilter] = useState<string>('all');
  
  // Form submission loading state
  const [isCreatingEngagement, setIsCreatingEngagement] = useState(false);
  
  // Attachment preview state
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; type: string } | null>(null);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Engagement form state
  const [eventName, setEventName] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [description, setDescription] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<string>('');

  // Engagement form validation state
  const [engagementFormTouched, setEngagementFormTouched] = useState({
    eventName: false,
    venue: false,
    eventDate: false,
    eventTime: false,
    selectedGroups: false
  });
  const [engagementFormErrors, setEngagementFormErrors] = useState({
    eventName: '',
    venue: '',
    eventDate: '',
    eventTime: '',
    selectedGroups: ''
  });

  const validateEngagementField = (fieldName: string, value: any) => {
    let error = '';
    switch (fieldName) {
      case 'eventName':
        if (!value.trim()) error = 'Event Name is required';
        break;
      case 'venue':
        if (!value.trim()) error = 'Venue is required';
        break;
      case 'eventDate':
        if (!value) error = 'Date is required';
        break;
      case 'eventTime':
        if (!value) error = 'Time is required';
        break;
      case 'selectedGroups':
        if (value.length === 0) error = 'At least one Talent Group must be selected';
        break;
    }
    return error;
  };

  const handleEngagementFieldBlur = (fieldName: string) => {
    setEngagementFormTouched(prev => ({ ...prev, [fieldName]: true }));
    let value;
    switch (fieldName) {
      case 'eventName': value = eventName; break;
      case 'venue': value = venue; break;
      case 'eventDate': value = eventDate; break;
      case 'eventTime': value = eventTime; break;
      case 'selectedGroups': value = selectedGroups; break;
      default: value = '';
    }
    const error = validateEngagementField(fieldName, value);
    setEngagementFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Events and engagement requests loaded from API
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);

  // Engagement requests from directors
  const [engagementRequests, setEngagementRequests] = useState<any[]>([]);

  useEffect(() => {
    engagementService.getEngagements().then((data: any[]) => {
      const events = data.map((e: any) => ({
        id: String(e.id),
        eventName: e.event_name ?? e.title ?? '',
        date: e.date ? new Date(e.date).toLocaleDateString() : '',
        venue: e.venue ?? '',
        groups: e.talent_groups ?? [],
        description: e.description ?? '',
        status: e.status ?? 'upcoming',
        attachment: e.attachment ?? undefined,
      }));
      setCreatedEvents(events.filter((e: any) => e.status !== 'pending'));
      setEngagementRequests(events.filter((e: any) => e.status === 'pending').map((e: any) => ({
        ...e,
        requestedBy: e.requester_name ?? '',
      })));
    }).catch(() => {});
  }, []);

  // Map evaluations to scholarship renewal requests
  const scholarshipRenewals = evaluations.map((evaluation) => {
    const scholar = users.find(u => u.id === evaluation.traineeId);
    if (!scholar) return null;
    
    return {
      id: evaluation.id,
      scholarName: evaluation.traineeName,
      studentId: scholar.studentId || 'N/A',
      talentGroup: evaluation.talentGroup || scholar.talentGroup || '',
      course: scholar.course || 'N/A',
      yearLevel: scholar.yearLevel || 'N/A',
      evaluationScore: evaluation.rating,
      scholarshipPercentage: evaluation.scholarshipPercentage,
      attendanceRate: evaluation.sectionA ? Math.round((evaluation.sectionA.reportsRegularly / 5) * 100) : 0,
      performanceRating: evaluation.adjectivalRating || 'N/A',
      directorRemarks: evaluation.strengths || evaluation.notes || 'No remarks provided',
      directorName: evaluation.ratedBy || 'Director',
      academicGPA: 3.5,
      submittedDate: new Date(evaluation.date).toLocaleDateString(),
      renewalRecommendation: evaluation.recommendForRenewal ? 'Recommended for Renewal' : 'Not Recommended',
      trainingCompleted: true,
      engagementParticipation: 0,
      documents: [],
      evaluation: evaluation
    };
  }).filter(Boolean);

  const handleApproveRequest = (requestId: string) => {
    const request = engagementRequests.find(r => r.id === requestId);
    if (request) {
      const newEvent = {
        id: `e${Date.now()}`,
        eventName: request.eventName,
        date: request.date,
        venue: request.venue,
        groups: request.groups,
        description: request.description,
        status: 'upcoming' as const
      };
      setCreatedEvents(prev => [...prev, newEvent]);
      toast.success('Engagement request approved and added to upcoming events!');
      setEngagementRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    toast.error('Engagement request declined');
    setEngagementRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Filter scholars
  const scholars = users.filter(u => u.role === 'scholar');
  const filteredScholars = scholars.filter(scholar => {
    const matchesSearch = scholar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholar.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholar.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || scholar.talentGroup === groupFilter;
    return matchesSearch && matchesGroup;
  });

  // Group scholars by talent group
  const scholarsByGroup = filteredScholars.reduce((acc, scholar) => {
    const group = scholar.talentGroup || 'unassigned';
    if (!acc[group]) acc[group] = [];
    acc[group].push(scholar);
    return acc;
  }, {} as Record<string, UserType[]>);



  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Skip to main content — WCAG 2.4.1 Bypass Blocks */}
      <SkipToContent />

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50" role="banner">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo + Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={uncLogo} 
                  alt="University of Nueva Caceres Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="unc-burgundy-text">TalentTrackUNC</h1>
                  <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                </div>
              </div>
            </div>
            
            {/* Right: Notifications + User + Settings */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative min-h-[44px] min-w-[44px]"
                onClick={onNotificationsClick}
                aria-label={
                  unreadNotifications > 0
                    ? `Notifications — ${unreadNotifications} unread`
                    : 'Notifications — no unread'
                }
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-xs"
                    aria-hidden="true"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <div className="flex items-center justify-end space-x-2">
                  <Badge className="bg-[#6c757d] text-white">Admin</Badge>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors min-h-[44px]"
                    aria-label="Open settings menu"
                  >
                    <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewChange?.('settings', 'account')}>
                    <User className="w-4 h-4 mr-2" aria-hidden="true" />Account Settings                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange?.('settings', 'security')}>
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

      {/* ── Dashboard Navigation ───────────────────────────────────────────────── */}
      <nav className="bg-white border-b" aria-label="Dashboard sections">
        <div className="container mx-auto px-4 py-3">
          <div
            className="flex overflow-x-auto scrollbar-hide pb-1 gap-1"
            role="tablist"
            aria-label="Dashboard views"
          >
            <Button
              role="tab"
              variant={currentView === 'member-profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('member-profile')}
              className={`shrink-0 whitespace-nowrap min-h-[44px] ${currentView === 'member-profile' ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
              aria-selected={currentView === 'member-profile'}
              aria-controls="member-profile-panel"
            >
              <Users className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">Member Profile Dashboard</span>            </Button>
            <Button
              role="tab"
              variant={currentView === 'engagement' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('engagement')}
              className={`shrink-0 whitespace-nowrap min-h-[44px] ${currentView === 'engagement' ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
              aria-selected={currentView === 'engagement'}
              aria-controls="engagement-panel"
            >
              <Calendar className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">Engagement Dashboard</span>            </Button>
            <Button
              role="tab"
              variant={currentView === 'scholarship' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('scholarship')}
              className={`shrink-0 whitespace-nowrap min-h-[44px] ${currentView === 'scholarship' ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
              aria-selected={currentView === 'scholarship'}
              aria-controls="scholarship-panel"
            >
              <GraduationCap className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">Scholarship Dashboard</span>            </Button>
            <Button
              role="tab"
              variant={currentView === 'documents' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('documents')}
              className={`shrink-0 whitespace-nowrap min-h-[44px] ${currentView === 'documents' ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
              aria-selected={currentView === 'documents'}
              aria-controls="documents-panel"
            >
              <FileText className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">Documents</span>            </Button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <main id="main-content" className="container mx-auto px-4 sm:px-8 lg:px-16 py-8">

        {/* ══ Member Profile View ══════════════════════════════════════════════ */}
        {currentView === 'member-profile' && (
          <section
            id="member-profile-panel"
            role="tabpanel"
            aria-labelledby="member-profile-heading"
            className="space-y-4"
          >
            <h2 id="member-profile-heading" className="sr-only">Member Profile Dashboard</h2>

            {/* Stats Cards — Scholars by Talent Group */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
              role="list"
              aria-label="Scholars count by talent group"
            >
              {[
                { key: 'marching-band', label: 'Marching Band' },
                { key: 'majorettes',    label: 'Majorettes' },
                { key: 'glee-club',     label: 'Glee Club' },
                { key: 'dance-club',    label: 'Dance Club' },
              ].map(({ key, label }) => {
                const count = scholars.filter(s => s.talentGroup === key).length;
                return (
                  <Card
                    key={key}
                    role="listitem"
                    className="bg-white border-[#E5E7EB] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]"
                    onClick={() => {
                      setGroupFilter(key);
                      toast.info(`${count} scholars in ${label}`);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setGroupFilter(key);
                        toast.info(`${count} scholars in ${label}`);
                      }
                    }}
                    aria-label={`${label}: ${count} scholars. Activate to filter list.`}
                  >
                    <CardContent className="p-3 sm:p-6">
                  <p className="text-[#6C757D] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">{label}</p>
                  <p className="text-[#1A1A1A] text-[18px] sm:text-[24px] leading-[24px] sm:leading-[32px] font-bold">{count}</p>
                </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Scholars List */}
            <Card className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" aria-hidden="true" />
                  <span id="scholars-list-heading" className="text-[#1A1A1A] text-[20px] leading-[20px] font-bold">Scholars List</span>
                </CardTitle>
                <CardDescription className="text-[#6C757D] text-[16px] leading-[25.6px]">
                  View and manage scholar information
                </CardDescription>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <div className="flex-1 relative">
                    <label htmlFor="scholars-search" className="sr-only">
                      Search scholars by name, email, or student ID
                    </label>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none z-10" aria-hidden="true" />
                    <Input
                      id="scholars-search"
                      placeholder="Search scholars..."
                      className="pl-10 border-[#D1D5DC] bg-white h-[44px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="scholars-group-filter" className="sr-only">Filter scholars by talent group</label>
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                      <SelectTrigger id="scholars-group-filter" className="w-full sm:w-[180px] border-2 border-[#7A1E1E] bg-white h-[44px]" aria-label="Filter scholars by talent group">
                        <SelectValue placeholder="Filter by group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        <SelectItem value="marching-band">Marching Band</SelectItem>
                        <SelectItem value="majorettes">Majorettes</SelectItem>
                        <SelectItem value="glee-club">Glee Club</SelectItem>
                        <SelectItem value="dance-club">Dance Club</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]" aria-label="Scholars list">
                  {Object.entries(scholarsByGroup).map(([group, groupScholars]) => (
                    <div key={group} className="mb-6 last:mb-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge 
                          className="text-white text-[16px] leading-[20px] px-3 py-1" 
                          style={{ backgroundColor: getTalentGroupColor(group) }}
                        >
                          {getTalentGroupName(group)}
                        </Badge>
                        <span className="text-[#6C757D] text-[14px] leading-[20px]">
                          ({groupScholars.length} members)
                        </span>
                      </div>
                      
                      <ul className="space-y-2" aria-label={`${getTalentGroupName(group)} scholars`}>
                        {groupScholars.map((scholar) => (
                          <li key={scholar.id}>
                            <div
                              className="p-3 bg-white border border-[#E0E0E0] rounded-lg hover:bg-[#F8F9FA] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1E1E] min-h-[44px] flex items-center"
                              onClick={() => {
                                setSelectedScholar(scholar);
                                setShowScholarProfile(true);
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`View profile of ${scholar.name}${scholar.studentId ? `, ID: ${scholar.studentId}` : ''}${scholar.course ? `, ${scholar.course}` : ''}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedScholar(scholar);
                                  setShowScholarProfile(true);
                                }
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-[#7A1E1E]/10 rounded-full flex items-center justify-center" aria-hidden="true">
                                  <User className="w-5 h-5 text-[#7A1E1E]" />
                                </div>
                                <div>
                                  <p className="text-[#1A1A1A] text-[14px] font-medium">{scholar.name}</p>
                                  <p className="text-[#6C757D] text-[12px]">{scholar.studentId}</p>
                                  <p className="text-[#6C757D] text-[12px]">{scholar.course}</p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {filteredScholars.length === 0 && (
                    <EmptyState
                      icon={<Users className="w-12 h-12" />}
                      title="No scholars found"
                      description="No scholars match your current search or filter. Try adjusting your search term or group filter."
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ══ Engagement View ══════════════════════════════════════════════════ */}
        {currentView === 'engagement' && (
          <section
            id="engagement-panel"
            role="tabpanel"
            aria-labelledby="engagement-heading"
            className="space-y-4"
          >
            <h2 id="engagement-heading" className="sr-only">Engagement Dashboard</h2>

            {/* Stats Cards */}
            <div
              className="grid grid-cols-3 gap-2 sm:gap-4"
              role="list"
              aria-label="Engagement statistics"
            >
              <Card 
                role="listitem"
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]"
                onClick={() => { setEngagementTab('events'); setEventListFilter('upcoming'); }}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEngagementTab('events'); setEventListFilter('upcoming'); } }}
                aria-label={`Upcoming Events: ${createdEvents.filter(e => e.status === 'upcoming').length}. Activate to view list.`}
              >
                <CardContent className="p-3 sm:p-6">
                  <div>
                    
                    <div>
                      <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Upcoming Events</p>
                      <p className="text-[#7A1E1E] text-[18px] sm:text-[24px] leading-[24px] sm:leading-[32px] font-bold">
                        {createdEvents.filter(e => e.status === 'upcoming').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                role="listitem"
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]"
                onClick={() => setEngagementTab('requests')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEngagementTab('requests'); } }}
                aria-label={`Pending Requests: ${engagementRequests.length}. Activate to view requests.`}
              >
                <CardContent className="p-3 sm:p-6">
                  <p className="text-[#6C757D] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Pending Requests</p>
                  <p className="text-[#1A1A1A] text-[18px] sm:text-[24px] leading-[24px] sm:leading-[32px] font-bold">{engagementRequests.length}</p>
                </CardContent>
              </Card>

              <Card 
                role="listitem"
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]"
                onClick={() => { setEngagementTab('events'); setEventListFilter('completed'); }}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEngagementTab('events'); setEventListFilter('completed'); } }}
                aria-label={`Completed Events: ${createdEvents.filter(e => e.status === 'completed').length}. Activate to view completed events.`}
              >
                <CardContent className="p-3 sm:p-6">
                  <p className="text-[#6C757D] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Completed Events</p>
                  <p className="text-[#1A1A1A] text-[18px] sm:text-[24px] leading-[24px] sm:leading-[32px] font-bold">
                        {createdEvents.filter(e => e.status === 'completed').length}
                      </p>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Sub-Tabs */}
            <div
              className="flex overflow-x-auto scrollbar-hide gap-1 bg-[#F1F3F4] p-1 rounded-lg w-full max-w-full"
              role="tablist"
              aria-label="Engagement sections"
            >
              {[
                { key: 'create',   label: 'Create Engagement',    Icon: Plus },
                { key: 'requests', label: 'Engagement Requests',  Icon: Clock },
                { key: 'events',   label: 'List of Engagements',  Icon: Calendar },
                { key: 'reports',  label: 'Engagement Reports',   Icon: FileText },
              ].map(({ key, label, Icon }) => (
                <Button
                  key={key}
                  role="tab"
                  variant={engagementTab === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEngagementTab(key as any)}
                  className={`min-h-[44px] shrink-0 whitespace-nowrap ${engagementTab === key ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
                  aria-selected={engagementTab === key}
                  aria-controls={`engagement-${key}-panel`}
                >
                  <Icon className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>

            {/* ── Create Engagement Form ─────────────────────────────────────── */}
            {engagementTab === 'create' && (
              <Card
                id="engagement-create-panel"
                role="tabpanel"
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]"
              >
                <CardHeader>
                  <CardDescription className="text-[#6C757D] text-[16px] leading-[25.6px]">
                    Schedule a new engagement event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    aria-label="Create engagement event"
                    onSubmit={(e) => e.preventDefault()}
                    noValidate
                  >
                    <div className="space-y-4">
                      {/* Event Name */}
                      <div>
                        <label htmlFor="event-name" className="text-[#1A1A1A] text-[14px] mb-2 block">
                          Event Name <span className="text-red-600" aria-hidden="true">*</span>
                          <span className="sr-only">(required)</span>
                        </label>
                        <Input
                          id="event-name"
                          placeholder="Enter event name"
                          className={`bg-white ${
                            engagementFormTouched.eventName && engagementFormErrors.eventName
                              ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                              : 'border-[#D1D5DC]'
                          }`}
                          value={eventName}
                          onChange={(e) => {
                            setEventName(e.target.value);
                            if (engagementFormTouched.eventName) {
                              setEngagementFormErrors(prev => ({ ...prev, eventName: validateEngagementField('eventName', e.target.value) }));
                            }
                          }}
                          onBlur={() => handleEngagementFieldBlur('eventName')}
                          aria-required="true"
                          aria-invalid={engagementFormTouched.eventName && !!engagementFormErrors.eventName}
                          aria-describedby={engagementFormErrors.eventName ? 'event-name-error' : undefined}
                        />
                        {engagementFormTouched.eventName && engagementFormErrors.eventName && (
                          <p id="event-name-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.eventName}</p>
                        )}
                      </div>

                      {/* Venue */}
                      <div>
                        <label htmlFor="event-venue" className="text-[#1A1A1A] text-[14px] mb-2 block">
                          Venue <span className="text-red-600" aria-hidden="true">*</span>
                          <span className="sr-only">(required)</span>
                        </label>
                        <Input
                          id="event-venue"
                          placeholder="Enter venue location"
                          className={`bg-white ${
                            engagementFormTouched.venue && engagementFormErrors.venue
                              ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                              : 'border-[#D1D5DC]'
                          }`}
                          value={venue}
                          onChange={(e) => {
                            setVenue(e.target.value);
                            if (engagementFormTouched.venue) {
                              setEngagementFormErrors(prev => ({ ...prev, venue: validateEngagementField('venue', e.target.value) }));
                            }
                          }}
                          onBlur={() => handleEngagementFieldBlur('venue')}
                          aria-required="true"
                          aria-invalid={engagementFormTouched.venue && !!engagementFormErrors.venue}
                          aria-describedby={engagementFormErrors.venue ? 'venue-error' : undefined}
                        />
                        {engagementFormTouched.venue && engagementFormErrors.venue && (
                          <p id="venue-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.venue}</p>
                        )}
                      </div>

                      {/* Date + Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="event-date" className="text-[#1A1A1A] text-[14px] mb-2 block">
                            Date <span className="text-red-600" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <Input
                            id="event-date"
                            type="date"
                            className={`bg-white cursor-pointer ${
                              engagementFormTouched.eventDate && engagementFormErrors.eventDate
                                ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                                : 'border-[#D1D5DC]'
                            }`}
                            value={eventDate}
                            onChange={(e) => {
                              setEventDate(e.target.value);
                              if (engagementFormTouched.eventDate) {
                                setEngagementFormErrors(prev => ({ ...prev, eventDate: validateEngagementField('eventDate', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleEngagementFieldBlur('eventDate')}
                            style={{ colorScheme: 'light' }}
                            aria-required="true"
                            aria-invalid={engagementFormTouched.eventDate && !!engagementFormErrors.eventDate}
                            aria-describedby={engagementFormErrors.eventDate ? 'event-date-error' : undefined}
                          />
                          {engagementFormTouched.eventDate && engagementFormErrors.eventDate && (
                            <p id="event-date-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.eventDate}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="event-time" className="text-[#1A1A1A] text-[14px] mb-2 block">
                            Time <span className="text-red-600" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <Input
                            id="event-time"
                            type="time"
                            className={`bg-white cursor-pointer ${
                              engagementFormTouched.eventTime && engagementFormErrors.eventTime
                                ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                                : 'border-[#D1D5DC]'
                            }`}
                            value={eventTime}
                            onChange={(e) => {
                              setEventTime(e.target.value);
                              if (engagementFormTouched.eventTime) {
                                setEngagementFormErrors(prev => ({ ...prev, eventTime: validateEngagementField('eventTime', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleEngagementFieldBlur('eventTime')}
                            style={{ colorScheme: 'light' }}
                            aria-required="true"
                            aria-invalid={engagementFormTouched.eventTime && !!engagementFormErrors.eventTime}
                            aria-describedby={engagementFormErrors.eventTime ? 'event-time-error' : undefined}
                          />
                          {engagementFormTouched.eventTime && engagementFormErrors.eventTime && (
                            <p id="event-time-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.eventTime}</p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="event-description" className="text-[#1A1A1A] text-[14px] mb-2 block">Description</label>
                        <Textarea
                          id="event-description"
                          placeholder="Enter event description"
                          className="border-[#D1D5DC] bg-white"
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      {/* Attachment */}
                      <div>
                        <label htmlFor="event-attachment" className="text-[#1A1A1A] text-[14px] mb-2 block">
                          Attachment <span className="text-[#6C757D] text-[12px]">(Optional)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="event-attachment"
                            type="file"
                            className="border-[#D1D5DC] bg-white cursor-pointer"
                            aria-describedby="attachment-hint"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAttachment(file.name);
                                toast.success(`File "${file.name}" attached successfully`);
                              }
                            }}
                          />
                          {attachment && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAttachment('');
                                toast.info('Attachment removed');
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                              aria-label="Remove attachment"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                        {attachment && (
                          <div className="mt-2 flex items-center text-sm text-[#6C757D]" aria-live="polite">
                            <FileText className="w-4 h-4 mr-1" aria-hidden="true" />
                            <span>{attachment}</span>
                          </div>
                        )}
                        <p id="attachment-hint" className="text-xs text-[#6C757D] mt-1">
                          Upload formality documents, contracts, or event details (PDF, DOC, etc.)
                        </p>
                      </div>

                      {/* Talent Groups */}
                      <fieldset>
                        <legend className="text-[#1A1A1A] text-[14px] mb-3 block">
                          Select Talent Groups{' '}
                          <span className="text-red-600" aria-hidden="true">*</span>
                          <span className="sr-only">(required — select at least one)</span>
                        </legend>
                        <div
                          className={`space-y-2 p-3 rounded-md ${
                            engagementFormTouched.selectedGroups && engagementFormErrors.selectedGroups
                              ? 'border-2 border-red-600 bg-red-50'
                              : 'border border-transparent'
                          }`}
                          onBlur={() => handleEngagementFieldBlur('selectedGroups')}
                        >
                          {[
                            { id: 'marching-band', label: 'Marching Band' },
                            { id: 'majorettes',    label: 'Majorettes' },
                            { id: 'glee-club',     label: 'Glee Club' },
                            { id: 'dance-club',    label: 'Dance Club' },
                          ].map(({ id, label }) => (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`group-${id}`}
                                checked={selectedGroups.includes(id)}
                                onCheckedChange={(checked) => {
                                  const newGroups = checked
                                    ? [...selectedGroups, id]
                                    : selectedGroups.filter(g => g !== id);
                                  setSelectedGroups(newGroups);
                                  if (engagementFormTouched.selectedGroups) {
                                    setEngagementFormErrors(prev => ({ ...prev, selectedGroups: validateEngagementField('selectedGroups', newGroups) }));
                                  }
                                }}
                              />
                              <label htmlFor={`group-${id}`} className="text-[14px] cursor-pointer">
                                {label}
                              </label>
                            </div>
                          ))}
                        </div>
                        {engagementFormTouched.selectedGroups && engagementFormErrors.selectedGroups && (
                          <p id="groups-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.selectedGroups}</p>
                        )}
                      </fieldset>

                      {/* Submit */}
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        className="bg-[#7A1E1E] text-white hover:bg-[#7A1E1E] min-h-[44px] px-6"
                        disabled={isCreatingEngagement}
                        aria-busy={isCreatingEngagement}
                        onClick={() => {
                          if (isCreatingEngagement) return;
                          
                          setEngagementFormTouched({ eventName: true, venue: true, eventDate: true, eventTime: true, selectedGroups: true });

                          const errors = {
                            eventName:     validateEngagementField('eventName', eventName),
                            venue:         validateEngagementField('venue', venue),
                            eventDate:     validateEngagementField('eventDate', eventDate),
                            eventTime:     validateEngagementField('eventTime', eventTime),
                            selectedGroups:validateEngagementField('selectedGroups', selectedGroups)
                          };
                          setEngagementFormErrors(errors);

                          const missingFields = [];
                          if (!eventName.trim())      missingFields.push('Event Name');
                          if (!venue.trim())           missingFields.push('Venue');
                          if (!eventDate)              missingFields.push('Date');
                          if (!eventTime)              missingFields.push('Time');
                          if (selectedGroups.length === 0) missingFields.push('Talent Groups');

                          if (missingFields.length > 0) {
                            toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
                            return;
                          }
                          
                          setIsCreatingEngagement(true);
                          toast.success('Engagement event created successfully!');
                          
                          setEventName(''); setVenue(''); setEventDate(''); setEventTime('');
                          setDescription(''); setSelectedGroups([]); setAttachment('');
                          setEngagementFormTouched({ eventName: false, venue: false, eventDate: false, eventTime: false, selectedGroups: false });
                          setEngagementFormErrors({ eventName: '', venue: '', eventDate: '', eventTime: '', selectedGroups: '' });
                          setIsCreatingEngagement(false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                        {isCreatingEngagement ? 'Creating…' : 'Schedule Event'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ── Engagement Requests ───────────────────────────────────────── */}
            {engagementTab === 'requests' && (
              <Card
                id="engagement-requests-panel"
                role="tabpanel"
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]"
              >
                <CardHeader>
                  <CardDescription className="text-[#6C757D] text-[16px] leading-[25.6px]">
                    Review and approve event participation requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[640px] overflow-y-auto pr-1">
                    <div className="space-y-4" aria-live="polite" aria-label="Engagement requests">
                      {engagementRequests.map(request => (
                        <article
                          key={request.id}
                          className="bg-white border border-[#E0E0E0] rounded-lg p-4 relative"
                          aria-label={`Engagement request: ${request.eventName}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[#1A1A1A] text-[14px] sm:text-[16px] font-medium mb-1 truncate">
                                {request.eventName}
                              </h3>
                              <p className="text-[#6C757D] text-[12px] sm:text-[14px] truncate">
                                Requested by: {request.requestedBy}
                              </p>
                            </div>
                            <Badge className="bg-[#FEF9C2] text-[#894B00] border-0 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              <span>Pending</span>
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#6C757D] shrink-0" aria-hidden="true" />
                              <span className="text-[#1A1A1A] text-[13px]">{request.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0 max-w-[180px]">
                              <MapPin className="w-3.5 h-3.5 text-[#6C757D] shrink-0" aria-hidden="true" />
                              <span className="text-[#1A1A1A] text-[13px] truncate">{request.venue}</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-1">
                              {request.groups.map(group => (
                                <Badge
                                  key={group}
                                  className="text-white text-[11px]"
                                  style={{ backgroundColor: getTalentGroupColor(group) }}
                                >
                                  {getTalentGroupName(group)}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <p className="text-[#6C757D] text-[14px] leading-[20px] mb-4">
                            {request.description}
                          </p>

                          {request.attachment && (
                            <div className="mb-4 flex items-center gap-2 p-3 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0] overflow-hidden">
                              <FileText className="w-4 h-4 text-[#7A1E1E] shrink-0" aria-hidden="true" />
                              <span className="text-[13px] text-[#1A1A1A] flex-1 truncate min-w-0">{request.attachment}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAttachment({
                                    name: request.attachment!,
                                    type: request.attachment!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'document'
                                  });
                                  setShowAttachmentPreview(true);
                                }}
                                className="min-h-[44px] text-[12px] min-w-[44px]"
                                aria-label={`View attachment: ${request.attachment}`}
                              >
                                <Eye className="w-3 h-3 mr-1" aria-hidden="true" />
                                View
                              </Button>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#7A1E1E] text-white hover:bg-[#6A1919] min-h-[44px] flex-1 sm:flex-none"
                              onClick={() => handleApproveRequest(request.id)}
                              aria-label={`Approve engagement request: ${request.eventName}`}
                            >
                              <CheckCircle className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                              <span className="hidden sm:inline">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-[#6C757D] bg-transparent text-[#1A1A1A] hover:bg-[#F8F9FA] min-h-[44px] flex-1 sm:flex-none"
                              onClick={() => handleDeclineRequest(request.id)}
                              aria-label={`Decline engagement request: ${request.eventName}`}
                            >
                              <XCircle className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                              <span className="hidden sm:inline">Decline</span>
                            </Button>
                          </div>
                        </article>
                      ))}

                      {engagementRequests.length === 0 && (
                        <EmptyState
                          icon={<Clock className="w-12 h-12" />}
                          title="No engagement requests"
                          description="There are no pending engagement requests at the moment. Approved requests will appear in List of Engagements."
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── List of Engagements ───────────────────────────────────────── */}
            {engagementTab === 'events' && (
              <div id="engagement-events-panel" role="tabpanel" className="space-y-4">
                <Card className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <CardDescription className="text-[#6C757D] text-[16px] leading-[25.6px] flex-1">
                        {eventListFilter === 'upcoming' && 'Events scheduled for the future'}
                        {eventListFilter === 'completed' && 'Past engagement events'}
                      </CardDescription>
                      <div
                        className="flex space-x-1 bg-[#F1F3F4] p-1 rounded-lg"
                        role="group"
                        aria-label="Filter events by status"
                      >
                        <Button
                          variant={eventListFilter === 'upcoming' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEventListFilter('upcoming')}
                          className={`text-[12px] min-h-[44px] ${eventListFilter === 'upcoming' ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
                          aria-pressed={eventListFilter === 'upcoming'}
                        >
                          Upcoming
                        </Button>
                        <Button
                          variant={eventListFilter === 'completed' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEventListFilter('completed')}
                          className={`text-[12px] min-h-[44px] ${eventListFilter === 'completed' ? 'bg-[#7A1E1E] text-white hover:bg-[#7A1E1E]' : ''}`}
                          aria-pressed={eventListFilter === 'completed'}
                        >
                          Completed
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[640px] overflow-y-auto pr-1">
                      <div className="space-y-3">
                        {createdEvents.filter(e => e.status === eventListFilter).map(event => (
                          <article
                            key={event.id}
                            className="p-4 bg-white border border-[#E0E0E0] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                            aria-label={`${event.eventName} — ${event.status}`}
                          >
                            <div className="flex items-start min-w-0">
                              <div className="flex items-start space-x-3 min-w-0 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  event.status === 'completed' ? 'bg-[#00C950]/10' : 'bg-[#7A1E1E]/10'
                                }`} aria-hidden="true">
                                  {event.status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-[#00C950]" />
                                  ) : (
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#7A1E1E]" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#1A1A1A] text-[14px] font-medium mb-1">{event.eventName}</p>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {event.groups.map(group => (
                                      <Badge 
                                        key={group}
                                        className="text-white text-[11px]" 
                                        style={{ backgroundColor: getTalentGroupColor(group) }}
                                      >
                                        {getTalentGroupName(group)}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6C757D]">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                                      <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1 min-w-0 max-w-[180px]">
                                      <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                                      <span className="truncate">{event.venue}</span>
                                    </div>
                                  </div>
                                  {event.description && (
                                    <p className="text-[12px] text-[#6C757D] mt-2">{event.description}</p>
                                  )}
                                  {event.attachment && (
                                    <div className="mt-3 flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedAttachment({
                                            name: event.attachment!,
                                            type: event.attachment!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'document'
                                          });
                                          setShowAttachmentPreview(true);
                                        }}
                                        className="min-h-[44px] text-[12px]"
                                        aria-label={`View attachment for ${event.eventName}: ${event.attachment}`}
                                      >
                                        <Eye className="w-3 h-3 mr-1" aria-hidden="true" />
                                        Attachment
                                      </Button>
                                      <span className="hidden sm:block text-[11px] text-[#6C757D] truncate">{event.attachment}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      
                        {createdEvents.filter(e => e.status === eventListFilter).length === 0 && (
                          <EmptyState
                            icon={<Calendar className="w-12 h-12" />}
                            title={eventListFilter === 'upcoming' ? 'No upcoming engagements' : 'No completed engagements'}
                            description={
                              eventListFilter === 'upcoming'
                                ? 'No upcoming engagements are scheduled yet.'
                                : 'No completed engagements found.'
                            }
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Engagement Reports ────────────────────────────────────────── */}
            {engagementTab === 'reports' && (
              <Card
                id="engagement-reports-panel"
                role="tabpanel"
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]"
              >
                <CardHeader>
                  <CardDescription className="text-[#6C757D] text-[16px] leading-[25.6px]">
                    Performance and participation reports for engagements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary Statistics */}
                    <section aria-labelledby="engagement-summary-heading">
                      <h3 id="engagement-summary-heading" className="text-[#7A1E1E] text-[14px] font-medium mb-3">Engagement Summary</h3>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                          <Calendar className="hidden sm:block w-4 h-4 text-[#7A1E1E] mb-1" aria-hidden="true" />
                          <p className="text-[10px] sm:text-[12px] text-[#6C757D] leading-tight">Total Events</p>
                          <p className="text-[18px] sm:text-[24px] font-bold text-[#1A1A1A] leading-tight">{createdEvents.length}</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                          <Users className="hidden sm:block w-4 h-4 text-[#7A1E1E] mb-1" aria-hidden="true" />
                          <p className="text-[10px] sm:text-[12px] text-[#6C757D] leading-tight">Groups Involved</p>
                          <p className="text-[18px] sm:text-[24px] font-bold text-[#1A1A1A] leading-tight">4</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                          <CheckCircle className="hidden sm:block w-4 h-4 text-[#00C950] mb-1" aria-hidden="true" />
                          <p className="text-[10px] sm:text-[12px] text-[#6C757D] leading-tight">Success Rate</p>
                          <p className="text-[18px] sm:text-[24px] font-bold text-[#00C950] leading-tight">100%</p>
                        </div>
                      </div>
                    </section>

                    {/* Participation by Talent Group — ResponsiveTable */}
                    <section aria-labelledby="participation-heading">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <h3 id="participation-heading" className="text-[#7A1E1E] text-[14px] font-medium">
                          Participation by Talent Group
                        </h3>
                        <div>
                          <label htmlFor="report-group-filter" className="sr-only">Filter report by talent group</label>
                          <Select value={reportGroupFilter} onValueChange={setReportGroupFilter}>
                            <SelectTrigger id="report-group-filter" className="w-full sm:w-[200px] border-2 border-[#7A1E1E] bg-white h-[44px]">
                              <SelectValue placeholder="Filter by group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Groups</SelectItem>
                              <SelectItem value="marching-band">Marching Band</SelectItem>
                              <SelectItem value="majorettes">Majorettes</SelectItem>
                              <SelectItem value="glee-club">Glee Club</SelectItem>
                              <SelectItem value="dance-club">Dance Club</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(() => {
                        const filtered = createdEvents.filter(e =>
                          reportGroupFilter === 'all' || e.groups.includes(reportGroupFilter)
                        );
                        return filtered.length > 0 ? (
                          <ResponsiveTable
                            caption="Engagement events participation by talent group"
                            ariaLabel="Engagement events participation by talent group"
                            columns={[
                              { key: 'eventName', label: 'Event Name' },
                              { key: 'date',      label: 'Date' },
                              { key: 'venue',     label: 'Venue' },
                              { key: 'groups',    label: 'Talent Groups' },
                            ]}
                            data={filtered}
                            renderCell={(event, column) => {
                              if (column.key === 'eventName') return <span className="text-[14px] text-[#1A1A1A]">{event.eventName}</span>;
                              if (column.key === 'date')      return <span className="text-[13px] text-[#6C757D]">{event.date}</span>;
                              if (column.key === 'venue')     return <span className="text-[13px] text-[#6C757D]">{event.venue}</span>;
                              if (column.key === 'groups')    return (
                                <div className="flex flex-wrap gap-1">
                                  {event.groups.map((group: string) => (
                                    <Badge key={group} className="text-white text-[10px]" style={{ backgroundColor: getTalentGroupColor(group) }}>
                                      {getTalentGroupName(group)}
                                    </Badge>
                                  ))}
                                </div>
                              );
                              return null;
                            }}
                          />
                        ) : (
                          <EmptyState
                            icon={<Calendar className="w-12 h-12" />}
                            title="No events found"
                            description="No events match the selected filter. Try selecting a different talent group."
                          />
                        );
                      })()}
                    </section>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* ══ Scholarship View ═════════════════════════════════════════════════ */}
        {currentView === 'scholarship' && (
          <section
            id="scholarship-panel"
            role="tabpanel"
            aria-labelledby="scholarship-heading"
            className="space-y-4"
          >
            <h2 id="scholarship-heading" className="sr-only">Scholarship Dashboard</h2>

            {/* Stats Cards */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
              role="list"
              aria-label="Scholarship renewals by talent group"
            >
              {[
                { key: 'marching-band', label: 'Marching Band' },
                { key: 'majorettes',    label: 'Majorettes' },
                { key: 'glee-club',     label: 'Glee Club' },
                { key: 'dance-club',    label: 'Dance Club' },
              ].map(({ key, label }) => {
                const count = scholarshipRenewals.filter(r => r?.talentGroup === key).length;
                return (
                  <Card
                    key={key}
                    role="listitem"
                    className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]"
                    onClick={() => setScholarshipGroupFilter(key)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setScholarshipGroupFilter(key); } }}
                    aria-label={`${label}: ${count} renewal requests. Activate to filter.`}
                  >
                    <CardContent className="p-3 sm:p-6">
                  <p className="text-[#6C757D] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">{label}</p>
                  <p className="text-[#1A1A1A] text-[18px] sm:text-[24px] leading-[24px] sm:leading-[32px] font-bold">{count}</p>
                </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Scholarship Renewal Requests */}
            <Card className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5" aria-hidden="true" />
                      <span id="renewal-table-heading" className="text-[#1A1A1A] text-[16px] leading-[16px]">Scholarship Renewal Requests</span>
                    </CardTitle>
                    <CardDescription className="text-[#6C757D] text-[16px] leading-[25.6px]">
                      View scholarship renewal applications endorsed by Directors
                    </CardDescription>
                  </div>
                  
                  <div>
                    <label htmlFor="scholarship-group-filter" className="sr-only">Filter scholarship renewals by talent group</label>
                    <Select value={scholarshipGroupFilter} onValueChange={setScholarshipGroupFilter}>
                      <SelectTrigger id="scholarship-group-filter" className="w-full sm:w-[180px] border-2 border-[#7A1E1E] bg-white h-[44px]">
                        <SelectValue placeholder="Filter by group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        <SelectItem value="marching-band">Marching Band</SelectItem>
                        <SelectItem value="majorettes">Majorettes</SelectItem>
                        <SelectItem value="glee-club">Glee Club</SelectItem>
                        <SelectItem value="dance-club">Dance Club</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const filteredRenewals = scholarshipRenewals.filter(renewal => 
                    renewal && (scholarshipGroupFilter === 'all' || renewal.talentGroup === scholarshipGroupFilter)
                  );
                  return filteredRenewals.length > 0 ? (
                    <ResponsiveTable
                      caption="Scholarship renewal requests endorsed by Directors"
                      ariaLabel="Scholarship renewal requests"
                      columns={[
                        { key: 'scholarName',    label: 'Scholar Name' },
                        { key: 'studentId',      label: 'Student ID' },
                        { key: 'talentGroup',    label: 'Talent Group' },
                        { key: 'recommendation', label: "Director's Recommendation" },
                      ]}
                      data={filteredRenewals}
                      renderCell={(renewal, column) => {
                        if (column.key === 'scholarName') return (
                          <div>
                            <p className="text-[#1A1A1A] text-[14px] font-medium">{renewal.scholarName}</p>
                            <p className="text-[#6C757D] text-[12px]">{renewal.course}</p>
                          </div>
                        );
                        if (column.key === 'studentId') return <span className="text-[#6C757D] text-[14px]">{renewal.studentId}</span>;
                        if (column.key === 'talentGroup') return (
                          <Badge className="text-white text-[12px]" style={{ backgroundColor: getTalentGroupColor(renewal.talentGroup) }}>
                            {getTalentGroupName(renewal.talentGroup)}
                          </Badge>
                        );
                        if (column.key === 'recommendation') return (
                          <div>
                            <p className="text-[#1A1A1A] text-[14px] font-medium">{renewal.renewalRecommendation}</p>
                            <p className="text-[#6C757D] text-[12px]">Evaluated by {renewal.directorName}</p>
                          </div>
                        );
                        return null;
                      }}
                      renderActions={(renewal) => (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white min-h-[44px]"
                          onClick={() => {
                            setSelectedRenewal(renewal);
                            setShowRenewalDetails(true);
                          }}
                          aria-label={`View renewal details for ${renewal.scholarName}`}
                        >
                          <Eye className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">View</span>                        </Button>
                      )}
                    />
                  ) : (
                    <EmptyState
                      icon={<GraduationCap className="w-12 h-12" />}
                      title="No scholarship renewal requests"
                      description={
                        scholarshipGroupFilter === 'all' 
                          ? 'No scholarship renewal requests at the moment.'
                          : `No scholarship renewal requests for ${getTalentGroupName(scholarshipGroupFilter)}.`
                      }
                    />
                  );
                })()}
              </CardContent>
            </Card>
          </section>
        )}

        {/* ══ Documents View ═══════════════════════════════════════════════════ */}
        {currentView === 'documents' && (
          <section id="documents-panel" role="tabpanel" aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">Documents</h2>
            <DocumentsDashboard 
              user={user}
              onLogout={onLogout}
              onNavigateBack={() => setCurrentView('member-profile')}
              contentOnly={true}
            />
          </section>
        )}
      </main>

      {/* ── Scholar Profile Dialog ────────────────────────────────────────────── */}
      <Dialog open={showScholarProfile} onOpenChange={setShowScholarProfile}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#7A1E1E] text-[20px] font-bold">Scholar Profile</DialogTitle>
            <DialogDescription className="text-[#6C757D] text-[14px]">
              View detailed information about this scholar
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(80vh-150px)] pr-4">
            {selectedScholar && (
              <div className="space-y-6 pb-4">
                {/* Scholar Header */}
                <div className="flex items-center space-x-4 pb-4 border-b border-[#E0E0E0]">
                  <div className="w-20 h-20 bg-[#7A1E1E]/10 rounded-full flex items-center justify-center" aria-hidden="true">
                    <User className="w-10 h-10 text-[#7A1E1E]" />
                  </div>
                  <div>
                    <h3 className="text-[#1A1A1A] text-[20px] font-bold">{selectedScholar.name}</h3>
                    <Badge 
                      className="text-white text-[16px] mt-2 px-3 py-1" 
                      style={{ backgroundColor: getTalentGroupColor(selectedScholar.talentGroup || '') }}
                    >
                      {getTalentGroupName(selectedScholar.talentGroup || '')}
                    </Badge>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <section aria-labelledby="personal-info-heading">
                      <h4 id="personal-info-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Personal Information</h4>
                      <dl className="space-y-3">
                        {[
                          { label: 'Student ID',    value: selectedScholar.studentId },
                          { label: 'Email',         value: selectedScholar.email },
                          { label: 'Phone',         value: selectedScholar.phone },
                          { label: 'Address',       value: selectedScholar.address },
                          { label: 'Date of Birth', value: selectedScholar.dateOfBirth ? new Date(selectedScholar.dateOfBirth).toLocaleDateString() : null },
                          { label: 'Age',           value: selectedScholar.dateOfBirth && calculateAge(selectedScholar.dateOfBirth) !== null ? `${calculateAge(selectedScholar.dateOfBirth)} years old` : null },
                          { label: 'Gender',        value: selectedScholar.gender },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <dt className="text-[#6C757D] text-[12px] font-medium">{label}</dt>
                            <dd className="text-[#1A1A1A] text-[14px]">{value || 'Not provided'}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>

                    <section aria-labelledby="emergency-contact-heading">
                      <h4 id="emergency-contact-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Emergency Contact</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Contact Name</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.emergencyContact || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Contact Phone</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.emergencyPhone || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Relationship</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.emergencyContactRelationship || 'Not provided'}</dd>
                        </div>
                      </dl>
                    </section>

                    <section aria-labelledby="guardian-heading">
                      <h4 id="guardian-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Guardian Information</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Guardian's Name</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.guardianName || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Guardian's Contact</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.guardianContact || 'Not provided'}</dd>
                        </div>
                      </dl>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <section aria-labelledby="medical-heading">
                      <h4 id="medical-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Medical Information</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Allergies</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.allergies || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Medical Conditions</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.medicalConditions || 'Not provided'}</dd>
                        </div>
                      </dl>
                    </section>

                    <section aria-labelledby="educational-heading">
                      <h4 id="educational-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Educational Information</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Course</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.course || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#6C757D] text-[12px] font-medium">Year Level</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{selectedScholar.yearLevel || 'Not provided'}</dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                </div>

                {/* Assigned Items Section */}
                {selectedScholar.talentGroup !== 'dance-club' && (
                <section className="border-t border-[#E0E0E0] pt-6" aria-labelledby="assigned-items-heading">
                  <h4 id="assigned-items-heading" className="text-[#7A1E1E] text-[18px] font-bold mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" aria-hidden="true" />
                    Assigned Items
                  </h4>
                  
                  <div className={`grid gap-6 ${selectedScholar.talentGroup === 'marching-band' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {selectedScholar.talentGroup === 'marching-band' && (
                      <div>
                        <h5 className="text-[#6C757D] text-[14px] font-bold mb-3">Instrument</h5>
                        {selectedScholar.assignedInstrument ? (
                          <Card className="border-[#E5E7EB] bg-gradient-to-r from-[#7A1E1E]/5 to-transparent">
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <p className="font-medium text-[#1A1A1A] text-[14px]">{selectedScholar.assignedInstrument}</p>
                                <div className="space-y-1">
                                  <p className="text-[#6C757D] text-[11px]">Item ID: INST-001</p>
                                  <p className="text-[#6C757D] text-[11px]">Condition: Good</p>
                                  <p className="text-[#6C757D] text-[11px]">Issued: 2024-08-15</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="text-[#6C757D] text-[14px]">Not assigned</div>
                        )}
                      </div>
                    )}

                    <div>
                      <h5 className="text-[#6C757D] text-[14px] font-bold mb-3">Uniform</h5>
                      <Card className="border-[#E0E0E0]">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <p className="font-medium text-[#1A1A1A] text-[14px]">Complete Set</p>
                            <div className="space-y-1">
                              <p className="text-[#6C757D] text-[11px]">ID: UNI-045</p>
                              <p className="text-[#6C757D] text-[11px]">Condition: Good</p>
                              <p className="text-[#6C757D] text-[11px]">Issued: 2024-08-20</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-[#E0E0E0]">
                              <p className="text-[#6C757D] text-[10px]">4 items: Top, Pants, Headdress, Shoes</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedScholar.talentGroup === 'marching-band' && (
                      <div>
                        <h5 className="text-[#6C757D] text-[14px] font-bold mb-3">Accessories</h5>
                        <Card className="border-[#E0E0E0]">
                          <CardContent className="pt-4">
                            <div>
                              <p className="text-[#1A1A1A] text-[13px] font-medium">Music Stand</p>
                              <p className="text-[#6C757D] text-[10px]">ID: 089</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </section>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Event Details Dialog ──────────────────────────────────────────────── */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#7A1E1E] text-[20px] font-bold">Event Participation Details</DialogTitle>
            <DialogDescription className="text-[#6C757D] text-[14px]">
              View scholars who attended this event
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-2">{selectedEvent.eventName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px]">
                  <div>
                    <Calendar className="w-4 h-4 text-[#6C757D]" aria-hidden="true" />
                    <span className="text-[#6C757D]">{selectedEvent.date}</span>
                  </div>
                  <div>
                    <MapPin className="w-4 h-4 text-[#6C757D]" aria-hidden="true" />
                    <span className="text-[#6C757D]">{selectedEvent.venue}</span>
                  </div>
                </div>
                {selectedEvent.description && (
                  <p className="text-[#6C757D] text-[14px] mt-2">{selectedEvent.description}</p>
                )}
              </div>

              <section aria-labelledby="attending-groups-heading">
                <h4 id="attending-groups-heading" className="text-[#7A1E1E] text-[14px] font-medium mb-3">Attending Talent Groups</h4>
                <div className="space-y-3">
                  {selectedEvent.groups.map((group: string) => {
                    const groupScholars = scholars.filter(s => s.talentGroup === group);
                    return (
                      <div key={group} className="p-3 bg-white rounded-lg border border-[#E0E0E0]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            style={{ backgroundColor: getTalentGroupColor(group) }} 
                            className="text-white text-[16px] px-3 py-1"
                          >
                            {getTalentGroupName(group)}
                          </Badge>
                          <span className="text-[12px] text-[#6C757D]">
                            {groupScholars.length} scholars
                          </span>
                        </div>
                        <ScrollArea className="max-h-[150px]">
                          <ul className="space-y-1" aria-label={`${getTalentGroupName(group)} attending scholars`}>
                            {groupScholars.map(scholar => (
                              <li 
                                key={scholar.id}
                                className="flex items-center space-x-2 p-2 hover:bg-[#F8F9FA] rounded"
                              >
                                <CheckCircle className="w-3 h-3 text-[#00C950]" aria-hidden="true" />
                                <span className="text-[13px] text-[#1A1A1A]">{scholar.name}</span>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Renewal Details Dialog ────────────────────────────────────────────── */}
      <Dialog open={showRenewalDetails} onOpenChange={setShowRenewalDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#7A1E1E] text-[20px] font-bold">Scholarship Renewal Evaluation</DialogTitle>
            <DialogDescription className="text-[#6C757D] text-[14px]">
              View complete evaluation endorsed by Director
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(80vh-150px)] pr-4">
            {selectedRenewal && (
              <div className="space-y-6 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section aria-labelledby="renewal-scholar-heading" className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                    <h3 id="renewal-scholar-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Scholar Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Full Name</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{selectedRenewal.scholarName}</dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Student ID</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{selectedRenewal.studentId}</dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Talent Group</dt>
                        <dd>
                          <Badge 
                            className="text-white text-[12px] mt-1" 
                            style={{ backgroundColor: getTalentGroupColor(selectedRenewal.talentGroup) }}
                          >
                            {getTalentGroupName(selectedRenewal.talentGroup)}
                          </Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Submission Date</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{selectedRenewal.submittedDate}</dd>
                      </div>
                    </dl>
                  </section>

                  <section aria-labelledby="renewal-educational-heading" className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                    <h3 id="renewal-educational-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Educational Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Course</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{selectedRenewal.course}</dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Year Level</dt>
                        <dd className="text-[#1A1A1A] text-[14px] font-medium">{selectedRenewal.yearLevel}</dd>
                      </div>
                      <div>
                        <dt className="text-[#6C757D] text-[12px] mb-1">Current GPA</dt>
                        <dd className="text-[#1A1A1A] text-[20px] font-bold">{selectedRenewal.academicGPA}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                {/* Detailed Evaluation Breakdown */}
                {selectedRenewal.evaluation && (
                  <section aria-labelledby="evaluation-breakdown-heading" className="p-4 bg-white rounded-lg border border-[#E0E0E0]">
                    <h3 id="evaluation-breakdown-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-4">Detailed Performance Evaluation</h3>
                    
                    {selectedRenewal.evaluation.sectionA && (
                      <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
                        <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-3">Section A: Attendance &amp; Punctuality</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                          <div><span className="text-[#6C757D]">Reports on time:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.reportsOnTime}/5</span></div>
                          <div><span className="text-[#6C757D]">Reports regularly:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.reportsRegularly}/5</span></div>
                          <div><span className="text-[#6C757D]">Practices on time:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.practicesOnTime}/5</span></div>
                          <div><span className="text-[#6C757D]">Practices regularly:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.practicesRegularly}/5</span></div>
                          <div><span className="text-[#6C757D]">No unnecessary absence:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.noUnnecessaryAbsence}/5</span></div>
                          <div><span className="text-[#6C757D]">Mastery of tasks:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.mastersyTasks}/5</span></div>
                          <div><span className="text-[#6C757D]">Maintains cleanliness:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionA.maintainsCleanliness}/5</span></div>
                        </div>
                      </div>
                    )}

                    {selectedRenewal.evaluation.sectionB && (
                      <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
                        <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-3">Section B: Commitment &amp; Dedication</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                          <div><span className="text-[#6C757D]">Improvement interest:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionB.improvementInterest}/5</span></div>
                          <div><span className="text-[#6C757D]">Performance interest:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionB.performanceInterest}/5</span></div>
                          <div><span className="text-[#6C757D]">Work ethic:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionB.workEthic}/5</span></div>
                          <div><span className="text-[#6C757D]">Initiative:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionB.initiative}/5</span></div>
                          <div><span className="text-[#6C757D]">Efficiency:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionB.efficiency}/5</span></div>
                        </div>
                      </div>
                    )}

                    {selectedRenewal.evaluation.sectionC && (
                      <div className="mb-4 p-3 bg-[#F8F9FA] rounded-lg">
                        <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-3">Section C: Interpersonal Skills</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                          <div><span className="text-[#6C757D]">Teamwork:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionC.teamwork}/5</span></div>
                          <div><span className="text-[#6C757D]">Tact:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionC.tact}/5</span></div>
                          <div><span className="text-[#6C757D]">Courtesy:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionC.courtesy}/5</span></div>
                          <div><span className="text-[#6C757D]">Disposition:</span> <span className="font-bold">{selectedRenewal.evaluation.sectionC.disposition}/5</span></div>
                        </div>
                      </div>
                    )}

                    {(selectedRenewal.evaluation?.overallRating || selectedRenewal.evaluation?.adjectivalRating || selectedRenewal.evaluation?.recommendForRenewal !== undefined) && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-[#7A1E1E]/10 to-transparent rounded-lg border border-[#7A1E1E]/20">
                        <h4 className="text-[#7A1E1E] text-[14px] font-bold mb-3">Overall Evaluation Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                          {selectedRenewal.evaluation.overallRating && (
                            <div>
                              <p className="text-[#6C757D] text-[12px] mb-1">Overall Rating</p>
                              <p className="text-[#7A1E1E] text-[24px] font-bold">{selectedRenewal.evaluation.overallRating}/5.00</p>
                            </div>
                          )}
                          {selectedRenewal.evaluation.adjectivalRating && (
                            <div>
                              <p className="text-[#6C757D] text-[12px] mb-1">Adjectival Rating</p>
                              <p className="text-[#1A1A1A] text-[18px] font-bold">{selectedRenewal.evaluation.adjectivalRating}</p>
                            </div>
                          )}
                          {selectedRenewal.evaluation.recommendForRenewal !== undefined && (
                            <div>
                              <p className="text-[#6C757D] text-[12px] mb-1">Renewal Recommendation</p>
                              <Badge className={selectedRenewal.evaluation.recommendForRenewal ? "bg-green-600 text-white text-[12px]" : "bg-red-600 text-white text-[12px]"}>
                                {selectedRenewal.evaluation.recommendForRenewal ? "Recommended" : "Not Recommended"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRenewal.scholarshipPercentage && (
                      <div className="p-4 bg-gradient-to-br from-[#7A1E1E] to-[#6A1919] rounded-lg text-center">
                        <GraduationCap className="w-10 h-10 text-white mx-auto mb-2" aria-hidden="true" />
                        <p className="text-white text-[12px] mb-1">Scholarship Grant</p>
                        <p className="text-white text-[32px] font-bold" aria-label={`${selectedRenewal.scholarshipPercentage} percent scholarship`}>
                          {selectedRenewal.scholarshipPercentage}%
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* Performance Feedback */}
                <section aria-labelledby="feedback-heading" className="p-4 bg-white rounded-lg border border-[#E0E0E0]">
                  <h3 id="feedback-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Performance Feedback</h3>
                  
                  {selectedRenewal.evaluation?.strengths || selectedRenewal.evaluation?.improvements ? (
                    <div className="space-y-4">
                      {selectedRenewal.evaluation.strengths && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="text-green-800 text-[14px] font-bold mb-2">Strengths</h4>
                          <p className="text-green-900 text-[14px] leading-[22px]">
                            {selectedRenewal.evaluation.strengths}
                          </p>
                        </div>
                      )}
                      
                      {selectedRenewal.evaluation.improvements && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-blue-800 text-[14px] font-bold mb-2">Areas for Improvement</h4>
                          <p className="text-blue-900 text-[14px] leading-[22px]">
                            {selectedRenewal.evaluation.improvements}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-[#6C757D] text-[12px] pt-3 border-t border-[#E0E0E0]">
                        <User className="w-4 h-4" aria-hidden="true" />
                        <span>Evaluated by: <strong>{selectedRenewal.directorName}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F8F9FA] rounded-lg">
                      <p className="text-[#1A1A1A] text-[14px] leading-[22px] mb-3">
                        {selectedRenewal.directorRemarks}
                      </p>
                      <div className="flex items-center space-x-2 text-[#6C757D] text-[12px] pt-3 border-t border-[#E0E0E0]">
                        <User className="w-4 h-4" aria-hidden="true" />
                        <span>Evaluated by: <strong>{selectedRenewal.directorName}</strong></span>
                      </div>
                    </div>
                  )}
                </section>

                {selectedRenewal.documents && selectedRenewal.documents.length > 0 && (
                  <section aria-labelledby="attached-docs-heading" className="p-4 bg-white rounded-lg border border-[#E0E0E0]">
                    <h3 id="attached-docs-heading" className="text-[#7A1E1E] text-[16px] font-bold mb-3">Attached Documents</h3>
                    <ul className="space-y-2">
                      {selectedRenewal.documents.map((doc: string, index: number) => (
                        <li key={index} className="flex items-center space-x-3 p-3 bg-[#F8F9FA] rounded-lg">
                          <FileText className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
                          <span className="text-[#1A1A1A] text-[14px] flex-1">{doc}</span>
                          <Badge className="bg-[#E0E0E0] text-[#6C757D] border-0">PDF</Badge>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Attachment Preview Dialog ─────────────────────────────────────────── */}
      <Dialog open={showAttachmentPreview} onOpenChange={setShowAttachmentPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-7xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E0E0E0]">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              Document Preview
            </DialogTitle>
            <DialogDescription>
              {selectedAttachment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedAttachment && (
              <div className="h-full bg-[#F8F9FA] flex items-center justify-center">
                {selectedAttachment.type === 'pdf' ? (
                  <div className="w-full h-full bg-white p-8 overflow-auto">
                    <div className="max-w-5xl mx-auto space-y-4">
                      <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-[#7A1E1E]" aria-hidden="true" />
                        <h3 className="text-lg font-medium mb-2">PDF Document</h3>
                        <p className="text-sm text-[#6C757D] mb-4">{selectedAttachment.name}</p>
                        <p className="text-xs text-[#6C757D] mb-6">
                          In production, this would display the actual PDF content using a PDF viewer component.
                        </p>
                        <div className="space-y-2 text-left bg-[#F8F9FA] p-4 rounded-lg">
                          <p className="text-sm"><strong>Sample Document Content:</strong></p>
                          <p className="text-sm text-[#6C757D]">This is a preview of the engagement event contract or formality document.</p>
                          <p className="text-sm text-[#6C757D] mt-2">
                            The document contains details about the event requirements, performance expectations, 
                            venue arrangements, and other important information related to the talent group engagement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-[#7A1E1E]" aria-hidden="true" />
                    <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                    <p className="text-sm text-[#6C757D]">{selectedAttachment.name}</p>
                    <p className="text-xs text-[#6C757D] mt-4">Document preview available in production</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-[#E0E0E0] flex justify-end items-center shrink-0">
            <Button
              onClick={() => {
                toast.success(`Downloaded ${selectedAttachment?.name}`);
              }}
              className="bg-[#7A1E1E] hover:bg-[#6A1919] min-h-[44px]"
              aria-label={`Download ${selectedAttachment?.name}`}
            >
              <Download className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">Download</span>            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Logout Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <DialogContent className="max-w-[95vw] sm:max-w-md border-[#E0E0E0]">
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
