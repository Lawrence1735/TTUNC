import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DashboardHeader } from './DashboardHeader';
import { Users, Sparkles, Heart, Clock, CheckCircle, XCircle, ChevronDown, CheckCircle2, Gift, Calendar, Eye, FileText } from './ui/icons';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { User, Application, Notification } from '../App';
// ── Accessibility components (WCAG 2.1 AA / ISO 9241 / ISO 25010) ──────────────
import { SkipToContent, EmptyState } from './accessibility';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  applications: Application[];
  notifications: Notification[];
  onMarkNotificationRead: (notificationId: string) => void;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
}

const TALENT_GROUPS = [
  {
    id: 'marching-band',
    name: 'Marching Band',
    image: 'https://images.unsplash.com/photo-1569949236204-2cbfaa21fbd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJjaGluZyUyMGJhbmQlMjB1bml2ZXJzaXR5fGVufDF8fHx8MTc2MDU5MjgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Perform at university events, parades, and competitions with brass, woodwind, and percussion instruments.',
    requirements: [
      'Basic music reading ability',
      'Instrument proficiency (or willingness to learn)',
      'Physical fitness for marching',
      'Commitment to regular rehearsals'
    ],
    benefits: [
      'Full scholarship coverage',
      'Instrument provided',
      'Performance opportunities',
      'Leadership development'
    ]
  },
  {
    id: 'majorettes',
    name: 'Majorettes',
    image: 'https://images.unsplash.com/photo-1675935275870-83f1e33e957f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvciUyMGd1YXJkJTIwZmxhZ3N8ZW58MXx8fHwxNzYwNTkyODA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Combine dance, baton twirling, and precision movements to enhance band performances.',
    requirements: [
      'Dance or movement experience preferred',
      'Physical coordination',
      'Ability to work with props (flags, batons)',
      'Team collaboration skills'
    ],
    benefits: [
      'Scholarship assistance',
      'Uniform and equipment provided',
      'Performance travel opportunities',
      'Artistic expression platform'
    ]
  },
  {
    id: 'glee-club',
    name: 'Glee Club',
    image: 'https://images.unsplash.com/photo-1610254449353-5698372fa83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9pciUyMHNpbmdpbmclMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjA1OTI4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Vocal ensemble performing choral music, pop arrangements, and university anthems.',
    requirements: [
      'Good vocal range and pitch',
      'Ability to harmonize',
      'Music reading skills (preferred)',
      'Ensemble singing experience'
    ],
    benefits: [
      'Voice training and coaching',
      'Scholarship support',
      'Recording opportunities',
      'Concert performances'
    ]
  },
  {
    id: 'dance-club',
    name: 'Dance Club',
    image: 'https://images.unsplash.com/photo-1650820597435-c1d6d6cbbcfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMHRlYW0lMjBwZXJmb3JtZXJzfGVufDF8fHx8MTc2MDU5MjgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Contemporary and cultural dance performances for university events and competitions.',
    requirements: [
      'Dance experience in any style',
      'Physical fitness and flexibility',
      'Rhythm and musicality',
      'Creative expression ability'
    ],
    benefits: [
      'Professional choreography training',
      'Costume and travel allowances',
      'Competition opportunities',
      'Performance networking'
    ]
  }
];

export function StudentDashboard({
  user,
  onLogout,
  applications,
  notifications,
  onMarkNotificationRead,
  unreadNotifications,
  onNotificationsClick
}: StudentDashboardProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showViewApplication, setShowViewApplication] = useState(false);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);
  const [openRequirements, setOpenRequirements] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    experience: '',
    documents: [] as string[]
  });

  const hasAppliedToGroup = (groupId: string) =>
    applications.some(app => app.talentGroup === groupId);

  const getApplicationStatus = (groupId: string) => {
    const app = applications.find(app => app.talentGroup === groupId);
    return app?.status;
  };

  const getCurrentJourneyStep = () => {
    const userApps = applications.filter(app => app.userId === user.id);
    if (userApps.length === 0) return 1;
    const hasApproved = userApps.some(app => app.status === 'approved');
    if (hasApproved) {
      if (user.trainingStatus === 'in_progress')  return 3;
      if (user.trainingStatus === 'completed')    return 4;
      return 2;
    }
    return 2;
  };

  const currentStep = getCurrentJourneyStep();

  const handleSubmitApplication = () => {
    if (!selectedGroup) return;
    if (!applicationData.experience.trim()) {
      toast.error('Please fill in your experience');
      return;
    }
    const groupName = TALENT_GROUPS.find(g => g.id === selectedGroup)?.name;
    toast.success(`Application submitted successfully for ${groupName}! You will be notified about interview schedules.`);
    setShowApplicationForm(false);
    setApplicationData({ experience: '', documents: [] });
    setSelectedGroup(null);
  };

  const handleViewApplication = (groupId: string) => {
    const app = applications.find(app => app.talentGroup === groupId);
    if (app) {
      setViewingApplication(app);
      setShowViewApplication(true);
      toast.info('Loading your application details...');
    }
  };

  const renderStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" aria-hidden="true" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-white" style={{ backgroundColor: '#2d7a3e' }}><CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />Approved</Badge>;
      case 'disapproved':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" aria-hidden="true" />Disapproved</Badge>;
      default:
        return null;
    }
  };

  const journeySteps = [
    {
      number: 1,
      label: 'Submit Your Application',
      description: 'Complete the application form with your experience and supporting documents',
    },
    {
      number: 2,
      label: 'Audition & Screening',
      description: 'Wait for your audition schedule and participate in the initial screening process',
    },
    {
      number: 3,
      label: 'Training Module',
      description: 'Access the training dashboard with practice schedules and skill development',
    },
    {
      number: 4,
      label: 'Official Scholar',
      description: 'Complete training evaluation and gain full access to member benefits and engagement opportunities',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      <DashboardHeader
        user={{ 
          name: user.name, 
          email: user.email,
          role: 'Student' 
        }}
        onLogout={onLogout}
        dashboardTitle="Scholarship Application Portal"
        unreadNotifications={unreadNotifications}
        onNotificationsClick={onNotificationsClick}
      />

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main id="main-content" className="container mx-auto px-4 py-8">

        {/* Welcome */}
        <section aria-labelledby="welcome-heading" className="mb-8">
          <h2 id="welcome-heading" className="mb-2">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground">
            Choose a talent group to apply for and start your journey as a UNC talent scholar.
          </p>
        </section>

        {/* Application Status Alert */}
        {applications.length > 0 && (
          <Alert className="mb-6" role="status" aria-live="polite">
            <AlertDescription>
              You have {applications.length} application{applications.length !== 1 ? 's' : ''} submitted.
              Check the status below each talent group card.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Talent Groups ─────────────────────────────────────────────────── */}
        <section aria-labelledby="talent-groups-heading">
          <h2 id="talent-groups-heading" className="sr-only">Available Talent Groups</h2>
          <div className="space-y-8">
            {TALENT_GROUPS.map((group) => {
              const hasApplied = hasAppliedToGroup(group.id);
              const status = getApplicationStatus(group.id);
              const isOpen = openRequirements === group.id;

              return (
                <article
                  key={group.id}
                  aria-labelledby={`group-${group.id}-heading`}
                  className="relative"
                >
                  {/* Status Badge */}
                  {status && (
                    <div
                      className="absolute top-4 right-4 z-10"
                      aria-label={`Application status: ${status}`}
                    >
                      {renderStatusBadge(status)}
                    </div>
                  )}

                  <Card className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Left — content */}
                      <div className="bg-[#7A1E1E] text-white p-8 md:p-12 flex flex-col justify-center">
                        <h3 id={`group-${group.id}-heading`} className="text-white mb-4">{group.name}</h3>
                        <p className="text-white/90 mb-6 leading-relaxed">{group.description}</p>

                        {/* Requirements Collapsible */}
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) => setOpenRequirements(open ? group.id : null)}
                          className="mb-6"
                        >
                          <CollapsibleTrigger
                            className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white"
                            aria-expanded={isOpen}
                            aria-controls={`requirements-${group.id}`}
                          >
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                              <span className="font-medium">View Requirements &amp; Benefits</span>
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              aria-hidden="true"
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent id={`requirements-${group.id}`} className="mt-4 space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4" aria-hidden="true" />
                                <span className="font-medium">Requirements</span>
                              </div>
                              <ul className="space-y-2 ml-6" aria-label={`${group.name} requirements`}>
                                {group.requirements.map((req, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Gift className="w-4 h-4" aria-hidden="true" />
                                <span className="font-medium">Benefits</span>
                              </div>
                              <ul className="space-y-2 ml-6" aria-label={`${group.name} benefits`}>
                                {group.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Apply Button */}
                        <div>
                          {hasApplied ? (
                            <div className="space-y-2">
                              <Button
                                className="w-full bg-white/10 text-white hover:bg-white/20 border-2 border-white min-h-[44px]"
                                onClick={() => handleViewApplication(group.id)}
                                aria-label={`View your ${group.name} application`}
                              >
                                <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                                View Application
                              </Button>
                              <Button
                                disabled
                                className="w-full bg-white/20 text-white hover:bg-white/20 min-h-[44px]"
                                aria-label={`Application already submitted for ${group.name}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                                Application Submitted
                              </Button>
                            </div>
                          ) : (
                            <Dialog
                              open={showApplicationForm && selectedGroup === group.id}
                              onOpenChange={(open) => {
                                setShowApplicationForm(open);
                                if (!open) setSelectedGroup(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full bg-white text-[#7A1E1E] hover:bg-white/90 min-h-[44px]"
                                  onClick={() => setSelectedGroup(group.id)}
                                  aria-label={`Apply now to ${group.name}`}
                                >
                                  <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                                  Apply Now
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Apply to {group.name}</DialogTitle>
                                  <DialogDescription>
                                    Fill out the application form below with your personal information and experience.
                                  </DialogDescription>
                                </DialogHeader>
                                <form
                                  aria-label={`Application form for ${group.name}`}
                                  onSubmit={(e) => { e.preventDefault(); handleSubmitApplication(); }}
                                  noValidate
                                >
                                  <div className="space-y-4">
                                    {/* Personal Information — auto-filled */}
                                    <section
                                      aria-labelledby={`personal-info-${group.id}-heading`}
                                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                    >
                                      <h4 id={`personal-info-${group.id}-heading`} className="font-semibold mb-3">
                                        Personal Information
                                      </h4>
                                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <dt className="text-muted-foreground text-xs">Name</dt>
                                          <dd>{user.name}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-muted-foreground text-xs">Email</dt>
                                          <dd>{user.email}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-muted-foreground text-xs">Phone</dt>
                                          <dd>{user.phone || 'Not provided'}</dd>
                                        </div>
                                      </dl>
                                    </section>

                                    {/* Experience */}
                                    <div>
                                      <Label htmlFor={`experience-${group.id}`}>
                                        Previous Experience{' '}
                                        <span className="text-red-600" aria-hidden="true">*</span>
                                        <span className="sr-only">(required)</span>
                                      </Label>
                                      <Textarea
                                        id={`experience-${group.id}`}
                                        placeholder="Describe your previous experience in music, dance, or related activities..."
                                        value={applicationData.experience}
                                        onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                                        className="mt-1"
                                        rows={5}
                                        aria-required="true"
                                      />
                                    </div>

                                    {/* Documents */}
                                    <div>
                                      <Label htmlFor={`documents-${group.id}`}>Supporting Documents</Label>
                                      <Input
                                        id={`documents-${group.id}`}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3"
                                        className="mt-1"
                                        aria-describedby={`documents-hint-${group.id}`}
                                      />
                                      <p id={`documents-hint-${group.id}`} className="text-sm text-muted-foreground mt-1">
                                        Upload portfolio, certificates, videos, or other relevant documents
                                      </p>
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-4">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="min-h-[44px]"
                                        onClick={() => setShowApplicationForm(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="submit"
                                        className="btn-unc min-h-[44px]"
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
                      </div>

                      {/* Right — image */}
                      <div className="relative h-64 md:h-auto" aria-hidden="true">
                        <ImageWithFallback
                          src={group.image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#7A1E1E]/20" />
                      </div>
                    </div>
                  </Card>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Announcements & Notifications ────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">

          {/* Recent Announcements */}
          <section aria-labelledby="announcements-heading">
            <Card className="card-unc border-2 shadow-md h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#7A1E1E]/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Sparkles className="w-5 h-5 text-[#7A1E1E]" />
                  </div>
                  <div>
                    <CardTitle className="unc-burgundy-text" id="announcements-heading">Recent Announcements</CardTitle>
                    <CardDescription>Important updates for students</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <ol className="space-y-4" aria-label="Recent announcements">
                    {notifications.slice(0, 3).map((notification) => (
                      <li
                        key={notification.id}
                        className="border-l-4 border-[#D4AF37] pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge
                            variant={!notification.read ? 'default' : 'secondary'}
                            className="text-xs"
                            aria-label={!notification.read ? 'New, unread' : 'Read'}
                          >
                            {!notification.read ? 'New' : 'Read'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message.substring(0, 120)}…
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          <time dateTime={notification.createdAt.toISOString()}>
                            {notification.createdAt.toLocaleDateString()}
                          </time>
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyState
                    icon={<Sparkles className="w-10 h-10" />}
                    title="No announcements"
                    description="No announcements at this time."
                  />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Notifications */}
          <section aria-labelledby="notifications-section-heading">
            <Card className="card-unc border-2 shadow-md h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#7A1E1E]/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Calendar className="w-5 h-5 text-[#7A1E1E]" />
                  </div>
                  <div>
                    <CardTitle className="unc-burgundy-text" id="notifications-section-heading">Notifications</CardTitle>
                    <CardDescription>Important updates for you</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <ol className="space-y-4" aria-label="Notifications">
                    {notifications.slice(0, 3).map((notification) => (
                      <li
                        key={notification.id}
                        className="border-l-4 border-[#7A1E1E] pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <time dateTime={notification.createdAt.toISOString()}>
                              {notification.createdAt.toLocaleDateString()}
                            </time>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyState
                    icon={<Calendar className="w-10 h-10" />}
                    title="No notifications"
                    description="No notifications at this time."
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* ── Application Journey ───────────────────────────────────────────── */}
        <section aria-labelledby="journey-heading" className="mt-8">
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#7A1E1E] to-[#6A1919] px-6 py-4">
              <CardTitle className="text-white" id="journey-heading">Your Application Journey</CardTitle>
              <p className="text-white/80 text-sm mt-1">Track your progress to becoming a UNC talent scholar</p>
            </div>
            <CardContent className="pt-6">
              <ol className="space-y-4" aria-label="Application journey steps">
                {journeySteps.map((step) => {
                  const isCompleted = currentStep > step.number;
                  const isCurrent  = currentStep === step.number;
                  const isUpcoming = currentStep < step.number;
                  const isLast     = step.number === 4;

                  return (
                    <li
                      key={step.number}
                      className={`flex items-start space-x-4 p-4 rounded-lg transition-all ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-[#7A1E1E]/10 to-[#6A1919]/5 border-2 border-[#7A1E1E]'
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md font-semibold ${
                          isLast && currentStep >= 4
                            ? 'bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-white'
                            : isCompleted
                            ? 'bg-gradient-to-br from-green-600 to-green-700 text-white'
                            : isCurrent
                            ? 'bg-gradient-to-br from-[#7A1E1E] to-[#6A1919] text-white animate-pulse'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                        aria-hidden="true"
                      >
                        {isLast && currentStep >= 4
                          ? <Sparkles className="w-6 h-6" />
                          : isCompleted
                          ? <CheckCircle className="w-6 h-6" />
                          : step.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{step.label}</p>
                          {isCurrent && (
                            <Badge variant="default" className="bg-[#7A1E1E]" aria-label="Current step">
                              Current Step
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="default" className="bg-green-600" aria-label="Completed">
                              Completed
                            </Badge>
                          )}
                          {isLast && currentStep >= 4 && (
                            <Badge variant="default" className="bg-[#D4AF37]" aria-label="Achieved">
                              Achieved!
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* ── View Application Dialog ───────────────────────────────────────────── */}
      <Dialog open={showViewApplication} onOpenChange={setShowViewApplication}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Application</DialogTitle>
            <DialogDescription>
              Review your submitted application details
            </DialogDescription>
          </DialogHeader>

          {viewingApplication && (
            <div className="space-y-4">
              {/* Status + date */}
              <div className="flex justify-between items-center">
                {renderStatusBadge(viewingApplication.status)}
                <p className="text-sm text-muted-foreground">
                  Submitted:{' '}
                  <time dateTime={viewingApplication.appliedAt.toISOString()}>
                    {viewingApplication.appliedAt.toLocaleDateString()}
                  </time>
                </p>
              </div>

              <div className="h-px bg-border" />

              {/* Personal Information */}
              <section aria-labelledby="app-personal-heading">
                <h3 id="app-personal-heading" className="font-semibold mb-3">Personal Information</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <dt className="text-muted-foreground text-xs">Name</dt>
                    <dd>{viewingApplication.personalInfo.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Email</dt>
                    <dd>{viewingApplication.personalInfo.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Phone</dt>
                    <dd>{viewingApplication.personalInfo.phone}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground text-xs">Talent Group</dt>
                    <dd className="capitalize">{viewingApplication.talentGroup.replace('-', ' ')}</dd>
                  </div>
                </dl>
              </section>

              <div className="h-px bg-border" />

              {/* Experience */}
              <section aria-labelledby="app-experience-heading">
                <h3 id="app-experience-heading" className="font-semibold mb-2">Previous Experience</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {viewingApplication.experience}
                </p>
              </section>

              <div className="h-px bg-border" />

              {/* Documents */}
              <section aria-labelledby="app-documents-heading">
                <h3 id="app-documents-heading" className="font-semibold mb-2">Submitted Documents</h3>
                {viewingApplication.documents.length > 0 ? (
                  <ul className="space-y-2" aria-label="Submitted documents">
                    {viewingApplication.documents.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded">
                        <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents submitted.</p>
                )}
              </section>

              {/* Status-specific notices */}
              {viewingApplication.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="status">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                    <span className="font-semibold">Application Under Review</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    Your application is currently being reviewed. You will receive a notification once a decision has been made.
                  </p>
                </div>
              )}

              {viewingApplication.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="status">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    <span className="font-semibold">Application Approved!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Congratulations! Your application has been approved. Check your email for interview details.
                  </p>
                </div>
              )}

              {viewingApplication.status === 'disapproved' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" aria-hidden="true" />
                    <span className="font-semibold">Application Not Approved</span>
                  </div>
                  <p className="text-sm text-red-700 mt-2">
                    Unfortunately, your application was not approved at this time. You may reapply in future application periods.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
