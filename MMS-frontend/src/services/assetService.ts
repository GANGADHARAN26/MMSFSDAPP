import { get, post, put, del } from './api';
import { Asset } from '@/types/asset';

interface AssetResponse {
  assets: Asset[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

interface MessageResponse {
  message: string;
}

export const assetService = {
  /**
   * Get all assets
   * GET /assets
   * 
   * This endpoint supports filtering, sorting, and pagination
   * The token will be automatically added to the request header
   */
  getAssets: async (params?: {
    base?: string;
    type?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    skip?: number;
  }): Promise<AssetResponse> => {
    return get<AssetResponse>('/assets', { params });
  },
  
  /**
   * Get asset by ID
   * GET /assets/:id
   * 
   * The token will be automatically added to the request header
   */
  getAssetById: async (id: string): Promise<Asset> => {
    return get<Asset>(`/assets/${id}`);
  },
  
  /**
   * Create a new asset (Admin and LogisticsOfficer)
   * POST /assets
   * 
   * The token will be automatically added to the request header
   */
  createAsset: async (assetData: {
    name: string;
    type: string;
    base: string;
    openingBalance: number;
  }): Promise<Asset> => {
    return post<Asset>('/assets', assetData);
  },
  
  /**
   * Update asset (Admin and LogisticsOfficer)
   * PUT /assets/:id
   * 
   * The token will be automatically added to the request header
   */
  updateAsset: async (id: string, assetData: {
    name?: string;
    type?: string;
    openingBalance?: number;
  }): Promise<Asset> => {
    return put<Asset>(`/assets/${id}`, assetData);
  },
  
  /**
   * Delete asset (Admin only)
   * DELETE /assets/:id
   * 
   * The token will be automatically added to the request header
   */
  deleteAsset: async (id: string): Promise<MessageResponse> => {
    return del<MessageResponse>(`/assets/${id}`);
  },
  
  /**
   * Get assets by base
   * GET /assets/base/:base
   * 
   * The token will be automatically added to the request header
   */
  getAssetsByBase: async (base: string): Promise<Asset[]> => {
    return get<Asset[]>(`/assets/base/${base}`);
  },
  
  /**
   * Get assets by type
   * GET /assets/type/:type
   * 
   * The token will be automatically added to the request header
   */
  getAssetsByType: async (type: string): Promise<Asset[]> => {
    return get<Asset[]>(`/assets/type/${type}`);
  },
};