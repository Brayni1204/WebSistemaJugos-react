// src/api/mesaApi.ts
import { http } from '@/lib/apiClient';

// This type should match the `Mesa` prisma model
export interface Mesa {
    id: number;
    uuid: string;
    numero_mesa: number;
    estado: 'disponible' | 'ocupada' | 'reservada';
    codigo_qr: string | null;
    status: number;
    created_at: string;
    updated_at: string;
}

// This type should match the `DetallePedido` prisma model, including the nested product
export interface PreviouslyOrderedItem {
    id: number;
    pedido_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    precio_total: number;
    nombre_producto: string;
    producto: {
        imageUrl: string | null;
    };
}

const PUBLIC_BASE_ENDPOINT = '/public/mesas';
const ADMIN_BASE_ENDPOINT = '/admin/mesas';

// ===== Public Functions =====
export const getActiveOrdersForTable = async (tableUuid: string): Promise<PreviouslyOrderedItem[]> => {
    try {
        const response = await http.get<PreviouslyOrderedItem[]>(`${PUBLIC_BASE_ENDPOINT}/${tableUuid}/pedidos`);
        return response;
    } catch (error: any) {
        console.error("Could not fetch active orders for table:", error.response?.data?.error || error.message);
        return [];
    }
};

// ===== Admin Functions =====
export const getMesas = (): Promise<Mesa[]> => {
    return http.get<Mesa[]>(ADMIN_BASE_ENDPOINT, { authType: 'admin' });
};

export const createMesa = (): Promise<Mesa> => {
    return http.post<Mesa>(ADMIN_BASE_ENDPOINT, {}, { authType: 'admin' });
};

export const deleteMesa = (id: number): Promise<null> => {
  return http.delete<null>(`${ADMIN_BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

export const generateMesaQrCode = async (id: number): Promise<{ qrCodeUrl: string }> => {
    return http.get<{ qrCodeUrl: string }>(`${ADMIN_BASE_ENDPOINT}/${id}/qr`, { authType: 'admin' });
};
