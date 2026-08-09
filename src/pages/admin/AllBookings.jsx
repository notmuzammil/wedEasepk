import React, { useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import { useAllBookings, useVerifyPayment } from '../../hooks/useBookings';
import { BookingCard } from '../../components/shared/BookingCard';

const STATUS_FILTERS = [
  { key: 'all',                 label: 'All Bookings' },
  { key: 'pending_approval',    label: 'Pending Approval' },
  { key: 'approved',            label: 'Approved' },
  { key: 'pending_verification',label: 'Awaiting Payment' },
  { key: 'paid',                label: 'Paid' },
  { key: 'cancelled',           label: 'Cancelled' },
];

const AllBookings = () => {
  const { data: bookings = [], isLoading, isError } = useAllBookings();
  const verifyPaymentMutation = useVerifyPayment();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter || b.payment_status === filter;
    const q = search.toLowerCase();
    const matchSearch = !search
      || b.venue?.name?.toLowerCase().includes(q)
      || b.customer?.full_name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {};
  STATUS_FILTERS.forEach(f => {
    counts[f.key] = f.key === 'all'
      ? bookings.length
      : bookings.filter(b => b.status === f.key || b.payment_status === f.key).length;
  });

  return (
    <div className="ab-root">
      <div className="ab-header">
        <div>
          <h1 className="ab-title">All Bookings</h1>
          <p className="ab-sub">
            {isLoading ? 'Loading…' : `${bookings.length} total bookings on the platform`}
          </p>
        </div>
        <div className="ab-search-wrap">
          <Search size={15} className="ab-search-icon" />
          <input
            type="text"
            placeholder="Search by venue or customer…"
            className="ab-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="bookings-search"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="ab-tabs">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            className={`ab-tab ${filter === f.key ? 'ab-tab--active' : ''}`}
            onClick={() => setFilter(f.key)}
            id={`tab-${f.key}`}
          >
            {f.label}
            {counts[f.key] > 0 && <span className="ab-tab-count">{counts[f.key]}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="ab-list">
          {[1,2,3].map(n => <div key={n} className="ab-skeleton" />)}
        </div>
      )}

      {isError && (
        <div className="ab-error">Failed to load bookings. Please refresh the page.</div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="ab-empty">
          <Calendar size={40} />
          <p>{search ? 'No bookings match your search.' : 'No bookings in this category.'}</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="ab-list">
          {filtered.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role="admin"
              onVerifyPayment={(id, isVerified) => verifyPaymentMutation.mutate({ bookingId: id, isVerified })}
            />
          ))}
        </div>
      )}

      <style>{`
        .ab-root { font-family: 'Inter', sans-serif; }
        .ab-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 20px;
        }
        .ab-title {
          font-size: 1.6rem; font-weight: 800; color: var(--ink-900); margin: 0 0 4px;
          font-family: 'Playfair Display','Georgia',serif;
        }
        .ab-sub { font-size: 0.875rem; color: var(--ink-600); margin: 0; }
        .ab-search-wrap { position: relative; }
        .ab-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ink-400); pointer-events: none; }
        .ab-search {
          padding: 9px 14px 9px 36px; border: 1.5px solid var(--ink-200); border-radius: 10px;
          font-size: 0.875rem; outline: none; width: 240px; background: var(--ink-50); transition: border-color 0.2s;
        }
        .ab-search:focus { border-color: var(--brand-600); background: #fff; }

        .ab-tabs {
          display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--ink-200);
          flex-wrap: wrap;
        }
        .ab-tab {
          display: flex; align-items: center; gap: 7px; padding: 9px 14px;
          border: none; background: none; font-size: 0.82rem; font-weight: 500;
          color: var(--ink-600); cursor: pointer; border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.15s; white-space: nowrap;
        }
        .ab-tab:hover { color: var(--brand-600); }
        .ab-tab--active { color: var(--brand-600); border-bottom-color: var(--brand-600); font-weight: 600; }
        .ab-tab-count {
          background: var(--brand-200); color: var(--brand-700); border-radius: 99px;
          font-size: 0.68rem; font-weight: 700; padding: 1px 6px; min-width: 16px; text-align: center;
        }
        .ab-tab--active .ab-tab-count { background: var(--brand-600); color: #fff; }

        .ab-list { display: flex; flex-direction: column; gap: 14px; }
        .ab-skeleton {
          height: 180px; border-radius: 16px;
          background: linear-gradient(90deg,var(--ink-100),var(--ink-150),var(--ink-100));
          background-size: 600px; animation: shimmer 1.4s infinite linear;
        }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .ab-error { background:var(--brand-50); border:1px solid var(--brand-200); border-radius:12px; padding:20px; color:var(--brand-700); text-align:center; }
        .ab-empty {
          text-align:center; padding:60px 20px; color:var(--ink-400);
          display:flex; flex-direction:column; align-items:center; gap:12px; font-size:0.875rem;
        }

        @media (max-width: 640px) {
          .ab-search { width: 100%; }
          .ab-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default AllBookings;
