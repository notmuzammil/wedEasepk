import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  User, 
  Building, 
  Users,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/authService';
import { Avatar, Badge, LogoMark } from '../ui';

/**
 * DashboardLayout organizes navigation structures for logged-in users.
 * Supports three roles: Customer, Vendor, and Admin.
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Compile list of navigation items dynamically based on the role
  const getNavLinks = () => {
    switch (profile?.role) {
      case 'customer':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'My Bookings', path: '/my-bookings', icon: <Calendar className="h-5 w-5" /> },
          { label: 'Profile Settings', path: '/profile', icon: <User className="h-5 w-5" /> },
        ];
      case 'vendor':
        return [
          { label: 'Overview', path: '/vendor/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Manage Venues', path: '/vendor/venues', icon: <Building className="h-5 w-5" /> },
          { label: 'Add Venue', path: '/vendor/venues/new', icon: <Sparkles className="h-5 w-5" /> },
          { label: 'Booking Requests', path: '/vendor/bookings', icon: <Calendar className="h-5 w-5" /> },
        ];
      case 'admin':
        return [
          { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Review Listings', path: '/admin/venues', icon: <ClipboardList className="h-5 w-5" /> },
          { label: 'Manage Bookings', path: '/admin/bookings', icon: <Calendar className="h-5 w-5" /> },
          { label: 'Vendors Directory', path: '/admin/vendors', icon: <Users className="h-5 w-5" /> },
          { label: 'Users Directory', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadgeVariant = () => {
    switch (profile?.role) {
      case 'admin':
        return 'danger'; // Rose-red color
      case 'vendor':
        return 'success'; // Emerald-green color
      default:
        return 'info'; // Blue color
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans text-stone-900 antialiased">
      {/* ── MOBILE SIDEBAR DRAWBACK BACKGROUND OVERLAY ────────────────── */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-rose-950/70 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      {/* ── SIDEBAR PANEL ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-rose-950 text-rose-100 border-r border-white/10 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col flex-1">
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-rose-950">
            <Link to="/" className="flex items-center gap-2.5 font-serif text-lg font-bold text-white tracking-wide">
              <LogoMark className="h-7 w-7" />
              <span>Wed<span className="text-gold-400">Ease</span></span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-rose-200/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                end={item.path === '/dashboard' || item.path === '/vendor/dashboard' || item.path === '/admin/dashboard'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150
                  ${isActive 
                    ? 'bg-white/10 text-gold-300 border-l-4 border-gold-400 pl-3 font-semibold' 
                    : 'text-rose-200/80 hover:bg-white/5 hover:text-white'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-white/10 bg-black/15 hidden lg:block">
          <div className="flex items-center gap-3 mb-4">
            <Avatar 
              name={profile?.full_name || 'User'} 
              src={profile?.avatar_url} 
              size="md" 
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-rose-200/70 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-white/15 hover:border-white/30 rounded-lg text-xs font-medium text-rose-200/85 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CANVAS ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-stone-600 hover:bg-stone-50 rounded-lg p-1.5 border border-stone-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs font-light tracking-wide uppercase hidden sm:inline">
                Portal Workspace
              </span>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <h2 className="text-sm font-semibold text-stone-800 capitalize">
                {profile?.role || 'Guest'} Control Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Profile Summary badge */}
            {profile && (
              <Badge variant={getRoleBadgeVariant()}>
                <span className="capitalize font-bold text-[10px]">{profile.role}</span>
              </Badge>
            )}

            <div className="h-4 w-px bg-stone-200" />

            {/* Mobile Header Logout and Avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-stone-800">{profile?.full_name}</p>
                <p className="text-[10px] text-stone-400 font-light">{profile?.phone || 'No phone'}</p>
              </div>
              <Avatar 
                name={profile?.full_name || 'User'} 
                src={profile?.avatar_url} 
                size="sm" 
              />
              <button
                onClick={handleSignOut}
                className="lg:hidden text-stone-500 hover:text-red-600 p-1 rounded-lg hover:bg-stone-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Outlet Canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
