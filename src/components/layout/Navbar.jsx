import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Calendar, LayoutDashboard, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/authService';
import { Avatar, LogoMark } from '../ui';

export function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, profile } = useAuthStore();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const dashboardLink = profile
    ? (profile.role === 'customer' ? '/dashboard' : `/${profile.role}/dashboard`)
    : '/';

  const isCustomer = profile?.role === 'customer';
  const closeMenu = () => setIsOpen(false);

  return (
    // Opaque rather than translucent: the bar sits over hero gradients and
    // venue photography, and a see-through bar made the links hard to pick out.
    <nav className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-xl font-bold tracking-wide text-stone-900 shrink-0"
          >
            <LogoMark className="h-8 w-8" />
            <span>Wed<span className="text-rose-600">Ease</span></span>
          </Link>

          {/*
            Full nav appears at lg and up. Below that the row could not hold
            seven signed-in items without clipping, so the menu button takes
            over and shows every destination in a list instead.
          */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors whitespace-nowrap">
              Home
            </Link>
            <Link to="/venues" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors whitespace-nowrap">
              Browse Venues
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to={dashboardLink}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200 whitespace-nowrap"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" /> Dashboard
                </Link>

                {isCustomer && (
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors whitespace-nowrap"
                  >
                    <Calendar className="h-4 w-4 shrink-0" /> Bookings
                  </Link>
                )}

                <div className="h-5 w-px bg-stone-200 shrink-0" />

                <Link
                  to={isCustomer ? '/profile' : dashboardLink}
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0"
                  title={profile?.full_name || 'Account'}
                >
                  <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
                  <span className="text-xs font-semibold text-stone-700 truncate max-w-[7rem]">
                    {profile?.full_name?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-red-600 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <LogOut className="h-4 w-4 shrink-0" /> Sign Out
                </button>
              </div>
            ) : (
              // Sign-up is reachable from the login page, so the navbar keeps
              // a single call to action.
              <Link
                to="/login"
                className="rounded-lg bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 px-5 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition-all whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>

          {/* Compact controls below lg */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="rounded-lg bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 px-4 py-1.5 text-sm font-semibold text-white shadow-soft whitespace-nowrap"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="rounded-md p-2 text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="primary-mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu below lg — mirrors every destination available on the desktop bar */}
      {isOpen && (
        <div
          id="primary-mobile-menu"
          className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          {isAuthenticated && profile && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-stone-100">
              <Avatar name={profile.full_name || 'User'} src={profile.avatar_url} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{profile.full_name}</p>
                <p className="text-[11px] text-stone-500 capitalize">{profile.role}</p>
              </div>
            </div>
          )}

          <Link to="/" onClick={closeMenu} className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
            Home
          </Link>
          <Link to="/venues" onClick={closeMenu} className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
            Browse Venues
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={dashboardLink}
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>

              {isCustomer && (
                <>
                  <Link
                    to="/my-bookings"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
                  >
                    <Calendar className="h-4 w-4" /> My Bookings
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
                  >
                    <User className="h-4 w-4" /> Profile Settings
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
