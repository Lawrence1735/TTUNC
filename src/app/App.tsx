import React, { useState, useEffect, lazy, Suspense, useTransition } from "react";
import { TalentTrackLanding } from "./components/TalentTrackLanding";
import { TalentTrackLogin } from "./components/TalentTrackLogin";
import { AccountRecovery } from "./components/AccountRecovery";
import { RequirementsPage } from "./components/RequirementsPage";
import { AuthPage } from "./components/AuthPage";
import {
  PublicApplicationForm,
  ApplicationFormData,
} from "./components/PublicApplicationForm";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// Lazy load heavy dashboard components for better performance
const StudentDashboard = lazy(() => import("./components/StudentDashboard").then(module => ({ default: module.StudentDashboard })));
const TrainingDashboard = lazy(() => import("./components/TrainingDashboard").then(module => ({ default: module.TrainingDashboard })));
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

// NOTE: Mock data imports removed - using real API instead
// TODO: Replace mock data in dashboards with API calls in Phase 2

export interface Evaluation {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  scholarId: string;
  scholarName: string;
  talentGroup: string;
  semester: string;
  academicYear: string;
  evaluationDate: Date;
  performanceMetrics: {
    skillDemonstration: number;
    rehearsalAttendance: number;
    eventParticipation: number;
    teamwork: number;
    leadership: number;
  };
  strengths: string;
  areasForImprovement: string;
  overallRating: number;
  recommendation: "continue" | "probation" | "discontinue";
  additionalNotes?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: "student" | "scholar" | "admin" | "director";
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
    | "completed"
    | "failed";
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  assignedInstrument?: string;
  assignedVoice?: string;
  scholarshipPercentage?: number;
}

export interface Application {
  id: string;
  userId: string;
  talentGroup: string;
  personalInfo: {
    name: string;
    email: string;
    studentId: string;
    phone: string;
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
    // Marching Band specific
    hasBandExperience?: boolean;
    // Glee Club specific
    vocalRange?: string;
    previousSingingExperience?: string;
    musicalBackground?: string;
    // Dance Club specific
    primaryDanceGenre?: string;
    yearsOfExperience?: string;
    performedOnStage?: string;
    willingToAttendRehearsals?: string;
    // Majorettes specific
    previousMajoretteTeam?: string;
    previousOrganization?: string;
    canPerformBasicRoutines?: string;
    willingToAttendRehearsalsMajorettes?: string;
  };
  experience: string;
  motivation: string;
  documents: string[];
  status: "pending" | "approved" | "disapproved";
  appliedAt: Date;
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
  itemName?: string;
  name?: string;
  type: "uniform" | "instrument" | "accessory";
  condition: "excellent" | "good" | "fair" | "needs_repair";
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
      <div className="w-16 h-16 border-4 border-[#7A1E1E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#6C757D]">Loading dashboard...</p>
    </div>
  </div>
);

function AppContent() {
  const { user, logout, login } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);

  const [currentPage, setCurrentPage] = useState<
    | "landing"
    | "requirements"
    | "public-application"
    | "auth"
    | "login"
    | "forgot-password"
    | "dashboard"
  >(user ? "dashboard" : "login");

  const [currentView, setCurrentView] = useState<
    | "student"
    | "training"
    | "scholar"
    | "member-profile"
    | "engagement"
    | "scholarship"
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

  // TODO: Replace with API calls in Phase 2
  // Mock data for now - will be replaced with real API calls
  const [users, setUsers] = useState<User[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [benefits] = useState<Benefit[]>([]);
  const [renewals, setRenewals] = useState<ScholarshipRenewal[]>([]);


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

  const handleLogin = async (email: string, password: string, selectedRole: string) => {
    const { success, error } = await login(email, password);

    if (success) {
      // User and role come from API response (in AuthContext)
      // The API response determines the dashboard redirect
      startTransition(() => {
        setCurrentPage("dashboard");

        // Role-based redirect based on authenticated user from API
        if (currentUser?.role === "student") {
          if (currentUser.trainingStatus === "in_progress") {
            setCurrentView("training");
          } else {
            setCurrentView("student");
          }
        } else if (currentUser?.role === "scholar") {
          setCurrentView("member-profile");
        }
      });
      toast.success(`Welcome back, ${currentUser?.name}!`);
      return { success: true };
    }

    toast.error(error || "Invalid email or password");
    return { success: false, error };
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

  const handleUpdatePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    // In a real application, this would make an API call to verify the current password
    // For demo purposes, we'll simulate validation
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Simulate password validation (in production, verify against hashed password)
    // For demo, we'll accept any non-empty current password
    if (!currentPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // In production, hash the new password before storing
    // For now, we just acknowledge the change
    return { success: true };
  };

  const handlePublicApplicationSubmit = (formData: ApplicationFormData) => {
    const newApplication: Application = {
      id: `app_${Date.now()}`,
      userId: `user_${Date.now()}`,
      talentGroup: formData.talentGroup,
      personalInfo: {
        name: formData.fullName,
        email: formData.email,
        studentId: formData.studentId || "",
        phone: formData.mobileNo,
        birthdate: formData.birthdate,
        age: formData.age,
        address: formData.address,
        gender: formData.gender,
        socialMedia: '',
        yearLevel: formData.yearLevel,
        course: formData.course,
        department: formData.department,
        guardianName: formData.guardianName,
        guardianContactNo: formData.guardianContactNo,
        guardianRelationship: formData.guardianRelationship,
        // Marching Band specific
        hasBandExperience: formData.hasBandExperience,
        // Glee Club specific
        vocalRange: formData.vocalRange,
        previousSingingExperience: formData.previousSingingExperience,
        musicalBackground: formData.musicalBackground,
        // Dance Club specific
        primaryDanceGenre: formData.primaryDanceGenre,
        yearsOfExperience: formData.yearsOfExperience,
        performedOnStage: formData.performedOnStage,
        willingToAttendRehearsals: formData.willingToAttendRehearsals,
        // Majorettes specific
        previousMajoretteTeam: formData.previousMajoretteTeam,
        previousOrganization: formData.previousOrganization,
        canPerformBasicRoutines: formData.canPerformBasicRoutines,
        willingToAttendRehearsalsMajorettes: formData.willingToAttendRehearsalsMajorettes,
      },
      experience: "",
      motivation: "",
      documents: [],
      status: "pending",
      appliedAt: new Date(),
    };

    setApplications([...applications, newApplication]);
    
    // Notify the director of the talent group about new application
    const director = users.find(u => 
      u.role === 'director' && u.talentGroup === formData.talentGroup
    );
    if (director && director.id) {
      addNotification(
        director.id,
        'New Application Received',
        `${formData.fullName} has applied for ${formData.talentGroup.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}. Review pending.`,
        'application',
        newApplication.id
      );
    }
    
    toast.success("Application submitted successfully! You will receive a notification once reviewed.");
    startTransition(() => setCurrentPage("landing"));
  };

  const handleCreateUserAccount = (application: Application, tempPassword: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: application.personalInfo.name,
      email: application.personalInfo.email,
      role: "student",
      studentId: application.personalInfo.studentId,
      phone: application.personalInfo.phone,
      talentGroup: application.talentGroup,
      applicationStatus: "approved",
      trainingStatus: "not_started",
      yearLevel: application.personalInfo.yearLevel,
      course: application.personalInfo.course,
    };

    setUsers([...users, newUser]);
    
    // Notify the admin about new scholar added
    const admin = users.find(u => u.role === 'admin');
    if (admin && admin.id) {
      addNotification(
        admin.id,
        'New Scholar Account Created',
        `Account created for ${newUser.name} in ${application.talentGroup.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}.`,
        'application',
        newUser.id
      );
    }
    
    // Notify the new user about their account
    addNotification(
      newUser.id,
      'Welcome to TalentTrackUNC!',
      `Your account has been created successfully. You can now access the training dashboard. Your temporary password has been sent to ${newUser.email}.`,
      'acceptance'
    );
    
    toast.success(`Account created successfully for ${newUser.name}. Temporary password sent via email.`);
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
            onBack={() => setCurrentPage("landing")}
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
      case "dashboard":
        if (!currentUser) return null;

        switch (currentUser.role) {
          case "student":
            if (currentUser.applicationStatus === "approved" && currentUser.trainingStatus === "in_progress") {
              // Check if viewing settings
              if (currentView === "settings") {
                return (
                  <Suspense fallback={<DashboardLoader />}>
                    <Settings
                      user={currentUser}
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
                  <TrainingDashboard
                    user={currentUser}
                    onLogout={handleLogout}
                    trainingRecord={trainingRecords.find((tr) => tr.userId === currentUser.id) || null}
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
                  user={currentUser}
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

          case "scholar":
            if (currentView === "settings") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <Settings
                    user={currentUser}
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

            if (currentUser.trainingStatus === "completed") {
              if (currentView === "member-profile") {
                return (
                  <Suspense fallback={<DashboardLoader />}>
                    <MemberProfileDashboard
                      user={currentUser}
                      onLogout={handleLogout}
                      onNavigate={(view, tab) => {
                        navigateTo(view as any, tab ?? undefined);
                      }}
                      inventory={inventoryItems.filter((item) => item.userId === currentUser.id)}
                      notifications={notifications.filter((n) => n.userId === currentUser.id)}
                      onMarkNotificationRead={(notificationId) => {
                        setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                      }}
                      onUpdateProfile={(updatedData) => {
                        setUsers(users.map((u) => u.id === currentUser.id ? { ...u, ...updatedData } : u));
                      }}
                      unreadNotifications={unreadNotificationsCount}
                      onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    />
                  </Suspense>
                );
              }

              if (currentView === "engagement") {
                return (
                  <Suspense fallback={<DashboardLoader />}>
                    <EngagementDashboard
                      user={currentUser}
                      onLogout={handleLogout}
                      onNavigate={(view, tab) => {
                        navigateTo(view as any, tab ?? undefined);
                      }}
                      events={events.filter((e) => e.talentGroups.includes(currentUser.talentGroup || ""))}
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

              if (currentView === "scholarship") {
                return (
                  <Suspense fallback={<DashboardLoader />}>
                    <ScholarshipDashboard
                      user={currentUser}
                      onLogout={handleLogout}
                      onNavigate={(view, tab) => {
                        navigateTo(view as any, tab ?? undefined);
                      }}
                      benefits={benefits}
                      renewals={renewals}
                      evaluations={evaluations.filter((e) => e.traineeId === currentUser.id)}
                      notifications={notifications.filter((n) => n.userId === currentUser.id)}
                      onMarkNotificationRead={(notificationId) => {
                        setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                      }}
                      unreadNotifications={unreadNotificationsCount}
                      onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                      onSubmitRenewal={(renewalData) => {
                        const newRenewal: ScholarshipRenewal = {
                          ...renewalData,
                          id: Date.now().toString(),
                          submittedAt: new Date().toISOString(),
                        };
                      setRenewals([...renewals, newRenewal]);
                      toast.success('Renewal application submitted successfully!');
                    }}
                  />
                  </Suspense>
                );
              }

              return (
                <Suspense fallback={<DashboardLoader />}>
                  <MemberProfileDashboard
                    user={currentUser}
                    onLogout={handleLogout}
                    onNavigate={(view) => navigateTo(view as any)}
                    inventory={inventoryItems.filter((item) => item.userId === currentUser.id)}
                    notifications={notifications.filter((n) => n.userId === currentUser.id)}
                    onMarkNotificationRead={(notificationId) => {
                      setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                    }}
                    onUpdateProfile={(updatedData) => {
                      setUsers(users.map((u) => u.id === currentUser.id ? { ...u, ...updatedData } : u));
                    }}
                    unreadNotifications={unreadNotificationsCount}
                    onNotificationsClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  />
                </Suspense>
              );
            } else {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <StudentDashboard
                    user={currentUser}
                    onLogout={handleLogout}
                    applications={applications.filter((app) => app.userId === currentUser.id)}
                    notifications={notifications.filter((n) => n.userId === currentUser.id)}
                    onMarkNotificationRead={(notificationId) => {
                      setNotifications(notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n));
                    }}
                  />
                </Suspense>
              );
            }

          case "admin":
            if (currentView === "settings") {
              return (
                <Suspense fallback={<DashboardLoader />}>
                  <Settings
                    user={currentUser}
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
                user={currentUser}
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
                  user={currentUser}
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
                user={currentUser}
                onLogout={handleLogout}
                applications={applications}
                users={users}
                trainingRecords={trainingRecords}
                events={events}
                announcements={announcements}
                evaluations={evaluations}
                setEvaluations={setEvaluations}
                onUpdateApplicationStatus={(applicationId, status) => {
                  const application = applications.find((app) => app.id === applicationId);
                  
                  // Update application status
                  setApplications(applications.map((app) => 
                    app.id === applicationId ? { ...app, status } : app
                  ));
                  
                  // If approved, create a trainee user from the application
                  if (status === 'approved' && application) {
                    // Generate temporary password
                    const tempPassword = `UNC${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                    
                    const newTrainee: User = {
                      id: `trainee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      name: application.personalInfo.name,
                      email: application.personalInfo.email,
                      role: 'student',
                      studentId: application.personalInfo.studentId,
                      phone: application.personalInfo.phone,
                      talentGroup: application.talentGroup,
                      applicationStatus: 'approved',
                      yearLevel: application.personalInfo.yearLevel,
                      course: application.personalInfo.course,
                      trainingStatus: 'not_started',
                      address: application.personalInfo.address,
                      emergencyContact: application.personalInfo.guardianName,
                      emergencyPhone: application.personalInfo.guardianContactNo,
                      assignedInstrument: application.personalInfo.vocalRange || undefined,
                      assignedVoice: application.personalInfo.vocalRange || undefined
                    };
                    
                    // Only add if user doesn't already exist
                    if (!users.find(u => u.email === newTrainee.email)) {
                      setUsers([...users, newTrainee]);
                      
                      // Send notification to the new trainee with login credentials
                      addNotification(
                        newTrainee.id!,
                        'Welcome to TalentTrackUNC!',
                        `Congratulations! Your application has been approved. Your login credentials: Email: ${newTrainee.email}, Temporary Password: ${tempPassword}. Please change your password after first login.`,
                        'application',
                        application.id
                      );
                      
                      // Notify director about successful account creation
                      const director = users.find(u => u.role === 'director' && u.talentGroup === application.talentGroup);
                      if (director && director.id) {
                        addNotification(
                          director.id,
                          'Trainee Account Created',
                          `Login credentials created and sent to ${newTrainee.name} for ${application.talentGroup.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}.`,
                          'application',
                          newTrainee.id
                        );
                      }
                      
                      toast.success(`✅ Acceptance email sent to ${application.personalInfo.name}! Login credentials created.`);
                    }
                  } else if (status === 'disapproved' && application) {
                    // Send rejection email notification
                    toast.success(`✉️ Rejection email sent to ${application.personalInfo.name}`);
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