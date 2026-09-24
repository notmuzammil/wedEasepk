import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Calendar,
  User,
  Building,
  Users,
  PlusCircle,
  ClipboardList,
  ExternalLink,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/authService';
import { Avatar, Badge } from '../ui';
import { Logo } from '../shared/Logo';

const NAV_BY_ROLE = {
  customer: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Bookings', path: '/my-bookings', icon: Calendar },
    { label: 'Profile Settings', path: '/profile', icon: User },
  ],
  vendor: [
    { label: 'Overview', path: '/vendor/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Manage Venues', path: '/vendor/venues', icon: Building, end: true },
    { label: 'Add Venue', path: '/vendor/venues/new', icon: PlusCircle },
    { label: 'Booking Requests', path: '/vendor/bookings', icon: Calendar },
  ],
  admin: [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Review Listings', path: '/admin/venues', icon: ClipboardList },
    { label: 'Manage Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Vendors Directory', path: '/admin/vendors', icon: Store },
    { label: 'Users Directory', path: '/admin/users', icon: Users },
  ],
};

const ROLE_BADGE = { admin: 'danger', vendor: 'success', customer: 'brand' };

/**
 * DashboardLayout organizes navigation structures for logged-in users.
 * Supports three roles: Customer, Vendor, and Admin.
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile } = useAuthStore();

  const navLinks = NAV_BY_ROLE[profile?.role] || [];
  const currentPage =
    navLinks.find((l) => (l.end ? location.pathname === l.path : location.pathname.startsWith(l.path)))?.label ||
    'Workspace';

  // Close the drawer and reset scroll on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] font-sans text-stone-900 antialiased lg:flex">
      {/* ── MOBILE OVERLAY ─────────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm lg:hidden animate-in fade-in-0"
        />
      )}

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-stone-950 text-stone-300
          transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-rose-900/30 to-transparent" aria-hidden="true" />

        <div className="relative flex h-16 items-center justify-between px-5">
          <Logo tone="light" size="sm" />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="relative px-6 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          {profile?.role ? `${profile.role} workspace` : 'Workspace'}
        </p>

        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 scrollbar-none">
          {navLinks.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) => `
                group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-rose-500 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <Icon className={`h-[18px] w-[18px] transition-colors ${isActive ? 'text-rose-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Vendors/admins are redirected away from public pages, so only customers get this */}
          {profile?.role === 'customer' && (
            <>
              <div className="my-4 border-t border-white/5" />
              <Link
                to="/venues"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:bg-white/5 hover:text-stone-100"
              >
                <ExternalLink className="h-[18px] w-[18px] text-stone-500" /> Browse venues
              </Link>
            </>
          )}
        </nav>

        {/* User card */}
        <div className="relative m-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="md" className="ring-stone-900" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-100">{profile?.full_name || 'Guest'}</p>
              <p className="truncate text-xs capitalize text-stone-500">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-red-500/15 hover:text-red-400"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-stone-900/5 bg-[#f7f4f0]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-xs text-stone-400 sm:block">
                <span className="capitalize">{profile?.role || 'Guest'}</span> <span className="mx-1">/</span> {currentPage}
              </p>
              <h2 className="truncate font-sans text-sm font-semibold text-stone-900 sm:text-base">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <Badge variant={ROLE_BADGE[profile.role] || 'neutral'} dot>
                <span className="capitalize">{profile.role}</span>
              </Badge>
            )}
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold leading-tight text-stone-800">{profile?.full_name}</p>
              <p className="text-xs text-stone-400">{profile?.phone || 'No phone added'}</p>
            </div>
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="animate-in fade-in-0 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
