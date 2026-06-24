import { useState, useEffect, useCallback, type ChangeEvent } from 'react';

interface PsgcItem { code: string; name: string; }
import engagementService from '../services/engagementService';
import scholarshipService from '../services/scholarshipService';
import { api } from '../services/api';
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
  Upload,
  AlertCircle,
  Send,
  Settings,
  Lock
} from './ui/icons';
import type { User as UserType, Application, Event, TrainingRecord, Announcement } from '../App';
import { getTalentGroupColor, getTalentGroupName } from './ui/unc-colors';
import { DocumentsDashboard } from './DocumentsDashboardTabs';
import { Evaluation } from './DirectorDashboardEnhanced';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';
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
  const [scholarProfileLoading, setScholarProfileLoading] = useState(false);
  const [isEditingScholar, setIsEditingScholar] = useState(false);
  const [scholarEditForm, setScholarEditForm] = useState({ name: '', phone: '', yearLevel: '', course: '', department: '', address: '', talentGroup: '' });
  const [isSavingScholar, setIsSavingScholar] = useState(false);
  const [selectedEvent] = useState<any | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [reportGroupFilter, setReportGroupFilter] = useState<string>('all');
  const [eventListFilter, setEventListFilter] = useState<'upcoming' | 'completed'>('upcoming');
  
  // Scholarship renewal state
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null);
  const [showRenewalDetails, setShowRenewalDetails] = useState(false);
  const [scholarshipGroupFilter, setScholarshipGroupFilter] = useState<string>('all');
  const [renewalRows, setRenewalRows] = useState<any[]>([]);
  const [renewalsLoading, setRenewalsLoading] = useState(false);
  const [renewalReviewNotes, setRenewalReviewNotes] = useState('');
  const [isReviewingRenewal, setIsReviewingRenewal] = useState(false);
  
  // Form submission loading state
  const [isCreatingEngagement, setIsCreatingEngagement] = useState(false);
  
  // Attachment preview state
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; type: string } | null>(null);
  const [scholarConnections, setScholarConnections] = useState<{
    traineeProfile: any | null;
    evaluations: any[];
    scholarshipRenewals: any[];
    documents: any[];
    engagements: any[];
  }>({
    traineeProfile: null,
    evaluations: [],
    scholarshipRenewals: [],
    documents: [],
    engagements: [],
  });

  const formatDateLabel = (value?: string | null) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  // Fetch scholar profile data from backend
  const fetchScholarProfile = async (scholarId: string | number) => {
    setScholarProfileLoading(true);
    setScholarConnections({
      traineeProfile: null,
      evaluations: [],
      scholarshipRenewals: [],
      documents: [],
      engagements: [],
    });
    try {
      const response = await api.get<any>(`users/${scholarId}`);
      const data = response?.data?.data || response?.data;
      if (data) {
        const connections = data.connections || {};
        setSelectedScholar((prev) => ({
          ...(prev || {}),
          id: String(data.id ?? prev?.id ?? ''),
          name: data.name ?? prev?.name,
          email: data.email ?? prev?.email,
          role: data.role ?? prev?.role,
          studentId: data.student_id ?? prev?.studentId,
          phone: data.phone ?? prev?.phone,
          talentGroup: data.talent_group ?? prev?.talentGroup,
          yearLevel: data.year_level ?? prev?.yearLevel,
          course: data.course ?? prev?.course,
          department: data.department ?? prev?.department,
          address: data.address ?? prev?.address,
          createdAt: data.created_at ?? prev?.createdAt,
        } as UserType));
        setScholarConnections({
          traineeProfile: connections.trainee_profile ?? null,
          evaluations: Array.isArray(connections.evaluations) ? connections.evaluations : [],
          scholarshipRenewals: Array.isArray(connections.scholarship_renewals) ? connections.scholarship_renewals : [],
          documents: Array.isArray(connections.documents) ? connections.documents : [],
          engagements: Array.isArray(connections.engagements) ? connections.engagements : [],
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch scholar profile:', err);
    } finally {
      setScholarProfileLoading(false);
    }
  };

  const loadScholarshipRenewals = async () => {
    setRenewalsLoading(true);
    try {
      const rows = await scholarshipService.getRenewals();
      setRenewalRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Failed to load scholarship renewals:', err);
      toast.error('Failed to load scholarship renewals');
    } finally {
      setRenewalsLoading(false);
    }
  };

  // Engagement form state
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<'performance' | 'workshop' | 'competition' | 'rehearsal'>('performance');
  const [venue, setVenue] = useState('');
  // PSGC venue address state
  const [venueAddress, setVenueAddress] = useState({ region: '', province: '', city: '', barangay: '', street: '' });
  const [regionOptions, setRegionOptions] = useState<PsgcItem[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<PsgcItem[]>([]);
  const [cityOptions, setCityOptions] = useState<PsgcItem[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<PsgcItem[]>([]);
  const [isLoadingVenueOptions, setIsLoadingVenueOptions] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [description, setDescription] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Array<{ name: string; size: number; type: string }>>([]);

  const getTodayDateValue = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const fetchLocationItems = useCallback(async (endpoint: string, params?: Record<string, string>) => {
    const response = await api.get<{ data?: any[] }>(endpoint, { params });
    const rows = response.data?.data ?? [];
    if (!Array.isArray(rows)) return [] as PsgcItem[];
    return rows
      .map((row: any) => ({ code: String(row.code ?? ''), name: String(row.name ?? '') }))
      .filter((r: PsgcItem) => r.code && r.name)
      .sort((a: PsgcItem, b: PsgcItem) => a.name.localeCompare(b.name));
  }, []);

  // Load regions on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoadingVenueOptions(true);
        const rows = await fetchLocationItems('/locations/regions');
        if (!cancelled) setRegionOptions(rows);
      } catch { /* silent */ } finally {
        if (!cancelled) setIsLoadingVenueOptions(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [fetchLocationItems]);

  // Load provinces when region changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!venueAddress.region) { setProvinceOptions([]); setCityOptions([]); setBarangayOptions([]); return; }
      try {
        setIsLoadingVenueOptions(true);
        const selectedRegion = regionOptions.find(r => r.name === venueAddress.region);
        if (!selectedRegion) return;
        const provinces = await fetchLocationItems('/locations/provinces', { region_code: selectedRegion.code });
        if (cancelled) return;
        setProvinceOptions(provinces);
        setCityOptions([]);
        setBarangayOptions([]);
        if (provinces.length === 0) {
          const regionCities = await fetchLocationItems('/locations/cities', { region_code: selectedRegion.code });
          if (!cancelled) setCityOptions(regionCities);
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setIsLoadingVenueOptions(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [venueAddress.region, fetchLocationItems, regionOptions]);

  // Load cities when province changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!venueAddress.region || !venueAddress.province) {
        if (provinceOptions.length > 0) setCityOptions([]);
        setBarangayOptions([]);
        return;
      }
      try {
        setIsLoadingVenueOptions(true);
        const selectedProvince = provinceOptions.find(p => p.name === venueAddress.province);
        if (!selectedProvince) return;
        const cities = await fetchLocationItems('/locations/cities', { province_code: selectedProvince.code });
        if (!cancelled) { setCityOptions(cities); setBarangayOptions([]); }
      } catch { /* silent */ } finally {
        if (!cancelled) setIsLoadingVenueOptions(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [venueAddress.region, venueAddress.province, fetchLocationItems, provinceOptions]);

  // Load barangays when city changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!venueAddress.city) { setBarangayOptions([]); return; }
      try {
        setIsLoadingVenueOptions(true);
        const selectedCity = cityOptions.find(c => c.name === venueAddress.city);
        if (!selectedCity) return;
        const barangays = await fetchLocationItems('/locations/barangays', { city_code: selectedCity.code });
        if (!cancelled) setBarangayOptions(barangays);
      } catch { /* silent */ } finally {
        if (!cancelled) setIsLoadingVenueOptions(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [venueAddress.city, fetchLocationItems, cityOptions]);

  // Compose venue string from address parts
  useEffect(() => {
    const parts = [venueAddress.street.trim(), venueAddress.barangay, venueAddress.city, venueAddress.province, venueAddress.region].filter(Boolean);
    const composed = parts.join(', ');
    setVenue(prev => (prev === composed ? prev : composed));
  }, [venueAddress]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const supported = files.filter((file) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'].includes(ext);
    });

    if (supported.length !== files.length) {
      toast.error('Some files were skipped. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG.');
    }

    const mapped = supported.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    }));

    setAttachments((prev) => [...prev, ...mapped]);
    event.target.value = '';
  };

  const removeAttachmentAt = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Engagement form validation state
  const [engagementFormTouched, setEngagementFormTouched] = useState({
    eventName: false,
    venue: false,
    eventDate: false,
    eventTime: false,
    description: false,
    organizationName: false,
    contactEmail: false,
    contactPhone: false,
    selectedGroups: false
  });
  const [engagementFormErrors, setEngagementFormErrors] = useState({
    eventName: '',
    venue: '',
    eventDate: '',
    eventTime: '',
    description: '',
    organizationName: '',
    contactEmail: '',
    contactPhone: '',
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
        if (value && value < getTodayDateValue()) error = 'Date cannot be in the past';
        break;
      case 'eventTime':
        if (!value) error = 'Time is required';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required';
        break;
      case 'organizationName':
        if (!value.trim()) error = 'Organization Name is required';
        break;
      case 'contactEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Enter a valid email address';
        }
        break;
      case 'contactPhone':
        if (value && !/^\+?[\d\s-]{7,20}$/.test(value.trim())) {
          error = 'Enter a valid contact phone number';
        }
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
      case 'description': value = description; break;
      case 'organizationName': value = organizationName; break;
      case 'contactEmail': value = contactEmail; break;
      case 'contactPhone': value = contactPhone; break;
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

  const loadEngagementData = async () => {
    const data = await engagementService.getEngagements();
    const events = data.map((e: any) => ({
      id: String(e.id),
      eventName: e.event_name ?? e.title ?? '',
      date: e.date ? new Date(e.date).toLocaleDateString() : '',
      time: e.time ?? '',
      venue: e.venue ?? '',
      organization: e.organization_name ?? e.requester_org ?? '',
      groups: e.talent_groups ?? [],
      description: e.description ?? '',
      status: e.status === 'scheduled' ? 'upcoming' : (e.status ?? 'upcoming'),
      attachment: Array.isArray(e.attachments) && e.attachments.length > 0
        ? (typeof e.attachments[0] === 'string' ? e.attachments[0] : e.attachments[0]?.name)
        : undefined,
      requestedBy: e.created_by ?? '',
    }));

    setCreatedEvents(events.filter((e: any) => e.status !== 'pending_admin_approval'));
    setEngagementRequests(events.filter((e: any) => e.status === 'pending_admin_approval'));
  };

  const adminCreatedForDirectorDecision = createdEvents.filter(
    (event: any) => event.status === 'pending_director_approval'
  );

  useEffect(() => {
    loadEngagementData().catch(() => {
      toast.error('Failed to load engagements');
    });
    loadScholarshipRenewals().catch(() => {
      toast.error('Failed to load scholarship renewals');
    });
  }, []);

  // Build scholarship renewal requests from backend renewal rows.
  const scholarshipRenewals = renewalRows.map((renewal: any) => {
    const userId = String(renewal?.user_id ?? renewal?.user?.id ?? '');
    const scholar = users.find((u) => String(u.id) === userId);
    const relatedEvaluations = evaluations
      .filter((evaluation) => String(evaluation.traineeId) === userId)
      .sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime());
    const latestEvaluation = relatedEvaluations[0];

    const recommendation = latestEvaluation?.recommendForRenewal === true
      ? 'Recommended for Renewal'
      : latestEvaluation?.recommendForRenewal === false
      ? 'Not Recommended'
      : renewal?.status === 'approved'
      ? 'Approved'
      : renewal?.status === 'rejected'
      ? 'Rejected'
      : 'Pending Review';

    return {
      id: String(renewal?.id ?? ''),
      scholarName: renewal?.user?.name || scholar?.name || 'Unknown Scholar',
      studentId: renewal?.user?.student_id || scholar?.studentId || 'N/A',
      talentGroup: renewal?.user?.talent_group || scholar?.talentGroup || '',
      course: renewal?.user?.course || scholar?.course || 'N/A',
      yearLevel: renewal?.user?.year_level || scholar?.yearLevel || 'N/A',
      evaluationScore: latestEvaluation?.rating,
      scholarshipPercentage: latestEvaluation?.scholarshipPercentage,
      attendanceRate: latestEvaluation?.sectionA
        ? Math.round((Number(latestEvaluation.sectionA.reportsRegularly || 0) / 5) * 100)
        : undefined,
      performanceRating: latestEvaluation?.adjectivalRating || 'N/A',
      directorRemarks: latestEvaluation?.strengths || latestEvaluation?.notes || renewal?.review_notes || 'No remarks provided',
      directorName: latestEvaluation?.ratedBy || 'Director',
      academicGPA: Number(renewal?.gpa ?? 0),
      submittedDate: renewal?.created_at ? new Date(renewal.created_at).toLocaleDateString() : 'N/A',
      renewalRecommendation: recommendation,
      trainingCompleted: Boolean(latestEvaluation),
      documents: Array.isArray(renewal?.documents) ? renewal.documents : [],
      status: renewal?.status || 'pending',
      semester: renewal?.semester,
      year: renewal?.year,
      reviewedAt: renewal?.reviewed_at,
      reviewNotes: renewal?.review_notes,
      evaluation: latestEvaluation,
    };
  }).filter((row) => Boolean(row.id));

  const handleApproveRequest = async (requestId: string) => {
    try {
      await engagementService.updateEngagement(requestId, { status: 'scheduled' });
      await loadEngagementData();
      toast.success('Engagement request approved and added to upcoming events!');
    } catch {
      toast.error('Failed to approve engagement request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await engagementService.updateEngagement(requestId, { status: 'rejected' });
      await loadEngagementData();
      toast.error('Engagement request declined');
    } catch {
      toast.error('Failed to decline engagement request');
    }
  };

  const handleReviewRenewal = async (status: 'approved' | 'rejected') => {
    if (!selectedRenewal?.id || isReviewingRenewal) return;

    try {
      setIsReviewingRenewal(true);
      await scholarshipService.reviewRenewal(selectedRenewal.id, {
        status,
        review_notes: renewalReviewNotes.trim() || null,
      });
      await loadScholarshipRenewals();
      setSelectedRenewal((prev: any) => prev ? ({
        ...prev,
        status,
        reviewNotes: renewalReviewNotes.trim() || null,
        reviewedAt: new Date().toISOString(),
      }) : prev);
      toast.success(status === 'approved' ? 'Renewal approved successfully' : 'Renewal rejected successfully');
    } catch {
      toast.error('Failed to update renewal status');
    } finally {
      setIsReviewingRenewal(false);
    }
  };

  const handleUpdateScholar = async () => {
    if (!selectedScholar?.id || isSavingScholar) return;
    setIsSavingScholar(true);
    try {
      const payload: Record<string, string | null> = {};
      if (scholarEditForm.name.trim())       payload.name         = scholarEditForm.name.trim();
      if (scholarEditForm.phone.trim())      payload.phone        = scholarEditForm.phone.trim();
      if (scholarEditForm.yearLevel.trim())  payload.year_level   = scholarEditForm.yearLevel.trim();
      if (scholarEditForm.course.trim())     payload.course       = scholarEditForm.course.trim();
      if (scholarEditForm.department.trim()) payload.department   = scholarEditForm.department.trim();
      if (scholarEditForm.address.trim())    payload.address      = scholarEditForm.address.trim();
      if (scholarEditForm.talentGroup)       payload.talent_group = scholarEditForm.talentGroup;
      const response = await api.patch<{ data: any }>(`users/${selectedScholar.id}`, payload);
      const updated = response.data?.data;
      if (updated) {
        setSelectedScholar(prev => prev ? ({
          ...prev,
          name:        updated.name         ?? prev.name,
          phone:       updated.phone        ?? prev.phone,
          yearLevel:   updated.year_level   ?? prev.yearLevel,
          course:      updated.course       ?? prev.course,
          department:  updated.department   ?? prev.department,
          address:     updated.address      ?? prev.address,
          talentGroup: updated.talent_group ?? prev.talentGroup,
        }) : prev);
      }
      toast.success('Scholar profile updated');
      setIsEditingScholar(false);
    } catch {
      toast.error('Failed to update scholar profile');
    } finally {
      setIsSavingScholar(false);
    }
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

  const tableSearchInputClass =
    'h-[42px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:ring-2 focus-visible:ring-[#CBD5E1] focus-visible:border-[#94A3B8]';

  const tableSelectTriggerClass =
    'border border-[#CBD5E1] bg-[#F8FAFC] rounded-[10px] h-[42px] text-[#0F172A] focus-visible:ring-2 focus-visible:ring-[#CBD5E1] focus-visible:border-[#94A3B8]';
  const directorCardClass = 'bg-white border-[1.6px] border-[#E0E0E0] shadow-md rounded-lg';
  const directorInteractiveCardClass = 'bg-white border-[1.6px] border-[#E0E0E0] shadow-md rounded-lg cursor-pointer hover:shadow-lg hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]';



  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Skip to main content — WCAG 2.4.1 Bypass Blocks */}
      <SkipToContent />

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl leading-tight">
                <span className="font-bold text-[#0F172A]">Talent</span>
                <span className="text-[#0F172A]">Track</span>
                <span className="font-bold text-[#7A1E1E]">UNC</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative h-9 w-9 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:text-[#7A1E1E] hover:border-[#7A1E1E] transition-colors duration-150 flex items-center justify-center"
              onClick={onNotificationsClick}
              aria-label={
                unreadNotifications > 0
                  ? `Notifications — ${unreadNotifications} unread`
                  : 'Notifications — no unread'
              }
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#7A1E1E]" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{user.name}</p>
                <p className="text-[11px] text-[#64748B] leading-none mt-0.5">Admin</p>
              </div>
            </div>

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
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange?.('settings', 'security')}>
                  <Lock className="w-4 h-4 mr-2" aria-hidden="true" />Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutConfirmation(true)} variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Dashboard Navigation ───────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#E2E8F0]" aria-label="Admin dashboard sections">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px]">
          <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Dashboard views">
            {(
              [
                { key: 'member-profile', icon: Users, label: 'Members' },
                { key: 'engagement', icon: Calendar, label: 'Engagement' },
                { key: 'scholarship', icon: GraduationCap, label: 'Scholarship' },
                { key: 'documents', icon: FileText, label: 'Documents' },
              ] as const
            ).map(({ key, icon: Icon, label }) => {
              const active = currentView === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${key}-panel`}
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
                    className={directorInteractiveCardClass}
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
                    <CardContent className="p-2 sm:p-2">
                  <p className="text-[10px] sm:text-[10px] text-[#6C757D] leading-tight">{label}</p>
                  <p className="text-[#1A1A1A] text-[12px] sm:text-[14px] leading-tight font-bold">{count}</p>
                </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Scholars List */}
            <Card className={directorCardClass}>
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
                      className={`${tableSearchInputClass} pl-11 pr-4 py-[12px]`}
                      style={{ paddingLeft: '2.75rem' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="scholars-group-filter" className="sr-only">Filter scholars by talent group</label>
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                      <SelectTrigger id="scholars-group-filter" className={`w-full sm:w-[180px] ${tableSelectTriggerClass}`} aria-label="Filter scholars by talent group">
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
                                if (scholar.id) {
                                  void fetchScholarProfile(scholar.id);
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`View profile of ${scholar.name}${scholar.studentId ? `, ID: ${scholar.studentId}` : ''}${scholar.course ? `, ${scholar.course}` : ''}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedScholar(scholar);
                                  setShowScholarProfile(true);
                                  if (scholar.id) {
                                    void fetchScholarProfile(scholar.id);
                                  }
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4"
              role="list"
              aria-label="Engagement statistics"
            >
              <DashboardQuickStatCard
                label="Upcoming Events"
                value={createdEvents.filter(e => e.status === 'upcoming').length}
                onClick={() => {
                  setEngagementTab('events');
                  setEventListFilter('upcoming');
                }}
              />
              <DashboardQuickStatCard
                label="Pending Requests"
                value={engagementRequests.length}
                onClick={() => setEngagementTab('requests')}
              />
              <DashboardQuickStatCard
                label="Completed Events"
                value={createdEvents.filter(e => e.status === 'completed').length}
                onClick={() => {
                  setEngagementTab('events');
                  setEventListFilter('completed');
                }}
              />
            </div>

            {/* Engagement Sub-Tabs */}
            <div
              className="flex overflow-x-auto scrollbar-hide gap-2 pb-1"
              role="tablist"
              aria-label="Engagement sections"
            >
              {[
                { key: 'create',   label: 'Create Engagement',    Icon: Plus },
                { key: 'requests', label: 'Approval Queues',      Icon: Clock },
                { key: 'events',   label: 'List of Engagements',  Icon: Calendar },
                { key: 'reports',  label: 'Engagement Reports',   Icon: FileText },
              ].map(({ key, label, Icon }) => (
                <Button
                  key={key}
                  role="tab"
                  variant={engagementTab === key ? 'default' : 'outline'}
                  onClick={() => setEngagementTab(key as any)}
                  className={`shrink-0 whitespace-nowrap ${
                    engagementTab === key
                      ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]'
                      : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'
                  }`}
                  aria-selected={engagementTab === key}
                  aria-controls={`engagement-${key}-panel`}
                >
                  <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* ── Create Engagement Form ─────────────────────────────────────── */}
            {engagementTab === 'create' && (
              <Card
                id="engagement-create-panel"
                role="tabpanel"
                className={directorCardClass}
              >
                <CardHeader>
                  <CardTitle className="text-[#7A1E1E]">Create Engagement Request</CardTitle>
                  <CardDescription className="text-[#6C757D] text-[13px] leading-[20px]">
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
                          required
                          aria-required="true"
                          aria-invalid={engagementFormTouched.eventName && !!engagementFormErrors.eventName}
                          aria-describedby={engagementFormErrors.eventName ? 'event-name-error' : undefined}
                        />
                        {engagementFormTouched.eventName && engagementFormErrors.eventName && (
                          <p id="event-name-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.eventName}</p>
                        )}
                      </div>

                      {/* Event Type */}
                      <div>
                        <label htmlFor="event-type" className="text-[#1A1A1A] text-[14px] mb-2 block">
                          Event Type <span className="text-red-600" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="event-type"
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value as 'performance' | 'workshop' | 'competition' | 'rehearsal')}
                          className="w-full border border-[#D1D5DC] rounded-md px-3 py-2 bg-white"
                          required
                          aria-required="true"
                        >
                          <option value="performance">Performance</option>
                          <option value="workshop">Workshop</option>
                          <option value="competition">Competition</option>
                          <option value="rehearsal">Rehearsal</option>
                        </select>
                      </div>

                      {/* Venue — PSGC cascading picker */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Venue <span style={{ color: '#DC2626' }} aria-hidden="true">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Region */}
                          <div className="space-y-1">
                            <label htmlFor="venue-region" className="text-xs text-muted-foreground">Region</label>
                            <Select
                              value={venueAddress.region || undefined}
                              onValueChange={(v) => setVenueAddress(prev => ({ ...prev, region: v, province: '', city: '', barangay: '' }))}
                            >
                              <SelectTrigger id="venue-region" className={`h-10 text-sm border-2 ${engagementFormTouched.venue && engagementFormErrors.venue ? 'border-red-600' : 'border-gray-200'}`} onBlur={() => handleEngagementFieldBlur('venue')}>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                {regionOptions.map(r => <SelectItem key={r.code} value={r.name}>{r.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Province */}
                          <div className="space-y-1">
                            <label htmlFor="venue-province" className="text-xs text-muted-foreground">Province</label>
                            <Select
                              value={venueAddress.province || undefined}
                              onValueChange={(v) => setVenueAddress(prev => ({ ...prev, province: v, city: '', barangay: '' }))}
                              disabled={!venueAddress.region || provinceOptions.length === 0}
                            >
                              <SelectTrigger id="venue-province" className={`h-10 text-sm border-2 ${engagementFormTouched.venue && engagementFormErrors.venue ? 'border-red-600' : 'border-gray-200'}`}>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                              <SelectContent>
                                {provinceOptions.map(p => <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* City / Municipality */}
                          <div className="space-y-1">
                            <label htmlFor="venue-city" className="text-xs text-muted-foreground">City / Municipality</label>
                            <Select
                              value={venueAddress.city || undefined}
                              onValueChange={(v) => setVenueAddress(prev => ({ ...prev, city: v, barangay: '' }))}
                              disabled={!venueAddress.region || (provinceOptions.length > 0 && !venueAddress.province)}
                            >
                              <SelectTrigger id="venue-city" className={`h-10 text-sm border-2 ${engagementFormTouched.venue && engagementFormErrors.venue ? 'border-red-600' : 'border-gray-200'}`}>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                {cityOptions.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Barangay */}
                          <div className="space-y-1">
                            <label htmlFor="venue-barangay" className="text-xs text-muted-foreground">Barangay</label>
                            <Select
                              value={venueAddress.barangay || undefined}
                              onValueChange={(v) => setVenueAddress(prev => ({ ...prev, barangay: v }))}
                              disabled={!venueAddress.city}
                            >
                              <SelectTrigger id="venue-barangay" className={`h-10 text-sm border-2 ${engagementFormTouched.venue && engagementFormErrors.venue ? 'border-red-600' : 'border-gray-200'}`}>
                                <SelectValue placeholder="Select barangay" />
                              </SelectTrigger>
                              <SelectContent>
                                {barangayOptions.map(b => <SelectItem key={b.code} value={b.name}>{b.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {/* Street */}
                        <div className="mt-3">
                          <Input
                            id="venue-street"
                            placeholder="Street / Building / Landmark"
                            value={venueAddress.street}
                            onChange={(e) => setVenueAddress(prev => ({ ...prev, street: e.target.value }))}
                            onBlur={() => handleEngagementFieldBlur('venue')}
                            className={engagementFormTouched.venue && engagementFormErrors.venue ? 'border-red-600' : ''}
                          />
                        </div>
                        {isLoadingVenueOptions && <p className="text-xs text-muted-foreground mt-1">Loading locations…</p>}
                        {venue && <p className="text-xs text-muted-foreground mt-1">Full venue: {venue}</p>}
                        {engagementFormTouched.venue && engagementFormErrors.venue && (
                          <p id="venue-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.venue}</p>
                        )}
                      </div>

                      {/* Date + Time */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label htmlFor="event-date" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Date <span style={{ color: '#DC2626' }} aria-hidden="true">*</span>
                          </label>
                          <Input
                            id="event-date"
                            type="date"
                            min={getTodayDateValue()}
                            style={{
                              width: '100%', height: 40, padding: '0 12px',
                              fontSize: 14, color: '#0F172A',
                              border: '1px solid #E2E8F0', borderRadius: 8,
                              outline: 'none', background: '#F8FAFC',
                              boxSizing: 'border-box', colorScheme: 'light'
                            }}
                            value={eventDate}
                            onChange={(e) => {
                              setEventDate(e.target.value);
                              if (engagementFormTouched.eventDate) {
                                setEngagementFormErrors(prev => ({ ...prev, eventDate: validateEngagementField('eventDate', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleEngagementFieldBlur('eventDate')}
                            required
                            aria-required="true"
                            aria-invalid={engagementFormTouched.eventDate && !!engagementFormErrors.eventDate}
                            aria-describedby={engagementFormErrors.eventDate ? 'event-date-error' : undefined}
                          />
                          {engagementFormTouched.eventDate && engagementFormErrors.eventDate && (
                            <p id="event-date-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.eventDate}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="event-time" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Time <span style={{ color: '#DC2626' }} aria-hidden="true">*</span>
                          </label>
                          <Input
                            id="event-time"
                            type="time"
                            style={{
                              width: '100%', height: 40, padding: '0 12px',
                              fontSize: 14, color: '#0F172A',
                              border: '1px solid #E2E8F0', borderRadius: 8,
                              outline: 'none', background: '#F8FAFC',
                              boxSizing: 'border-box', colorScheme: 'light'
                            }}
                            value={eventTime}
                            onChange={(e) => {
                              setEventTime(e.target.value);
                              if (engagementFormTouched.eventTime) {
                                setEngagementFormErrors(prev => ({ ...prev, eventTime: validateEngagementField('eventTime', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleEngagementFieldBlur('eventTime')}
                            required
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
                        <label htmlFor="event-description" className="text-[#1A1A1A] text-[14px] mb-2 block">
                          Description <span className="text-red-600" aria-hidden="true">*</span>
                          <span className="sr-only">(required)</span>
                        </label>
                        <Textarea
                          id="event-description"
                          placeholder="Enter event description"
                          className={`bg-white ${
                            engagementFormTouched.description && engagementFormErrors.description
                              ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                              : 'border-[#D1D5DC]'
                          }`}
                          rows={4}
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (engagementFormTouched.description) {
                              setEngagementFormErrors(prev => ({ ...prev, description: validateEngagementField('description', e.target.value) }));
                            }
                          }}
                          onBlur={() => handleEngagementFieldBlur('description')}
                          required
                          aria-required="true"
                          aria-invalid={engagementFormTouched.description && !!engagementFormErrors.description}
                          aria-describedby={engagementFormErrors.description ? 'event-description-error' : undefined}
                        />
                        {engagementFormTouched.description && engagementFormErrors.description && (
                          <p id="event-description-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.description}</p>
                        )}
                      </div>

                      {/* Organizer Information */}
                      <div className="space-y-4 pt-4 border-t border-[#E0E0E0]">
                        <h4 className="text-[#1A1A1A] text-[14px] font-medium">Organizer Information</h4>

                        <div>
                          <label htmlFor="event-organization" className="text-[#1A1A1A] text-[14px] mb-2 block">
                            Organization Name <span className="text-red-600" aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                          </label>
                          <Input
                            id="event-organization"
                            placeholder="Enter organization name"
                            className={`bg-white ${
                              engagementFormTouched.organizationName && engagementFormErrors.organizationName
                                ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                                : 'border-[#D1D5DC]'
                            }`}
                            value={organizationName}
                            onChange={(e) => {
                              setOrganizationName(e.target.value);
                              if (engagementFormTouched.organizationName) {
                                setEngagementFormErrors(prev => ({ ...prev, organizationName: validateEngagementField('organizationName', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleEngagementFieldBlur('organizationName')}
                            required
                            aria-required="true"
                            aria-invalid={engagementFormTouched.organizationName && !!engagementFormErrors.organizationName}
                            aria-describedby={engagementFormErrors.organizationName ? 'event-organization-error' : undefined}
                          />
                          {engagementFormTouched.organizationName && engagementFormErrors.organizationName && (
                            <p id="event-organization-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.organizationName}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="event-contact-person" className="text-[#1A1A1A] text-[14px] mb-2 block">Contact Person</label>
                            <Input
                              id="event-contact-person"
                              placeholder="Enter contact person"
                              className="border-[#D1D5DC] bg-white"
                              value={contactPerson}
                              onChange={(e) => setContactPerson(e.target.value)}
                            />
                          </div>

                          <div>
                            <label htmlFor="event-contact-email" className="text-[#1A1A1A] text-[14px] mb-2 block">Contact Email</label>
                            <Input
                              id="event-contact-email"
                              type="email"
                              placeholder="email@example.com"
                              className={`bg-white ${
                                engagementFormTouched.contactEmail && engagementFormErrors.contactEmail
                                  ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                                  : 'border-[#D1D5DC]'
                              }`}
                              value={contactEmail}
                              onChange={(e) => {
                                setContactEmail(e.target.value);
                                if (engagementFormTouched.contactEmail) {
                                  setEngagementFormErrors(prev => ({ ...prev, contactEmail: validateEngagementField('contactEmail', e.target.value) }));
                                }
                              }}
                              onBlur={() => handleEngagementFieldBlur('contactEmail')}
                              aria-invalid={engagementFormTouched.contactEmail && !!engagementFormErrors.contactEmail}
                              aria-describedby={engagementFormErrors.contactEmail ? 'event-contact-email-error' : undefined}
                            />
                            {engagementFormTouched.contactEmail && engagementFormErrors.contactEmail && (
                              <p id="event-contact-email-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.contactEmail}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="event-contact-phone" className="text-[#1A1A1A] text-[14px] mb-2 block">Contact Phone</label>
                          <Input
                            id="event-contact-phone"
                            placeholder="+63 XXX XXX XXXX"
                            className={`bg-white ${
                              engagementFormTouched.contactPhone && engagementFormErrors.contactPhone
                                ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
                                : 'border-[#D1D5DC]'
                            }`}
                            value={contactPhone}
                            onChange={(e) => {
                              setContactPhone(e.target.value);
                              if (engagementFormTouched.contactPhone) {
                                setEngagementFormErrors(prev => ({ ...prev, contactPhone: validateEngagementField('contactPhone', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleEngagementFieldBlur('contactPhone')}
                            aria-invalid={engagementFormTouched.contactPhone && !!engagementFormErrors.contactPhone}
                            aria-describedby={engagementFormErrors.contactPhone ? 'event-contact-phone-error' : undefined}
                          />
                          {engagementFormTouched.contactPhone && engagementFormErrors.contactPhone && (
                            <p id="event-contact-phone-error" role="alert" className="text-red-600 text-[12px] mt-1">{engagementFormErrors.contactPhone}</p>
                          )}
                        </div>
                      </div>

                      {/* Attachment */}
                      <div className="space-y-2 pt-4 border-t border-[#E0E0E0]">
                        <label className="text-[#1A1A1A] text-[14px] mb-2 block">Attachments</label>
                        <p className="text-xs text-[#6C757D]">Upload supporting documents (PDF, DOC, DOCX, JPG, PNG - Max 5MB each)</p>
                        <div className="border-2 border-dashed rounded-lg p-4">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleAttachmentUpload}
                            className="hidden"
                            id="event-attachments-upload"
                          />
                          <label htmlFor="event-attachments-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <Upload className="w-8 h-8 text-[#6c757d] mb-2" aria-hidden="true" />
                              <p className="text-sm text-[#6c757d]">Click to upload files</p>
                            </div>
                          </label>
                        </div>

                        {attachments.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {attachments.map((file, idx) => (
                              <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4" aria-hidden="true" />
                                  <div>
                                    <p className="text-sm">{file.name}</p>
                                    <p className="text-xs text-[#6c757d]">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachmentAt(idx)}
                                  aria-label={`Remove attachment ${file.name}`}
                                >
                                  <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
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

                      <div className="p-3 bg-orange-50 rounded flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <p className="text-xs text-orange-800">
                          This request will be sent to directors for review and approval before being finalized.
                          You will be notified once a decision is made.
                        </p>
                      </div>

                      {/* Submit */}
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                          className="border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8] min-h-[44px] px-6 rounded-[10px]"
                          disabled={isCreatingEngagement}
                          aria-busy={isCreatingEngagement}
                          onClick={() => {
                          if (isCreatingEngagement) return;
                          
                          setEngagementFormTouched({
                            eventName: true,
                            venue: true,
                            eventDate: true,
                            eventTime: true,
                            description: true,
                            organizationName: true,
                            contactEmail: true,
                            contactPhone: true,
                            selectedGroups: true
                          });

                          const errors = {
                            eventName:     validateEngagementField('eventName', eventName),
                            venue:         validateEngagementField('venue', venue),
                            eventDate:     validateEngagementField('eventDate', eventDate),
                            eventTime:     validateEngagementField('eventTime', eventTime),
                            description:   validateEngagementField('description', description),
                            organizationName: validateEngagementField('organizationName', organizationName),
                            contactEmail:  validateEngagementField('contactEmail', contactEmail),
                            contactPhone:  validateEngagementField('contactPhone', contactPhone),
                            selectedGroups:validateEngagementField('selectedGroups', selectedGroups)
                          };
                          setEngagementFormErrors(errors);

                          const missingFields = [];
                          if (!eventName.trim())      missingFields.push('Event Name');
                          if (!venue.trim())           missingFields.push('Venue');
                          if (!eventDate)              missingFields.push('Date');
                          if (!eventTime)              missingFields.push('Time');
                          if (!description.trim())     missingFields.push('Description');
                          if (!organizationName.trim())missingFields.push('Organization Name');
                          if (selectedGroups.length === 0) missingFields.push('Talent Groups');

                          const hasFormatErrors = Object.values(errors).some(Boolean);
                          if (missingFields.length > 0 || hasFormatErrors) {
                            if (missingFields.length > 0) {
                              toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
                            } else {
                              toast.error('Please fix the highlighted fields before submitting.');
                            }
                            return;
                          }
                          
                          setIsCreatingEngagement(true);

                          const createEngagement = async () => {
                            await engagementService.createEngagement({
                              event_name: eventName,
                              venue,
                              date: eventDate,
                              time: eventTime,
                              description,
                              organization_name: organizationName,
                              contact_person: contactPerson || null,
                              contact_email: contactEmail || null,
                              contact_phone: contactPhone || null,
                              attachments: attachments.map((file) => ({
                                name: file.name,
                                size: file.size,
                                type: file.type,
                              })),
                              talent_groups: selectedGroups,
                              type: eventType,
                              status: 'pending_director_approval' as any,
                              is_required: false,
                            });

                            await loadEngagementData();
                            toast.success('Engagement sent for director approval');

                            setEventName(''); setVenue(''); setEventDate(''); setEventTime('');
                            setEventType('performance');
                            setVenueAddress({ region: '', province: '', city: '', barangay: '', street: '' });
                            setDescription(''); setOrganizationName(''); setContactPerson(''); setContactEmail(''); setContactPhone('');
                            setSelectedGroups([]); setAttachments([]);
                            setEngagementFormTouched({
                              eventName: false,
                              venue: false,
                              eventDate: false,
                              eventTime: false,
                              description: false,
                              organizationName: false,
                              contactEmail: false,
                              contactPhone: false,
                              selectedGroups: false
                            });
                            setEngagementFormErrors({
                              eventName: '',
                              venue: '',
                              eventDate: '',
                              eventTime: '',
                              description: '',
                              organizationName: '',
                              contactEmail: '',
                              contactPhone: '',
                              selectedGroups: ''
                            });
                          };

                          void createEngagement()
                            .catch(() => {
                              toast.error('Failed to create engagement event');
                            })
                            .finally(() => {
                              setIsCreatingEngagement(false);
                            });
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                          {isCreatingEngagement ? 'Submitting…' : 'Submit for Approval'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ── Engagement Requests ───────────────────────────────────────── */}
            {engagementTab === 'requests' && (
              <div id="engagement-requests-panel" role="tabpanel" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <Card id="queue-director-requests" className="border-[#E0E0E0]">
                      <CardHeader>
                        <CardTitle className="text-[#7A1E1E]">Director Requests For Admin Decision</CardTitle>
                        <CardDescription>Accept or reject engagement requests submitted by directors</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                          {engagementRequests.length > 0 ? (
                            <div className="space-y-4" aria-live="polite" aria-label="Director requests pending admin decision">
                              {engagementRequests.map((request) => (
                                <article
                                  key={request.id}
                                  className="border rounded-lg p-4"
                                  aria-label={`Engagement request: ${request.eventName}`}
                                >
                                  <div className="flex items-start justify-between mb-3 gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-[#7A1E1E] truncate">{request.eventName}</h4>
                                      <p className="text-sm text-[#6C757D] mt-1">{request.description}</p>
                                      <p className="text-xs text-[#6C757D] mt-2 truncate">
                                        From: {request.requestedBy || 'Unknown'}{request.organization ? ` (${request.organization})` : ''}
                                      </p>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">Pending</Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-[#6C757D]">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                                      {request.date}
                                    </div>
                                    {request.time && (
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                                        {request.time}
                                      </div>
                                    )}
                                    <div className="flex items-center min-w-0">
                                      <MapPin className="w-4 h-4 mr-1 shrink-0" aria-hidden="true" />
                                      <span className="truncate">{request.venue}</span>
                                    </div>
                                  </div>

                                  {request.groups?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                      {request.groups.map((group: string) => (
                                        <Badge
                                          key={group}
                                          className="text-white text-[11px]"
                                          style={{ backgroundColor: getTalentGroupColor(group) }}
                                        >
                                          {getTalentGroupName(group)}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {request.attachment && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded border border-[#E0E0E0]">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-3 h-3 shrink-0" aria-hidden="true" />
                                          <span className="text-xs truncate">{request.attachment}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                          onClick={() => {
                                            setSelectedAttachment({
                                              name: request.attachment!,
                                              type: request.attachment!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'document'
                                            });
                                            setShowAttachmentPreview(true);
                                          }}
                                          aria-label={`View attachment: ${request.attachment}`}
                                        >
                                          <Download className="w-3 h-3" aria-hidden="true" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveRequest(request.id)}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                      aria-label={`Accept engagement request: ${request.eventName}`}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeclineRequest(request.id)}
                                      className="flex-1"
                                      aria-label={`Reject engagement request: ${request.eventName}`}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                                      Reject
                                    </Button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                              <p>No engagement requests pending your decision</p>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card id="section-awaiting-director" className="border-orange-200 bg-orange-50/50">
                      <CardHeader>
                        <CardTitle className="text-orange-700 flex items-center">
                          <Send className="w-5 h-5 mr-2" aria-hidden="true" />
                          Admin-Created Requests (Waiting Director Approval)
                        </CardTitle>
                        <CardDescription>
                          These requests were created by admin and are waiting for directors to accept or reject
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                          {adminCreatedForDirectorDecision.length > 0 ? (
                            <div className="space-y-4" aria-live="polite" aria-label="Admin requests waiting director approval">
                              {adminCreatedForDirectorDecision.map((request) => (
                                <article key={request.id} className="border border-orange-200 rounded-lg p-4 bg-white">
                                  <div className="flex items-start justify-between mb-3 gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium truncate">{request.eventName}</h4>
                                      <p className="text-sm text-[#6C757D] mt-1">{request.description}</p>
                                    </div>
                                    <Badge className="bg-orange-500 text-white">Pending Director</Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-[#6C757D]">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                                      {request.date}
                                    </div>
                                    {request.time && (
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                                        {request.time}
                                      </div>
                                    )}
                                    <div className="flex items-center min-w-0">
                                      <MapPin className="w-4 h-4 mr-1 shrink-0" aria-hidden="true" />
                                      <span className="truncate">{request.venue}</span>
                                    </div>
                                  </div>

                                  {request.groups?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                      {request.groups.map((group: string) => (
                                        <Badge
                                          key={group}
                                          className="text-white text-[11px]"
                                          style={{ backgroundColor: getTalentGroupColor(group) }}
                                        >
                                          {getTalentGroupName(group)}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {request.attachment && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded border border-[#E0E0E0]">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-3 h-3 shrink-0" aria-hidden="true" />
                                          <span className="text-xs truncate">{request.attachment}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                          onClick={() => {
                                            setSelectedAttachment({
                                              name: request.attachment!,
                                              type: request.attachment!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'document'
                                            });
                                            setShowAttachmentPreview(true);
                                          }}
                                          aria-label={`View attachment: ${request.attachment}`}
                                        >
                                          <Download className="w-3 h-3" aria-hidden="true" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Send className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                              <p>No admin-created requests waiting for directors</p>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
            )}

            {/* ── List of Engagements ───────────────────────────────────────── */}
            {engagementTab === 'events' && (
              <div id="engagement-events-panel" role="tabpanel" className="space-y-4">
                <Card className={directorCardClass}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-[#7A1E1E]">List of Engagements</CardTitle>
                        <CardDescription className="text-[#6C757D] text-[13px] leading-[20px] mt-1">
                        {eventListFilter === 'upcoming' && 'Events scheduled for the future'}
                        {eventListFilter === 'completed' && 'Past engagement events'}
                        </CardDescription>
                      </div>
                      <div
                        className="flex space-x-1 bg-[#F1F3F4] p-1 rounded-lg"
                        role="group"
                        aria-label="Filter events by status"
                      >
                        <Button
                          variant={eventListFilter === 'upcoming' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEventListFilter('upcoming')}
                          className={`text-[12px] min-h-[44px] rounded-[10px] border ${eventListFilter === 'upcoming' ? 'bg-[#7A1E1E] text-white border-[#7A1E1E] hover:bg-[#7A1E1E]' : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'}`}
                          aria-pressed={eventListFilter === 'upcoming'}
                        >
                          Upcoming
                        </Button>
                        <Button
                          variant={eventListFilter === 'completed' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEventListFilter('completed')}
                          className={`text-[12px] min-h-[44px] rounded-[10px] border ${eventListFilter === 'completed' ? 'bg-[#7A1E1E] text-white border-[#7A1E1E] hover:bg-[#7A1E1E]' : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'}`}
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
                                    {event.groups.map((group: string) => (
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
                                        className="min-h-[44px] text-[12px] border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8] rounded-[10px]"
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
                className={directorCardClass}
              >
                <CardHeader>
                  <CardTitle className="text-[#7A1E1E]">Engagement Reports</CardTitle>
                  <CardDescription className="text-[#6C757D] text-[13px] leading-[20px]">
                    Performance and participation reports for engagements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary Statistics */}
                    <section aria-labelledby="engagement-summary-heading">
                      <h3 id="engagement-summary-heading" className="text-[#7A1E1E] text-[14px] font-medium mb-3">Engagement Summary</h3>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="p-2 sm:p-2 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0]">
                          <Calendar className="hidden sm:block w-4 h-4 text-[#7A1E1E] mb-1" aria-hidden="true" />
                          <p className="text-[10px] sm:text-[10px] text-[#6C757D] leading-tight">Total Events</p>
                          <p className="text-[12px] sm:text-[14px] font-bold text-[#1A1A1A] leading-tight">{createdEvents.length}</p>
                        </div>
                        <div className="p-2 sm:p-2 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0]">
                          <Users className="hidden sm:block w-4 h-4 text-[#7A1E1E] mb-1" aria-hidden="true" />
                          <p className="text-[10px] sm:text-[10px] text-[#6C757D] leading-tight">Groups Involved</p>
                          <p className="text-[12px] sm:text-[14px] font-bold text-[#1A1A1A] leading-tight">4</p>
                        </div>
                        <div className="p-2 sm:p-2 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0]">
                          <CheckCircle className="hidden sm:block w-4 h-4 text-[#00C950] mb-1" aria-hidden="true" />
                          <p className="text-[10px] sm:text-[10px] text-[#6C757D] leading-tight">Success Rate</p>
                          <p className="text-[12px] sm:text-[14px] font-bold text-[#00C950] leading-tight">100%</p>
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
                            <SelectTrigger id="report-group-filter" className={`w-full sm:w-[200px] ${tableSelectTriggerClass}`}>
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
                    className={directorInteractiveCardClass}
                    onClick={() => setScholarshipGroupFilter(key)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setScholarshipGroupFilter(key); } }}
                    aria-label={`${label}: ${count} renewal requests. Activate to filter.`}
                  >
                    <CardContent className="p-2 sm:p-2">
                  <p className="text-[10px] sm:text-[10px] text-[#6C757D] leading-tight">{label}</p>
                  <p className="text-[#1A1A1A] text-[12px] sm:text-[14px] leading-tight font-bold">{count}</p>
                </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Scholarship Renewal Requests */}
            <Card className={directorCardClass}>
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
                      <SelectTrigger id="scholarship-group-filter" className={`w-full sm:w-[180px] ${tableSelectTriggerClass}`}>
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
                {renewalsLoading ? (
                  <div className="text-[#6C757D] text-sm py-6">Loading scholarship renewal requests...</div>
                ) : (() => {
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
                          className="border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8] min-h-[44px] rounded-[10px]"
                          onClick={() => {
                            setSelectedRenewal(renewal);
                            setRenewalReviewNotes(renewal.reviewNotes || '');
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
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-[1.6px] border-[#E0E0E0] shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#7A1E1E] text-[20px] font-bold">Scholar Profile</DialogTitle>
            <DialogDescription className="text-[#6C757D] text-[14px]">
              View detailed information about this scholar
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(80vh-150px)] pr-4">
            {scholarProfileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-[#7A1E1E] border-t-transparent rounded-full mb-3"></div>
                  <p className="text-[#6C757D]">Loading scholar profile...</p>
                </div>
              </div>
            ) : selectedScholar ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Personal Information */}
                  <section aria-labelledby="personal-info-heading" className="space-y-4">
                    <h4 id="personal-info-heading" className="text-[#7A1E1E] text-[16px] font-bold">Personal Information</h4>
                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0] space-y-3">
                      {[
                        { label: 'Full Name', value: selectedScholar.name },
                        { label: 'Student ID', value: selectedScholar.studentId },
                        { label: 'Email', value: selectedScholar.email },
                        { label: 'Phone', value: selectedScholar.phone },
                      ].map(({ label, value }) => (
                        value && (
                          <div key={label}>
                            <dt className="text-[#6C757D] text-[12px] font-medium mb-1">{label}</dt>
                            <dd className="text-[#1A1A1A] text-[14px]">{value}</dd>
                          </div>
                        )
                      ))}
                    </div>
                  </section>

                  {/* Right Column - Educational Information */}
                  <section aria-labelledby="educational-heading" className="space-y-4">
                    <h4 id="educational-heading" className="text-[#7A1E1E] text-[16px] font-bold">Educational Information</h4>
                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0] space-y-3">
                      {[
                        { label: 'Course', value: selectedScholar.course },
                        { label: 'Year Level', value: selectedScholar.yearLevel },
                        { label: 'Department', value: selectedScholar.department },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <dt className="text-[#6C757D] text-[12px] font-medium mb-1">{label}</dt>
                          <dd className="text-[#1A1A1A] text-[14px]">{value || 'Not provided'}</dd>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Address Section */}
                {selectedScholar.address && (
                  <section aria-labelledby="address-heading" className="space-y-4">
                    <h4 id="address-heading" className="text-[#7A1E1E] text-[16px] font-bold">Address</h4>
                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                      <p className="text-[#1A1A1A] text-[14px]">{selectedScholar.address}</p>
                    </div>
                  </section>
                )}

                {/* Connected Records */}
                <section aria-labelledby="connected-records-heading" className="space-y-4">
                  <h4 id="connected-records-heading" className="text-[#7A1E1E] text-[16px] font-bold">Connected Records</h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Evaluations', value: scholarConnections.evaluations.length },
                      { label: 'Renewals', value: scholarConnections.scholarshipRenewals.length },
                      { label: 'Documents', value: scholarConnections.documents.length },
                      { label: 'Engagements', value: scholarConnections.engagements.length },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                        <p className="text-[11px] text-[#6C757D]">{item.label}</p>
                        <p className="text-[20px] font-bold text-[#1A1A1A]">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {scholarConnections.traineeProfile && (
                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                      <h5 className="text-[#1A1A1A] text-[14px] font-semibold mb-3">Trainee Profile History</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                        <p><span className="text-[#6C757D]">Status:</span> {scholarConnections.traineeProfile.current_status || 'N/A'}</p>
                        <p><span className="text-[#6C757D]">Completion:</span> {scholarConnections.traineeProfile.completion_rate ?? 0}%</p>
                        <p><span className="text-[#6C757D]">Chapter:</span> {scholarConnections.traineeProfile.chapter || 'N/A'}</p>
                        <p><span className="text-[#6C757D]">Joined:</span> {formatDateLabel(scholarConnections.traineeProfile.date_joined)}</p>
                        {selectedScholar.talentGroup === 'marching-band' && (
                          <p><span className="text-[#6C757D]">Instrument:</span> {scholarConnections.traineeProfile.instrument || 'N/A'}</p>
                        )}
                        {selectedScholar.talentGroup === 'glee-club' && (
                          <p><span className="text-[#6C757D]">Voice:</span> {scholarConnections.traineeProfile.voice || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                      <h5 className="text-[#1A1A1A] text-[14px] font-semibold mb-3">Recent Evaluations</h5>
                      {scholarConnections.evaluations.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {scholarConnections.evaluations.map((evaluation: any) => (
                            <li key={evaluation.id} className="p-2 bg-white rounded border border-[#E0E0E0]">
                              <p className="text-[13px] font-medium text-[#1A1A1A]">Rating: {evaluation.rating ?? 'N/A'}</p>
                              <p className="text-[12px] text-[#6C757D]">{evaluation.adjectival_rating || 'No adjectival rating'}</p>
                              <p className="text-[12px] text-[#6C757D]">{formatDateLabel(evaluation.evaluation_date || evaluation.created_at)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-[#6C757D]">No evaluations found.</p>
                      )}
                    </div>

                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                      <h5 className="text-[#1A1A1A] text-[14px] font-semibold mb-3">Scholarship Renewals</h5>
                      {scholarConnections.scholarshipRenewals.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {scholarConnections.scholarshipRenewals.map((renewal: any) => (
                            <li key={renewal.id} className="p-2 bg-white rounded border border-[#E0E0E0]">
                              <p className="text-[13px] font-medium text-[#1A1A1A]">{renewal.semester || 'Semester N/A'} {renewal.year || ''}</p>
                              <p className="text-[12px] text-[#6C757D]">Status: {renewal.status || 'pending'}</p>
                              <p className="text-[12px] text-[#6C757D]">Submitted: {formatDateLabel(renewal.created_at)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-[#6C757D]">No renewals found.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                      <h5 className="text-[#1A1A1A] text-[14px] font-semibold mb-3">Documents</h5>
                      {scholarConnections.documents.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {scholarConnections.documents.map((doc: any) => (
                            <li key={doc.id} className="p-2 bg-white rounded border border-[#E0E0E0]">
                              <p className="text-[13px] font-medium text-[#1A1A1A]">{doc.title || doc.file_name || 'Untitled document'}</p>
                              <p className="text-[12px] text-[#6C757D]">{doc.category || 'Uncategorized'} • {doc.file_type || 'File'}</p>
                              <p className="text-[12px] text-[#6C757D]">Uploaded: {formatDateLabel(doc.created_at)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-[#6C757D]">No documents found.</p>
                      )}
                    </div>

                    <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                      <h5 className="text-[#1A1A1A] text-[14px] font-semibold mb-3">Related Engagements</h5>
                      {scholarConnections.engagements.length > 0 ? (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {scholarConnections.engagements.map((engagement: any) => (
                            <li key={engagement.id} className="p-2 bg-white rounded border border-[#E0E0E0]">
                              <p className="text-[13px] font-medium text-[#1A1A1A]">{engagement.event_name || 'Untitled event'}</p>
                              <p className="text-[12px] text-[#6C757D]">{engagement.venue || 'Venue N/A'} • {engagement.status || 'N/A'}</p>
                              <p className="text-[12px] text-[#6C757D]">{formatDateLabel(engagement.date)}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-[#6C757D]">No engagements found.</p>
                      )}
                    </div>
                  </div>
                </section>


                {/* Role Badge */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Role: Scholar</p>
                  <p className="text-xs text-blue-700 mt-1">This is a scholar account managed by the talent group director.</p>
                </div>

                {/* Admin Edit Section */}
                {!isEditingScholar ? (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                      onClick={() => {
                        setScholarEditForm({
                          name: selectedScholar?.name ?? '',
                          phone: selectedScholar?.phone ?? '',
                          yearLevel: selectedScholar?.yearLevel ?? '',
                          course: selectedScholar?.course ?? '',
                          department: selectedScholar?.department ?? '',
                          address: selectedScholar?.address ?? '',
                          talentGroup: selectedScholar?.talentGroup ?? '',
                        });
                        setIsEditingScholar(true);
                      }}
                    >
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <section aria-labelledby="edit-scholar-heading" className="p-4 bg-white rounded-lg border border-[#7A1E1E]/30 space-y-3">
                    <h4 id="edit-scholar-heading" className="text-[#7A1E1E] text-[15px] font-bold">Edit Scholar Profile</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Name',       key: 'name',        placeholder: 'Full name' },
                        { label: 'Phone',      key: 'phone',       placeholder: '+63 XXX XXX XXXX' },
                        { label: 'Year Level', key: 'yearLevel',   placeholder: 'e.g., 2nd Year' },
                        { label: 'Course',     key: 'course',      placeholder: 'e.g., BSED' },
                        { label: 'Department', key: 'department',  placeholder: 'e.g., CAS' },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                          <label className="text-[12px] text-[#6C757D] block mb-1">{label}</label>
                          <input
                            type="text"
                            className="w-full border border-[#D1D5DC] rounded-md px-3 py-1.5 text-[13px] bg-white"
                            placeholder={placeholder}
                            value={scholarEditForm[key as keyof typeof scholarEditForm]}
                            onChange={(e) => setScholarEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-[12px] text-[#6C757D] block mb-1">Talent Group</label>
                        <select
                          className="w-full border border-[#D1D5DC] rounded-md px-3 py-1.5 text-[13px] bg-white"
                          value={scholarEditForm.talentGroup}
                          onChange={(e) => setScholarEditForm(prev => ({ ...prev, talentGroup: e.target.value }))}
                        >
                          <option value="">— Unassigned —</option>
                          <option value="marching-band">Marching Band</option>
                          <option value="majorettes">Majorettes</option>
                          <option value="glee-club">Glee Club</option>
                          <option value="dance-club">Dance Club</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] text-[#6C757D] block mb-1">Address</label>
                      <textarea
                        className="w-full border border-[#D1D5DC] rounded-md px-3 py-1.5 text-[13px] bg-white resize-none"
                        rows={2}
                        placeholder="Full address"
                        value={scholarEditForm.address}
                        onChange={(e) => setScholarEditForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button size="sm" variant="outline" onClick={() => setIsEditingScholar(false)} disabled={isSavingScholar}>Cancel</Button>
                      <Button size="sm" className="bg-[#7A1E1E] text-white hover:bg-[#6A1919]" onClick={() => void handleUpdateScholar()} disabled={isSavingScholar}>
                        {isSavingScholar ? 'Saving…' : 'Save Changes'}
                      </Button>
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Event Details Dialog ──────────────────────────────────────────────── */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto border-[1.6px] border-[#E0E0E0] shadow-xl rounded-xl">
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
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-[1.6px] border-[#E0E0E0] shadow-xl rounded-xl">
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

                <section aria-labelledby="renewal-admin-review-heading" className="p-4 bg-white rounded-lg border border-[#E0E0E0] space-y-3">
                  <h3 id="renewal-admin-review-heading" className="text-[#7A1E1E] text-[16px] font-bold">Admin Review Decision</h3>
                  <p className="text-[13px] text-[#6C757D]">
                    Current status: <span className="font-medium text-[#1A1A1A] capitalize">{selectedRenewal.status || 'pending'}</span>
                  </p>
                  <div>
                    <label htmlFor="renewal-review-notes" className="text-[#1A1A1A] text-[14px] mb-2 block">Review Notes</label>
                    <Textarea
                      id="renewal-review-notes"
                      placeholder="Add optional notes for this renewal decision"
                      value={renewalReviewNotes}
                      onChange={(e) => setRenewalReviewNotes(e.target.value)}
                      className="border-[#D1D5DC] bg-white"
                      rows={3}
                    />
                  </div>
                  {selectedRenewal.reviewedAt && (
                    <p className="text-[12px] text-[#6C757D]">Reviewed at: {formatDateLabel(selectedRenewal.reviewedAt)}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => void handleReviewRenewal('approved')}
                      disabled={isReviewingRenewal}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />Approve Renewal
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => void handleReviewRenewal('rejected')}
                      disabled={isReviewingRenewal}
                    >
                      <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />Reject Renewal
                    </Button>
                  </div>
                </section>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Attachment Preview Dialog ─────────────────────────────────────────── */}
      <Dialog open={showAttachmentPreview} onOpenChange={setShowAttachmentPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-7xl h-[90vh] flex flex-col p-0 border-[1.6px] border-[#E0E0E0] shadow-xl rounded-xl overflow-hidden">
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
              className="border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8] min-h-[44px] rounded-[10px]"
              aria-label={`Download ${selectedAttachment?.name}`}
            >
              <Download className="w-4 h-4 sm:mr-2" aria-hidden="true" /><span className="hidden sm:inline">Download</span>            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Logout Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <DialogContent className="max-w-[95vw] sm:max-w-md border-[1.6px] border-[#E0E0E0] shadow-xl rounded-xl">
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
