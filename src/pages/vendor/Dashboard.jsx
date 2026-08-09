import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Store, Calendar, CircleDollarSign, PlusCircle, Sparkles, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMyVenues } from '../../hooks/useVenues';
import { useVendorBookings } from '../../hooks/useBookings';
import { formatCurrency, formatDate } from '../../utils/formatDate';
import DataTable from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';

export default function VendorDashboard() {
  const { profile } = useAuthStore();
  const { data: venues = [] } = useMyVenues();
  const { data: bookings = [], isLoading, isError } = useVendorBookings();

  // Stats computation
  const stats = useMemo(() => {
    const totalVenues = venues ? venues.length : 0;
    
    // Pending approvals
    const pendingBookings = bookings.filter(
      (b) => b.status === 'pending_approval' || b.status === 'pending'
    ).length;

    // Confirmed bookings
    const confirmedBookings = bookings.filter(
      (b) => b.status === 'approved' || b.status === 'confirmed' || b.status === 'paid'
    ).length;

    // Listings still waiting on admin review
    const venuesUnderReview = venues.filter(
      (v) => v.status === 'pending_approval' || v.status === 'pending'
    ).length;

    // Total income from confirmed/paid reservations
    const earnings = bookings
      .filter((b) => b.status === 'paid' || b.status === 'approved' || b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

    return { totalVenues, pendingBookings, confirmedBookings, venuesUnderReview, earnings };
  }, [venues, bookings]);

  // Last 5 bookings slice
  const recentBookings = useMemo(() => {
    return bookings.slice(0, 5);
  }, [bookings]);

  // DataTable Columns for bookings table
  const columns = [
    {
      key: 'venue',
      label: 'Venue Space',
      sortable: true,
      render: (row) => (
        <div className="font-semibold text-stone-850">{row.venue?.name || 'Unnamed Venue'}</div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer Details',
      render: (row) => (
        <div>
          <div className="font-semibold text-stone-800">{row.customer?.full_name || 'Client'}</div>
          <div className="text-[10px] text-stone-400 font-medium">{row.customer?.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      key: 'booking_date',
      label: 'Event Date',
      sortable: true,
      render: (row) => (
        <div className="font-medium text-stone-700">{formatDate(row.booking_date)}</div>
      ),
    },
    {
      key: 'number_of_guests',
      label: 'Guests',
      align: 'center',
      render: (row) => <div className="font-semibold text-stone-700">{row.number_of_guests || row.guests}</div>,
    },
    {
      key: 'total_price',
      label: 'Estimated Price',
      align: 'right',
      render: (row) => (
        <div className="font-bold text-emerald-800">{formatCurrency(row.total_price || row.totalPrice)}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (row) => {
        let variant = 'neutral';
        let label = row.status;
        if (row.status === 'pending_approval' || row.status === 'pending') {
          variant = 'warning';
          label = 'Pending';
        } else if (row.status === 'approved' || row.status === 'confirmed' || row.status === 'paid') {
          variant = 'success';
          label = row.status === 'paid' ? 'Paid' : 'Approved';
        } else if (row.status === 'cancelled' || row.status === 'rejected') {
          variant = 'danger';
          label = row.status === 'cancelled' ? 'Cancelled' : 'Rejected';
        }
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none">
      
      {/* Greetings banner */}
      <div className="bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-lift relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d4af37_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
        <div className="absolute top-[-30%] right-[-10%] w-60 h-60 rounded-full bg-gold-500/20 blur-3xl" />
        
        <div className="relative space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-400/10 text-gold-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold-500/25">
            <Sparkles className="h-3 w-3 fill-gold-400/20" /> Space Coordinator Portal
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Assalam-o-Alaikum, {profile?.full_name || 'Vendor Host'}!
          </h1>
          <p className="text-rose-100/85 text-sm font-light max-w-xl leading-relaxed">
            Monitor incoming banquet requests, manage listed halls, and evaluate seasonal revenue forecasts.
          </p>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600"><Store className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total Venues</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.totalVenues}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Calendar className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Pending Bookings</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.pendingBookings}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><TrendingUp className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Confirmed Bookings</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.confirmedBookings}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><HelpCircle className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Under Review</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.venuesUnderReview}</h3>
          </div>
        </div>

      </div>

      {/* Quick Actions & Recent Bookings table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Links Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5 h-fit">
          <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Quick Navigation</h3>
          <div className="flex flex-col gap-3">
            <Link 
              to="/vendor/venues/new" 
              className="flex items-center gap-3 text-xs font-bold text-stone-700 hover:text-rose-600 hover:bg-rose-50/10 p-3 rounded-xl border border-stone-200 hover:border-rose-200 transition"
              id="dashboard-add-venue-btn"
            >
              <PlusCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <span>Add New Venue Space</span>
            </Link>
            <Link 
              to="/vendor/venues" 
              className="flex items-center gap-3 text-xs font-bold text-stone-700 hover:text-rose-600 hover:bg-rose-50/10 p-3 rounded-xl border border-stone-200 hover:border-rose-200 transition"
              id="dashboard-manage-venues-btn"
            >
              <Store className="h-5 w-5 text-rose-500 shrink-0" />
              <span>Manage Space Listings</span>
            </Link>
            <Link 
              to="/vendor/bookings" 
              className="flex items-center gap-3 text-xs font-bold text-stone-700 hover:text-rose-600 hover:bg-rose-50/10 p-3 rounded-xl border border-stone-200 hover:border-rose-200 transition"
              id="dashboard-view-bookings-btn"
            >
              <Calendar className="h-5 w-5 text-rose-500 shrink-0" />
              <span>View Incoming Requests</span>
            </Link>
          </div>

          <div className="bg-rose-50/40 p-4 border border-rose-100 rounded-2xl flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Seasonal Earnings</span>
            <span className="text-xl font-black text-rose-600">
              {formatCurrency(stats.earnings)}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">Aggregated across all verified bookings</span>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-stone-900">Recent Booking Activity</h3>
            <Link 
              to="/vendor/bookings" 
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition"
            >
              View All Requests
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={recentBookings}
            isLoading={isLoading}
            pageSize={5}
            emptyMessage="No reservations registered for your venues yet."
          />

          {isError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>Something went wrong loading recent activity. Please refresh the page.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
