export interface Assignment {
  _id: string;
  asset: string;
  assetName: string;
  assetType: string;
  base: string;
  quantity: number;
  assignedTo: {
    name: string;
    rank: string;
    id: string;
  };
  assignedBy: {
    _id: string;
    username: string;
    fullName: string;
  };
  purpose: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Returned' | 'Lost' | 'Damaged';
  returnedQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentResponse {
  assignments: Assignment[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}