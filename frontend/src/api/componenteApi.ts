// src/api/componenteApi.ts
import { http } from '@/lib/apiClient';

// Define the Componente type based on the Prisma model
export interface Componente {
  id: number;
  nombre_componente: string;
  status: number;
  tenantId: number;
  created_at: string;
  updated_at: string;
}

const BASE_ENDPOINT = '/admin/componentes';

export const getComponentes = (): Promise<Componente[]> => {
  return http.get<Componente[]>(BASE_ENDPOINT, { authType: 'admin' });
};

export const createComponente = (data: { nombre_componente: string }): Promise<Componente> => {
    return http.post<Componente>(BASE_ENDPOINT, data, { authType: 'admin' });
};

export const deleteComponente = (id: number): Promise<null> => {
  return http.delete<null>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};
