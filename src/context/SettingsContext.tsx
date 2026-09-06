import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings } from '../types';
import { settingsApi } from '../services/api';

const DEFAULT_SETTINGS: AppSettings = {
  app_name: 'RIT',
  company_name: 'RIT Precision Suite Pvt. Ltd.',
  logo_url: '/rit-logo.svg',
  default_currency: '₹',
  default_country: 'India',
  default_label_width: 100,
  default_label_height: 150,
};

interface SettingsContextValue {
  settings: AppSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<AppSettings | null>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.get();
      setSettings({ ...DEFAULT_SETTINGS, ...data });
      return data;
    } catch (err) {
      console.error('Failed to load application settings', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(
    () => ({ settings, isLoading, refreshSettings, setSettings }),
    [settings, isLoading]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
