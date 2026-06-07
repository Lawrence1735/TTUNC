/**
 * documentService.ts
 * Covers /api/v1/documents/*
 */

import { api } from './api';

export interface ApiDocument {
  id: number;
  title: string;
  file_path: string;
  file_name: string | null;
  file_size: string | null;
  file_type: string | null;
  category: 'scholarship-contract' | 'event-request' | 'event-approval' | 'performance-report' | 'scholar-records';
  talent_group: string | null;
  related_to: string | null;
  uploaded_by: string | null;
  description: string | null;
  tags: string[] | null;
  status: 'pending' | 'approved' | 'completed';
  created_at: string;
}

const documentService = {
  getDocuments: (params?: { category?: string; talent_group?: string; search?: string }) =>
    api.get<{ data: ApiDocument[] }>('documents', { params }).then(r => r.data.data),

  getDocument: (id: number) =>
    api.get<{ data: ApiDocument }>(`documents/${id}`).then(r => r.data.data),
};

export default documentService;
