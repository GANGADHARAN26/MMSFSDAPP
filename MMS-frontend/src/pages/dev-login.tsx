import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/user';
import Head from 'next/head';

// This is a development-only page to bypass the authentication flow
// Remove this in production

const DevLogin = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated, setIsInitialized } = useAuthStore();

  // Auto-login with a mock user
  useEffect(() => {
    console.log("Dev login page - setting mock user");
    
    // Create mock user
    const mockUser: User = {
      _id: '1',
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'Admin',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Set auth state
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsInitialized(true);
    
    // Redirect to dashboard
    router.push('/dashboard');
  }, [setUser, setIsAuthenticated, setIsInitialized, router]);

  return (
    <>
      <Head>
        <title>Dev Login | Military Asset Management</title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Development Login</h1>
        <p className="text-gray-600 mb-8">Automatically logging in with mock user...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    </>
  );
};

export default DevLogin;