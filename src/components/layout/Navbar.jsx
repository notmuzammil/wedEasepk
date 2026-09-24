import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Calendar, LayoutDashboard, Search, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/authService';
import { Avatar } from '../ui';
import { Logo } from '../shared/Logo';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/venues', label: 'Browse Venues' },
];

const desktopLinkClass = ({ isActive }) =>
  `relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-stone-900 bg-stone-900/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-900/5'
  }`;

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, profile } = useAuthStore();

  // Elevate the bar once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => setIsOpen(false), [location.pathname]);

  // Prevent the page behind the mobile menu from scrolling
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
    <>
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-ivory/80 backdrop-blur-xl backdrop-saturate-150 border-b border-stone-900/5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(0,0,0,0.08)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Logo />

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={desktopLinkClass}>
              {l.label}
            </NavLink>
          ))}

          <div className="mx-3 h-5 w-px bg-stone-200" />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {profile?.role === 'customer' && (
                <NavLink to="/my-bookings" className={desktopLinkClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Bookings
                  </span>
                </NavLink>
              )}
              <Link
                to={dashboardLink}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-stone-800 active:scale-95"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link
                to={profile?.role === 'customer' ? '/profile' : dashboardLink}
                className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-3 transition-colors hover:bg-stone-900/5"
                title="Your profile"
              >
                <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
                <span className="hidden lg:inline text-sm font-semibold text-stone-700">
                  {profile?.full_name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="grid h-9 w-9 place-items-center rounded-full text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className={desktopLinkClass}>
                Log in
              </NavLink>
              <Link
                to="/register"
                className="group inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-rose-700 hover:shadow-glow active:scale-95"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-1">
          <Link to="/venues" className="grid h-10 w-10 place-items-center rounded-full text-stone-700 hover:bg-stone-900/5" aria-label="Search venues">
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="grid h-10 w-10 place-items-center rounded-full text-stone-700 hover:bg-stone-900/5"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>

      {/* Mobile menu — rendered outside <header>: its backdrop-filter would
          otherwise become the containing block for this fixed panel */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ivory px-4 pb-8 pt-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {isAuthenticated && profile && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-stone-900/5">
              <Avatar name={profile.full_name || 'User'} src={profile.avatar_url} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{profile.full_name}</p>
                <p className="text-xs capitalize text-stone-500">{profile.role} account</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
                    isActive ? 'bg-white text-rose-700 shadow-soft ring-1 ring-stone-900/5' : 'text-stone-700 hover:bg-white'
                  }`
                }
              >
                {l.label}
                <ArrowRight className="h-4 w-4 opacity-40" />
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <Link to={dashboardLink} className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium text-stone-700 hover:bg-white">
                  Dashboard <ArrowRight className="h-4 w-4 opacity-40" />
                </Link>
                {profile?.role === 'customer' && (
                  <Link to="/my-bookings" className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium text-stone-700 hover:bg-white">
                    My Bookings <ArrowRight className="h-4 w-4 opacity-40" />
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="mt-6 grid gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white text-sm font-semibold text-red-600"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <>
                <Link to="/register" className="flex h-12 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
                  Create free account
                </Link>
                <Link to="/login" className="flex h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-sm font-semibold text-stone-800">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
