import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Store, Calendar, ShieldAlert, Sparkles, Check, X, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../utils/formatDate';
import { useUiStore } from '../../store/uiStore';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Categorical series colours, drawn from the brand palette so the charts sit
// in the same world as the rest of the UI.
const CHART_COLORS = ['#d12463', '#14503b', '#d4af37', '#f45b46', '#78183c', '#2b9d70'];

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  // Database States
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  // Fetch all core metrics
  const fetchAllData = async () => {
    try {
      // 1. Fetch profiles
      const { data: profileList, error: uErr } = await supabase
        .from('profiles')
        .select('*');
      if (uErr) throw uErr;
      setUsers(profileList || []);

      // 2. Fetch venues
      const { data: venueList, error: vErr } = await supabase
        .from('venues')
        .select('*');
      if (vErr) throw vErr;
      setVenues(venueList || []);

      // 3. Fetch bookings
      const { data: bookingList, error: bErr } = await supabase
        .from('bookings')
        .select('*');
      if (bErr) throw bErr;
      setBookings(bookingList || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Listings waiting on an admin decision
  const pendingListings = useMemo(
    () => venues.filter(v => v.status === 'pending_approval' || v.status === 'pending'),
    [venues]
  );

  // Stats
  const stats = useMemo(() => ({
    totalUsers:    users.length,
    totalVenues:   venues.length,
    totalBookings: bookings.length,
    totalPending:  pendingListings.length,
  }), [users, venues, bookings, pendingListings]);

  const vendorNameById = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.id] = u.full_name; });
    return map;
  }, [users]);

  // Analytics: Bookings per month (last 6 months)
  const monthlyChartData = useMemo(() => {
    const dataMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      dataMap[label] = 0;
    }

    bookings.forEach(b => {
      const d = new Date(b.booking_date || b.event_date);
      if (!isNaN(d.getTime())) {
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        if (dataMap[label] !== undefined) {
          dataMap[label]++;
        }
      }
    });

    return Object.keys(dataMap).map(key => ({
      month: key,
      Bookings: dataMap[key],
    }));
  }, [bookings]);

  // Analytics: Venues by city
  const cityChartData = useMemo(() => {
    const map = {};
    venues.forEach(v => {
      const city = v.city || v.area || 'Karachi';
      map[city] = (map[city] || 0) + 1;
    });
    return Object.keys(map).map(key => ({
      name: key,
      value: map[key],
    }));
  }, [venues]);

  // Approve / reject a venue listing straight from the overview
  const handleListingDecision = async (venueId, nextStatus, message) => {
    setActioningId(venueId);
    try {
      const { error } = await supabase
        .from('venues')
        .update({ status: nextStatus })
        .eq('id', venueId);

      if (error) throw error;

      showToast(message, 'success');
      setVenues(prev => prev.map(v => (v.id === venueId ? { ...v, status: nextStatus } : v)));
      queryClient.invalidateQueries({ queryKey: ['pending-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues-list'] });
    } catch (err) {
      showToast(err.message || 'Listing update failed', 'error');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-500 gap-4">
        <Spinner size="lg" />
        <p className="animate-pulse text-xs font-semibold">Compiling platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none font-sans">
      
      {/* Greetings banner */}
      <div className="bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-lift relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
        <div className="absolute top-[-30%] right-[-10%] w-60 h-60 rounded-full bg-gold-500/20 blur-3xl" />
        
        <div className="relative space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-gold-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
            <Sparkles className="h-3 w-3 fill-rose-500/20" /> Platform Controller
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight">WedEase Central Admin</h1>
          <p className="text-rose-100/85 text-sm font-light max-w-xl leading-relaxed">
            Oversee user directories, coordinate banquet listing approvals, and review market volume parameters.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600"><Users className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total Users</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><Store className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total Venues</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.totalVenues}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Calendar className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total Bookings</span>
            <h3 className="text-xl font-bold text-stone-850 mt-0.5">{stats.totalBookings}</h3>
          </div>
        </div>

        {/* Highlighted Amber Card for approvals */}
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-amber-500 text-white p-3 rounded-xl"><ShieldAlert className="h-6 w-6 animate-bounce-short" /></div>
          <div>
            <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider block">Pending Approvals</span>
            <h3 className="text-xl font-black text-amber-700 mt-0.5">{stats.totalPending}</h3>
          </div>
        </div>

      </div>

      {/* ── ANALYTICS CHART SECTION ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Monthly Bookings volume */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <BarChart2 size={16} className="text-rose-500" />
            <h3 className="font-serif text-base font-bold text-stone-900">Bookings Per Month</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#ab9985" fontSize={11} tickLine={false} />
                <YAxis stroke="#ab9985" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8f2ec' }} />
                <Bar dataKey="Bookings" fill="#d12463" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Venues City distributions */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <PieChartIcon size={16} className="text-rose-500" />
            <h3 className="font-serif text-base font-bold text-stone-900">Venues By City Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {cityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {cityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-stone-400 italic">No city analytics compiled.</p>
            )}
          </div>
        </div>

      </div>

      {/* ── LISTINGS AWAITING REVIEW ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-serif text-lg font-bold text-stone-900">Listings Awaiting Review</h3>
          <Link to="/admin/venues" className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition">
            Manage all listings
          </Link>
        </div>

        {pendingListings.length > 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Submitted By</th>
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pendingListings.map((venue) => (
                    <tr key={venue.id} className="hover:bg-rose-50/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-850">{venue.name || 'Untitled venue'}</div>
                        <div className="text-[10px] text-stone-400 font-bold capitalize mt-0.5">
                          {[venue.type, venue.city].filter(Boolean).join(' · ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-700">
                          {vendorNameById[venue.vendor_id] || 'Vendor'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-500">{formatDate(venue.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleListingDecision(venue.id, 'live', 'Listing is now live.')}
                            disabled={actioningId === venue.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm shadow-emerald-600/10 transition inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check size={10} /> Approve
                          </button>
                          <button
                            onClick={() => handleListingDecision(venue.id, 'suspended', 'Listing rejected.')}
                            disabled={actioningId === venue.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm shadow-red-600/10 transition inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <X size={10} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-stone-250 p-8 rounded-3xl text-center text-xs text-stone-400 select-none">
            No listings are waiting for review. You're all caught up.
          </div>
        )}
      </div>

    </div>
  );
}
