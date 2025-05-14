import { Transfer } from './transfer';
import { Purchase } from './purchase';
import { Assignment } from './assignment';
import { Expenditure } from './expenditure';

export interface AssetByType {
  type: string;
  count: number;
  openingBalance: number;
  closingBalance: number;
  assigned: number;
  available: number;
}

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

export interface DashboardData {
  summary: DashboardSummary;
  assetsByType: AssetByType[];
  recentTransfers: Partial<Transfer>[];
  recentPurchases: Partial<Purchase>[];
  recentAssignments: Partial<Assignment>[];
  recentExpenditures: Partial<Expenditure>[];
}