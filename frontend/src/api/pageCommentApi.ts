// src/api/pageCommentApi.ts
import { http } from '@/lib/apiClient';

export interface PageComment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    profile_photo_path: string | null;
  };
  children: PageComment[];
  parentId: number | null;
}

export interface CreateCommentPayload {
    content: string;
    parentId?: number;
}

const BASE_ENDPOINT = '/comments';

export const getCommentsForPage = (pageType: string, pageId: number): Promise<PageComment[]> => {
  return http.get<PageComment[]>(`${BASE_ENDPOINT}/${pageType}/${pageId}`);
};

export const createComment = (pageType: string, pageId: number, payload: CreateCommentPayload): Promise<PageComment> => {
  return http.post<PageComment>(`${BASE_ENDPOINT}/${pageType}/${pageId}`, payload, { authType: 'customer' });
};
