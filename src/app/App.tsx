import { useState, useEffect, lazy, Suspense, useTransition } from "react";
import { useAuth } from './context/AuthContext';
import { TalentTrackLanding } from "./components/TalentTrackLanding";
import { TalentTrackLogin } from "./components/TalentTrackLogin";
import { AccountRecovery } from "./components/AccountRecovery";
import { ResetPassword } from "./components/ResetPassword";
import { RequirementsPage } from "./components/RequirementsPage";
import { AuthPage } from "./components/AuthPage";
import {
  PublicApplicationForm,
  ApplicationFormData,
} from "./components/PublicApplicationForm";
import { AuthUser } from "./services/authService";
import { toast } from "sonner";

// Lazy load heavy dashboard components for better performance
const StudentDashboard = lazy(() => import("./components/StudentDashboard").then(module => ({ default: module.StudentDashboard })));
const TrainingDashboard = lazy(() => import("./components/TrainingDashboard").then(module => ({ default: module.TrainingDashboard })));
const TraineeProgressDashboard = lazy(() => import("./components/TraineeProgressDashboard").then(module => ({ default: module.TraineeProgressDashboard })));
const MemberProfileDashboard = lazy(() => import("./components/MemberProfileDashboard").then(module => ({ default: module.MemberProfileDashboard })));
const EngagementDashboard = lazy(() => import("./components/EngagementDashboard").then(module => ({ default: module.EngagementDashboard })));
const ScholarshipDashboard = lazy(() => import("./components/ScholarshipDashboard").then(module => ({ default: module.ScholarshipDashboard })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const DirectorDashboard = lazy(() => import("./components/DirectorDashboardEnhanced").then(module => ({ default: module.DirectorDashboardEnhanced })));
const Settings = lazy(() => import("./components/Settings").then(module => ({ default: module.Settings })));
import { NotificationPanel } from "./components/NotificationPanel";
import { Toaster } from "./components/ui/sonner";
import { initKeyboardNavigation } from "./utils/keyboardNavigation";
import { SkipToContent } from "./components/accessibility/SkipToContent";
import { recruitmentService } from "./services/recruitmentService";
import scholarshipService from "./services/scholarshipService";
import notificationService from "./services/notificationService";
import productService from "./services/productService";
import { api } from "./services/api";

export interface Evaluation {
  id: string;
  traineeId: string;
  traineeName: string;
  evaluatorId?: string;
  evaluatorName?: string;
  scholarId?: string;
  scholarName?: string;
  talentGroup?: string;
  semester?: string;
  academicYear?: string;
  date: Date;
  evaluationDate?: Date;
  rating: number;
  notes: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'finalized';
  performanceMetrics?: {
    skillDemonstration: number;
    rehearsalAttendance: number;
    eventParticipation: number;
    teamwork: number;
    leadership: number;
  };
  overallRating?: string;
  scholarshipPercentage?: number;
  recommendation?: "continue" | "probation" | "discontinue";
  strengths?: string;
  improvements?: string;
  additionalNotes?: string;
  recommendForRenewal?: boolean;
  ratedBy?: string;
  ratedDate?: string;
  adjectivalRating?: string;
  sectionA?: {
    reportsOnTime: number;
    reportsRegularly: number;
    practicesOnTime: number;
    practicesRegularly: number;
    noUnnecessaryAbsence: number;
    mastersyTasks: number;
    maintainsCleanliness: number;
  };
  sectionB?: {
    improvementInterest: number;
    performanceInterest: number;
    workEthic: number;
    initiative: number;
    efficiency: number;
  };
  sectionC?: {
    teamwork: number;
    tact: number;
    courtesy: number;
    disposition: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "trainee" | "scholar" | "admin" | "director";
  studentId?: string;
  phone?: string;
  talentGroup?: string;
  applicationStatus?:
    | "pending"
    | "approved"
    | "disapproved"
    | "qualified"
    | "not_qualified";
  yearLevel?: string;
  course?: string;
  trainingStatus?:
    | "not_started"
    | "in_progress"
    | "active"
    | "completed"
    | "failed";
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  assignedInstrument?: string;
  assignedVoice?: string;
  scholarshipPercentage?: number;
  gender?: string;
  dateOfBirth?: string;
  birthdate?: string;
  age?: string;
  socialMedia?: string;
  department?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  guardianName?: string;
  guardianContact?: string;
  allergies?: string;
  medicalConditions?: string;
}

export interface Application {
  id: string;
  // Flat API fields (from backend)
  talent_group?: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_student_id?: string;
  applicant_phone?: string;
  applicant_birthdate?: string;
  applicant_age?: string;
  applicant_address?: string;
  applicant_gender?: string;
  applicant_year_level?: string;
  applicant_course?: string;
  applicant_department?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  social_media?: string;
  photo_path?: string;
  status?: "pending" | "scheduled" | "approved" | "rejected" | "disapproved";
  applied_at?: string;
  // Talent-group specific flat fields
  has_band_experience?: boolean;
  vocal_range?: string;
  previous_singing_experience?: string;
  musical_background?: string;
  primary_dance_genre?: string;
  years_of_experience?: string;
  performed_on_stage?: string;
  willing_to_attend_rehearsals?: string;
  previous_majorette_team?: string;
  previous_organization?: string;
  can_perform_basic_routines?: string;
  willing_to_attend_rehearsals_majorettes?: string;
  // Legacy nested shape (kept for backwards compatibility with older code)
  userId?: string;
  talentGroup?: string;
  personalInfo?: {
    name?: string;
    email?: string;
    studentId?: string;
    phone?: string;
    birthdate?: string;
    age?: string;
    address?: string;
    gender?: string;
    socialMedia?: string;
    yearLevel?: string;
    course?: string;
    department?: string;
    guardianName?: string;
    guardianContactNo?: string;
    guardianRelationship?: string;
    hasBandExperience?: boolean;
    vocalRange?: string;
    previousSingingExperience?: string;
    musicalBackground?: string;
    primaryDanceGenre?: string;
    yearsOfExperience?: string;
    performedOnStage?: string;
    willingToAttendRehearsals?: string;
    previousMajoretteTeam?: string;
    previousOrganization?: string;
    canPerformBasicRoutines?: string;
    willingToAttendRehearsalsMajorettes?: string;
  };
  experience?: string;
  motivation?: string;
  documents?: string[];
  appliedAt?: Date;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  talentGroup: string;
  practices: {
    date: Date;
    attended: boolean;
    duration: number;
    activities: string[];
    techniques: string[];
    chaptersCompleted: number;
    totalChapters: number;
    performanceNotes: string;
  }[];
  overallProgress: number;
  evaluation: "qualified" | "not_qualified" | "pending";
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  talentGroups: string[];
  type:
    | "performance"
    | "rehearsal"
    | "workshop"
    | "competition";
  isRequired: boolean;
  attachment?: string; // Optional attachment for formality documents
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: Date;
  priority: "low" | "medium" | "high";
  targetAudience: "all" | "students" | "scholars";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "interview" | "acceptance" | "evaluation" | "general" | "application" | "engagement" | "inventory" | "attendance" | "document" | "instrument" | "endorsement" | "request";
  read: boolean;
  createdAt: Date;
  actionUrl?: string; // Optional URL to navigate to when clicking notification
  relatedId?: string; // ID of related entity (engagement, application, etc.)
}

export interface InventoryItem {
  id: string;
  userId: string;
  talentGroup?: string;
  itemName?: string;
  name?: string;
  type: "uniform" | "instrument" | "accessory";
  condition: "excellent" | "good" | "fair" | "needs_repair";
  serialNumber?: string;
  propertyType?: string;
  instrumentType?: string;
  accessoryType?: string;
  uniformSet?: string;
  quantity?: number;
  description?: string;
  notes?: string;
  assignedTo?: string;
  headpieceSize?: string;
  topSize?: string;
  pantsSize?: string;
  bandShoesSize?: string;
  dressSize?: string;
  shoesSize?: string;
  assignedDate?: Date;
  borrowedDate?: Date;
  returnDate?: Date;
  status:
    | "borrowed"
    | "returned"
    | "lost"
    | "damaged"
    | "assigned";
}

export interface Benefit {
  id: string;
  name: string;
  type: "stipend" | "allowance" | "privilege" | "discount";
  amount?: number;
  description: string;
  frequency: "monthly" | "semester" | "annual" | "one-time";
  status: "active" | "pending" | "expired";
}

export interface ScholarshipRenewal {
  id: string;
  userId: string;
  semester: string;
  year: number;
  gpa: number;
  documents: string[];
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

// Loading fallback component for lazy-loaded dashboards
const DashboardLoader = () => (
  <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#7A1E1E] border-t-transparent rounded-full animate-spin [animation-duration:700ms] mx-auto mb-4"></div>
      <p className="text-[#6C757D]">Loading dashboard...</p>
    </div>
  </div>
);

function AppContent() {
  const { user, logout, login } = useAuth();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(user || null);

  // Cast AuthUser to User for component compatibility
  const userAsComponentUser = currentUser ? (currentUser as unknown as User) : null as unknown as User;

  // Helper to get initial page from localStorage or default
  const getInitialPage = () => {
    const queryPage = new URLSearchParams(window.location.search).get('page');
    if (queryPage === 'reset-password') {
      return 'reset-password' as const;
    }

    const savedPage = localStorage.getItem('current_page');
    if (user && savedPage && ['dashboard', 'public-application', 'requirements'].includes(savedPage)) {
      return savedPage as any;
    }
    return user ? 'dashboard' : 'landing';
  };

  const [currentPage, setCurrentPage] = useState<
    | "landing"
    | "requirements"
    | "public-application"
    | "auth"
    | "login"
    | "forgot-password"
    | "reset-password"
    | "dashboard"
  >(getInitialPage());

  const [currentView, setCurrentView] = useState<
    | "student"
    | "training"
    | "scholar"
    | "member-profile"
    | "engagement"
    | "scholarship"
    | "admin"
    | "director"
    | "settings"
  >("student");

  const [settingsTab, setSettingsTab] = useState<
    "account" | "security" | "administration" | "logout"
  >("account");

  const [selectedTalentGroup, setSelectedTalentGroup] = useState<string>("");

  const [, startTransition] = useTransition();

  useEffect(() => {
    initKeyboardNavigation();
  }, []);

  // Persist currentPage to localStorage so it survives refresh
  useEffect(() => {
    localStorage.setItem('current_page', currentPage);
  }, [currentPage]);

  // Helper navigation utility to change views smoothly
  const navigateTo = (view: typeof currentView | 'settings', tab?: "account" | "security" | "administration" | "logout") => {
    startTransition(() => {
      if (view === 'settings') {
        setCurrentView('settings');
        if (tab) setSettingsTab(tab);
      } else {
        setCurrentView(view as any);
        if (tab) setSettingsTab(tab);
      }
    });
  };

  // Sync currentUser with auth context user on changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const [users, setUsers] = useState<User[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [events] = useState<Event[]>([]);
  const [announcements] = useState<Announcement[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [renewals, setRenewals] = useState<ScholarshipRenewal[]>([]);

  // Fetch user-specific data from the API once logged in
  // Use `user` directly from AuthContext (not the copy `currentUser`) to avoid stale-state timing gaps
  useEffect(() => {
    if (!user) return;

    const role = user.role;
    const group = user.talentGroup;
    console.group(`%c[TalentTrack] Data fetch — ${user.name} (${role}${group ? `, ${group}` : ''})`, 'color:#7A1E1E;font-weight:bold');

    // Fetch notifications for this user
    notificationService.getNotifications().then(apiNotifs => {
      setNotifications(apiNotifs.map(n => ({
        id: String(n.id),
        userId: String(n.user_id),
        title: n.title,
        message: n.message,
        type: n.type as Notification['type'],
        read: n.read,
        createdAt: new Date(n.created_at),
        relatedId: n.related_id ?? undefined,
        actionUrl: n.action_url ?? undefined,
      })));
      console.log(`✓ Notifications fetched: ${apiNotifs.length}`);
    }).catch((err) => {
      console.error('✗ Notifications fetch failed:', err?.response?.status, err?.message);
    });

    // Fetch inventory for all authenticated users
    productService.getProducts().then(apiProducts => {
      setInventoryItems(apiProducts.map(p => ({
        id: String(p.id),
        userId: String(p.assigned_to ?? ''),
        talentGroup: p.talent_group ?? undefined,
        name: p.name,
        itemName: p.name,
        type: p.type,
        condition: p.condition,
        status: p.status === 'available' ? 'returned' : p.status as InventoryItem['status'],
        description: p.description ?? undefined,
        serialNumber: p.serial_number ?? undefined,
        propertyType: p.property_type ?? undefined,
        instrumentType: p.instrument_type ?? undefined,
        accessoryType: p.accessory_type ?? undefined,
        uniformSet: p.uniform_set ?? undefined,
        quantity: p.quantity,
      })));
      console.log(`✓ Inventory fetched: ${apiProducts.length} items`);
    }).catch((err) => {
      console.error('✗ Inventory fetch failed:', err?.response?.status, err?.message);
    });

    if (role === 'director' || role === 'admin') {
      // Fetch users list
      api.get<any[]>('users').then(r => {
        const allUsers = r.data.map(u => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          studentId: u.student_id ?? undefined,
          phone: u.phone ?? undefined,
          talentGroup: u.talent_group ?? undefined,
          yearLevel: u.year_level ?? undefined,
          course: u.course ?? undefined,
          trainingStatus: u.training_status ?? undefined,
        }));
        setUsers(allUsers);
        const scholars = allUsers.filter(u => u.role === 'scholar');
        const trainees = allUsers.filter(u => u.role === 'student' || u.role === 'trainee');
        console.log(`✓ Users fetched: ${allUsers.length} total — ${scholars.length} scholars, ${trainees.length} trainees`);
      }).catch((err) => {
        console.error('✗ Users fetch failed:', err?.response?.status, err?.message);
      });

      // Fetch applications
      recruitmentService.listApplications({ page: 1 }).then(resp => {
        setApplications(resp.data.map((a: any) => ({
          id: String(a.id),
          userId: '',
          talentGroup: a.talent_group,
          personalInfo: {
            name: a.applicant_name ?? a.personal_info?.name ?? '',
            email: a.applicant_email ?? a.personal_info?.email ?? '',
            studentId: a.applicant_student_id ?? a.personal_info?.student_id ?? '',
            phone: a.applicant_phone ?? a.personal_info?.phone ?? '',
            birthdate: a.applicant_birthdate ?? a.personal_info?.birthdate ?? '',
            yearLevel: a.applicant_year_level ?? a.personal_info?.year_level ?? '',
            course: a.applicant_course ?? a.personal_info?.course ?? '',
          },
          experience: a.experience ?? '',
          motivation: a.motivation ?? '',
          documents: [],
          status: (a.status === 'interview_scheduled' ? 'pending' : a.status) as Application['status'],
          appliedAt: new Date(a.applied_at),
        })));
        console.log(`✓ Applications fetched: ${resp.data.length}`);
      }).catch((err) => {
        console.error('✗ Applications fetch failed:', err?.response?.status, err?.message);
      });
    }

    // Scholars also need benefits and renewals
    if (role === 'scholar') {
      scholarshipService.getBenefits().then(apiB => {
        setBenefits(apiB.map(b => ({
          id: b.id,
          name: b.name,
          type: b.type,
          amount: b.amount ?? undefined,
          description: b.description,
          frequency: b.frequency,
          status: b.status,
        })));
        console.log(`✓ Benefits fetched: ${apiB.length}`);
      }).catch((err) => {
        console.error('✗ Benefits fetch failed:', err?.response?.status, err?.message);
      });

      scholarshipService.getRenewals().then(apiR => {
        setRenewals(apiR.map(r => ({
          id: String(r.id),
          userId: String(r.user_id),
          semester: r.semester,
          year: r.year,
          gpa: r.gpa,
          documents: r.documents ?? [],
          status: r.status,
          submittedAt: new Date(r.created_at),
          reviewedAt: r.reviewed_at ? new Date(r.reviewed_at) : undefined,
          reviewNotes: r.review_notes ?? undefined,
        })));
        console.log(`✓ Renewals fetched: ${apiR.length}`);
      }).catch((err) => {
        console.error('✗ Renewals fetch failed:', err?.response?.status, err?.message);
      });
    }

    console.groupEnd();
  }, [user?.id]);


  // Notification Panel State
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Helper function to add a notification
  const addNotification = (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    relatedId?: string
  ) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
      relatedId,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Helper function to mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Helper function to mark all notifications as read
  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  // Helper function to delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Get notifications for current user
  const userNotifications = currentUser
    ? notifications
        .filter(n => n.userId === currentUser.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    : [];

  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length;

  const handleLogin = async (email: string, password: string, selectedRole?: string) => {
    const result = await login(email, password, selectedRole);
    if (result.success) {
      const loggedInUser = result.user ?? user;
      if (loggedInUser) {
        setCurrentUser(loggedInUser);
        startTransition(() => {
          setCurrentPage("dashboard");
          if (loggedInUser.role === 'admin') {
            setCurrentView('admin');
          } else if (loggedInUser.role === 'director') {
            setCurrentView('director');
          } else if (loggedInUser.trainingStatus === 'in_progress' || loggedInUser.trainingStatus === 'active') {
            setCurrentView('training');
          } else {
            setCurrentView('student');
          }
        });
        toast.success(`Welcome back, ${loggedInUser.name}!`);
      }
    }
    return result;
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    startTransition(() => {
      setCurrentPage("landing");
      setCurrentView("student");
    });
    toast.success("Logged out successfully");
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const handleUpdatePassword = async (_userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentPassword) {
      return { success: false, error: "Current password is required" };
    }
    if (!newPassword) {
      return { success: false, error: "New password is required" };
    }
    return { success: true };
  };

  const handlePublicApplicationSubmit = async (formData: ApplicationFormData) => {
    const fd = new FormData();
    const formatAddress = (parts: string[]) =>
      parts
        .map((part) => part?.trim())
        .filter((part) => Boolean(part))
        .join(', ');

    const residingAddress = formatAddress([
      formData.residStreet,
      formData.residBarangay,
      formData.residCity,
      formData.residProvince,
      formData.residRegion,
    ]);
    const permanentAddress = formatAddress([
      formData.permStreet,
      formData.permBarangay,
      formData.permCity,
      formData.permProvince,
      formData.permRegion,
    ]);
    const applicantAddress = (() => {
      const manualAddress = (formData.address || '').trim();
      if (manualAddress) return manualAddress;

      if (permanentAddress && residingAddress) {
        if (permanentAddress === residingAddress) return permanentAddress;
        return `Permanent: ${permanentAddress} | Residing: ${residingAddress}`;
      }

      return (residingAddress || permanentAddress || '').trim();
    })();

    fd.append('talent_group', formData.talentGroup);
    fd.append('applicant_name', `${formData.firstName} ${formData.lastName}`.trim());
    fd.append('applicant_email', formData.email);
    if (formData.studentId)         fd.append('applicant_student_id', formData.studentId);
    if (formData.mobileNo)          fd.append('applicant_phone', formData.mobileNo);
    if (formData.yearLevel)         fd.append('applicant_year_level', formData.yearLevel);
    if (formData.course)            fd.append('applicant_course', formData.course);
    if (formData.department)        fd.append('applicant_department', formData.department);
    if (applicantAddress)           fd.append('applicant_address', applicantAddress);
    if (formData.gender)            fd.append('applicant_gender', formData.gender);
    if (formData.birthdate)         fd.append('applicant_birthdate', formData.birthdate);
    if (formData.age)               fd.append('applicant_age', formData.age);
    const guardianName = `${formData.guardianLastName ?? ''} ${formData.guardianFirstName ?? ''}`.trim();
    if (guardianName)               fd.append('guardian_name', guardianName);
    if (formData.guardianContactNo) fd.append('guardian_phone', formData.guardianContactNo);
    if (formData.guardianRelationship) fd.append('guardian_relationship', formData.guardianRelationship);
    if (formData.socialMedia)          fd.append('social_media', formData.socialMedia);
    if (formData.photo)                fd.append('photo', formData.photo);

    await recruitmentService.submitApplicationForm(fd);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <TalentTrackLanding
            onNavigate={(page) => {
              if (page === "requirements") {
                setCurrentPage("requirements");
              } else if (page === "auth") {
                setCurrentPage("auth");
              } else if (page === "login") {
                setCurrentPage("login");
              }
            }}
          />
        );
      case "requirements":
        return (
          <RequirementsPage
            onBack={() => setCurrentPage("landing")}
            onApplyNow={(talentGroup) => {
              setSelectedTalentGroup(talentGroup);
              setCurrentPage("public-application");
            }}
          />
        );
      case "public-application":
        return (
          <PublicApplicationForm
            talentGroup={selectedTalentGroup}
            onSubmit={handlePublicApplicationSubmit}
            onBack={() => setCurrentPage("requirements")}
            onSelectGroup={(group) => setSelectedTalentGroup(group)}
          />
        );
      case "auth":
        return (
          <AuthPage
            onLogin={handleLogin}
            onBack={() => setCurrentPage("landing")}
          />
        );
      case "login":
        return (
          <TalentTrackLogin
            onLogin={handleLogin}
            onBack={() => setCurrentPage("landing")}
            onNavigate={(page) => {
              if (page === "public-application") {
                setCurrentPage("public-application");
              } else if (page === "support") {
                // Handle support navigation - could open a modal or navigate to a support page
                console.log("Navigate to support");
              } else if (page === "forgot-password") {
                setCurrentPage("forgot-password");
              }
            }}
          />
        );
      case "forgot-password":
        return (
          <AccountRecovery
            onBack={() => setCurrentPage("login")}
            onBackToLogin={() => setCurrentPage("login")}
          />
        );
      case "reset-password":
        return (
          <ResetPassword
            onBackToLogin={() => setCurrentPage("login")}
          />
        );
      case "dashboard":
        if (!currentUser) return null;

        switch (currentUser.role) {
          case "student":
          case "trainee": {
            const hasApprovedTrainingAccess =
              currentUser.role === 'trainee'
              || (currentUser.applicationStatus === 'approved'
                  && (currentUser.trainingStatus === 'in_progress' || currentUser.trainingStatus === 'active'));

            if (hasApprovedTrainingAccess) {
              if (currentView === "settings") {
                return (
                  <Suspense fallback={<DashboardLoader />}>
                    <Settings
                      user={userAsComponentUser}
                      onLogout={handleLogout}
                      allUsers={users}
                      onUpdateUser={handleUpdateUser}
                      onUpdatePassword={handleUpdatePassword}
                      unreadNotifications={unreadNotificationsCount}
                      onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                      onNavigateBack={() => navigateTo('training')}
                      initialTab={settingsTab}
                    />
                  </Suspense>
                );
              }

              return (
                <Suspense fallback={<DashboardLoader />}>
                  <TraineeProgressDashboard
                    user={userAsComponentUser}
                    onLogout={handleLogout}
                    trainingRecord={trainingRecords.find((tr) => tr.userId === currentUser.id) || null}
                    evaluations={evaluations.filter((e: any) => e.traineeId === currentUser?.id)}
                    unreadNotifications={unreadNotificationsCount}
                    onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    onNavigateToSettings={(tab) => {
                      navigateTo('settings', tab ?? undefined);
                    }}
                  />
                </Suspense>
              );
            }

            return (
              <Suspense fallback={<DashboardLoader />}>
                <StudentDashboard
                  user={userAsComponentUser}
                  onLogout={handleLogout}
                  applications={applications.filter((app) => app.userId === currentUser.id)}
                  notifications={notifications.filter((n) => n.userId === currentUser.id)}
                  onMarkNotificationRead={(notificationId) => {
                    setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                  }}
                  unreadNotifications={unreadNotificationsCount}
                  onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                />
              </Suspense>
            );
          }

          case "scholar":
            if (currentView === "settings") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <Settings
                    user={userAsComponentUser}
                    onLogout={handleLogout}
                    allUsers={users}
                    onUpdateUser={handleUpdateUser}
                    onUpdatePassword={handleUpdatePassword}
                    unreadNotifications={unreadNotificationsCount}
                    onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    onNavigateBack={() => navigateTo('member-profile')}
                    initialTab={settingsTab}
                  />
                </Suspense>
              );
            }

            if (currentView === "member-profile") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <MemberProfileDashboard
                    user={userAsComponentUser}
                    onLogout={handleLogout}
                    onNavigate={(view, tab) => {
                      navigateTo(view as any, tab ?? undefined);
                    }}
                    inventory={inventoryItems}
                    notifications={notifications.filter((n) => n.userId === currentUser.id)}
                    onMarkNotificationRead={(notificationId) => {
                      setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                    }}
                    onUpdateProfile={(updatedData) => {
                      setUsers(users.map((u) => u.id === currentUser.id ? { ...u, ...updatedData } : u));
                    }}
                  />
                </Suspense>
              );
            }

            if (currentView === "engagement") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <EngagementDashboard
                    user={userAsComponentUser}
                    onLogout={handleLogout}
                    onNavigate={(view, tab) => {
                      navigateTo(view as any, tab ?? undefined);
                    }}
                    notifications={notifications.filter((n) => n.userId === currentUser.id)}
                    onMarkNotificationRead={(notificationId) => {
                      setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                    }}
                  />
                </Suspense>
              );
            }

            if (currentView === "scholarship") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <ScholarshipDashboard
                    user={userAsComponentUser}
                    onLogout={handleLogout}
                    onNavigate={(view, tab) => {
                      navigateTo(view as any, tab ?? undefined);
                    }}
                    benefits={benefits}
                    renewals={renewals}
                    evaluations={evaluations.filter((e: any) => e.traineeId === currentUser?.id)}
                    notifications={notifications.filter((n) => n.userId === currentUser?.id)}
                    onMarkNotificationRead={(notificationId) => {
                      setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                      notificationService.markRead(Number(notificationId)).catch(() => {});
                    }}
                    onSubmitRenewal={(renewalData) => {
                      scholarshipService.submitRenewal({
                        semester: renewalData.semester,
                        year: renewalData.year,
                        gpa: renewalData.gpa,
                        documents: renewalData.documents,
                      }).then(saved => {
                        setRenewals(prev => [...prev, {
                          id: String(saved.id),
                          userId: String(saved.user_id),
                          semester: saved.semester,
                          year: saved.year,
                          gpa: saved.gpa,
                          documents: saved.documents ?? [],
                          status: saved.status,
                          submittedAt: new Date(saved.created_at),
                        }]);
                        toast.success('Renewal application submitted successfully!');
                      }).catch(() => {
                        toast.error('Failed to submit renewal. Please try again.');
                      });
                    }}
                  />
                </Suspense>
              );
            }

            return (
              <Suspense fallback={<DashboardLoader />}>
                <MemberProfileDashboard
                  user={userAsComponentUser}
                  onLogout={handleLogout}
                  onNavigate={(view) => navigateTo(view as any)}
                  inventory={inventoryItems}
                  notifications={notifications.filter((n) => n.userId === currentUser.id)}
                  onMarkNotificationRead={(notificationId) => {
                    setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                  }}
                  onUpdateProfile={(updatedData) => {
                    setUsers(users.map((u) => u.id === currentUser.id ? { ...u, ...updatedData } : u));
                  }}
                />
              </Suspense>
            );

          case "admin":
            if (currentView === "settings") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <Settings
                    user={userAsComponentUser}
                    onLogout={handleLogout}
                    allUsers={users}
                    onUpdateUser={handleUpdateUser}
                    onUpdatePassword={handleUpdatePassword}
                    unreadNotifications={unreadNotificationsCount}
                    onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    onNavigateBack={() => navigateTo('overview' as any)}
                    initialTab={settingsTab}
                  />
                </Suspense>
              );
            }

            return (
              <Suspense fallback={<DashboardLoader />}>
                <AdminDashboard
                  user={userAsComponentUser}
                  onLogout={handleLogout}
                  applications={applications}
                  users={users}
                  events={events}
                  announcements={announcements}
                  trainingRecords={trainingRecords}
                  evaluations={evaluations}
                onUpdateApplicationStatus={(applicationId, status) => {
                  setApplications(applications.map((app) => 
                    app.id === applicationId ? { ...app, status } : app
                  ));
                  toast.success(`Application ${status}`);
                }}
                unreadNotifications={unreadNotificationsCount}
                onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                onViewChange={(view, tab) => {
                  if (view === 'settings') {
                    navigateTo('settings', tab ?? undefined);
                  }
                }}
              />
              </Suspense>
            );

          case "director":
            if (currentView === "settings") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <Settings
                  user={userAsComponentUser}
                  onLogout={handleLogout}
                  allUsers={users}
                  onUpdateUser={handleUpdateUser}
                  onUpdatePassword={handleUpdatePassword}
                  unreadNotifications={unreadNotificationsCount}
                  onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  onNavigateBack={() => navigateTo('overview' as any)}
                  initialTab={settingsTab}
                />
                </Suspense>
              );
            }

            return (
              <Suspense fallback={<DashboardLoader />}>
                <DirectorDashboard
                user={userAsComponentUser}
                onLogout={handleLogout}
                applications={applications}
                users={users}
                trainingRecords={trainingRecords}
                events={events}
                announcements={announcements}
                evaluations={evaluations}
                setEvaluations={(evals) => setEvaluations(evals as any)}
                onUpdateApplicationStatus={(applicationId, status) => {
                  const application = applications.find((app) => app.id === applicationId);
                  
                  // Update application status
                  setApplications(applications.map((app) => 
                    app.id === applicationId ? { ...app, status } : app
                  ));
                  
                  // If approved, create a trainee user from the application
                  if (status === 'approved' && application) {
                    const tempPassword = `UNC${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                    const p = application.personalInfo;
                    const appName    = application.applicant_name        ?? p?.name        ?? '';
                    const appEmail   = application.applicant_email       ?? p?.email       ?? '';
                    const appSid     = application.applicant_student_id  ?? p?.studentId   ?? '';
                    const appPhone   = application.applicant_phone       ?? p?.phone       ?? '';
                    const appGroup   = application.talent_group          ?? application.talentGroup ?? '';
                    const appYear    = application.applicant_year_level  ?? p?.yearLevel   ?? '';
                    const appCourse  = application.applicant_course      ?? p?.course      ?? '';
                    const appAddr    = application.applicant_address     ?? p?.address     ?? '';
                    const appGuard   = application.guardian_name         ?? p?.guardianName ?? '';
                    const appGuardPh = application.guardian_phone        ?? p?.guardianContactNo ?? '';
                    const appVocal   = application.vocal_range           ?? p?.vocalRange  ?? '';
                    const newTrainee: User = {
                      id: `trainee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      name: appName,
                      email: appEmail,
                      role: 'student',
                      studentId: appSid,
                      phone: appPhone,
                      talentGroup: appGroup,
                      applicationStatus: 'approved',
                      yearLevel: appYear,
                      course: appCourse,
                      trainingStatus: 'not_started',
                      address: appAddr,
                      emergencyContact: appGuard,
                      emergencyPhone: appGuardPh,
                      assignedInstrument: appVocal || undefined,
                      assignedVoice: appVocal || undefined
                    };
                    
                    // Only add if user doesn't already exist
                    if (!users.find(u => u.email === newTrainee.email)) {
                      setUsers([...users, newTrainee]);
                      
                      // Send notification to the new trainee with login credentials
                      addNotification(
                        newTrainee.id,
                        'Welcome to TalentTrackUNC!',
                        `Congratulations! Your application has been approved. Your login credentials: Email: ${newTrainee.email}, Temporary Password: ${tempPassword}. Please change your password after first login.`,
                        'application',
                        application.id
                      );
                      
                      // Notify director about successful account creation
                      const director = users.find(u => u.role === 'director' && u.talentGroup === appGroup);
                      if (director && director.id) {
                        addNotification(
                          director.id,
                          'Trainee Account Created',
                          `Login credentials created and sent to ${newTrainee.name} for ${appGroup.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}.`,
                          'application',
                          newTrainee.id
                        );
                      }
                      
                      toast.success(`✅ Acceptance email sent to ${appName}! Login credentials created.`);
                    }
                  } else if (status === 'disapproved' && application) {
                    const rejName = application.applicant_name ?? application.personalInfo?.name ?? '';
                    toast.success(`✉️ Rejection email sent to ${rejName}`);
                  } else {
                    toast.success(`Application ${status}`);
                  }
                }}
                onCompleteTraining={(userId, evaluation, scholarshipPercentage) => {
                  const user = users.find((u) => u.id === userId);
                  if (user) {
                    setUsers(users.map((u) => 
                      u.id === userId 
                        ? { 
                            ...u, 
                            trainingStatus: 'completed', 
                            role: 'scholar', 
                            scholarshipPercentage
                          } 
                        : u
                    ));
                    setTrainingRecords(trainingRecords.map((tr) => 
                      tr.userId === userId 
                        ? { ...tr, evaluation } 
                        : tr
                    ));
                    toast.success(`Training completed for ${user.name}. Evaluation: ${evaluation}`);
                  }
                }}
                onUpdateUser={handleUpdateUser}
                unreadNotifications={unreadNotificationsCount}
                onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                onViewChange={(view, tab) => {
                  if (view === 'settings') {
                    navigateTo('settings', tab ?? undefined);
                  }
                }}
                inventoryItems={inventoryItems}
                onAddInventoryItem={(item) => {
                  setInventoryItems([...inventoryItems, item]);
                  toast.success('Inventory item added successfully!');
                }}
                onUpdateInventoryItem={(itemId, updates) => {
                  setInventoryItems(inventoryItems.map(item => 
                    item.id === itemId ? { ...item, ...updates } : item
                  ));
                  toast.success('Inventory item updated!');
                }}
              />
              </Suspense>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  };

  return (
    <>
      <SkipToContent targetId="main-content" />
      <div className="min-h-screen bg-background">
        <main id="main-content" className="focus:outline-none" tabIndex={-1}>
          {renderCurrentPage()}
        </main>
        <Toaster position="top-center" />

        {/* Global Notification Panel */}
        {showNotificationPanel && currentUser && (
          <NotificationPanel
            notifications={userNotifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onDeleteNotification={deleteNotification}
            onClose={() => setShowNotificationPanel(false)}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      {/* Wrap app with AuthProvider for auth context */}
      <AppContent />
    </>
  );
}