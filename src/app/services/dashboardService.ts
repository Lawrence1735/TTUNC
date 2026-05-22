/**
 * dashboardService.ts
 * Covers GET /api/v1/dashboard/summary (director/admin only).
 */

import { api } from './api';

export interface DashboardSummary {
  total_applications: number;
  pending_applications: number;
  interviews_scheduled: number;
  approved_applications: number;
  rejected_applications: number;
  total_trainees: number;
  active_trainees: number;
  completed_trainees: number;
  total_evaluations: number;
  average_rating: number | null;
  by_talent_group: Record<
    string,
    {
      applications: number;
      trainees: number;
      evaluations: number;
    }
  >;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
