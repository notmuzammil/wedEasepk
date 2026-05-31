import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Search, AlertCircle, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useVendorBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import { supabase } from '../../lib/supabaseClient';
import DataTable from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const FILTERS = [
  { key: 'all',              label: 'All' },
  { key: 'pending_approval', label: 'Pending' },
  { key: 'approved',         label: 'Approved' },
  { key: 'cancelled',        label: 'Cancelled' },
];

export default function Bookings() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading, isError } = useVendorBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  // Filter and Search States
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [activeAction, setActiveAction] = useState(null); // { bookingId, actionType: 'accept' | 'reject' }
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 1. SUPABASE REALTIME SUBSCRIPTION
  useEffect(() => {
    const channel = supabase
      .channel('vendor-bookings-postgres-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Realtime postgres event received on bookings:', payload);
          // Invalidate React Query Cache to trigger immediate refetches
          queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
          queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: bookings.length };
    FILTERS.forEach(f => {
      if (f.key !== 'all') {
        counts[f.key] = bookings.filter(b => {
          if (f.key === 'pending_approval') {
            return b.status === 'pending_approval' || b.status === 'pending';
          }
          if (f.key === 'approved') {
            return b.status === 'approved' || b.status === 'confirmed' || b.status === 'paid';
          }
          return b.status === f.key;
        }).length;
      }
    });
    return counts;
  }, [bookings]);

  // Dataset filtering
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = filter === 'all' || 
        (filter === 'pending_approval' && (b.status === 'pending_approval' || b.status === 'pending')) ||
        (filter === 'approved' && (b.status === 'approved' || b.status === 'confirmed' || b.status === 'paid')) ||
        b.status === filter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !searchQuery ||
        b.venue?.name?.toLowerCase().includes(q) ||
        b.customer?.full_name?.toLowerCase().includes(q) ||
        b.customer?.phone_number?.includes(q);

      return matchStatus && matchSearch;
    });
  }, [bookings, filter, searchQuery]);

  // Trigger Accept/Reject action Dialog
  const handleActionTrigger = (bookingId, actionType) => {
    setActiveAction({ bookingId, actionType });
    setShowConfirmModal(true);
  };

  // Perform Accept/Decline status update
  const handleConfirmAction = async () => {
    if (!activeAction) return;
    const { bookingId, actionType } = activeAction;
    const status = actionType === 'accept' ? 'approved' : 'rejected';
    try {
      await updateStatusMutation.mutateAsync({ id: bookingId, status });
      setShowConfirmModal(false);
      setActiveAction(null);
    } catch (err) {
      console.error(err);
    }
  };

  // DataTable column descriptions
  const columns = [
    {
      key: 'venue',
      label: 'Venue Space',
      sortable: true,
      render: (row) => <div className="font-semibold text-stone-850">{row.venue?.name || 'Unnamed space'}</div>,
    },
    {
      key: 'customer',
      label: 'Client Details',
      render: (row) => (
        <div>
          <div className="font-semibold text-stone-800">{row.customer?.full_name || 'Client'}</div>
          <div className="text-[10px] text-stone-400 font-medium">{row.customer?.phone_number || row.customer?.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      key: 'booking_date',
      label: 'Event Date',
      sortable: true,
      render: (row) => <div className="font-medium text-stone-700">{formatDate(row.booking_date)}</div>,
    },
    {
      key: 'number_of_guests',
      label: 'Guests count',
      align: 'center',
      render: (row) => <div className="font-semibold text-stone-700">{row.number_of_guests || row.guests}</div>,
    },
    {
      key: 'total_price',
      label: 'Total Value',
      align: 'right',
      render: (row) => <div className="font-bold text-emerald-800">{formatCurrency(row.total_price || row.totalPrice)}</div>,
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
    {
      key: 'actions',
      label: 'Response Actions',
      align: 'right',
      render: (row) => {
        if (row.status === 'pending_approval' || row.status === 'pending') {
          return (
            <div className="flex justify-end gap-2 shrink-0">
              <button
                onClick={() => handleActionTrigger(row.id, 'accept')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm shadow-emerald-600/10 transition transform active:scale-95"
                id={`accept-request-${row.id}`}
              >
                Accept
              </button>
              <button
                onClick={() => handleActionTrigger(row.id, 'reject')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm shadow-red-600/10 transition transform active:scale-95"
                id={`reject-request-${row.id}`}
              >
                Decline
              </button>
            </div>
          );
        }
        return <span className="text-[10px] text-stone-400 font-bold uppercase select-none mr-2">Completed</span>;
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none font-sans">
      
      {/* Header board bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">Banquet Requests</h1>
          <p className="text-stone-500 text-sm font-medium">
            {isLoading ? 'Loading queries...' : `${bookings.length} reservations across all properties`}
          </p>
        </div>

        {/* Realtime Subscription Active Notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full self-start">
          <RefreshCw size={10} className="animate-spin text-emerald-600 shrink-0" />
          <span>Live Realtime Sync Active</span>
        </div>
      </div>

      {/* Control panel (Filters + Searches) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-stone-200 pb-2">
        {/* Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition ${
                filter === f.key 
                  ? 'border-rose-600 text-rose-600 font-bold' 
                  : 'border-transparent text-stone-500 hover:text-rose-500'
              }`}
              id={`filter-${f.key}`}
            >
              {f.label}
              {tabCounts[f.key] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
                  filter === f.key ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {tabCounts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search input field */}
        <div className="relative shrink-0 w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search venue or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 p-2 pl-9 pr-3 rounded-xl text-xs font-medium text-stone-850 focus:bg-white focus:outline-none focus:border-rose-500 transition"
            id="vendor-bookings-search-input"
          />
        </div>
      </div>

      {/* Bookings table */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        isLoading={isLoading}
        pageSize={8}
        emptyMessage={searchQuery ? "No booking requests match your query filter." : "No bookings registered in this status folder."}
      />

      {/* Error status notice */}
      {isError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>Error compiling booking datasets. Please try refreshing.</span>
        </div>
      )}

      {/* ── 5. CONFIRMATION BOOKING DECISION DIALOG MODAL ───────────────── */}
      {showConfirmModal && activeAction && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl border border-stone-200 p-6 shadow-2xl relative space-y-4">
            
            {/* Header Title */}
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-full shrink-0 ${
                activeAction.actionType === 'accept' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {activeAction.actionType === 'accept' ? 'Confirm Approval Request?' : 'Decline Booking Request?'}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Are you absolutely certain you want to {activeAction.actionType === 'accept' ? 'accept and approve' : 'decline'} this event reservation request?
                </p>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="text-stone-400 hover:text-stone-600 shrink-0 ml-auto"
                aria-label="Close dialogue"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Message Box */}
            <div className={`rounded-2xl p-3 text-[11px] leading-normal font-semibold ${
              activeAction.actionType === 'accept' 
                ? 'bg-emerald-50/50 border border-emerald-100 text-emerald-800' 
                : 'bg-red-50/50 border border-red-100 text-red-800'
            }`}>
              {activeAction.actionType === 'accept' 
                ? 'Upon approval, the customer will be notified to submit their payment receipt to lock the date slot.' 
                : 'Declining this request will mark the schedule slot as free on your public calendar directory.'
              }
            </div>

            {/* Actions Panel */}
            <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 border border-stone-250 bg-white rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={updateStatusMutation.isPending}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 ${
                  activeAction.actionType === 'accept' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                id="confirm-booking-decision-action-btn"
              >
                {updateStatusMutation.isPending && <Spinner size="sm" color="current" />}
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
