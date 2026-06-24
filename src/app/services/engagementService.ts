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
  organization_name?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  attachments?: Array<{
    name: string;
    size?: number;
    type?: string;
    url?: string;
    path?: string;
  }> | null;
  talent_groups: string[] | null;
  type: 'performance' | 'rehearsal' | 'workshop' | 'competition';
  is_required: boolean;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending_admin_approval' | 'pending_director_approval' | 'rejected';
}

const engagementService = {
  getEngagements: () =>
    api.get<{ data: Engagement[] }>('engagements').then(r => r.data.data),

  getRehearsals: () =>
    api.get<{ data: Engagement[] }>('engagements/rehearsals').then(r => r.data.data),

  createEngagement: (data: Partial<Engagement>) =>
    api.post<{ data: Engagement }>('engagements', data).then(r => r.data.data),

  updateEngagement: (id: number | string, data: Partial<Engagement>) =>
    api.patch<{ data: Engagement }>(`engagements/${id}`, data).then(r => r.data.data),

  deleteEngagement: (id: number | string) =>
    api.delete(`engagements/${id}`),
};

export default engagementService;
