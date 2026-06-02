// Section A evaluation metrics (removed item 3)
export interface SectionA {
  reportsOnTime: number;
  reportsRegularly: number;
  practicesOnTime: number;
  practicesRegularly: number;
  noUnnecessaryAbsence: number;
  mastersyTasks: number;
  maintainsCleanliness: number;
}

// Section B evaluation metrics
export interface SectionB {
  improvementInterest?: number;
  performanceInterest?: number;
  workEthic?: number;
  initiative?: number;
  efficiency?: number;
}

// Section C evaluation metrics
export interface SectionC {
  teamwork: number;
  tact: number;
  courtesy: number;
  disposition: number;
}

// Chapter evaluation for sequential progression
export interface ChapterEvaluation {
  chapterNumber: number;
  chapterName: string;
  evaluationId?: string;
  status: 'locked' | 'unlocked' | 'completed' | 'passed' | 'failed';
  evaluationScore?: number;
  completedDate?: Date;
  lessons: string[];
  methods: string[];
}

// Main evaluation interface
export interface Evaluation {
  id: string;
  traineeId: string;
  traineeName: string;
  date: Date;
  rating: number;
  notes: string;
<<<<<<< HEAD
  status: 'draft' | 'submitted' | 'confirmed' | 'finalized';
  // Auto-assigned fields (no manual entry)
=======
  status: 'draft' | 'submitted';
  performanceMetrics?: {
    skillDemonstration: number;
    rehearsalAttendance: number;
    eventParticipation: number;
    teamwork: number;
    leadership: number;
  };
>>>>>>> origin/feature/operations-user-profile
  scholarshipPercentage?: number;
  talentUnit?: string;
  ratingPeriod?: string;
  scholarName?: string;
  // Evaluation sections
  sectionA?: SectionA;
  sectionB?: SectionB;
  sectionC?: SectionC;
  // Assessment fields
  strengths?: string;
  improvements?: string;
  recommendForRenewal?: boolean;
  ratedBy?: string;
  ratedDate?: string;
  adjectivalRating?: string;
  overallRating?: string;
  talentGroup?: string;
  // Chapter and evaluation type tracking
  evaluationType?: 'chapter' | 'final' | 'gateway';
  chapterNumber?: number;
  isFinalEvaluation?: boolean;
  confirmationDismissed?: boolean;
  discussionDate?: string;
  scholarSignatureDate?: string;
}

// Micro-target/goal for trainees
export interface MicroTarget {
  id: string;
  traineeId: string;
  createdBy: string;
  goalText: string;
  timeframe: 'daily' | 'weekly';
  targetDate: Date;
  createdDate: Date;
  status: 'active' | 'completed' | 'missed';
  completedDate?: Date;
}

// Attendance record with date tagging
export interface AttendanceRecord {
  date: Date;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}
