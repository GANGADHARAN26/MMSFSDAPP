import { get, post, put, del } from './api';
import { User } from '@/types/user';

interface MessageResponse {
  message: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'BaseCommander' | 'LogisticsOfficer';
  assignedBase?: string;
}

export const userService = {
  /**
   * Get all users (Admin only)
   * GET /users
   * 
   * The token will be automatically added to the request header
   */
  getUsers: async (params?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    skip?: number;
  }): Promise<User[]> => {
    return get<User[]>('/users', { params });
  },
  
  /**
   * Get user by ID (Admin only)
   * GET /users/:id
   * 
   * The token will be automatically added to the request header
   */
  getUserById: async (id: string): Promise<User> => {
    return get<User>(`/users/${id}`);
  },
  
  /**
   * Create a new user (Admin only)
   * POST /auth/register
   * 
   * The token will be automatically added to the request header
   */
  createUser: async (userData: CreateUserData): Promise<User> => {
    return post<User>('/auth/register', userData);
  },
  
  /**
   * Update user (Admin only)
   * PUT /users/:id
   * 
   * The token will be automatically added to the request header
   */
  updateUser: async (id: string, userData: {
    fullName?: string;
    email?: string;
    role?: string;
    assignedBase?: string;
    active?: boolean;
  }): Promise<User> => {
    return put<User>(`/users/${id}`, userData);
  },
  
  /**
   * Delete (deactivate) user (Admin only)
   * DELETE /users/:id
   * 
   * The token will be automatically added to the request header
   */
  deleteUser: async (id: string): Promise<MessageResponse> => {
    return del<MessageResponse>(`/users/${id}`);
  },
  
  /**
   * Get users by base (Admin and BaseCommander)
   * GET /users/base/:base
   * 
   * The token will be automatically added to the request header
   */
  getUsersByBase: async (base: string): Promise<User[]> => {
    return get<User[]>(`/users/base/${base}`);
  },
};