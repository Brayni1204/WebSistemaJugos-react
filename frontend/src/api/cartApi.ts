// src/api/cartApi.ts
import { http } from '@/lib/apiClient';
import type { Product } from './productsApi';

export interface CartItem {
  id: number;
  quantity: number;
  cartId: number;
  productoId: number;
  producto: Product; // Include product details
}

export interface Cart {
  id: number;
  userId: number;
  tenantId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

const BASE_ENDPOINT = '/cart'; // Mounted on /api/cart

export const getCart = (): Promise<Cart> => {
  return http.get<Cart>(`${BASE_ENDPOINT}`, { authType: 'customer' });
};

export const addItemToCart = (productId: number, quantity: number): Promise<CartItem> => {
  return http.post<CartItem>(`${BASE_ENDPOINT}/items`, { productoId: productId, quantity }, { authType: 'customer' });
};

export const updateCartItemQuantity = (itemId: number, quantity: number): Promise<CartItem> => {
  return http.patch<CartItem>(`${BASE_ENDPOINT}/items/${itemId}/quantity`, { quantity }, { authType: 'customer' });
};

export const removeItemFromCart = (itemId: number): Promise<void> => {
  return http.delete<void>(`${BASE_ENDPOINT}/items/${itemId}`, { authType: 'customer' });
};

export const clearCart = (): Promise<void> => {
  return http.delete<void>(`${BASE_ENDPOINT}/clear`, { authType: 'customer' });
};
