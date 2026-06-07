/**
 * trainingService.ts
 * Covers all /api/v1/training/* endpoints — trainees, attendance, evaluations.
 */

import { api } from './api';

// ── Types (mirror TraineeResource, AttendanceRecordResource, EvaluationResource) ──

export interface Trainee {
  id: number;
  user_id: number;
  name: string;
  email: string;
  student_id: string | null;
  talent_group: string;
  status: 'active' | 'completed' | 'dropped';
  training_started_at: string | null;
  training_completed_at: string | null;
  scholarship_percentage: number | null;
  assigned_instrument: string | null;
  assigned_voice: string | null;
}

export interface AttendanceRecord {
  id: number;
  trainee_id: number;
  session_date: string; // 'YYYY-MM-DD'
  attended: boolean;
  is_no_practice: boolean;
  notes: string | null;
}

export interface BatchAttendancePayload {
  session_date: string;
  records: Array<{
    trainee_id: number;
    attended: boolean;
  }>;
}

export interface Evaluation {
  id: number;
  trainee_id: number;
  evaluator_id: number;
  evaluator_name: string;
  trainee_name: string;
  talent_group: string;
  semester: string;
  academic_year: string;
  evaluation_date: string;
  performance_metrics: {
    skill_demonstration: number;
    rehearsal_attendance: number;
    event_participation: number;
    teamwork: number;
    leadership: number;
  };
  strengths: string;
  areas_for_improvement: string;
  overall_rating: number;
  recommendation: 'continue' | 'probation' | 'discontinue';
  additional_notes: string | null;
}

export interface StoreEvaluationPayload {
  trainee_id: number;
  semester: string;
  academic_year: string;
  evaluation_date: string;
  performance_metrics: Evaluation['performance_metrics'];
  strengths: string;
  areas_for_improvement: string;
  overall_rating: number;
  recommendation: Evaluation['recommendation'];
  additional_notes?: string;
}

export interface UpdateTraineePayload {
  talent_group?: string;
  status?: Trainee['status'];
  assigned_instrument?: string;
  assigned_voice?: string;
  scholarship_percentage?: number;
}

export interface TraineeStats {
  total_sessions: number;
  attended_sessions: number;
  attendance_rate: number;
  evaluations_count: number;
  average_rating: number | null;
  latest_recommendation: Evaluation['recommendation'] | null;
}

// ── Training service ──────────────────────────────────────────────────────────
export const trainingService = {
  // ── Trainees ────────────────────────────────────────────────────────────────
  async listTrainees(params?: {
    talent_group?: string;
    status?: string;
    page?: number;
  }): Promise<{ data: Trainee[]; meta: Record<string, unknown> }> {
    const { data } = await api.get('training/trainees', { params });
    return data;
  },

  async getTrainee(id: number): Promise<Trainee> {
    const { data } = await api.get<Trainee>(`training/trainees/${id}`);
    return data;
  },

  async updateTrainee(id: number, payload: UpdateTraineePayload): Promise<Trainee> {
    const { data } = await api.patch<Trainee>(`training/trainees/${id}`, payload);
    return data;
  },

  async deleteTrainee(id: number): Promise<void> {
    await api.delete(`training/trainees/${id}`);
  },

  async getTraineeStats(id: number): Promise<TraineeStats> {
    const { data } = await api.get<TraineeStats>(`training/trainees/${id}/stats`);
    return data;
  },

  // ── Attendance ──────────────────────────────────────────────────────────────
  async listAttendance(params?: {
    trainee_id?: number;
    from?: string;
    to?: string;
  }): Promise<AttendanceRecord[]> {
    const { data } = await api.get<AttendanceRecord[]>('training/attendance', { params });
    return data;
  },

  async batchUpsertAttendance(payload: BatchAttendancePayload): Promise<AttendanceRecord[]> {
    const { data } = await api.post<AttendanceRecord[]>('training/attendance/batch', payload);
    return data;
  },

  async toggleNoPractice(recordId: number): Promise<AttendanceRecord> {
    const { data } = await api.patch<AttendanceRecord>(
      `training/attendance/${recordId}/toggle-no-practice`,
    );
    return data;
  },

  // ── Evaluations ─────────────────────────────────────────────────────────────
  async listEvaluations(params?: {
    trainee_id?: number;
    semester?: string;
    academic_year?: string;
  }): Promise<Evaluation[]> {
    const { data } = await api.get<Evaluation[]>('training/evaluations', { params });
    return data;
  },

  async storeEvaluation(payload: StoreEvaluationPayload): Promise<Evaluation> {
    const { data } = await api.post<Evaluation>('training/evaluations', payload);
    return data;
  },

  async getEvaluation(id: number): Promise<Evaluation> {
    const { data } = await api.get<Evaluation>(`training/evaluations/${id}`);
    return data;
  },

  async updateEvaluation(
    id: number,
    payload: Partial<StoreEvaluationPayload>,
  ): Promise<Evaluation> {
    const { data } = await api.patch<Evaluation>(`training/evaluations/${id}`, payload);
    return data;
  },
};
