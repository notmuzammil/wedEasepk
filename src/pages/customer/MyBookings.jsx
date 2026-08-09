import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Search, Star, X, AlertTriangle } from 'lucide-react';
import {
  useCustomerBookings,
  useUploadReceipt,
  useCancelBooking
} from '../../hooks/useBookings';
import { BookingCard } from '../../components/shared/BookingCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',       label: 'All',       icon: Calendar },
  { key: 'upcoming',  label: 'Upcoming',  icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

// ─── Cancel Confirm Modal ─────────────────────────────────────────────────────
const CancelModal = ({ isOpen, onClose, onConfirm, isPending }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Cancel Booking" size="sm">
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <div className="bg-rose-50 p-2 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Are you sure you want to cancel?</p>
          <p className="text-sm text-stone-500 mt-1">
            This action cannot be undone. The vendor will be notified of the cancellation.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
        <Button variant="outline" size="sm" onClick={onClose}>Keep Booking</Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Yes, Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

// ─── Leave Review Placeholder Modal ──────────────────────────────────────────
const ReviewModal = ({ isOpen, onClose, booking }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder — integrate with reviews table when available
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review" size="md">
      {submitted ? (
        <div className="text-center py-6 space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <p className="font-semibold text-stone-900">Thank you for your review!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-stone-600">
            How was your experience at <strong>{booking?.venue?.name}</strong>?
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    s <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-stone-500">{rating} / 5</span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Your Comment
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience…"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Submit Review</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

// ─── Booking Item (with cancel + review actions) ──────────────────────────────
const BookingItem = ({ booking, onCancelClick, onReviewClick, isUploadingReceipt, onUploadReceipt }) => {
  const eventDate = new Date(booking.booking_date);
  const isPastEvent = eventDate < new Date();
  const canReview = booking.status === 'approved' || booking.status === 'paid';
  const canCancel = booking.status === 'pending_approval';

  return (
    <div className="space-y-0">
      <BookingCard
        booking={booking}
        role="customer"
        onUploadReceipt={onUploadReceipt}
        isUploadingReceipt={isUploadingReceipt}
      />
      {/* Extra customer actions beneath the card */}
      {(canCancel || (canReview && isPastEvent)) && (
        <div className="flex gap-2 justify-end mt-2 pr-1">
          {canCancel && (
            <button
              onClick={() => onCancelClick(booking)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold border border-rose-200 hover:border-rose-400 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Booking
            </button>
          )}
          {canReview && isPastEvent && (
            <button
              onClick={() => onReviewClick(booking)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold border border-amber-200 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <Star className="h-3.5 w-3.5" />
              Leave a Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MyBookings = () => {
  const { data: bookings, isLoading, isError } = useCustomerBookings();
  const uploadReceiptMutation = useUploadReceipt();
  const cancelMutation = useCancelBooking();

  const [activeTab, setActiveTab] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!bookings) return [];
    let list = bookings;

    // Tab filter
    if (activeTab === 'upcoming') {
      list = list.filter((b) =>
        (b.status === 'pending_approval' || b.status === 'approved') &&
        new Date(b.booking_date) >= new Date()
      );
    } else if (activeTab === 'confirmed') {
      list = list.filter((b) => b.status === 'approved' || b.status === 'paid');
    } else if (activeTab === 'cancelled') {
      list = list.filter((b) => b.status === 'cancelled' || b.status === 'rejected');
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.venue?.name?.toLowerCase().includes(q) ||
          b.venue?.city?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, activeTab, search]);

  const counts = useMemo(() => {
    if (!bookings) return {};
    return {
      all:       bookings.length,
      upcoming:  bookings.filter((b) =>
        (b.status === 'pending_approval' || b.status === 'approved') &&
        new Date(b.booking_date) >= new Date()
      ).length,
      confirmed: bookings.filter((b) => b.status === 'approved' || b.status === 'paid').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length,
    };
  }, [bookings]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync(cancelTarget.id);
    setCancelTarget(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">My Reservations</h1>
        <p className="text-stone-500 text-sm mt-1">
          Track status, upload receipts, and manage your booked wedding spaces.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors
              ${activeTab === key
                ? 'border-rose-600 text-rose-700 bg-rose-50/60'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'}
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
            {counts[key] > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === key ? 'bg-rose-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by venue name or city…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 bg-white transition-colors"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-white border rounded-2xl h-44" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl">
          Failed to load bookings. Please refresh the page.
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingItem
              key={booking.id}
              booking={booking}
              onCancelClick={setCancelTarget}
              onReviewClick={setReviewTarget}
              onUploadReceipt={(id, file) => uploadReceiptMutation.mutateAsync({ bookingId: id, file })}
              isUploadingReceipt={uploadReceiptMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <Calendar className="h-12 w-12 text-stone-300" />
          <p className="text-stone-500 font-medium">No bookings found.</p>
          {activeTab === 'all' && (
            <Link
              to="/venues"
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Browse Venues
            </Link>
          )}
        </div>
      )}

      {/* Cancel Confirm Modal */}
      <CancelModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        isPending={cancelMutation.isPending}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        booking={reviewTarget}
      />
    </div>
  );
};

export default MyBookings;
