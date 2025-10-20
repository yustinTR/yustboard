'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface BrandingSettings {
  brandingEnabled: boolean;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

interface BrandingContextType {
  branding: BrandingSettings;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: {
    brandingEnabled: false,
    logoUrl: null,
    primaryColor: null,
    secondaryColor: null,
  },
  isLoading: true,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [branding, setBranding] = useState<BrandingSettings>({
    brandingEnabled: false,
    logoUrl: null,
    primaryColor: null,
    secondaryColor: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/organization/settings');
      if (response.ok) {
        const data = await response.json();
        const settings = data.settings;

        setBranding({
          brandingEnabled: settings?.brandingEnabled || false,
          logoUrl: settings?.logoUrl || null,
          primaryColor: settings?.primaryColor || null,
          secondaryColor: settings?.secondaryColor || null,
        });

        // Apply CSS custom properties if branding is enabled
        if (settings?.brandingEnabled) {
          document.documentElement.style.setProperty('--branding-primary', settings.primaryColor || '#3B82F6');
          document.documentElement.style.setProperty('--branding-secondary', settings.secondaryColor || '#8B5CF6');
        } else {
          // Reset to defaults
          document.documentElement.style.setProperty('--branding-primary', '#3B82F6');
          document.documentElement.style.setProperty('--branding-secondary', '#8B5CF6');
        }
      }
    } catch (error) {
      console.error('Error fetching branding settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
