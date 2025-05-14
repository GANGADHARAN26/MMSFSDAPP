import { get, post, put } from './api';
import { Expenditure, ExpenditureResponse } from '@/types/expenditure';

export const expenditureService = {
  getExpenditures: async (params?: any): Promise<ExpenditureResponse> => {
    return get<ExpenditureResponse>('/expenditures', { params });
  },
  
  getExpenditureById: async (id: string): Promise<Expenditure> => {
    return get<Expenditure>(`/expenditures/${id}`);
  },
  
  createExpenditure: async (expenditureData: Partial<Expenditure>): Promise<Expenditure> => {
    return post<Expenditure>('/expenditures', expenditureData);
  },
  
  updateExpenditure: async (id: string, expenditureData: Partial<Expenditure>): Promise<Expenditure> => {
    return put<Expenditure>(`/expenditures/${id}`, expenditureData);
  },
  
  getExpendituresByAsset: async (assetId: string): Promise<Expenditure[]> => {
    return get<Expenditure[]>(`/expenditures/asset/${assetId}`);
  },
  
  getExpendituresByOperation: async (operationId: string): Promise<Expenditure[]> => {
    return get<Expenditure[]>(`/expenditures/operation/${operationId}`);
  },
};