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
import { toast } from "sonner";
import { initKeyboardNavigation } from "./utils/keyboardNavigation";
import { SkipToContent } from "./components/accessibility/SkipToContent";

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

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    | "landing"
    | "requirements"
    | "public-application"
    | "auth"
    | "login"
    | "forgot-password"
    | "dashboard"
  >("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    | "student"
    | "training"
    | "scholar"
    | "member-profile"
    | "engagement"
    | "scholarship"
    | "settings"
  >("student");
  const [settingsTab, setSettingsTab] = useState<"account" | "security" | "administration" | "logout">("account");
  const [selectedTalentGroup, setSelectedTalentGroup] = useState<string>("");
  const [, startTransition] = useTransition();

  /** Wrap view changes in startTransition so lazy-loaded dashboards don't
   *  suspend during synchronous user-input events (WCAG / React 18). */
  const navigateTo = (
    view: "student" | "training" | "scholar" | "member-profile" | "engagement" | "scholarship" | "settings" | "overview",
    tab?: "account" | "security" | "administration" | "logout"
  ) => {
    startTransition(() => {
      setCurrentView(view as any);
      if (tab) setSettingsTab(tab);
    });
  };

  // Initialize keyboard navigation on mount
  useEffect(() => {
    initKeyboardNavigation();
  }, []);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: "test-admin",
      name: "Kenjie E. Jimenea",
      email: "admin@unc.edu.ph",
      role: "admin",
    },
    {
      id: "admin-2",
      name: "Mia San Lorenzo",
      email: "mia.sanlorenzo@unc.edu.ph",
      role: "admin",
    },
    {
      id: "director-mb",
      name: "Carl Ariel Fausto",
      email: "carl.fausto@unc.edu.ph",
      role: "director",
      talentGroup: "marching-band",
    },
    {
      id: "director-majorettes",
      name: "Janeth Aquino",
      email: "janeth.aquino@unc.edu.ph",
      role: "director",
      talentGroup: "majorettes",
    },
    {
      id: "director-glee",
      name: "Prof. Carmen Villanueva",
      email: "c.villanueva@unc.edu.ph",
      role: "director",
      talentGroup: "glee-club",
    },
    {
      id: "director-dance",
      name: "Janeth Aquino",
      email: "janeth.aquino.dance@unc.edu.ph",
      role: "director",
      talentGroup: "dance-club",
    },
    {
      id: "test-scholar",
      name: "Francis Mae Aladano",
      email: "scholar@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00001",
      phone: "+63 911 111 1111",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Music",
      trainingStatus: "completed",
      scholarshipPercentage: 100,
    },
    {
      id: "test-training",
      name: "Christiana Jean Alvarez",
      email: "training@unc.edu.ph",
      role: "student",
      studentId: "2024-00002",
      phone: "+63 912 345 6780",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "glee-club",
      yearLevel: "2nd Year",
      course: "Bachelor of Music",
    },
    // Additional Scholars - Marching Band
    {
      id: "scholar-mb-1",
      name: "Monray Andante",
      email: "monray.andante@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00145",
      phone: "+63 917 234 5678",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Arts in Communication",
      trainingStatus: "completed",
      address: "123 Del Rosario St., Naga City",
      emergencyContact: "Juan Andante",
      emergencyPhone: "+63 917 234 1111",
      assignedInstrument: "Alto Sax",
      scholarshipPercentage: 75,
    },
    {
      id: "scholar-mb-2",
      name: "Abkaye Avila",
      email: "abkaye.avila@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00298",
      phone: "+63 918 345 6789",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Science in Engineering",
      trainingStatus: "completed",
      address: "456 Elias Angeles St., Naga City",
      emergencyContact: "Maria Avila",
      emergencyPhone: "+63 918 345 2222",
      assignedInstrument: "Trombone",
      scholarshipPercentage: 100,
    },
    // Scholars - Majorettes
    {
      id: "scholar-maj-1",
      name: "Reu Rosa Abueg",
      email: "reu.abueg@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00412",
      phone: "+63 919 456 7890",
      talentGroup: "majorettes",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Science in Nursing",
      trainingStatus: "completed",
      address: "789 Panganiban Drive, Naga City",
      emergencyContact: "Pedro Abueg",
      emergencyPhone: "+63 919 456 3333",
      scholarshipPercentage: 75,
    },
    {
      id: "scholar-maj-2",
      name: "Niña Krizzle Almedral",
      email: "nina.almedral@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00567",
      phone: "+63 920 567 8901",
      talentGroup: "majorettes",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Arts in Psychology",
      trainingStatus: "completed",
      address: "234 Magsaysay Ave., Naga City",
      emergencyContact: "Angela Almedral",
      emergencyPhone: "+63 920 567 4444",
      scholarshipPercentage: 100,
    },
    // Scholars - Glee Club
    {
      id: "scholar-glee-1",
      name: "Seth Jeziel Baider",
      email: "seth.baider@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00723",
      phone: "+63 921 678 9012",
      talentGroup: "glee-club",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Music",
      trainingStatus: "completed",
      address: "567 Barlin St., Naga City",
      emergencyContact: "Rosario Baider",
      emergencyPhone: "+63 921 678 5555",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-glee-2",
      name: "Mark Aaron Banas",
      email: "mark.banas@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00891",
      phone: "+63 922 789 0123",
      talentGroup: "glee-club",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Arts in Literature",
      trainingStatus: "completed",
      address: "890 Almeda Highway, Naga City",
      emergencyContact: "Francisco Banas",
      emergencyPhone: "+63 922 789 6666",
      scholarshipPercentage: 75,
    },
    // Scholars - Dance Club
    {
      id: "scholar-dance-1",
      name: "Irish Josane Agor",
      email: "irish.agor@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00934",
      phone: "+63 923 890 1234",
      talentGroup: "dance-club",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Physical Education",
      trainingStatus: "completed",
      address: "456 Liboton St., Naga City",
      emergencyContact: "Roberto Agor",
      emergencyPhone: "+63 923 890 5555",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-dance-2",
      name: "Nadia Monica Banaag",
      email: "nadia.banaag@unc.edu.ph",
      role: "scholar",
      studentId: "2022-01078",
      phone: "+63 924 901 2345",
      talentGroup: "dance-club",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Arts in Theater Arts",
      trainingStatus: "completed",
      address: "789 Peñafrancia Ave., Naga City",
      emergencyContact: "Carmen Banaag",
      emergencyPhone: "+63 924 901 6666",
      scholarshipPercentage: 75,
    },
    // Students in Training
    {
      id: "training-mb-1",
      name: "Ralph Windel Azaña",
      email: "ralph.azana@unc.edu.ph",
      role: "student",
      studentId: "2024-00156",
      phone: "+63 925 012 3456",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "marching-band",
      yearLevel: "1st Year",
      course: "Bachelor of Music",
      address: "890 Igualdad Interior, Naga City",
      emergencyContact: "Rosa Azaña",
      emergencyPhone: "+63 925 012 2222",
    },
    {
      id: "training-maj-1",
      name: "Gretchen Balete",
      email: "gretchen.balete@unc.edu.ph",
      role: "student",
      studentId: "2024-00289",
      phone: "+63 926 123 4567",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "majorettes",
      yearLevel: "1st Year",
      course: "Bachelor of Science in Nursing",
      address: "123 Pacol, Naga City",
      emergencyContact: "Miguel Balete",
      emergencyPhone: "+63 926 123 3333",
    },
    {
      id: "training-dance-1",
      name: "Felicity France Dizon",
      email: "felicity.dizon@unc.edu.ph",
      role: "student",
      studentId: "2024-00412",
      phone: "+63 927 234 5678",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "dance-club",
      yearLevel: "1st Year",
      course: "Bachelor of Physical Education",
      address: "456 Tabuco, Naga City",
      emergencyContact: "Ana Dizon",
      emergencyPhone: "+63 927 234 4444",
    },
    // Additional Scholars per talent group
    {
      id: "scholar-mb-3",
      name: "Daniel Francisco Gutierrez",
      email: "daniel.gutierrez@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00234",
      phone: "+63 928 345 6789",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Music Education",
      trainingStatus: "completed",
      address: "234 Concepcion Grande, Naga City",
      emergencyContact: "Elena Gutierrez",
      emergencyPhone: "+63 928 345 7777",
      assignedInstrument: "Trumpet",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-mb-4",
      name: "Katrina Ysabelle Magno",
      email: "katrina.magno@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00345",
      phone: "+63 929 456 7890",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Arts in Broadcasting",
      trainingStatus: "completed",
      address: "567 Balatas Road, Naga City",
      emergencyContact: "Ricardo Magno",
      emergencyPhone: "+63 929 456 8888",
      assignedInstrument: "Clarinet",
      scholarshipPercentage: 75,
    },
    {
      id: "scholar-mb-5",
      name: "Adrian James Mercado",
      email: "adrian.mercado@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00456",
      phone: "+63 930 567 8901",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Science in Computer Science",
      trainingStatus: "completed",
      address: "890 Carolina, Naga City",
      emergencyContact: "Victoria Mercado",
      emergencyPhone: "+63 930 567 9999",
      assignedInstrument: "French Horn",
      scholarshipPercentage: 50,
    },
    {
      id: "scholar-mb-6",
      name: "Patricia Anne Gonzales",
      email: "patricia.gonzales@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00567",
      phone: "+63 931 678 9012",
      talentGroup: "marching-band",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Music",
      trainingStatus: "completed",
      address: "123 Tinago, Naga City",
      emergencyContact: "Fernando Gonzales",
      emergencyPhone: "+63 931 678 1010",
      assignedInstrument: "Flute",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-maj-3",
      name: "Bianca Sophia Cortez",
      email: "bianca.cortez@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00678",
      phone: "+63 932 789 0123",
      talentGroup: "majorettes",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Science in Physical Therapy",
      trainingStatus: "completed",
      address: "456 Triangulo, Naga City",
      emergencyContact: "Margarita Cortez",
      emergencyPhone: "+63 932 789 1111",
      scholarshipPercentage: 75,
    },
    {
      id: "scholar-maj-4",
      name: "Samantha Joy Valencia",
      email: "samantha.valencia@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00789",
      phone: "+63 933 890 1234",
      talentGroup: "majorettes",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Science in Tourism Management",
      trainingStatus: "completed",
      address: "789 Sabang, Naga City",
      emergencyContact: "Antonio Valencia",
      emergencyPhone: "+63 933 890 2222",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-maj-5",
      name: "Cassandra Marie Robles",
      email: "cassandra.robles@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00890",
      phone: "+63 934 901 2345",
      talentGroup: "majorettes",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Arts in Multimedia Arts",
      trainingStatus: "completed",
      address: "234 Sta. Cruz, Naga City",
      emergencyContact: "Gloria Robles",
      emergencyPhone: "+63 934 901 3333",
      scholarshipPercentage: 50,
    },
    {
      id: "scholar-glee-3",
      name: "Christian Miguel Bautista",
      email: "christian.bautista@unc.edu.ph",
      role: "scholar",
      studentId: "2023-00901",
      phone: "+63 935 012 3456",
      talentGroup: "glee-club",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Arts in English",
      trainingStatus: "completed",
      address: "567 Dinaga, Naga City",
      emergencyContact: "Teresa Bautista",
      emergencyPhone: "+63 935 012 4444",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-glee-4",
      name: "Francesca Beatriz Salazar",
      email: "francesca.salazar@unc.edu.ph",
      role: "scholar",
      studentId: "2022-00912",
      phone: "+63 936 123 4567",
      talentGroup: "glee-club",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Music Performance",
      trainingStatus: "completed",
      address: "890 Mabolo, Naga City",
      emergencyContact: "Luis Salazar",
      emergencyPhone: "+63 936 123 5555",
      scholarshipPercentage: 75,
    },
    {
      id: "scholar-glee-5",
      name: "Matthew Joseph Reyes",
      email: "matthew.reyes@unc.edu.ph",
      role: "scholar",
      studentId: "2023-01023",
      phone: "+63 937 234 5678",
      talentGroup: "glee-club",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Secondary Education",
      trainingStatus: "completed",
      address: "123 Lerma, Naga City",
      emergencyContact: "Sandra Reyes",
      emergencyPhone: "+63 937 234 6666",
      scholarshipPercentage: 50,
    },
    {
      id: "scholar-glee-6",
      name: "Angelique Rose Santiago",
      email: "angelique.santiago@unc.edu.ph",
      role: "scholar",
      studentId: "2022-01134",
      phone: "+63 938 345 6789",
      talentGroup: "glee-club",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Arts in Philosophy",
      trainingStatus: "completed",
      address: "456 Dayangdang, Naga City",
      emergencyContact: "Jose Santiago",
      emergencyPhone: "+63 938 345 7777",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-dance-3",
      name: "Kenneth Paul Valdez",
      email: "kenneth.valdez@unc.edu.ph",
      role: "scholar",
      studentId: "2023-01245",
      phone: "+63 939 456 7890",
      talentGroup: "dance-club",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Science in Sports Science",
      trainingStatus: "completed",
      address: "789 Abella, Naga City",
      emergencyContact: "Maria Valdez",
      emergencyPhone: "+63 939 456 8888",
      scholarshipPercentage: 75,
    },
    {
      id: "scholar-dance-4",
      name: "Michelle Ann Dimaano",
      email: "michelle.dimaano@unc.edu.ph",
      role: "scholar",
      studentId: "2022-01356",
      phone: "+63 940 567 8901",
      talentGroup: "dance-club",
      applicationStatus: "approved",
      yearLevel: "3rd Year",
      course: "Bachelor of Fine Arts",
      trainingStatus: "completed",
      address: "234 Bagumbayan, Naga City",
      emergencyContact: "Eduardo Dimaano",
      emergencyPhone: "+63 940 567 9999",
      scholarshipPercentage: 100,
    },
    {
      id: "scholar-dance-5",
      name: "Raphael Lorenzo Cruz",
      email: "raphael.cruz@unc.edu.ph",
      role: "scholar",
      studentId: "2023-01467",
      phone: "+63 941 678 9012",
      talentGroup: "dance-club",
      applicationStatus: "approved",
      yearLevel: "2nd Year",
      course: "Bachelor of Arts in Dance",
      trainingStatus: "completed",
      address: "567 Cararayan, Naga City",
      emergencyContact: "Isabella Cruz",
      emergencyPhone: "+63 941 678 1010",
      scholarshipPercentage: 50,
    },
    {
      id: "training-glee-1",
      name: "Sophia Marie Castillo",
      email: "sophia.castillo@unc.edu.ph",
      role: "student",
      studentId: "2024-00534",
      phone: "+63 942 789 0123",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "glee-club",
      yearLevel: "1st Year",
      course: "Bachelor of Music Education",
      address: "789 Penafrancia, Naga City",
      emergencyContact: "Roberto Castillo",
      emergencyPhone: "+63 942 789 5555",
    },
    {
      id: "training-mb-2",
      name: "Lucas Gabriel Morales",
      email: "lucas.morales@unc.edu.ph",
      role: "student",
      studentId: "2024-00645",
      phone: "+63 943 890 1234",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "marching-band",
      yearLevel: "1st Year",
      course: "Bachelor of Science in Architecture",
      address: "234 San Felipe, Naga City",
      emergencyContact: "Carmela Morales",
      emergencyPhone: "+63 943 890 6666",
    },
    {
      id: "training-maj-2",
      name: "Victoria Anne Lim",
      email: "victoria.lim@unc.edu.ph",
      role: "student",
      studentId: "2024-00756",
      phone: "+63 944 901 2345",
      applicationStatus: "approved",
      trainingStatus: "in_progress",
      talentGroup: "majorettes",
      yearLevel: "1st Year",
      course: "Bachelor of Science in Accountancy",
      address: "567 Calauag, Naga City",
      emergencyContact: "Thomas Lim",
      emergencyPhone: "+63 944 901 7777",
    },
    // ========== ADDITIONAL SCHOLARS - Populating Admin Dashboard ==========
    // Marching Band Scholars (40+ additional)
    { id: "scholar-mb-10", name: "Jose Miguel Santos", email: "jose.santos@unc.edu.ph", role: "scholar", studentId: "2022-02001", phone: "+63 945 111 2222", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Civil Engineering", trainingStatus: "completed", address: "12 Abella St., Naga City", emergencyContact: "Maria Santos", emergencyPhone: "+63 945 111 3333", assignedInstrument: "Trumpet", scholarshipPercentage: 75 },
    { id: "scholar-mb-11", name: "Carlos Antonio Reyes", email: "carlos.reyes2@unc.edu.ph", role: "scholar", studentId: "2023-02002", phone: "+63 945 222 3333", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Music", trainingStatus: "completed", address: "45 Carolina St., Naga City", emergencyContact: "Antonio Reyes", emergencyPhone: "+63 945 222 4444", assignedInstrument: "French Horn", scholarshipPercentage: 100 },
    { id: "scholar-mb-12", name: "Rafael Luis Cruz", email: "rafael.cruz2@unc.edu.ph", role: "scholar", studentId: "2022-02003", phone: "+63 945 333 4444", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Computer Science", trainingStatus: "completed", address: "78 Magsaysay Ave., Naga City", emergencyContact: "Luis Cruz", emergencyPhone: "+63 945 333 5555", assignedInstrument: "Trombone", scholarshipPercentage: 75 },
    { id: "scholar-mb-13", name: "Gabriel James Gonzales", email: "gabriel.gonzales2@unc.edu.ph", role: "scholar", studentId: "2023-02004", phone: "+63 945 444 5555", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Mechanical Engineering", trainingStatus: "completed", address: "23 Dinaga, Naga City", emergencyContact: "James Gonzales", emergencyPhone: "+63 945 444 6666", assignedInstrument: "Baritone", scholarshipPercentage: 50 },
    { id: "scholar-mb-14", name: "Daniel Paolo Rivera", email: "daniel.rivera2@unc.edu.ph", role: "scholar", studentId: "2022-02005", phone: "+63 945 555 6666", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Architecture", trainingStatus: "completed", address: "56 Triangulo, Naga City", emergencyContact: "Paolo Rivera", emergencyPhone: "+63 945 555 7777", assignedInstrument: "Clarinet", scholarshipPercentage: 100 },
    { id: "scholar-mb-15", name: "Miguel Angel Tan", email: "miguel.tan2@unc.edu.ph", role: "scholar", studentId: "2023-02006", phone: "+63 945 666 7777", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Electrical Engineering", trainingStatus: "completed", address: "89 Concepcion Grande, Naga City", emergencyContact: "Angel Tan", emergencyPhone: "+63 945 666 8888", assignedInstrument: "Saxophone", scholarshipPercentage: 75 },
    { id: "scholar-mb-16", name: "Christian Paul Mercado", email: "christian.mercado2@unc.edu.ph", role: "scholar", studentId: "2022-02007", phone: "+63 945 777 8888", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Accountancy", trainingStatus: "completed", address: "12 San Nicolas, Naga City", emergencyContact: "Paul Mercado", emergencyPhone: "+63 945 777 9999", assignedInstrument: "Trumpet" },
    { id: "scholar-mb-17", name: "Joshua Miguel Garcia", email: "joshua.garcia2@unc.edu.ph", role: "scholar", studentId: "2023-02008", phone: "+63 945 888 9999", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Information Technology", trainingStatus: "completed", address: "45 Lerma St., Naga City", emergencyContact: "Miguel Garcia", emergencyPhone: "+63 945 888 0000", assignedInstrument: "Flute" },
    { id: "scholar-mb-18", name: "Emmanuel Jose Villanueva", email: "emmanuel.villanueva2@unc.edu.ph", role: "scholar", studentId: "2022-02009", phone: "+63 945 999 0000", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Business Administration", trainingStatus: "completed", address: "78 Bagumbayan, Naga City", emergencyContact: "Jose Villanueva", emergencyPhone: "+63 945 999 1111", assignedInstrument: "Percussion" },
    { id: "scholar-mb-19", name: "Matthew John Lopez", email: "matthew.lopez2@unc.edu.ph", role: "scholar", studentId: "2023-02010", phone: "+63 946 000 1111", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Communication", trainingStatus: "completed", address: "23 Liboton, Naga City", emergencyContact: "John Lopez", emergencyPhone: "+63 946 000 2222", assignedInstrument: "Tuba" },
    { id: "scholar-mb-20", name: "Sebastian Carlo Ramos", email: "sebastian.ramos2@unc.edu.ph", role: "scholar", studentId: "2022-02011", phone: "+63 946 111 2222", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Psychology", trainingStatus: "completed", address: "56 Mabolo, Naga City", emergencyContact: "Carlo Ramos", emergencyPhone: "+63 946 111 3333", assignedInstrument: "Mellophone" },
    { id: "scholar-mb-21", name: "Alexander Luis Fernandez", email: "alexander.fernandez2@unc.edu.ph", role: "scholar", studentId: "2023-02012", phone: "+63 946 222 3333", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Biology", trainingStatus: "completed", address: "89 Calauag, Naga City", emergencyContact: "Luis Fernandez", emergencyPhone: "+63 946 222 4444", assignedInstrument: "Alto Sax" },
    { id: "scholar-mb-22", name: "Nicolas Antonio Martinez", email: "nicolas.martinez2@unc.edu.ph", role: "scholar", studentId: "2022-02013", phone: "+63 946 333 4444", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Chemical Engineering", trainingStatus: "completed", address: "12 Sta. Cruz, Naga City", emergencyContact: "Antonio Martinez", emergencyPhone: "+63 946 333 5555", assignedInstrument: "Euphonium" },
    { id: "scholar-mb-23", name: "Benjamin Carlo Aquino", email: "benjamin.aquino2@unc.edu.ph", role: "scholar", studentId: "2023-02014", phone: "+63 946 444 5555", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Mathematics", trainingStatus: "completed", address: "45 Dayangdang, Naga City", emergencyContact: "Carlo Aquino", emergencyPhone: "+63 946 444 6666", assignedInstrument: "Clarinet" },
    { id: "scholar-mb-24", name: "Vincent Joseph Rivera", email: "vincent.rivera2@unc.edu.ph", role: "scholar", studentId: "2022-02015", phone: "+63 946 555 6666", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Physics", trainingStatus: "completed", address: "78 Pacol, Naga City", emergencyContact: "Joseph Rivera", emergencyPhone: "+63 946 555 7777", assignedInstrument: "Tenor Sax" },
    { id: "scholar-mb-25", name: "Adrian Miguel Santos", email: "adrian.santos3@unc.edu.ph", role: "scholar", studentId: "2023-02016", phone: "+63 946 666 7777", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Statistics", trainingStatus: "completed", address: "23 Igualdad, Naga City", emergencyContact: "Miguel Santos", emergencyPhone: "+63 946 666 8888", assignedInstrument: "Piccolo" },
    { id: "scholar-mb-26", name: "Dominic Carlo Cruz", email: "dominic.cruz2@unc.edu.ph", role: "scholar", studentId: "2022-02017", phone: "+63 946 777 8888", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Computer Engineering", trainingStatus: "completed", address: "56 Sabang, Naga City", emergencyContact: "Carlo Cruz", emergencyPhone: "+63 946 777 9999", assignedInstrument: "Trumpet" },
    { id: "scholar-mb-27", name: "Elijah James Reyes", email: "elijah.reyes2@unc.edu.ph", role: "scholar", studentId: "2023-02018", phone: "+63 946 888 9999", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Industrial Engineering", trainingStatus: "completed", address: "89 Tinago, Naga City", emergencyContact: "James Reyes", emergencyPhone: "+63 946 888 0000", assignedInstrument: "Trombone" },
    { id: "scholar-mb-28", name: "Isaac Paul Gonzales", email: "isaac.gonzales2@unc.edu.ph", role: "scholar", studentId: "2022-02019", phone: "+63 946 999 0000", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Criminology", trainingStatus: "completed", address: "12 Panicuason, Naga City", emergencyContact: "Paul Gonzales", emergencyPhone: "+63 946 999 1111", assignedInstrument: "Baritone Sax" },
    { id: "scholar-mb-29", name: "Julian Miguel Tan", email: "julian.tan2@unc.edu.ph", role: "scholar", studentId: "2023-02020", phone: "+63 947 000 1111", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Food Technology", trainingStatus: "completed", address: "45 Peñafrancia Ave., Naga City", emergencyContact: "Miguel Tan", emergencyPhone: "+63 947 000 2222", assignedInstrument: "Percussion" },
    { id: "scholar-mb-30", name: "Nathan Carlo Mercado", email: "nathan.mercado2@unc.edu.ph", role: "scholar", studentId: "2022-02021", phone: "+63 947 111 2222", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Arts in Political Science", trainingStatus: "completed", address: "78 Balatas, Naga City", emergencyContact: "Carlo Mercado", emergencyPhone: "+63 947 111 3333", assignedInstrument: "Flute" },
    { id: "scholar-mb-31", name: "Oliver James Garcia", email: "oliver.garcia2@unc.edu.ph", role: "scholar", studentId: "2023-02022", phone: "+63 947 222 3333", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Marine Biology", trainingStatus: "completed", address: "23 Carolina St., Naga City", emergencyContact: "James Garcia", emergencyPhone: "+63 947 222 4444", assignedInstrument: "Sousaphone" },
    { id: "scholar-mb-32", name: "Samuel Luis Villanueva", email: "samuel.villanueva2@unc.edu.ph", role: "scholar", studentId: "2022-02023", phone: "+63 947 333 4444", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Pharmacy", trainingStatus: "completed", address: "56 Lerma St., Naga City", emergencyContact: "Luis Villanueva", emergencyPhone: "+63 947 333 5555", assignedInstrument: "Clarinet" },
    { id: "scholar-mb-33", name: "Timothy Jose Lopez", email: "timothy.lopez2@unc.edu.ph", role: "scholar", studentId: "2023-02024", phone: "+63 947 444 5555", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Geology", trainingStatus: "completed", address: "89 Concepcion Pequeña, Naga City", emergencyContact: "Jose Lopez", emergencyPhone: "+63 947 444 6666", assignedInstrument: "Marimba" },
    { id: "scholar-mb-34", name: "Anthony Miguel Ramos", email: "anthony.ramos2@unc.edu.ph", role: "scholar", studentId: "2022-02025", phone: "+63 947 555 6666", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Economics", trainingStatus: "completed", address: "12 Dinaga, Naga City", emergencyContact: "Miguel Ramos", emergencyPhone: "+63 947 555 7777", assignedInstrument: "Alto Clarinet" },
    { id: "scholar-mb-35", name: "Kevin Paul Fernandez", email: "kevin.fernandez2@unc.edu.ph", role: "scholar", studentId: "2023-02026", phone: "+63 947 666 7777", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Management Accounting", trainingStatus: "completed", address: "45 San Felipe, Naga City", emergencyContact: "Paul Fernandez", emergencyPhone: "+63 947 666 8888", assignedInstrument: "Bass Drum" },
    { id: "scholar-mb-36", name: "Brandon Carlo Martinez", email: "brandon.martinez2@unc.edu.ph", role: "scholar", studentId: "2022-02027", phone: "+63 947 777 8888", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Chemistry", trainingStatus: "completed", address: "78 Tabuco, Naga City", emergencyContact: "Carlo Martinez", emergencyPhone: "+63 947 777 9999", assignedInstrument: "Trumpet" },
    { id: "scholar-mb-37", name: "Justin Miguel Aquino", email: "justin.aquino2@unc.edu.ph", role: "scholar", studentId: "2023-02028", phone: "+63 947 888 9999", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Environmental Science", trainingStatus: "completed", address: "23 Triangulo, Naga City", emergencyContact: "Miguel Aquino", emergencyPhone: "+63 947 888 0000", assignedInstrument: "Trombone" },
    { id: "scholar-mb-38", name: "Ryan James Santos", email: "ryan.santos2@unc.edu.ph", role: "scholar", studentId: "2022-02029", phone: "+63 947 999 0000", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Medical Technology", trainingStatus: "completed", address: "56 Bagumbayan, Naga City", emergencyContact: "James Santos", emergencyPhone: "+63 947 999 1111", assignedInstrument: "Tenor Drum" },
    { id: "scholar-mb-39", name: "Aaron Luis Cruz", email: "aaron.cruz2@unc.edu.ph", role: "scholar", studentId: "2023-02030", phone: "+63 948 000 1111", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Radiologic Technology", trainingStatus: "completed", address: "89 Liboton, Naga City", emergencyContact: "Luis Cruz", emergencyPhone: "+63 948 000 2222", assignedInstrument: "Xylophone" },
    { id: "scholar-mb-40", name: "Patrick James Tan", email: "patrick.tan2@unc.edu.ph", role: "scholar", studentId: "2022-02031", phone: "+63 948 111 2222", talentGroup: "marching-band", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Physical Therapy", trainingStatus: "completed", address: "12 Mabolo, Naga City", emergencyContact: "James Tan", emergencyPhone: "+63 948 111 3333", assignedInstrument: "French Horn" },
    // Glee Club Scholars (20+ additional)
    { id: "scholar-gc-10", name: "Maria Isabel Santos", email: "maria.santos2@unc.edu.ph", role: "scholar", studentId: "2022-03001", phone: "+63 949 222 3333", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Music", trainingStatus: "completed", address: "89 Carolina St., Naga City", emergencyContact: "Isabel Santos", emergencyPhone: "+63 949 222 4444", vocalRange: "Soprano" },
    { id: "scholar-gc-11", name: "Ana Marie Cruz", email: "ana.cruz2@unc.edu.ph", role: "scholar", studentId: "2023-03002", phone: "+63 949 333 4444", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Elementary Education", trainingStatus: "completed", address: "12 Magsaysay Ave., Naga City", emergencyContact: "Marie Cruz", emergencyPhone: "+63 949 333 5555", vocalRange: "Alto" },
    { id: "scholar-gc-12", name: "Sophia Grace Reyes", email: "sophia.reyes2@unc.edu.ph", role: "scholar", studentId: "2022-03003", phone: "+63 949 444 5555", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Arts in English", trainingStatus: "completed", address: "45 Dinaga, Naga City", emergencyContact: "Grace Reyes", emergencyPhone: "+63 949 444 6666", vocalRange: "Mezzo-Soprano" },
    { id: "scholar-gc-13", name: "Isabella Rose Gonzales", email: "isabella.gonzales2@unc.edu.ph", role: "scholar", studentId: "2023-03004", phone: "+63 949 555 6666", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Secondary Education major in Music", trainingStatus: "completed", address: "78 Triangulo, Naga City", emergencyContact: "Rose Gonzales", emergencyPhone: "+63 949 555 7777", vocalRange: "Soprano" },
    { id: "scholar-gc-14", name: "Victoria Anne Tan", email: "victoria.tan2@unc.edu.ph", role: "scholar", studentId: "2022-03005", phone: "+63 949 666 7777", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Psychology", trainingStatus: "completed", address: "23 Concepcion Grande, Naga City", emergencyContact: "Anne Tan", emergencyPhone: "+63 949 666 8888", vocalRange: "Alto" },
    { id: "scholar-gc-15", name: "Gabriella Marie Mercado", email: "gabriella.mercado2@unc.edu.ph", role: "scholar", studentId: "2023-03006", phone: "+63 949 777 8888", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Literature", trainingStatus: "completed", address: "56 San Nicolas, Naga City", emergencyContact: "Marie Mercado", emergencyPhone: "+63 949 777 9999", vocalRange: "Soprano" },
    { id: "scholar-gc-16", name: "Olivia Grace Garcia", email: "olivia.garcia2@unc.edu.ph", role: "scholar", studentId: "2022-03007", phone: "+63 949 888 9999", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Music Education", trainingStatus: "completed", address: "89 Lerma St., Naga City", emergencyContact: "Grace Garcia", emergencyPhone: "+63 949 888 0000", vocalRange: "Mezzo-Soprano" },
    { id: "scholar-gc-17", name: "Natalie Faith Villanueva", email: "natalie.villanueva2@unc.edu.ph", role: "scholar", studentId: "2023-03008", phone: "+63 949 999 0000", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Communication", trainingStatus: "completed", address: "12 Bagumbayan, Naga City", emergencyContact: "Faith Villanueva", emergencyPhone: "+63 949 999 1111", vocalRange: "Alto" },
    { id: "scholar-gc-18", name: "Andrea Joy Lopez", email: "andrea.lopez2@unc.edu.ph", role: "scholar", studentId: "2022-03009", phone: "+63 950 000 1111", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Social Work", trainingStatus: "completed", address: "45 Liboton, Naga City", emergencyContact: "Joy Lopez", emergencyPhone: "+63 950 000 2222", vocalRange: "Soprano" },
    { id: "scholar-gc-19", name: "Nicole Christine Ramos", email: "nicole.ramos2@unc.edu.ph", role: "scholar", studentId: "2023-03010", phone: "+63 950 111 2222", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Philosophy", trainingStatus: "completed", address: "78 Mabolo, Naga City", emergencyContact: "Christine Ramos", emergencyPhone: "+63 950 111 3333", vocalRange: "Alto" },
    { id: "scholar-gc-20", name: "Nathan Andrei Martinez", email: "nathan.martinez2@unc.edu.ph", role: "scholar", studentId: "2023-03012", phone: "+63 950 333 4444", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Music", trainingStatus: "completed", address: "56 Sta. Cruz, Naga City", emergencyContact: "Andrei Martinez", emergencyPhone: "+63 950 333 5555", vocalRange: "Tenor" },
    { id: "scholar-gc-21", name: "Lucas Gabriel Aquino", email: "lucas.aquino2@unc.edu.ph", role: "scholar", studentId: "2022-03013", phone: "+63 950 444 5555", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Secondary Education major in English", trainingStatus: "completed", address: "89 Dayangdang, Naga City", emergencyContact: "Gabriel Aquino", emergencyPhone: "+63 950 444 6666", vocalRange: "Baritone" },
    { id: "scholar-gc-22", name: "Ethan James Santos", email: "ethan.santos2@unc.edu.ph", role: "scholar", studentId: "2023-03014", phone: "+63 950 555 6666", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Theater Arts", trainingStatus: "completed", address: "12 Pacol, Naga City", emergencyContact: "James Santos", emergencyPhone: "+63 950 555 7777", vocalRange: "Tenor" },
    { id: "scholar-gc-23", name: "Liam Miguel Cruz", email: "liam.cruz2@unc.edu.ph", role: "scholar", studentId: "2022-03015", phone: "+63 950 666 7777", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Music Education", trainingStatus: "completed", address: "45 Igualdad, Naga City", emergencyContact: "Miguel Cruz", emergencyPhone: "+63 950 666 8888", vocalRange: "Bass" },
    { id: "scholar-gc-24", name: "David Carlo Reyes", email: "david.reyes2@unc.edu.ph", role: "scholar", studentId: "2023-03016", phone: "+63 950 777 8888", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Communication", trainingStatus: "completed", address: "78 Sabang, Naga City", emergencyContact: "Carlo Reyes", emergencyPhone: "+63 950 777 9999", vocalRange: "Tenor" },
    { id: "scholar-gc-25", name: "Christian Miguel Diaz", email: "christian.diaz@unc.edu.ph", role: "scholar", studentId: "2022-03017", phone: "+63 950 888 9999", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Music", trainingStatus: "completed", address: "34 Peñafrancia Ave., Naga City", emergencyContact: "Miguel Diaz", emergencyPhone: "+63 950 888 0000", vocalRange: "Baritone" },
    { id: "scholar-gc-26", name: "Gabriel Antonio Martinez", email: "gabriel.martinez@unc.edu.ph", role: "scholar", studentId: "2023-03018", phone: "+63 950 999 0000", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Music Education", trainingStatus: "completed", address: "67 Balatas, Naga City", emergencyContact: "Antonio Martinez", emergencyPhone: "+63 950 999 1111", vocalRange: "Tenor" },
    { id: "scholar-gc-27", name: "Nathaniel Jose Cruz", email: "nathaniel.cruz@unc.edu.ph", role: "scholar", studentId: "2022-03019", phone: "+63 951 000 1111", talentGroup: "glee-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Secondary Education major in Music", trainingStatus: "completed", address: "89 Tinago, Naga City", emergencyContact: "Jose Cruz", emergencyPhone: "+63 951 000 2222", vocalRange: "Bass" },
    // Majorettes Scholars (15+ additional)
    { id: "scholar-maj-10", name: "Diana Rose Lopez", email: "diana.lopez2@unc.edu.ph", role: "scholar", studentId: "2022-04001", phone: "+63 951 333 4444", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Arts in Psychology", trainingStatus: "completed", address: "78 Magsaysay Ave., Naga City", emergencyContact: "Rose Lopez", emergencyPhone: "+63 951 333 5555" },
    { id: "scholar-maj-11", name: "Alexa Faith Ramos", email: "alexa.ramos2@unc.edu.ph", role: "scholar", studentId: "2023-04002", phone: "+63 951 444 5555", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Hospitality Management", trainingStatus: "completed", address: "23 Dinaga, Naga City", emergencyContact: "Faith Ramos", emergencyPhone: "+63 951 444 6666" },
    { id: "scholar-maj-12", name: "Hannah Grace Fernandez", email: "hannah.fernandez2@unc.edu.ph", role: "scholar", studentId: "2022-04003", phone: "+63 951 555 6666", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Nursing", trainingStatus: "completed", address: "56 Triangulo, Naga City", emergencyContact: "Grace Fernandez", emergencyPhone: "+63 951 555 7777" },
    { id: "scholar-maj-13", name: "Stephanie Rose Martinez", email: "stephanie.martinez2@unc.edu.ph", role: "scholar", studentId: "2023-04004", phone: "+63 951 666 7777", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Physical Education", trainingStatus: "completed", address: "89 Concepcion Grande, Naga City", emergencyContact: "Rose Martinez", emergencyPhone: "+63 951 666 8888" },
    { id: "scholar-maj-14", name: "Kyla Marie Aquino", email: "kyla.aquino2@unc.edu.ph", role: "scholar", studentId: "2022-04005", phone: "+63 951 777 8888", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Arts in Communication", trainingStatus: "completed", address: "12 San Nicolas, Naga City", emergencyContact: "Marie Aquino", emergencyPhone: "+63 951 777 9999" },
    { id: "scholar-maj-15", name: "Chelsea Anne Santos", email: "chelsea.santos2@unc.edu.ph", role: "scholar", studentId: "2023-04006", phone: "+63 951 888 9999", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Tourism Management", trainingStatus: "completed", address: "45 Lerma St., Naga City", emergencyContact: "Anne Santos", emergencyPhone: "+63 951 888 0000" },
    { id: "scholar-maj-16", name: "Mia Sophia Cruz", email: "mia.cruz2@unc.edu.ph", role: "scholar", studentId: "2022-04007", phone: "+63 951 999 0000", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Accountancy", trainingStatus: "completed", address: "78 Bagumbayan, Naga City", emergencyContact: "Sophia Cruz", emergencyPhone: "+63 951 999 1111" },
    { id: "scholar-maj-17", name: "Ashley Grace Reyes", email: "ashley.reyes2@unc.edu.ph", role: "scholar", studentId: "2023-04008", phone: "+63 952 000 1111", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Business Administration", trainingStatus: "completed", address: "23 Liboton, Naga City", emergencyContact: "Grace Reyes", emergencyPhone: "+63 952 000 2222" },
    { id: "scholar-maj-18", name: "Samantha Joy Gonzales", email: "samantha.gonzales2@unc.edu.ph", role: "scholar", studentId: "2022-04009", phone: "+63 952 111 2222", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Psychology", trainingStatus: "completed", address: "56 Mabolo, Naga City", emergencyContact: "Joy Gonzales", emergencyPhone: "+63 952 111 3333" },
    { id: "scholar-maj-19", name: "Lauren Faith Tan", email: "lauren.tan2@unc.edu.ph", role: "scholar", studentId: "2023-04010", phone: "+63 952 222 3333", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Science in Hotel Management", trainingStatus: "completed", address: "89 Calauag, Naga City", emergencyContact: "Faith Tan", emergencyPhone: "+63 952 222 4444" },
    { id: "scholar-maj-20", name: "Brianna Rose Mercado", email: "brianna.mercado2@unc.edu.ph", role: "scholar", studentId: "2022-04011", phone: "+63 952 333 4444", talentGroup: "majorettes", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Arts in Political Science", trainingStatus: "completed", address: "12 Sta. Cruz, Naga City", emergencyContact: "Rose Mercado", emergencyPhone: "+63 952 333 5555" },
    // Dance Club Scholars (8+ additional)
    { id: "scholar-dc-10", name: "Mikhail Joseph Fernandez", email: "mikhail.fernandez2@unc.edu.ph", role: "scholar", studentId: "2022-05001", phone: "+63 952 888 9999", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Physical Education", trainingStatus: "completed", address: "89 Tinago, Naga City", emergencyContact: "Joseph Fernandez", emergencyPhone: "+63 952 888 0000" },
    { id: "scholar-dc-11", name: "Sophia Marie Martinez", email: "sophia.martinez2@unc.edu.ph", role: "scholar", studentId: "2023-05002", phone: "+63 952 999 0000", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Dance", trainingStatus: "completed", address: "12 Panicuason, Naga City", emergencyContact: "Marie Martinez", emergencyPhone: "+63 952 999 1111" },
    { id: "scholar-dc-12", name: "Isabella Faith Aquino", email: "isabella.aquino2@unc.edu.ph", role: "scholar", studentId: "2022-05003", phone: "+63 953 000 1111", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Sports Science", trainingStatus: "completed", address: "45 Peñafrancia Ave., Naga City", emergencyContact: "Faith Aquino", emergencyPhone: "+63 953 000 2222" },
    { id: "scholar-dc-13", name: "Carlos Miguel Santos", email: "carlos.santos2@unc.edu.ph", role: "scholar", studentId: "2023-05004", phone: "+63 953 111 2222", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Physical Education", trainingStatus: "completed", address: "78 Balatas, Naga City", emergencyContact: "Miguel Santos", emergencyPhone: "+63 953 111 3333" },
    { id: "scholar-dc-14", name: "Jasmine Nicole Cruz", email: "jasmine.cruz2@unc.edu.ph", role: "scholar", studentId: "2022-05005", phone: "+63 953 222 3333", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Arts in Theater Arts", trainingStatus: "completed", address: "23 Carolina St., Naga City", emergencyContact: "Nicole Cruz", emergencyPhone: "+63 953 222 4444" },
    { id: "scholar-dc-15", name: "Aiden Paolo Reyes", email: "aiden.reyes2@unc.edu.ph", role: "scholar", studentId: "2023-05006", phone: "+63 953 333 4444", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Arts in Dance", trainingStatus: "completed", address: "56 Magsaysay Ave., Naga City", emergencyContact: "Paolo Reyes", emergencyPhone: "+63 953 333 5555" },
    { id: "scholar-dc-16", name: "Maya Grace Gonzales", email: "maya.gonzales2@unc.edu.ph", role: "scholar", studentId: "2022-05007", phone: "+63 953 444 5555", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "3rd Year", course: "Bachelor of Science in Sports Science", trainingStatus: "completed", address: "89 Dinaga, Naga City", emergencyContact: "Grace Gonzales", emergencyPhone: "+63 953 444 6666" },
    { id: "scholar-dc-17", name: "Ethan James Tan", email: "ethan.tan2@unc.edu.ph", role: "scholar", studentId: "2023-05008", phone: "+63 953 555 6666", talentGroup: "dance-club", applicationStatus: "approved", yearLevel: "2nd Year", course: "Bachelor of Physical Education", trainingStatus: "completed", address: "12 Triangulo, Naga City", emergencyContact: "James Tan", emergencyPhone: "+63 953 555 7777" },
    
    // Deactivated Accounts - For testing activation feature
    { 
      id: "deactivated-1", 
      name: "Roberto M. Santos", 
      email: "roberto.santos@unc.edu.ph", 
      role: "student", 
      studentId: "2023-06001", 
      phone: "+63 954 111 2222", 
      talentGroup: "marching-band", 
      applicationStatus: "disapproved", 
      yearLevel: "2nd Year", 
      course: "Bachelor of Arts in Communication", 
      trainingStatus: "not_started", 
      address: "45 Luna St., Naga City", 
      emergencyContact: "Maria Santos", 
      emergencyPhone: "+63 954 111 3333" 
    },
    { 
      id: "deactivated-2", 
      name: "Angela T. Reyes", 
      email: "angela.reyes@unc.edu.ph", 
      role: "student", 
      studentId: "2022-06002", 
      phone: "+63 954 222 3333", 
      talentGroup: "glee-club", 
      applicationStatus: "approved", 
      yearLevel: "3rd Year", 
      course: "Bachelor of Music", 
      trainingStatus: "failed", 
      address: "78 Magsaysay Ave., Naga City", 
      emergencyContact: "Teresa Reyes", 
      emergencyPhone: "+63 954 222 4444" 
    },
    { 
      id: "deactivated-3", 
      name: "Mark J. Cruz", 
      email: "mark.cruz@unc.edu.ph", 
      role: "scholar", 
      studentId: "2023-06003", 
      phone: "+63 954 333 4444", 
      talentGroup: "majorettes", 
      applicationStatus: "disapproved", 
      yearLevel: "2nd Year", 
      course: "Bachelor of Physical Education", 
      trainingStatus: "not_started", 
      address: "23 Del Rosario St., Naga City", 
      emergencyContact: "Juan Cruz", 
      emergencyPhone: "+63 954 333 5555" 
    },
  ]);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: 'eval1',
      traineeId: 'scholar-mb-1',
      traineeName: 'Maria Clara Santos',
      date: new Date('2024-11-10'),
      rating: 92,
      notes: 'Excellent performance throughout the training period.',
      status: 'submitted',
      scholarshipPercentage: 100,
      sectionA: {
        reportsOnTime: 5,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 4,
        noUnnecessaryAbsence: 5,
        mastersyTasks: 5,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 5,
        initiative: 5,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Consistently demonstrates excellent musical skills and leadership qualities. Shows great initiative in helping junior members.',
      improvements: 'Could work on time management during high-pressure performance weeks.',
      recommendForRenewal: true,
      ratedBy: 'Prof. Maria Santos',
      ratedDate: '11/10/2024',
      adjectivalRating: 'Outstanding',
      overallRating: 4.8,
      talentGroup: 'marching-band'
    },
    {
      id: 'eval2',
      traineeId: 'scholar-mb-2',
      traineeName: 'Carlos Reyes',
      date: new Date('2024-11-12'),
      rating: 88,
      notes: 'Very good performance with room for growth.',
      status: 'submitted',
      scholarshipPercentage: 75,
      sectionA: {
        reportsOnTime: 4,
        reportsRegularly: 4,
        practicesOnTime: 5,
        practicesRegularly: 5,
        noUnnecessaryAbsence: 4,
        mastersyTasks: 5,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 4,
        initiative: 4,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 4,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Shows great dedication to the group. Regular attendance and active participation.',
      improvements: 'Work on attendance consistency and continue developing technical skills.',
      recommendForRenewal: true,
      ratedBy: 'Prof. Roberto Gonzales',
      ratedDate: '11/12/2024',
      adjectivalRating: 'Very Good',
      overallRating: 4.5,
      talentGroup: 'marching-band'
    },
    {
      id: 'eval3',
      traineeId: 'scholar-mb-3',
      traineeName: 'Daniel Francisco Gutierrez',
      date: new Date('2024-11-08'),
      rating: 95,
      notes: 'Exemplary performance - a role model for other scholars.',
      status: 'submitted',
      scholarshipPercentage: 100,
      sectionA: {
        reportsOnTime: 5,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 5,
        noUnnecessaryAbsence: 5,
        mastersyTasks: 5,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 5,
        initiative: 5,
        efficiency: 5
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Exemplary performance throughout the year. Shows exceptional skills and serves as a role model.',
      improvements: 'Already performing at an exceptional level. Continue to challenge yourself.',
      recommendForRenewal: true,
      ratedBy: 'Prof. Carmen Torres',
      ratedDate: '11/08/2024',
      adjectivalRating: 'Outstanding',
      overallRating: 5.0,
      talentGroup: 'marching-band'
    },
    {
      id: 'eval4',
      traineeId: 'scholar-mb-4',
      traineeName: 'Katrina Ysabelle Magno',
      date: new Date('2024-11-14'),
      rating: 85,
      notes: 'Good performance with areas for improvement.',
      status: 'submitted',
      scholarshipPercentage: 75,
      sectionA: {
        reportsOnTime: 4,
        reportsRegularly: 4,
        practicesOnTime: 4,
        practicesRegularly: 4,
        noUnnecessaryAbsence: 4,
        mastersyTasks: 4,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 4,
        performanceInterest: 5,
        workEthic: 4,
        initiative: 4,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 4,
        courtesy: 5,
        disposition: 4
      },
      strengths: 'Good technical skills and shows enthusiasm for performances.',
      improvements: 'Needs to work on attendance consistency and time management skills.',
      recommendForRenewal: true,
      ratedBy: 'Prof. Jessica Cruz',
      ratedDate: '11/14/2024',
      adjectivalRating: 'Good',
      overallRating: 4.2,
      talentGroup: 'marching-band'
    },
    // Majorettes Evaluations
    {
      id: 'eval5',
      traineeId: 'scholar-maj-1',
      traineeName: 'Reu Rosa Abueg',
      date: new Date('2024-11-15'),
      rating: 94,
      notes: 'Outstanding performance and leadership.',
      status: 'submitted',
      scholarshipPercentage: 100,
      sectionA: {
        reportsOnTime: 5,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 5,
        noUnnecessaryAbsence: 5,
        mastersyTasks: 5,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 5,
        initiative: 5,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Exceptional baton skills and stage presence. Natural leader who mentors junior members effectively.',
      improvements: 'Continue refining complex choreography sequences during fast-paced routines.',
      recommendForRenewal: true,
      ratedBy: 'Janeth Aquino',
      ratedDate: '11/15/2024',
      adjectivalRating: 'Outstanding',
      overallRating: 4.9,
      talentGroup: 'majorettes'
    },
    {
      id: 'eval6',
      traineeId: 'scholar-maj-2',
      traineeName: 'Niña Krizzle Almedral',
      date: new Date('2024-11-16'),
      rating: 87,
      notes: 'Very good performance with consistent improvement.',
      status: 'submitted',
      scholarshipPercentage: 75,
      sectionA: {
        reportsOnTime: 4,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 4,
        noUnnecessaryAbsence: 4,
        mastersyTasks: 4,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 4,
        initiative: 4,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 4,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Shows great dedication and willingness to learn. Positive attitude during rehearsals.',
      improvements: 'Work on timing precision and building confidence during solo performances.',
      recommendForRenewal: true,
      ratedBy: 'Janeth Aquino',
      ratedDate: '11/16/2024',
      adjectivalRating: 'Very Good',
      overallRating: 4.4,
      talentGroup: 'majorettes'
    },
    // Glee Club Evaluations
    {
      id: 'eval7',
      traineeId: 'scholar-glee-1',
      traineeName: 'Seth Jeziel Baider',
      date: new Date('2024-11-17'),
      rating: 91,
      notes: 'Excellent vocal performance and musicality.',
      status: 'submitted',
      scholarshipPercentage: 100,
      sectionA: {
        reportsOnTime: 5,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 5,
        noUnnecessaryAbsence: 5,
        mastersyTasks: 5,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 5,
        initiative: 5,
        efficiency: 5
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Outstanding tenor voice quality. Demonstrates excellent pitch control and harmonization skills.',
      improvements: 'Continue developing stage presence and confidence during solo parts.',
      recommendForRenewal: true,
      ratedBy: 'Prof. Emmanuel Reyes',
      ratedDate: '11/17/2024',
      adjectivalRating: 'Outstanding',
      overallRating: 4.85,
      talentGroup: 'glee-club'
    },
    {
      id: 'eval8',
      traineeId: 'scholar-glee-2',
      traineeName: 'Mark Aaron Banas',
      date: new Date('2024-11-18'),
      rating: 86,
      notes: 'Good vocal performance with steady improvement.',
      status: 'submitted',
      scholarshipPercentage: 75,
      sectionA: {
        reportsOnTime: 4,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 4,
        noUnnecessaryAbsence: 4,
        mastersyTasks: 4,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 4,
        workEthic: 4,
        initiative: 4,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 4
      },
      strengths: 'Strong bass voice that anchors the group well. Reliable attendance and positive teamwork.',
      improvements: 'Focus on vocal warm-ups and breath control exercises to enhance endurance.',
      recommendForRenewal: true,
      ratedBy: 'Prof. Emmanuel Reyes',
      ratedDate: '11/18/2024',
      adjectivalRating: 'Very Good',
      overallRating: 4.3,
      talentGroup: 'glee-club'
    },
    // Dance Club Evaluations
    {
      id: 'eval9',
      traineeId: 'scholar-dance-1',
      traineeName: 'Irish Josane Agor',
      date: new Date('2024-11-19'),
      rating: 93,
      notes: 'Exceptional dance skills and choreography execution.',
      status: 'submitted',
      scholarshipPercentage: 100,
      sectionA: {
        reportsOnTime: 5,
        reportsRegularly: 5,
        practicesOnTime: 5,
        practicesRegularly: 5,
        noUnnecessaryAbsence: 5,
        mastersyTasks: 5,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 5,
        initiative: 5,
        efficiency: 5
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Incredible flexibility and rhythm. Quickly masters new choreography and helps other members learn routines.',
      improvements: 'Continue building stamina for longer performance sequences.',
      recommendForRenewal: true,
      ratedBy: 'Janeth Aquino',
      ratedDate: '11/19/2024',
      adjectivalRating: 'Outstanding',
      overallRating: 4.87,
      talentGroup: 'dance-club'
    },
    {
      id: 'eval10',
      traineeId: 'scholar-dance-2',
      traineeName: 'Nadia Monica Banaag',
      date: new Date('2024-11-20'),
      rating: 88,
      notes: 'Very good dance technique with creative expression.',
      status: 'submitted',
      scholarshipPercentage: 75,
      sectionA: {
        reportsOnTime: 5,
        reportsRegularly: 4,
        practicesOnTime: 5,
        practicesRegularly: 5,
        noUnnecessaryAbsence: 4,
        mastersyTasks: 4,
        maintainsCleanliness: 5
      },
      sectionB: {
        improvementInterest: 5,
        performanceInterest: 5,
        workEthic: 4,
        initiative: 4,
        efficiency: 4
      },
      sectionC: {
        teamwork: 5,
        tact: 5,
        courtesy: 5,
        disposition: 5
      },
      strengths: 'Great musicality and expressive movement. Shows creativity in interpreting choreography.',
      improvements: 'Work on synchronization with the group during complex formations.',
      recommendForRenewal: true,
      ratedBy: 'Janeth Aquino',
      ratedDate: '11/20/2024',
      adjectivalRating: 'Very Good',
      overallRating: 4.5,
      talentGroup: 'dance-club'
    }
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: "event1",
      title: "University Foundation Day Performance",
      description: "Annual celebration featuring all talent groups performing for the university community and distinguished guests.",
      date: new Date("2024-11-15"),
      time: "7:00 PM",
      location: "UNC Gymnasium",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "performance",
      isRequired: true,
    },
    {
      id: "event2",
      title: "Christmas Concert Rehearsal",
      description: "Full dress rehearsal for the annual Christmas concert. All members must attend.",
      date: new Date("2024-12-10"),
      time: "2:00 PM",
      location: "Music Building Auditorium",
      talentGroups: ["glee-club", "marching-band"],
      type: "rehearsal",
      isRequired: true,
    },
    {
      id: "event3",
      title: "Inter-University Dance Competition",
      description: "Regional competition showcasing contemporary and cultural dance performances.",
      date: new Date("2024-11-25"),
      time: "10:00 AM",
      location: "Naga City Cultural Center",
      talentGroups: ["dance-club"],
      type: "competition",
      isRequired: true,
    },
    {
      id: "event4",
      title: "Vocal Technique Workshop",
      description: "Guest artist Ms. Lea Salonga will conduct a masterclass on vocal techniques, breathing exercises, and performance tips for classical and contemporary singing.",
      date: new Date("2024-11-30"),
      time: "1:00 PM",
      location: "Music Building Room 201",
      talentGroups: ["glee-club"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event5",
      title: "Marching Band Regional Championship",
      description: "Compete against 12 universities in the Bicol Region. Perform our championship routine featuring complex formations and musical arrangements.",
      date: new Date("2024-12-15"),
      time: "9:00 AM",
      location: "Naga City Sports Complex",
      talentGroups: ["marching-band", "majorettes"],
      type: "competition",
      isRequired: true,
    },
    {
      id: "event6",
      title: "Contemporary Dance Workshop",
      description: "Learn contemporary techniques from professional choreographer Mark Bautista. Focus on fluid movements, floor work, and improvisation.",
      date: new Date("2024-12-05"),
      time: "3:00 PM",
      location: "Dance Studio Building B",
      talentGroups: ["dance-club"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event7",
      title: "Holiday Parade Performance",
      description: "Join the annual UNC Christmas parade through the city. Showcase holiday-themed routines and spread joy to the community.",
      date: new Date("2024-12-20"),
      time: "4:00 PM",
      location: "Downtown Naga City",
      talentGroups: ["marching-band", "majorettes", "dance-club"],
      type: "performance",
      isRequired: true,
    },
    {
      id: "event8",
      title: "Team Building & Bonding Activity",
      description: "Strengthen group dynamics through team building games, trust exercises, and fellowship. Lunch and transportation provided.",
      date: new Date("2024-11-18"),
      time: "8:00 AM",
      location: "Camarines Sur Eco-Tourism Complex",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event9",
      title: "Instrument Maintenance Workshop",
      description: "Learn proper care and maintenance for brass, woodwind, and percussion instruments. Hands-on session with professional technicians.",
      date: new Date("2024-11-22"),
      time: "2:00 PM",
      location: "Music Building Workshop Room",
      talentGroups: ["marching-band"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event10",
      title: "Spring Semester Auditions",
      description: "First round of auditions for Spring 2025 applicants. Directors will assess talent and provide feedback to candidates.",
      date: new Date("2025-01-20"),
      time: "10:00 AM",
      location: "UNC Auditorium",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "performance",
      isRequired: false,
    },
    {
      id: "event11",
      title: "Baton Twirling Masterclass",
      description: "Special workshop with National Champion Jennifer Santos. Learn advanced baton techniques, tosses, and choreography. Majorettes only.",
      date: new Date("2024-11-28"),
      time: "1:00 PM",
      location: "UNC Open Field",
      talentGroups: ["majorettes"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event12",
      title: "Community Outreach Concert",
      description: "Perform for the senior citizens at Naga City Home for the Aged. Bring joy through music and dance. Community service hours will be credited.",
      date: new Date("2024-12-08"),
      time: "2:00 PM",
      location: "Naga City Home for the Aged",
      talentGroups: ["glee-club", "dance-club"],
      type: "performance",
      isRequired: false,
    },
    {
      id: "event13",
      title: "Weekly Practice Session - Marching Band",
      description: "Regular practice session focusing on formation drills and musical precision. All members must attend.",
      date: new Date("2024-11-19"),
      time: "3:00 PM",
      location: "UNC Sports Complex Field",
      talentGroups: ["marching-band"],
      type: "rehearsal",
      isRequired: true,
    },
    {
      id: "event14",
      title: "Mid-Year Performance Evaluation",
      description: "Individual and group performance assessments for all talent groups. Results will be used for scholarship renewal considerations.",
      date: new Date("2024-12-18"),
      time: "9:00 AM",
      location: "Music Building Multiple Rooms",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "performance",
      isRequired: true,
    },
    {
      id: "event15",
      title: "Hip-Hop Choreography Workshop",
      description: "Learn latest urban dance trends from guest choreographer. Focus on popping, locking, and freestyle techniques.",
      date: new Date("2024-11-27"),
      time: "4:00 PM",
      location: "Dance Studio Building B",
      talentGroups: ["dance-club"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event16",
      title: "Inter-School Cultural Exchange",
      description: "Host performers from Ateneo de Naga and Sacred Heart College. Collaborative performances and networking opportunity.",
      date: new Date("2024-12-12"),
      time: "10:00 AM",
      location: "UNC Gymnasium",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "performance",
      isRequired: true,
    },
    {
      id: "event17",
      title: "Music Theory Workshop for Band Members",
      description: "Enhance your understanding of scales, chords, and music notation. Improve sight-reading and musical interpretation skills.",
      date: new Date("2024-11-26"),
      time: "3:00 PM",
      location: "Music Building Room 305",
      talentGroups: ["marching-band"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event18",
      title: "New Year's Eve Countdown Performance",
      description: "Ring in 2025 with spectacular performances at the city plaza. Fireworks display and live entertainment for thousands of attendees.",
      date: new Date("2024-12-31"),
      time: "8:00 PM",
      location: "Naga City Plaza",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "performance",
      isRequired: true,
    },
    {
      id: "event19",
      title: "Vocal Health and Wellness Seminar",
      description: "Learn proper vocal care, breathing exercises, and techniques to prevent vocal strain. Session includes Q&A with ENT specialist.",
      date: new Date("2024-12-03"),
      time: "2:00 PM",
      location: "Medical Building Conference Room",
      talentGroups: ["glee-club"],
      type: "workshop",
      isRequired: false,
    },
    {
      id: "event20",
      title: "Scholarship Holders Thanksgiving Dinner",
      description: "Year-end fellowship and awards night for all talent scholars. Dress code: Semi-formal. Dinner and entertainment provided.",
      date: new Date("2024-12-21"),
      time: "6:00 PM",
      location: "UNC Grand Ballroom",
      talentGroups: ["marching-band", "majorettes", "glee-club", "dance-club"],
      type: "workshop",
      isRequired: true,
    },
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "ann1",
      title: "Spring 2025 Scholarship Applications Open",
      content: "We are now accepting applications for the Spring 2025 semester. All talent groups have available slots. Application deadline is January 15, 2025. Please prepare your portfolio and audition materials.",
      author: "Office of Student Affairs",
      publishedAt: new Date("2024-10-20"),
      priority: "high",
      targetAudience: "students",
    },
    {
      id: "ann2",
      title: "New Practice Schedule Effective November 1",
      content: "Due to facility maintenance, all practice sessions will be moved to the temporary rehearsal rooms in Building C. Glee Club: Mon/Wed/Fri 4-6 PM, Marching Band: Tue/Thu/Sat 3-6 PM, Dance Club: Mon/Wed 6-8 PM, Majorettes: Tue/Thu 2-4 PM.",
      author: "Facilities Management",
      publishedAt: new Date("2024-10-25"),
      priority: "medium",
      targetAudience: "scholars",
    },
    {
      id: "ann3",
      title: "Uniform Fitting and Distribution",
      content: "All new scholars are required to attend uniform fitting sessions scheduled for November 5-7. Please bring your student ID and scholarship certificate. Contact your respective directors for specific time slots.",
      author: "Uniform Committee",
      publishedAt: new Date("2024-10-28"),
      priority: "high",
      targetAudience: "scholars",
    },
    {
      id: "ann4",
      title: "Monthly Stipend Disbursement Schedule",
      content: "November stipends will be distributed on November 8, 2024. Please ensure your bank account details are updated in the system. For concerns, visit the Scholarship Office during office hours (Mon-Fri 9AM-5PM).",
      author: "Finance Office",
      publishedAt: new Date("2024-11-01"),
      priority: "high",
      targetAudience: "scholars",
    },
    {
      id: "ann5",
      title: "Equipment Maintenance Reminder",
      content: "All borrowed instruments and equipment must undergo routine maintenance from November 10-12. Please coordinate with your directors for inspection schedules. Failure to comply may result in penalties.",
      author: "Equipment Management",
      publishedAt: new Date("2024-10-22"),
      priority: "medium",
      targetAudience: "scholars",
    },
    {
      id: "ann6",
      title: "Academic Performance Reminder for Scholars",
      content: "All scholars must maintain a minimum GPA of 2.75 to qualify for scholarship renewal. Submit your midterm grades to the Scholarship Office by November 30. Academic support and tutoring services are available.",
      author: "Office of Student Affairs",
      publishedAt: new Date("2024-11-03"),
      priority: "high",
      targetAudience: "scholars",
    },
    {
      id: "ann7",
      title: "Guest Workshop with International Artist",
      content: "We are thrilled to announce a special masterclass with renowned conductor Maestro Ricardo Santos on December 2, 2024. This is a rare opportunity to learn from international talent. Registration opens November 10.",
      author: "Cultural Affairs Office",
      publishedAt: new Date("2024-11-04"),
      priority: "medium",
      targetAudience: "all",
    },
    {
      id: "ann8",
      title: "Audition Results for October Applicants",
      content: "Audition results for October applications will be released by November 12. Successful applicants will receive login credentials via email and can proceed to the training module. Thank you for your patience.",
      author: "Admissions Committee",
      publishedAt: new Date("2024-11-05"),
      priority: "high",
      targetAudience: "students",
    },
    {
      id: "ann9",
      title: "Holiday Break Schedule",
      content: "All talent group activities will be on break from December 22, 2024 to January 5, 2025. Regular practice sessions resume on January 6. Happy holidays to all!",
      author: "Talent Development Office",
      publishedAt: new Date("2024-11-06"),
      priority: "low",
      targetAudience: "all",
    },
    {
      id: "ann10",
      title: "COVID-19 Health and Safety Protocols",
      content: "All scholars must present vaccination cards during group activities. Practice rooms will be sanitized after each session. Wearing masks is optional but encouraged. Report any symptoms immediately to health services.",
      author: "University Health Services",
      publishedAt: new Date("2024-10-18"),
      priority: "medium",
      targetAudience: "all",
    },
    {
      id: "ann11",
      title: "Updated Rehearsal Schedule for December",
      content: "Due to upcoming performances and year-end activities, rehearsal schedules have been adjusted. Marching Band: Daily 3-6 PM (except Sundays), Glee Club: Mon/Wed/Fri 4-7 PM, Dance Club: Tue/Thu/Sat 5-8 PM, Majorettes: Mon-Fri 2-5 PM. Please mark your calendars accordingly.",
      author: "Talent Development Office",
      publishedAt: new Date("2024-11-07"),
      priority: "high",
      targetAudience: "scholars",
    },
    {
      id: "ann12",
      title: "Lost and Found: Musical Instruments",
      content: "Several instruments have been found in practice rooms without proper identification tags. Please check the Music Building Office if you're missing any equipment. All items will be disposed of by November 30 if unclaimed.",
      author: "Equipment Management",
      publishedAt: new Date("2024-11-08"),
      priority: "low",
      targetAudience: "scholars",
    },
    {
      id: "ann13",
      title: "Congratulations to Regional Competition Winners!",
      content: "The UNC Dance Club won 1st Place in the Contemporary Division at the Bicol Regional Dance Competition! The Marching Band also secured 2nd Place overall. Congratulations to all participants for representing UNC with excellence!",
      author: "Office of Student Affairs",
      publishedAt: new Date("2024-11-09"),
      priority: "high",
      targetAudience: "all",
    },
    {
      id: "ann14",
      title: "Reminder: Submit Performance Logs by November 20",
      content: "All scholars must submit their performance and attendance logs for October through the online portal. This is required for scholarship evaluation. Late submissions will not be accepted. Contact your director if you need assistance.",
      author: "Scholarship Office",
      publishedAt: new Date("2024-11-10"),
      priority: "high",
      targetAudience: "scholars",
    },
    {
      id: "ann15",
      title: "New Practice Room Booking System",
      content: "We've launched an online booking system for practice rooms. Scholars can now reserve rooms up to 7 days in advance through the TalentTrackUNC portal. Walk-in bookings are still available but subject to availability. Tutorial videos available on the website.",
      author: "Facilities Management",
      publishedAt: new Date("2024-11-11"),
      priority: "medium",
      targetAudience: "scholars",
    },
  ]);

  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app_test_training",
      userId: "test-training",
      talentGroup: "glee-club",
      personalInfo: {
        name: "Christiana Jean Alvarez",
        email: "training@unc.edu.ph",
        studentId: "2024-00002",
        phone: "+63 912 345 6780",
      },
      experience: "I have been singing in choir for 3 years and love performing. I participated in school musical productions and have basic music theory knowledge.",
      motivation: "I want to develop my vocal skills and be part of the UNC Glee Club tradition. Music is my passion and I am committed to excellence.",
      documents: ["transcript.pdf", "audition_recording.mp3"],
      status: "approved",
      appliedAt: new Date("2024-10-20"),
    },
    {
      id: "app1",
      userId: "student1",
      talentGroup: "marching-band",
      personalInfo: {
        name: "John Paul Ramos",
        email: "john.ramos@student.unc.edu.ph",
        studentId: "2023-00678",
        phone: "+63 922 678 9012",
        birthdate: "2004-09-12",
        age: "20",
        address: "45 Abella Street, Tabuco, Naga City, Camarines Sur",
        gender: "Male",
        socialMedia: "https://facebook.com/johnpaul.ramos",
        yearLevel: "3rd Year",
        course: "Bachelor of Science in Civil Engineering",
        department: "College of Engineering & Architecture",
        guardianName: "Roberto Ramos",
        guardianContactNo: "0922-111-2222",
        hasBandExperience: true,
      },
      experience: "I have been playing trumpet for 5 years. I was part of my high school marching band and participated in regional competitions. I also play in our local church band during Sunday services.",
      motivation: "Music has always been my passion, and I believe joining the UNC Marching Band will help me grow both as a musician and as a leader. I want to represent the university with pride in all performances.",
      documents: ["transcript.pdf", "audition_video.mp4"],
      status: "pending",
      appliedAt: new Date("2024-10-15"),
    },
    {
      id: "app2",
      userId: "student2",
      talentGroup: "glee-club",
      personalInfo: {
        name: "Karina Louise Santos",
        email: "karina.santos@student.unc.edu.ph",
        studentId: "2024-00421",
        phone: "+63 918 234 5678",
        birthdate: "2005-05-20",
        age: "19",
        address: "78 Lerma Street, Concepcion Pequeña, Naga City, Camarines Sur",
        gender: "Female",
        socialMedia: "https://facebook.com/karina.santos",
        yearLevel: "1st Year",
        course: "Bachelor of Elementary Education",
        department: "College of Education",
        guardianName: "Carolina Santos",
        guardianContactNo: "0918-222-3333",
        vocalRange: "Soprano",
        previousSingingExperience: "Church choir for 6 years, won Best Soloist in regional competitions 2023",
        musicalBackground: "Musical theater experience, participated in school productions, voice lessons for 3 years",
      },
      experience: "I've been a soprano in my church choir for 6 years. I participated in regional choir competitions and won Best Soloist in 2023. I also have experience in musical theater.",
      motivation: "Singing is my passion and joining the UNC Glee Club would allow me to develop my skills further while representing the university. I'm committed to excellence and teamwork.",
      documents: ["transcript.pdf", "audition_video.mp4", "awards_certificates.pdf"],
      status: "pending",
      appliedAt: new Date("2024-11-02"),
    },
    {
      id: "app3",
      userId: "student3",
      talentGroup: "dance-club",
      personalInfo: {
        name: "Mikhail Joseph Cruz",
        email: "mikhail.cruz@student.unc.edu.ph",
        studentId: "2024-00534",
        phone: "+63 920 345 6789",
        birthdate: "2005-11-08",
        age: "19",
        address: "156 Panganiban Drive, Naga City, Camarines Sur",
        gender: "Male",
        socialMedia: "https://facebook.com/mikhail.cruz",
        yearLevel: "1st Year",
        course: "Bachelor of Science in Physical Education",
        department: "College of Education",
        guardianName: "Miguel Cruz",
        guardianContactNo: "0920-333-4444",
        primaryDanceGenre: "Contemporary and Hip-hop",
        yearsOfExperience: "4 years",
        performedOnStage: "Yes",
        willingToAttendRehearsals: "Yes",
      },
      experience: "Contemporary and hip-hop dancer for 4 years. Performed in inter-school competitions and won 2nd place at the Bicol Youth Dance Festival. Trained under professional choreographers.",
      motivation: "Dance is my way of expression. The UNC Dance Club has an excellent reputation and I want to contribute my skills while learning from the best mentors.",
      documents: ["transcript.pdf", "performance_videos.mp4"],
      status: "pending",
      appliedAt: new Date("2024-11-03"),
    },
    {
      id: "app4",
      userId: "student4",
      talentGroup: "majorettes",
      personalInfo: {
        name: "Diana Rose Martinez",
        email: "diana.martinez@student.unc.edu.ph",
        studentId: "2024-00612",
        phone: "+63 919 456 7890",
        birthdate: "2005-02-14",
        age: "19",
        address: "234 Magsaysay Avenue, Naga City, Camarines Sur",
        gender: "Female",
        socialMedia: "https://facebook.com/diana.martinez",
        yearLevel: "1st Year",
        course: "Bachelor of Arts in Psychology",
        department: "College of Arts & Sciences",
        guardianName: "Rosa Martinez",
        guardianContactNo: "0919-444-5555",
        previousMajoretteTeam: "Yes",
        previousOrganization: "Naga City High School Majorettes",
        canPerformBasicRoutines: "Yes",
        willingToAttendRehearsalsMajorettes: "Yes",
      },
      experience: "I was a majorette in my high school for 3 years and served as squad leader in my final year. I have experience with flag routines, baton twirling, and synchronized formations.",
      motivation: "I love the precision and artistry of majorette performance. Joining UNC Majorettes would be an honor and I'm eager to contribute to the team's success.",
      documents: ["transcript.pdf", "routine_video.mp4", "recommendation_letter.pdf"],
      status: "approved",
      appliedAt: new Date("2024-10-28"),
    },
    {
      id: "app5",
      userId: "student5",
      talentGroup: "marching-band",
      personalInfo: {
        name: "Ethan Gabriel Reyes",
        email: "ethan.reyes@student.unc.edu.ph",
        studentId: "2024-00789",
        phone: "+63 917 567 8901",
        birthdate: "2006-01-30",
        age: "18",
        address: "89 Peñafrancia Avenue, Naga City, Camarines Sur",
        gender: "Male",
        socialMedia: "https://facebook.com/ethan.reyes",
        yearLevel: "1st Year",
        course: "Bachelor of Science in Computer Engineering",
        department: "College of Engineering & Architecture",
        guardianName: "Gabriel Reyes",
        guardianContactNo: "0917-555-6666",
        hasBandExperience: false,
      },
      experience: "I have minimal formal training but I taught myself to play saxophone. I've been practicing for 2 years and participated in local community band performances.",
      motivation: "Music has always inspired me. Although I'm self-taught, I'm dedicated to improving and willing to put in the work to be part of the UNC Marching Band.",
      documents: ["transcript.pdf"],
      status: "disapproved",
      appliedAt: new Date("2024-10-12"),
    },
    {
      id: "app6",
      userId: "student6",
      talentGroup: "dance-club",
      personalInfo: {
        name: "Sophia Marie Torres",
        email: "sophia.torres@student.unc.edu.ph",
        studentId: "2024-00834",
        phone: "+63 921 678 9012",
        birthdate: "2005-08-17",
        age: "19",
        address: "321 Carolina Street, Naga City, Camarines Sur",
        gender: "Female",
        socialMedia: "https://facebook.com/sophia.torres",
        yearLevel: "1st Year",
        course: "Bachelor of Arts in Political Science",
        department: "College of Arts & Sciences",
        guardianName: "Maria Torres",
        guardianContactNo: "0921-666-7777",
        primaryDanceGenre: "Ballet and Contemporary",
        yearsOfExperience: "7 years",
        performedOnStage: "Yes",
        willingToAttendRehearsals: "Yes",
      },
      experience: "Ballet and contemporary dance training for 7 years at Philippine Ballet Academy. Performed in Swan Lake and Nutcracker productions. Also trained in jazz and modern dance.",
      motivation: "I want to blend classical technique with contemporary creativity. The UNC Dance Club's diverse repertoire aligns perfectly with my artistic vision.",
      documents: ["transcript.pdf", "portfolio.pdf", "performance_reel.mp4"],
      status: "approved",
      appliedAt: new Date("2024-10-25"),
    },
    {
      id: "app7",
      userId: "student7",
      talentGroup: "glee-club",
      personalInfo: {
        name: "Nathan Andrei Fernandez",
        email: "nathan.fernandez@student.unc.edu.ph",
        studentId: "2024-00956",
        phone: "+63 922 789 0123",
        birthdate: "2006-04-25",
        age: "18",
        address: "567 Dinaga, Naga City, Camarines Sur",
        gender: "Male",
        socialMedia: "https://facebook.com/nathan.fernandez",
        yearLevel: "1st Year",
        course: "Bachelor of Secondary Education major in English",
        department: "College of Education",
        guardianName: "Andres Fernandez",
        guardianContactNo: "0922-777-8888",
        vocalRange: "Tenor",
        previousSingingExperience: "School choir for 4 years, regional choral competitions participant",
        musicalBackground: "Can play piano, music reading proficient, participated in inter-school competitions",
      },
      experience: "Tenor voice. Sang in school choir for 4 years. Participated in regional choral competitions. I can also play piano which helps with music reading.",
      motivation: "Choral singing brings me joy and fulfillment. The UNC Glee Club's reputation for excellence makes it the perfect place for me to grow as a vocalist.",
      documents: ["transcript.pdf", "audition_recording.mp3", "choir_certificate.pdf"],
      status: "pending",
      appliedAt: new Date("2024-11-04"),
    },
    {
      id: "app8",
      userId: "student8",
      talentGroup: "majorettes",
      personalInfo: {
        name: "Alexa Faith Mendoza",
        email: "alexa.mendoza@student.unc.edu.ph",
        studentId: "2024-01023",
        phone: "+63 923 890 1234",
        birthdate: "2005-12-10",
        age: "19",
        address: "432 Triangulo, Naga City, Camarines Sur",
        gender: "Female",
        socialMedia: "https://facebook.com/alexa.mendoza",
        yearLevel: "1st Year",
        course: "Bachelor of Science in Hospitality Management",
        department: "College of Business & Accountancy",
        guardianName: "Faith Mendoza",
        guardianContactNo: "0923-888-9999",
        previousMajoretteTeam: "Yes",
        previousOrganization: "Del Rosario High School Color Guard",
        canPerformBasicRoutines: "Yes",
        willingToAttendRehearsalsMajorettes: "Yes",
      },
      experience: "Color guard experience from high school. Skilled in flag work, rifle, and saber routines. Also have dance background which helps with choreography.",
      motivation: "The artistry of combining dance and equipment work excites me. I'm ready to dedicate myself to mastering majorette techniques at UNC.",
      documents: ["transcript.pdf", "performance_highlights.mp4"],
      status: "pending",
      appliedAt: new Date("2024-11-05"),
    },
    {
      id: "app9",
      userId: "student9",
      talentGroup: "marching-band",
      personalInfo: {
        name: "Christopher James Alvarez",
        email: "christopher.alvarez@student.unc.edu.ph",
        studentId: "2024-01156",
        phone: "+63 924 901 2345",
        birthdate: "2005-03-15",
        age: "19",
        address: "234 San Nicolas, Naga City",
        gender: "Male",
        yearLevel: "1st Year",
        course: "Bachelor of Music",
        department: "College of Arts and Sciences",
        guardianName: "Roberto Alvarez",
        guardianContactNo: "+63 924 901 9999",
        musicalBackground: "Trombone player for 6 years. Member of Naga City Youth Orchestra.",
      },
      experience: "I have played trombone in my school marching band for 4 years and was section leader. I also perform with the city youth orchestra and have competed in regional music competitions.",
      motivation: "Being part of the UNC Marching Band would be the culmination of my musical journey. I want to represent my university while continuing to develop my skills under expert mentorship.",
      documents: ["transcript.pdf", "audition_video.mp4", "recommendation_conductor.pdf"],
      status: "pending",
      appliedAt: new Date("2024-11-06"),
    },
    {
      id: "app10",
      userId: "student10",
      talentGroup: "glee-club",
      personalInfo: {
        name: "Beatrice Anne Villanueva",
        email: "beatrice.villanueva@student.unc.edu.ph",
        studentId: "2024-01267",
        phone: "+63 925 012 3456",
        birthdate: "2006-07-22",
        age: "18",
        address: "567 Concepcion Pequeña, Naga City",
        gender: "Female",
        yearLevel: "1st Year",
        course: "Bachelor of Arts in Literature",
        department: "College of Arts and Sciences",
        guardianName: "Maria Villanueva",
        guardianContactNo: "+63 925 012 8888",
        vocalRange: "Soprano",
        previousSingingExperience: "8 years in church choir, 4 years school glee club, won 3 regional singing competitions",
      },
      experience: "I have been singing since I was 10 years old. Started in church choir, joined school glee club where I served as president, and competed in multiple singing contests winning Best Vocalist awards.",
      motivation: "Singing is my life's passion. The UNC Glee Club's rich tradition and excellent reputation make it my dream to be part of this prestigious group and contribute my voice to its legacy.",
      documents: ["transcript.pdf", "audition_recording.mp3", "awards_certificates.pdf", "recommendation_choir_director.pdf"],
      status: "approved",
      appliedAt: new Date("2024-10-30"),
    },
    {
      id: "app11",
      userId: "student11",
      talentGroup: "dance-club",
      personalInfo: {
        name: "Vincent Michael Ong",
        email: "vincent.ong@student.unc.edu.ph",
        studentId: "2024-01378",
        phone: "+63 926 123 4567",
        birthdate: "2005-11-08",
        age: "19",
        address: "890 Triangulo, Naga City",
        gender: "Male",
        yearLevel: "1st Year",
        course: "Bachelor of Physical Education",
        department: "College of Education",
        guardianName: "Lisa Ong",
        guardianContactNo: "+63 926 123 7777",
        primaryDanceGenre: "Hip-hop and Contemporary",
        yearsOfExperience: "5 years",
        performedOnStage: "Yes, multiple inter-school competitions and community events",
      },
      experience: "I've been dancing for 5 years, specializing in hip-hop and contemporary styles. I was part of my high school dance crew and won 1st place in the provincial dance competition. I also teach beginner classes at our local community center.",
      motivation: "Dance is how I express myself and connect with others. Joining the UNC Dance Club would allow me to grow artistically, learn from experienced dancers, and represent the university in competitions.",
      documents: ["transcript.pdf", "performance_videos.mp4", "competition_certificates.pdf"],
      status: "approved",
      appliedAt: new Date("2024-10-27"),
    },
    {
      id: "app12",
      userId: "student12",
      talentGroup: "majorettes",
      personalInfo: {
        name: "Hannah Grace Pascual",
        email: "hannah.pascual@student.unc.edu.ph",
        studentId: "2024-01489",
        phone: "+63 927 234 5678",
        birthdate: "2006-01-30",
        age: "18",
        address: "123 Peñafrancia Avenue, Naga City",
        gender: "Female",
        yearLevel: "1st Year",
        course: "Bachelor of Science in Tourism",
        department: "College of Business Administration",
        guardianName: "David Pascual",
        guardianContactNo: "+63 927 234 6666",
        previousMajoretteTeam: "Yes, St. Agnes High School Majorettes for 3 years",
        canPerformBasicRoutines: "Yes, proficient in flag and baton",
        willingToAttendRehearsalsMajorettes: "Yes, fully committed",
      },
      experience: "I was a majorette for 3 years in high school where I learned flag work, baton twirling, and precision marching. I performed at numerous school events and competitions.",
      motivation: "Being a majorette combines my love for dance and precision performance. I want to be part of the UNC Majorettes tradition and help create spectacular performances that inspire audiences.",
      documents: ["transcript.pdf", "routine_video.mp4", "recommendation_coach.pdf"],
      status: "pending",
      appliedAt: new Date("2024-11-07"),
    },
    {
      id: "app13",
      userId: "student13",
      talentGroup: "marching-band",
      personalInfo: {
        name: "Marcus Antonio Del Rosario",
        email: "marcus.delrosario@student.unc.edu.ph",
        studentId: "2024-01590",
        phone: "+63 928 345 6789",
        birthdate: "2005-09-12",
        age: "19",
        address: "456 San Francisco, Naga City",
        gender: "Male",
        yearLevel: "1st Year",
        course: "Bachelor of Science in Engineering",
        department: "College of Engineering",
        guardianName: "Angela Del Rosario",
        guardianContactNo: "+63 928 345 5555",
        musicalBackground: "Self-taught drummer, played in local band for 2 years",
      },
      experience: "I'm a self-taught drummer with 2 years of experience playing in a local rock band. I'm passionate about percussion and eager to learn formal marching band techniques.",
      motivation: "I want to expand my drumming skills and be part of something bigger than myself. The discipline and camaraderie of marching band appeals to me greatly.",
      documents: ["transcript.pdf", "audition_video.mp4"],
      status: "disapproved",
      appliedAt: new Date("2024-10-18"),
    },
    {
      id: "app14",
      userId: "student14",
      talentGroup: "glee-club",
      personalInfo: {
        name: "Clarissa Joy Mercado",
        email: "clarissa.mercado@student.unc.edu.ph",
        studentId: "2024-01601",
        phone: "+63 929 456 7890",
        birthdate: "2006-04-25",
        age: "18",
        address: "789 Carolina, Naga City",
        gender: "Female",
        yearLevel: "1st Year",
        course: "Bachelor of Music Education",
        department: "College of Education",
        guardianName: "Fernando Mercado",
        guardianContactNo: "+63 929 456 4444",
        vocalRange: "Alto",
        previousSingingExperience: "School choir for 5 years, participated in choral festivals",
      },
      experience: "Alto voice with 5 years of choral experience. I participated in regional choral festivals and consistently received high marks. I have strong music reading skills and can harmonize well.",
      motivation: "Choral music is my passion and the UNC Glee Club represents the highest standard. I want to challenge myself and grow as a musician while contributing to the group's excellence.",
      documents: ["transcript.pdf", "audition_recording.mp3", "festival_certificates.pdf"],
      status: "pending",
      appliedAt: new Date("2024-11-08"),
    },
    {
      id: "app15",
      userId: "student15",
      talentGroup: "dance-club",
      personalInfo: {
        name: "Jasmine Nicole Reyes",
        email: "jasmine.reyes@student.unc.edu.ph",
        studentId: "2024-01712",
        phone: "+63 930 567 8901",
        birthdate: "2006-06-18",
        age: "18",
        address: "234 Lerma, Naga City",
        gender: "Female",
        yearLevel: "1st Year",
        course: "Bachelor of Arts in Dance",
        department: "College of Arts and Sciences",
        guardianName: "Patricia Reyes",
        guardianContactNo: "+63 930 567 3333",
        primaryDanceGenre: "Ballet and Contemporary",
        yearsOfExperience: "10 years",
        performedOnStage: "Yes, lead roles in ballet productions and contemporary showcases",
      },
      experience: "I have 10 years of formal dance training with focus on ballet and contemporary. I've performed lead roles in productions like Sleeping Beauty and have won multiple dance competitions. Currently pursuing a degree in Dance.",
      motivation: "As a dance major, joining the UNC Dance Club is essential to my growth. I want to collaborate with fellow dancers, learn diverse styles, and represent UNC in competitions.",
      documents: ["transcript.pdf", "performance_reel.mp4", "competition_awards.pdf", "recommendation_professor.pdf"],
      status: "approved",
      appliedAt: new Date("2024-10-29"),
    },
    {
      id: "app16",
      userId: "student16",
      talentGroup: "majorettes",
      personalInfo: {
        name: "Stephanie Rose Lim",
        email: "stephanie.lim@student.unc.edu.ph",
        studentId: "2024-01823",
        phone: "+63 931 678 9012",
        birthdate: "2006-02-14",
        age: "18",
        address: "567 Dayangdang, Naga City",
        gender: "Female",
        yearLevel: "1st Year",
        course: "Bachelor of Science in Nursing",
        department: "College of Nursing",
        guardianName: "Michael Lim",
        guardianContactNo: "+63 931 678 2222",
        previousMajoretteTeam: "No, but have dance and gymnastics background",
        canPerformBasicRoutines: "Can perform basic dance routines, willing to learn majorette techniques",
        willingToAttendRehearsalsMajorettes: "Yes, fully committed",
      },
      experience: "While I don't have majorette experience, I have 4 years of gymnastics and 3 years of dance training. I have excellent coordination, flexibility, and stage presence.",
      motivation: "I'm drawn to the precision and elegance of majorette performance. My gymnastics and dance background gives me a strong foundation, and I'm eager to learn and excel in this new challenge.",
      documents: ["transcript.pdf", "gymnastics_certificates.pdf", "dance_videos.mp4"],
      status: "pending",
      appliedAt: new Date("2024-11-09"),
    },
  ]);

  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([
    {
      id: "train-test",
      userId: "test-scholar",
      talentGroup: "marching-band",
      practices: [
        {
          date: new Date("2024-09-01"),
          attended: true,
          duration: 150,
          activities: ["Basic marching drills", "Instrument positioning", "Formation practice"],
          techniques: ["Marching posture", "Horn angles"],
          chaptersCompleted: 2,
          totalChapters: 10,
          performanceNotes: "Excellent foundation. Shows great potential.",
        },
        {
          date: new Date("2024-09-08"),
          attended: true,
          duration: 150,
          activities: ["Complex formations", "Music memorization", "Tempo control"],
          techniques: ["Formation transitions", "Music memory"],
          chaptersCompleted: 5,
          totalChapters: 10,
          performanceNotes: "Outstanding progress. Natural leadership abilities.",
        },
        {
          date: new Date("2024-09-15"),
          attended: true,
          duration: 150,
          activities: ["Final assessment", "Complete evaluation", "Graduation performance"],
          techniques: ["All techniques mastered"],
          chaptersCompleted: 10,
          totalChapters: 10,
          performanceNotes: "Perfect final assessment. Qualified for full membership.",
        },
      ],
      overallProgress: 100,
      evaluation: "qualified",
    },
    {
      id: "train_test_training",
      userId: "test-training",
      talentGroup: "glee-club",
      practices: [
        {
          date: new Date("2024-11-01"),
          attended: true,
          duration: 120,
          activities: ["Breathing exercises", "Scale practice", "Basic harmony"],
          techniques: ["Diaphragmatic breathing", "Pitch accuracy"],
          chaptersCompleted: 1,
          totalChapters: 8,
          performanceNotes: "Good start! Natural vocal tone. Keep practicing breathing exercises.",
        },
        {
          date: new Date("2024-11-04"),
          attended: true,
          duration: 120,
          activities: ["Warm-up vocals", "Harmony practice", "Hymn rehearsal"],
          techniques: ["Harmony blending", "Voice projection"],
          chaptersCompleted: 2,
          totalChapters: 8,
          performanceNotes: "Excellent progress on harmony. Voice projection improving nicely.",
        },
        {
          date: new Date("2024-11-06"),
          attended: true,
          duration: 120,
          activities: ["Advanced breathing", "Solo practice", "Performance techniques"],
          techniques: ["Advanced breathing", "Solo performance"],
          chaptersCompleted: 3,
          totalChapters: 8,
          performanceNotes: "Strong performance in solo practice. Continue building confidence.",
        },
      ],
      overallProgress: 37,
      evaluation: "pending",
    },
    {
      id: "train-mb-1",
      userId: "training-mb-1",
      talentGroup: "marching-band",
      practices: [
        {
          date: new Date("2024-10-28"),
          attended: true,
          duration: 180,
          activities: ["Basic marching fundamentals", "Instrument assembly", "Posture training"],
          techniques: ["Heel-toe marching", "Horn carriage"],
          chaptersCompleted: 1,
          totalChapters: 30,
          performanceNotes: "Excellent first session. Shows good coordination and eagerness to learn.",
        },
        {
          date: new Date("2024-10-30"),
          attended: true,
          duration: 180,
          activities: ["Formation basics", "Simple drill patterns", "Musical scales"],
          techniques: ["8-to-5 step", "Mark time"],
          chaptersCompleted: 2,
          totalChapters: 30,
          performanceNotes: "Good progress. Keep practicing the 8-to-5 step at home.",
        },
        {
          date: new Date("2024-11-01"),
          attended: true,
          duration: 180,
          activities: ["Complex formations", "Musical phrasing", "Tempo exercises"],
          techniques: ["Column left/right", "Musical breathing"],
          chaptersCompleted: 3,
          totalChapters: 30,
          performanceNotes: "Improved marching technique. Work on breath support.",
        },
        {
          date: new Date("2024-11-04"),
          attended: false,
          duration: 0,
          activities: [],
          techniques: [],
          chaptersCompleted: 3,
          totalChapters: 30,
          performanceNotes: "Absent - excused for medical reasons.",
        },
        {
          date: new Date("2024-11-06"),
          attended: true,
          duration: 180,
          activities: ["Review formations", "Full band integration", "Show music practice"],
          techniques: ["Formation transitions", "Music memorization"],
          chaptersCompleted: 4,
          totalChapters: 30,
          performanceNotes: "Catching up well after absence. Strong musical skills.",
        },
      ],
      overallProgress: 13,
      evaluation: "pending",
    },
    {
      id: "train-maj-1",
      userId: "training-maj-1",
      talentGroup: "majorettes",
      practices: [
        {
          date: new Date("2024-10-29"),
          attended: true,
          duration: 150,
          activities: ["Basic baton handling", "Flag work fundamentals", "Posture and poise"],
          techniques: ["Wrist rolls", "Flag tosses"],
          chaptersCompleted: 1,
          totalChapters: 25,
          performanceNotes: "Natural grace and excellent coordination. Very promising start!",
        },
        {
          date: new Date("2024-10-31"),
          attended: true,
          duration: 150,
          activities: ["Baton spins", "Synchronized movements", "Formation basics"],
          techniques: ["Vertical spins", "Group synchronization"],
          chaptersCompleted: 2,
          totalChapters: 25,
          performanceNotes: "Outstanding synchronization skills. Keep practicing baton control.",
        },
        {
          date: new Date("2024-11-02"),
          attended: true,
          duration: 150,
          activities: ["Complex tosses", "Dance integration", "Precision drills"],
          techniques: ["Multiple rotations", "Dance-baton transitions"],
          chaptersCompleted: 3,
          totalChapters: 25,
          performanceNotes: "Mastering techniques quickly. Excellent rhythm and timing.",
        },
        {
          date: new Date("2024-11-05"),
          attended: true,
          duration: 150,
          activities: ["Routine learning", "Partner work", "Performance practice"],
          techniques: ["Group formations", "Partner tosses"],
          chaptersCompleted: 4,
          totalChapters: 25,
          performanceNotes: "Great teamwork. Ready to move to intermediate level soon.",
        },
      ],
      overallProgress: 16,
      evaluation: "pending",
    },
    {
      id: "train-dance-1",
      userId: "training-dance-1",
      talentGroup: "dance-club",
      practices: [
        {
          date: new Date("2024-10-27"),
          attended: true,
          duration: 120,
          activities: ["Warm-up stretching", "Basic hip-hop moves", "Rhythm exercises"],
          techniques: ["Isolation", "Groove fundamentals"],
          chaptersCompleted: 1,
          totalChapters: 20,
          performanceNotes: "Good energy and enthusiasm. Work on flexibility.",
        },
        {
          date: new Date("2024-10-30"),
          attended: true,
          duration: 120,
          activities: ["Contemporary techniques", "Floor work", "Expression exercises"],
          techniques: ["Contractions", "Floor transitions"],
          chaptersCompleted: 2,
          totalChapters: 20,
          performanceNotes: "Showing strong technical foundation. Excellent body control.",
        },
        {
          date: new Date("2024-11-01"),
          attended: true,
          duration: 120,
          activities: ["Choreography learning", "Partner work", "Musicality training"],
          techniques: ["Partnering basics", "Musical interpretation"],
          chaptersCompleted: 3,
          totalChapters: 20,
          performanceNotes: "Great progress. Musicality is developing nicely.",
        },
        {
          date: new Date("2024-11-04"),
          attended: true,
          duration: 120,
          activities: ["Advanced combinations", "Performance skills", "Improvisation"],
          techniques: ["Complex sequences", "Stage presence"],
          chaptersCompleted: 4,
          totalChapters: 20,
          performanceNotes: "Outstanding improvisation skills. Keep building confidence.",
        },
        {
          date: new Date("2024-11-06"),
          attended: true,
          duration: 120,
          activities: ["Full routine practice", "Formation work", "Expression refinement"],
          techniques: ["Group choreography", "Emotional expression"],
          chaptersCompleted: 5,
          totalChapters: 20,
          performanceNotes: "Excellent progress. Strong candidate for advanced level.",
        },
      ],
      overallProgress: 25,
      evaluation: "pending",
    },
    {
      id: "train-glee-1",
      userId: "training-glee-1",
      talentGroup: "glee-club",
      practices: [
        {
          date: new Date("2024-10-28"),
          attended: true,
          duration: 120,
          activities: ["Vocal warm-ups", "Breathing basics", "Pitch training"],
          techniques: ["Diaphragmatic breathing", "Pitch matching"],
          chaptersCompleted: 1,
          totalChapters: 18,
          performanceNotes: "Beautiful natural tone. Excellent pitch accuracy.",
        },
        {
          date: new Date("2024-10-30"),
          attended: true,
          duration: 120,
          activities: ["Harmony introduction", "Voice blending", "Diction exercises"],
          techniques: ["Two-part harmony", "Vowel shaping"],
          chaptersCompleted: 2,
          totalChapters: 18,
          performanceNotes: "Quick learner. Harmony skills developing well.",
        },
        {
          date: new Date("2024-11-01"),
          attended: true,
          duration: 120,
          activities: ["Sight-reading practice", "Advanced breathing", "Performance technique"],
          techniques: ["Music reading", "Breath control"],
          chaptersCompleted: 3,
          totalChapters: 18,
          performanceNotes: "Strong sight-reading ability. Work on sustained notes.",
        },
        {
          date: new Date("2024-11-04"),
          attended: true,
          duration: 120,
          activities: ["Full choral practice", "Solo work", "Expression training"],
          techniques: ["Choral blend", "Solo confidence"],
          chaptersCompleted: 4,
          totalChapters: 18,
          performanceNotes: "Exceptional soloist potential. Beautiful tone quality.",
        },
        {
          date: new Date("2024-11-06"),
          attended: true,
          duration: 120,
          activities: ["Advanced repertoire", "Performance preparation", "Stage presence"],
          techniques: ["Complex harmonies", "Performance skills"],
          chaptersCompleted: 5,
          totalChapters: 18,
          performanceNotes: "Outstanding progress. Ready for more challenging material.",
        },
      ],
      overallProgress: 28,
      evaluation: "pending",
    },
    {
      id: "train-mb-2",
      userId: "training-mb-2",
      talentGroup: "marching-band",
      practices: [
        {
          date: new Date("2024-10-29"),
          attended: true,
          duration: 180,
          activities: ["Marching basics", "Instrument fundamentals", "Rhythm training"],
          techniques: ["Marching stride", "Embouchure formation"],
          chaptersCompleted: 1,
          totalChapters: 30,
          performanceNotes: "Good potential. Needs work on embouchure.",
        },
        {
          date: new Date("2024-10-31"),
          attended: true,
          duration: 180,
          activities: ["Formation drills", "Musical scales", "Tone production"],
          techniques: ["Dress and cover", "Tone quality"],
          chaptersCompleted: 2,
          totalChapters: 30,
          performanceNotes: "Improved tone quality. Keep practicing daily.",
        },
        {
          date: new Date("2024-11-02"),
          attended: false,
          duration: 0,
          activities: [],
          techniques: [],
          chaptersCompleted: 2,
          totalChapters: 30,
          performanceNotes: "Absent - unexcused. Reminder sent about attendance policy.",
        },
        {
          date: new Date("2024-11-05"),
          attended: true,
          duration: 180,
          activities: ["Catch-up drills", "Musical fundamentals", "Show music introduction"],
          techniques: ["March and play", "Musical phrasing"],
          chaptersCompleted: 3,
          totalChapters: 30,
          performanceNotes: "Working hard to catch up. Needs to maintain consistent attendance.",
        },
      ],
      overallProgress: 10,
      evaluation: "pending",
    },
    {
      id: "train-maj-2",
      userId: "training-maj-2",
      talentGroup: "majorettes",
      practices: [
        {
          date: new Date("2024-10-30"),
          attended: true,
          duration: 150,
          activities: ["Baton basics", "Dance fundamentals", "Grace and poise"],
          techniques: ["Basic spins", "Dance posture"],
          chaptersCompleted: 1,
          totalChapters: 25,
          performanceNotes: "Good foundation. Work on flexibility and balance.",
        },
        {
          date: new Date("2024-11-01"),
          attended: true,
          duration: 150,
          activities: ["Flag technique", "Group synchronization", "Performance skills"],
          techniques: ["Flag waves", "Timing precision"],
          chaptersCompleted: 2,
          totalChapters: 25,
          performanceNotes: "Excellent timing. Keep practicing flag control.",
        },
        {
          date: new Date("2024-11-03"),
          attended: true,
          duration: 150,
          activities: ["Baton tosses", "Formation work", "Routine learning"],
          techniques: ["Toss and catch", "Formation transitions"],
          chaptersCompleted: 3,
          totalChapters: 25,
          performanceNotes: "Great progress on tosses. Very dedicated student.",
        },
        {
          date: new Date("2024-11-06"),
          attended: true,
          duration: 150,
          activities: ["Advanced techniques", "Full routine practice", "Team performance"],
          techniques: ["Complex tosses", "Group cohesion"],
          chaptersCompleted: 4,
          totalChapters: 25,
          performanceNotes: "Performing at advanced level. Excellent team player.",
        },
      ],
      overallProgress: 16,
      evaluation: "pending",
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif1",
      userId: "test-training",
      title: "Welcome to Training!",
      message: "Your training journey begins. Check your schedule and complete all sessions.",
      type: "general",
      read: false,
      createdAt: new Date("2024-11-01"),
    },
    {
      id: "notif2",
      userId: "test-scholar",
      title: "Scholarship Renewed",
      message: "Your scholarship for Spring 2025 has been approved. Benefits are active.",
      type: "acceptance",
      read: false,
      createdAt: new Date("2024-10-28"),
    },
  ]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: "inv1",
      userId: "test-scholar",
      itemName: "Marching Band Uniform",
      name: "Marching Band Uniform",
      type: "uniform",
      condition: "excellent",
      assignedDate: new Date("2024-09-01"),
      status: "assigned",
    },
    {
      id: "inv2",
      userId: "test-scholar",
      itemName: "Trumpet",
      name: "Trumpet",
      type: "instrument",
      condition: "good",
      assignedDate: new Date("2024-09-01"),
      status: "assigned",
    },
    {
      id: "inv3",
      userId: "test-scholar",
      itemName: "White Gloves",
      name: "White Gloves",
      type: "accessory",
      condition: "excellent",
      assignedDate: new Date("2024-09-01"),
      status: "assigned",
    },
  ]);

  const [benefits] = useState<Benefit[]>([
    {
      id: "benefit1",
      name: "Full Scholarship Grant",
      type: "stipend",
      amount: 50000,
      description: "Full tuition coverage for the entire semester",
      frequency: "semester",
      status: "active",
    },
    {
      id: "benefit2",
      name: "Monthly Allowance",
      type: "allowance",
      amount: 3000,
      description: "Monthly stipend for transportation and meals",
      frequency: "monthly",
      status: "active",
    },
    {
      id: "benefit3",
      name: "Library Access",
      type: "privilege",
      description: "24/7 access to university library and study rooms",
      frequency: "semester",
      status: "active",
    },
    {
      id: "benefit4",
      name: "Cafeteria Discount",
      type: "discount",
      amount: 20,
      description: "20% discount on all cafeteria purchases",
      frequency: "semester",
      status: "active",
    },
  ]);

  const [renewals, setRenewals] = useState<ScholarshipRenewal[]>([
    {
      id: "renewal1",
      userId: "test-scholar",
      semester: "Spring",
      year: 2025,
      gpa: 3.8,
      documents: ["transcript_2024.pdf", "attendance_record.pdf"],
      status: "approved",
      submittedAt: new Date("2024-10-15"),
      reviewedAt: new Date("2024-10-20"),
      reviewNotes: "Excellent academic performance. Approved for renewal.",
    },
    // Marching Band Renewals
    {
      id: "renewal2",
      userId: "scholar-mb-1",
      semester: "2nd",
      yearLevel: "2nd Year",
      year: "2nd Year",
      gpa: 3.75,
      documents: ["grades_maria_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-08"),
      reviewedAt: new Date("2024-11-10"),
      reviewNotes: "Outstanding performance evaluation and excellent grades. Scholarship renewed at 100%.",
    },
    {
      id: "renewal3",
      userId: "scholar-mb-2",
      semester: "2nd",
      yearLevel: "3rd Year",
      year: "3rd Year",
      gpa: 3.45,
      documents: ["grades_carlos_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-10"),
      reviewedAt: new Date("2024-11-12"),
      reviewNotes: "Good academic standing. Performance evaluation shows dedication. Scholarship renewed at 75%.",
    },
    // Majorettes Renewals
    {
      id: "renewal4",
      userId: "scholar-maj-1",
      semester: "2nd",
      yearLevel: "2nd Year",
      year: "2nd Year",
      gpa: 3.85,
      documents: ["grades_reu_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-13"),
      reviewedAt: new Date("2024-11-15"),
      reviewNotes: "Exceptional leadership and performance. Outstanding grades. Full scholarship renewal approved.",
    },
    {
      id: "renewal5",
      userId: "scholar-maj-2",
      semester: "2nd",
      yearLevel: "3rd Year",
      year: "3rd Year",
      gpa: 3.50,
      documents: ["grades_nina_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-14"),
      reviewedAt: new Date("2024-11-16"),
      reviewNotes: "Consistent improvement noted. Good academic performance. Scholarship renewed at 75%.",
    },
    // Glee Club Renewals
    {
      id: "renewal6",
      userId: "scholar-glee-1",
      semester: "2nd",
      yearLevel: "2nd Year",
      year: "2nd Year",
      gpa: 3.80,
      documents: ["grades_seth_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-15"),
      reviewedAt: new Date("2024-11-17"),
      reviewNotes: "Excellent vocal performance and strong academics. Full scholarship renewal granted.",
    },
    {
      id: "renewal7",
      userId: "scholar-glee-2",
      semester: "2nd",
      yearLevel: "3rd Year",
      year: "3rd Year",
      gpa: 3.40,
      documents: ["grades_mark_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-16"),
      reviewedAt: new Date("2024-11-18"),
      reviewNotes: "Solid performance in both academics and Glee Club activities. Scholarship renewed at 75%.",
    },
    // Dance Club Renewals
    {
      id: "renewal8",
      userId: "scholar-dance-1",
      semester: "2nd",
      yearLevel: "2nd Year",
      year: "2nd Year",
      gpa: 3.78,
      documents: ["grades_irish_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-17"),
      reviewedAt: new Date("2024-11-19"),
      reviewNotes: "Exceptional dance skills and excellent academic record. Full scholarship renewal approved.",
    },
    {
      id: "renewal9",
      userId: "scholar-dance-2",
      semester: "2nd",
      yearLevel: "3rd Year",
      year: "3rd Year",
      gpa: 3.55,
      documents: ["grades_nadia_2024.pdf"],
      status: "approved",
      submittedAt: new Date("2024-11-18"),
      reviewedAt: new Date("2024-11-20"),
      reviewNotes: "Strong creativity and good academic performance. Scholarship renewed at 75%.",
    },
  ]);

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

  const handleLogin = (email: string, password: string, selectedRole: string) => {
    const user = users.find((u) => u.email === email);
    
    if (user) {
      // Check if the selected role matches the user's actual role
      // Map "trainee" to "student" for role matching since trainees are students in training
      const normalizedSelectedRole = selectedRole === 'trainee' ? 'student' : selectedRole;
      
      if (user.role !== normalizedSelectedRole) {
        toast.error('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }
      
      // If trainee is selected, verify user is actually in training
      if (selectedRole === 'trainee' && user.trainingStatus !== 'in_progress') {
        toast.error('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }
      
      setCurrentUser(user);
      startTransition(() => {
        setCurrentPage("dashboard");
        if (user.role === "student") {
          if (user.trainingStatus === "in_progress") {
            setCurrentView("training");
          } else {
            setCurrentView("student");
          }
        } else if (user.role === "scholar") {
          setCurrentView("member-profile");
        }
      });
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    }
    
    toast.error("Invalid email or password");
    return { success: false, error: "Invalid email or password" };
  };

  const handleLogout = () => {
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