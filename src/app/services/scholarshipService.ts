/**
 * scholarshipService.ts
 * Covers /api/v1/scholarship/*
 */

import { api } from './api';

export interface Benefit {
  id: string;
  name: string;
  type: 'stipend' | 'allowance' | 'privilege' | 'discount';
  amount?: number | null;
  description: string;
  frequency: 'monthly' | 'semester' | 'annual' | 'one-time';
  status: 'active' | 'pending' | 'expired';
}

export interface ScholarshipRenewal {
  id: number;
  user_id: number;
  semester: string;
  year: number;
  gpa: number;
  documents: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export interface SubmitRenewalPayload {
  semester: string;
  year: number;
  gpa: number;
  documents?: string[];
}

const scholarshipService = {
  getBenefits: () =>
    api.get<{ data: Benefit[] }>('scholarship/benefits').then(r => r.data.data),

  getRenewals: () =>
    api.get<{ data: ScholarshipRenewal[] }>('scholarship/renewals').then(r => r.data.data),

  submitRenewal: (payload: SubmitRenewalPayload) =>
    api.post<{ data: ScholarshipRenewal }>('scholarship/renewals', payload).then(r => r.data.data),
};

export default scholarshipService;
