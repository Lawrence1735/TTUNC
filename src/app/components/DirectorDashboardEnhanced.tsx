import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { 
  LogOut, 
  Users, 
  Bell,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  CalendarPlus,
  Mail,
  MapPin,
  Clock,
  GraduationCap,
  Send,
  FileText,
  User,
  Phone,
  Music,
  TrendingUp,
  Edit,
  Package,
  AlertCircle,
  Trophy,
  X,
  Shirt,
  ClipboardList,
  Star,
  Download,
  Search,
  Settings,
  Lock,
  Shield,
  UserCog
} from './ui/icons';
import { User as UserType, Application, TrainingRecord, Event, Announcement } from '../App';
import { getTalentGroupColor, getTalentGroupName } from './ui/unc-colors';
import { DocumentsDashboard } from './DocumentsDashboardTabs';
import { QuickStatsCard } from './ui/QuickStatsCard';
import { EvaluationFormDialog } from './EvaluationFormDialog';
import { ChapterEvaluationDialog } from './ChapterEvaluationDialog';
import { DirectorEngagementRehearsalView } from './DirectorEngagementRehearsalView';
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
import { ApplicationDetailsDialog } from './ApplicationDetailsDialog';
import { DirectorRecruitmentTab } from './DirectorRecruitmentTab';
import { DirectorTrainingTab } from './DirectorTrainingTab';
import { DirectorMemberProfileTab } from './DirectorMemberProfileTab';
import { TraineeDetailsDialog } from './TraineeDetailsDialog';
import type { Evaluation } from './types';
import trainingClient from '../../api/trainingClient';
import { applicationClient, ApplicationResponse } from '../../api/applicationClient';
import engagementService from '../services/engagementService';
import announcementService from '../services/announcementService';
import { api } from '../services/api';

interface DirectorDashboardProps {
  user: UserType;
  onLogout: () => void;
  applications: Application[];
  users: UserType[];
  trainingRecords: TrainingRecord[];
  events: Event[];
  announcements: Announcement[];
  evaluations: Evaluation[];
  setEvaluations: (evaluations: Evaluation[]) => void;
  onUpdateApplicationStatus: (applicationId: string, status: 'approved' | 'disapproved') => void;
  onCompleteTraining: (userId: string, evaluation: 'qualified' | 'not_qualified', scholarshipPercentage?: number) => void;
  onUpdateUser?: (userId: string, updates: Partial<UserType>) => void;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
  onViewChange?: (view: 'overview' | 'applications' | 'training' | 'engagement' | 'roster' | 'documents' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
  inventoryItems?: any[];
  onAddInventoryItem?: (item: any) => void;
  onUpdateInventoryItem?: (itemId: string, updates: any) => void;
}

interface InterviewSchedule {
  id: string;
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  googleCalendarEventId?: string;
}



interface AttendanceRecord {
  date: string;
  attendees: { [userId: string]: boolean | 'present' | 'excused' | 'absent' | { status: boolean; timestamp?: string } };
  noPractice?: boolean;
}

export type { Evaluation };

interface EngagementRequest {
  id: string;
  eventName: string;
  date: Date;
  time: string;
  venue: string;
  description: string;
  type?: 'performance' | 'rehearsal' | 'workshop' | 'competition';
  status: 'pending' | 'accepted' | 'rejected' | 'pending_admin_approval' | 'pending_director_approval' | 'scheduled';
  attendanceRecords?: AttendanceRecord[];
  attachment?: string; // Optional attachment for formality documents
}

interface LatestUpdate {
  id: string;
  category: string;
  date: string;
  icon: string;
  title: string;
  description: string;
  talentGroup: string;
  createdBy: string;
  createdAt: Date;
}

export function DirectorDashboardEnhanced({ 
  user, 
  onLogout, 
  applications, 
  users, 
  trainingRecords, 
  events, 
  announcements, 
  evaluations: propEvaluations,
  setEvaluations: setPropEvaluations,
  onUpdateApplicationStatus,
  onCompleteTraining,
  onUpdateUser,
  unreadNotifications = 0,
  onNotificationsClick,
  onViewChange,
  inventoryItems = [],
  onAddInventoryItem,
  onUpdateInventoryItem
}: DirectorDashboardProps) {
  const [currentView, setCurrentView] = useState<'recruitment' | 'training' | 'member-profile' | 'engagement' | 'documents'>('recruitment');
  const [inventoryTab, setInventoryTab] = useState<'uniforms' | 'instruments' | 'accessories'>('uniforms');
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // Applications state for API fetching
  const [fetchedApplications, setFetchedApplications] = useState<ApplicationResponse[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
  const [interviewSchedules, setInterviewSchedules] = useState<InterviewSchedule[]>([]);

  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    venue: 'Music Building Room 201',
    notes: ''
  });

  // Training module state
  const [selectedTrainee, setSelectedTrainee] = useState<UserType | null>(null);
  const [selectedScholar, setSelectedScholar] = useState<UserType | null>(null);
  const [selectedScholarProfileLoading, setSelectedScholarProfileLoading] = useState(false);
  const [scholarProfileApplicationsByUserId, setScholarProfileApplicationsByUserId] = useState<Record<string, ApplicationResponse>>({});
  const [selectedTraineePerformance, setSelectedTraineePerformance] = useState<UserType | null>(null);
  const [showTraineeDialog, setShowTraineeDialog] = useState(false);
  const [showScholarDialog, setShowScholarDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [showTraineePerformanceDialog, setShowTraineePerformanceDialog] = useState(false);
  const [showAddDateDialog, setShowAddDateDialog] = useState(false);
  const [showSummaryReportDialog, setShowSummaryReportDialog] = useState(false);
  const [newAttendanceDate, setNewAttendanceDate] = useState('');
  const [selectedDatesToAdd, setSelectedDatesToAdd] = useState<string[]>([]);
  const [showCheckAttendanceDialog, setShowCheckAttendanceDialog] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<{index: number; date: string} | null>(null);
  const [dateGenerationForm, setDateGenerationForm] = useState({
    startDate: '',
    endDate: '',
    frequency: 'weekly' as 'weekly' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
    trainingDays: [] as string[]
  });
  const [showAssignUniformDialog, setShowAssignUniformDialog] = useState(false);
  const [showAssignInstrumentDialog, setShowAssignInstrumentDialog] = useState(false);
  const [showAssignAccessoryDialog, setShowAssignAccessoryDialog] = useState(false);
  const [showViewUniformDialog, setShowViewUniformDialog] = useState(false);
  const [showViewInstrumentDialog, setShowViewInstrumentDialog] = useState(false);
  const [showViewAccessoryDialog, setShowViewAccessoryDialog] = useState(false);
  const [selectedUniform, setSelectedUniform] = useState<any>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<any>(null);
  const [assignScholarId, setAssignScholarId] = useState(''); // Track selected scholar for assignment
  const [inventoryUpdateTrigger, setInventoryUpdateTrigger] = useState(0); // Trigger re-render for inventory updates
  const [showEngagementAttendanceDialog, setShowEngagementAttendanceDialog] = useState(false);
  const [showRequestEventDialog, setShowRequestEventDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [showLatestUpdateDialog, setShowLatestUpdateDialog] = useState(false);
  
  // Form submission loading states
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  
  // Attachment preview state
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; type: string } | null>(null);
  const [loadingPerformanceData, setLoadingPerformanceData] = useState(false);
  const [selectedScholarRenewalDocs, setSelectedScholarRenewalDocs] = useState<Array<{
    id: string;
    name: string;
    uploadedDate: string;
    source: string;
  }>>([]);
  const [selectedScholarAttendanceStats, setSelectedScholarAttendanceStats] = useState({
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
  });
  const [selectedScholarCurrentScholarship, setSelectedScholarCurrentScholarship] = useState(0);
  
  // Form validation states for Request Event
  const [eventFormTouched, setEventFormTouched] = useState({
    eventName: false,
    date: false,
    time: false,
    venue: false,
    description: false
  });
  const [eventFormErrors, setEventFormErrors] = useState({
    eventName: '',
    date: '',
    time: '',
    venue: '',
    description: ''
  });
  
  // Form validation states for Latest Update
  const [updateFormTouched, setUpdateFormTouched] = useState({
    category: false,
    date: false,
    title: false,
    description: false
  });
  const [updateFormErrors, setUpdateFormErrors] = useState({
    category: '',
    date: '',
    title: '',
    description: ''
  });
  
  // Latest Updates State
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdate[]>([]);
  const [latestUpdateForm, setLatestUpdateForm] = useState({
    category: '',
    date: '',
    icon: 'trophy',
    title: '',
    description: ''
  });
  const [showEditUpdateDialog, setShowEditUpdateDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<LatestUpdate | null>(null);
  
  // Instrument assignment and training chapters
  const [traineeInstruments, setTraineeInstruments] = useState<{[traineeId: string]: string}>({});
  // Voice assignment for Glee Club
  const [traineeVoices, setTraineeVoices] = useState<{[traineeId: string]: string}>({});
  const [traineeChapters, setTraineeChapters] = useState<{[traineeId: string]: {[chapter: number]: boolean}}>({});

  // Chapter evaluation tracking: { traineeId: { chapterNum: { passed: boolean, score: number, date?: Date } } }
  const [chapterEvaluations, setChapterEvaluations] = useState<{
    [traineeId: string]: {
      [chapterNum: number]: {
        passed: boolean;
        score?: number;
        date?: Date;
        notes?: string;
      }
    }
  }>({});

  // Per-chapter evaluation dialog state
  const [showChapterEvalDialog, setShowChapterEvalDialog] = useState(false);
  const [selectedChapterForEval, setSelectedChapterForEval] = useState<{ traineeId: string; chapterNum: number } | null>(null);
  const [chapterEvalForm, setChapterEvalForm] = useState({
    score: 0,
    notes: '',
    passed: true
  });

  const [selectedScholarForPerformance, setSelectedScholarForPerformance] = useState<UserType | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<EngagementRequest | null>(null);
  
  // Trainee status tracking (in_training or deactivated)
  const [traineeStatuses, setTraineeStatuses] = useState<{ [userId: string]: 'in_training' | 'deactivated' }>({});
  const [showDeactivateWarning, setShowDeactivateWarning] = useState(false);
  const [traineeToDeactivate, setTraineeToDeactivate] = useState<UserType | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  // Attendance tracking for training
  const [trainingAttendance, setTrainingAttendance] = useState<AttendanceRecord[]>([]);

  // Use evaluations from props
  const evaluations = propEvaluations;
  const setEvaluations = setPropEvaluations;

  const [evaluationForm, setEvaluationForm] = useState({
    // Basic Info
    scholarName: '',
    talentUnit: '',
    ratingPeriod: '',
    
    // Section A - Attendance and Punctuality (1-5 scale)
    sectionA: {
      reportsOnTime: 0,
      reportsRegularly: 0,
      practicesOnTime: 0,
      practicesRegularly: 0,
      noUnnecessaryAbsence: 0,
      mastersyTasks: 0,
      maintainsCleanliness: 0
    },
    
    // Section B - Commitment & Dedication (1-5 scale)
    sectionB: {
      improvementInterest: 0,
      performanceInterest: 0,
      workEthic: 0,
      initiative: 0,
      efficiency: 0
    },
    
    // Section C - Interpersonal Skills (1-5 scale)
    sectionC: {
      teamwork: 0,
      tact: 0,
      courtesy: 0,
      disposition: 0
    },
    
    // Open text fields
    strengths: '',
    improvements: '',
    
    // Recommendation
    recommendForRenewal: true,
    scholarshipPercentage: undefined,
    
    // Footer
    ratedBy: '',
    ratedDate: '',
    discussionDate: '',
    scholarSignatureDate: ''
  });

  // Engagement requests — loaded from API
  const [engagementRequests, setEngagementRequests] = useState<EngagementRequest[]>([]);

  // Assignment forms
  const [uniformForm, setUniformForm] = useState({
    serialNumber: '',
    uniformName: '',
    condition: 'good' as 'good' | 'bad',
    propertyType: 'unc-property' as 'unc-property' | 'own-property',
    assignedTo: '',
    // Majorettes sizes
    headpieceSize: '',
    dressSize: '',
    shoesSize: '',
    // Marching Band sizes
    headdressSize: '',
    topSize: '',
    pantsSize: '',
    bandShoesSize: '',
    // Glee Club specific
    barongType: ''
  });

  const [instrumentForm, setInstrumentForm] = useState({
    serialNumber: '',
    instrumentName: '',
    instrumentType: '',
    condition: 'good' as 'good' | 'bad',
    propertyType: 'unc-property' as 'unc-property' | 'own-property',
    assignedTo: ''
  });

  const [accessoryForm, setAccessoryForm] = useState({
    accessoryName: '',
    accessoryType: '',
    quantity: 1,
    description: ''
  });

  const [eventRequestForm, setEventRequestForm] = useState({
    eventName: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    attachment: ''
  });

  // Scholar assignments and inventory
  const [scholarAssignments, setScholarAssignments] = useState<{[scholarId: string]: {
    uniforms: Array<{item: string; size: string; assignedDate: Date}>;
    instruments: Array<{name: string; serialNumber: string; condition: string; assignedDate: Date}>;
    accessories: Array<{name: string; quantity: number; assignedDate: Date}>;
    status: 'active' | 'inactive';
  }}>({});

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [scholarSearchTerm, setScholarSearchTerm] = useState('');
  const [traineeSearchTerm, setTraineeSearchTerm] = useState('');

  // Inventory filters
  const [uniformFilters, setUniformFilters] = useState({
    condition: 'all',
    status: 'all',
    uniformSet: 'all'
  });
  const [instrumentFilters, setInstrumentFilters] = useState({
    condition: 'all',
    propertyType: 'all',
    status: 'all',
    instrumentType: 'all'
  });
  const [accessoryFilters, setAccessoryFilters] = useState({
    accessoryType: 'all'
  });

  // Trainee API state
  const [traineesList, setTraineesList] = useState<any[]>([]);

  const refetchEngagementRequests = async () => {
    try {
      const [engagements, rehearsals] = await Promise.all([
        engagementService.getEngagements(),
        engagementService.getRehearsals(),
      ]);
      const combined = [...engagements, ...rehearsals];

      setEngagementRequests(combined.map((e: any) => {
        const backendStatus = String(e.status || 'scheduled');
        const status: EngagementRequest['status'] =
          backendStatus === 'pending_admin_approval' || backendStatus === 'pending_director_approval'
            ? 'pending'
            : backendStatus === 'scheduled'
            ? 'accepted'
            : backendStatus === 'rejected'
            ? 'rejected'
            : (backendStatus as EngagementRequest['status']);

        return {
          id: String(e.id),
          eventName: e.event_name ?? e.title ?? '',
          date: new Date(e.date),
          time: e.time ?? '',
          venue: e.venue ?? '',
          description: e.description ?? '',
          type: e.type ?? 'performance',
          status,
          attachment: Array.isArray(e.attachments) && e.attachments.length > 0
            ? (typeof e.attachments[0] === 'string' ? e.attachments[0] : e.attachments[0]?.name)
            : undefined,
        };
      }));
    } catch {
      // Non-blocking for dashboard load
    }
  };

  const refetchLatestUpdates = async () => {
    try {
      const rows = await announcementService.getAnnouncements();
      setLatestUpdates(rows.map((a: any) => ({
        id: String(a.id),
        category: a.category,
        date: String(a.date).slice(0, 10),
        icon: a.icon || 'trophy',
        title: a.title,
        description: a.description,
        talentGroup: getTalentGroupName(a.talent_group || directorTalentGroup || ''),
        createdBy: a.creator?.name || user.name,
        createdAt: a.created_at ? new Date(a.created_at) : new Date(),
      })));
    } catch {
      // Non-blocking for dashboard load
    }
  };
  const [traineesLoading, setTraineesLoading] = useState(true);
  // Scholars fetched directly from API (self-sufficient — not relying on App.tsx users prop timing)
  const [fetchedScholars, setFetchedScholars] = useState<UserType[]>([]);
  const [scholarsLoading, setScholarsLoading] = useState(true);

  const normalizeAttendanceStatus = (value: any): 'present' | 'absent' | 'excused' => {
    if (value === 'present' || value === true) return 'present';
    if (value === 'excused') return 'excused';
    return 'absent';
  };

  const loadScholarPerformanceContext = async (scholar: UserType) => {
    setLoadingPerformanceData(true);

    const scholarId = String(scholar.id || '');
    const latestLocalEvaluation = [...evaluations]
      .filter((evaluation) => String(evaluation.traineeId) === scholarId)
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      })[0];

    const localScholarship = Number(latestLocalEvaluation?.scholarshipPercentage);
    const rawScholarship = Number((scholar as any).scholarshipPercentage ?? (scholar as any).scholarship_percentage);
    const fallbackScholarship = Number.isFinite(localScholarship)
      ? localScholarship
      : Number.isFinite(rawScholarship)
      ? rawScholarship
      : 0;
    setSelectedScholarCurrentScholarship(fallbackScholarship);

    try {
      // Attendance in scholar review comes only from engagement module records:
      // rehearsals + engagements, not training attendance sessions.
      const rehearsalTrackedSessions = engagementRequests.filter((engagement) =>
        engagement.type === 'rehearsal' &&
        Boolean(engagement.attendanceRecords?.some((record) => record.attendees?.[scholarId] !== undefined))
      );

      const rehearsalPresentCount = rehearsalTrackedSessions.filter((engagement) =>
        Boolean(engagement.attendanceRecords?.some((record) =>
          normalizeAttendanceStatus(record.attendees?.[scholarId]) === 'present'
        ))
      ).length;

      const engagementTrackedSessions = engagementRequests.filter((engagement) =>
        engagement.type !== 'rehearsal' &&
        Boolean(engagement.attendanceRecords?.some((record) => record.attendees?.[scholarId] !== undefined))
      );

      const engagementPresentCount = engagementTrackedSessions.filter((engagement) =>
        Boolean(engagement.attendanceRecords?.some((record) =>
          normalizeAttendanceStatus(record.attendees?.[scholarId]) === 'present'
        ))
      ).length;

      const totalSessions = rehearsalTrackedSessions.length + engagementTrackedSessions.length;
      const presentCount = rehearsalPresentCount + engagementPresentCount;
      const absentCount = Math.max(0, totalSessions - presentCount);
      const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 1000) / 10 : 0;

      setSelectedScholarAttendanceStats({
        totalSessions,
        presentCount,
        absentCount,
        attendanceRate,
      });

      // Evaluation documents from member-submitted scholarship renewal records.
      const renewalsResponse = await api.get<any>('scholarship/renewals', {
        params: { user_id: Number(scholar.id) },
      });

      const renewals = Array.isArray(renewalsResponse.data?.data) ? renewalsResponse.data.data : [];
      const renewalDocs = renewals.flatMap((renewal: any) => {
        const docs = Array.isArray(renewal?.documents) ? renewal.documents : [];
        return docs.map((docName: string, index: number) => ({
          id: `renewal-${renewal.id}-${index}`,
          name: String(docName),
          uploadedDate: renewal.created_at,
          source: `${renewal.semester || 'Semester'} ${renewal.year || ''}`.trim(),
        }));
      });

      setSelectedScholarRenewalDocs(renewalDocs);

      // Current scholarship should come from the latest final evaluation when available.
      const backendTrainee = traineesList.find(
        (t: any) => String(t?.user_id) === scholarId || String(t?.id) === scholarId
      );

      let scholarshipRows: any[] = [];
      if (backendTrainee?.id) {
        scholarshipRows = await trainingClient.getEvaluations({ trainee_id: Number(backendTrainee.id) });
      } else {
        const allEvaluations = await trainingClient.getEvaluations();
        scholarshipRows = allEvaluations.filter((row: any) => {
          const relatedUserId = row?.trainee?.user_id ?? row?.trainee?.userId ?? row?.user_id;
          return String(relatedUserId || '') === scholarId;
        });
      }

      if (scholarshipRows.length > 0) {
        const latestEvaluation = [...scholarshipRows]
          .sort((a: any, b: any) => {
            const dateA = new Date(a?.evaluation_date || a?.evaluationDate || a?.created_at || 0).getTime();
            const dateB = new Date(b?.evaluation_date || b?.evaluationDate || b?.created_at || 0).getTime();
            if (dateA !== dateB) return dateB - dateA;
            return Number(b?.id || 0) - Number(a?.id || 0);
          })[0];

        const latestScholarship = Number(
          latestEvaluation?.scholarshipPercentage ?? latestEvaluation?.scholarship_percentage
        );

        if (Number.isFinite(latestScholarship)) {
          setSelectedScholarCurrentScholarship(latestScholarship);
        }
      }
    } catch (err: any) {
      console.error('Failed to load scholar performance context:', err?.response?.status, err?.message);
      setSelectedScholarAttendanceStats({
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        attendanceRate: 0,
      });
      setSelectedScholarRenewalDocs([]);
      setSelectedScholarCurrentScholarship(fallbackScholarship);
    } finally {
      setLoadingPerformanceData(false);
    }
  };

  useEffect(() => {
    if (showPerformanceDialog && selectedScholarForPerformance) {
      void loadScholarPerformanceContext(selectedScholarForPerformance);
    }
  }, [showPerformanceDialog, selectedScholarForPerformance, trainingAttendance, engagementRequests]);

  const resolveAttendanceTraineeId = (traineeKey: string | number, sourceList?: any[]): number | null => {
    const list = sourceList || traineesList;
    const matched = list.find((t: any) => String(t?.id) === String(traineeKey) || String(t?.user_id) === String(traineeKey));
    if (!matched) return null;
    const id = Number(matched.id);
    return Number.isFinite(id) ? id : null;
  };

  const loadTrainingAttendanceFromBackend = async () => {
    try {
      const rows = await trainingClient.getAttendance();
      const grouped: Record<string, AttendanceRecord> = {};

      rows.forEach((row: any) => {
        // apiClient transforms all keys to camelCase; support both forms for safety
        const rawDate = row.sessionDate || row.session_date || '';
        const dateKey = String(rawDate).slice(0, 10);
        if (!dateKey) return;

        const noPractice = Boolean(row.noPractice ?? row.no_practice);
        const traineeId  = row.traineeId   ?? row.trainee_id;

        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateKey,
            attendees: {},
            noPractice,
          };
        }

        grouped[dateKey].noPractice = Boolean(grouped[dateKey].noPractice || noPractice);
        if (traineeId != null) {
          grouped[dateKey].attendees[String(traineeId)] = normalizeAttendanceStatus(row.status);
        }
      });

      const mapped = Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTrainingAttendance(mapped);
    } catch (err: any) {
      console.error('Failed to load attendance from backend:', err);
      toast.error(err.message || 'Failed to load attendance records');
    }
  };

  const syncAttendanceSessionToBackend = async (
    sessionDate: string,
    attendees: Record<string, any>,
    noPractice = false
  ) => {
    const records = Object.entries(attendees)
      .map(([traineeKey, status]) => {
        const backendTraineeId = resolveAttendanceTraineeId(traineeKey);
        if (!backendTraineeId) return null;
        return {
          trainee_id: backendTraineeId,
          status: normalizeAttendanceStatus(status),
        };
      })
      .filter(Boolean) as Array<{ trainee_id: number; status: 'present' | 'absent' | 'excused' }>;

    if (records.length === 0) return;

    await trainingClient.upsertAttendanceSession({
      session_date: sessionDate,
      no_practice: noPractice,
      records,
    });
  };

  // Function to fetch trainees from API
  const refetchTrainees = async () => {
    try {
      setTraineesLoading(true);
      const traineeData = await trainingClient.getTrainees();
      setTraineesList(traineeData);
      console.log('Fetched trainees:', traineeData);
      
      // IMPORTANT: Populate traineeInstruments and traineeChapters with API data
      const newInstruments: {[key: string]: string} = {};
      const newVoices: {[key: string]: string} = {};
      const newChapters: {[key: string]: {[chapter: number]: boolean}} = {};
      
      traineeData.forEach((trainee: any) => {
        const traineeId = trainee.user_id || trainee.id;
        
        // Map instrument or voice based on trainee type
        if (trainee.instrument) {
          newInstruments[traineeId] = trainee.instrument;
        }
        if (trainee.voice) {
          newVoices[traineeId] = trainee.voice;
        }
        
        // Load chapters from API or derive from completion_rate
        if (trainee.chapters_completed) {
          const chaptersData = typeof trainee.chapters_completed === 'string'
            ? JSON.parse(trainee.chapters_completed)
            : trainee.chapters_completed;
          const chapterMap: {[chapter: number]: boolean} = {};
          for (let i = 1; i <= 30; i++) {
            chapterMap[i] = Boolean(chaptersData[i] || chaptersData[String(i)]);
          }
          newChapters[traineeId] = chapterMap;
        } else if (trainee.completion_rate === 100) {
          // All chapters done if completion rate is 100%
          const allDone: {[chapter: number]: boolean} = {};
          for (let i = 1; i <= 30; i++) allDone[i] = true;
          newChapters[traineeId] = allDone;
        } else {
          newChapters[traineeId] = {
            1: false, 2: false, 3: false, 4: false, 5: false,
            6: false, 7: false, 8: false, 9: false, 10: false,
            11: false, 12: false, 13: false, 14: false, 15: false,
            16: false, 17: false, 18: false, 19: false, 20: false,
            21: false, 22: false, 23: false, 24: false, 25: false,
            26: false, 27: false, 28: false, 29: false, 30: false
          };
        }
      });
      
      setTraineeInstruments(newInstruments);
      setTraineeVoices(newVoices);
      setTraineeChapters(newChapters);
      await loadTrainingAttendanceFromBackend();
      
    } catch (err: any) {
      console.error('Failed to fetch trainees:', err);
      toast.error(err.message || 'Failed to load trainees');
    } finally {
      setTraineesLoading(false);
    }
  };

  // Fetch applications from API for this director's talent group
  const refetchApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await applicationClient.getApplications({
        talent_group: user?.talentGroup,
      });
      setFetchedApplications(response.data || []);
      console.log('[DirectorDashboardEnhanced] Fetched applications:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      toast.error(err.message || 'Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadScholarProfileContext = async (scholar: UserType) => {
    const scholarId = String(scholar.id || '');
    if (!scholarId) return;

    // Reuse cached application data if we already fetched profile context.
    if (scholarProfileApplicationsByUserId[scholarId]) return;

    setSelectedScholarProfileLoading(true);
    try {
      const response = await applicationClient.getApplications({
        talent_group: user?.talentGroup,
        search: scholar.name,
      });

      const rows = Array.isArray(response.data) ? response.data : [];
      const match = rows.find((row) => String(row.user_id || '') === scholarId)
        || rows.find((row) => String(row.applicant_student_id || '') === String(scholar.studentId || ''));

      if (match) {
        setScholarProfileApplicationsByUserId((prev) => ({
          ...prev,
          [scholarId]: match,
        }));
      }
    } catch (err: any) {
      console.error('Failed to load scholar profile context:', err?.response?.status, err?.message);
    } finally {
      setSelectedScholarProfileLoading(false);
    }
  };

  // Fetch trainees from API on component mount
  useEffect(() => {
    refetchTrainees();
    refetchApplications();
    // Fetch scholars directly — guarantees Members tab has data regardless of App.tsx prop timing
    console.log('[DirectorDashboard] Fetching scholars');
    const scholarParams = user?.talentGroup ? { talent_group: user.talentGroup } : {};
    api.get<any[]>('users', { params: scholarParams }).then(r => {
      console.log('[DirectorDashboard] scholars response:', r.status, 'count:', Array.isArray(r.data) ? r.data.length : r.data, r.data?.[0]);
      const raw: any[] = Array.isArray(r.data) ? r.data : [];
      const mapped: UserType[] = raw.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role as UserType['role'],
        studentId: u.student_id ?? undefined,
        phone: u.phone ?? undefined,
        talentGroup: u.talent_group ?? undefined,
        scholarshipPercentage: u.scholarship_percentage ?? u.scholarshipPercentage ?? undefined,
        yearLevel: u.year_level ?? undefined,
        course: u.course ?? undefined,
        department: u.department ?? undefined,
        address: u.address ?? undefined,
        createdAt: u.created_at ?? undefined,
        assignedInstrument: u.trainee?.instrument ?? undefined,
        assignedVoice: u.trainee?.voice ?? undefined,
      }));
      console.log('[DirectorDashboard] mapped scholars:', mapped.length, mapped[0]);
      setFetchedScholars(mapped);
    }).catch(err => {
      console.error('[DirectorDashboard] Failed to fetch scholars:', err?.response?.status, err?.message);
    }).finally(() => setScholarsLoading(false));
    console.log('[DirectorDashboardEnhanced] Fetching trainees and applications on mount...');
    void refetchEngagementRequests();
    void refetchLatestUpdates();
  }, [user?.talentGroup]);

  useEffect(() => {
    if (showScholarDialog && selectedScholar) {
      void loadScholarProfileContext(selectedScholar);
    }
  }, [showScholarDialog, selectedScholar]);

  // Talent group flags for conditional rendering (must be defined before inventory data)
  const directorTalentGroup = user.talentGroup || '';

  useEffect(() => {
    console.log(`%c[Director] scholars updated: total=${fetchedScholars?.length}, filtered=${fetchedScholars?.filter(u=>u.role==='scholar'&&u.talentGroup===directorTalentGroup).length}, directorGroup="${directorTalentGroup}", user.talentGroup="${user?.talentGroup}"`, 'color:#1E7A3E;font-weight:bold');
  }, [fetchedScholars, directorTalentGroup]);

  const isMarchingBand = directorTalentGroup === 'marching-band';
  const isMajorettes = directorTalentGroup === 'majorettes';
  const isGleeClub = directorTalentGroup === 'glee-club';
  const isDanceClub = directorTalentGroup === 'dance-club';

  // Sample inventory data - Uniform Sets (All UNC-owned) - CONVERTED TO STATE FOR PERSISTENCE
  const uniformsData = inventoryItems.filter(item => item.type === 'uniform');
  const instrumentsData = inventoryItems.filter(item => item.type === 'instrument');
  const accessoriesData = inventoryItems.filter(item => item.type === 'accessory');

  // Apply filters to inventory data
  const filteredUniforms = uniformsData.filter(item => {
    if (uniformFilters.condition !== 'all' && item.condition !== uniformFilters.condition) return false;
    if (uniformFilters.status !== 'all' && item.status !== uniformFilters.status) return false;
    if (uniformFilters.uniformSet !== 'all' && item.uniformSet !== uniformFilters.uniformSet) return false;
    return true;
  });

  const filteredInstruments = instrumentsData.filter(item => {
    if (instrumentFilters.condition !== 'all' && item.condition !== instrumentFilters.condition) return false;
    if (instrumentFilters.propertyType !== 'all' && item.propertyType !== instrumentFilters.propertyType) return false;
    if (instrumentFilters.status !== 'all' && item.status !== instrumentFilters.status) return false;
    if (instrumentFilters.instrumentType !== 'all' && item.instrumentType !== instrumentFilters.instrumentType) return false;
    return true;
  });

  const filteredAccessories = accessoriesData.filter(item => {
    if (accessoryFilters.accessoryType !== 'all' && item.accessoryType !== accessoryFilters.accessoryType) return false;
    return true;
  });

  // Get unique types for filter dropdowns
  const uniformSets = ['all', ...Array.from(new Set(uniformsData.map(item => item.uniformSet)))];
  const instrumentTypes = ['all', ...Array.from(new Set(instrumentsData.map(item => item.instrumentType)))];
  const accessoryTypes = ['all', ...Array.from(new Set(accessoriesData.map(item => item.accessoryType)))];

  // Filter applications for this director's talent group
  const filteredApplications = (fetchedApplications || []).filter(app => 
    app.status === 'pending'
  );

  const pendingApps = filteredApplications.length;
  // activeTrainees is derived from traineesList (fetched via trainingClient) — not from users
  const activeTrainees = traineesList.filter((t: any) =>
    (t.current_status === 'active' || t.current_status === 'in_progress')
  ).length;
  const totalScholars = fetchedScholars.filter(u => u.role === 'scholar').length;

  // Calculate additional recruitment stats
  const scheduledInterviews = interviewSchedules.filter(i => i.status === 'scheduled').length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const applicationsThisWeek = (applications || []).filter(app => 
    app.talentGroup === directorTalentGroup && 
    new Date(app.appliedAt) >= oneWeekAgo
  ).length;

  // Use API-fetched traineesList (from trainingClient) as the sole source for trainees
  const allTrainees = traineesList.map((trainee: any) => ({
        // UserType fields
        id: trainee.user_id || trainee.id,
        name: trainee.user?.name || trainee.name || '',
        email: trainee.user?.email || trainee.email || '',
        role: 'student' as const,
        studentId: trainee.user?.student_id || trainee.student_id || '',
        phone: trainee.user?.phone || trainee.phone || '',
      gender: trainee.user?.gender || trainee.gender || '',
      age: trainee.user?.age || trainee.age || '',
      birthdate: trainee.user?.birthdate || trainee.user?.date_of_birth || trainee.birthdate || trainee.date_of_birth || '',
        yearLevel: trainee.user?.year_level || trainee.year_level || '',
        course: trainee.user?.course || trainee.course || '',
        department: trainee.user?.department || trainee.department || '',
        address: trainee.user?.address || trainee.address || '',
      emergencyContact: trainee.user?.emergency_contact || trainee.user?.guardian_name || trainee.emergency_contact || trainee.guardian_name || '',
      emergencyPhone: trainee.user?.emergency_phone || trainee.user?.guardian_phone || trainee.emergency_phone || trainee.guardian_phone || '',
      emergencyContactRelationship: trainee.user?.guardian_relationship || trainee.guardian_relationship || '',
      guardianName: trainee.user?.guardian_name || trainee.guardian_name || '',
      guardianContact: trainee.user?.guardian_phone || trainee.guardian_phone || '',
        applicationStatus: (trainee.user?.application_status || 'approved') as any,
        trainingStatus: trainee.current_status === 'active' ? 'in_progress' : trainee.current_status,
        talentGroup: trainee.user?.talent_group || trainee.talent_group || directorTalentGroup,
        assignedInstrument: trainee.instrument,
        assignedVoice: trainee.voice,
        dateJoined: trainee.date_joined || trainee.dateJoined,
        // Backend trainee properties (extending UserType)
        completionRate: trainee.completion_rate || 0,
        currentStatus: trainee.current_status || 'inactive',
        instrument: trainee.instrument || '',
        voice: trainee.voice || '',
        deactivationNote: trainee.deactivation_note || '',
        chapter: trainee.chapter || '',
        totalExpectedSessions: trainee.total_expected_sessions || 0,
        // Store full trainee object for reference
        _rawTrainee: trainee,
      } as any));
  
  // Keep active and in-progress trainees in the roster so assignments can be made.
  const trainees = allTrainees.filter((t: any) => {
    const status = String(t.currentStatus || '').toLowerCase();
    return status === 'active' || status === 'inactive' || status === 'in_progress' || status === 'in-progress' || status === 'in training' || status === 'in_training';
  });
  const droppedTrainees = allTrainees.filter((t: any) => String(t.currentStatus || '').toLowerCase() === 'dropped');
  
  // Training stats calculations — use traineesList from trainingClient, not users prop
  const completedTrainees = traineesList.filter((t: any) =>
    t.current_status === 'completed' || t.current_status === 'qualified'
  ).length;
  
  const totalTrainedCount = trainees.length + completedTrainees;
  const trainingCompletionRate = totalTrainedCount > 0 
    ? Math.round((completedTrainees / totalTrainedCount) * 100) 
    : 0;

  // Debug logging
  useEffect(() => {
    console.log('[DirectorDashboardEnhanced] Trainees updated:', {
      traineeCount: trainees.length,
      traineesData: trainees,
      instrumentsMap: traineeInstruments,
      chaptersMap: traineeChapters,
      voicesMap: traineeVoices,
      traineesList: traineesList
    });
  }, [trainees, traineeInstruments, traineeChapters, traineeVoices, traineesList]);

  const getTraineeAttendanceKeys = (traineeId: string | number): string[] => {
    const rawKey = String(traineeId);
    const resolvedId = resolveAttendanceTraineeId(rawKey);
    if (resolvedId == null) return [rawKey];

    const resolvedKey = String(resolvedId);
    return resolvedKey === rawKey ? [resolvedKey] : [resolvedKey, rawKey];
  };

  const calculateTraineeAttendanceStats = (traineeId: string | number) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const practiceDays = trainingAttendance.filter((record) => {
      if (record.noPractice) return false;

      const rawDate = String(record.date || '').trim();
      if (!rawDate) return false;

      const parsedDate = new Date(rawDate.includes('T') ? rawDate : `${rawDate}T00:00:00`);
      if (Number.isNaN(parsedDate.getTime())) return false;

      // Count only sessions that already happened (past or today).
      return parsedDate.getTime() <= today.getTime();
    });
    if (practiceDays.length === 0) {
      return { totalSessions: 0, presentCount: 0, absentCount: 0, excusedCount: 0, attendanceRate: 0 };
    }

    const keys = getTraineeAttendanceKeys(traineeId);
    let presentCount = 0;
    let excusedCount = 0;

    practiceDays.forEach((record) => {
      const rawStatus = keys
        .map((key) => record.attendees?.[key])
        .find((value) => value !== undefined);
      const status = normalizeAttendanceStatus(rawStatus);
      if (status === 'present') presentCount++;
      if (status === 'excused') excusedCount++;
    });

    const totalSessions = practiceDays.length;
    const effectiveSessions = totalSessions - excusedCount;
    const absentCount = Math.max(0, effectiveSessions - presentCount);
    const attendanceRate = effectiveSessions > 0 ? Math.round((presentCount / effectiveSessions) * 100) : 0;

    return { totalSessions, presentCount, absentCount, excusedCount, attendanceRate };
  };

  // Calculate individual trainee attendance rate
  const calculateTraineeAttendanceRate = (traineeId: string) => {
    return calculateTraineeAttendanceStats(traineeId).attendanceRate;
  };

  // Calculate average attendance rate across all trainees
  const calculateAttendanceRate = () => {
    if (trainingAttendance.length === 0 || trainees.length === 0) return 0;
    
    const rates = trainees.map(trainee => calculateTraineeAttendanceRate(trainee.id!));
    const sum = rates.reduce((acc, rate) => acc + rate, 0);
    
    return rates.length > 0 ? Math.round(sum / rates.length) : 0;
  };
  
  const avgAttendanceRate = calculateAttendanceRate();

  const handleReactivateTrainee = async (trainee: any) => {
    const backendTraineeId = resolveBackendTraineeId(String(trainee?.id || ''));
    if (!backendTraineeId) {
      toast.error('Unable to resolve trainee record. Please refresh and try again.');
      return;
    }

    try {
      await trainingClient.updateTrainee(backendTraineeId, { current_status: 'active' } as any);
      await refetchTrainees();
      toast.success(`${trainee.name} has been reactivated`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reactivate trainee');
    }
  };
  
  const scholars = fetchedScholars
    .filter(u => u.role === 'scholar')
    .filter(u => {
      if (statusFilter === 'all') return true;
      const scholarStatus = scholarAssignments[u.id!]?.status || 'active';
      return scholarStatus === statusFilter;
    })
    .filter(u => {
      // Search filter - automatically detects name or student ID
      if (!scholarSearchTerm.trim()) return true;
      const searchLower = scholarSearchTerm.toLowerCase().trim();
      const nameMatch = u.name.toLowerCase().includes(searchLower);
      const idMatch = u.studentId?.toLowerCase().includes(searchLower);
      return nameMatch || idMatch;
    })
    .sort((a, b) => {
      // Sort by status: active first, then inactive
      const statusA = scholarAssignments[a.id!]?.status || 'active';
      const statusB = scholarAssignments[b.id!]?.status || 'active';
      if (statusA === 'active' && statusB === 'inactive') return -1;
      if (statusA === 'inactive' && statusB === 'active') return 1;
      return 0;
    });

  // Scholar stats
  const allScholars = fetchedScholars.filter(u => u.role === 'scholar');
  
  const activeScholars = allScholars.filter(s => {
    const status = scholarAssignments[s.id!]?.status || 'active';
    return status === 'active';
  }).length;

  const selectedScholarId = String(selectedScholar?.id || '');
  const selectedScholarApplication = selectedScholarId
    ? scholarProfileApplicationsByUserId[selectedScholarId]
      || fetchedApplications.find((row) => String(row.user_id || '') === selectedScholarId)
    : undefined;
  const selectedScholarBirthdate = selectedScholar?.dateOfBirth
    || selectedScholar?.birthdate
    || selectedScholarApplication?.applicant_birthdate
    || '';
  const selectedScholarAge = selectedScholar?.age
    || selectedScholarApplication?.applicant_age
    || '';
  const selectedScholarTalentGroup = selectedScholar?.talentGroup
    || selectedScholarApplication?.talent_group
    || '';
  const selectedScholarScholarship = (() => {
    const direct = Number(selectedScholar?.scholarshipPercentage);
    if (Number.isFinite(direct)) return direct;

    const latestEval = [...evaluations]
      .filter((e) => String(e.traineeId) === selectedScholarId)
      .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())[0];
    const fromEval = Number(latestEval?.scholarshipPercentage);
    return Number.isFinite(fromEval) ? fromEval : 0;
  })();
  
  const evaluatedScholars = allScholars.filter(s => 
    evaluations.some(e => e.traineeId === s.id && e.rating >= 75)
  );
  const renewalRate = allScholars.length > 0 
    ? Math.round((evaluatedScholars.length / allScholars.length) * 100) 
    : 0;

  // Engagement stats
  const pendingEngagements = engagementRequests.filter(e => e.status === 'pending');
  const acceptedEngagements = engagementRequests.filter(e => e.status === 'accepted');
  
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const upcomingEvents = acceptedEngagements.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= today && eventDate <= thirtyDaysLater;
  }).length;

  // Get chapter title for training modules
  const getChapterTitle = (chapterNum: number): string => {
    // Majorette-specific routine titles
    if (isMajorettes) {
      const majoretteRoutines = [
        'Basic Baton Grip & Handling', 'Body Alignment & Posture', 'Basic Twirls',
        'Figure Eight Patterns', 'Horizontal Spins', 'Vertical Tosses',
        'Single Toss Techniques', 'Double Toss Techniques', 'Triple Toss Techniques',
        'Cartwheel & Aerial Techniques', 'Illusion Tricks', 'Behind-the-Back Catches',
        'One-Hand Twirls', 'Two-Baton Coordination', 'Floor Work & Splits',
        'Dance Integration', 'Formation Transitions', 'Synchronized Routines',
        'Performance Expression', 'Stage Presence & Showmanship', 'Precision Timing',
        'Team Coordination', 'Solo Performance Skills', 'Flag Work Integration',
        'Costume & Equipment Care', 'Competition Routines', 'Show Design',
        'Leadership & Mentoring', 'Final Performance Review', 'Scholarship Evaluation'
      ];
      return majoretteRoutines[chapterNum - 1] || `Routine ${chapterNum}`;
    }
    
    // Dance Club-specific routine titles
    if (isDanceClub) {
      const danceRoutines = [
        'Basic Dance Positions & Posture', 'Body Alignment & Balance', 'Basic Steps & Footwork',
        'Rhythm & Musicality', 'Isolation Techniques', 'Coordination Drills',
        'Hip-Hop Foundations', 'Contemporary Techniques', 'Jazz Dance Basics',
        'Ballet Fundamentals', 'Modern Dance Elements', 'Flexibility & Stretching',
        'Turns & Pivots', 'Jumps & Leaps', 'Floor Work',
        'Partnering Basics', 'Formation Transitions', 'Synchronized Choreography',
        'Performance Expression', 'Stage Presence & Confidence', 'Precision Timing',
        'Team Coordination', 'Solo Performance Skills', 'Improvisation Techniques',
        'Costume & Appearance', 'Competition Choreography', 'Show Design',
        'Leadership & Mentoring', 'Final Performance Review', 'Scholarship Evaluation'
      ];
      return danceRoutines[chapterNum - 1] || `Routine ${chapterNum}`;
    }
    
    // Glee Club-specific routine titles
    if (isGleeClub) {
      const gleeRoutines = [
        'Vocal Warm-Up & Breathing', 'Posture & Vocal Health', 'Pitch & Intonation',
        'Sight-Reading Basics', 'Rhythmic Patterns', 'Dynamics & Expression',
        'Diction & Articulation', 'Vowel Shapes & Clarity', 'Blend & Balance',
        'Part Singing - Soprano', 'Part Singing - Alto', 'Part Singing - Tenor',
        'Part Singing - Bass', 'Harmony & Counterpoint', 'Choral Arrangements',
        'A Cappella Techniques', 'Vocal Runs & Riffs', 'Pop & Contemporary Styles',
        'Classical Repertoire', 'Gospel & Spiritual Songs', 'Musical Theater',
        'Stage Movement & Choreography', 'Microphone Technique', 'Performance Confidence',
        'Ensemble Cohesion', 'Solo Performance Skills', 'Competition Repertoire',
        'Concert Programming', 'Recording Techniques', 'Final Performance Review'
      ];
      return gleeRoutines[chapterNum - 1] || `Routine ${chapterNum}`;
    }
    
    // Marching Band modules
    const titles = [
      'Introduction to Basics', 'Posture and Breath Control', 'Tone Production',
      'Articulation Techniques', 'Rhythm and Timing', 'Scale Mastery',
      'Interval Training', 'Dynamic Control', 'Phrasing and Expression',
      'Sight Reading Basics', 'Ear Training', 'Music Theory Fundamentals',
      'Advanced Techniques', 'Performance Preparation', 'Stage Presence',
      'Ensemble Playing', 'Sectional Rehearsal', 'Marching Fundamentals',
      'Drill Formations', 'Precision and Timing', 'Musical Interpretation',
      'Solo Performance', 'Leadership Skills', 'Mentoring Techniques',
      'Equipment Care', 'Performance Anxiety Management', 'Competition Preparation',
      'Show Design Concepts', 'Final Performance Review', 'Scholarship Evaluation'
    ];
    return titles[chapterNum - 1] || `Module ${chapterNum}`;
  };

  // Get interview invitation email template
  const getInterviewInvitationTemplate = (applicantName: string, talentGroup: string, interviewDate: string, interviewTime: string, venue: string, notes: string) => {
    const groupName = getTalentGroupName(talentGroup);
    
    return {
      subject: `Interview Invitation – ${groupName} Application`,
      body: `Dear ${applicantName},

Thank you for your interest in joining the ${groupName}!

We would like to invite you to an interview as part of our selection process.

📅 Interview Date: ${interviewDate}
⏰ Time: ${interviewTime}
📍 Venue: ${venue}

${notes ? `📝 Additional Notes:\n${notes}\n\n` : ''}Please arrive at least 15 minutes early and bring any required materials or instruments (if applicable).

We look forward to meeting you and seeing your talents in action.
For any questions or schedule concerns, feel free to reply to this email.

Best regards,
${user.name}
${groupName} Director
University of Nueva Caceres`
    };
  };

  // Get approval email template (after interview)
  const getApprovalEmailTemplate = (applicantName: string, talentGroup: string) => {
    const groupName = getTalentGroupName(talentGroup);
    
    return {
      subject: `Congratulations! You Have Been Accepted to ${groupName}`,
      body: `Dear ${applicantName},

We are thrilled to inform you that you have been accepted to join the ${groupName}! 🎉

Congratulations on successfully completing the interview process. Your passion, skills, and dedication have truly impressed us.

Next Steps:
1. You will receive your scholarship account credentials via email within 24-48 hours
2. Once you receive your credentials, you can log in to access the Training Dashboard
3. You will begin your training program to become a full scholarship grantee

We are excited to have you as part of our team and look forward to working with you!

Warm regards,
${user.name}
${groupName} Director
University of Nueva Caceres`
    };
  };

  // Get rejection email template
  const getRejectionEmailTemplate = (applicantName: string, talentGroup: string) => {
    const groupName = getTalentGroupName(talentGroup);
    
    return {
      subject: `Update on Your Application – ${groupName}`,
      body: `Dear ${applicantName},

Thank you for your interest in joining the ${groupName}.
After careful consideration, we regret to inform you that you have not been selected to proceed at this time.

We truly appreciate the effort and enthusiasm you showed during the application process. Please don't be discouraged — you are welcome to apply again in future recruitment periods.

We wish you all the best in your future endeavors and hope to see you continue sharing your passion for music and performance.

Sincerely,
${user.name}
${groupName} Director
University of Nueva Caceres`
    };
  };

  // Generate Google Calendar link
  const generateGoogleCalendarLink = (interview: InterviewSchedule): string => {
    if (!interview.date || !interview.time) {
      toast.error('Invalid interview date or time');
      return '#';
    }

    const startDate = new Date(`${interview.date}T${interview.time}`);
    
    if (isNaN(startDate.getTime())) {
      toast.error('Invalid interview date format');
      return '#';
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Interview: ${interview.applicantName}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Interview for ${getTalentGroupName(directorTalentGroup)} application.\\n\\nApplicant: ${interview.applicantName}\\nEmail: ${interview.applicantEmail}\\n\\nNotes: ${interview.notes || 'No additional notes'}`,
      location: interview.venue,
      add: interview.applicantEmail
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Handle set schedule (from pending applications)
  const handleSetSchedule = (app: Application) => {
    setSelectedApplication(app);
    setShowInterviewDialog(true);
  };

  // Schedule interview and send invitation email
  const handleScheduleInterview = async () => {
    // Collect missing fields
    const missingFields = [];
    if (!selectedApplication) {
      toast.error('No application selected');
      return;
    }
    if (!interviewForm.date) missingFields.push('Date');
    if (!interviewForm.time) missingFields.push('Time');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Call API to schedule the interview
      const scheduled_at = `${interviewForm.date} ${interviewForm.time}`;
      const scheduledInterviewResponse = await applicationClient.scheduleInterview(selectedApplication.id, {
        scheduled_at,
        venue: interviewForm.venue,
        notes: interviewForm.notes
      });

      const backendInterviewId = String(
        scheduledInterviewResponse?.interview?.id ??
        scheduledInterviewResponse?.id ??
        selectedApplication.id
      );

      const newInterview: InterviewSchedule = {
        id: backendInterviewId,
        applicationId: selectedApplication.id,
        applicantName: selectedApplication.personalInfo.name,
        applicantEmail: selectedApplication.personalInfo.email,
        date: interviewForm.date,
        time: interviewForm.time,
        venue: interviewForm.venue,
        status: 'scheduled',
        notes: interviewForm.notes
      };

      setInterviewSchedules([...interviewSchedules, newInterview]);

      setShowInterviewDialog(false);
      
      // Refetch applications to get updated data
      await refetchApplications();
      
      // Auto-send interview invitation email
      toast.success(`✅ Interview scheduled! Invitation email sent to ${selectedApplication.personalInfo.name}`);
      
      // Reset form
      setSelectedApplication(null);
      setInterviewForm({ date: '', time: '', venue: 'Music Building Room 201', notes: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview');
    }
  };

  // Handle approve from interview schedule
  const handleApproveInterview = async (interviewId: string) => {
    const interview = interviewSchedules.find(i => i.id === interviewId);
    if (!interview) return;

    try {
      // Call API to approve the application
      await applicationClient.approveApplication(interview.applicationId);

      // Remove interview from schedule
      setInterviewSchedules(prev => prev.filter(i => i.id !== interviewId));
      
      // Refetch applications to get updated data
      await refetchApplications();
      
      toast.success(`${interview.applicantName} has been approved and moved to Training Dashboard`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve application');
    }
  };

  // Handle reject from interview schedule
  const handleRejectInterview = async (interviewId: string) => {
    const interview = interviewSchedules.find(i => i.id === interviewId);
    if (!interview) return;

    try {
      // Call API to reject the application
      await applicationClient.declineApplication(interview.applicationId, 'Not meeting requirements', '');

      // Remove interview from schedule
      setInterviewSchedules(prev => prev.filter(i => i.id !== interviewId));
      
      // Refetch applications to get updated data
      await refetchApplications();
      
      toast.success(`${interview.applicantName} has been rejected`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject application');
    }
  };

  // Mark interview as completed
  const handleMarkInterviewComplete = (interviewId: string) => {
    setInterviewSchedules(prev => prev.map(i => 
      i.id === interviewId ? { ...i, status: 'completed' as const } : i
    ));
    toast.success('Interview marked as completed');
  };

  // View application details
  const handleViewApplication = (app: Application) => {
    setSelectedApplication(app);
    setShowApplicationDialog(true);
  };

  // Check if scholar is ready for evaluation
  const isReadyForEvaluation = (_scholarId: string) => {
    // Evaluation readiness is determined by the director
    return true;
  };

  // Helper functions for new evaluation form
  const calculateSectionATotal = () => {
    const { sectionA } = evaluationForm;
    return Object.values(sectionA).reduce((sum, val) => sum + val, 0);
  };

  const calculateSectionAAverage = () => {
    const total = calculateSectionATotal();
    const count = Object.keys(evaluationForm.sectionA).length;
    return (total / count).toFixed(2);
  };

  const calculateSectionBTotal = () => {
    const { sectionB } = evaluationForm;
    return Object.values(sectionB).reduce((sum, val) => sum + val, 0);
  };

  const calculateSectionBAverage = () => {
    const total = calculateSectionBTotal();
    const count = Object.keys(evaluationForm.sectionB).length;
    return (total / count).toFixed(2);
  };

  const calculateSectionCTotal = () => {
    const { sectionC } = evaluationForm;
    return Object.values(sectionC).reduce((sum, val) => sum + val, 0);
  };

  const calculateSectionCAverage = () => {
    const total = calculateSectionCTotal();
    const count = Object.keys(evaluationForm.sectionC).length;
    return (total / count).toFixed(2);
  };

  const calculateOverallRating = () => {
    const avgA = parseFloat(calculateSectionAAverage());
    const avgB = parseFloat(calculateSectionBAverage());
    const avgC = parseFloat(calculateSectionCAverage());
    return ((avgA + avgB + avgC) / 3).toFixed(2);
  };

  const getAdjectivalRating = () => {
    const rating = parseFloat(calculateOverallRating());
    if (rating >= 4.5) return 'Outstanding';
    if (rating >= 3.5) return 'Very Satisfactory';
    if (rating >= 2.5) return 'Satisfactory';
    if (rating >= 1.5) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  // Training handlers
  const calculateWeightedScore = () => {
    // Convert 1-5 scale to percentage (multiply by 20)
    const overallRating = parseFloat(calculateOverallRating());
    return Math.round(overallRating * 20);
  };

  // Auto-assign scholarship tier based on final score
  const getAutoScholarshipTier = (score: number): number => {
    if (score >= 90) return 100; // Full Scholarship
    return 50; // Half Scholarship
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedTrainee) {
      toast.error('Please select a trainee');
      return;
    }

    const allRatings = [
      ...Object.values(evaluationForm.sectionA),
      ...Object.values(evaluationForm.sectionB),
      ...Object.values(evaluationForm.sectionC),
    ];

    if (allRatings.some((value) => Number(value) <= 0)) {
      toast.error('Please rate all criteria before submitting the final evaluation.');
      return;
    }

    try {
      const backendTraineeId = resolveBackendTraineeId(String(selectedTrainee.id));
      if (!backendTraineeId) {
        toast.error('Unable to resolve trainee record. Please refresh and try again.');
        return;
      }

      const evaluationDate = new Date().toISOString().slice(0, 10);
      const finalScore = calculateWeightedScore();
      const autoScholarshipTier = getAutoScholarshipTier(finalScore);
      const recommendation = finalScore >= 75 ? 'continue' : finalScore >= 50 ? 'probation' : 'discontinue';

      // Prepare evaluation data for backend (snake_case)
      const evaluationData = {
        trainee_id: backendTraineeId,
        rating: finalScore,
        recommendation,
        evaluation_date: evaluationDate,
        section_a: evaluationForm.sectionA,
        section_b: evaluationForm.sectionB,
        section_c: evaluationForm.sectionC,
        adjectival_rating: getAdjectivalRating(),
        scholarship_percentage: autoScholarshipTier,
        strengths: evaluationForm.strengths,
        improvements: evaluationForm.improvements,
        recommend_for_renewal: evaluationForm.recommendForRenewal,
        rating_period: evaluationForm.ratingPeriod,
        status: 'submitted'
      };

      // Save to backend
      const savedEvaluation = await trainingClient.createEvaluation(evaluationData);

      // Create frontend object for state
      const savedEvaluationId = savedEvaluation?.id;
      if (!savedEvaluationId) {
        throw new Error('Evaluation was saved but backend did not return an ID');
      }

      const newEvaluation: Evaluation = {
        id: String(savedEvaluationId),
        traineeId: selectedTrainee.id!,
        traineeName: selectedTrainee.name,
        date: new Date(),
        rating: finalScore,
        scholarshipPercentage: autoScholarshipTier,
        notes: `Strengths: ${evaluationForm.strengths}\nAreas for Improvement: ${evaluationForm.improvements}`,
        status: 'submitted',
        // Include detailed evaluation sections
        sectionA: evaluationForm.sectionA,
        sectionB: evaluationForm.sectionB,
        sectionC: evaluationForm.sectionC,
        strengths: evaluationForm.strengths,
        improvements: evaluationForm.improvements,
        recommendForRenewal: evaluationForm.recommendForRenewal,
        ratedBy: user.name,
        ratedDate: new Date().toLocaleDateString(),
        adjectivalRating: getAdjectivalRating(),
        overallRating: calculateOverallRating(),
        talentGroup: directorTalentGroup
      };

      setEvaluations([...evaluations, newEvaluation]);
    
    // Send email based on pass/fail
    const groupName = getTalentGroupName(directorTalentGroup);
    if (finalScore >= 75) {
      // Pass - send success email
      const passEmailSubject = `Congratulations! Training Evaluation Passed - ${groupName}`;
      const passEmailBody = `Dear ${selectedTrainee.name},

We are pleased to inform you that you have successfully completed your training evaluation! 🎉

Your Evaluation Results:
📊 Overall Rating: ${calculateOverallRating()}/5.00
📝 Adjectival Rating: ${getAdjectivalRating()}
✅ Status: Qualified
🎓 Recommendation: ${evaluationForm.recommendForRenewal ? 'Recommended for Renewal' : 'Not Recommended'}
💰 Scholarship Grant: ${autoScholarshipTier}%

You have demonstrated excellent performance and dedication throughout your training period. You are now eligible to become a scholarship grantee.

Next Steps:
1. Your account will be upgraded to Scholar status
2. You will now have access to the Member Profile and Engagement dashboards
3. You can view your scholarship details and benefits

Congratulations once again on this achievement!

Best regards,
${user.name}
${groupName} Director
University of Nueva Caceres`;

      toast.success(`${selectedTrainee.name} has PASSED with ${finalScore}% (${getAdjectivalRating()}) and is recommended for renewal! Moved to Member Profile.`);

      // Promote trainee to scholar on the backend
      const backendTraineeId = (selectedTrainee as any)._rawTrainee?.id;
      if (backendTraineeId) {
        try {
          await trainingClient.promoteTrainee(backendTraineeId);
        } catch (promoteErr: any) {
          console.error('Promotion API call failed (non-fatal):', promoteErr);
        }
      }

      // Update local state via parent callback (role → scholar)
      onCompleteTraining(selectedTrainee.id!, 'qualified', autoScholarshipTier);

      await refetchTrainees();

      // Keep local scholars cache in sync so Member table shows current scholarship immediately.
      setFetchedScholars((prev) => {
        const targetId = String(selectedTrainee.id || '');
        const hasExisting = prev.some((item) => String(item.id) === targetId);

        if (hasExisting) {
          return prev.map((item) =>
            String(item.id) === targetId
              ? {
                  ...item,
                  role: 'scholar',
                  scholarshipPercentage: autoScholarshipTier,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            ...selectedTrainee,
            role: 'scholar',
            scholarshipPercentage: autoScholarshipTier,
          },
        ];
      });
      
      // Close trainee dialog when moved to Member Profile
      setShowTraineeDialog(false);
      setSelectedTrainee(null);
    } else {
      toast.warning(`${selectedTrainee.name} scored ${finalScore}% and needs improvement. Evaluation saved.`);
      // Backend handles email notifications for failed evaluations
    }

    } catch (error: any) {
      const errorMessage = error.errors?.message || error.message || 'Failed to save evaluation';
      toast.error(`Error: ${errorMessage}`);
      console.error('Evaluation submission error:', error);
      return;
    }

    // Always close evaluation dialog and reset form
    setShowEvaluationDialog(false);
    setEvaluationForm({
      scholarName: '',
      talentUnit: '',
      ratingPeriod: '',
      sectionA: {
        reportsOnTime: 0,
        reportsRegularly: 0,
        practicesOnTime: 0,
        practicesRegularly: 0,
        noUnnecessaryAbsence: 0,
        mastersyTasks: 0,
        maintainsCleanliness: 0
      },
      sectionB: {
        improvementInterest: 0,
        performanceInterest: 0,
        workEthic: 0,
        initiative: 0,
        efficiency: 0
      },
      sectionC: {
        teamwork: 0,
        tact: 0,
        courtesy: 0,
        disposition: 0
      },
      strengths: '',
      improvements: '',
      recommendForRenewal: true,
      scholarshipPercentage: undefined,
      ratedBy: '',
      ratedDate: '',
      discussionDate: '',
      scholarSignatureDate: ''
    });
  };

  const handleAddAttendanceDate = () => {
    if (!newAttendanceDate) {
      toast.error('Please select a date');
      return;
    }

    // Check if date already exists
    if (trainingAttendance.some(record => record.date === newAttendanceDate)) {
      toast.error('This date already exists in the attendance table');
      return;
    }

    const saveDate = async () => {
      try {
        const defaultAttendees = Object.fromEntries(
          trainees
            .map((t) => {
              const id = resolveAttendanceTraineeId(String(t._rawTrainee?.id || t.id));
              return id ? [String(id), 'absent'] : null;
            })
            .filter(Boolean) as Array<[string, 'absent']>
        );

        await syncAttendanceSessionToBackend(newAttendanceDate, defaultAttendees, false);
        await loadTrainingAttendanceFromBackend();
        toast.success('Attendance date added successfully');
        setShowAddDateDialog(false);
        setNewAttendanceDate('');
      } catch (err: any) {
        toast.error(err.message || 'Failed to save attendance date');
      }
    };

    void saveDate();
  };

  const handleGenerateAttendanceDates = () => {
    if (!dateGenerationForm.startDate || !dateGenerationForm.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (dateGenerationForm.trainingDays.length === 0) {
      toast.error('Please select at least one training day');
      return;
    }

    const startDate = new Date(dateGenerationForm.startDate);
    const endDate = new Date(dateGenerationForm.endDate);

    if (startDate > endDate) {
      toast.error('Start date must be before or equal to end date');
      return;
    }

    const generatedDates: string[] = [];
    const currentDate = new Date(startDate);

    // Generate dates based on selected training days
    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (dateGenerationForm.trainingDays.includes(dayName)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if date already exists
        if (!trainingAttendance.some(record => record.date === dateStr)) {
          generatedDates.push(dateStr);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (generatedDates.length === 0) {
      toast.error('No new dates to add (dates may already exist or no matching days found)');
      return;
    }

    const saveGeneratedDates = async () => {
      try {
        const defaultAttendees = Object.fromEntries(
          trainees
            .map((t) => {
              const id = resolveAttendanceTraineeId(String(t._rawTrainee?.id || t.id));
              return id ? [String(id), 'absent'] : null;
            })
            .filter(Boolean) as Array<[string, 'absent']>
        );

        for (const date of generatedDates) {
          await syncAttendanceSessionToBackend(date, defaultAttendees, false);
        }

        await loadTrainingAttendanceFromBackend();
        toast.success(`Successfully generated ${generatedDates.length} attendance date(s)`);
        setShowAddDateDialog(false);
        setDateGenerationForm({
          startDate: '',
          endDate: '',
          frequency: 'weekly',
          trainingDays: []
        });
      } catch (err: any) {
        toast.error(err.message || 'Failed to generate attendance dates');
      }
    };

    void saveGeneratedDates();
  };

  const toggleAttendance = (dateIndex: number, traineeId: string) => {
    const updated = [...trainingAttendance];
    const current = normalizeAttendanceStatus(updated[dateIndex].attendees[traineeId]);
    const next = current === 'present' ? 'absent' : 'present';

    updated[dateIndex] = {
      ...updated[dateIndex],
      attendees: {
        ...updated[dateIndex].attendees,
        [traineeId]: next
      }
    };

    setTrainingAttendance(updated);
    void syncAttendanceSessionToBackend(updated[dateIndex].date, updated[dateIndex].attendees, Boolean(updated[dateIndex].noPractice));
  };

  const markAllForDate = (dateIndex: number, present: boolean) => {
    const updated = [...trainingAttendance];
    const attendees: { [key: string]: 'present' | 'absent' } = {};

    trainees.forEach((trainee) => {
      const id = resolveAttendanceTraineeId(String(trainee._rawTrainee?.id || trainee.id));
      if (id) {
        attendees[String(id)] = present ? 'present' : 'absent';
      }
    });

    updated[dateIndex] = {
      ...updated[dateIndex],
      attendees
    };

    setTrainingAttendance(updated);
    void syncAttendanceSessionToBackend(updated[dateIndex].date, attendees, Boolean(updated[dateIndex].noPractice));
    toast.success(`All trainees marked as ${present ? 'present' : 'absent'} for ${new Date(updated[dateIndex].date).toLocaleDateString()}`);
  };

  // Chapter Locking System Helper Functions
  const isChapterLocked = (traineeId: string, chapterNum: number): boolean => {
    // Chapter 1 is always unlocked
    if (chapterNum === 1) return false;
    // A chapter unlocks when the previous chapter is marked complete in traineeChapters.
    // traineeChapters is persisted to the backend so it survives logout/reload.
    const prevDone = Boolean(traineeChapters[traineeId]?.[chapterNum - 1]);
    return !prevDone;
  };

  const hasUnfinishedChapters = (traineeId: string): boolean => {
    // Check if any completed chapters (chapters with traineeChapters[traineeId][chapter] = true) 
    // don't have a passed evaluation
    const chapters = traineeChapters[traineeId] || {};
    for (let chapterNum = 1; chapterNum <= 30; chapterNum++) {
      if (chapters[chapterNum]) {
        const evaluation = chapterEvaluations[traineeId]?.[chapterNum];
        if (!evaluation || !evaluation.passed) {
          return true;
        }
      }
    }
    return false;
  };

  const resolveBackendTraineeId = (traineeId: string): number | null => {
    const matched = traineesList.find((t: any) =>
      String(t?.id) === String(traineeId) || String(t?.user_id) === String(traineeId)
    );

    if (!matched) return null;

    const id = Number(matched.id);
    return Number.isFinite(id) ? id : null;
  };

  const buildNormalizedChapterMap = (chapters?: Record<string | number, boolean>): Record<string, boolean> => {
    const normalized: Record<string, boolean> = {};
    for (let i = 1; i <= 30; i++) {
      normalized[String(i)] = Boolean(chapters?.[i] ?? chapters?.[String(i)]);
    }
    return normalized;
  };

  const persistTraineeTrainingState = async (
    traineeUserId: string,
    updates: {
      instrument?: string;
      voice?: string;
      chapters?: Record<string | number, boolean>;
    }
  ) => {
    const backendTraineeId = resolveBackendTraineeId(traineeUserId);
    if (!backendTraineeId) {
      toast.error('Unable to resolve trainee record. Please refresh and try again.');
      return;
    }

    const currentInstrument = updates.instrument ?? traineeInstruments[traineeUserId] ?? undefined;
    const currentVoice = updates.voice ?? traineeVoices[traineeUserId] ?? undefined;
    const normalizedChapters = buildNormalizedChapterMap(updates.chapters ?? traineeChapters[traineeUserId]);
    const completedCount = Object.values(normalizedChapters).filter(Boolean).length;
    const latestCompletedChapter = Math.max(
      0,
      ...Object.entries(normalizedChapters)
        .filter(([, done]) => Boolean(done))
        .map(([chapter]) => Number(chapter))
        .filter((num) => Number.isFinite(num))
    );

    await trainingClient.updateTrainee(backendTraineeId, {
      instrument: currentInstrument,
      voice: currentVoice,
      chapters_completed: normalizedChapters,
      completion_rate: Math.round((completedCount / 30) * 100),
      chapter: latestCompletedChapter > 0 ? `Chapter ${latestCompletedChapter}` : undefined,
    } as any);
  };

  const handleChapterEvalSubmit = () => {
    if (!selectedChapterForEval) {
      toast.error('Error: Chapter not selected');
      return;
    }

    const { traineeId, chapterNum } = selectedChapterForEval;
    
    // Save chapter evaluation
    setChapterEvaluations(prev => ({
      ...prev,
      [traineeId]: {
        ...(prev[traineeId] || {}),
        [chapterNum]: {
          passed: chapterEvalForm.passed,
          score: chapterEvalForm.score,
          notes: chapterEvalForm.notes,
          date: new Date()
        }
      }
    }));

    toast.success(`Chapter ${chapterNum} evaluation recorded. ${chapterEvalForm.passed ? 'Passed ✓' : 'Needs Improvement'}`);
    setShowChapterEvalDialog(false);
    setSelectedChapterForEval(null);
    setChapterEvalForm({ score: 0, notes: '', passed: true });
  };

  // Handle chapter evaluation from ChapterEvaluationDialog component
  const handleChapterEvaluationComplete = async (chapterNum: number, scores: Record<string, number>, notes: string) => {
    if (!selectedChapterForEval) return;
    
    try {
      const { traineeId } = selectedChapterForEval;
      const backendTraineeId = resolveBackendTraineeId(traineeId);
      if (!backendTraineeId) {
        toast.error('Unable to resolve trainee record. Please refresh and try again.');
        return;
      }

      const scoreValues = Object.values(scores);
      const average = scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
      const passed = average >= 3.0; // Pass threshold
      const ratingOutOf100 = Math.max(1, Math.min(100, Math.round((average / 5) * 100)));
      const recommendation = passed ? 'continue' : 'probation';
      const evaluationDate = new Date().toISOString().slice(0, 10);

      const criteriaSummary = Object.entries(scores)
        .map(([criterion, value]) => `${criterion}: ${value}`)
        .join(', ');
      const chapterSummary = `Chapter ${chapterNum} | Avg: ${average.toFixed(2)}/5 | ${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'} | Criteria: ${criteriaSummary}`;
      const combinedNotes = notes?.trim() ? `${notes.trim()}\n\n${chapterSummary}` : chapterSummary;
      
      // TrainingController@storeEvaluation requires rating/recommendation/evaluation_date fields.
      const chapterEvalData = {
        trainee_id: backendTraineeId,
        rating: ratingOutOf100,
        recommendation,
        evaluation_date: evaluationDate,
        notes: combinedNotes,
        strengths: passed ? `Passed chapter ${chapterNum} evaluation.` : undefined,
        improvements: passed ? undefined : `Review chapter ${chapterNum} and re-evaluate after additional practice.`,
        status: 'submitted'
      };

      // Save to backend
      await trainingClient.createEvaluation(chapterEvalData);

      // If passed, auto-mark chapter as complete in traineeChapters and persist
      if (passed) {
        const nextChapters = {
          ...(traineeChapters[traineeId] || {}),
          [chapterNum]: true,
        };
        setTraineeChapters(prev => ({
          ...prev,
          [traineeId]: nextChapters,
        }));
        void persistTraineeTrainingState(traineeId, { chapters: nextChapters }).catch(() => {});
      }

      // Update frontend evaluation state
      setChapterEvaluations(prev => ({
        ...prev,
        [traineeId]: {
          ...(prev[traineeId] || {}),
          [chapterNum]: {
            passed,
            score: Math.round(average * 100) / 100,
            notes,
            date: new Date()
          }
        }
      }));

      toast.success(`Chapter ${chapterNum} evaluation recorded. Average: ${average.toFixed(2)} – ${passed ? 'Passed ✓' : 'Needs Improvement ⚠'}`);
      setShowChapterEvalDialog(false);
      setSelectedChapterForEval(null);
    } catch (error: any) {
      const errorMessage = error.errors?.message || error.message || 'Failed to save chapter evaluation';
      toast.error(`Error: ${errorMessage}`);
      console.error('Chapter evaluation error:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'; // Good
    if (score >= 60) return 'text-yellow-600'; // Medium
    return 'text-red-600'; // Bad
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'; // Good
    if (score >= 60) return 'bg-yellow-600'; // Medium
    return 'bg-red-600'; // Bad
  };

  // Form validation helpers
  const validateEventField = (fieldName: string, value: any) => {
    let error = '';
    switch (fieldName) {
      case 'eventName':
        if (!value || !value.trim()) error = 'Event Name is required';
        break;
      case 'date':
        if (!value) error = 'Event Date is required';
        break;
      case 'time':
        if (!value) error = 'Event Time is required';
        break;
      case 'venue':
        if (!value || !value.trim()) error = 'Venue is required';
        break;
      case 'description':
        if (!value || !value.trim()) error = 'Event Description is required';
        break;
    }
    return error;
  };

  const validateUpdateField = (fieldName: string, value: any) => {
    let error = '';
    switch (fieldName) {
      case 'category':
        if (!value || !value.trim()) error = 'Category is required';
        break;
      case 'date':
        if (!value) error = 'Date is required';
        break;
      case 'title':
        if (!value || !value.trim()) error = 'Title is required';
        break;
      case 'description':
        if (!value || !value.trim()) error = 'Description is required';
        break;
    }
    return error;
  };

  const handleEventFieldBlur = (fieldName: string) => {
    setEventFormTouched(prev => ({ ...prev, [fieldName]: true }));
    let value;
    switch (fieldName) {
      case 'eventName': value = eventRequestForm.eventName; break;
      case 'date': value = eventRequestForm.date; break;
      case 'time': value = eventRequestForm.time; break;
      case 'venue': value = eventRequestForm.venue; break;
      case 'description': value = eventRequestForm.description; break;
      default: value = '';
    }
    const error = validateEventField(fieldName, value);
    setEventFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleUpdateFieldBlur = (fieldName: string) => {
    setUpdateFormTouched(prev => ({ ...prev, [fieldName]: true }));
    let value;
    switch (fieldName) {
      case 'category': value = latestUpdateForm.category; break;
      case 'date': value = latestUpdateForm.date; break;
      case 'title': value = latestUpdateForm.title; break;
      case 'description': value = latestUpdateForm.description; break;
      default: value = '';
    }
    const error = validateUpdateField(fieldName, value);
    setUpdateFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Engagement handlers
  const handleAcceptEngagement = (engagementId: string) => {
    const acceptEngagement = async () => {
      await engagementService.updateEngagement(engagementId, { status: 'scheduled' as any });
      await refetchEngagementRequests();
      toast.success('Engagement request accepted');
    };

    void acceptEngagement().catch(() => {
      toast.error('Failed to accept engagement request');
    });
  };

  const handleRejectEngagement = (engagementId: string) => {
    const rejectEngagement = async () => {
      await engagementService.updateEngagement(engagementId, { status: 'rejected' as any });
      await refetchEngagementRequests();
      toast.success('Engagement request rejected');
    };

    void rejectEngagement().catch(() => {
      toast.error('Failed to reject engagement request');
    });
  };

  const handleRequestEvent = () => {
    // Prevent double submission
    if (isSubmittingEvent) return;
    
    // Mark all fields as touched
    setEventFormTouched({
      eventName: true,
      date: true,
      time: true,
      venue: true,
      description: true
    });
    
    // Validate all fields
    const errors = {
      eventName: validateEventField('eventName', eventRequestForm.eventName),
      date: validateEventField('date', eventRequestForm.date),
      time: validateEventField('time', eventRequestForm.time),
      venue: validateEventField('venue', eventRequestForm.venue),
      description: validateEventField('description', eventRequestForm.description)
    };
    setEventFormErrors(errors);
    
    // Collect missing fields
    const missingFields = [];
    if (!eventRequestForm.eventName) missingFields.push('Event Name');
    if (!eventRequestForm.date) missingFields.push('Event Date');
    if (!eventRequestForm.time) missingFields.push('Event Time');
    if (!eventRequestForm.venue) missingFields.push('Venue');
    if (!eventRequestForm.description) missingFields.push('Event Description');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Set loading state
    setIsSubmittingEvent(true);

    const submitEventRequest = async () => {
      await engagementService.createEngagement({
        event_name: eventRequestForm.eventName,
        date: eventRequestForm.date,
        time: eventRequestForm.time,
        venue: eventRequestForm.venue,
        description: eventRequestForm.description,
        attachments: eventRequestForm.attachment ? [{ name: eventRequestForm.attachment }] : [],
        talent_groups: directorTalentGroup ? [directorTalentGroup] : undefined,
        type: 'performance',
        status: 'pending_admin_approval' as any,
        is_required: false,
      } as any);

      await refetchEngagementRequests();
      toast.success('Event request submitted to admin for approval!');

      setShowRequestEventDialog(false);
      setEventRequestForm({
        eventName: '',
        date: '',
        time: '',
        venue: '',
        description: '',
        attachment: ''
      });

      setEventFormTouched({
        eventName: false,
        date: false,
        time: false,
        venue: false,
        description: false
      });
      setEventFormErrors({
        eventName: '',
        date: '',
        time: '',
        venue: '',
        description: ''
      });
    };

    void submitEventRequest()
      .catch(() => {
        toast.error('Failed to submit event request');
      })
      .finally(() => {
        setIsSubmittingEvent(false);
      });
  };

  const handleCreateLatestUpdate = () => {
    // Prevent double submission
    if (isSubmittingUpdate) return;
    
    // Mark all fields as touched
    setUpdateFormTouched({
      category: true,
      date: true,
      title: true,
      description: true
    });
    
    // Validate all fields
    const errors = {
      category: validateUpdateField('category', latestUpdateForm.category),
      date: validateUpdateField('date', latestUpdateForm.date),
      title: validateUpdateField('title', latestUpdateForm.title),
      description: validateUpdateField('description', latestUpdateForm.description)
    };
    setUpdateFormErrors(errors);
    
    // Collect missing fields
    const missingFields = [];
    if (!latestUpdateForm.category) missingFields.push('Category');
    if (!latestUpdateForm.date) missingFields.push('Date');
    if (!latestUpdateForm.title) missingFields.push('Title');
    if (!latestUpdateForm.description) missingFields.push('Description');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Set loading state
    setIsSubmittingUpdate(true);

    const createLatestUpdate = async () => {
      await announcementService.createAnnouncement({
        category: latestUpdateForm.category,
        date: latestUpdateForm.date,
        icon: latestUpdateForm.icon,
        title: latestUpdateForm.title,
        description: latestUpdateForm.description,
        talent_group: directorTalentGroup,
      } as any);

      await refetchLatestUpdates();

      toast.success('Latest update posted successfully!');
      setShowLatestUpdateDialog(false);
      setLatestUpdateForm({
        category: '',
        date: '',
        icon: 'trophy',
        title: '',
        description: ''
      });

      setUpdateFormTouched({
        category: false,
        date: false,
        title: false,
        description: false
      });
      setUpdateFormErrors({
        category: '',
        date: '',
        title: '',
        description: ''
      });
    };

    void createLatestUpdate()
      .catch(() => {
        toast.error('Failed to post latest update');
      })
      .finally(() => {
        setIsSubmittingUpdate(false);
      });
  };

  const deleteLatestUpdate = (updateId: string) => {
    const deleteUpdate = async () => {
      await announcementService.deleteAnnouncement(updateId);
      await refetchLatestUpdates();
    };

    void deleteUpdate().catch(() => {
      toast.error('Failed to delete update');
    });
  };

  const handleUpdateEdit = () => {
    if (!editingUpdate) return;

    // Validation
    const missingFields = [];
    if (!editingUpdate.category) missingFields.push('Category');
    if (!editingUpdate.date) missingFields.push('Date');
    if (!editingUpdate.title) missingFields.push('Title');
    if (!editingUpdate.description) missingFields.push('Description');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    const saveEditedUpdate = async () => {
      await announcementService.updateAnnouncement(editingUpdate.id, {
        category: editingUpdate.category,
        date: editingUpdate.date,
        icon: editingUpdate.icon,
        title: editingUpdate.title,
        description: editingUpdate.description,
        talent_group: directorTalentGroup,
      } as any);

      await refetchLatestUpdates();
      toast.success('Update edited successfully!');
      setShowEditUpdateDialog(false);
      setEditingUpdate(null);
    };

    void saveEditedUpdate().catch(() => {
      toast.error('Failed to edit update');
    });
  };

  const handleToggleScholarStatus = (scholarId: string) => {
    setScholarAssignments(prev => {
      const current = prev[scholarId] || { status: 'active', uniforms: [], instruments: [], accessories: [] };
      const newStatus = current.status === 'active' ? 'inactive' : 'active';
      
      toast.success(`Scholar status updated to ${newStatus}`);
      
      return {
        ...prev,
        [scholarId]: {
          ...current,
          status: newStatus
        }
      };
    });
  };

  // Member Profile handlers
  const handleAssignUniform = () => {
    // Collect missing fields
    const missingFields = [];
    if (!uniformForm.serialNumber) missingFields.push('Serial Number');
    if (!uniformForm.uniformName) missingFields.push('Uniform Name');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    // Create inventory item
    if (onAddInventoryItem) {
      const newItem = {
        id: '',
        userId: uniformForm.assignedTo || '',
        itemName: uniformForm.uniformName,
        type: 'uniform' as const,
        assignedDate: uniformForm.assignedTo ? new Date() : undefined,
        status: uniformForm.assignedTo ? 'assigned' as const : 'borrowed' as const,
        // Sizes
        ...uniformForm
      };
      onAddInventoryItem(newItem);
    }
    
    toast.success(`Uniform ${uniformForm.serialNumber} created and ${uniformForm.assignedTo ? 'assigned to scholar' : 'added to inventory'}!`);
    setShowAssignUniformDialog(false);
    setUniformForm({ 
      serialNumber: '',
      uniformName: '',
      condition: 'good',
      propertyType: 'unc-property',
      assignedTo: '',
      // Majorettes sizes
      headpieceSize: '',
      dressSize: '',
      shoesSize: '',
      // Marching Band sizes
      headdressSize: '',
      topSize: '',
      pantsSize: '',
      bandShoesSize: '',
      barongType: ''
    });
  };

  const handleAssignInstrument = () => {
    // Collect missing fields
    const missingFields = [];
    if (!instrumentForm.instrumentType) missingFields.push('Instrument Type');
    if (!instrumentForm.serialNumber) missingFields.push('Serial Number');
    if (!instrumentForm.instrumentName) missingFields.push('Brand & Model');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    // Create inventory item
    if (onAddInventoryItem) {
      const newItem = {
        id: '',
        userId: instrumentForm.assignedTo || '',
        itemName: instrumentForm.instrumentName,
        type: 'instrument' as const,
        condition: 'excellent' as const,
        serialNumber: instrumentForm.serialNumber,
        instrumentType: instrumentForm.instrumentType,
        propertyType: instrumentForm.propertyType,
        assignedDate: instrumentForm.assignedTo ? new Date() : undefined,
        status: instrumentForm.assignedTo ? 'assigned' as const : 'borrowed' as const
      };
      onAddInventoryItem(newItem);
    }
    
    toast.success(`Instrument ${instrumentForm.serialNumber} created and ${instrumentForm.assignedTo ? 'assigned to scholar' : 'added to inventory'}!`);
    setShowAssignInstrumentDialog(false);
    setInstrumentForm({ 
      serialNumber: '',
      instrumentName: '',
      instrumentType: '',
      condition: 'good',
      propertyType: 'unc-property',
      assignedTo: ''
    });
  };

  const handleAssignAccessory = () => {
    // Collect missing fields
    const missingFields = [];
    if (!accessoryForm.accessoryName) missingFields.push('Accessory Name');
    if (!accessoryForm.accessoryType) missingFields.push('Accessory Type');

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    // Add to accessories data (not assigned to individual scholars)
    const newAccessory = {
      id: '',
      userId: '',
      itemName: accessoryForm.accessoryName,
      type: 'accessory' as const,
      condition: 'good' as const,
      accessoryType: accessoryForm.accessoryType,
      description: accessoryForm.description,
      quantity: accessoryForm.quantity,
      status: 'borrowed' as const,
    };
    
    if (onAddInventoryItem) {
      onAddInventoryItem(newAccessory);
    }
    
    toast.success(`Accessory "${accessoryForm.accessoryName}" created successfully!`);
    setShowAssignAccessoryDialog(false);
    setAccessoryForm({ 
      accessoryName: '',
      accessoryType: '',
      quantity: 1,
      description: ''
    });
  };

  // Handler for assigning inventory items from existing inventory to scholars
  const handleAssignInventoryToScholar = (itemType: 'uniform' | 'instrument' | 'accessory') => {
    if (!assignScholarId) {
      toast.error('Please select a scholar to assign this item to');
      return;
    }

    const scholar = scholars.find(s => s.id === assignScholarId);
    if (!scholar) {
      toast.error('Selected scholar not found');
      return;
    }

    let itemToUpdate: any = null;

    if (itemType === 'uniform') {
      itemToUpdate = selectedUniform;
    } else if (itemType === 'instrument') {
      itemToUpdate = selectedInstrument;
    } else if (itemType === 'accessory') {
      itemToUpdate = selectedAccessory;
    }

    if (!itemToUpdate) {
      toast.error('No item selected');
      return;
    }

    const updatedItem = {
      ...itemToUpdate,
      status: 'assigned' as const,
      userId: assignScholarId,
      assignedDate: new Date(),
      assignedTo: scholar.name,
    };

    if (onUpdateInventoryItem) {
      onUpdateInventoryItem(updatedItem.id, updatedItem);
    }

    if (itemType === 'uniform') {
      setSelectedUniform(updatedItem);
    } else if (itemType === 'instrument') {
      setSelectedInstrument(updatedItem);
    } else if (itemType === 'accessory') {
      setSelectedAccessory(updatedItem);
    }

    toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} assigned to ${scholar.name} successfully!`);
    
    // Reset and close dialog
    setAssignScholarId('');
    if (itemType === 'uniform') {
      setShowViewUniformDialog(false);
    } else if (itemType === 'instrument') {
      setShowViewInstrumentDialog(false);
    } else if (itemType === 'accessory') {
      setShowViewAccessoryDialog(false);
    }
    
    // Force re-render to show updated inventory
    setInventoryUpdateTrigger(prev => prev + 1);
    setSelectedUniform(null);
    setSelectedInstrument(null);
    setSelectedAccessory(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      {/* ── Header ── */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">

          {/* Left: branding */}
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl leading-tight">
                <span className="font-bold text-[#0F172A]">Talent</span>
                <span className="text-[#0F172A]">Track</span>
                <span className="font-bold text-[#7A1E1E]">UNC</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-none mt-0.5">Director Dashboard</p>
            </div>
          </div>

          {/* Right: notifications + user card + settings */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:border-[#7A1E1E] hover:text-[#7A1E1E] text-[#475569] transition-colors"
              aria-label={unreadNotifications > 0 ? `Notifications — ${unreadNotifications} unread` : 'Notifications'}
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* User info card */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#7A1E1E]" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{user.name}</p>
                <p className="text-[11px] text-[#64748B] leading-none mt-0.5">{getTalentGroupName(directorTalentGroup)}</p>
              </div>
            </div>

            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 border border-[#7A1E1E] rounded-lg px-3 py-1.5 text-sm font-medium text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors duration-200"
                  aria-label="Open settings menu"
                >
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange?.('settings', 'account')}>
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange?.('settings', 'security')}>
                  <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange?.('settings', 'administration')}>
                  <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
                  Administration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutConfirmation(true)} variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Navigation Tab Bar ── */}
      <nav className="bg-white border-b border-[#E2E8F0]" aria-label="Director dashboard sections">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px]">
          <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Dashboard views">
            {(
              [
                { key: 'recruitment',   icon: Users,          label: 'Application' },
                { key: 'training',      icon: GraduationCap,  label: 'Training'    },
                { key: 'member-profile',icon: User,           label: 'Members'     },
                { key: 'engagement',    icon: Calendar,       label: 'Engagement'  },
                { key: 'documents',     icon: FileText,       label: 'Documents'   },
              ] as const
            ).map(({ key, icon: Icon, label }) => {
              const active = currentView === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`tab-panel-${key}`}
                  onClick={() => setCurrentView(key)}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-b-2 ${
                    active
                      ? 'border-[#7A1E1E] text-[#7A1E1E]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-6">
        {/* Navigation Tabs */}
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="space-y-6">

          {/* RECRUITMENT TAB */}
          <DirectorRecruitmentTab
            pendingApps={pendingApps}
            scheduledInterviews={scheduledInterviews}
            applicationsThisWeek={applicationsThisWeek}
            filteredApplications={filteredApplications}
            interviewSchedules={interviewSchedules}
            handleViewApplication={handleViewApplication}
            handleSetSchedule={handleSetSchedule}
            handleApproveInterview={handleApproveInterview}
            handleRejectInterview={handleRejectInterview}
            onApprovalSuccess={refetchApplications}
          />

          {/* TRAINING TAB */}
          <DirectorTrainingTab
            trainees={trainees}
            droppedTrainees={droppedTrainees}
            trainingCompletionRate={trainingCompletionRate}
            traineeSearchTerm={traineeSearchTerm}
            setTraineeSearchTerm={setTraineeSearchTerm}
            traineeStatuses={traineeStatuses}
            traineeChapters={traineeChapters}
            traineeInstruments={traineeInstruments}
            traineeVoices={traineeVoices}
            trainingAttendance={trainingAttendance}
            setTrainingAttendance={setTrainingAttendance}
            setSelectedTrainee={setSelectedTrainee}
            setShowTraineeDialog={setShowTraineeDialog}
            setSelectedTraineePerformance={setSelectedTraineePerformance}
            setShowTraineePerformanceDialog={setShowTraineePerformanceDialog}
            setShowAddDateDialog={setShowAddDateDialog}
            setShowSummaryReportDialog={setShowSummaryReportDialog}
            onSyncAttendanceSession={(sessionDate, attendees, noPractice) => {
              void syncAttendanceSessionToBackend(sessionDate, attendees, noPractice);
            }}
            evaluations={evaluations}
            getScoreColor={getScoreColor}
            onReactivateTrainee={handleReactivateTrainee}
          />

          {/* MEMBER-PROFILE TAB */}
          <DirectorMemberProfileTab
            activeScholars={activeScholars}
            renewalRate={renewalRate}
            isDanceClub={isDanceClub}
            isMarchingBand={isMarchingBand}
            isGleeClub={isGleeClub}
            scholars={scholars}
            scholarAssignments={scholarAssignments}
            traineeVoices={traineeVoices}
            evaluations={evaluations}
            isReadyForEvaluation={isReadyForEvaluation}
            setSelectedScholar={setSelectedScholar}
            setShowScholarDialog={setShowScholarDialog}
            setSelectedScholarForPerformance={setSelectedScholarForPerformance}
            setShowPerformanceDialog={setShowPerformanceDialog}
            statusFilter={statusFilter}
            setStatusFilter={(v: string) => setStatusFilter(v as 'active' | 'inactive' | 'all')}
            scholarSearchTerm={scholarSearchTerm}
            setScholarSearchTerm={setScholarSearchTerm}
            inventoryTab={inventoryTab}
            setInventoryTab={(v: string) => setInventoryTab(v as 'uniforms' | 'instruments' | 'accessories')}
            uniformFilters={uniformFilters}
            setUniformFilters={setUniformFilters}
            uniformSets={uniformSets}
            filteredUniforms={filteredUniforms}
            setShowAssignUniformDialog={setShowAssignUniformDialog}
            setSelectedUniform={setSelectedUniform}
            setAssignScholarId={setAssignScholarId}
            setShowViewUniformDialog={setShowViewUniformDialog}
            instrumentFilters={instrumentFilters}
            setInstrumentFilters={setInstrumentFilters}
            instrumentTypes={instrumentTypes}
            filteredInstruments={filteredInstruments}
            setShowAssignInstrumentDialog={setShowAssignInstrumentDialog}
            setSelectedInstrument={setSelectedInstrument}
            setShowViewInstrumentDialog={setShowViewInstrumentDialog}
            accessoryFilters={accessoryFilters}
            setAccessoryFilters={setAccessoryFilters}
            accessoryTypes={accessoryTypes}
            filteredAccessories={filteredAccessories}
            setShowAssignAccessoryDialog={setShowAssignAccessoryDialog}
            setSelectedAccessory={setSelectedAccessory}
            setShowViewAccessoryDialog={setShowViewAccessoryDialog}
          />

          {/* ENGAGEMENT TAB */}
          <TabsContent value="engagement" id="tab-panel-engagement" role="tabpanel" aria-label="Engagement" className="space-y-6">
            <DirectorEngagementRehearsalView talentGroup={user.talentGroup || ''} />
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" id="tab-panel-documents" role="tabpanel" aria-label="Documents" className="space-y-6">
            <DocumentsDashboard 
              user={user}
              onLogout={onLogout}
              onNavigateBack={() => {}}
              contentOnly={true}
              restrictToGroup={user.talentGroup}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Application Details Dialog */}
      <ApplicationDetailsDialog
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
        application={selectedApplication}
      />

      {/* Schedule Interview Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set interview date and time for {selectedApplication?.personalInfo.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="interview-date">Interview Date <span className="text-red-600">*</span></Label>
              <Input
                id="interview-date"
                type="date"
                min={new Date().toLocaleDateString('en-CA')}
                value={interviewForm.date}
                onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                className="border-[#D1D5DC] bg-white cursor-pointer"
                style={{ colorScheme: 'light' }}
                required
                aria-required="true"
              />
            </div>
            <div>
              <Label htmlFor="interview-time">Time <span className="text-red-600">*</span></Label>
              <Input
                id="interview-time"
                type="time"
                value={interviewForm.time}
                onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                className="border-[#D1D5DC] bg-white cursor-pointer"
                style={{ colorScheme: 'light' }}
                required
                aria-required="true"
              />
            </div>
            <div>
              <Label htmlFor="interview-venue">Venue</Label>
              <Input
                id="interview-venue"
                value={interviewForm.venue}
                onChange={(e) => setInterviewForm({ ...interviewForm, venue: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="interview-notes">Notes (Optional)</Label>
              <Textarea
                id="interview-notes"
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                placeholder="Additional notes for the interview..."
                rows={3}
                className="border border-[#E0E0E0]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={!interviewForm.date || !interviewForm.time}
              className="bg-[#7A1E1E] hover:bg-[#6A1919] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trainee Details Dialog */}
      <TraineeDetailsDialog
        open={showTraineeDialog}
        onOpenChange={setShowTraineeDialog}
        trainee={selectedTrainee}
        applications={applications}
        trainingAttendance={trainingAttendance}
        traineeInstruments={traineeInstruments}
        isMarchingBand={isMarchingBand}
        onDeactivateClick={() => {
          setTraineeToDeactivate(selectedTrainee);
          setDeactivationReason('');
          setShowTraineeDialog(false);
          setShowDeactivateWarning(true);
        }}
        onClose={() => setShowTraineeDialog(false)}
      />


      {/* Deactivate Warning Dialog */}
      <Dialog open={showDeactivateWarning} onOpenChange={setShowDeactivateWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#7A1E1E]">
              <AlertCircle className="w-5 h-5" />
              Confirm Deactivation
            </DialogTitle>
            <DialogDescription>
              You are about to deactivate {traineeToDeactivate?.name}.
            </DialogDescription>
          </DialogHeader>
          <Alert className="bg-[#7A1E1E]/5 border-[#7A1E1E]/20">
            <AlertCircle className="h-4 w-4 text-[#7A1E1E]" />
            <AlertDescription className="text-[#1A1A1A]">
              <p className="mb-2">This action will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Remove them from the active trainees list</li>
                <li>Prevent them from appearing in training rosters</li>
                <li>Stop including them in attendance checks</li>
                <li>Mark them as deactivated in the system</li>
              </ul>
            </AlertDescription>
          </Alert>
          <p className="text-sm text-[#6c757d]">
            You can reactivate them later from the Settings → Administration → Deactivated Members section if needed.
          </p>
          <div>
            <Label htmlFor="deactivation-reason" className="text-[#6c757d] text-xs">Reason / Notes</Label>
            <Textarea
              id="deactivation-reason"
              placeholder="Add reason for deactivation..."
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
              onClick={() => {
                setShowDeactivateWarning(false);
                setTraineeToDeactivate(null);
                setDeactivationReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white"
              onClick={() => {
                const deactivateTrainee = async () => {
                  if (!traineeToDeactivate) return;

                  const backendTraineeId = resolveBackendTraineeId(String(traineeToDeactivate.id));
                  if (!backendTraineeId) {
                    toast.error('Unable to resolve trainee record. Please refresh and try again.');
                    return;
                  }

                  await trainingClient.updateTrainee(backendTraineeId, {
                    current_status: 'dropped',
                    deactivation_note: deactivationReason.trim() || null,
                  } as any);

                  await refetchTrainees();
                  toast.success(`${traineeToDeactivate.name} has been deactivated`);
                  setShowDeactivateWarning(false);
                  setTraineeToDeactivate(null);
                  setDeactivationReason('');
                  setShowTraineeDialog(false);
                };

                void deactivateTrainee().catch((err: any) => {
                  toast.error(err?.message || 'Failed to deactivate trainee');
                });
              }}
            >
              Deactivate Trainee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      <EvaluationFormDialog
        open={showEvaluationDialog}
        onOpenChange={setShowEvaluationDialog}
        selectedTrainee={selectedTrainee!}
        evaluationForm={evaluationForm as any}
        setEvaluationForm={setEvaluationForm as any}
        onSubmit={handleSubmitEvaluation}
        calculateSectionATotal={calculateSectionATotal}
        calculateSectionAAverage={calculateSectionAAverage}
        calculateSectionBTotal={calculateSectionBTotal}
        calculateSectionBAverage={calculateSectionBAverage}
        calculateSectionCTotal={calculateSectionCTotal}
        calculateSectionCAverage={calculateSectionCAverage}
        calculateOverallRating={calculateOverallRating}
        getAdjectivalRating={getAdjectivalRating}
        currentUser={user}
        isDisabled={selectedTrainee ? hasUnfinishedChapters(selectedTrainee.id!) : false}
        disabledReason="Complete and evaluate all chapters before the Final Evaluation"
      />

      {/* Per-Chapter Evaluation Dialog */}
      {selectedChapterForEval && (
        <ChapterEvaluationDialog
          open={showChapterEvalDialog}
          onOpenChange={setShowChapterEvalDialog}
          chapterNum={selectedChapterForEval.chapterNum}
          traineeName={selectedTrainee?.name || ''}
          talentGroup={selectedTrainee?.talentGroup || directorTalentGroup}
          onComplete={handleChapterEvaluationComplete}
        />
      )}

      {/* Assign Uniform Dialog */}
      <Dialog open={showAssignUniformDialog} onOpenChange={setShowAssignUniformDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Uniform Template</DialogTitle>
            <DialogDescription>Create a new uniform item with tracking information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              {/* Required Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-[#7A1E1E]">Required Information</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Uniform Name <span className="text-red-600">*</span></Label>
                    <Input
                      value={uniformForm.uniformName}
                      onChange={(e) => setUniformForm({ ...uniformForm, uniformName: e.target.value })}
                      placeholder={
                        isMajorettes ? "e.g., Majorettes Performance Set 2024" :
                        isGleeClub ? "e.g., Barong A 2024" :
                        isDanceClub ? "e.g., Performance Set 2024" :
                        "e.g., Marching Band Full Uniform 2024"
                      }
                    />
                  </div>
                  <div>
                    <Label>Serial Number <span className="text-red-600">*</span></Label>
                    <Input
                      value={uniformForm.serialNumber}
                      onChange={(e) => setUniformForm({ ...uniformForm, serialNumber: e.target.value })}
                      placeholder={
                        isMajorettes ? "e.g., UNF-MAJ-001" :
                        isGleeClub ? "e.g., UNF-GLE-001" :
                        isDanceClub ? "e.g., UNF-DAN-001" :
                        "e.g., UNF-MB-001"
                      }
                    />
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <Input
                      value="Good"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically set to good condition for new uniforms</p>
                  </div>
                  <div>
                    <Label>Property Type <span className="text-red-600">*</span></Label>
                    <Select value={uniformForm.propertyType} onValueChange={(val) => setUniformForm({ ...uniformForm, propertyType: val as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unc-property">UNC Property</SelectItem>
                        <SelectItem value="own-property">Personal Owned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Assigned Scholar (Optional)</Label>
                    <Select value={uniformForm.assignedTo} onValueChange={(val) => setUniformForm({ ...uniformForm, assignedTo: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scholar" />
                      </SelectTrigger>
                      <SelectContent>
                        {scholars.map((scholar) => (
                          <SelectItem key={scholar.id} value={scholar.id!}>
                            {scholar.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Uniform Pieces - Majorettes */}
              {isMajorettes && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-[#7A1E1E]">Uniform Pieces & Sizing</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Headpiece</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.headpieceSize} onValueChange={(val) => setUniformForm({ ...uniformForm, headpieceSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Dress</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.dressSize} onValueChange={(val) => setUniformForm({ ...uniformForm, dressSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Shoes</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max="20"
                        step="0.5"
                        value={uniformForm.shoesSize}
                        onChange={(e) => setUniformForm({ ...uniformForm, shoesSize: e.target.value.replace(/[^0-9.]/g, '') })}
                        placeholder="e.g., 7"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Uniform Pieces - Glee Club */}
              {isGleeClub && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-[#7A1E1E]">Uniform Pieces & Sizing</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Barong/Polo Type</Label>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={uniformForm.barongType} onValueChange={(val) => setUniformForm({ ...uniformForm, barongType: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Barong A">Barong A</SelectItem>
                          <SelectItem value="Barong B">Barong B</SelectItem>
                          <SelectItem value="Polo Shirt">Polo Shirt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Top Size</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.topSize} onValueChange={(val) => setUniformForm({ ...uniformForm, topSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                          <SelectItem value="XXL">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Pants</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.pantsSize} onValueChange={(val) => setUniformForm({ ...uniformForm, pantsSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                          <SelectItem value="XXL">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Uniform Pieces - Dance Club */}
              {isDanceClub && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-[#7A1E1E]">Uniform Pieces & Sizing</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Top</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.topSize} onValueChange={(val) => setUniformForm({ ...uniformForm, topSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                          <SelectItem value="XXL">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Pants/Bottoms</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.pantsSize} onValueChange={(val) => setUniformForm({ ...uniformForm, pantsSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                          <SelectItem value="XXL">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Shoes</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max="20"
                        step="0.5"
                        value={uniformForm.shoesSize}
                        onChange={(e) => setUniformForm({ ...uniformForm, shoesSize: e.target.value.replace(/[^0-9.]/g, '') })}
                        placeholder="e.g., 7"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Uniform Pieces - Marching Band */}
              {isMarchingBand && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-[#7A1E1E]">Uniform Pieces & Sizing</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Headdress</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.headdressSize} onValueChange={(val) => setUniformForm({ ...uniformForm, headdressSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Top</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.topSize} onValueChange={(val) => setUniformForm({ ...uniformForm, topSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                          <SelectItem value="XXL">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Pants</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={uniformForm.pantsSize} onValueChange={(val) => setUniformForm({ ...uniformForm, pantsSize: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">Extra Small</SelectItem>
                          <SelectItem value="S">Small</SelectItem>
                          <SelectItem value="M">Medium</SelectItem>
                          <SelectItem value="L">Large</SelectItem>
                          <SelectItem value="XL">Extra Large</SelectItem>
                          <SelectItem value="XXL">2X Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Shoes</Label>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max="20"
                        step="0.5"
                        value={uniformForm.bandShoesSize}
                        onChange={(e) => setUniformForm({ ...uniformForm, bandShoesSize: e.target.value.replace(/[^0-9.]/g, '') })}
                        placeholder="e.g., 9"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={handleAssignUniform} className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full">
              <Package className="w-4 h-4 mr-2" />
              Create Uniform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trainee Performance Dialog */}
      <Dialog open={showTraineePerformanceDialog} onOpenChange={setShowTraineePerformanceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[85vw] h-[90vh] max-h-[900px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>Training Progress</DialogTitle>
            <DialogDescription>
              {isMajorettes ? 'Track majorette routines and training progress' : isDanceClub ? 'Track dance routines and training progress' : isGleeClub ? 'Track vocal routines and training progress' : 'Assign instrument and track training modules'}
            </DialogDescription>
          </DialogHeader>
          {selectedTraineePerformance && (() => {
            const traineeId = selectedTraineePerformance.id!;
            const selectedInstrument = traineeInstruments[traineeId] || '';
            const chapters = traineeChapters[traineeId] || {};
            const completedChapters = Object.values(chapters).filter(Boolean).length;
            const totalChapters = 30;
            const overallProgress = Math.round((completedChapters / totalChapters) * 100);

            const attendanceStats = calculateTraineeAttendanceStats(traineeId);
            const attendanceRate = attendanceStats.attendanceRate;
            const totalSessions = attendanceStats.totalSessions;
            const presentCount = attendanceStats.presentCount;
            const absentCount = attendanceStats.absentCount;

            const instruments = [
              'Clarinet',
              'Flute',
              'Trumpet',
              'Alto Sax',
              'Tenor Sax',
              'French Horn',
              'Sousaphone',
              'Percussion',
              'Trombone',
              'Baritone'
            ];

            const voiceParts = [
              'Soprano',
              'Alto',
              'Tenor',
              'Bass'
            ];

            const selectedVoice = traineeVoices[traineeId] || '';

            const handleInstrumentChange = (instrument: string) => {
              const currentChapters = traineeChapters[traineeId] || {};
              setTraineeInstruments(prev => ({
                ...prev,
                [traineeId]: instrument
              }));
              // Initialize chapters if not exist
              if (!traineeChapters[traineeId]) {
                setTraineeChapters(prev => ({
                  ...prev,
                  [traineeId]: {}
                }));
              }
              void persistTraineeTrainingState(traineeId, {
                instrument,
                chapters: currentChapters,
              }).then(() => {
                toast.success(`Instrument assigned: ${instrument}`);
              }).catch((err: any) => {
                toast.error(err?.message || 'Failed to save instrument assignment');
              });
            };

            const handleVoiceChange = (voice: string) => {
              const currentChapters = traineeChapters[traineeId] || {};
              setTraineeVoices(prev => ({
                ...prev,
                [traineeId]: voice
              }));
              // Initialize chapters if not exist
              if (!traineeChapters[traineeId]) {
                setTraineeChapters(prev => ({
                  ...prev,
                  [traineeId]: {}
                }));
              }
              void persistTraineeTrainingState(traineeId, {
                voice,
                chapters: currentChapters,
              }).then(() => {
                toast.success(`Voice assigned: ${voice}`);
              }).catch((err: any) => {
                toast.error(err?.message || 'Failed to save voice assignment');
              });
            };

            const handleChapterToggle = (chapterNum: number) => {
              const nextChapterState = !Boolean(traineeChapters[traineeId]?.[chapterNum]);
              const nextChapters = {
                ...(traineeChapters[traineeId] || {}),
                [chapterNum]: nextChapterState,
              };

              setTraineeChapters(prev => ({
                ...prev,
                [traineeId]: {
                  ...(prev[traineeId] || {}),
                  [chapterNum]: nextChapterState
                }
              }));

              void persistTraineeTrainingState(traineeId, {
                chapters: nextChapters,
              }).catch((err: any) => {
                toast.error(err?.message || 'Failed to save module progress');
              });
            };

            return (
              <div className="flex-1 flex flex-col overflow-hidden px-3 sm:px-6">
                {/* Trainee Info Header - Sticky */}
                <div className="shrink-0 bg-white pb-4 border-b border-[#e0e0e0]">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-[#6c757d]">Trainee Name</Label>
                        <p className="font-medium">{selectedTraineePerformance.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-[#6c757d]">{isMajorettes || isDanceClub || isGleeClub ? 'Routines Finished' : 'Modules Finished'}</Label>
                        <p className="font-medium text-xl text-[#7A1E1E]">{completedChapters}/{totalChapters}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-[#6c757d]">Attendance Rate</Label>
                        <p className={`font-medium text-xl ${
                          attendanceRate >= 90 ? 'text-green-600' :
                          attendanceRate >= 75 ? 'text-[#7A1E1E]' :
                          'text-red-600'
                        }`}>
                          {attendanceRate}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-[#6c757d]">Overall Progress</Label>
                        <p className="font-medium text-xl text-[#7A1E1E]">{overallProgress}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Evaluate Button - Top Section */}
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => {
                        setShowTraineePerformanceDialog(false);
                        setSelectedTrainee(selectedTraineePerformance);
                        setShowEvaluationDialog(true);
                      }}
                      className="bg-[#7A1E1E] hover:bg-[#6A1919] disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                      disabled={completedChapters < totalChapters}
                      title={completedChapters < totalChapters ? `Complete all ${totalChapters} modules before evaluating (${completedChapters}/${totalChapters} done)` : 'Proceed to evaluate this trainee'}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Proceed to Evaluate
                    </Button>
                  </div>
                </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                <div className="space-y-6 pt-4">

                  {/* Instrument Assignment - Only for Marching Band */}
                  {isMarchingBand && (
                    <div>
                      <h3 className="text-[#7A1E1E] mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Instrument Assignment
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Label>Select Instrument</Label>
                        <Select value={selectedInstrument} onValueChange={handleInstrumentChange}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose an instrument..." />
                          </SelectTrigger>
                          <SelectContent>
                            {instruments.map(instrument => (
                              <SelectItem key={instrument} value={instrument}>
                                {instrument}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Voice Assignment - Only for Glee Club */}
                  {isGleeClub && (
                    <div>
                      <h3 className="text-[#7A1E1E] mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Voice Assignment
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Label>Select Voice Part</Label>
                        <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose a voice part..." />
                          </SelectTrigger>
                          <SelectContent>
                            {voiceParts.map(voice => (
                              <SelectItem key={voice} value={voice}>
                                {voice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Training Modules/Routines */}
                  {(isMajorettes || isDanceClub || selectedVoice || selectedInstrument) ? (
                    <div>
                      <h3 className="text-[#7A1E1E] mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {isMajorettes ? 'Majorette Routines' : isDanceClub ? 'Dance Routines' : isGleeClub ? 'Vocal Routines' : `Training Modules - ${selectedInstrument}`}
                      </h3>
                      
                      {/* Progress Overview */}
                      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#6c757d]">{isMajorettes || isDanceClub ? 'Overall Routine Progress' : 'Overall Module Progress'}</span>
                          <span className="font-medium text-[#7A1E1E]">{completedChapters}/{totalChapters} {isMajorettes || isDanceClub ? 'Routines' : 'Chapters'}</span>
                        </div>
                        <Progress value={overallProgress} className="h-3" />
                      </div>

                      <Separator className="mb-6" />
                      {/* Attendance Summary */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Attendance Summary</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-[#6c757d]">Total Sessions</p>
                            <p className="text-2xl font-bold">{totalSessions}</p>
                          </div>
                          <Calendar className="w-8 h-8 text-[#6c757d]" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-[#6c757d]">Present</p>
                            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-[#6c757d]">Absent</p>
                            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-[#6c757d]">Attendance Rate</p>
                            <p className={`text-2xl font-bold ${
                              attendanceRate >= 90 ? 'text-green-600' :
                              attendanceRate >= 75 ? 'text-[#7A1E1E]' :
                              'text-red-600'
                            }`}>
                              {attendanceRate}%
                            </p>
                          </div>
                          <TrendingUp className={`w-8 h-8 ${
                            attendanceRate >= 90 ? 'text-green-600' :
                            attendanceRate >= 75 ? 'text-[#7A1E1E]' :
                            'text-red-600'
                          }`} />
                        </div>
                      </div>
                      </div>

                      <Separator className="mb-6" />

                      {/* 30 Chapters/Routines as Checkboxes */}
                      <div>
                        <h4 className="font-medium mb-3">{isMajorettes ? 'Training Routines' : 'Training Chapters'}</h4>
                        <p className="text-xs text-[#6c757d] mb-3">Complete chapters sequentially. Each chapter must pass evaluation before the next unlocks.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Array.from({ length: 30 }, (_, i) => i + 1).map(chapterNum => {
                            const isChecked = chapters[chapterNum] || false;
                            const isLocked = isChapterLocked(traineeId, chapterNum);
                            const evaluation = chapterEvaluations[traineeId]?.[chapterNum];
                            const hasPassed = evaluation?.passed;

                            return (
                              <div 
                                key={chapterNum} 
                                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                                  isLocked
                                    ? 'border-[#d4d4d8] bg-gray-50 opacity-60 cursor-not-allowed'
                                    : isChecked 
                                    ? 'border-[#7A1E1E] bg-[#7A1E1E]/5 cursor-pointer hover:border-[#7A1E1E] hover:shadow-sm' 
                                    : 'border-[#e0e0e0] hover:border-[#7A1E1E]/30 cursor-pointer'
                                }`}
                                onClick={() => {
                                  if (isLocked) {
                                    toast.info(`Chapter ${chapterNum} is locked. Complete and evaluate Chapter ${chapterNum - 1} first before proceeding.`);
                                    return;
                                  }
                                  if (isChecked) {
                                    setSelectedChapterForEval({ traineeId, chapterNum });
                                    setChapterEvalForm({ score: evaluation?.score || 0, notes: evaluation?.notes || '', passed: evaluation?.passed || true });
                                    setShowChapterEvalDialog(true);
                                  }
                                }}
                              >
                                <Checkbox
                                  id={`chapter-${traineeId}-${chapterNum}`}
                                  checked={isChecked}
                                  onCheckedChange={() => {
                                    if (!isLocked) {
                                      handleChapterToggle(chapterNum);
                                    }
                                  }}
                                  disabled={isLocked}
                                  className="border-[#7A1E1E] data-[state=checked]:bg-[#7A1E1E]"
                                />
                                <div className="flex-1">
                                  <Label 
                                    htmlFor={`chapter-${traineeId}-${chapterNum}`}
                                    className={`cursor-pointer flex items-center gap-2 ${
                                      isLocked ? 'text-[#999]' : isChecked ? 'text-[#7A1E1E] font-medium' : ''
                                    }`}
                                  >
                                    Chapter {chapterNum}: {getChapterTitle(chapterNum)}
                                    {isChecked && hasPassed && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    {isChecked && !hasPassed && evaluation && <span className="text-xs text-yellow-600">⚠ Needs Review</span>}
                                  </Label>
                                </div>
                                {!isLocked && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedChapterForEval({ traineeId, chapterNum });
                                      setChapterEvalForm({ score: evaluation?.score || 0, notes: evaluation?.notes || '', passed: evaluation?.passed || true });
                                      setShowChapterEvalDialog(true);
                                    }}
                                  >
                                    {isChecked ? 'Re-evaluate' : 'Evaluate'}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert className="border-yellow-500 bg-yellow-50">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        {isMarchingBand && 'Please assign an instrument first to view and track training modules.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Deactivate Warning Dialog */}
      <Dialog open={showDeactivateWarning} onOpenChange={setShowDeactivateWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#7A1E1E]">
              <AlertCircle className="w-5 h-5" />
              Confirm Deactivation
            </DialogTitle>
            <DialogDescription>
              You are about to deactivate {traineeToDeactivate?.name}.
            </DialogDescription>
          </DialogHeader>
          <Alert className="bg-[#7A1E1E]/5 border-[#7A1E1E]/20">
            <AlertCircle className="h-4 w-4 text-[#7A1E1E]" />
            <AlertDescription className="text-[#1A1A1A]">
              <p className="mb-2">This action will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Remove them from the active trainees list</li>
                <li>Prevent them from appearing in training rosters</li>
                <li>Stop including them in attendance checks</li>
                <li>Mark them as deactivated in the system</li>
              </ul>
            </AlertDescription>
          </Alert>
          <p className="text-sm text-[#6c757d]">
            You can reactivate them later from the Settings → Administration → Deactivated Members section if needed.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
              onClick={() => {
                setShowDeactivateWarning(false);
                setTraineeToDeactivate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white"
              onClick={() => {
                if (traineeToDeactivate && onUpdateUser) {
                  // Update user's training status to 'failed' so they appear in Settings deactivated list
                  onUpdateUser(traineeToDeactivate.id!, { trainingStatus: 'failed' });
                  setDeactivatedTrainees(prev => [...prev, traineeToDeactivate]);
                  toast.success(`${traineeToDeactivate.name} has been deactivated`);
                  setShowDeactivateWarning(false);
                  setTraineeToDeactivate(null);
                  setShowTraineeDialog(false);
                }
              }}
            >
              Deactivate Trainee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      <EvaluationFormDialog
        open={showEvaluationDialog}
        onOpenChange={setShowEvaluationDialog}
        selectedTrainee={selectedTrainee!}
        evaluationForm={evaluationForm as any}
        setEvaluationForm={setEvaluationForm as any}
        onSubmit={handleSubmitEvaluation}
        calculateSectionATotal={calculateSectionATotal}
        calculateSectionAAverage={calculateSectionAAverage}
        calculateSectionBTotal={calculateSectionBTotal}
        calculateSectionBAverage={calculateSectionBAverage}
        calculateSectionCTotal={calculateSectionCTotal}
        calculateSectionCAverage={calculateSectionCAverage}
        calculateOverallRating={calculateOverallRating}
        getAdjectivalRating={getAdjectivalRating}
        currentUser={user}
        isDisabled={selectedTrainee ? hasUnfinishedChapters(selectedTrainee.id!) : false}
        disabledReason="Complete and evaluate all chapters before the Final Evaluation"
      />

      {/* Assign Instrument Dialog */}
      <Dialog open={showAssignInstrumentDialog} onOpenChange={setShowAssignInstrumentDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Instrument Template</DialogTitle>
            <DialogDescription>Create a new instrument with tracking information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Required Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#7A1E1E]">Required Information</h4>
              <div className="space-y-4">
                <div>
                  <Label>Instrument Type <span className="text-red-600">*</span></Label>
                  <Select value={instrumentForm.instrumentType} onValueChange={(val) => setInstrumentForm({ ...instrumentForm, instrumentType: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instrument type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trumpet">Trumpet</SelectItem>
                      <SelectItem value="Clarinet">Clarinet</SelectItem>
                      <SelectItem value="Trombone">Trombone</SelectItem>
                      <SelectItem value="Saxophone">Saxophone</SelectItem>
                      <SelectItem value="Flute">Flute</SelectItem>
                      <SelectItem value="French Horn">French Horn</SelectItem>
                      <SelectItem value="Tuba">Tuba</SelectItem>
                      <SelectItem value="Snare Drum">Snare Drum</SelectItem>
                      <SelectItem value="Bass Drum">Bass Drum</SelectItem>
                      <SelectItem value="Cymbals">Cymbals</SelectItem>
                      <SelectItem value="Xylophone">Xylophone</SelectItem>
                      <SelectItem value="Mellophone">Mellophone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Brand & Model <span className="text-red-600">*</span></Label>
                  <Input
                    value={instrumentForm.instrumentName}
                    onChange={(e) => setInstrumentForm({ ...instrumentForm, instrumentName: e.target.value })}
                    placeholder="e.g., Yamaha YTR-2330"
                  />
                </div>
                <div>
                  <Label>Serial Number <span className="text-red-600">*</span></Label>
                  <Input
                    value={instrumentForm.serialNumber}
                    onChange={(e) => setInstrumentForm({ ...instrumentForm, serialNumber: e.target.value })}
                    placeholder="e.g., INS-TRPT-001"
                  />
                </div>
                <div>
                  <Label>Condition</Label>
                  <Input
                    value="Good"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically set to good condition for new instruments</p>
                </div>
                <div>
                  <Label>Property Type <span className="text-red-600">*</span></Label>
                  <Select value={instrumentForm.propertyType} onValueChange={(val) => setInstrumentForm({ ...instrumentForm, propertyType: val as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unc-property">UNC Property</SelectItem>
                      <SelectItem value="own-property">Personal Owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned Scholar (Optional)</Label>
                  <Select value={instrumentForm.assignedTo} onValueChange={(val) => setInstrumentForm({ ...instrumentForm, assignedTo: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scholar" />
                    </SelectTrigger>
                    <SelectContent>
                      {scholars.map((scholar) => (
                        <SelectItem key={scholar.id} value={scholar.id!}>
                          {scholar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignInstrument} className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full">
              <Music className="w-4 h-4 mr-2" />
              Create Instrument
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Accessory Dialog */}
      <Dialog open={showAssignAccessoryDialog} onOpenChange={setShowAssignAccessoryDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Accessory Template</DialogTitle>
            <DialogDescription>Create a new accessory with tracking information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Required Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#7A1E1E]">Required Information</h4>
              <div className="space-y-4">
                <div>
                  <Label>Accessory Name <span className="text-red-600">*</span></Label>
                  <Input
                    value={accessoryForm.accessoryName}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, accessoryName: e.target.value })}
                    placeholder={isMajorettes ? "e.g., Performance Baton" : "e.g., Ceremonial Plume"}
                  />
                </div>
                <div>
                  <Label>Accessory Type <span className="text-red-600">*</span></Label>
                  <Input
                    value={accessoryForm.accessoryType}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, accessoryType: e.target.value })}
                    placeholder={isMajorettes ? "e.g., Baton" : "e.g., Plume"}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={accessoryForm.description}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, description: e.target.value })}
                    placeholder={isMajorettes ? "e.g., Professional 26-inch performance baton" : "e.g., Red and gold feather plume"}
                  />
                </div>
                <div>
                  <Label>Quantity <span className="text-red-600">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    max="9999"
                    step="1"
                    inputMode="numeric"
                    value={accessoryForm.quantity}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      const parsed = parseInt(digitsOnly, 10);
                      setAccessoryForm({ ...accessoryForm, quantity: Number.isNaN(parsed) ? 1 : Math.min(9999, Math.max(1, parsed)) });
                    }}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignAccessory} className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full">
              <Package className="w-4 h-4 mr-2" />
              Create Accessory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Engagement Attendance Dialog - Landscape */}
      <Dialog open={showEngagementAttendanceDialog} onOpenChange={setShowEngagementAttendanceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Manage Event Attendance</DialogTitle>
                <DialogDescription>
                  Track scholar attendance for {selectedEngagement?.eventName}
                </DialogDescription>
              </div>
              <Button onClick={() => {
                setShowEngagementAttendanceDialog(false);
                toast.success('Attendance saved successfully');
              }} className="bg-[#7A1E1E] hover:bg-[#6A1919] mr-12">
                Save Attendance
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            {/* Event Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm text-[#7A1E1E] mb-3">Event Information</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-[#6c757d] mb-1">Event Name</p>
                  <p className="text-sm">{selectedEngagement?.eventName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6c757d] mb-1">Date</p>
                  <p className="text-sm">{selectedEngagement?.date?.toLocaleDateString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6c757d] mb-1">Time</p>
                  <p className="text-sm">{selectedEngagement?.time || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6c757d] mb-1">Location</p>
                  <p className="text-sm">{selectedEngagement?.venue || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Scholar Attendance */}
            <div>
              <h4 className="text-sm text-[#7A1E1E] mb-3">Scholar Attendance</h4>
              <div className="border border-[#e0e0e0] rounded-lg overflow-auto max-h-[420px]">
                  <Table className="min-w-max">
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-[#6c757d] bg-gray-50">Scholar Name</TableHead>
                        <TableHead className="text-[#6c757d] bg-gray-50">Student ID</TableHead>
                        <TableHead className="text-center text-[#6c757d] bg-gray-50">Mark as Present</TableHead>
                        <TableHead className="text-center text-[#6c757d] bg-gray-50">Status</TableHead>
                        <TableHead className="text-[#6c757d] bg-gray-50">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scholars.length > 0 ? (
                        scholars.map((scholar) => {
                          const attendeeData = selectedEngagement?.attendanceRecords?.[0]?.attendees[scholar.id!];
                          const isPresent = typeof attendeeData === 'object' ? attendeeData.status : (typeof attendeeData === 'string' ? attendeeData === 'present' : (attendeeData || false));
                          const timestamp = typeof attendeeData === 'object' ? attendeeData.timestamp : undefined;
                          return (
                            <TableRow key={scholar.id} className="border-b border-[#f0f0f0]">
                              <TableCell>{scholar.name}</TableCell>
                              <TableCell className="text-[#6c757d]">{scholar.studentId}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={isPresent}
                                    onCheckedChange={() => {
                                      if (selectedEngagement?.attendanceRecords) {
                                        const newAttendees = { ...selectedEngagement.attendanceRecords[0].attendees };
                                        const currentTimestamp = new Date().toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        });
                                        
                                        if (isPresent) {
                                          // If currently present, mark as absent (remove timestamp)
                                          newAttendees[scholar.id!] = { status: false };
                                        } else {
                                          // If currently absent, mark as present with timestamp
                                          newAttendees[scholar.id!] = { status: true, timestamp: currentTimestamp };
                                        }
                                        
                                        setEngagementRequests(prev => prev.map(e =>
                                          e.id === selectedEngagement.id
                                            ? { ...e, attendanceRecords: [{ ...e.attendanceRecords![0], attendees: newAttendees }] }
                                            : e
                                        ));
                                        setSelectedEngagement({
                                          ...selectedEngagement,
                                          attendanceRecords: [{ ...selectedEngagement.attendanceRecords[0], attendees: newAttendees }]
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm text-[#6c757d]">
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-[#6c757d]">
                                {timestamp || '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-[#6c757d] py-8">
                            No scholars found for this talent group
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Attendance Matrix Dialog - Landscape */}
      <Dialog open={showAddDateDialog} onOpenChange={setShowAddDateDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[85vw] h-[90vh] max-h-[900px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>Manage Training Dates</DialogTitle>
            <DialogDescription>
              {trainingAttendance.length === 0 
                ? 'Generate training dates to start tracking attendance' 
                : 'Manage existing training dates or clear all to generate new dates'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 pb-6">
            <div className="space-y-6">
              {/* Auto-generate dates section - Only show when no dates exist */}
              {trainingAttendance.length === 0 && (
              <div className="border border-[#e0e0e0] rounded-lg p-6 space-y-4 bg-white">
                <h4 className="font-medium text-[#7A1E1E]">Generate New Training Dates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#6c757d]">Start Date</Label>
                    <Input
                      type="date"
                      value={dateGenerationForm.startDate}
                      onChange={(e) => setDateGenerationForm({ ...dateGenerationForm, startDate: e.target.value })}
                      className="border-[#D1D5DC] bg-white cursor-pointer mt-1"
                      style={{ colorScheme: 'light' }}
                      min={new Date().toLocaleDateString('en-CA')}
                    />
                  </div>
                  <div>
                    <Label className="text-[#6c757d]">End Date</Label>
                    <Input
                      type="date"
                      value={dateGenerationForm.endDate}
                      onChange={(e) => setDateGenerationForm({ ...dateGenerationForm, endDate: e.target.value })}
                      className="border-[#D1D5DC] bg-white cursor-pointer mt-1"
                      style={{ colorScheme: 'light' }}
                      min={dateGenerationForm.startDate || new Date().toLocaleDateString('en-CA')}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#6c757d]">Select Training Days</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mt-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={dateGenerationForm.trainingDays.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDateGenerationForm({
                                ...dateGenerationForm,
                                trainingDays: [...dateGenerationForm.trainingDays, day]
                              });
                            } else {
                              setDateGenerationForm({
                                ...dateGenerationForm,
                                trainingDays: dateGenerationForm.trainingDays.filter(d => d !== day)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={day} className="text-sm cursor-pointer text-[#6c757d]">{day.slice(0, 3)}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateAttendanceDates}
                  className="w-full bg-[#7A1E1E] hover:bg-[#6A1919]"
                  disabled={!dateGenerationForm.startDate || !dateGenerationForm.endDate || dateGenerationForm.trainingDays.length === 0}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Dates
                </Button>
              </div>
              )}

              {/* Current dates management */}
              {trainingAttendance.length > 0 && (
                <>
                  {/* Add New Dates Section */}
                  <div className="border border-[#e0e0e0] rounded-lg p-6 bg-white space-y-4">
                    <h4 className="font-medium text-[#7A1E1E]">Add New Training Dates</h4>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Label className="text-[#6c757d]">Select Date from Calendar</Label>
                          <Input
                            type="date"
                            value={newAttendanceDate}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (selectedDate && !selectedDatesToAdd.includes(selectedDate)) {
                                setSelectedDatesToAdd([...selectedDatesToAdd, selectedDate]);
                                setNewAttendanceDate('');
                              } else if (selectedDatesToAdd.includes(selectedDate)) {
                                toast.error('Date already selected');
                              }
                            }}
                            className="border-[#D1D5DC] bg-white cursor-pointer mt-1"
                            style={{ colorScheme: 'light' }}
                            min={new Date().toLocaleDateString('en-CA')}
                          />
                        </div>
                      </div>
                      
                      {/* Selected dates to add */}
                      {selectedDatesToAdd.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-[#6c757d]">Selected Dates ({selectedDatesToAdd.length})</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedDatesToAdd.map((date) => (
                              <div key={date} className="flex items-center gap-2 px-3 py-1.5 bg-[#7A1E1E]/10 rounded-md border border-[#7A1E1E]/20">
                                <span className="text-sm text-[#7A1E1E]">
                                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDatesToAdd(selectedDatesToAdd.filter(d => d !== date));
                                  }}
                                  className="h-5 w-5 p-0 hover:bg-[#7A1E1E]/20"
                                >
                                  <X className="w-3 h-3 text-[#7A1E1E]" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                const saveSelectedDates = async () => {
                                  const newDates = selectedDatesToAdd.filter(date =>
                                    !trainingAttendance.some(r => r.date === date)
                                  );

                                  if (newDates.length === 0) {
                                    toast.error('All selected dates already exist');
                                    return;
                                  }

                                  const defaultAttendees = Object.fromEntries(
                                    trainees
                                      .map((t) => {
                                        const id = resolveAttendanceTraineeId(String(t._rawTrainee?.id || t.id));
                                        return id ? [String(id), 'absent'] : null;
                                      })
                                      .filter(Boolean) as Array<[string, 'absent']>
                                  );

                                  for (const date of newDates) {
                                    await syncAttendanceSessionToBackend(date, defaultAttendees, false);
                                  }

                                  await loadTrainingAttendanceFromBackend();
                                  toast.success(`${newDates.length} training date(s) added`);
                                  setSelectedDatesToAdd([]);
                                };

                                void saveSelectedDates().catch((err: any) => {
                                  toast.error(err?.message || 'Failed to add selected dates');
                                });
                              }}
                              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                            >
                              <CalendarPlus className="w-4 h-4 mr-2" />
                              Add {selectedDatesToAdd.length} Date(s)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedDatesToAdd([])}
                              className="border-gray-300"
                            >
                              Clear Selection
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Existing Dates List */}
                  <div className="border border-[#e0e0e0] rounded-lg p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-[#7A1E1E]">Existing Training Dates ({trainingAttendance.length})</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!confirm('Are you sure you want to clear all training dates? This will remove all attendance records.')) {
                            return;
                          }

                          const clearAllAttendance = async () => {
                            await trainingClient.clearAttendance();
                            await loadTrainingAttendanceFromBackend();
                            toast.success('All training dates cleared');
                          };

                          void clearAllAttendance().catch((err: any) => {
                            toast.error(err?.message || 'Failed to clear training dates');
                          });
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {trainingAttendance.map((record, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded border border-gray-200 hover:border-[#7A1E1E] transition-colors">
                            <span className="text-sm text-[#6c757d]">
                              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const deleteAttendanceDate = async () => {
                                  await trainingClient.deleteAttendanceSession(record.date);
                                  await loadTrainingAttendanceFromBackend();
                                  toast.success('Training date removed');
                                };

                                void deleteAttendanceDate().catch((err: any) => {
                                  toast.error(err?.message || 'Failed to remove training date');
                                });
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Report Dialog - Landscape */}
      <Dialog open={showSummaryReportDialog} onOpenChange={setShowSummaryReportDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training Attendance Summary Report</DialogTitle>
            <DialogDescription>
              Complete attendance overview for {getTalentGroupName(directorTalentGroup)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-[#e0e0e0] rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <p className="text-sm text-[#6c757d] mb-2">Total Training Sessions</p>
                    <p className="text-3xl text-[#7A1E1E]">{trainingAttendance.filter(r => !r.noPractice).length}</p>
                  </div>
                </div>
                <div className="border border-[#e0e0e0] rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <p className="text-sm text-[#6c757d] mb-2">Total Trainees</p>
                    <p className="text-3xl text-[#7A1E1E]">{trainees.length}</p>
                  </div>
                </div>
                <div className="border border-[#e0e0e0] rounded-lg p-6 bg-white">
                  <div className="text-center">
                    <p className="text-sm text-[#6c757d] mb-2">Average Attendance Rate</p>
                    <p className="text-3xl text-[#7A1E1E]">
                      {trainees.length > 0 && trainingAttendance.length > 0
                        ? Math.round(
                            trainees.reduce((sum, t) => {
                              const practiceDays = trainingAttendance.filter(r => !r.noPractice);
                              const presentCount = practiceDays.filter(r => r.attendees[t.id!] === 'present').length;
                              return sum + (practiceDays.length > 0 ? (presentCount / practiceDays.length) * 100 : 0);
                            }, 0) / trainees.length
                          )
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Top 3 Attendance Performers */}
              <div className="border border-[#e0e0e0] rounded-lg p-6 bg-white">
                <h3 className="text-[#7A1E1E] mb-4">Top 3 Attendance Performers</h3>
                <div className="space-y-3">
                  {trainees
                    .map((trainee) => {
                      const practiceDays = trainingAttendance.filter(r => !r.noPractice);
                      const presentCount = practiceDays.filter(r => r.attendees[trainee.id!] === 'present').length;
                      const totalSessions = practiceDays.length;
                      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
                      
                      return { trainee, presentCount, totalSessions, percentage };
                    })
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, 3)
                    .map(({ trainee, presentCount, totalSessions, percentage }, index) => (
                      <div key={trainee.id} className="flex items-center justify-between p-4 border border-[#e0e0e0] rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${
                            index === 0 ? 'bg-[#7A1E1E]' : 
                            index === 1 ? 'bg-gray-400' : 
                            'bg-amber-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">{trainee.name}</p>
                            <p className="text-sm text-[#6c757d]">Student ID: {trainee.studentId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-[#7A1E1E]">{percentage}%</p>
                          <p className="text-sm text-[#6c757d]">{presentCount}/{totalSessions} sessions</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSummaryReportDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Report exported successfully');
            }} className="bg-[#7A1E1E] hover:bg-[#6A1919]">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Event Dialog */}
      <Dialog open={showRequestEventDialog} onOpenChange={setShowRequestEventDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request an Event</DialogTitle>
            <DialogDescription>
              Submit an event request to the admin for approval. Once approved, it will be added to your engagement list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                value={eventRequestForm.eventName}
                onChange={(e) => {
                  setEventRequestForm({ ...eventRequestForm, eventName: e.target.value });
                  if (eventFormTouched.eventName) {
                    const error = validateEventField('eventName', e.target.value);
                    setEventFormErrors(prev => ({ ...prev, eventName: error }));
                  }
                }}
                onBlur={() => handleEventFieldBlur('eventName')}
                placeholder="e.g., University Foundation Day"
                className={eventFormTouched.eventName && eventFormErrors.eventName ? 'border-red-600 border-2' : ''}
              />
              {eventFormTouched.eventName && eventFormErrors.eventName && (
                <p className="text-red-600 text-sm mt-1">{eventFormErrors.eventName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventRequestForm.date}
                  onChange={(e) => {
                    setEventRequestForm({ ...eventRequestForm, date: e.target.value });
                    if (eventFormTouched.date) {
                      const error = validateEventField('date', e.target.value);
                      setEventFormErrors(prev => ({ ...prev, date: error }));
                    }
                  }}
                  onBlur={() => handleEventFieldBlur('date')}
                  className={`bg-white cursor-pointer ${eventFormTouched.date && eventFormErrors.date ? 'border-red-600 border-2' : 'border-[#D1D5DC]'}`}
                  style={{ colorScheme: 'light' }}
                />
                {eventFormTouched.date && eventFormErrors.date && (
                  <p className="text-red-600 text-sm mt-1">{eventFormErrors.date}</p>
                )}
              </div>
              <div>
                <Label htmlFor="eventTime">Event Time *</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventRequestForm.time}
                  onChange={(e) => {
                    setEventRequestForm({ ...eventRequestForm, time: e.target.value });
                    if (eventFormTouched.time) {
                      const error = validateEventField('time', e.target.value);
                      setEventFormErrors(prev => ({ ...prev, time: error }));
                    }
                  }}
                  onBlur={() => handleEventFieldBlur('time')}
                  className={`bg-white cursor-pointer ${eventFormTouched.time && eventFormErrors.time ? 'border-red-600 border-2' : 'border-[#D1D5DC]'}`}
                  style={{ colorScheme: 'light' }}
                />
                {eventFormTouched.time && eventFormErrors.time && (
                  <p className="text-red-600 text-sm mt-1">{eventFormErrors.time}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="eventVenue">Venue *</Label>
              <Input
                id="eventVenue"
                value={eventRequestForm.venue}
                onChange={(e) => {
                  setEventRequestForm({ ...eventRequestForm, venue: e.target.value });
                  if (eventFormTouched.venue) {
                    const error = validateEventField('venue', e.target.value);
                    setEventFormErrors(prev => ({ ...prev, venue: error }));
                  }
                }}
                onBlur={() => handleEventFieldBlur('venue')}
                placeholder="e.g., UNC Main Auditorium"
                className={eventFormTouched.venue && eventFormErrors.venue ? 'border-red-600 border-2' : ''}
              />
              {eventFormTouched.venue && eventFormErrors.venue && (
                <p className="text-red-600 text-sm mt-1">{eventFormErrors.venue}</p>
              )}
            </div>

            <div>
              <Label htmlFor="eventDescription">Event Description *</Label>
              <Textarea
                id="eventDescription"
                value={eventRequestForm.description}
                onChange={(e) => {
                  setEventRequestForm({ ...eventRequestForm, description: e.target.value });
                  if (eventFormTouched.description) {
                    const error = validateEventField('description', e.target.value);
                    setEventFormErrors(prev => ({ ...prev, description: error }));
                  }
                }}
                onBlur={() => handleEventFieldBlur('description')}
                placeholder="Describe the event, performance requirements, and any special notes..."
                rows={4}
                className={eventFormTouched.description && eventFormErrors.description ? 'border-red-600 border-2' : ''}
              />
              {eventFormTouched.description && eventFormErrors.description && (
                <p className="text-red-600 text-sm mt-1">{eventFormErrors.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="eventAttachment">Attachment (Optional)</Label>
              <Input
                id="eventAttachment"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // In production, this would upload to storage and return a URL
                    setEventRequestForm({ ...eventRequestForm, attachment: file.name });
                  }
                }}
                className="bg-white cursor-pointer border-[#D1D5DC]"
              />
              <p className="text-xs text-[#6c757d] mt-1">
                Accepted formats: PDF, Word documents, or images (Max 10MB)
              </p>
              {eventRequestForm.attachment && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#7A1E1E]">
                  <FileText className="w-4 h-4" />
                  <span>{eventRequestForm.attachment}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#6c757d] hover:text-red-600"
                    onClick={() => setEventRequestForm({ ...eventRequestForm, attachment: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This request will be sent to the admin for review. You will be notified once it's approved or denied.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRequestEventDialog(false)}
              disabled={isSubmittingEvent}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestEvent} 
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
              disabled={isSubmittingEvent}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmittingEvent ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Latest Update Dialog */}
      <Dialog open={showLatestUpdateDialog} onOpenChange={setShowLatestUpdateDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Latest Update</DialogTitle>
            <DialogDescription>
              Share news, achievements, and important announcements that will appear on the landing page
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="updateCategory">Category *</Label>
                <select
                  id="updateCategory"
                  value={latestUpdateForm.category}
                  onChange={(e) => {
                    setLatestUpdateForm({ ...latestUpdateForm, category: e.target.value });
                    if (updateFormTouched.category) {
                      const error = validateUpdateField('category', e.target.value);
                      setUpdateFormErrors(prev => ({ ...prev, category: error }));
                    }
                  }}
                  onBlur={() => handleUpdateFieldBlur('category')}
                  className={`w-full h-10 px-3 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1E1E] focus:border-transparent ${
                    updateFormTouched.category && updateFormErrors.category ? 'border-red-600 border-2' : 'border border-[#D1D5DC]'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Application Open">Application Open</option>
                  <option value="Event">Event</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Training">Training</option>
                </select>
                {updateFormTouched.category && updateFormErrors.category && (
                  <p className="text-red-600 text-sm mt-1">{updateFormErrors.category}</p>
                )}
              </div>
              <div>
                <Label htmlFor="updateDate">Date *</Label>
                <Input
                  id="updateDate"
                  type="date"
                  value={latestUpdateForm.date}
                  onChange={(e) => {
                    setLatestUpdateForm({ ...latestUpdateForm, date: e.target.value });
                    if (updateFormTouched.date) {
                      const error = validateUpdateField('date', e.target.value);
                      setUpdateFormErrors(prev => ({ ...prev, date: error }));
                    }
                  }}
                  onBlur={() => handleUpdateFieldBlur('date')}
                  className={`bg-white cursor-pointer ${
                    updateFormTouched.date && updateFormErrors.date ? 'border-red-600 border-2' : 'border-[#D1D5DC]'
                  }`}
                  style={{ colorScheme: 'light' }}
                />
                {updateFormTouched.date && updateFormErrors.date && (
                  <p className="text-red-600 text-sm mt-1">{updateFormErrors.date}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="updateTitle">Title *</Label>
              <Input
                id="updateTitle"
                value={latestUpdateForm.title}
                onChange={(e) => {
                  setLatestUpdateForm({ ...latestUpdateForm, title: e.target.value });
                  if (updateFormTouched.title) {
                    const error = validateUpdateField('title', e.target.value);
                    setUpdateFormErrors(prev => ({ ...prev, title: error }));
                  }
                }}
                onBlur={() => handleUpdateFieldBlur('title')}
                placeholder="e.g., UNC Band Wins Peñafrancia Exhibition"
                maxLength={80}
                className={updateFormTouched.title && updateFormErrors.title ? 'border-red-600 border-2' : ''}
              />
              {updateFormTouched.title && updateFormErrors.title ? (
                <p className="text-red-600 text-sm mt-1">{updateFormErrors.title}</p>
              ) : (
                <p className="text-xs text-[#6c757d] mt-1">{latestUpdateForm.title.length}/80 characters</p>
              )}
            </div>

            <div>
              <Label htmlFor="updateDescription">Description *</Label>
              <Textarea
                id="updateDescription"
                value={latestUpdateForm.description}
                onChange={(e) => {
                  setLatestUpdateForm({ ...latestUpdateForm, description: e.target.value });
                  if (updateFormTouched.description) {
                    const error = validateUpdateField('description', e.target.value);
                    setUpdateFormErrors(prev => ({ ...prev, description: error }));
                  }
                }}
                onBlur={() => handleUpdateFieldBlur('description')}
                placeholder="Provide details about the update. This will be displayed on the landing page..."
                rows={4}
                maxLength={250}
                className={updateFormTouched.description && updateFormErrors.description ? 'border-red-600 border-2' : ''}
              />
              {updateFormTouched.description && updateFormErrors.description ? (
                <p className="text-red-600 text-sm mt-1">{updateFormErrors.description}</p>
              ) : (
                <p className="text-xs text-[#6c757d] mt-1">{latestUpdateForm.description.length}/250 characters</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This update will be immediately visible on the public landing page and represents your talent group: {getTalentGroupName(directorTalentGroup)}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLatestUpdateDialog(false)}
              disabled={isSubmittingUpdate}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLatestUpdate} 
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
              disabled={isSubmittingUpdate}
            >
              <FileText className="w-4 h-4 mr-2" />
              {isSubmittingUpdate ? 'Posting...' : 'Post Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Latest Update Dialog */}
      <Dialog open={showEditUpdateDialog} onOpenChange={setShowEditUpdateDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Latest Update</DialogTitle>
            <DialogDescription>
              Update the information for this announcement
            </DialogDescription>
          </DialogHeader>
          {editingUpdate && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editUpdateCategory">Category *</Label>
                  <select
                    id="editUpdateCategory"
                    value={editingUpdate.category}
                    onChange={(e) => setEditingUpdate({ ...editingUpdate, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-white text-sm border border-[#D1D5DC] focus:outline-none focus:ring-2 focus:ring-[#7A1E1E] focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Application Open">Application Open</option>
                    <option value="Event">Event</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Training">Training</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="editUpdateDate">Date *</Label>
                  <Input
                    id="editUpdateDate"
                    type="date"
                    value={editingUpdate.date}
                    onChange={(e) => setEditingUpdate({ ...editingUpdate, date: e.target.value })}
                    className="bg-white cursor-pointer border-[#D1D5DC]"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editUpdateTitle">Title *</Label>
                <Input
                  id="editUpdateTitle"
                  value={editingUpdate.title}
                  onChange={(e) => setEditingUpdate({ ...editingUpdate, title: e.target.value })}
                  placeholder="e.g., UNC Band Wins Peñafrancia Exhibition"
                  maxLength={80}
                />
                <p className="text-xs text-[#6c757d] mt-1">{editingUpdate.title.length}/80 characters</p>
              </div>

              <div>
                <Label htmlFor="editUpdateDescription">Description *</Label>
                <Textarea
                  id="editUpdateDescription"
                  value={editingUpdate.description}
                  onChange={(e) => setEditingUpdate({ ...editingUpdate, description: e.target.value })}
                  placeholder="Provide details about the update..."
                  rows={4}
                  maxLength={250}
                />
                <p className="text-xs text-[#6c757d] mt-1">{editingUpdate.description.length}/250 characters</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditUpdateDialog(false);
                setEditingUpdate(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateEdit} 
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              <Edit className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scholar Details Dialog */}
      <Dialog open={showScholarDialog} onOpenChange={setShowScholarDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[680px] max-h-[90vh] flex flex-col overflow-hidden" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="text-[#7A1E1E] text-[18px] font-bold">Scholar Profile</DialogTitle>
            <DialogDescription className="text-[#6C757D] text-[13px]">
              Complete scholar information
            </DialogDescription>
          </DialogHeader>
            {selectedScholarProfileLoading && (
              <div className="text-sm text-[#6c757d] px-1">Loading scholar profile details from backend...</div>
            )}
          {selectedScholar && (
            <ScrollArea className="flex-1 overflow-y-auto pr-3">
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-[#E0E0E0]">
                  <div className="w-16 h-16 rounded-lg bg-[#7A1E1E]/10 border-2 border-[#7A1E1E]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <User className="w-8 h-8 text-[#7A1E1E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#1A1A1A] text-[18px] font-bold truncate">{selectedScholar.name}</h3>
                    <p className="text-[#6C757D] text-[13px] mt-0.5">{selectedScholar.studentId || 'No student ID'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-transparent text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                    onClick={() => setShowScholarDialog(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-[#7A1E1E] text-[15px] font-bold mb-3 pb-1 border-b border-[#F0E0E0] flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-lg border border-[#E0E0E0]">
                    <div>
                      <Label className="text-sm text-[#6c757d] font-bold">Full Name</Label>
                      <p className="font-medium break-words">{selectedScholar.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Student ID</Label>
                      <p className="font-medium">{selectedScholar.studentId}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm text-[#6c757d]">Email Address</Label>
                      <p className="font-medium break-words">{selectedScholar.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Contact Number</Label>
                      <p className="font-medium">{selectedScholar.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Gender</Label>
                      <p className="font-medium">{selectedScholar.gender || selectedScholarApplication?.applicant_gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Birthdate</Label>
                      <p className="font-medium">{selectedScholarBirthdate ? new Date(selectedScholarBirthdate).toLocaleDateString() : 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Age</Label>
                      <p className="font-medium">{selectedScholarAge || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Social Media</Label>
                      <p className="font-medium">{selectedScholar.socialMedia || (selectedScholarApplication as any)?.social_media || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm text-[#6c757d]">Home Address</Label>
                      <p className="font-medium">{selectedScholar.address || selectedScholarApplication?.residing_address || selectedScholarApplication?.applicant_address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Academic Information */}
                <div>
                  <h3 className="text-[#7A1E1E] text-[15px] font-bold mb-3 pb-1 border-b border-[#F0E0E0] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-lg border border-[#E0E0E0]">
                    <div>
                      <Label className="text-sm text-[#6c757d]">Year Level</Label>
                      <p className="font-medium">{selectedScholar.yearLevel || selectedScholarApplication?.applicant_year_level || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Status</Label>
                      <Badge className="bg-[#7A1E1E]">{selectedScholar.role === 'scholar' ? 'Active' : selectedScholar.role}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Course/Program</Label>
                      <p className="font-medium">{selectedScholar.course || selectedScholarApplication?.applicant_course || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Department</Label>
                      <p className="font-medium">{selectedScholar.department || selectedScholarApplication?.applicant_department || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Scholarship Information */}
                <div>
                  <h3 className="text-[#7A1E1E] text-[15px] font-bold mb-3 pb-1 border-b border-[#F0E0E0] flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Scholarship Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-lg border border-[#E0E0E0]">
                    <div>
                      <Label className="text-sm text-[#6c757d]">Talent Group</Label>
                      <p className="font-medium">{getTalentGroupName(selectedScholar.talentGroup || '')}</p>
                    </div>
                    {selectedScholarTalentGroup === 'glee-club' && (
                      <div>
                        <Label className="text-sm text-[#6c757d]">Assigned Voice</Label>
                        <p className="font-medium">{traineeVoices[selectedScholar.id!] || 'Not assigned'}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-[#6c757d]">Scholarship Percentage</Label>
                      <p className="font-medium text-[#7A1E1E] text-xl">{selectedScholarScholarship}%</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Account Role</Label>
                      <Badge variant="outline" className="border-[#7A1E1E] text-[#7A1E1E]">Scholar</Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Member Status</Label>
                      <Badge className={selectedScholar.role === 'scholar' ? 'bg-green-600' : 'bg-gray-500'}>
                        {selectedScholar.role === 'scholar' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Join Date</Label>
                      <p className="font-medium">{(selectedScholar as any).createdAt ? new Date((selectedScholar as any).createdAt).toLocaleDateString() : (selectedScholarApplication?.applied_at ? new Date(selectedScholarApplication.applied_at).toLocaleDateString() : 'Not provided')}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact Information */}
                <div>
                  <h3 className="text-[#7A1E1E] text-[15px] font-bold mb-3 pb-1 border-b border-[#F0E0E0] flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Emergency Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-lg border border-[#E0E0E0]">
                    <div>
                      <Label className="text-sm text-[#6c757d]">Emergency Contact Name</Label>
                      <p className="font-medium">{selectedScholar.emergencyContactName || selectedScholarApplication?.guardian_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Relationship</Label>
                      <p className="font-medium">{selectedScholar.emergencyContactRelationship || selectedScholarApplication?.guardian_relationship || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Emergency Contact Number</Label>
                      <p className="font-medium">{selectedScholar.emergencyContactPhone || selectedScholarApplication?.guardian_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-[#6c757d]">Alternative Contact</Label>
                      <p className="font-medium">{selectedScholar.emergencyPhone || selectedScholarApplication?.applicant_phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {!isDanceClub && <Separator />}

                {/* Assigned Uniforms */}
                {!isDanceClub && (
                  <div>
                    <h3 className="text-[#7A1E1E] mb-3 flex items-center gap-2">
                      <Shirt className="w-5 h-5" />
                      Assigned Uniforms
                    </h3>
                    {inventoryItems.filter(item => item.userId === selectedScholar.id && item.type === 'uniform').length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {inventoryItems.filter(item => item.userId === selectedScholar.id && item.type === 'uniform').map((uniform) => (
                          <div key={uniform.id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <p className="font-medium">{uniform.itemName || uniform.name}</p>
                            <div className="text-sm text-[#6c757d] mt-2 space-y-1">
                              <div>S/N: <strong>{uniform.serialNumber}</strong></div>
                              <div>Condition: <strong className={
                                uniform.condition === 'excellent' ? 'text-green-600' :
                                uniform.condition === 'good' ? 'text-blue-600' :
                                uniform.condition === 'fair' ? 'text-yellow-600' :
                                'text-red-600'
                              }>{uniform.condition}</strong></div>
                              {uniform.assignedDate && (
                                <div>{new Date(uniform.assignedDate).toLocaleDateString()}</div>
                              )}
                            </div>
                            <Badge variant="outline" className="border-green-500 text-green-700 mt-2">
                              {uniform.status || 'Issued'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-[#6c757d] py-6 bg-gray-50 rounded-lg">
                        No uniforms assigned yet
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Attendance */}
                <div>
                  <h3 className="text-[#7A1E1E] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Attendance
                  </h3>

                  {/* Rehearsal Attendance (from engagement module only) */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-[#1a1a1a] mb-2">Rehearsal / Practice</p>
                    {(() => {
                      const scholarId = selectedScholar.id!;
                      const rehearsalSessions = acceptedEngagements.filter(e =>
                        e.type === 'rehearsal' && e.attendanceRecords && e.attendanceRecords.length > 0
                      );
                      const presentCount = rehearsalSessions.filter(e =>
                        e.attendanceRecords!.some(r => {
                          const val = r.attendees[scholarId];
                          return val === true || val === 'present';
                        })
                      ).length;
                      const rate = rehearsalSessions.length > 0 ? Math.round((presentCount / rehearsalSessions.length) * 100) : null;
                      if (rehearsalSessions.length === 0) {
                        return <div className="text-center text-[#6c757d] py-4 bg-gray-50 rounded-lg text-sm">No rehearsal attendance recorded yet</div>;
                      }
                      return (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-6 mb-3">
                            <div><p className="text-[#6c757d] text-xs">Sessions</p><p className="text-[#1a1a1a] font-bold">{rehearsalSessions.length}</p></div>
                            <div><p className="text-[#6c757d] text-xs">Present</p><p className="text-[#1a1a1a] font-bold">{presentCount}</p></div>
                            <div>
                              <p className="text-[#6c757d] text-xs">Rate</p>
                              <p className={`font-bold ${rate! >= 80 ? 'text-green-600' : rate! >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{rate}%</p>
                            </div>
                          </div>
                          <div className="space-y-1 max-h-[160px] overflow-y-auto">
                            {rehearsalSessions.map(record => {
                              const present = record.attendanceRecords!.some(r => {
                                const val = r.attendees[scholarId];
                                return val === true || val === 'present';
                              });
                              return (
                                <div key={record.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                                  <span>{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <Badge className={`text-xs ${present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{present ? 'Present' : 'Absent'}</Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Engagement Attendance */}
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a] mb-2">Engagements</p>
                    {(() => {
                      const scholarId = selectedScholar.id!;
                      const engagementsWithAttendance = acceptedEngagements.filter(e =>
                        e.type !== 'rehearsal' && e.attendanceRecords && e.attendanceRecords.length > 0
                      );
                      if (engagementsWithAttendance.length === 0) {
                        return <div className="text-center text-[#6c757d] py-4 bg-gray-50 rounded-lg text-sm">No engagement attendance recorded yet</div>;
                      }
                      const attendedCount = engagementsWithAttendance.filter(e =>
                        e.attendanceRecords!.some(r => {
                          const v = r.attendees[scholarId];
                          return v === true || v === 'present';
                        })
                      ).length;
                      const rate = Math.round((attendedCount / engagementsWithAttendance.length) * 100);
                      return (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-6 mb-3">
                            <div><p className="text-[#6c757d] text-xs">Events</p><p className="text-[#1a1a1a] font-bold">{engagementsWithAttendance.length}</p></div>
                            <div><p className="text-[#6c757d] text-xs">Attended</p><p className="text-[#1a1a1a] font-bold">{attendedCount}</p></div>
                            <div>
                              <p className="text-[#6c757d] text-xs">Rate</p>
                              <p className={`font-bold ${rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{rate}%</p>
                            </div>
                          </div>
                          <div className="space-y-1 max-h-[160px] overflow-y-auto">
                            {engagementsWithAttendance.map(engagement => {
                              const attended = engagement.attendanceRecords!.some(r => {
                                const v = r.attendees[scholarId];
                                return v === true || v === 'present';
                              });
                              return (
                                <div key={engagement.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                                  <span className="truncate mr-2">{engagement.eventName}</span>
                                  <Badge className={`shrink-0 text-xs ${attended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{attended ? 'Attended' : 'Absent'}</Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {!isDanceClub && <Separator />}

                {/* Assigned Instruments */}
                {selectedScholarTalentGroup === 'marching-band' && (
                  <div>
                    <h3 className="text-[#7A1E1E] mb-3 flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      Assigned Instruments
                    </h3>
                    {inventoryItems.filter(item => String(item.userId) === String(selectedScholar.id) && item.type === 'instrument').length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {inventoryItems.filter(item => String(item.userId) === String(selectedScholar.id) && item.type === 'instrument').map((instrument) => (
                          <div key={instrument.id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <p className="font-medium">{instrument.itemName || instrument.name}</p>
                            <div className="text-sm text-[#6c757d] mt-2 space-y-1">
                              <div>S/N: <strong>{instrument.serialNumber}</strong></div>
                              <div className={
                                instrument.condition === 'excellent' ? 'text-green-600' :
                                instrument.condition === 'good' ? 'text-blue-600' :
                                instrument.condition === 'fair' ? 'text-yellow-600' :
                                'text-red-600'
                              }><strong>{instrument.condition}</strong></div>
                              {instrument.assignedDate && (
                                <div>{new Date(instrument.assignedDate).toLocaleDateString()}</div>
                              )}
                            </div>
                            <Badge variant="outline" className="border-blue-500 text-blue-700 mt-2">
                              {instrument.status || 'In Use'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : selectedScholar.assignedInstrument ? (
                      <div className="border rounded-lg p-4 bg-white shadow-sm">
                        <p className="font-medium">{selectedScholar.assignedInstrument}</p>
                        <div className="text-sm text-[#6c757d] mt-2">Assigned during trainee phase (from backend trainee record)</div>
                      </div>
                    ) : (
                      <div className="text-center text-[#6c757d] py-6 bg-gray-50 rounded-lg">
                        No instruments assigned yet
                      </div>
                    )}
                  </div>
                )}

              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button 
              onClick={() => {
                toast.success('Profile exported successfully');
              }}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Assign Uniform Dialog */}
      <Dialog open={showViewUniformDialog} onOpenChange={setShowViewUniformDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUniform?.status === 'assigned' ? 'View Uniform Set Details' : 'Assign Uniform Set'}</DialogTitle>
            <DialogDescription>
              {selectedUniform?.status === 'assigned' ? 'Complete uniform set information' : 'Assign this uniform set to a scholar'}
            </DialogDescription>
          </DialogHeader>
          {selectedUniform && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-[#6c757d]">Serial Number</Label>
                  <p className="font-medium">{selectedUniform.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Uniform Set</Label>
                  <p className="font-medium">{selectedUniform.uniformSet}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Size</Label>
                  <p className="font-medium">{selectedUniform.size}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Condition</Label>
                  <Select 
                    value={selectedUniform.condition} 
                    onValueChange={(value) => {
                      const updated = { ...selectedUniform, condition: value };
                      setSelectedUniform(updated);
                      if (onUpdateInventoryItem) {
                        onUpdateInventoryItem(selectedUniform.id, { condition: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="bad">Bad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#6c757d]">Pieces Included</Label>
                  <p className="font-medium">{selectedUniform.pieces}</p>
                </div>
                {selectedUniform.status === 'assigned' && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-[#6c757d]">Currently Assigned To</Label>
                    <p className="font-medium">{selectedUniform.assignedTo}</p>
                  </div>
                )}
              </div>
              
              {/* Assignment Section - Always show for both assigned and available */}
              <div className="pt-4 border-t">
                <Label>
                  {selectedUniform.status === 'assigned' ? 'Re-assign To Scholar' : 'Assign To Scholar'}
                </Label>
                <Select value={assignScholarId} onValueChange={setAssignScholarId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scholar" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholars.map((scholar) => (
                      <SelectItem key={scholar.id} value={scholar.id!}>
                        {scholar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => handleAssignInventoryToScholar('uniform')} 
              className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full"
            >
              {selectedUniform?.status === 'assigned' ? 'Update Assignment' : 'Assign Uniform Set'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Assign Instrument Dialog */}
      <Dialog open={showViewInstrumentDialog} onOpenChange={setShowViewInstrumentDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInstrument?.status === 'assigned' ? 'View Instrument Details' : 'Assign Instrument'}</DialogTitle>
            <DialogDescription>
              {selectedInstrument?.status === 'assigned' ? 'Complete instrument information' : 'Assign this instrument to a scholar'}
            </DialogDescription>
          </DialogHeader>
          {selectedInstrument && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-[#6c757d]">Serial Number</Label>
                  <p className="font-medium">{selectedInstrument.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Instrument Type</Label>
                  <p className="font-medium">{selectedInstrument.instrumentType}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Brand</Label>
                  <p className="font-medium">{selectedInstrument.brand}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Model</Label>
                  <p className="font-medium">{selectedInstrument.model}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Condition</Label>
                  <Select 
                    value={selectedInstrument.condition} 
                    onValueChange={(value) => {
                      const updated = { ...selectedInstrument, condition: value };
                      setSelectedInstrument(updated);
                      if (onUpdateInventoryItem) {
                        onUpdateInventoryItem(selectedInstrument.id, { condition: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="bad">Bad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Property Type</Label>
                  {selectedInstrument.propertyType === 'unc-property' ? (
                    <Badge variant="outline" className="border-[#7A1E1E] text-[#7A1E1E]">UNC Property</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-[#6c757d] border border-gray-300">Own Property</Badge>
                  )}
                </div>
                {selectedInstrument.status === 'assigned' && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-[#6c757d]">Currently Assigned To</Label>
                    <p className="font-medium">{selectedInstrument.assignedTo}</p>
                  </div>
                )}
              </div>
              
              {/* Assignment Section - Always show for both assigned and available */}
              <div className="pt-4 border-t">
                <Label>
                  {selectedInstrument.status === 'assigned' ? 'Re-assign To Scholar' : 'Assign To Scholar'}
                </Label>
                <Select value={assignScholarId} onValueChange={setAssignScholarId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scholar" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholars.map((scholar) => (
                      <SelectItem key={scholar.id} value={scholar.id!}>
                        {scholar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => handleAssignInventoryToScholar('instrument')} 
              className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full"
            >
              {selectedInstrument?.status === 'assigned' ? 'Update Assignment' : 'Assign Instrument'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Manage Accessory Dialog */}
      <Dialog open={showViewAccessoryDialog} onOpenChange={setShowViewAccessoryDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Accessory</DialogTitle>
            <DialogDescription>View and edit accessory details</DialogDescription>
          </DialogHeader>
          {selectedAccessory && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#6c757d]">Accessory Name</Label>
                  <p className="font-medium">{selectedAccessory.accessoryName || selectedAccessory.description}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Accessory Type</Label>
                  <p className="font-medium">{selectedAccessory.accessoryType}</p>
                </div>
                <div>
                  <Label className="text-sm text-[#6c757d]">Current Quantity</Label>
                  <p className="font-medium">{selectedAccessory.quantity}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-[#6c757d]">Description</Label>
                  <p className="font-medium">{selectedAccessory.description}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Label>Update Quantity</Label>
                <div className="flex gap-2 mt-2">
                  <Input type="number" min="1" max="9999" step="1" inputMode="numeric" placeholder="Enter new quantity" className="flex-1" />
                  <Button className="bg-[#7A1E1E] hover:bg-[#6A1919]">
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Check Attendance Dialog - Landscape */}
      <Dialog open={showCheckAttendanceDialog} onOpenChange={setShowCheckAttendanceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check Attendance - {selectedAttendanceDate && new Date(selectedAttendanceDate.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</DialogTitle>
            <DialogDescription>
              Mark each trainee as Present (✓), Absent (✖), or Excused (⚪)
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedAttendanceDate && (
                <>
                  {/* No Practice Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-[#e0e0e0]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#7A1E1E]" />
                      <div>
                        <p className="font-medium">Mark as No Practice Day</p>
                        <p className="text-sm text-[#6c757d]">Check this if there was no training on this day</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={trainingAttendance[selectedAttendanceDate.index]?.noPractice || false}
                        onCheckedChange={(checked) => {
                          const updated = [...trainingAttendance];
                          updated[selectedAttendanceDate.index].noPractice = checked as boolean;
                          setTrainingAttendance(updated);
                          toast.success(checked ? 'Marked as no-practice day' : 'Marked as practice day');
                        }}
                      />
                      <span>No Practice</span>
                    </label>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updated = [...trainingAttendance];
                        const attendees: { [key: string]: 'present' | 'absent' | 'excused' } = {};
                        trainees.forEach(trainee => {
                          if (trainee.id) attendees[trainee.id] = 'present';
                        });
                        updated[selectedAttendanceDate.index].attendees = attendees;
                        setTrainingAttendance(updated);
                        toast.success('All trainees marked as present');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark All Present
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const updated = [...trainingAttendance];
                        const attendees: { [key: string]: 'present' | 'absent' | 'excused' } = {};
                        trainees.forEach(trainee => {
                          if (trainee.id) attendees[trainee.id] = 'absent';
                        });
                        updated[selectedAttendanceDate.index].attendees = attendees;
                        setTrainingAttendance(updated);
                        toast.success('All trainees marked as absent');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark All Absent
                    </Button>
                  </div>

                  {/* Trainee Attendance List */}
                  <div className="border border-[#e0e0e0] rounded-lg overflow-auto max-h-[420px]">
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow className="bg-[#7A1E1E] hover:bg-[#7A1E1E]">
                          <TableHead className="text-white">Trainee Name</TableHead>
                          <TableHead className="text-white text-center">Status</TableHead>
                          <TableHead className="text-white text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainingAttendance[selectedAttendanceDate.index]?.noPractice ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12 text-[#6c757d]">
                              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>No practice on this day</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          trainees.map((trainee) => {
                            const currentStatus = trainingAttendance[selectedAttendanceDate.index]?.attendees[trainee.id!] || 'absent';
                            
                            return (
                              <TableRow key={trainee.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#6c757d]" />
                                    {trainee.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {currentStatus === 'present' && (
                                    <Badge className="bg-green-600">Present</Badge>
                                  )}
                                  {currentStatus === 'absent' && (
                                    <Badge variant="destructive">Absent</Badge>
                                  )}
                                  {currentStatus === 'excused' && (
                                    <Badge className="bg-blue-600">Excused</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const updated = [...trainingAttendance];
                                        updated[selectedAttendanceDate.index].attendees[trainee.id!] = 'present';
                                        setTrainingAttendance(updated);
                                      }}
                                      className={`${
                                        currentStatus === 'present' 
                                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                                          : 'bg-gray-200 hover:bg-green-100 text-gray-700'
                                      }`}
                                      title="Mark as Present"
                                    >
                                      ✓ Present
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const updated = [...trainingAttendance];
                                        updated[selectedAttendanceDate.index].attendees[trainee.id!] = 'absent';
                                        setTrainingAttendance(updated);
                                      }}
                                      className={`${
                                        currentStatus === 'absent' 
                                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                                          : 'bg-gray-200 hover:bg-red-100 text-gray-700'
                                      }`}
                                      title="Mark as Absent"
                                    >
                                      ✖ Absent
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const updated = [...trainingAttendance];
                                        updated[selectedAttendanceDate.index].attendees[trainee.id!] = 'excused';
                                        setTrainingAttendance(updated);
                                      }}
                                      className={`${
                                        currentStatus === 'excused' 
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                          : 'bg-gray-200 hover:bg-blue-100 text-gray-700'
                                      }`}
                                      title="Mark as Excused"
                                    >
                                      ⚪ Excused
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckAttendanceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast.success('Attendance saved successfully');
                setShowCheckAttendanceDialog(false);
              }}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={showPerformanceDialog} onOpenChange={setShowPerformanceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden" hideCloseButton>
          {/* Sticky Header */}
          <DialogHeader className="px-4 sm:px-6 py-4 border-b border-[#E0E0E0] shrink-0">
            <DialogTitle className="text-[#7A1E1E] text-base sm:text-lg">Scholar Performance Review</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Track attendance and grade submissions to determine evaluation readiness
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          {selectedScholarForPerformance && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="space-y-5">

                {/* Scholar Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#6c757d]">Scholar Name</p>
                      <p className="text-sm font-medium truncate">{selectedScholarForPerformance.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6c757d]">Student ID</p>
                      <p className="text-sm font-medium">{selectedScholarForPerformance.studentId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6c757d]">Current Scholarship</p>
                      <p className="text-sm font-medium text-[#7A1E1E]">{selectedScholarCurrentScholarship}%</p>
                    </div>
                  </div>
                </div>

                {/* Attendance Record */}
                <div>
                  <h3 className="text-[#7A1E1E] text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Attendance Record
                  </h3>
                  <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-[#6c757d]">Total Sessions</p>
                          <p className="text-xl font-bold">{selectedScholarAttendanceStats.totalSessions}</p>
                        </div>
                        <Calendar className="w-6 h-6 text-[#6c757d]" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-[#6c757d]">Present</p>
                          <p className="text-xl font-bold">{selectedScholarAttendanceStats.presentCount}</p>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-[#6c757d]">Absent</p>
                          <p className="text-xl font-bold">{selectedScholarAttendanceStats.absentCount}</p>
                        </div>
                        <XCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-[#6c757d]">Rate</p>
                          <p className="text-xl font-bold text-[#7A1E1E]">{selectedScholarAttendanceStats.attendanceRate}%</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-[#7A1E1E]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#6c757d] mb-1">Attendance Requirement: 80%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#7A1E1E] h-2.5 rounded-full"
                          style={{ width: `${Math.max(0, Math.min(100, selectedScholarAttendanceStats.attendanceRate))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Evaluation Readiness */}
                <div>
                  <h3 className="text-[#7A1E1E] text-sm font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Evaluation Documents
                  </h3>

                  {/* Uploaded Documents */}
                  <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 sm:p-4 mb-3">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Uploaded Documents ({selectedScholarRenewalDocs.length})
                    </h4>

                    {loadingPerformanceData ? (
                      <p className="text-xs text-[#6c757d]">Loading renewal submissions...</p>
                    ) : selectedScholarRenewalDocs.length === 0 ? (
                      <p className="text-xs text-[#6c757d]">No renewal documents submitted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedScholarRenewalDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-[#6c757d]">
                                {doc.source} · {doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : 'Date N/A'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 px-2 text-xs h-7"
                              onClick={() => {
                                const lower = doc.name.toLowerCase();
                                const inferredType = lower.endsWith('.pdf') ? 'pdf' : 'document';
                                setSelectedAttachment({ name: doc.name, type: inferredType });
                                setShowAttachmentPreview(true);
                              }}
                            >
                              <Eye className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Preview</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Readiness status */}
                  {(() => {
                    const attendanceMet = selectedScholarAttendanceStats.attendanceRate >= 80;
                    const hasRenewalDocs = selectedScholarRenewalDocs.length > 0;
                    const isReadyForEvaluation = attendanceMet && hasRenewalDocs;

                    if (isReadyForEvaluation) {
                      return (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-green-700 mb-1">Ready for Evaluation</p>
                              <p className="text-xs text-green-700">Attendance and renewal documents are complete.</p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                            <XCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-red-700 mb-1">Not Ready for Evaluation</p>
                            <p className="text-xs text-red-600 mb-2">Requirements not fully met</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                {attendanceMet
                                  ? <><CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" /><span className="text-xs text-[#6c757d]">Attendance met ({selectedScholarAttendanceStats.attendanceRate}% ≥ 80%)</span></>
                                  : <><XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /><span className="text-xs text-red-600">Attendance not met ({selectedScholarAttendanceStats.attendanceRate}% &lt; 80%)</span></>
                                }
                              </div>
                              <div className="flex items-center gap-2">
                                {hasRenewalDocs
                                  ? <><CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" /><span className="text-xs text-[#6c757d]">Renewal documents submitted</span></>
                                  : <><XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /><span className="text-xs text-red-600">No renewal documents submitted</span></>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Sticky Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#E0E0E0] shrink-0 flex justify-end">
            <Button
              disabled={loadingPerformanceData || selectedScholarRenewalDocs.length === 0 || selectedScholarAttendanceStats.attendanceRate < 80}
              onClick={() => {
                setShowPerformanceDialog(false);
                setSelectedTrainee(selectedScholarForPerformance);
                setShowEvaluationDialog(true);
              }}
              className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Proceed to Evaluate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachment Preview Dialog */}
      <Dialog open={showAttachmentPreview} onOpenChange={setShowAttachmentPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-7xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E0E0E0]">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7A1E1E]" />
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
                      {/* PDF Preview Placeholder */}
                      <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-[#7A1E1E]" />
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
                    <FileText className="w-16 h-16 mx-auto mb-4 text-[#7A1E1E]" />
                    <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                    <p className="text-sm text-[#6C757D]">{selectedAttachment.name}</p>
                    <p className="text-xs text-[#6C757D] mt-4">
                      Document preview available in production
                    </p>
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
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <DialogContent className="border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A]">Confirm Logout</DialogTitle>
            <DialogDescription className="text-[#6C757D]">
              Are you sure you want to logout? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="min-h-[44px]" onClick={() => setShowLogoutConfirmation(false)}>
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
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
