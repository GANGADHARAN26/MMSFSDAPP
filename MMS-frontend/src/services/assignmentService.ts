import { get, post, put } from './api';
import { Assignment, AssignmentResponse } from '@/types/assignment';

export const assignmentService = {
  getAssignments: async (params?: any): Promise<AssignmentResponse> => {
    return get<AssignmentResponse>('/assignments', { params });
  },
  
  getAssignmentById: async (id: string): Promise<Assignment> => {
    return get<Assignment>(`/assignments/${id}`);
  },
  
  createAssignment: async (assignmentData: Partial<Assignment>): Promise<Assignment> => {
    return post<Assignment>('/assignments', assignmentData);
  },
  
  updateAssignment: async (id: string, assignmentData: Partial<Assignment>): Promise<Assignment> => {
    return put<Assignment>(`/assignments/${id}`, assignmentData);
  },
  
  returnAssignment: async (id: string, returnData: { returnedQuantity: number, notes?: string }): Promise<Assignment> => {
    return put<Assignment>(`/assignments/${id}/return`, returnData);
  },
  
  updateAssignmentStatus: async (id: string, statusData: { status: string, notes?: string }): Promise<Assignment> => {
    return put<Assignment>(`/assignments/${id}/status`, statusData);
  },
  
  cancelAssignment: async (id: string): Promise<Assignment> => {
    return put<Assignment>(`/assignments/${id}/cancel`);
  },
  
  getAssignmentsByAsset: async (assetId: string): Promise<Assignment[]> => {
    return get<Assignment[]>(`/assignments/asset/${assetId}`);
  },
  
  getAssignmentsByPerson: async (personId: string): Promise<Assignment[]> => {
    return get<Assignment[]>(`/assignments/person/${personId}`);
  },
};