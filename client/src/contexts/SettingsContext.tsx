import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface UserSettings {
  // Profile settings
  profile: {
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    timezone: string;
    language: string;
    country: string;
  };

  // Notification preferences (different for admin vs writer)
  notifications: {
    email: boolean; // Admin only - writers must receive emails
    sms: boolean; // Admin only - writers must receive SMS
    whatsapp: boolean;
    push: boolean;
    orderUpdates: boolean;
    paymentAlerts: boolean;
    systemNotifications: boolean;
    marketingEmails: boolean; // Admin only
    weeklyReports: boolean;
  };

  // Privacy settings (different for admin vs writer)
  privacy: {
    profileVisibility: 'public' | 'private' | 'writers_only'; // Writers forced to 'public'
    showOnlineStatus: boolean;
    sharePerformanceStats: boolean;
    allowDirectMessages: boolean;
  };

  // Work preferences (writers only)
  workPreferences?: {
    maxConcurrentOrders: number;
    preferredSubjects: string[];
    workingHours: {
      start: string;
      end: string;
      timezone: string;
    };
    autoAcceptOrders: boolean;
    minimumOrderValue: number;
  };

  // Payment settings (different for admin vs writer)
  writerPayment?: {
    // Writer payment settings - for receiving payments
    preferredMethod: 'bank_transfer' | 'mobile_money' | 'paypal' | 'crypto';
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      swiftCode?: string;
    };
    mobileMoneyDetails?: {
      provider: 'Safaricom' | 'Airtel' | 'Telkom';
      phoneNumber: string;
    };
    paypalEmail?: string;
    cryptoWallet?: {
      type: 'Bitcoin' | 'Ethereum' | 'USDT';
      address: string;
    };
  };

  adminPayment?: {
    // Admin payment settings - for platform management
    platformBankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      swiftCode?: string;
    };
    paymentGateways: {
      stripe: { enabled: boolean; publicKey?: string; secretKey?: string; };
      paypal: { enabled: boolean; clientId?: string; clientSecret?: string; };
      mpesa: { enabled: boolean; consumerKey?: string; consumerSecret?: string; };
    };
    autoPayoutSettings: {
      enabled: boolean;
      minimumAmount: number;
      frequency: 'daily' | 'weekly' | 'monthly';
    };
  };

  // Security settings
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number; // in minutes
    allowedIPs?: string[];
    passwordChangeRequired: boolean;
    lastPasswordChange?: string;
  };

  // Display preferences
  display: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'sw';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    currency: 'USD' | 'KES' | 'EUR' | 'GBP';
    compactMode: boolean;
  };

  // Admin-specific system settings
  systemSettings?: {
    autoApproveOrders: boolean;
    defaultOrderDeadline: number; // in days
    minimumWriterRating: number;
    platformCommission: number; // percentage
    autoPaymentProcessing: boolean;
    requireOrderApproval: boolean;
    maintenanceMode: boolean;
    lowBalanceThreshold: number;
    systemNotifications: {
      lowBalance: boolean;
      overdueOrders: boolean;
      writerInactivity: boolean;
      systemErrors: boolean;
    };
  };
}

interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<boolean>;
  applyDisplaySettings: (displaySettings: UserSettings['display']) => void;
  canModifyNotifications: () => boolean;
  canModifyPrivacy: () => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getDefaultSettings = (userRole: 'admin' | 'writer', userName: string, userEmail: string): UserSettings => {
  const baseSettings: UserSettings = {
    profile: {
      name: userName,
      email: userEmail,
      timezone: 'Africa/Nairobi',
      language: 'en',
      country: 'Kenya'
    },
    notifications: {
      email: true, // Writers cannot disable this
      sms: true, // Writers cannot disable this
      whatsapp: true,
      push: true,
      orderUpdates: true,
      paymentAlerts: true,
      systemNotifications: true,
      marketingEmails: userRole === 'admin', // Only admins get marketing emails by default
      weeklyReports: true
    },
    privacy: {
      profileVisibility: userRole === 'writer' ? 'public' : 'writers_only', // Writers must be public
      showOnlineStatus: true,
      sharePerformanceStats: true,
      allowDirectMessages: true
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 60,
      passwordChangeRequired: false
    },
    display: {
      theme: 'light',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'KES',
      compactMode: false
    }
  };

  if (userRole === 'writer') {
    baseSettings.workPreferences = {
      maxConcurrentOrders: 3,
      preferredSubjects: [],
      workingHours: {
        start: '08:00',
        end: '18:00',
        timezone: 'Africa/Nairobi'
      },
      autoAcceptOrders: false,
      minimumOrderValue: 500
    };
    baseSettings.writerPayment = {
      preferredMethod: 'mobile_money'
    };
  }

  if (userRole === 'admin') {
    baseSettings.adminPayment = {
      platformBankDetails: {
        bankName: '',
        accountNumber: '',
        accountName: '',
        swiftCode: ''
      },
      paymentGateways: {
        stripe: { enabled: false },
        paypal: { enabled: false },
        mpesa: { enabled: false }
      },
      autoPayoutSettings: {
        enabled: false,
        minimumAmount: 1000,
        frequency: 'weekly'
      }
    };
    baseSettings.systemSettings = {
      autoApproveOrders: false,
      defaultOrderDeadline: 7,
      minimumWriterRating: 3.0,
      platformCommission: 15,
      autoPaymentProcessing: false,
      requireOrderApproval: true,
      maintenanceMode: false,
      lowBalanceThreshold: 50000,
      systemNotifications: {
        lowBalance: true,
        overdueOrders: true,
        writerInactivity: true,
        systemErrors: true
      }
    };
  }

  return baseSettings;
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings when user changes
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const storageKey = `settings_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const parsedSettings = JSON.parse(stored);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('Failed to parse stored settings:', error);
          const defaultSettings = getDefaultSettings(user.role as 'admin' | 'writer', user.name, user.email);
          setSettings(defaultSettings);
        }
      } else {
        const defaultSettings = getDefaultSettings(user.role as 'admin' | 'writer', user.name, user.email);
        setSettings(defaultSettings);
      }
      setIsLoading(false);
    } else {
      setSettings(null);
      setIsLoading(false);
    }
  }, [user]);

  // Apply display settings to document
  const applyDisplaySettings = useCallback((displaySettings: UserSettings['display']) => {
    // Apply theme
    const root = document.documentElement;
    if (displaySettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (displaySettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply compact mode
    if (displaySettings.compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }

    // Store language preference for i18n
    localStorage.setItem('app_language', displaySettings.language);
    localStorage.setItem('app_currency', displaySettings.currency);
    localStorage.setItem('app_date_format', displaySettings.dateFormat);
    localStorage.setItem('app_time_format', displaySettings.timeFormat);
  }, []);

  // Apply display settings when they change
  useEffect(() => {
    if (settings?.display) {
      applyDisplaySettings(settings.display);
    }
  }, [settings?.display, applyDisplaySettings]);

  const canModifyNotifications = useCallback(() => {
    return user?.role === 'admin';
  }, [user?.role]);

  const canModifyPrivacy = useCallback(() => {
    return user?.role === 'admin';
  }, [user?.role]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>): Promise<boolean> => {
    if (!user || !settings) return false;

    try {
      // Enforce restrictions for writers
      if (user.role === 'writer') {
        // Writers cannot disable email/SMS notifications
        if (updates.notifications) {
          updates.notifications = {
            ...updates.notifications,
            email: true,
            sms: true,
            marketingEmails: false // Writers don't get marketing emails
          };
        }

        // Writers must have public profile
        if (updates.privacy) {
          updates.privacy = {
            ...updates.privacy,
            profileVisibility: 'public'
          };
        }

        // Remove admin-only settings
        delete updates.adminPayment;
        delete updates.systemSettings;
      }

      // Enforce restrictions for admins
      if (user.role === 'admin') {
        // Remove writer-only settings
        delete updates.workPreferences;
        delete updates.writerPayment;
      }

      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      // Save to localStorage
      const storageKey = `settings_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newSettings));

      // Apply display settings immediately if they were updated
      if (updates.display) {
        applyDisplaySettings(newSettings.display);
      }

      // Apply security settings
      if (updates.security?.sessionTimeout) {
        // Set session timeout
        localStorage.setItem('session_timeout', updates.security.sessionTimeout.toString());
      }

      showToast({
        type: 'success',
        title: 'Settings Updated',
        message: 'Your settings have been saved successfully.'
      });

      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save your settings. Please try again.'
      });
      return false;
    }
  }, [user, settings, applyDisplaySettings, showToast]);

  const resetSettings = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const defaultSettings = getDefaultSettings(user.role as 'admin' | 'writer', user.name, user.email);
      setSettings(defaultSettings);

      const storageKey = `settings_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(defaultSettings));

      applyDisplaySettings(defaultSettings.display);

      showToast({
        type: 'success',
        title: 'Settings Reset',
        message: 'Your settings have been reset to default values.'
      });

      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      showToast({
        type: 'error',
        title: 'Reset Failed',
        message: 'Failed to reset your settings. Please try again.'
      });
      return false;
    }
  }, [user, applyDisplaySettings, showToast]);

  const exportSettings = useCallback((): string => {
    if (!settings) return '{}';
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback(async (settingsJson: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const importedSettings = JSON.parse(settingsJson) as UserSettings;
      
      // Validate the imported settings structure
      if (!importedSettings.profile || !importedSettings.display) {
        throw new Error('Invalid settings format');
      }

      // Apply role restrictions to imported settings
      await updateSettings(importedSettings);

      showToast({
        type: 'success',
        title: 'Settings Imported',
        message: 'Your settings have been imported successfully.'
      });

      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      showToast({
        type: 'error',
        title: 'Import Failed',
        message: 'Failed to import settings. Please check the file format.'
      });
      return false;
    }
  }, [user, updateSettings, showToast]);

  const contextValue = React.useMemo(() => ({
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    applyDisplaySettings,
    canModifyNotifications,
    canModifyPrivacy,
  }), [settings, isLoading, updateSettings, resetSettings, exportSettings, importSettings, applyDisplaySettings, canModifyNotifications, canModifyPrivacy]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}