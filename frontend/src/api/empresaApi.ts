// src/api/empresaApi.ts
import { http } from '@/lib/apiClient';

export interface Empresa {
    id: number;
    nombre: string;
    descripcion: string;
    // Add other fields from your Prisma model as needed
}

const PUBLIC_BASE_ENDPOINT = '/public/empresa';

// The backend seems to return an array, even if it's just one company
export const getPublicEmpresa = (): Promise<Empresa[]> => {
    return http.get<Empresa[]>(PUBLIC_BASE_ENDPOINT);
};
