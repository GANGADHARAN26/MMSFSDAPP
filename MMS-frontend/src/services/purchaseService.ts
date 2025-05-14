import { get, post, put } from './api';
import { Purchase, PurchaseResponse } from '@/types/purchase';

export const purchaseService = {
  getPurchases: async (params?: any): Promise<PurchaseResponse> => {
    return get<PurchaseResponse>('/purchases', { params });
  },
  
  getPurchaseById: async (id: string): Promise<Purchase> => {
    return get<Purchase>(`/purchases/${id}`);
  },
  
  createPurchase: async (purchaseData: Partial<Purchase>): Promise<Purchase> => {
    return post<Purchase>('/purchases', purchaseData);
  },
  
  updatePurchase: async (id: string, purchaseData: Partial<Purchase>): Promise<Purchase> => {
    return put<Purchase>(`/purchases/${id}`, purchaseData);
  },
  
  markAsDelivered: async (id: string): Promise<Purchase> => {
    return put<Purchase>(`/purchases/${id}/deliver`);
  },
  
  cancelPurchase: async (id: string): Promise<Purchase> => {
    return put<Purchase>(`/purchases/${id}/cancel`);
  },
  
  getPurchasesByAsset: async (assetId: string): Promise<Purchase[]> => {
    return get<Purchase[]>(`/purchases/asset/${assetId}`);
  },
};