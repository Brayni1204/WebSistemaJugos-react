// src/api/commentManagementApi.ts
import { http } from '@/lib/apiClient';

export interface PageComment {
  id: number;
  content: string;
  pageType: string;
  pageId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
  };
}

export const listAllComments = (): Promise<PageComment[]> => {
  return http.get<PageComment[]>('/admin/comments', { authType: 'admin' });
};

export const updateCommentStatus = (commentId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<PageComment> => {
  return http.patch<PageComment>(`/admin/comments/${commentId}/status`, { status }, { authType: 'admin' });
};

export const deleteComment = (commentId: number): Promise<null> => {
  return http.delete<null>(`/admin/comments/${commentId}`, { authType: 'admin' });
};
