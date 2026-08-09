import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Calendar, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/authService';
import { Avatar } from '../ui';

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

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide text-stone-900">
              <Sparkles className="h-5 w-5 text-rose-600" />
              <span>Wed<span className="text-rose-600">Ease</span></span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors">Home</Link>
            <Link to="/venues" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors">Browse Venues</Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={dashboardLink} className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                {profile?.role === 'customer' && (
                  <Link to="/my-bookings" className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors">
                    <Calendar className="h-4 w-4" /> Bookings
                  </Link>
                )}
                <div className="h-4 w-px bg-stone-200" />
                <Link 
                  to={profile?.role === 'customer' ? '/profile' : dashboardLink} 
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
                  <span className="text-xs font-semibold text-stone-600 hidden lg:inline">
                    {profile?.full_name?.split(' ')[0]}
                  </span>
                </Link>
                <button onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-red-600 transition-colors disabled:opacity-50">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors">Login</Link>
                <Link to="/register" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="rounded-md p-2 text-stone-600 hover:bg-stone-100">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setIsOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">Home</Link>
          <Link to="/venues" onClick={() => setIsOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">Browse Venues</Link>

          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} onClick={() => setIsOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">Login</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
