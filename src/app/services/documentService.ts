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

export interface UploadDocumentPayload {
  title: string;
  category: ApiDocument['category'];
  talent_group?: string | null;
  related_to?: string | null;
  description?: string | null;
  tags?: string[];
  status?: ApiDocument['status'];
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string | null;
  related_to?: string | null;
  talent_group?: string | null;
  tags?: string[];
  status?: ApiDocument['status'];
}

const documentService = {
  getDocuments: (params?: { category?: string; talent_group?: string; search?: string }) =>
    api.get<{ data: ApiDocument[] }>('documents', { params }).then(r => r.data.data),

  getDocument: (id: number) =>
    api.get<{ data: ApiDocument }>(`documents/${id}`).then(r => r.data.data),

  /** Upload a real file along with metadata (multipart/form-data). */
  uploadDocument: (file: File, meta: UploadDocumentPayload) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', meta.title);
    form.append('category', meta.category);
    if (meta.talent_group) form.append('talent_group', meta.talent_group);
    if (meta.related_to) form.append('related_to', meta.related_to);
    if (meta.description) form.append('description', meta.description);
    if (meta.status) form.append('status', meta.status);
    if (meta.tags) meta.tags.forEach(t => form.append('tags[]', t));
    return api.post<{ data: ApiDocument }>('documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data);
  },

  updateDocument: (id: number | string, payload: UpdateDocumentPayload) =>
    api.patch<{ data: ApiDocument }>(`documents/${id}`, payload).then(r => r.data.data),

  deleteDocument: (id: number | string) =>
    api.delete(`documents/${id}`),
};

export default documentService;
