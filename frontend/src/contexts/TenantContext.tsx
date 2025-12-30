// src/contexts/TenantContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { http } from '@/lib/apiClient';

interface TenantInfo {
  about_us: any;
  id: number;
  name: string;
  theme_color: string | null;
  theme_secondary_color: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_banner_url: string | null;
  description: string | null;
  address: string | null;
  contact_phone: string | null;
  business_email: string | null;
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

interface TenantContextType {
  tenantInfo: TenantInfo | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const data = await http.get<TenantInfo>('/tenant-info');
        setTenantInfo(data);
      } catch (error) {
        console.error("Failed to fetch tenant info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenantInfo();
  }, []);

  // Effect to update favicon
  useEffect(() => {
    if (tenantInfo) {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      // If favicon_url exists, use it. Otherwise, set to a blank data URI.
      link.href = tenantInfo.favicon_url || 'data:,';
    }
  }, [tenantInfo]);

  const value = { tenantInfo, isLoading };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};