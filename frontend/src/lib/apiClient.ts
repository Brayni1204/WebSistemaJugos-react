/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/apiClient.ts

import type { ApiErrorResponse } from "@/features/auth/types/auth.types";

export class RateLimitError extends Error {
  public retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ApiError extends Error {
  public status: number;
  public body: ApiErrorResponse;

  constructor(message: string, status: number, body: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost';
const API_PORT = import.meta.env.VITE_API_PORT || '5000';
const API_PATH = import.meta.env.VITE_API_PATH || '/api';

const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}${API_PATH}`;

type ApiClientOptions = Omit<RequestInit, 'body'> & {
    body?: any;
    params?: Record<string, any>;
    _retry?: boolean; // Flag to indicate if a request is a retry after token refresh
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void; originalRequest: Request; }> = [];

const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            const newHeaders = new Headers(prom.originalRequest.headers);
            newHeaders.set('Authorization', `Bearer ${token}`);
            const newRequest = new Request(prom.originalRequest.url, { ...prom.originalRequest, headers: newHeaders });
            prom.resolve(fetch(newRequest));
        }
    });
    failedQueue = [];
};

const refreshAdminToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/admin/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // WithCredentials is crucial for httpOnly cookies
            credentials: 'include' 
        });

        if (!response.ok) {
            // If refresh token is expired or invalid, server will respond with 401/403
            // In this case, need to completely log out.
            const errorData: ApiErrorResponse = await response.json();
            throw new Error(errorData.message || 'No se pudo refrescar el token de admin.');
        }

        const data = await response.json();
        const newAccessToken = data.accessToken;

        localStorage.setItem('adminAuthToken', newAccessToken); // Update client-side access token
        return newAccessToken;

    } catch (error) {
        console.error("Error refreshing admin token:", error);
        // Clear session and redirect on refresh failure
        localStorage.removeItem('adminAuthToken');
        window.dispatchEvent(new Event('AUTH_LOGOUT_ADMIN'));
        throw error;
    }
};

export const apiClient = async <T>(
    endpoint: string,
    options: ApiClientOptions = {},
    authType?: 'admin' | 'customer' // New optional parameter
): Promise<T> => {
    let url = `${API_BASE_URL}${endpoint}`;
    if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    let requestAuthType: 'admin' | 'customer' | null = authType || null;

    if (!requestAuthType) {
        if (endpoint.startsWith('/admin/')) {
            requestAuthType = 'admin';
        } else if (endpoint.startsWith('/customer/')) {
            requestAuthType = 'customer';
        }
        // For other endpoints, if a token is needed, we'll try to find it below.
        // It could also be public, or implicitly for customer if not admin.
    }

    let token: string | null = null;
    if (requestAuthType === 'admin') {
        token = localStorage.getItem('adminAuthToken');
    } else if (requestAuthType === 'customer') {
        token = localStorage.getItem('customerAuthToken');
    } else {
        // Fallback for public/shared endpoints: check if a customer token exists
        token = localStorage.getItem('customerAuthToken'); 
        if (!token) { // If no customer token, check for admin (less common for public routes)
            token = localStorage.getItem('adminAuthToken');
        }
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
        method: options.method || 'GET',
        headers,
        ...options,
    };

    if (options.body) {
        if (options.body instanceof FormData) {
            config.body = options.body;
            headers.delete('Content-Type');
        } else {
            config.body = JSON.stringify(options.body);
        }
    }
    
    delete (config as any).params;
    if (config.method === 'GET') delete (config as any).body;

    // Create a new Request object to be able to clone it for retries
    const originalRequest = new Request(url, config);

    const response = await fetch(originalRequest);

    if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();

        // Handle Rate Limit Error
        if (response.status === 429) {
            const retryAfterHeader = response.headers.get('Retry-After');
            const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
            throw new RateLimitError(errorData.message || 'Demasiadas solicitudes.', Date.now() + retryAfterSeconds * 1000);
        }

        // Handle Demo Restriction
        if (response.status === 403 && errorData.code === 'DEMO_WRITE_ACCESS_FORBIDDEN') {
            window.dispatchEvent(new CustomEvent('DEMO_MODE_RESTRICTION', { detail: { message: errorData.message } }));
            throw new Error(errorData.message);
        }

        // Handle 401 Unauthorized Error
        if (response.status === 401 && !options._retry) {
            if (requestAuthType === 'admin') { // This request was made with an admin context
                try {
                    // Pause other requests while refreshing token
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject, originalRequest });
                        }) as Promise<T>;
                    }
                    isRefreshing = true;

                    const newAccessToken = await refreshAdminToken(); // Attempt to refresh

                    isRefreshing = false;
                    processQueue(null, newAccessToken); // Resume queued requests

                    // Retry the original request with the new token
                    const retryHeaders = new Headers(originalRequest.headers);
                    retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
                    const retryResponse = await fetch(new Request(url, { ...originalRequest, headers: retryHeaders }));

                    if (!retryResponse.ok) {
                        // If retry also fails, then something else is wrong, or new token is bad
                        throw new Error("Token refresh succeeded, but retried request failed.");
                    }
                    return retryResponse.json() as Promise<T>;

                } catch (refreshError) {
                    processQueue(refreshError, null); // Reject queued requests
                    // If admin refresh fails, clear only admin session info
                    localStorage.removeItem('adminAuthToken');
                    localStorage.removeItem('adminUser');
                    // Do NOT clear authUserType as it might be 'customer' for another tab
                    window.dispatchEvent(new Event('AUTH_LOGOUT_ADMIN')); // Redirect specifically to admin login
                    throw refreshError; // Propagate the refresh error
                } finally {
                    isRefreshing = false;
                }
            } else if (requestAuthType === 'customer') { // This request was made with a customer context
                // Clear only customer session info
                localStorage.removeItem('customerAuthToken');
                localStorage.removeItem('customer');
                // Do NOT clear authUserType, it's not a global indicator for other tabs now
                window.dispatchEvent(new Event('AUTH_LOGOUT_CUSTOMER')); // Redirect to customer login
                throw new Error(errorData.message || 'Sesión expirada. Redirigiendo a login.');
            } else {
                // If it's a 401 for an unclassified/public endpoint (no specific authType)
                // or if it fails after an admin refresh attempt, we should just throw a generic error.
                // For now, let's just throw the error.
                throw new Error(errorData.message || 'Acceso no autorizado.');
            }
        }
        
        // Generic error handling if not 429 or 401, or if refresh failed/not admin
        throw new ApiError(errorData.message || 'Error en la petición a la API', response.status, errorData);
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json() as Promise<T>;
};

export const http = {
    get: <T>(endpoint: string, options?: ApiClientOptions & { authType?: 'admin' | 'customer' }) =>
        apiClient<T>(endpoint, { ...options, method: 'GET' }, options?.authType),

    post: <T>(endpoint: string, body: any, options?: ApiClientOptions & { authType?: 'admin' | 'customer' }) =>
        apiClient<T>(endpoint, { ...options, method: 'POST', body }, options?.authType),

    put: <T>(endpoint: string, body: any, options?: ApiClientOptions & { authType?: 'admin' | 'customer' }) =>
        apiClient<T>(endpoint, { ...options, method: 'PUT', body }, options?.authType),

    patch: <T>(endpoint: string, body: any, options?: ApiClientOptions & { authType?: 'admin' | 'customer' }) =>
        apiClient<T>(endpoint, { ...options, method: 'PATCH', body }, options?.authType),

    delete: <T>(endpoint: string, options?: ApiClientOptions & { authType?: 'admin' | 'customer' }) =>
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }, options?.authType),
};