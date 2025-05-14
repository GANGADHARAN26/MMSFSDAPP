import { get, put } from './api';

export interface SystemSettings {
  systemName: string;
  organizationName: string;
  logo: string;
  theme: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  assetTypes: string[];
  bases: string[];
}

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    return get<SystemSettings>('/settings');
  },
  
  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    return put<SystemSettings>('/settings', settings);
  },
  
  getAssetTypes: async (): Promise<string[]> => {
    return get<string[]>('/settings/asset-types');
  },
  
  getBases: async (): Promise<string[]> => {
    return get<string[]>('/settings/bases');
  },
  
  addAssetType: async (type: string): Promise<string[]> => {
    return put<string[]>('/settings/asset-types', { type });
  },
  
  addBase: async (base: string): Promise<string[]> => {
    return put<string[]>('/settings/bases', { base });
  },
  
  toggleMaintenanceMode: async (enabled: boolean): Promise<{ maintenanceMode: boolean }> => {
    return put<{ maintenanceMode: boolean }>('/settings/maintenance-mode', { enabled });
  },
};