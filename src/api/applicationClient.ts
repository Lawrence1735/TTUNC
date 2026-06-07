import { api as apiClient } from '../app/services/api';

export interface ApplicationResponse {
  id: string;
  user_id?: string;
  talent_group: string;
  status: 'pending' | 'interview_scheduled' | 'approved' | 'rejected';
  applicant_name: string;
  applicant_email: string;
  applicant_student_id?: string;
  applicant_phone?: string;
  applicant_year_level?: string;
  applicant_course?: string;
  applicant_department?: string;
  applicant_address?: string;
  applicant_gender?: string;
  applicant_birthdate?: string;
  applicant_age?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  instruments?: string;
  voices?: string;
  vocal_range?: string;
  primary_dance_genre?: string;
  years_of_experience?: string;
  performed_on_stage?: string;
  willing_to_attend_rehearsals?: string;
  has_band_experience?: boolean;
  previous_singing_experience?: string;
  musical_background?: string;
  previous_majorette_team?: string;
  previous_organization?: string;
  can_perform_basic_routines?: string;
  experience?: string;
  motivation?: string;
  documents?: string[];
  approval_notes?: string;
  denial_reason?: string;
  denial_feedback?: string;
  applied_at: string;
  created_at?: string;
  updated_at?: string;
  interview?: {
    id: string;
    application_id: string;
    reviewer_id?: string;
    scheduled_at?: string;
    date?: string;
    time?: string;
    venue?: string;
    status?: string;
    notes?: string;
  };
}

export interface ApplicationsPaginatedResponse {
  data: ApplicationResponse[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

class ApplicationClient {
  /**
   * Submit a new application (public submission)
   */
  async submitApplication(applicationData: any): Promise<{ message: string; data: ApplicationResponse }> {
    try {
      const response = await apiClient.post('applications', applicationData);
      return response.data;
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      throw {
        status: err.response?.status,
        message: err.message || 'Failed to submit application',
        data: err.response?.data,
      };
    }
  }

  /**
   * Fetch applications for the authenticated director's talent group
   */
  async getApplications(filters?: {
    status?: 'pending' | 'interview_scheduled' | 'approved' | 'rejected';
    talent_group?: string;
    search?: string;
    page?: number;
  }): Promise<ApplicationsPaginatedResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.talent_group) params.append('talent_group', filters.talent_group);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());

      const queryString = params.toString();
      const url = `recruitment/applications${queryString ? '?' + queryString : ''}`;
      const response = await apiClient.get(url);

      return response.data || { data: [], current_page: 1, per_page: 20, total: 0, last_page: 1 };
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      throw {
        status: err.response?.status,
        message: err.message || 'Failed to fetch applications',
        data: err.response?.data,
      };
    }
  }

  /**
   * Get a single application by ID
   */
  async getApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      const response = await apiClient.get(`recruitment/applications/${applicationId}`);
      return response.data?.data || response.data;
    } catch (err: any) {
      console.error(`Failed to fetch application ${applicationId}:`, err);
      throw {
        status: err.response?.status,
        message: err.message || 'Failed to fetch application',
        data: err.response?.data,
      };
    }
  }

  /**
   * Schedule an interview for an applicant
   */
  async scheduleInterview(
    applicationId: string,
    data: {
      scheduled_at: string; // Date string (YYYY-MM-DD)
      venue?: string;
      notes?: string;
    }
  ): Promise<{ message: string; interview: any }> {
    try {
      const response = await apiClient.post(`recruitment/applications/${applicationId}/schedule-interview`, data);
      return response.data;
    } catch (err: any) {
      console.error(`Failed to schedule interview for ${applicationId}:`, err);
      throw {
        status: err.response?.status,
        message: err.message || 'Failed to schedule interview',
        data: err.response?.data,
      };
    }
  }

  /**
   * Approve an application
   */
  async approveApplication(
    applicationId: string,
    approvalNotes?: string
  ): Promise<{ message: string; data: ApplicationResponse }> {
    try {
      const response = await apiClient.post(`recruitment/applications/${applicationId}/approve`, {
        approval_notes: approvalNotes,
      });
      return response.data;
    } catch (err: any) {
      console.error(`Failed to approve application ${applicationId}:`, err);
      throw {
        status: err.response?.status,
        message: err.message || 'Failed to approve application',
        data: err.response?.data,
      };
    }
  }

  /**
   * Decline/Reject an application
   */
  async declineApplication(
    applicationId: string,
    denialReason: string,
    denialFeedback?: string
  ): Promise<{ message: string; data: ApplicationResponse }> {
    try {
      const response = await apiClient.post(`recruitment/applications/${applicationId}/reject`, {
        denial_reason: denialReason,
        denial_feedback: denialFeedback,
      });
      return response.data;
    } catch (err: any) {
      console.error(`Failed to decline application ${applicationId}:`, err);
      throw {
        status: err.response?.status,
        message: err.message || 'Failed to decline application',
        data: err.response?.data,
      };
    }
  }
}

export const applicationClient = new ApplicationClient();
