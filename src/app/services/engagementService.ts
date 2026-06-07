/**
 * engagementService.ts
 * Covers /api/v1/engagements/*
 */

import { api } from './api';

export interface Engagement {
  id: number;
  event_name: string;
  description: string | null;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM
  venue: string;
  talent_groups: string[] | null;
  type: 'performance' | 'rehearsal' | 'workshop' | 'competition';
  is_required: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const engagementService = {
  getEngagements: () =>
    api.get<{ data: Engagement[] }>('engagements').then(r => r.data.data),

  getRehearsals: () =>
    api.get<{ data: Engagement[] }>('engagements/rehearsals').then(r => r.data.data),

  createEngagement: (data: Partial<Engagement>) =>
    api.post<{ data: Engagement }>('engagements', data).then(r => r.data.data),
};

export default engagementService;
