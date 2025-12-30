// src/api/waiterApi.ts
import { http } from '@/lib/apiClient';

// Manually construct the base URL, mirroring apiClient.ts
const API_BASE_URL = `${import.meta.env.VITE_API_PROTOCOL || 'http'}://localhost:${import.meta.env.VITE_API_PORT || '5000'}${import.meta.env.VITE_API_PATH || '/api'}`;

// --- Interfaces ---

export interface PinPayload {
    pin: string;
}

export interface WaiterUser {
    id: number;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
}

export interface PinResponse {
    message: string;
    token: string;
    user: WaiterUser;
}

export interface Table {
    id: number;
    numero_mesa: number;
    estado: string;
    pedidos: { id: number; estado: string }[];
    // other fields...
}

export interface Product {
    id: number;
    nombre_producto: string;
    precio_venta: number;
    // other fields...
}

export interface OrderItem {
    id: number;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    precio_total: number;
    descripcion?: string;
    producto: Product;
}

export interface Customer {
    id: number;
    nombre?: string;
    telefono?: string;
}

export interface Order {
    id: number;
    estado: string;
    subtotal: number;
    total_pago: number;
    detalle_pedidos: OrderItem[];
    cliente?: Customer;
    // other fields...
}

export interface NewOrderItemPayload {
    productId: number;
    quantity: number;
    description?: string;
}

export interface CreateOrderPayload {
    tableId: number;
    customerName?: string;
    customerPhone?: string;
    items: NewOrderItemPayload[];
}


// --- API Functions ---

/**
 * Verifies the waiter's PIN. This function can use the global http client
 * as it does not require a pre-existing authentication token.
 */
export const verifyPin = (payload: PinPayload): Promise<PinResponse> => {
    return http.post<PinResponse>('/auth/waiter/verify-pin', payload);
};

/**
 * A specialized fetcher for authenticated waiter requests that uses a temporary token.
 * @param endpoint The API endpoint to call.
 * @param token The temporary waiter JWT.
 * @param options The request options (method, body, etc.).
 * @returns The JSON response.
 */
const waiterFetcher = async <T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> => {
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        // You might want to throw a more specific error class here
        throw new Error(errorData.message || 'Waiter API request failed');
    }

    if (response.status === 204) {
        return null as T;
    }
    return response.json();
};

/**
 * Fetches all tables. This is a public endpoint.
 */
export const getTables = (): Promise<Table[]> => {
    return http.get<Table[]>('/waiter/tables');
};

/**
 * Fetches the active (pending) order for a specific table. Requires a valid waiter token.
 */
export const getActiveOrderForTable = (token: string, tableId: number): Promise<Order> => {
    return waiterFetcher<Order>(`/waiter/orders/table/${tableId}`, token, { method: 'GET' });
};

/**
 * Creates a new order or adds items to an existing one. Requires a valid waiter token.
 */
export const createOrUpdateOrder = (token: string, payload: CreateOrderPayload): Promise<Order> => {
    return waiterFetcher<Order>('/waiter/orders', token, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

/**
 * Fetches a single order's details for printing a receipt. Requires a valid waiter token.
 */
export const getReceiptOrder = (token: string, orderId: number): Promise<Order> => {
    return waiterFetcher<Order>(`/waiter/recibo/${orderId}`, token, { method: 'GET' });
};

export const updateOrderCustomer = (token: string, orderId: number, payload: { customerName: string; customerPhone?: string }): Promise<Order> => {
    return waiterFetcher<Order>(`/waiter/orders/${orderId}/customer`, token, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
};
