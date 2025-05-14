export interface Asset {
  _id: string;
  name: string;
  type: string;
  base: string;
  openingBalance: number;
  closingBalance: number;
  purchases: number;
  transferIn: number;
  transferOut: number;
  assigned: number;
  expended: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetResponse {
  assets: Asset[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}