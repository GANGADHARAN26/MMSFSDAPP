import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isInitialized,
    setUser,
    setIsAuthenticated,
    setIsInitialized,
  } = useAuthStore();
  
  // Initialize auth state
  useEffect(() => {
    console.log("Auth initialization started");
    
    // Skip if already initialized
    if (isInitialized) {
      console.log("Already initialized, skipping");
      return;
    }
    
    const initAuth = async () => {
      try {
        // Always start with a clean state - no automatic login
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        
        // If not on login page, redirect to login
        if (router.pathname !== '/login' && 
            router.pathname !== '/register' && 
            router.pathname !== '/forgot-password') {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log(`Login attempt with username: ${username}`);
      
      // Call the login API endpoint at /auth/login
      const response = await authService.login(username, password);
      
      // Store the token in localStorage for use in all subsequent API requests
      localStorage.setItem('token', response.token);
      
      // Update the auth state with the user information from the response
      setUser(response.user);
      setIsAuthenticated(true);
      
      return Promise.resolve(response.user);
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing auth state on login failure
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      console.log("Logout initiated");
      
      // Call the logout API endpoint
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local state regardless of API success
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/login');
    }
  };

  const register = async (userData: any) => {
    console.log("Register initiated with data:", userData);
    // In production, uncomment the API call
    // await authService.register(userData);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitialized,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};