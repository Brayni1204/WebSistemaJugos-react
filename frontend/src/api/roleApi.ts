// src/api/roleApi.ts
import { http } from '@/lib/apiClient';

export interface Permission {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    _count?: {
        users: number;
        permissions: number;
    };
}

const BASE_ENDPOINT = '/admin/roles';
const PERM_ENDPOINT = '/admin/permissions';

// Roles
export const getRoles = (): Promise<Role[]> => {
    return http.get<Role[]>(BASE_ENDPOINT, { authType: 'admin' });
};

export const getRoleById = (id: number): Promise<Role> => {
    return http.get<Role>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

export const createRole = (name: string): Promise<Role> => {
    return http.post<Role>(BASE_ENDPOINT, { name }, { authType: 'admin' });
};

export const updateRole = (id: number, name: string, permissionIds: number[]): Promise<Role> => {
    return http.put<Role>(`${BASE_ENDPOINT}/${id}`, { name, permissionIds }, { authType: 'admin' });
};

export const deleteRole = (id: number): Promise<null> => {
    return http.delete<null>(`${BASE_ENDPOINT}/${id}`, { authType: 'admin' });
};

// Permissions
export const getAllPermissions = (): Promise<Permission[]> => {
    return http.get<Permission[]>(PERM_ENDPOINT, { authType: 'admin' });
};
