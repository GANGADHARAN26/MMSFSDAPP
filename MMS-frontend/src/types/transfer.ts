export interface Transfer {
  _id: string;
  asset: string;
  assetName: string;
  assetType: string;
  fromBase: string;
  toBase: string;
  quantity: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  transferredBy: {
    _id: string;
    username: string;
    fullName: string;
  };
  approvedBy?: {
    _id: string;
    username: string;
    fullName: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferResponse {
  transfers: Transfer[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}