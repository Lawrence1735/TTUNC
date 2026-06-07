/**
 * notificationService.ts
 * Covers /api/v1/notifications/*
 */

import { api } from './api';

export interface ApiNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_id: string | null;
  action_url: string | null;
  created_at: string;
}

const notificationService = {
  getNotifications: () =>
    api.get<{ data: ApiNotification[] }>('notifications').then(r => r.data.data),

  markRead: (id: number) =>
    api.post(`notifications/${id}/read`),

  markAllRead: () =>
    api.post('notifications/read-all'),

  deleteNotification: (id: number) =>
    api.delete(`notifications/${id}`),
};

export default notificationService;
