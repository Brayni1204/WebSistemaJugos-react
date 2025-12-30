// src/api/categoryApi.ts
import { http } from '@/lib/apiClient';

// Define the Category type based on the Prisma model
export interface Category {
  id: number;
  nombre_categoria: string;
  descripcion: string | null;
  status: number;
  imageUrl: string | null;
  tenantId: number;
  created_at: string;
  updated_at: string;
}

// Define the structure for paginated responses if your API supports it
interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface GetCategoriesResponse {
  data: Category[];
  pagination: PaginationData;
}

// Params for fetching categories, including pagination and filtering
interface GetCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    // Add other filter params as needed
}

// Note: The backend controller is mounted on `/api/admin`, 
// so the endpoint for categories is `/categories` relative to that.
const BASE_ENDPOINT = '/admin/categorias';

export const getCategories = (params: GetCategoriesParams = {}): Promise<GetCategoriesResponse> => {
  return http.get<GetCategoriesResponse>(BASE_ENDPOINT, { params, authType: 'admin' });
};

export const getCategoryById = (id: number): Promise<Category> => {
  return http.get<Category>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

// For creating, we might not send the full category object, but a DTO.
// Using Partial<Category> for flexibility. The backend will fill in defaults.
export const createCategory = (categoryData: FormData): Promise<Category> => {
    return http.post<Category>(BASE_ENDPOINT, categoryData, { authType: 'admin' });
};

// For updating, we send the fields that can be changed.
// Using Partial<Category> and an ID.
export const updateCategory = (id: number, categoryData: FormData): Promise<Category> => {
    // The http client doesn't directly support PUT with FormData in its simplified helper.
    // We need to use the base apiClient to handle it correctly.
    // Let's assume the http.put is configured to handle FormData.
    // If not, this would need adjustment to use the main `apiClient` function.
    return http.put<Category>(`${BASE_ENDPOINT}/${id}`, categoryData, { authType: 'admin' });
};


export const deleteCategory = (id: number): Promise<null> => {
  return http.delete<null>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

// Public-facing function
const PUBLIC_BASE_ENDPOINT = '/public/categorias';
export const getPublicCategories = (params: GetCategoriesParams = {}): Promise<GetCategoriesResponse> => {
    return http.get<GetCategoriesResponse>(PUBLIC_BASE_ENDPOINT, { params });
};
