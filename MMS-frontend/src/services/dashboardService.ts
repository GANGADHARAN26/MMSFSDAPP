import { get } from './api';

export interface DashboardSummary {
  totalAssets: number;
  totalOpeningBalance: number;
  totalClosingBalance: number;
  totalPurchases: number;
  totalTransferIn: number;
  totalTransferOut: number;
  totalAssigned: number;
  totalExpended: number;
  totalAvailable: number;
}

export interface AssetTypeStats {
  type: string;
  count: number;
  openingBalance: number;
  closingBalance: number;
  assigned: number;
  available: number;
}

export interface RecentTransfer {
  _id: string;
  assetName: string;
  fromBase: string;
  toBase: string;
  quantity: number;
  status: string;
  createdAt: string;
}

export interface RecentPurchase {
  _id: string;
  assetName: string;
  base: string;
  quantity: number;
  status: string;
  purchaseDate: string;
}

export interface RecentAssignment {
  _id: string;
  assetName: string;
  base: string;
  quantity: number;
  assignedTo: {
    name: string;
    id: string;
  };
  status: string;
  startDate: string;
}

export interface RecentExpenditure {
  _id: string;
  assetName: string;
  base: string;
  quantity: number;
  reason: string;
  expenditureDate: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  assetsByType: AssetTypeStats[];
  recentTransfers: RecentTransfer[];
  recentPurchases: RecentPurchase[];
  recentAssignments: RecentAssignment[];
  recentExpenditures: RecentExpenditure[];
}

export const dashboardService = {
  getDashboardData: async (params?: any): Promise<DashboardData> => {
    return get<DashboardData>('/dashboard', { params });
  }
};