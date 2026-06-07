import { api as apiClient } from '../app/services/api';

export interface Trainee {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  completion_rate: number;
  current_status: 'active' | 'inactive' | 'completed' | 'dropped';
  chapter?: string;
  chapters_completed?: Record<number, boolean>;
  instrument?: string;
  voice?: string;
  deactivation_note?: string;
  total_expected_sessions: number;
  date_joined?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TraineeResponse {
  data: Trainee[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
  };
}

export interface AttendanceRecordApi {
  id: number;
  trainee_id: number;
  session_date: string;
  status: 'present' | 'absent' | 'excused';
  no_practice: boolean;
  notes?: string | null;
  trainee?: {
    id: number;
    user_id: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export class TrainingClient {
  /**
   * Fetch all trainees
   */
  async getTrainees(): Promise<Trainee[]> {
    try {
      const response = await apiClient.get('training/trainees');
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      console.error('Failed to fetch trainees:', err);
      throw {
        status: err.status,
        message: err.message || 'Failed to fetch trainees',
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Get specific trainee by ID
   */
  async getTrainee(traineeId: number): Promise<Trainee> {
    try {
      const response = await apiClient.get(`/training/trainees/${traineeId}`);
      return response.data?.data || response.data;
    } catch (err: any) {
      console.error(`Failed to fetch trainee ${traineeId}:`, err);
      throw {
        status: err.status,
        message: err.message || `Failed to fetch trainee ${traineeId}`,
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Update trainee (status, completion rate, etc.)
   */
  async updateTrainee(traineeId: number, updates: Partial<Trainee>): Promise<Trainee> {
    try {
      const response = await apiClient.patch(`/training/trainees/${traineeId}`, updates);
      return response.data?.data || response.data;
    } catch (err: any) {
      console.error(`Failed to update trainee ${traineeId}:`, err);
      throw {
        status: err.status,
        message: err.message || `Failed to update trainee ${traineeId}`,
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Fetch attendance rows
   */
  async getAttendance(filters?: { trainee_id?: number; date_from?: string; date_to?: string }): Promise<AttendanceRecordApi[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.trainee_id) params.append('trainee_id', filters.trainee_id.toString());
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await apiClient.get('/training/attendance', { params });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      console.error('Failed to fetch attendance:', err);
      throw {
        status: err.status,
        message: err.message || 'Failed to fetch attendance',
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Save one session attendance batch
   */
  async upsertAttendanceSession(data: {
    session_date: string;
    no_practice?: boolean;
    records: Array<{ trainee_id: number; attended: boolean }>;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/training/attendance/batch', data);
      return response.data?.data || response.data;
    } catch (err: any) {
      console.error('Failed to upsert attendance session:', err);
      throw {
        status: err.status,
        message: err.message || 'Failed to save attendance session',
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Create a new evaluation
   */
  async createEvaluation(data: any): Promise<any> {
    try {
      const response = await apiClient.post('/training/evaluations', data);
      return response.data?.data || response.data;
    } catch (err: any) {
      console.error('Failed to create evaluation:', err);
      throw {
        status: err.status,
        message: err.message || 'Failed to create evaluation',
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Update an existing evaluation
   */
  async updateEvaluation(evaluationId: number, data: any): Promise<any> {
    try {
      const response = await apiClient.patch(`/training/evaluations/${evaluationId}`, data);
      return response.data?.data || response.data;
    } catch (err: any) {
      console.error(`Failed to update evaluation ${evaluationId}:`, err);
      throw {
        status: err.status,
        message: err.message || `Failed to update evaluation ${evaluationId}`,
        data: err.data,
        errors: err.errors,
      };
    }
  }

  /**
   * Fetch all evaluations
   */
  async getEvaluations(filters?: { trainee_id?: number; status?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.trainee_id) params.append('trainee_id', filters.trainee_id.toString());
      if (filters?.status) params.append('status', filters.status);
      
      const response = await apiClient.get('/training/evaluations', { params });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      console.error('Failed to fetch evaluations:', err);
      throw {
        status: err.status,
        message: err.message || 'Failed to fetch evaluations',
        data: err.data,
        errors: err.errors,
      };
    }
  }
}

export default new TrainingClient();
