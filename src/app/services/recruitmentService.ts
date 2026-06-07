/**
 * recruitmentService.ts
 * Covers all /api/v1/recruitment/* and the public POST /api/v1/applications endpoint.
 */

import { api } from './api';

// ── Types (mirror ApplicationResource / InterviewResource) ────────────────────
export interface ApplicationPersonalInfo {
  name: string;
  email: string;
  student_id: string;
  phone: string;
  birthdate?: string;
  age?: string;
  address?: string;
  gender?: string;
  social_media?: string;
  year_level?: string;
  course?: string;
  department?: string;
  guardian_name?: string;
  guardian_contact_no?: string;
  // Marching Band
  has_band_experience?: boolean;
  // Glee Club
  vocal_range?: string;
  previous_singing_experience?: string;
  musical_background?: string;
  // Dance Club
  primary_dance_genre?: string;
  years_of_experience?: string;
  performed_on_stage?: string;
  willing_to_attend_rehearsals?: boolean;
  // Majorettes
  previous_majorette_team?: string;
  previous_organization?: string;
  can_perform_basic_routines?: boolean;
}

export interface Application {
  id: number;
  talent_group: string;
  status: 'pending' | 'interview_scheduled' | 'approved' | 'rejected';
  personal_info: ApplicationPersonalInfo;
  experience: string;
  motivation: string;
  applied_at: string;
  interview?: {
    id: number;
    scheduled_at: string;
    location: string;
    notes: string | null;
  } | null;
}

export interface StoreApplicationPayload {
  talent_group: string;
  personal_info: ApplicationPersonalInfo;
  experience: string;
  motivation: string;
}

export interface ScheduleInterviewPayload {
  scheduled_at: string; // ISO 8601
  location: string;
  notes?: string;
}

export interface ApprovePayload {
  notes?: string;
}

export interface RejectPayload {
  reason: string;
}

export interface PaginatedApplications {
  data: Application[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ── Recruitment service ───────────────────────────────────────────────────────
export const recruitmentService = {
  /**
   * PUBLIC — submit a scholarship application (no auth required).
   */
  async submitApplication(payload: StoreApplicationPayload): Promise<Application> {
    const { data } = await api.post<Application>('applications', payload);
    return data;
  },

  /**
   * PUBLIC — submit a scholarship application with photo as multipart/form-data.
   */
  async submitApplicationForm(formData: FormData): Promise<Application> {
    const { data } = await api.post<Application>('applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * List all applications (director/admin only). Supports pagination & filters.
   */
  async listApplications(params?: {
    status?: string;
    talent_group?: string;
    page?: number;
  }): Promise<PaginatedApplications> {
    const { data } = await api.get<PaginatedApplications>('recruitment/applications', { params });
    return data;
  },

  /**
   * Get a single application's full detail.
   */
  async getApplication(id: number): Promise<Application> {
    const { data } = await api.get<Application>(`recruitment/applications/${id}`);
    return data;
  },

  /**
   * Schedule an interview for an application.
   */
  async scheduleInterview(id: number, payload: ScheduleInterviewPayload): Promise<Application> {
    const { data } = await api.post<Application>(
      `recruitment/applications/${id}/schedule-interview`,
      payload,
    );
    return data;
  },

  /**
   * Approve an application (moves it to 'approved' status).
   */
  async approve(id: number, payload?: ApprovePayload): Promise<Application> {
    const { data } = await api.post<Application>(`recruitment/applications/${id}/approve`, payload ?? {});
    return data;
  },

  /**
   * Reject an application.
   */
  async reject(id: number, payload: RejectPayload): Promise<Application> {
    const { data } = await api.post<Application>(`recruitment/applications/${id}/reject`, payload);
    return data;
  },
};
