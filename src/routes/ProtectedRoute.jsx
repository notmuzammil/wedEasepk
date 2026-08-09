import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Spinner shown while the session is being resolved on first load.
 */
function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-stone-50">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
    </div>
  );
}

/**
 * Guards any route that requires authentication.
 *
 * - While session is resolving  → renders a centered spinner
 * - If not authenticated        → redirects to /login (preserves intended URL)
 * - If authenticated            → renders child routes via <Outlet />
 *
 * @example
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 */
export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
