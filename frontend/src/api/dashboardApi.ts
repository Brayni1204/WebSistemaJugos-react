// src/api/dashboardApi.ts
import { http } from '@/lib/apiClient';

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    revenueLast7Days: number;
    revenueLast30Days: number;
}

export interface SalesDataPoint {
    date: string;
    sales: number;
}

const BASE_ENDPOINT = '/admin/dashboard';

export const getDashboardStats = (): Promise<DashboardStats> => {
    return http.get<DashboardStats>(`${BASE_ENDPOINT}/stats`, { authType: 'admin' });
};

export const getSalesOverTime = (): Promise<SalesDataPoint[]> => {
    return http.get<SalesDataPoint[]>(`${BASE_ENDPOINT}/sales-over-time`, { authType: 'admin' });
};
