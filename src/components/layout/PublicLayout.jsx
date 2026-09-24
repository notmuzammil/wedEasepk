import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Logo } from '../shared/Logo';

/**
 * PublicLayout maps public routes with Navbar & Footer.
 * Restricts logged-in vendors/admins to their workspaces.
 */
export default function PublicLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Start each new page at the top (query-string changes keep scroll position)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-ivory">
        <Logo to={null} size="lg" className="animate-pulse" />
        <span className="block h-1 w-28 overflow-hidden rounded-full bg-stone-200">
          <span className="block h-full w-1/2 animate-indeterminate rounded-full bg-rose-500" />
        </span>
      </div>
    );
  }

  // Redirect logic for authenticated users
  if (isAuthenticated && location.pathname !== '/unauthorized') {
    if (role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Customers visiting auth pages (/login or /register)
    if (role === 'customer' && (location.pathname === '/login' || location.pathname === '/register')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory text-stone-900 font-sans antialiased">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
