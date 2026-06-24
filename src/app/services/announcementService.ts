import { api } from './api';

export interface ApiAnnouncement {
  id: number;
  category: string;
  date: string;
  icon?: string | null;
  title: string;
  description: string;
  talent_group?: string | null;
  created_by?: number | null;
  creator?: { id: number; name: string } | null;
  created_at: string;
}

const announcementService = {
  getAnnouncements: () =>
    api.get<{ data: ApiAnnouncement[] }>('announcements').then(r => r.data.data),

  createAnnouncement: (payload: Partial<ApiAnnouncement>) =>
    api.post<{ data: ApiAnnouncement }>('announcements', payload).then(r => r.data.data),

  updateAnnouncement: (id: number | string, payload: Partial<ApiAnnouncement>) =>
    api.patch<{ data: ApiAnnouncement }>(`announcements/${id}`, payload).then(r => r.data.data),

  deleteAnnouncement: (id: number | string) =>
    api.delete(`announcements/${id}`),
};

export default announcementService;
