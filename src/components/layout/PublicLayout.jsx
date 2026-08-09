import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * PublicLayout maps public routes with Navbar & Footer.
 * Restricts logged-in vendors/admins to their workspaces.
 */
export default function PublicLayout() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />
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
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 font-sans antialiased">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
