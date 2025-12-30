// src/api/reviewApi.ts
import { http } from '@/lib/apiClient';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  user: {
    name: string;
  };
  producto: {
    nombre_producto: string;
  };
}

const BASE_ENDPOINT = '/admin/reviews';

export const getReviews = (status?: ReviewStatus): Promise<Review[]> => {
  const params = status ? { status } : {};
  return http.get<Review[]>(BASE_ENDPOINT, { params, authType: 'admin' });
};

export const updateReviewStatus = (id: number, status: ReviewStatus): Promise<Review> => {
  return http.put<Review>(`${BASE_ENDPOINT}/${id}/status`, { status }, { authType: 'admin' });
};
