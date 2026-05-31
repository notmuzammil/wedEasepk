import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Shells
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Guards
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Loader
import { Spinner } from '../components/ui/Spinner';

const PageLoading = () => (
  <div className="flex min-h-[60vh] items-center justify-center p-12">
    <Spinner size="lg" />
  </div>
);

// ── LAZY LOADED PUBLIC PAGES ───────────────────────────────────────
const Home = lazy(() => import('../pages/public/HomePage'));
const VenueListing = lazy(() => import('../pages/public/VenueListingPage'));
const VenueDetail = lazy(() => import('../pages/public/VenueDetailPage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'));
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// ── LAZY LOADED CUSTOMER PAGES ─────────────────────────────────────
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const MyBookings = lazy(() => import('../pages/customer/MyBookings'));
const Profile = lazy(() => import('../pages/customer/Profile'));

// ── LAZY LOADED VENDOR PAGES ───────────────────────────────────────
const VendorDashboard = lazy(() => import('../pages/vendor/Dashboard'));
const ManageVenues = lazy(() => import('../pages/vendor/ManageVenues'));
const AddVenue = lazy(() => import('../pages/vendor/AddVenue'));
const EditVenue = lazy(() => import('../pages/vendor/EditVenue'));
const VendorBookings = lazy(() => import('../pages/vendor/Bookings'));

// ── LAZY LOADED ADMIN PAGES ────────────────────────────────────────
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const ManageVendors = lazy(() => import('../pages/admin/ManageVendors'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageListings = lazy(() => import('../pages/admin/ManageListings'));
const AllBookings = lazy(() => import('../pages/admin/AllBookings'));

export const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* ── 1. PUBLIC ROUTES ──────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<VenueListing />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* ── 2. PROTECTED ROUTE CONTAINER ──────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          
          {/* ── DASHBOARD LAYOUT WRAPPER ───────────────────────────── */}
          <Route element={<DashboardLayout />}>
            
            {/* ── A. CUSTOMER CHANNELS ─────────────────────────────── */}
            <Route element={<RoleRoute allowedRoles={['customer']} />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* ── B. VENDOR CHANNELS ───────────────────────────────── */}
            <Route element={<RoleRoute allowedRoles={['vendor']} />}>
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/venues" element={<ManageVenues />} />
              <Route path="/vendor/venues/new" element={<AddVenue />} />
              <Route path="/vendor/venues/:id/edit" element={<EditVenue />} />
              <Route path="/vendor/bookings" element={<VendorBookings />} />
            </Route>

            {/* ── C. ADMIN CHANNELS ────────────────────────────────── */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/vendors" element={<ManageVendors />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/venues" element={<ManageListings />} />
              <Route path="/admin/bookings" element={<AllBookings />} />
            </Route>

          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
