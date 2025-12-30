// src/api/proveedorApi.ts
import { http } from '@/lib/apiClient';

export interface Proveedor {
    id: number;
    name: string;
    ruc: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
}

const BASE_ENDPOINT = '/admin/proveedores';

export const getProveedores = (): Promise<Proveedor[]> => {
    return http.get<Proveedor[]>(BASE_ENDPOINT, { authType: 'admin' });
};

export const createProveedor = (data: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    return http.post<Proveedor>(BASE_ENDPOINT, data, { authType: 'admin' });
};

export const updateProveedor = (id: number, data: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    return http.put<Proveedor>(`${BASE_ENDPOINT}/${id}`, data, { authType: 'admin' });
};

export const deleteProveedor = (id: number): Promise<null> => {
    return http.delete<null>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};
