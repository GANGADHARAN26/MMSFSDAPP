import { get, post, put } from './api';
import { Transfer, TransferResponse } from '@/types/transfer';

interface MessageResponse {
  message: string;
}

export const transferService = {
  /**
   * Get all transfers
   * GET /transfers
   * 
   * This endpoint supports filtering, sorting, and pagination
   * The token will be automatically added to the request header
   */
  getTransfers: async (params?: {
    fromBase?: string;
    toBase?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    skip?: number;
  }): Promise<TransferResponse> => {
    return get<TransferResponse>('/transfers', { params });
  },
  
  /**
   * Get transfer by ID
   * GET /transfers/:id
   * 
   * The token will be automatically added to the request header
   */
  getTransferById: async (id: string): Promise<Transfer> => {
    return get<Transfer>(`/transfers/${id}`);
  },
  
  /**
   * Create a new transfer (Admin and LogisticsOfficer)
   * POST /transfers
   * 
   * The token will be automatically added to the request header
   */
  createTransfer: async (transferData: {
    asset: string;
    fromBase: string;
    toBase: string;
    quantity: number;
    notes?: string;
  }): Promise<Transfer> => {
    return post<Transfer>('/transfers', transferData);
  },
  
  /**
   * Approve a transfer (Admin and BaseCommander of destination base)
   * PUT /transfers/:id/approve
   * 
   * The token will be automatically added to the request header
   */
  approveTransfer: async (id: string): Promise<Transfer> => {
    return put<Transfer>(`/transfers/${id}/approve`, {});
  },
  
  /**
   * Cancel a transfer (Admin and LogisticsOfficer)
   * PUT /transfers/:id/cancel
   * 
   * The token will be automatically added to the request header
   */
  cancelTransfer: async (id: string): Promise<Transfer> => {
    return put<Transfer>(`/transfers/${id}/cancel`, {});
  },
  
  /**
   * Get transfers by asset
   * GET /assets/:assetId/transfers
   * 
   * The token will be automatically added to the request header
   */
  getTransfersByAsset: async (assetId: string): Promise<Transfer[]> => {
    return get<Transfer[]>(`/assets/${assetId}/transfers`);
  },
};