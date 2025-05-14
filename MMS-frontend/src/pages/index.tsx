import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();

  useEffect(() => {
    // Always redirect to login page
    router.replace('/login');
  }, [router]);

  return <LoadingScreen />;
}