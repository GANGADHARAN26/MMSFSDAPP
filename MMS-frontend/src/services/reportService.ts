import { get } from './api';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  base?: string;
  assetType?: string;
  format?: 'json' | 'csv' | 'pdf';
}

export const reportService = {
  getAssetInventoryReport: async (params?: ReportParams): Promise<any> => {
    return get('/reports/inventory', { params });
  },
  
  getAssetMovementReport: async (params?: ReportParams): Promise<any> => {
    return get('/reports/movement', { params });
  },
  
  getTransferReport: async (params?: ReportParams): Promise<any> => {
    return get('/reports/transfers', { params });
  },
  
  getPurchaseReport: async (params?: ReportParams): Promise<any> => {
    return get('/reports/purchases', { params });
  },
  
  getAssignmentReport: async (params?: ReportParams): Promise<any> => {
    return get('/reports/assignments', { params });
  },
  
  getExpenditureReport: async (params?: ReportParams): Promise<any> => {
    return get('/reports/expenditures', { params });
  },
  
  getBaseReport: async (baseId: string, params?: ReportParams): Promise<any> => {
    return get(`/reports/base/${baseId}`, { params });
  },
  
  getAssetReport: async (assetId: string, params?: ReportParams): Promise<any> => {
    return get(`/reports/asset/${assetId}`, { params });
  },
  
  getCustomReport: async (reportConfig: any): Promise<any> => {
    return get('/reports/custom', { params: reportConfig });
  },
};