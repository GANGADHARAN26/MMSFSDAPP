export interface Purchase {
  _id: string;
  asset?: string;
  assetName: string;
  assetType: string;
  base: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  purchaseDate: string;
  deliveryDate?: string;
  status: 'Ordered' | 'Delivered' | 'Cancelled';
  purchasedBy: {
    _id: string;
    username: string;
    fullName: string;
  };
  approvedBy?: {
    _id: string;
    username: string;
    fullName: string;
  };
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseResponse {
  purchases: Purchase[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}