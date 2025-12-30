// src/api/productsApi.ts
import { http } from '@/lib/apiClient';
import type { Category } from './categoryApi'; // Reuse category type
import type { Componente } from './componenteApi';

// Define the Product type based on the Prisma model
export interface Product {
  id: number;
  nombre_producto: string;
  descripcion: string | null;
  stock: number;
  status: number;
  tracks_stock: boolean;
  precio_venta: number; // Prisma Decimal is often serialized as number or string
  precio_compra: number;
  imageUrl: string | null;
  id_categoria: number;
  tenantId: number;
  created_at: string;
  updated_at: string;
  categoria?: Category; // Include category object
  componentes?: Componente[]; // Include componentes object
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface GetProductsResponse {
  data: Product[];
  pagination: PaginationData;
}

interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
}

const BASE_ENDPOINT = '/admin/productos';

export const getProducts = (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
  return http.get<GetProductsResponse>(BASE_ENDPOINT, { params, authType: 'admin' });
};

export const getProductById = (id: number): Promise<Product> => {
  return http.get<Product>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

export const createProduct = (productData: FormData): Promise<Product> => {
    return http.post<Product>(BASE_ENDPOINT, productData, { authType: 'admin' });
};

export const updateProduct = (id: number, productData: FormData): Promise<Product> => {
    return http.put<Product>(`${BASE_ENDPOINT}/${id}`, productData, { authType: 'admin' });
};

export const deleteProduct = (id: number): Promise<null> => {
  return http.delete<null>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

// Public-facing function
const PUBLIC_BASE_ENDPOINT = '/public/productos';
export const getPublicProducts = (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
    return http.get<GetProductsResponse>(PUBLIC_BASE_ENDPOINT, { params });
};

export const getPublicProductById = (id: number): Promise<Product> => {
    return http.get<Product>(`${PUBLIC_BASE_ENDPOINT}/${id}`);
};
