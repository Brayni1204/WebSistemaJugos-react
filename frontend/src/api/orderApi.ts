// src/api/orderApi.ts
import { http } from '@/lib/apiClient';
import type { Pedido } from './profileApi'; // Reusing this type, assuming it's correct
import type { TableOrderItem } from '@/contexts/TableOrderContext';

// ===== Payloads =====

interface OrderItemPayload {
    producto_id: number;
    quantity: number;
    precio_venta: number;
    nombre_producto: string;
}

interface AdminOrderPayload {
    mesa_id?: number;
    items: OrderItemPayload[];
    subtotal: number;
    total_pago: number;
    estado?: string;
}

interface PublicOrderPayload {
    table_uuid: string;
    items: TableOrderItem[];
    subtotal: number;
    total_pago: number;
}


// ===== API Functions =====

/**
 * Fetches a single order by its ID for an admin.
 */
export const getAdminOrderById = async (orderId: number): Promise<Pedido> => {
    try {
        // The route was GET /admin/pedidos/:id in the backend router
        const response = await http.get<Pedido>(`/admin/pedidos/${orderId}`);
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to fetch order details.');
    }
};

/**
 * Creates a new order as an admin.
 */
export const createAdminOrder = async (payload: AdminOrderPayload): Promise<Pedido> => {
    try {
        // The route was POST /admin/pedidos
        const response = await http.post<Pedido>('/admin/pedidos', payload);
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create order.');
    }
};

/**
 * Updates an existing order as an admin.
 */
export const updateAdminOrder = async (orderId: number, payload: Partial<AdminOrderPayload>): Promise<Pedido> => {
    try {
        // The route was PUT /admin/pedidos/:id
        const response = await http.put<Pedido>(`/admin/pedidos/${orderId}`, payload);
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update order.');
    }
};

/**
 * Places a new order from the public QR code menu.
 */
export const placePublicOrder = async (payload: PublicOrderPayload): Promise<Pedido> => {
    try {
        const response = await http.post<Pedido>('/public/orders', payload);
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to place order.');
    }
};
