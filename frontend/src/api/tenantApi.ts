// src/api/tenantApi.ts
import { http } from '@/lib/apiClient';

// This type should match the `Tenant` prisma model
export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  business_email: string | null;
  contact_phone: string | null;
  description: string | null;
  theme_color: string | null;
  theme_secondary_color: string | null;
  dark_mode_enabled: boolean;
  address: string | null;
  about_us: string | null;
  mision: string | null;
  vision: string | null;
  delivery_cost: number;
  social_links: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  } | null;
}

const BASE_ENDPOINT = '/admin/tenant/settings';

export const getTenantSettings = (): Promise<Tenant> => {
  return http.get<Tenant>(BASE_ENDPOINT, { authType: 'admin' });
};

export const updateTenantSettings = (settingsData: Partial<Tenant>): Promise<Tenant> => {
  return http.put<Tenant>(BASE_ENDPOINT, settingsData, { authType: 'admin' });
};

export const updateTenantImages = (formData: FormData): Promise<Tenant> => {
    return http.put<Tenant>(`${BASE_ENDPOINT}/images`, formData, { authType: 'admin' });
};
