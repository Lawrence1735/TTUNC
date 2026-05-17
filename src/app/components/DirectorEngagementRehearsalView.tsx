import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, MapPin, Clock, Users, Music, Plus, CheckCircle, XCircle, Edit, Trash2, Upload, FileText, Download, AlertCircle, Send } from './ui/icons';
import { toast } from 'sonner';

interface DirectorEngagementRehearsalViewProps {
  talentGroup: string;
}

// Mock data - would come from props in real implementation
const MOCK_ENGAGEMENTS = [
  {
    id: 'eng1',
    eventName: 'City Christmas Festival',
    date: new Date('2026-12-20'),
    time: '18:00',
    venue: 'Naga City Plaza',
    description: 'Community Christmas celebration',
    status: 'pending' as const,
    requesterName: 'Naga City Government',
    requesterOrg: 'Office of the Mayor',
    createdBy: 'admin',
    attachments: [
      { id: 'att1', name: 'invitation-letter.pdf', size: 245000, type: 'application/pdf' }
    ]
  },
  {
    id: 'eng2',
    eventName: 'University Foundation Day',
    date: new Date('2026-06-15'),
    time: '14:00',
    venue: 'UNC Main Auditorium',
    description: 'Annual foundation day celebration performance',
    status: 'accepted' as const,
    requesterName: 'UNC Admin',
    requesterOrg: 'University of Nueva Caceres',
    createdBy: 'admin',
    attachments: []
  },
  {
    id: 'eng3',
    eventName: 'Regional Arts Competition',
    date: new Date('2026-03-10'),
    time: '10:00',
    venue: 'Bicol Convention Center',
    description: 'Showcase performance at regional competition',
    status: 'pending_admin_approval' as const,
    requesterName: 'Director Name',
    requesterOrg: 'UNC Marching Band',
    createdBy: 'director',
    attachments: [
      { id: 'att2', name: 'competition-details.pdf', size: 180000, type: 'application/pdf' }
    ]
  }
];

const MOCK_REHEARSALS = [
  {
    id: 'reh1',
    title: 'Weekly Practice Session',
    date: new Date('2026-02-18'),
    time: '15:00',
    venue: 'Band Room, Music Building',
    description: 'Regular weekly rehearsal for marching formations',
    isRequired: true,
    createdBy: 'Director',
    attendanceMarked: false
  },
  {
    id: 'reh2',
    title: 'Competition Preparation',
    date: new Date('2026-02-22'),
    time: '14:00',
    venue: 'UNC Main Auditorium',
    description: 'Intensive practice for upcoming regional competition',
    isRequired: true,
    createdBy: 'Director',
    attendanceMarked: true
  }
];

// Mock scholars for attendance
const MOCK_SCHOLARS = [
  { id: 's1', name: 'Juan Dela Cruz', status: 'pending' },
  { id: 's2', name: 'Maria Santos', status: 'pending' },
  { id: 's3', name: 'Pedro Reyes', status: 'pending' },
  { id: 's4', name: 'Ana Garcia', status: 'pending' },
];

export function DirectorEngagementRehearsalView({ talentGroup }: DirectorEngagementRehearsalViewProps) {
  const [activeTab, setActiveTab] = useState<'engagements' | 'rehearsals'>('engagements');
  const [showCreateRehearsalDialog, setShowCreateRehearsalDialog] = useState(false);
  const [showCreateEngagementDialog, setShowCreateEngagementDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [rehearsals, setRehearsals] = useState(MOCK_REHEARSALS);
  const [engagements, setEngagements] = useState(MOCK_ENGAGEMENTS);
  const [attendanceList, setAttendanceList] = useState(MOCK_SCHOLARS);
  
  // Form state for creating rehearsal
  const [newRehearsal, setNewRehearsal] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    isRequired: true
  });

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
    description: '',
    eventType: 'performance',
    formality: 'formal',
    specialRequirements: '',
    attachments: [] as File[]
  });

  const pendingEngagements = engagements.filter(e => e.status === 'pending');
  const acceptedEngagements = engagements.filter(e => e.status === 'accepted');
  const pendingApprovalEngagements = engagements.filter(e => e.status === 'pending_admin_approval');
  const upcomingRehearsals = rehearsals.filter(r => r.date >= new Date());
  const pastRehearsals = rehearsals.filter(r => r.date < new Date());

  // Rehearsal handlers
  const handleCreateRehearsal = () => {
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

    const rehearsal = {
      id: `reh-${Date.now()}`,
      ...newRehearsal,
      date: new Date(newRehearsal.date),
      createdBy: 'Director',
      attendanceMarked: false
    };

    setRehearsals([...rehearsals, rehearsal]);
    setShowCreateRehearsalDialog(false);
    setNewRehearsal({
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      isRequired: true
    });
    toast.success('Rehearsal created successfully', {
      description: 'Attendance record created. Scholars have been notified.',
    });
  };

  // Engagement handlers
  const handleCreateEngagementRequest = () => {
    if (!newEngagement.eventName || !newEngagement.organization || !newEngagement.date || !newEngagement.time || !newEngagement.venue) {
      toast.error('Please fill in all required fields');
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

    const engagement = {
      id: `eng-${Date.now()}`,
      eventName: newEngagement.eventName,
      date: new Date(newEngagement.date),
      time: newEngagement.time,
      venue: newEngagement.venue,
      description: newEngagement.description,
      status: 'pending_admin_approval' as const,
      requesterName: 'Director Name',
      requesterOrg: `UNC ${talentGroup}`,
      createdBy: 'director',
      attachments: newEngagement.attachments.map((file, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    setEngagements([...engagements, engagement]);
    setShowCreateEngagementDialog(false);
    setNewEngagement({
      eventName: '',
      organization: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      eventType: 'performance',
      formality: 'formal',
      specialRequirements: '',
      attachments: []
    });
    toast.success('Engagement request submitted', {
      description: 'Your request has been sent to admin for approval.',
    });
  };

  const handleAcceptEngagement = (id: string) => {
    setEngagements(engagements.map(e => 
      e.id === id ? { ...e, status: 'accepted' as const } : e
    ));
    toast.success('Engagement accepted', {
      description: 'Attendance record created. Scholars have been notified.',
    });
  };

  const handleRejectEngagement = (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setEngagements(engagements.map(e => 
      e.id === id ? { ...e, status: 'rejected' as const } : e
    ));
    setShowRejectDialog(false);
    setRejectReason('');
    setSelectedEvent(null);
    toast.success('Engagement rejected', {
      description: 'Admin has been notified of your decision.',
    });
  };

  const handleDeleteRehearsal = (id: string) => {
    setRehearsals(rehearsals.filter(r => r.id !== id));
    toast.success('Rehearsal deleted');
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
  const handleOpenAttendance = (event: any) => {
    setSelectedEvent(event);
    setAttendanceList(MOCK_SCHOLARS.map(s => ({ ...s, status: 'pending' })));
    setShowAttendanceDialog(true);
  };

  const handleMarkAttendance = (scholarId: string, status: 'present' | 'absent' | 'excused') => {
    setAttendanceList(attendanceList.map(s => 
      s.id === scholarId ? { ...s, status } : s
    ));
  };

  const handleSaveAttendance = () => {
    if (selectedEvent) {
      // Update the event to mark attendance as recorded
      if ('title' in selectedEvent) {
        // It's a rehearsal
        setRehearsals(rehearsals.map(r => 
          r.id === selectedEvent.id ? { ...r, attendanceMarked: true } : r
        ));
      } else {
        // It's an engagement
        setEngagements(engagements.map(e => 
          e.id === selectedEvent.id ? { ...e, attendanceMarked: true } : e
        ));
      }
    }
    
    setShowAttendanceDialog(false);
    setSelectedEvent(null);
    toast.success('Attendance saved successfully');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Card
              className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all cursor-pointer"
              onClick={() => document.getElementById('section-pending-engagements')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Pending Review</p>
                <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{pendingEngagements.length}</p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all cursor-pointer"
              onClick={() => document.getElementById('section-accepted-engagements')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Accepted</p>
                <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{acceptedEngagements.length}</p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all cursor-pointer"
              onClick={() => document.getElementById('section-awaiting-approval')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Awaiting Approval</p>
                <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{pendingApprovalEngagements.length}</p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all cursor-pointer"
              onClick={() => document.getElementById('section-all-engagements')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Total</p>
                <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{engagements.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Engagement Button */}
          <Card className="border-[#e0e0e0] bg-gradient-to-r from-[#7A1E1E]/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">Create Engagement Request</h3>
                  <p className="text-sm text-[#6c757d]">Submit a new performance opportunity for admin approval</p>
                </div>
                <Button 
                  onClick={() => setShowCreateEngagementDialog(true)}
                  className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
              </div>
            </CardContent>
          </Card>

          <div id="section-all-engagements" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Requests from Admin */}
            <Card id="section-pending-engagements" className="border-[#e0e0e0]">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E]">Pending Engagement Requests</CardTitle>
                <CardDescription>Review and respond to external event requests from admin</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {pendingEngagements.length > 0 ? (
                    <div className="space-y-4">
                      {pendingEngagements.map((engagement) => (
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

                          {/* Attachments */}
                          {engagement.attachments.length > 0 && (
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <p className="text-xs font-medium text-[#6c757d] mb-2">Attachments:</p>
                              {engagement.attachments.map((file) => (
                                <div key={file.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-3 h-3" />
                                    <span>{file.name}</span>
                                    <span className="text-[#6c757d]">({formatFileSize(file.size)})</span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-6">
                                    <Download className="w-3 h-3" />
                                  </Button>
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
                      <p>No pending requests</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Accepted Events */}
            <Card id="section-accepted-engagements" className="border-[#e0e0e0]">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E]">Accepted Engagements</CardTitle>
                <CardDescription>Confirmed external events - check attendance here</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {acceptedEngagements.length > 0 ? (
                    <div className="space-y-4">
                      {acceptedEngagements.map((engagement) => (
                        <div key={engagement.id} className="border rounded-lg p-4 bg-green-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{engagement.eventName}</h4>
                              <p className="text-sm text-[#6c757d] mt-1">{engagement.description}</p>
                            </div>
                            <Badge className="bg-green-600">Accepted</Badge>
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

                          {/* Check Attendance Button - NEW */}
                          <Button
                            size="sm"
                            onClick={() => handleOpenAttendance(engagement)}
                            className="w-full mt-3 bg-[#7A1E1E] hover:bg-[#5a1616]"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Check Attendance
                          </Button>
                        </div>
                      ))}
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
          </div>

          {/* Awaiting Admin Approval */}
          {pendingApprovalEngagements.length > 0 && (
            <Card id="section-awaiting-approval" className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Awaiting Admin Approval
                </CardTitle>
                <CardDescription>Your engagement requests pending admin review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovalEngagements.map((engagement) => (
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
                          {engagement.attachments.map((file) => (
                            <div key={file.id} className="flex items-center space-x-2 text-xs">
                              <FileText className="w-3 h-3" />
                              <span>{file.name}</span>
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
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Rehearsals Tab */}
      {activeTab === 'rehearsals' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Card className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all">
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Upcoming Rehearsals</p>
                <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{upcomingRehearsals.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all">
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Total Rehearsals</p>
                <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{rehearsals.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Rehearsal Button */}
          <Card className="border-[#e0e0e0] bg-gradient-to-r from-[#7A1E1E]/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">Schedule a Rehearsal</h3>
                  <p className="text-sm text-[#6c757d]">Create new practice session for {talentGroup}</p>
                </div>
                <Button 
                  onClick={() => setShowCreateRehearsalDialog(true)}
                  className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Rehearsal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Rehearsals */}
          <Card className="border-[#e0e0e0]">
            <CardHeader>
              <CardTitle className="text-[#7A1E1E]">Upcoming Rehearsals</CardTitle>
              <CardDescription>Scheduled practice sessions - check attendance here</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingRehearsals.length > 0 ? (
                <div className="space-y-4">
                  {upcomingRehearsals.map((rehearsal) => (
                    <div key={rehearsal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-[#7A1E1E]">{rehearsal.title}</h4>
                            {rehearsal.isRequired && (
                              <Badge className="bg-red-500">Required</Badge>
                            )}
                            {rehearsal.attendanceMarked && (
                              <Badge className="bg-green-600">Attendance Taken</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#6c757d] mt-1">{rehearsal.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info('Edit functionality coming soon')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRehearsal(rehearsal.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-[#6c757d]">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {rehearsal.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {rehearsal.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {rehearsal.venue}
                        </div>
                      </div>

                      {/* Check Attendance Button */}
                      <Button
                        size="sm"
                        onClick={() => handleOpenAttendance(rehearsal)}
                        className="w-full mt-3 bg-[#7A1E1E] hover:bg-[#5a1616]"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {rehearsal.attendanceMarked ? 'View/Edit Attendance' : 'Check Attendance'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming rehearsals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Rehearsals */}
          {pastRehearsals.length > 0 && (
            <Card className="border-[#e0e0e0]">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E]">Past Rehearsals</CardTitle>
                <CardDescription>Completed practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastRehearsals.map((rehearsal) => (
                    <div key={rehearsal.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#6c757d]">{rehearsal.title}</h4>
                          <p className="text-sm text-[#6c757d] mt-1">{rehearsal.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-[#6c757d]">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {rehearsal.date.toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {rehearsal.time}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-gray-400">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Rehearsal Dialog */}
      <Dialog open={showCreateRehearsalDialog} onOpenChange={setShowCreateRehearsalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Rehearsal</DialogTitle>
            <DialogDescription>
              Create a new practice session for {talentGroup}. Scholars will be automatically notified.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Rehearsal Title <span aria-hidden="true">*</span></Label>
                <Input
                  id="title"
                  value={newRehearsal.title}
                  onChange={(e) => setNewRehearsal({ ...newRehearsal, title: e.target.value })}
                  placeholder="e.g., Weekly Practice Session"
                  required
                  aria-required="true"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span aria-hidden="true">*</span></Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRehearsal.date}
                    onChange={(e) => setNewRehearsal({ ...newRehearsal, date: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time <span aria-hidden="true">*</span></Label>
                  <Input
                    id="time"
                    type="time"
                    value={newRehearsal.time}
                    onChange={(e) => setNewRehearsal({ ...newRehearsal, time: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue <span aria-hidden="true">*</span></Label>
                <Input
                  id="venue"
                  value={newRehearsal.venue}
                  onChange={(e) => setNewRehearsal({ ...newRehearsal, venue: e.target.value })}
                  placeholder="e.g., Band Room, Music Building"
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRehearsal.description}
                  onChange={(e) => setNewRehearsal({ ...newRehearsal, description: e.target.value })}
                  placeholder="Brief description of the rehearsal"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={newRehearsal.isRequired}
                  onChange={(e) => setNewRehearsal({ ...newRehearsal, isRequired: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isRequired" className="cursor-pointer">
                  Mark as required attendance
                </Label>
              </div>

              <div className="p-3 bg-blue-50 rounded flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  This rehearsal will be scheduled for <strong>{talentGroup}</strong> only. 
                  All active scholars in your group will be automatically notified.
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateRehearsalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRehearsal}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              Create Rehearsal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Engagement Request Dialog - NEW */}
      <Dialog open={showCreateEngagementDialog} onOpenChange={setShowCreateEngagementDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Engagement Request</DialogTitle>
            <DialogDescription>
              Submit a new performance opportunity for admin approval
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4 py-4">
              {/* Event Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Event Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name <span aria-hidden="true">*</span></Label>
                  <Input
                    id="eventName"
                    value={newEngagement.eventName}
                    onChange={(e) => setNewEngagement({ ...newEngagement, eventName: e.target.value })}
                    placeholder="e.g., Regional Arts Competition"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type <span aria-hidden="true">*</span></Label>
                    <select
                      id="eventType"
                      value={newEngagement.eventType}
                      onChange={(e) => setNewEngagement({ ...newEngagement, eventType: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                      aria-required="true"
                    >
                      <option value="performance">Performance</option>
                      <option value="parade">Parade</option>
                      <option value="competition">Competition</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formality">Formality <span aria-hidden="true">*</span></Label>
                    <select
                      id="formality"
                      value={newEngagement.formality}
                      onChange={(e) => setNewEngagement({ ...newEngagement, formality: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                      aria-required="true"
                    >
                      <option value="formal">Formal</option>
                      <option value="semi-formal">Semi-Formal</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span aria-hidden="true">*</span></Label>
                  <Textarea
                    id="description"
                    value={newEngagement.description}
                    onChange={(e) => setNewEngagement({ ...newEngagement, description: e.target.value })}
                    placeholder="Brief description of the event"
                    rows={3}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Organizer Details */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Organizer Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization Name <span aria-hidden="true">*</span></Label>
                  <Input
                    id="organization"
                    value={newEngagement.organization}
                    onChange={(e) => setNewEngagement({ ...newEngagement, organization: e.target.value })}
                    placeholder="e.g., Bicol Arts Council"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={newEngagement.contactPerson}
                      onChange={(e) => setNewEngagement({ ...newEngagement, contactPerson: e.target.value })}
                      placeholder="e.g., Juan Dela Cruz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={newEngagement.contactEmail}
                      onChange={(e) => setNewEngagement({ ...newEngagement, contactEmail: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={newEngagement.contactPhone}
                    onChange={(e) => setNewEngagement({ ...newEngagement, contactPhone: e.target.value })}
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
              </div>

              {/* Date & Venue */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Date & Venue</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engDate">Date <span aria-hidden="true">*</span></Label>
                    <Input
                      id="engDate"
                      type="date"
                      value={newEngagement.date}
                      onChange={(e) => setNewEngagement({ ...newEngagement, date: e.target.value })}
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engTime">Time <span aria-hidden="true">*</span></Label>
                    <Input
                      id="engTime"
                      type="time"
                      value={newEngagement.time}
                      onChange={(e) => setNewEngagement({ ...newEngagement, time: e.target.value })}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engVenue">Venue <span aria-hidden="true">*</span></Label>
                  <Input
                    id="engVenue"
                    value={newEngagement.venue}
                    onChange={(e) => setNewEngagement({ ...newEngagement, venue: e.target.value })}
                    placeholder="e.g., Bicol Convention Center"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={newEngagement.specialRequirements}
                    onChange={(e) => setNewEngagement({ ...newEngagement, specialRequirements: e.target.value })}
                    placeholder="Any special requirements or notes"
                    rows={2}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <p className="text-xs text-[#6c757d]">Upload supporting documents (PDF, DOC, DOCX, JPG, PNG - Max 5MB each)</p>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
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
              </div>

              <div className="p-3 bg-orange-50 rounded flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-800">
                  This request will be sent to admin for review and approval before being finalized. 
                  You'll be notified once a decision is made.
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateEngagementDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEngagementRequest}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
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
            <DialogTitle className="text-[#7A1E1E] text-base sm:text-lg">Check Attendance</DialogTitle>
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
              {attendanceList.map((scholar) => (
                <div key={scholar.id} className="flex items-center justify-between gap-2 p-3 border border-[#E0E0E0] rounded-lg">
                  <span className="text-sm font-medium text-[#1A1A1A] truncate min-w-0">{scholar.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant={scholar.status === 'present' ? 'default' : 'outline'}
                      onClick={() => handleMarkAttendance(scholar.id, 'present')}
                      className={`px-2 sm:px-3 text-xs ${scholar.status === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-700 hover:bg-green-50'}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Present</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={scholar.status === 'absent' ? 'default' : 'outline'}
                      onClick={() => handleMarkAttendance(scholar.id, 'absent')}
                      className={`px-2 sm:px-3 text-xs ${scholar.status === 'absent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-400 text-red-600 hover:bg-red-50'}`}
                    >
                      <XCircle className="w-3.5 h-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Absent</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={scholar.status === 'excused' ? 'default' : 'outline'}
                      onClick={() => handleMarkAttendance(scholar.id, 'excused')}
                      className={`px-2 sm:px-3 text-xs ${scholar.status === 'excused' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'}`}
                    >
                      <span className="hidden sm:inline">Excused</span>
                      <span className="sm:hidden">Exc</span>
                    </Button>
                  </div>
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
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAttendance}
              className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white"
            >
              Save Attendance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
