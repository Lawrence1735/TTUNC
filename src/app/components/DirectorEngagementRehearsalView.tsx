import React, { useState, useEffect, useCallback } from 'react';
import engagementService from '../services/engagementService';
import { api } from '../services/api';
import trainingClient from '../../api/trainingClient';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, MapPin, Clock, Users, Music, Plus, CheckCircle, XCircle, Edit, Trash2, Upload, FileText, Download, AlertCircle, Send } from './ui/icons';
import { toast } from 'sonner';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

interface DirectorEngagementRehearsalViewProps {
  talentGroup: string;
}

interface PsgcItem {
  code: string;
  name: string;
}



export function DirectorEngagementRehearsalView({ talentGroup }: DirectorEngagementRehearsalViewProps) {
  const [activeTab, setActiveTab] = useState<'engagements' | 'rehearsals'>('engagements');
  const [engagementViewTab, setEngagementViewTab] = useState<'create-request' | 'approval-queues' | 'accepted-list'>('create-request');
  const [rehearsalViewTab, setRehearsalViewTab] = useState<'create-rehearsal' | 'upcoming'>('upcoming');
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [attendanceReadOnly, setAttendanceReadOnly] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEngagementDetailsDialog, setShowEngagementDetailsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedEngagementDetails, setSelectedEngagementDetails] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [rehearsals, setRehearsals] = useState<any[]>([]);
  const [engagements, setEngagements] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [attendanceMarkedDates, setAttendanceMarkedDates] = useState<Set<string>>(new Set());

  const formatDateKey = (value: string | Date) => {
    const d = typeof value === 'string' ? new Date(value) : value;
    return d.toISOString().slice(0, 10);
  };

  const normalizeAttachments = (attachments: any): Array<{ id: string; name: string; size: number; url?: string; path?: string }> => {
    if (!Array.isArray(attachments)) return [];
    return attachments
      .map((item: any, index: number) => {
        if (typeof item === 'string') {
          return {
            id: `attachment-${index}`,
            name: item,
            size: 0,
          };
        }

        if (item && typeof item === 'object') {
          return {
            id: String(item.id ?? `attachment-${index}`),
            name: String(item.name ?? item.fileName ?? `Attachment ${index + 1}`),
            size: Number(item.size ?? 0),
            url: item.url,
            path: item.path,
          };
        }

        return null;
      })
      .filter(Boolean) as Array<{ id: string; name: string; size: number; url?: string; path?: string }>;
  };

  const loadAttendanceMembers = useCallback(async () => {
    const memberRows = await api.get<any[]>('users').then(r => r.data || []);

    setAttendanceList(memberRows.map((u: any) => ({
      id: `u-${u.id}`,
      userId: Number(u.id),
      name: u.name,
      memberType: 'Member',
      status: 'pending',
    })));
  }, []);

  const loadEngagementData = useCallback(async () => {
    const [engagementRows, rehearsalRows, attendanceRows] = await Promise.all([
      engagementService.getEngagements(),
      engagementService.getRehearsals(),
      trainingClient.getAttendance(),
    ]);

    const markedDates = new Set(
      attendanceRows
        .map((row: any) => String((row.sessionDate || row.session_date || '')).slice(0, 10))
        .filter(Boolean),
    );
    setAttendanceMarkedDates(markedDates);

    setEngagements(engagementRows.map((e: any) => {
      const rawStatus = String(e.status ?? 'scheduled');

      return {
        id: String(e.id),
        eventName: e.event_name ?? '',
        date: new Date(e.date),
        time: e.time ?? '',
        venue: e.venue ?? '',
        description: e.description ?? '',
        eventType: e.type ?? 'performance',
        organization: e.organization_name ?? e.requester_org ?? '',
        contactPerson: e.contact_person ?? e.requester_name ?? '',
        contactEmail: e.contact_email ?? '',
        contactPhone: e.contact_phone ?? '',
        status: rawStatus === 'pending_director_approval' ? 'pending' : rawStatus,
        rawStatus,
        requesterName: e.requester_name ?? '',
        requesterOrg: e.requester_org ?? '',
        createdBy: e.created_by ?? '',
        attachments: normalizeAttachments(e.attachments),
        attendanceMarked: markedDates.has(String(e.date).slice(0, 10)),
      };
    }));

    setRehearsals(rehearsalRows.map((r: any) => ({
      id: String(r.id),
      title: r.event_name ?? '',
      date: new Date(r.date),
      time: r.time ?? '',
      venue: r.venue ?? '',
      description: r.description ?? '',
      isRequired: r.is_required ?? true,
      createdBy: r.created_by ?? '',
      attendanceMarked: markedDates.has(String(r.date).slice(0, 10)),
    })));
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadEngagementData(), loadAttendanceMembers()]);
      } catch {
        toast.error('Failed to load engagements/rehearsals');
      }
    };
    void loadAll();
  }, [loadEngagementData, loadAttendanceMembers]);
  
  // Form state for creating rehearsal
  const [newRehearsal, setNewRehearsal] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: ''
  });
  const [selectedRehearsalVenue, setSelectedRehearsalVenue] = useState('');

  // Form state for creating engagement request
  const [newEngagement, setNewEngagement] = useState({
    eventName: '',
    organization: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    date: '',
    time: '',
    venue: '',
    attire: '',
    description: '',
    eventType: 'performance',
    attachments: [] as File[]
  });
  const [selectedEngagementEventType, setSelectedEngagementEventType] = useState<'performance' | 'parade' | 'competition' | 'concert' | 'other'>('performance');
  const [customEngagementEventType, setCustomEngagementEventType] = useState('');
  const [engagementVenueAddress, setEngagementVenueAddress] = useState({
    region: '',
    province: '',
    city: '',
    barangay: '',
    street: '',
  });
  const [regionOptions, setRegionOptions] = useState<PsgcItem[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<PsgcItem[]>([]);
  const [cityOptions, setCityOptions] = useState<PsgcItem[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<PsgcItem[]>([]);
  const [isLoadingVenueOptions, setIsLoadingVenueOptions] = useState(false);

  const [engagementErrors, setEngagementErrors] = useState<Record<string, string>>({});
  const [engagementTouched, setEngagementTouched] = useState<Record<string, boolean>>({});
  const [engagementFormSummary, setEngagementFormSummary] = useState('');

  const getTodayDateValue = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  };

  const validateEngagementForm = () => {
    const errors: Record<string, string> = {};
    const requiredFields: Array<keyof typeof newEngagement> = [
      'eventName', 'eventType', 'organization', 'description', 'date', 'time', 'venue',
    ];

    requiredFields.forEach((field) => {
      if (!String(newEngagement[field] || '').trim()) {
        errors[field] = 'This field is required';
      }
    });

    if (newEngagement.description.trim() && newEngagement.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (newEngagement.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEngagement.contactEmail.trim())) {
      errors.contactEmail = 'Enter a valid email address';
    }

    if (newEngagement.contactPhone.trim()) {
      const normalized = newEngagement.contactPhone.replace(/[\s-]/g, '');
      if (!/^(?:\+63|0)?9\d{9}$/.test(normalized)) {
        errors.contactPhone = 'Use valid PH mobile format (e.g. 09171234567 or +639171234567)';
      }
    }

    const addressComplete = Boolean(
      engagementVenueAddress.region &&
      (provinceOptions.length === 0 || engagementVenueAddress.province) &&
      engagementVenueAddress.city &&
      engagementVenueAddress.barangay &&
      engagementVenueAddress.street.trim(),
    );

    if (!addressComplete) {
      errors.venue = 'Complete venue address: region, province, city, barangay, and street';
    }

    if (newEngagement.date) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const selectedDate = new Date(`${newEngagement.date}T00:00:00`);

      if (selectedDate < todayStart) {
        errors.date = 'Date cannot be in the past';
      }

      if (!errors.date && newEngagement.time && selectedDate.getTime() === todayStart.getTime()) {
        const selectedDateTime = new Date(`${newEngagement.date}T${newEngagement.time}`);
        if (selectedDateTime <= today) {
          errors.time = 'Time must be later than current time for today';
        }
      }
    }

    setEngagementErrors(errors);
    setEngagementFormSummary(Object.keys(errors).length > 0 ? 'Please fix the highlighted fields before submitting.' : '');
    return Object.keys(errors).length === 0;
  };

  const handleEngagementFieldBlur = (field: string) => {
    setEngagementTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fetchLocationItems = useCallback(async (endpoint: string, params?: Record<string, string>) => {
    const response = await api.get<{ data?: any[] }>(endpoint, { params });
    const rows = response.data?.data ?? [];
    if (!Array.isArray(rows)) return [] as PsgcItem[];

    return rows
      .map((row: any) => ({
        code: String(row.code ?? ''),
        name: String(row.name ?? ''),
      }))
      .filter((row: PsgcItem) => row.code && row.name)
      .sort((a: PsgcItem, b: PsgcItem) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRegions = async () => {
      try {
        setIsLoadingVenueOptions(true);
        const rows = await fetchLocationItems('/locations/regions');
        if (!cancelled) {
          setRegionOptions(rows);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load regions for venue');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVenueOptions(false);
        }
      }
    };

    void loadRegions();

    return () => {
      cancelled = true;
    };
  }, [fetchLocationItems]);

  useEffect(() => {
    let cancelled = false;

    const loadProvinceOrRegionCities = async () => {
      if (!engagementVenueAddress.region) {
        setProvinceOptions([]);
        setCityOptions([]);
        setBarangayOptions([]);
        return;
      }

      try {
        setIsLoadingVenueOptions(true);
        const selectedRegion = regionOptions.find((item) => item.name === engagementVenueAddress.region);
        if (!selectedRegion) return;

        const provinces = await fetchLocationItems('/locations/provinces', {
          region_code: selectedRegion.code,
        });
        if (cancelled) return;

        setProvinceOptions(provinces);
        setCityOptions([]);
        setBarangayOptions([]);

        if (provinces.length === 0) {
          const regionCities = await fetchLocationItems('/locations/cities', {
            region_code: selectedRegion.code,
          });
          if (!cancelled) {
            setCityOptions(regionCities);
          }
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load provinces/cities');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVenueOptions(false);
        }
      }
    };

    void loadProvinceOrRegionCities();

    return () => {
      cancelled = true;
    };
  }, [engagementVenueAddress.region, fetchLocationItems, regionOptions]);

  useEffect(() => {
    let cancelled = false;

    const loadCities = async () => {
      if (!engagementVenueAddress.region || !engagementVenueAddress.province) {
        if (provinceOptions.length > 0) {
          setCityOptions([]);
        }
        setBarangayOptions([]);
        return;
      }

      try {
        setIsLoadingVenueOptions(true);
        const selectedProvince = provinceOptions.find((item) => item.name === engagementVenueAddress.province);
        if (!selectedProvince) return;

        const cities = await fetchLocationItems('/locations/cities', {
          province_code: selectedProvince.code,
        });
        if (!cancelled) {
          setCityOptions(cities);
          setBarangayOptions([]);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load cities/municipalities');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVenueOptions(false);
        }
      }
    };

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [engagementVenueAddress.region, engagementVenueAddress.province, fetchLocationItems, provinceOptions]);

  useEffect(() => {
    let cancelled = false;

    const loadBarangays = async () => {
      if (!engagementVenueAddress.city) {
        setBarangayOptions([]);
        return;
      }

      try {
        setIsLoadingVenueOptions(true);
        const selectedCity = cityOptions.find((item) => item.name === engagementVenueAddress.city);
        if (!selectedCity) return;

        const barangays = await fetchLocationItems('/locations/barangays', {
          city_code: selectedCity.code,
        });
        if (!cancelled) {
          setBarangayOptions(barangays);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load barangays');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVenueOptions(false);
        }
      }
    };

    void loadBarangays();

    return () => {
      cancelled = true;
    };
  }, [engagementVenueAddress.city, fetchLocationItems, cityOptions]);

  useEffect(() => {
    const venueParts = [
      engagementVenueAddress.street.trim(),
      engagementVenueAddress.barangay,
      engagementVenueAddress.city,
      engagementVenueAddress.province,
      engagementVenueAddress.region,
    ].filter(Boolean);

    const composedVenue = venueParts.join(', ');
    setNewEngagement((prev) => (
      prev.venue === composedVenue ? prev : { ...prev, venue: composedVenue }
    ));
  }, [engagementVenueAddress]);

  const adminForDirectorApproval = engagements.filter((e: any) => e.rawStatus === 'pending_director_approval');
  const acceptedEngagements = engagements.filter(e => e.status === 'scheduled');
  const directorForAdminApproval = engagements.filter((e: any) => e.rawStatus === 'pending_admin_approval');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcomingAcceptedEngagements = acceptedEngagements
    .filter(e => e.date >= todayStart)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastAcceptedEngagements = acceptedEngagements
    .filter(e => e.date < todayStart)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const sortedAcceptedEngagements = [...upcomingAcceptedEngagements, ...pastAcceptedEngagements];
  const upcomingRehearsals = rehearsals
    .filter(r => r.date >= todayStart)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastRehearsals = rehearsals
    .filter(r => r.date < todayStart)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const sortedRehearsals = [...upcomingRehearsals, ...pastRehearsals];

  // Rehearsal handlers
  const handleCreateRehearsal = async () => {
    if (!newRehearsal.title || !newRehearsal.date || !newRehearsal.time || !newRehearsal.venue) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for schedule conflicts (Process 6.1.3)
    const proposedDateTime = new Date(`${newRehearsal.date}T${newRehearsal.time}`);
    const hasConflict = [...rehearsals, ...acceptedEngagements].some(event => {
      const eventDate = event.date;
      const eventTime = 'time' in event ? event.time : '';
      const eventDateTime = new Date(`${eventDate.toISOString().split('T')[0]}T${eventTime}`);
      return Math.abs(eventDateTime.getTime() - proposedDateTime.getTime()) < 3600000; // Within 1 hour
    });

    if (hasConflict) {
      toast.error('Schedule conflict detected', {
        description: 'A rehearsal or engagement already exists at this date and time for your talent group. Please choose a different time.',
      });
      return;
    }

    try {
      await engagementService.createEngagement({
        event_name: newRehearsal.title,
        date: newRehearsal.date,
        time: newRehearsal.time,
        venue: newRehearsal.venue,
        description: newRehearsal.description,
        type: 'rehearsal',
        is_required: true,
        status: 'scheduled',
        talent_groups: [talentGroup],
      });
      await loadEngagementData();
      setRehearsalViewTab('upcoming');
      setNewRehearsal({
        title: '',
        date: '',
        time: '',
        venue: '',
        description: ''
      });
      setSelectedRehearsalVenue('');
      toast.success('Rehearsal created successfully');
    } catch {
      toast.error('Failed to create rehearsal');
    }
  };

  // Engagement handlers
  const handleCreateEngagementRequest = async () => {
    setEngagementTouched({
      eventName: true,
      eventType: true,
      description: true,
      organization: true,
      date: true,
      time: true,
      venue: true,
      contactEmail: true,
      contactPhone: true,
    });

    if (!validateEngagementForm()) {
      toast.warning('Please complete required fields and fix invalid inputs.');
      return;
    }

    // Check for schedule conflicts (warning only for engagements - Process 8.7.6)
    const proposedDateTime = new Date(`${newEngagement.date}T${newEngagement.time}`);
    const hasConflict = [...rehearsals, ...acceptedEngagements].some(event => {
      const eventDate = event.date;
      const eventTime = 'time' in event ? event.time : '';
      const eventDateTime = new Date(`${eventDate.toISOString().split('T')[0]}T${eventTime}`);
      return Math.abs(eventDateTime.getTime() - proposedDateTime.getTime()) < 3600000;
    });

    if (hasConflict) {
      toast.warning('Schedule conflict detected', {
        description: 'Note: There is an existing event at this time. You can still submit - admin will review.',
      });
    }

    try {
      const normalizedEventType = ['performance', 'workshop', 'competition', 'parade'].includes(selectedEngagementEventType)
        ? selectedEngagementEventType
        : 'performance';
      const composedDescription = [
        newEngagement.description.trim(),
        newEngagement.attire.trim() ? `Attire: ${newEngagement.attire.trim()}` : '',
        selectedEngagementEventType === 'other' && customEngagementEventType.trim()
          ? `Event Type: ${customEngagementEventType.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      await engagementService.createEngagement({
        event_name: newEngagement.eventName,
        date: newEngagement.date,
        time: newEngagement.time,
        venue: newEngagement.venue,
        venue_region: engagementVenueAddress.region,
        venue_province: engagementVenueAddress.province || null,
        venue_city: engagementVenueAddress.city,
        venue_barangay: engagementVenueAddress.barangay,
        venue_street: engagementVenueAddress.street,
        description: composedDescription,
        organization_name: newEngagement.organization,
        contact_person: newEngagement.contactPerson,
        contact_email: newEngagement.contactEmail,
        contact_phone: newEngagement.contactPhone,
        attachments: newEngagement.attachments.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
        type: normalizedEventType as any,
        status: 'pending_admin_approval',
        is_required: false,
        talent_groups: [talentGroup],
      });
      await loadEngagementData();
      setNewEngagement({
        eventName: '',
        organization: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        date: '',
        time: '',
        venue: '',
        attire: '',
        description: '',
        eventType: 'performance',
        attachments: []
      });
      setSelectedEngagementEventType('performance');
      setCustomEngagementEventType('');
      setEngagementVenueAddress({
        region: '',
        province: '',
        city: '',
        barangay: '',
        street: '',
      });
      setEngagementErrors({});
      setEngagementTouched({});
      setEngagementFormSummary('');
      toast.success('Engagement request submitted');
    } catch {
      toast.error('Failed to submit engagement request');
    }
  };

  const handleAcceptEngagement = async (id: string) => {
    try {
      await engagementService.updateEngagement(id, { status: 'scheduled' });
      await loadEngagementData();
      toast.success('Engagement accepted');
    } catch {
      toast.error('Failed to accept engagement');
    }
  };

  const handleRejectEngagement = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await engagementService.updateEngagement(id, { status: 'rejected' });
      await loadEngagementData();
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedEvent(null);
      toast.success('Engagement rejected');
    } catch {
      toast.error('Failed to reject engagement');
    }
  };

  const handleDeleteRehearsal = async (id: string) => {
    try {
      await engagementService.deleteEngagement(id);
      await loadEngagementData();
      toast.success('Rehearsal deleted');
    } catch {
      toast.error('Failed to delete rehearsal');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setNewEngagement({ ...newEngagement, attachments: [...newEngagement.attachments, ...validFiles] });
  };

  const handleRemoveFile = (index: number) => {
    setNewEngagement({
      ...newEngagement,
      attachments: newEngagement.attachments.filter((_, i) => i !== index)
    });
  };

  // Attendance handlers (Process 7.0)
  const handleOpenAttendance = async (event: any) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 86400000);

    // Block if event hasn't started yet (future event)
    if (eventDate >= tomorrowStart) {
      toast.error('Attendance cannot be marked yet — the event has not happened.');
      return;
    }

    try {
      setSelectedEvent(event);
      // Past event = read-only view; today's event = editable
      setAttendanceReadOnly(eventDate < todayStart);
      const dateKey = formatDateKey(event.date);
      const rows = await trainingClient.getAttendance({ date_from: dateKey, date_to: dateKey });
      const byUserId: Record<string, 'present' | 'absent' | 'excused'> = {};
      rows.forEach((row: any) => {
        const userId = String(row.userId ?? row.user_id ?? '');
        const status = (row.status || 'absent') as 'present' | 'absent' | 'excused';
        if (userId) byUserId[userId] = status;
      });

      setAttendanceList(prev => prev.map(s => ({
        ...s,
        status: byUserId[String(s.userId || '')] || 'absent',
      })));
      setShowAttendanceDialog(true);
    } catch {
      toast.error('Failed to load attendance for this session');
    }
  };

  const handleMarkAttendance = (scholarId: string, status: 'present' | 'absent' | 'excused') => {
    setAttendanceList(attendanceList.map(s =>
      s.id === scholarId ? { ...s, status } : s
    ));
  };

  const handleSaveAttendance = async () => {
    if (!selectedEvent) return;

    try {
      const sessionDate = formatDateKey(selectedEvent.date);
      const records = attendanceList
        .map((s: any) => {
          const status = (s.status === 'present' || s.status === 'excused' || s.status === 'absent' ? s.status : 'absent') as 'present' | 'absent' | 'excused';
          return s.userId ? { user_id: Number(s.userId), status } : null;
        })
        .filter(Boolean) as Array<{ user_id: number; status: 'present' | 'absent' | 'excused' }>;

      await trainingClient.upsertAttendanceSession({
        session_date: sessionDate,
        no_practice: false,
        records,
      });

      setAttendanceMarkedDates(prev => new Set([...prev, sessionDate]));
      await loadEngagementData();

      setShowAttendanceDialog(false);
      setSelectedEvent(null);
      setAttendanceReadOnly(false);
      toast.success('Attendance saved successfully');
    } catch {
      toast.error('Failed to save attendance');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const openAttachment = (file: any) => {
    const backendBase = ((import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
    const rawTarget = file?.url || file?.path;
    const normalized = String(rawTarget || '').replace(/^\/+/, '');
    const finalUrl = /^https?:\/\//i.test(String(rawTarget || ''))
      ? String(rawTarget)
      : `${backendBase}/storage/${normalized}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const formatEventType = (value: string | undefined) => {
    const source = String(value || 'performance').toLowerCase();
    if (source === 'workshop') return 'Workshop';
    if (source === 'competition') return 'Competition';
    if (source === 'rehearsal') return 'Rehearsal';
    return 'Performance';
  };

  return (
    <div className="space-y-6">
      {/* Tabs for Engagements and Rehearsals */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1 mb-6">
        <Button
          variant={activeTab === 'engagements' ? 'default' : 'outline'}
          onClick={() => setActiveTab('engagements')}
          className={`shrink-0 whitespace-nowrap ${activeTab === 'engagements' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          External Engagements
        </Button>
        <Button
          variant={activeTab === 'rehearsals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rehearsals')}
          className={`shrink-0 whitespace-nowrap ${activeTab === 'rehearsals' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
        >
          <Music className="w-4 h-4 mr-2" />
          Rehearsals
        </Button>
      </div>

      {/* Engagements Tab */}
      {activeTab === 'engagements' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DashboardQuickStatCard
              label="Admin Created (Needs Decision)"
              value={adminForDirectorApproval.length}
              onClick={() => setEngagementViewTab('approval-queues')}
            />

            <DashboardQuickStatCard
              label="Accepted"
              value={acceptedEngagements.length}
              onClick={() => setEngagementViewTab('accepted-list')}
            />

            <DashboardQuickStatCard
              label="Your Requests (Waiting Admin)"
              value={directorForAdminApproval.length}
              onClick={() => setEngagementViewTab('approval-queues')}
            />

            <DashboardQuickStatCard
              label="Total"
              value={engagements.length}
              onClick={() => setEngagementViewTab('accepted-list')}
            />
          </div>

          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1">
            <Button
              variant={engagementViewTab === 'create-request' ? 'default' : 'outline'}
              onClick={() => setEngagementViewTab('create-request')}
              className={`shrink-0 whitespace-nowrap ${engagementViewTab === 'create-request' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Request
            </Button>
            <Button
              variant={engagementViewTab === 'approval-queues' ? 'default' : 'outline'}
              onClick={() => setEngagementViewTab('approval-queues')}
              className={`shrink-0 whitespace-nowrap ${engagementViewTab === 'approval-queues' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Approval Queues
            </Button>
            <Button
              variant={engagementViewTab === 'accepted-list' ? 'default' : 'outline'}
              onClick={() => setEngagementViewTab('accepted-list')}
              className={`shrink-0 whitespace-nowrap ${engagementViewTab === 'accepted-list' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              List of Engagements
            </Button>
          </div>

          <div id="section-all-engagements">
            {engagementViewTab === 'create-request' && (
              <Card className="border-[#e0e0e0]">
                <CardHeader>
                  <CardTitle className="text-[#7A1E1E]">Create Engagement Request</CardTitle>
                  <CardDescription>Submit a new performance opportunity for admin approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {engagementFormSummary && (
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-700">{engagementFormSummary}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="eventNameInline">Event Name <span aria-hidden="true">*</span></Label>
                      <Input
                        id="eventNameInline"
                        value={newEngagement.eventName}
                        onChange={(e) => setNewEngagement({ ...newEngagement, eventName: e.target.value })}
                        onBlur={() => handleEngagementFieldBlur('eventName')}
                        placeholder="e.g., Regional Arts Competition"
                        className={engagementTouched.eventName && engagementErrors.eventName ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                        required
                        aria-required="true"
                      />
                      {engagementTouched.eventName && engagementErrors.eventName && (
                        <p className="text-red-500 text-xs" role="alert">{engagementErrors.eventName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventTypeInline">Event Type <span aria-hidden="true">*</span></Label>
                      <Select
                        value={selectedEngagementEventType || undefined}
                        onValueChange={(value) => {
                          const normalized = value as 'performance' | 'parade' | 'competition' | 'concert' | 'other';
                          setSelectedEngagementEventType(normalized);
                          if (normalized !== 'other') {
                            setCustomEngagementEventType('');
                            setNewEngagement({ ...newEngagement, eventType: normalized });
                          } else {
                            setNewEngagement({ ...newEngagement, eventType: '' });
                          }
                        }}
                      >
                        <SelectTrigger
                          id="eventTypeInline"
                          className={`h-10 text-sm ${
                            engagementTouched.eventType && engagementErrors.eventType ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                          }`}
                          onBlur={() => handleEngagementFieldBlur('eventType')}
                          aria-required="true"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="parade">Parade</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="other">Other (Specify)</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedEngagementEventType === 'other' && (
                        <Input
                          id="eventTypeOtherInline"
                          value={customEngagementEventType}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCustomEngagementEventType(value);
                            setNewEngagement({ ...newEngagement, eventType: value });
                          }}
                          onBlur={() => handleEngagementFieldBlur('eventType')}
                          placeholder="Specify event type"
                          className={engagementTouched.eventType && engagementErrors.eventType ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                          required
                          aria-required="true"
                        />
                      )}
                      {engagementTouched.eventType && engagementErrors.eventType && (
                        <p className="text-red-500 text-xs" role="alert">{engagementErrors.eventType}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionInline">Description <span aria-hidden="true">*</span></Label>
                      <Textarea
                        id="descriptionInline"
                        value={newEngagement.description}
                        onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                        onBlur={() => handleEngagementFieldBlur('description')}
                        placeholder="Brief description of the event"
                        rows={3}
                        className={engagementTouched.description && engagementErrors.description ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                        required
                        aria-required="true"
                      />
                      {engagementTouched.description && engagementErrors.description && (
                        <p className="text-red-500 text-xs" role="alert">{engagementErrors.description}</p>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Organizer Information</h4>
                      <div className="space-y-2">
                        <Label htmlFor="organizationInline">Organization Name <span aria-hidden="true">*</span></Label>
                        <Input
                          id="organizationInline"
                          value={newEngagement.organization}
                          onChange={(e) => setNewEngagement({ ...newEngagement, organization: e.target.value })}
                          onBlur={() => handleEngagementFieldBlur('organization')}
                          placeholder="e.g., Bicol Arts Council"
                          className={engagementTouched.organization && engagementErrors.organization ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                          required
                          aria-required="true"
                        />
                        {engagementTouched.organization && engagementErrors.organization && (
                          <p className="text-red-500 text-xs" role="alert">{engagementErrors.organization}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonInline">Contact Person</Label>
                          <Input
                            id="contactPersonInline"
                            value={newEngagement.contactPerson}
                            onChange={(e) => setNewEngagement({ ...newEngagement, contactPerson: e.target.value })}
                            placeholder="e.g., Juan Dela Cruz"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmailInline">Contact Email</Label>
                          <Input
                            id="contactEmailInline"
                            type="email"
                            value={newEngagement.contactEmail}
                            onChange={(e) => setNewEngagement({ ...newEngagement, contactEmail: e.target.value })}
                            onBlur={() => handleEngagementFieldBlur('contactEmail')}
                            placeholder="email@example.com"
                            className={engagementTouched.contactEmail && engagementErrors.contactEmail ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                          />
                          {engagementTouched.contactEmail && engagementErrors.contactEmail && (
                            <p className="text-red-500 text-xs" role="alert">{engagementErrors.contactEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhoneInline">Contact Phone</Label>
                        <Input
                          id="contactPhoneInline"
                          value={newEngagement.contactPhone}
                          onChange={(e) => setNewEngagement({ ...newEngagement, contactPhone: e.target.value })}
                          onBlur={() => handleEngagementFieldBlur('contactPhone')}
                          placeholder="+63 XXX XXX XXXX"
                          className={engagementTouched.contactPhone && engagementErrors.contactPhone ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                        />
                        {engagementTouched.contactPhone && engagementErrors.contactPhone && (
                          <p className="text-red-500 text-xs" role="alert">{engagementErrors.contactPhone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Date & Venue</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="engDateInline">Date <span aria-hidden="true">*</span></Label>
                          <Input
                            id="engDateInline"
                            type="date"
                            min={getTodayDateValue()}
                            value={newEngagement.date}
                            onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
                            onBlur={() => handleEngagementFieldBlur('date')}
                            className={engagementTouched.date && engagementErrors.date ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                            required
                            aria-required="true"
                          />
                          {engagementTouched.date && engagementErrors.date && (
                            <p className="text-red-500 text-xs" role="alert">{engagementErrors.date}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="engTimeInline">Time <span aria-hidden="true">*</span></Label>
                          <Input
                            id="engTimeInline"
                            type="time"
                            value={newEngagement.time}
                            onChange={(e) => setNewEngagement({ ...newEngagement, time: e.target.value })}
                            onBlur={() => handleEngagementFieldBlur('time')}
                            className={engagementTouched.time && engagementErrors.time ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                            required
                            aria-required="true"
                          />
                          {engagementTouched.time && engagementErrors.time && (
                            <p className="text-red-500 text-xs" role="alert">{engagementErrors.time}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engVenueInline">Venue <span aria-hidden="true">*</span></Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="engVenueRegionInline" className="text-xs text-muted-foreground">Region</Label>
                            <Select
                              value={engagementVenueAddress.region || undefined}
                              onValueChange={(value) => {
                                setEngagementVenueAddress((prev) => ({
                                  ...prev,
                                  region: value,
                                  province: '',
                                  city: '',
                                  barangay: '',
                                }));
                              }}
                            >
                              <SelectTrigger
                                id="engVenueRegionInline"
                                className={`h-10 text-sm ${
                                  engagementTouched.venue && engagementErrors.venue ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                                }`}
                                onBlur={() => handleEngagementFieldBlur('venue')}
                                aria-required="true"
                              >
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                {regionOptions.map((region) => (
                                  <SelectItem key={region.code} value={region.name}>{region.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="engVenueProvinceInline" className="text-xs text-muted-foreground">Province</Label>
                            <Select
                              value={engagementVenueAddress.province || undefined}
                              onValueChange={(value) => {
                                setEngagementVenueAddress((prev) => ({
                                  ...prev,
                                  province: value,
                                  city: '',
                                  barangay: '',
                                }));
                              }}
                              disabled={!engagementVenueAddress.region || provinceOptions.length === 0}
                            >
                              <SelectTrigger
                                id="engVenueProvinceInline"
                                className={`h-10 text-sm ${
                                  engagementTouched.venue && engagementErrors.venue ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                                }`}
                                onBlur={() => handleEngagementFieldBlur('venue')}
                                aria-required="true"
                              >
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                              <SelectContent>
                                {provinceOptions.map((province) => (
                                  <SelectItem key={province.code} value={province.name}>{province.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="engVenueCityInline" className="text-xs text-muted-foreground">City / Municipality</Label>
                            <Select
                              value={engagementVenueAddress.city || undefined}
                              onValueChange={(value) => {
                                setEngagementVenueAddress((prev) => ({
                                  ...prev,
                                  city: value,
                                  barangay: '',
                                }));
                              }}
                              disabled={!engagementVenueAddress.region || (provinceOptions.length > 0 && !engagementVenueAddress.province)}
                            >
                              <SelectTrigger
                                id="engVenueCityInline"
                                className={`h-10 text-sm ${
                                  engagementTouched.venue && engagementErrors.venue ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                                }`}
                                onBlur={() => handleEngagementFieldBlur('venue')}
                                aria-required="true"
                              >
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                {cityOptions.map((city) => (
                                  <SelectItem key={city.code} value={city.name}>{city.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="engVenueBarangayInline" className="text-xs text-muted-foreground">Barangay</Label>
                            <Select
                              value={engagementVenueAddress.barangay || undefined}
                              onValueChange={(value) => {
                                setEngagementVenueAddress((prev) => ({ ...prev, barangay: value }));
                              }}
                              disabled={!engagementVenueAddress.city}
                            >
                              <SelectTrigger
                                id="engVenueBarangayInline"
                                className={`h-10 text-sm ${
                                  engagementTouched.venue && engagementErrors.venue ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                                }`}
                                onBlur={() => handleEngagementFieldBlur('venue')}
                                aria-required="true"
                              >
                                <SelectValue placeholder="Select barangay" />
                              </SelectTrigger>
                              <SelectContent>
                                {barangayOptions.map((barangay) => (
                                  <SelectItem key={barangay.code} value={barangay.name}>{barangay.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {isLoadingVenueOptions && (
                          <p className="text-xs text-muted-foreground">Loading location choices...</p>
                        )}

                        <Input
                          id="engVenueStreetInline"
                          value={engagementVenueAddress.street}
                          onChange={(e) => setEngagementVenueAddress((prev) => ({ ...prev, street: e.target.value }))}
                          onBlur={() => handleEngagementFieldBlur('venue')}
                          placeholder="Street / Building / Landmark"
                          className={engagementTouched.venue && engagementErrors.venue ? 'border-red-600 ring-1 ring-red-500/30' : ''}
                          required
                          aria-required="true"
                        />
                        {newEngagement.venue && (
                          <p className="text-xs text-muted-foreground">Full venue: {newEngagement.venue}</p>
                        )}
                        {engagementTouched.venue && engagementErrors.venue && (
                          <p className="text-red-500 text-xs" role="alert">{engagementErrors.venue}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engAttireInline">Attire</Label>
                        <Input
                          id="engAttireInline"
                          value={newEngagement.attire}
                          onChange={(e) => setNewEngagement({ ...newEngagement, attire: e.target.value })}
                          placeholder="e.g., Formal black, School uniform, Casual"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Label>Attachments</Label>
                      <p className="text-xs text-[#6c757d]">Upload supporting documents (PDF, DOC, DOCX, JPG, PNG - Max 5MB each)</p>
                      <div className="border-2 border-dashed rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload-inline"
                        />
                        <label htmlFor="file-upload-inline" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-[#6c757d] mb-2" />
                            <p className="text-sm text-[#6c757d]">Click to upload files</p>
                          </div>
                        </label>
                      </div>

                      {newEngagement.attachments.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {newEngagement.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <div>
                                  <p className="text-sm">{file.name}</p>
                                  <p className="text-xs text-[#6c757d]">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(idx)}
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-orange-50 rounded flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-orange-800">
                        This request will be sent to admin for review and approval before being finalized.
                        You will be notified once a decision is made.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleCreateEngagementRequest}
                        className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit for Approval
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Combined approval queues */}
            {engagementViewTab === 'approval-queues' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card id="section-pending-engagements" className="border-[#e0e0e0]">
                <CardHeader>
                  <CardTitle className="text-[#7A1E1E]">Admin Engagements For Your Approval</CardTitle>
                  <CardDescription>Accept or reject engagements created by admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    {adminForDirectorApproval.length > 0 ? (
                      <div className="space-y-4">
                        {adminForDirectorApproval.map((engagement) => (
                          <div key={engagement.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-[#7A1E1E]">{engagement.eventName}</h4>
                                <p className="text-sm text-[#6c757d] mt-1">{engagement.description}</p>
                                <p className="text-xs text-[#6c757d] mt-2">
                                  From: {engagement.requesterName} ({engagement.requesterOrg})
                                </p>
                              </div>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-[#6c757d]">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {engagement.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {engagement.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {engagement.venue}
                              </div>
                            </div>

                            {engagement.attachments.length > 0 && (
                              <div className="mt-3 p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium text-[#6c757d] mb-2">Attachments:</p>
                                {engagement.attachments.map((file: any) => (
                                  <div key={file.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="w-3 h-3" />
                                      <span>{file.name}</span>
                                      {file.size > 0 && <span className="text-[#6c757d]">({formatFileSize(file.size)})</span>}
                                    </div>
                                    {(file.url || file.path) && (
                                      <Button variant="ghost" size="sm" className="h-6" onClick={() => {
                                        const backendBase = ((import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
                                        const rawTarget = file.url || file.path;
                                        const normalized = String(rawTarget || '').replace(/^\/+/, '');
                                        const finalUrl = /^https?:\/\//i.test(String(rawTarget || ''))
                                          ? String(rawTarget)
                                          : `${backendBase}/storage/${normalized}`;
                                        window.open(finalUrl, '_blank', 'noopener,noreferrer');
                                      }}>
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptEngagement(engagement.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedEvent(engagement);
                                  setShowRejectDialog(true);
                                }}
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No admin engagements pending your decision</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card id="section-awaiting-approval" className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-orange-700 flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Your Engagement Requests (Waiting Admin Approval)
                  </CardTitle>
                  <CardDescription>These are your submitted requests that admin still needs to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    {directorForAdminApproval.length > 0 ? (
                      <div className="space-y-4">
                        {directorForAdminApproval.map((engagement) => (
                          <div key={engagement.id} className="border border-orange-200 rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium">{engagement.eventName}</h4>
                                <p className="text-sm text-[#6c757d] mt-1">{engagement.description}</p>
                              </div>
                              <Badge className="bg-orange-500">Pending Approval</Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-[#6c757d]">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {engagement.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {engagement.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {engagement.venue}
                              </div>
                            </div>

                            {engagement.attachments.length > 0 && (
                              <div className="mt-3 p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium text-[#6c757d] mb-2">Attachments:</p>
                                {engagement.attachments.map((file: any) => (
                                  <div key={file.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="w-3 h-3" />
                                      <span>{file.name}</span>
                                    </div>
                                    {(file.url || file.path) && (
                                      <Button variant="ghost" size="sm" className="h-6" onClick={() => {
                                        const backendBase = ((import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
                                        const rawTarget = file.url || file.path;
                                        const normalized = String(rawTarget || '').replace(/^\/+/, '');
                                        const finalUrl = /^https?:\/\//i.test(String(rawTarget || ''))
                                          ? String(rawTarget)
                                          : `${backendBase}/storage/${normalized}`;
                                        window.open(finalUrl, '_blank', 'noopener,noreferrer');
                                      }}>
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-3 p-2 bg-blue-50 rounded flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                              <p className="text-xs text-blue-800">
                                This request is being reviewed by admin. You'll be notified once a decision is made.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No requests are waiting for admin approval</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Accepted Events */}
            {engagementViewTab === 'accepted-list' && (
            <Card id="section-accepted-engagements" className="border-[#e0e0e0]">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E]">Accepted Engagements</CardTitle>
                <CardDescription>Upcoming/current engagements are shown first; past engagements are listed below.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {sortedAcceptedEngagements.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="hidden md:grid grid-cols-12 gap-2 bg-[#F8F9FA] border-b px-3 py-2 text-xs font-semibold text-[#6C757D]">
                        <div className="col-span-4">Event</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Venue</div>
                        <div className="col-span-2 text-right">Action</div>
                      </div>

                      <div className="divide-y">
                        {sortedAcceptedEngagements.map((engagement) => {
                          const isPastEngagement = engagement.date < todayStart;
                          const isFutureEngagement = engagement.date >= new Date(todayStart.getTime() + 86400000);
                          const isToday = !isPastEngagement && !isFutureEngagement;
                          return (
                          <div key={engagement.id} className="px-3 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                              <div className="md:col-span-4 min-w-0">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="font-medium truncate text-left hover:underline"
                                    onClick={() => {
                                      setSelectedEngagementDetails(engagement);
                                      setShowEngagementDetailsDialog(true);
                                    }}
                                  >
                                    {engagement.eventName}
                                  </button>
                                  <Badge className="bg-green-600 shrink-0">Accepted</Badge>
                                  {isPastEngagement && <Badge variant="secondary" className="shrink-0">Past</Badge>}
                                </div>
                              </div>

                              <div className="md:col-span-2 text-sm text-[#6c757d] flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {engagement.date.toLocaleDateString()}
                              </div>

                              <div className="md:col-span-2 text-sm text-[#6c757d] flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {engagement.time}
                              </div>

                              <div className="md:col-span-2 text-sm text-[#6c757d] flex items-center min-w-0">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{engagement.venue}</span>
                              </div>

                              <div className="md:col-span-2 flex justify-start md:justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenAttendance(engagement)}
                                  disabled={isFutureEngagement}
                                  title={isFutureEngagement ? 'Attendance can only be marked on the day of the event' : undefined}
                                  className={isFutureEngagement ? 'opacity-40 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : 'bg-[#7A1E1E] hover:bg-[#5a1616]'}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  {isPastEngagement ? 'View Attendance' : isFutureEngagement ? 'Not Yet' : 'Check Attendance'}
                                </Button>
                              </div>
                            </div>

                          </div>
                        );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No accepted engagements</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            )}
          </div>
        </>
      )}

      {/* Rehearsals Tab */}
      {activeTab === 'rehearsals' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <DashboardQuickStatCard
              label="List of Rehearsals"
              value={rehearsals.length}
              onClick={() => setRehearsalViewTab('upcoming')}
            />

            <DashboardQuickStatCard
              label="Upcoming Rehearsals"
              value={upcomingRehearsals.length}
              onClick={() => setRehearsalViewTab('upcoming')}
            />
          </div>

          {/* Rehearsal View Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1">
            <Button
              variant={rehearsalViewTab === 'create-rehearsal' ? 'default' : 'outline'}
              onClick={() => setRehearsalViewTab('create-rehearsal')}
              className={`shrink-0 whitespace-nowrap ${rehearsalViewTab === 'create-rehearsal' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Rehearsal
            </Button>
            <Button
              variant={rehearsalViewTab === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setRehearsalViewTab('upcoming')}
              className={`shrink-0 whitespace-nowrap ${rehearsalViewTab === 'upcoming' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              List of Rehearsals ({rehearsals.length})
            </Button>
          </div>

          {/* Create Rehearsal View */}
          {rehearsalViewTab === 'create-rehearsal' && (
            <Card className="border-[#e0e0e0]">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E]">Create Rehearsal</CardTitle>
                <CardDescription>Create a new practice session for {talentGroup}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rehearsal-title-inline">Rehearsal Title <span aria-hidden="true">*</span></Label>
                    <Input
                      id="rehearsal-title-inline"
                      value={newRehearsal.title}
                      onChange={(e) => setNewRehearsal({ ...newRehearsal, title: e.target.value })}
                      placeholder="e.g., Weekly Practice Session"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rehearsal-date-inline">Date <span aria-hidden="true">*</span></Label>
                      <Input
                        id="rehearsal-date-inline"
                        type="date"
                        min={getTodayDateValue()}
                        value={newRehearsal.date}
                        onChange={(e) => setNewRehearsal({ ...newRehearsal, date: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rehearsal-time-inline">Time <span aria-hidden="true">*</span></Label>
                      <Input
                        id="rehearsal-time-inline"
                        type="time"
                        value={newRehearsal.time}
                        onChange={(e) => setNewRehearsal({ ...newRehearsal, time: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rehearsal-venue-inline">Venue <span aria-hidden="true">*</span></Label>
                    <select
                      id="rehearsal-venue-inline"
                      value={selectedRehearsalVenue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedRehearsalVenue(value);
                        if (value !== 'other') {
                          setNewRehearsal({ ...newRehearsal, venue: value });
                        } else {
                          setNewRehearsal({ ...newRehearsal, venue: '' });
                        }
                      }}
                      className="w-full border rounded-md px-3 py-2"
                      required
                      aria-required="true"
                    >
                      <option value="" disabled>Select venue</option>
                      <option value="Band Room">Band Room</option>
                      <option value="Music Building Hall">Music Building Hall</option>
                      <option value="Main Auditorium">Main Auditorium</option>
                      <option value="Gymnasium">Gymnasium</option>
                      <option value="Open Grounds">Open Grounds</option>
                      <option value="other">Other (type manually)</option>
                    </select>
                    {selectedRehearsalVenue === 'other' && (
                      <Input
                        id="rehearsal-venue-other-inline"
                        value={newRehearsal.venue}
                        onChange={(e) => setNewRehearsal({ ...newRehearsal, venue: e.target.value })}
                        placeholder="Type venue"
                        required
                        aria-required="true"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rehearsal-description-inline">Description</Label>
                    <Textarea
                      id="rehearsal-description-inline"
                      value={newRehearsal.description}
                      onChange={(e) => setNewRehearsal({ ...newRehearsal, description: e.target.value })}
                      placeholder="Brief description of the rehearsal"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateRehearsal}
                      className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rehearsal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rehearsal List View */}
          {rehearsalViewTab === 'upcoming' && (
            <Card className="border-[#e0e0e0]">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E]">List of Rehearsals</CardTitle>
                <CardDescription>Upcoming rehearsals are shown first; past rehearsals are listed below.</CardDescription>
              </CardHeader>
              <CardContent>
                {sortedRehearsals.length > 0 ? (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="hidden md:grid grid-cols-12 gap-2 bg-[#F8F9FA] border-b px-3 py-2 text-xs font-semibold text-[#6C757D]">
                        <div className="col-span-4">Rehearsal</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Venue</div>
                        <div className="col-span-2 text-right">Action</div>
                      </div>

                      <div className="divide-y">
                        {sortedRehearsals.map((rehearsal) => {
                          const isPastRehearsal = rehearsal.date < todayStart;
                          const isFutureRehearsal = rehearsal.date >= new Date(todayStart.getTime() + 86400000);
                          return (
                          <div key={rehearsal.id} className="px-3 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                              <div className="md:col-span-4 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium truncate text-left ${isPastRehearsal ? 'text-[#6c757d]' : 'text-[#7A1E1E]'}`}>{rehearsal.title}</p>
                                  {rehearsal.attendanceMarked && <Badge className="bg-green-600 shrink-0">Attendance Taken</Badge>}
                                  {isPastRehearsal && <Badge variant="secondary" className="shrink-0">Past</Badge>}
                                </div>
                                <p className={`text-xs mt-1 truncate ${isPastRehearsal ? 'text-[#94A3B8]' : 'text-[#6c757d]'}`}>{rehearsal.description || '—'}</p>
                              </div>

                              <div className="md:col-span-2 text-sm text-[#6c757d] flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {rehearsal.date.toLocaleDateString()}
                              </div>

                              <div className="md:col-span-2 text-sm text-[#6c757d] flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {rehearsal.time}
                              </div>

                              <div className="md:col-span-2 text-sm text-[#6c757d] flex items-center min-w-0">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{rehearsal.venue}</span>
                              </div>

                              <div className="md:col-span-2 flex justify-start md:justify-end gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenAttendance(rehearsal)}
                                  disabled={isFutureRehearsal}
                                  title={isFutureRehearsal ? 'Attendance can only be marked on the day of the rehearsal' : undefined}
                                  className={isFutureRehearsal ? 'opacity-40 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : 'bg-[#7A1E1E] hover:bg-[#5a1616]'}
                                >
                                  <Users className="w-4 h-4 mr-1" />
                                  {isPastRehearsal ? 'View Attendance' : isFutureRehearsal ? 'Not Yet' : 'Check Attendance'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No rehearsals in the list</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </>
      )}

      {/* Engagement Details Dialog */}
      <Dialog open={showEngagementDetailsDialog} onOpenChange={setShowEngagementDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Dialog title (visually hidden for a11y, visible header below) */}
          <DialogHeader className="pb-0">
            <DialogTitle className="text-[#7A1E1E] text-lg font-semibold">Engagement Details</DialogTitle>
            <DialogDescription className="text-sm text-[#6C757D]">Complete engagement information</DialogDescription>
          </DialogHeader>

          {/* Identity row */}
          <div className="py-3 border-b border-[#E0E0E0]">
            <p className="font-semibold text-[#3D3D3D] leading-tight">{selectedEngagementDetails?.eventName || '—'}</p>
            <p className="text-sm text-[#6C757D]">{formatEventType(selectedEngagementDetails?.eventType)}</p>
          </div>

          {/* Two-column sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4">

            {/* ── Event Information ──────────────────────── */}
            <div className="space-y-4">
              <h3 className="text-[#7A1E1E] font-semibold text-sm border-b border-[#E0E0E0] pb-1">Event Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#9E9E9E]">Event Date</p>
                  <p className="text-sm text-[#3D3D3D]">
                    {selectedEngagementDetails?.date
                      ? new Date(selectedEngagementDetails.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9E9E9E]">Time</p>
                  <p className="text-sm text-[#3D3D3D]">{selectedEngagementDetails?.time || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9E9E9E]">Venue</p>
                  <p className="text-sm text-[#3D3D3D]">{selectedEngagementDetails?.venue || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9E9E9E]">Description</p>
                  <p className="text-sm text-[#3D3D3D] leading-relaxed">{selectedEngagementDetails?.description || '—'}</p>
                </div>
              </div>
            </div>

            {/* ── Organizer Information ──────────────────── */}
            <div className="space-y-4">
              <h3 className="text-[#7A1E1E] font-semibold text-sm border-b border-[#E0E0E0] pb-1">Organizer Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#9E9E9E]">Organization Name</p>
                  <p className="text-sm text-[#3D3D3D]">{selectedEngagementDetails?.organization || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9E9E9E]">Contact Person</p>
                  <p className="text-sm text-[#3D3D3D]">{selectedEngagementDetails?.contactPerson || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9E9E9E]">Contact Email</p>
                  <p className="text-sm text-[#3D3D3D]">{selectedEngagementDetails?.contactEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9E9E9E]">Contact Phone</p>
                  <p className="text-sm text-[#3D3D3D]">{selectedEngagementDetails?.contactPhone || '—'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* ── Attachments (full width) ───────────────── */}
          <div className="space-y-3 border-t border-[#E0E0E0] pt-4">
            <h3 className="text-[#7A1E1E] font-semibold text-sm">Attachments</h3>
            {Array.isArray(selectedEngagementDetails?.attachments) && selectedEngagementDetails.attachments.length > 0 ? (
              <div className="space-y-2">
                {selectedEngagementDetails.attachments.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between px-3 py-2.5 border border-[#E0E0E0] rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                      <span className="text-sm text-[#3D3D3D] truncate">{file.name}</span>
                    </div>
                    {(file.url || file.path) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-[#7A1E1E] border-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white shrink-0 ml-3"
                        onClick={() => openAttachment(file)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#9E9E9E]">No attachments uploaded.</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
              onClick={() => setShowEngagementDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Engagement Dialog - NEW */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Engagement Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this engagement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Rejection Reason <span aria-hidden="true">*</span></Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Schedule conflict, insufficient preparation time, etc."
                rows={4}
                required
                aria-required="true"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
                setSelectedEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedEvent && handleRejectEngagement(selectedEvent.id)}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Attendance Dialog - NEW (Process 7.0) */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden" hideCloseButton>
          {/* Header */}
          <DialogHeader className="px-4 sm:px-6 py-4 border-b border-[#E0E0E0] shrink-0">
            <DialogTitle className="text-[#7A1E1E] text-base sm:text-lg">{attendanceReadOnly ? 'View Attendance' : 'Check Attendance'}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-[#6C757D] mt-0.5">
              {selectedEvent && ('title' in selectedEvent
                ? `${selectedEvent.title} — ${selectedEvent.date.toLocaleDateString()}`
                : `${selectedEvent.eventName} — ${selectedEvent.date.toLocaleDateString()}`
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Scholar list */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
            <div className="space-y-2">
              {attendanceList.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-2 p-3 border border-[#E0E0E0] rounded-lg">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[#1A1A1A] truncate block">{member.name}</span>
                    <span className="text-[11px] text-[#6C757D]">{member.memberType}</span>
                  </div>
                  {attendanceReadOnly ? (
                    <Badge
                      className={
                        member.status === 'present'
                          ? 'bg-green-600 text-white'
                          : member.status === 'excused'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-600 text-white'
                      }
                    >
                      {member.status === 'present' ? 'Present' : member.status === 'excused' ? 'Excused' : 'Absent'}
                    </Badge>
                  ) : (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant={member.status === 'present' ? 'default' : 'outline'}
                        onClick={() => handleMarkAttendance(member.id, 'present')}
                        className={`px-2 sm:px-3 text-xs ${member.status === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-700 hover:bg-green-50'}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Present</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={member.status === 'absent' ? 'default' : 'outline'}
                        onClick={() => handleMarkAttendance(member.id, 'absent')}
                        className={`px-2 sm:px-3 text-xs ${member.status === 'absent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-400 text-red-600 hover:bg-red-50'}`}
                      >
                        <XCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Absent</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={member.status === 'excused' ? 'default' : 'outline'}
                        onClick={() => handleMarkAttendance(member.id, 'excused')}
                        className={`px-2 sm:px-3 text-xs ${member.status === 'excused' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'}`}
                      >
                        <span className="hidden sm:inline">Excused</span>
                        <span className="sm:hidden">Exc</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-[#E0E0E0] shrink-0 flex gap-2 justify-end">
            <Button
              variant="outline"
              className="border-[#E0E0E0] text-[#6C757D] hover:bg-gray-50"
              onClick={() => {
                setShowAttendanceDialog(false);
                setSelectedEvent(null);
                setAttendanceReadOnly(false);
              }}
            >
              {attendanceReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!attendanceReadOnly && (
              <Button
                onClick={handleSaveAttendance}
                className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white"
              >
                Save Attendance
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
