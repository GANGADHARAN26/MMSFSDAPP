import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import Layout from '@/components/layout/Layout';
import LoadingScreen from '@/components/ui/LoadingScreen';

import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Initialize auth state for development
  useEffect(() => {
    console.log("App mounted, auth state:", { isInitialized, isAuthenticated });
    
    // Give a short delay to ensure auth state is properly initialized
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isInitialized, isAuthenticated]);

  // Handle authentication redirects
  useEffect(() => {
    if (loading) return;
    
    console.log("Checking auth redirects:", { isInitialized, isAuthenticated, path: router.pathname });
    
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    const path = router.pathname;
    
    if (!isAuthenticated && !publicPaths.includes(path)) {
      console.log("Redirecting to login");
      router.push('/login');
    } else if (isAuthenticated && publicPaths.includes(path)) {
      console.log("Redirecting to dashboard");
      router.push('/dashboard');
    }
  }, [loading, isInitialized, isAuthenticated, router]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </AuthProvider>
  );
}