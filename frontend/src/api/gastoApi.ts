// src/api/gastoApi.ts
import { http } from '@/lib/apiClient';
import type { Proveedor } from './proveedorApi';

export interface GastoItemPayload {
    productoId?: number;
    description: string;
    quantity: number;
    purchase_price: number;
}

export interface GastoPayload {
    proveedorId?: number | null;
    date: string;
    items: GastoItemPayload[];
}

export interface Gasto {
    id: number;
    date: string;
    total_amount: number;
    proveedor: Proveedor | null;
    _count?: {
        items: number;
    };
}

const BASE_ENDPOINT = '/admin/gastos';

export const getGastos = (): Promise<Gasto[]> => {
    return http.get<Gasto[]>(BASE_ENDPOINT, { authType: 'admin' });
};

export const createGasto = (data: GastoPayload): Promise<Gasto> => {
    return http.post<Gasto>(BASE_ENDPOINT, data, { authType: 'admin' });
};