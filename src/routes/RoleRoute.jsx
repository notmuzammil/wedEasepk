import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui';

/**
 * Extends ProtectedRoute with role-based access control.
 *
 * Nests inside ProtectedRoute so authentication is always checked first,
 * then the role check runs only for authenticated users.
 *
 * - Role not in allowedRoles → redirects to /unauthorized
 * - Role matches             → renders child routes via <Outlet />
 *
 * @param {{ allowedRoles: string[] }} props
 */
export function RoleRoute({ allowedRoles }) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
