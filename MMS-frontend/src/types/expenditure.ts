export interface Expenditure {
  _id: string;
  asset: string;
  assetName: string;
  assetType: string;
  base: string;
  quantity: number;
  reason: 'Training' | 'Operation' | 'Maintenance' | 'Damaged' | 'Lost' | 'Other';
  authorizedBy: {
    _id: string;
    username: string;
    fullName: string;
  };
  expendedBy: {
    name: string;
    rank: string;
    id: string;
  };
  operationName?: string;
  expenditureDate: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenditureResponse {
  expenditures: Expenditure[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}