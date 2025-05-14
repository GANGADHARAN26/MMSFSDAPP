import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // List of paths that don't need the sidebar/navbar
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicPage = publicPaths.includes(router.pathname);
  
  if (isPublicPage || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;