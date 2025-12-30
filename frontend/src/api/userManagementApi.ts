// src/api/userManagementApi.ts
import { http } from '@/lib/apiClient';
import type { Role } from './roleApi';

// This is the shape of the user object managed in the admin panel
export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  // other fields not directly managed here might exist
}

export type UserPayload = {
    name: string;
    email: string;
    roleIds: number[];
    password?: string;
    pin?: string;
}

const BASE_ENDPOINT = '/admin/users';

export const getUsers = (): Promise<ManagedUser[]> => {
  return http.get<ManagedUser[]>(BASE_ENDPOINT, { authType: 'admin' });
};

export const createUser = (userData: UserPayload): Promise<ManagedUser> => {
    return http.post<ManagedUser>(BASE_ENDPOINT, userData, { authType: 'admin' });
};

export const updateUser = (id: number, userData: Partial<UserPayload>): Promise<ManagedUser> => {
    return http.put<ManagedUser>(`${BASE_ENDPOINT}/${id}`, userData, { authType: 'admin' });
};

// Deprecated, but keeping for reference if needed elsewhere. The new updateUser is more flexible.
export const updateUserRoles = (id: number, roleIds: number[]): Promise<ManagedUser> => {
    return http.put<ManagedUser>(`${BASE_ENDPOINT}/${id}/roles`, { roleIds }, { authType: 'admin' });
};