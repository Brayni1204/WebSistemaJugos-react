// src/api/resenaApi.ts
import { http } from '@/lib/apiClient';

export interface Resena {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface GetResenasResponse {
  resenas: Resena[];
  averageRating: number;
  totalResenas: number;
}

export interface CreateResenaPayload {
    rating: number;
    comment?: string;
}

const BASE_ENDPOINT = '/productos'; // Note: The route is nested under productos

export const getResenasForProduct = (productId: number): Promise<GetResenasResponse> => {
  return http.get<GetResenasResponse>(`${BASE_ENDPOINT}/${productId}/resenas`);
};

export const createResena = (productId: number, payload: CreateResenaPayload): Promise<Resena> => {
  // Creating a review requires customer authentication
  return http.post<Resena>(`${BASE_ENDPOINT}/${productId}/resenas`, payload, { authType: 'customer' });
};