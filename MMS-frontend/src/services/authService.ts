import { get, post, put } from './api';
import { User } from '@/types/user';

interface LoginResponse {
  user: User;
  token: string;
}

interface MessageResponse {
  message: string;
}

export const authService = {
  /**
   * Login with username and password
   * POST /auth/login
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    // Make a direct call to the /auth/login endpoint
    return post<LoginResponse>('/auth/login', { username, password });
  },
  
  /**
   * Logout current user
   * POST /auth/logout
   */
  logout: async (): Promise<MessageResponse> => {
    return post<MessageResponse>('/auth/logout');
  },
  
  /**
   * Logout from all devices
   * POST /auth/logout-all
   */
  logoutAll: async (): Promise<MessageResponse> => {
    return post<MessageResponse>('/auth/logout-all');
  },
  
  /**
   * Register a new user (Admin only)
   * POST /auth/register
   */
  register: async (userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
    assignedBase?: string;
  }): Promise<User> => {
    return post<User>('/auth/register', userData);
  },
  
  /**
   * Get current user profile
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    return get<User>('/auth/me');
  },
  
  /**
   * Change password
   * PUT /auth/change-password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<MessageResponse> => {
    return put<MessageResponse>('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
  },
  
  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<MessageResponse> => {
    return post<MessageResponse>('/auth/forgot-password', { email });
  },
  
  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  resetPassword: async (token: string, newPassword: string): Promise<MessageResponse> => {
    return post<MessageResponse>('/auth/reset-password', { token, newPassword });
  },
};