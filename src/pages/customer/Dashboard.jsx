import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Search, User, Sparkles, Clock, CheckCircle2,
  MapPin, TrendingUp, ArrowRight, Heart
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCustomerBookings } from '../../hooks/useBookings';
import { BookingCard } from '../../components/shared/BookingCard';
import { Badge } from '../../components/ui/Badge';
import { formatPKR, formatRelativeTime } from '../../utils/formatters';

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, bg, iconColor, isLoading }) => (
  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`${bg} p-3 rounded-xl`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div>
      <span className="text-xs text-stone-500 uppercase font-semibold tracking-wide">{label}</span>
      <h3 className="text-2xl font-bold text-stone-800 leading-none mt-1">
        {isLoading ? (
          <span className="inline-block h-6 w-8 bg-stone-200 rounded animate-pulse" />
        ) : value}
      </h3>
    </div>
  </div>
);

// ─── Upcoming Booking Mini Card ────────────────────────────────────────────────
const statusMap = {
  pending_approval: { label: 'Pending', variant: 'warning' },
  approved:         { label: 'Approved', variant: 'success' },
  paid:             { label: 'Paid', variant: 'success' },
  cancelled:        { label: 'Cancelled', variant: 'danger' },
  rejected:         { label: 'Rejected', variant: 'danger' },
};

const UpcomingCard = ({ booking }) => {
  const { label, variant } = statusMap[booking.status] || { label: booking.status, variant: 'neutral' };
  const eventDate = new Date(booking.booking_date);
  const day = eventDate.toLocaleDateString('en-PK', { day: '2-digit' });
  const month = eventDate.toLocaleDateString('en-PK', { month: 'short' }).toUpperCase();

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow">
      {/* Date pill */}
      <div className="flex flex-col items-center justify-center bg-emerald-800 text-white rounded-lg px-3 py-2 min-w-[52px] text-center">
        <span className="text-lg font-black leading-none">{day}</span>
        <span className="text-[10px] font-semibold tracking-wider">{month}</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-sm truncate">
          {booking.venue?.name || 'Venue'}
        </p>
        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3" />
          {booking.venue?.city || 'Karachi'}
        </p>
        <p className="text-xs text-stone-400 mt-1">{formatRelativeTime(booking.created_at)}</p>
      </div>

      <Badge variant={variant}>{label}</Badge>
    </div>
  );
};

// ─── Recently Viewed ───────────────────────────────────────────────────────────
const RecentlyViewedSection = () => {
  const recentRaw = localStorage.getItem('wedease_recent_venues');
  const recent = useMemo(() => {
    try { return JSON.parse(recentRaw) || []; }
    catch { return []; }
  }, [recentRaw]);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-emerald-950 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-400" />
          Recently Viewed
        </h2>
        <Link to="/venues" className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1">
          Browse all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recent.slice(0, 3).map((v) => (
          <Link
            key={v.id}
            to={`/venues/${v.id}`}
            className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            {v.cover_image ? (
              <img
                src={v.cover_image}
                alt={v.name}
                className="h-28 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="h-28 w-full bg-emerald-50 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-emerald-300" />
              </div>
            )}
            <div className="p-3">
              <p className="font-semibold text-stone-900 text-sm truncate">{v.name}</p>
              <p className="text-xs text-stone-500">{v.city}</p>
              {v.price_per_day && (
                <p className="text-xs font-bold text-emerald-700 mt-1">{formatPKR(v.price_per_day)} / day</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Quick Search Bar ─────────────────────────────────────────────────────────
const QuickSearch = () => {
  const navigate = useNavigate();
  const [q, setQ] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/venues${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search venues by name or city…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-colors bg-white"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { profile } = useAuthStore();
  const { data: bookings, isLoading } = useCustomerBookings();

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, pending: 0, confirmed: 0 };
    return {
      total:     bookings.length,
      pending:   bookings.filter((b) => b.status === 'pending_approval').length,
      confirmed: bookings.filter((b) => b.status === 'approved' || b.status === 'paid').length,
    };
  }, [bookings]);

  const upcoming = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter((b) => b.status !== 'cancelled' && b.status !== 'rejected')
      .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
      .slice(0, 3);
  }, [bookings]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* ── Hero Banner ── */}
      <div className="bg-emerald-800 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-700/40" />
        <div className="absolute -right-4 -bottom-6 h-28 w-28 rounded-full bg-gold-500/10" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span className="text-gold-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Customer Dashboard
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">
              Assalam-o-Alaikum, {profile?.full_name?.split(' ')[0] || 'Guest'}!
            </h1>
            <p className="text-stone-300 text-sm font-light max-w-xl">
              Welcome back to ShaadiSpaces. Manage your venue reservations, track payment
              status, and discover new venues across Karachi.
            </p>
          </div>

          <Link
            to="/venues"
            className="inline-flex items-center gap-2 self-start md:self-center bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all backdrop-blur-sm whitespace-nowrap"
          >
            <Search className="h-4 w-4" />
            Find a Venue
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Requests"
          value={stats.total}
          bg="bg-blue-50"
          iconColor="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          icon={Clock}
          label="Awaiting Approval"
          value={stats.pending}
          bg="bg-amber-50"
          iconColor="text-amber-600"
          isLoading={isLoading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved / Paid"
          value={stats.confirmed}
          bg="bg-emerald-50"
          iconColor="text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      {/* ── Quick Search ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
        <h2 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-700" />
          Find Your Perfect Venue
        </h2>
        <QuickSearch />
      </div>

      {/* ── Two Column: Upcoming + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-700" />
              Upcoming Bookings
            </h2>
            <Link to="/my-bookings" className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="animate-pulse bg-white border rounded-xl h-20" />
              ))}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((b) => <UpcomingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
              <Calendar className="h-10 w-10 text-stone-300 mx-auto" />
              <p className="text-stone-500 text-sm font-medium">No upcoming bookings yet.</p>
              <Link
                to="/venues"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
              >
                Browse venues <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4 h-fit">
          <h2 className="font-serif text-lg font-bold text-emerald-950">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/venues', icon: Search, label: 'Browse Venues', sub: 'Find halls & lawns' },
              { to: '/my-bookings', icon: Calendar, label: 'My Bookings', sub: 'Track all requests' },
              { to: '/profile', icon: User, label: 'Edit Profile', sub: 'Update contact info' },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="bg-emerald-50 group-hover:bg-emerald-100 p-2 rounded-lg transition-colors">
                  <Icon className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-800">{label}</p>
                  <p className="text-xs text-stone-500">{sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recently Viewed Venues ── */}
      <RecentlyViewedSection />
    </div>
  );
};

export default CustomerDashboard;
