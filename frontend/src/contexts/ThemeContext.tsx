import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { http } from '@/lib/apiClient';

// Type for the theme data fetched from the backend
interface ThemeInfo {
  theme_color: string | null;
  theme_secondary_color: string | null;
  dark_mode_enabled: boolean;
}

// Type for the context state
interface ThemeContextType {
  theme: ThemeInfo;
  mode: 'light' | 'dark';
  toggleMode: () => void;
  isLoading: boolean;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define default theme settings
const defaultTheme: ThemeInfo = {
  theme_color: '#84CC16', // Default primary color (lime-500)
  theme_secondary_color: '#166534', // Default secondary color (green-800)
  dark_mode_enabled: true,
};

// Create the provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeInfo>(defaultTheme);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Effect to fetch tenant-specific theme info
  useEffect(() => {
    const fetchThemeInfo = async () => {
      try {
        // NOTE: Ensure your apiClient (http) is configured to handle base URLs
        // and tenancy correctly (e.g., by setting a custom header or using the subdomain).
        const tenantInfo = await http.get<ThemeInfo>('/tenant-info');
        if (tenantInfo) {
          setTheme({
            theme_color: tenantInfo.theme_color || defaultTheme.theme_color,
            theme_secondary_color: tenantInfo.theme_secondary_color || defaultTheme.theme_secondary_color,
            dark_mode_enabled: tenantInfo.dark_mode_enabled,
          });
        }
      } catch (error) {
        console.error("Failed to fetch tenant theme info, using default theme.", error);
        // If the API fails, we still proceed with the default theme.
      } finally {
        setIsLoading(false);
      }
    };
    fetchThemeInfo();
  }, []);

  // Effect to manage the dark/light mode preference
  useEffect(() => {
    const localMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    const root = window.document.documentElement;

    if (localMode) {
      setMode(localMode);
      if (localMode === 'dark') {
        root.classList.add('dark');
      }
    } else if (theme.dark_mode_enabled && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
      root.classList.add('dark');
    }
  }, [theme.dark_mode_enabled]);

  // Inject theme colors as CSS variables whenever the theme data changes.
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme.theme_color) {
      root.style.setProperty('--theme-primary', theme.theme_color);
    }
    if (theme.theme_secondary_color) {
      root.style.setProperty('--theme-secondary', theme.theme_secondary_color);
    }
    // You can add more CSS variable injections here for other theme properties.
  }, [theme]);

  // Function to toggle between light and dark mode
  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    const root = window.document.documentElement;
    
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
    
    if (newMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  const value = { theme, mode, toggleMode, isLoading };

  return (
    <ThemeContext.Provider value={value}>
      {/* We render children only after the initial theme is loaded to prevent flash of unstyled content */}
      {!isLoading && children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
