// src/api/novedadesApi.ts
import { http } from '@/lib/apiClient';

export interface Novedad {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const PUBLIC_BASE_ENDPOINT = '/public/novedades';
const ADMIN_BASE_ENDPOINT = '/admin/novedades';

// Public-facing functions
export const getPublicNovedades = (): Promise<Novedad[]> => {
    return http.get<Novedad[]>(PUBLIC_BASE_ENDPOINT);
};

export const getPublicNovedadById = (id: number): Promise<Novedad> => {
    return http.get<Novedad>(`${PUBLIC_BASE_ENDPOINT}/${id}`);
};

// Admin functions
export const getNovedades = (): Promise<Novedad[]> => {
  return http.get<Novedad[]>(ADMIN_BASE_ENDPOINT, { authType: 'admin' });
};

export const getNovedadById = (id: number): Promise<Novedad> => {
  return http.get<Novedad>(`${ADMIN_BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

export const createNovedad = (novedadData: Omit<Novedad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Novedad> => {
    return http.post<Novedad>(ADMIN_BASE_ENDPOINT, novedadData, { authType: 'admin' });
};

export const updateNovedad = (id: number, novedadData: Partial<Omit<Novedad, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Novedad> => {
    return http.put<Novedad>(`${ADMIN_BASE_ENDPOINT}/${id}`, novedadData, { authType: 'admin' });
};

export const deleteNovedad = (id: number): Promise<null> => {
  return http.delete<null>(`${ADMIN_BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};
