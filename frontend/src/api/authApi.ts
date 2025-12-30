// src/api/authApi.ts
import { http } from '@/lib/apiClient';
import type { User } from '@/contexts/AuthContext'; // Using User type from AuthContext

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    userEmail: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export interface VerifyEmailResponse {
    message: string;
    token: string;
    user: User;
}

const AUTH_BASE_ENDPOINT = '/auth';

export const registerUser = (payload: RegisterPayload): Promise<RegisterResponse> => {
    return http.post<RegisterResponse>(`${AUTH_BASE_ENDPOINT}/register`, payload);
};

export const loginUser = (payload: LoginPayload): Promise<LoginResponse> => {
    return http.post<LoginResponse>(`${AUTH_BASE_ENDPOINT}/login`, payload);
};

export const verifyUserEmail = (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
    return http.post<VerifyEmailResponse>(`${AUTH_BASE_ENDPOINT}/verify-email`, payload);
};
