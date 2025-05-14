import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it as a Bearer token in the Authorization header
    if (token) {
      // Make sure headers object exists
      config.headers = config.headers || {};
      
      // Add the Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    
    if (response) {
      // Handle different error status codes
      switch (response.status) {
        case 401:
          // Just clear the token without automatic redirect
          localStorage.removeItem('token');
          // Only show the message if not already on login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Your session has expired. Please log in again.');
            // Redirect to login page
            window.location.replace('/login');
          }
          break;
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          // Not found
          toast.error('The requested resource was not found.');
          break;
        case 500:
          // Server error
          toast.error('An unexpected error occurred. Please try again later.');
          break;
        default:
          // Other errors
         const errorMessage = (response.data as any).error || (response.data as any).message || 'An error occurred';

          toast.error(errorMessage);
      }
    } else {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Generic GET request
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T> | T> = await api.get(url, config);
  
  // Check if the response follows the ApiResponse format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  
  // Otherwise, return the data directly
  return response.data as T;
};

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T> | T> = await api.post(url, data, config);
  
  // Check if the response follows the ApiResponse format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  
  // Otherwise, return the data directly
  return response.data as T;
};

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T> | T> = await api.put(url, data, config);
  
  // Check if the response follows the ApiResponse format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  
  // Otherwise, return the data directly
  return response.data as T;
};

// Generic DELETE request
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T> | T> = await api.delete(url, config);
  
  // Check if the response follows the ApiResponse format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as ApiResponse<T>).data as T;
  }
  
  // Otherwise, return the data directly
  return response.data as T;
};

export default api;