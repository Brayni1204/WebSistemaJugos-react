// src/config/permissions.ts

export const PERMISSIONS = [
    // User Management
    'view-users',
    'manage-users',
    
    // Role & Permission Management
    'view-roles',
    'manage-roles', 

    // Product Management
    'view-products',
    'manage-products',

    // Category Management
    'view-categories',
    'manage-categories',

    // Order Management
    'view-orders',
    'manage-orders',

    // Table Management
    'view-mesas',
    'manage-mesas',

    // Supplier Management
    'view-proveedores',
    'manage-proveedores',

    // Purchase Management
    'view-gastos',
    'manage-gastos',

    // Tenant Settings
    'manage-settings',
] as const;

export type Permission = typeof PERMISSIONS[number];