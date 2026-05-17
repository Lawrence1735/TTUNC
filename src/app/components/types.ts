export interface Evaluation {
  id: string;
  traineeId: string;
  traineeName: string;
  date: Date;
  rating: number;
  notes: string;
  status: 'draft' | 'submitted';
  scholarshipPercentage?: number;
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
  strengths?: string;
  improvements?: string;
  recommendForRenewal?: boolean;
  ratedBy?: string;
  ratedDate?: string;
  adjectivalRating?: string;
  overallRating?: string;
  talentGroup?: string;
}
