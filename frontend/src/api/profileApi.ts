// src/api/profileApi.ts
import { http } from '@/lib/apiClient';
import type { User } from '@/contexts/AuthContext';

// Define a basic Order type for order history
export interface OrderItem {
    id: number;
    cantidad: number;
    nombre_producto: string;
    precio_unitario: number;
    precio_total: number;
    producto_id: number;
}

export interface Pedido {
    id: number;
    created_at: string;
    total_pago: number;
    estado: string;
    detalle_pedidos: OrderItem[];
    cliente?: { nombre: string | null } | null;
    metodo_entrega?: string;
    mesa?: { numero_mesa: number } | null;
}

// The profile object combines User and Cliente data
export interface ProfileData extends User {
    cliente: {
        id: number;
        nombre: string | null;
        apellidos: string | null;
        telefono: string | null;
    } | null;
}

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    apellidos?: string;
    telefono?: string;
}

export const getProfile = (): Promise<ProfileData> => {
    return http.get<ProfileData>('/profile', { authType: 'customer' });
};

export const updateProfile = (payload: UpdateProfilePayload): Promise<{ message: string; user: ProfileData }> => {
    return http.put('/profile', payload, { authType: 'customer' });
};

export const getMyOrders = (): Promise<Pedido[]> => {
    return http.get<Pedido[]>('/profile/orders', { authType: 'customer' });
};
