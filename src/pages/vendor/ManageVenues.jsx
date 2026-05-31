import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Store, Edit3, MapPin, Users, Utensils, Eye, Trash2, AlertTriangle, X } from 'lucide-react';
import { useMyVenues, useDeleteVenue } from '../../hooks/useVenues';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatDate';
import { Spinner } from '../../components/ui/Spinner';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600';

function VenueCard({ venue, onDeleteClick }) {
  // Query venue images
  const images = venue.venue_images || venue.images || [];
  const cover = typeof images[0] === 'string' 
    ? images[0] 
    : images.find(i => i.is_cover)?.storage_path || images[0]?.storage_path || FALLBACK_IMAGE;

  // Status mapping
  let variant = 'neutral';
  let label = venue.status;
  if (venue.status === 'draft') {
    variant = 'neutral';
    label = 'Draft';
  } else if (venue.status === 'pending_approval' || venue.status === 'pending') {
    variant = 'warning';
    label = 'Under Review';
  } else if (venue.status === 'live' || venue.status === 'approved') {
    variant = 'success';
    label = 'Live';
  } else if (venue.status === 'suspended' || venue.status === 'rejected') {
    variant = 'danger';
    label = 'Suspended';
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 hover:border-rose-200 hover:shadow-lg transition duration-200 overflow-hidden flex flex-col sm:flex-row p-4 gap-5 items-stretch">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-44 h-40 sm:h-auto rounded-2xl overflow-hidden bg-stone-100 shrink-0">
        <img 
          src={cover} 
          alt={venue.name} 
          className="w-full h-full object-cover transition duration-300 hover:scale-105" 
        />
        {/* Absolute status pill for mobile */}
        <div className="absolute top-2 left-2 sm:hidden">
          <Badge variant={variant}>{label}</Badge>
        </div>
      </div>

      {/* Info column */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg font-bold text-stone-900 truncate">
              {venue.name}
            </h3>
            {/* Standard status badge on desktop */}
            <div className="hidden sm:block shrink-0">
              <Badge variant={variant}>{label}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span>{[venue.address, venue.city].filter(Boolean).join(', ') || 'Karachi'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} className="text-rose-500 shrink-0" />
              <span>
                {venue.capacity_max 
                  ? `${venue.capacity_min || 50} - ${venue.capacity_max}` 
                  : `${venue.capacity || '?'} guests`
                }
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Utensils size={13} className="text-rose-500 shrink-0" />
              <span>
                {venue.price_per_day 
                  ? `${formatCurrency(venue.price_per_day)}/day` 
                  : `${formatCurrency(venue.price_per_plate)}/plate`
                }
              </span>
            </span>
          </div>

          {/* Status descriptive logs */}
          {venue.status === 'rejected' && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
              ⚠️ Listing rejected by Admin. Please revise details and re-submit.
            </p>
          )}
          {(venue.status === 'pending_approval' || venue.status === 'pending') && (
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 animate-pulse">
              ⏳ Listing is currently under active admin review.
            </p>
          )}
        </div>

        {/* Actions panel */}
        <div className="flex flex-wrap gap-2 items-center justify-end mt-4 pt-3 border-t border-stone-100/50">
          <Link
            to={`/venues/${venue.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 hover:border-rose-400 rounded-xl bg-stone-50/50 hover:bg-rose-50/10 text-xs font-semibold text-stone-600 hover:text-rose-600 transition"
            title="Open public preview"
            id={`preview-${venue.id}`}
          >
            <Eye size={13} /> Preview
          </Link>
          <Link
            to={`/vendor/venues/${venue.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-100 hover:border-rose-200 rounded-xl bg-rose-50/30 hover:bg-rose-50 text-xs font-semibold text-rose-600 transition"
            id={`edit-${venue.id}`}
          >
            <Edit3 size={13} /> Edit
          </Link>
          <button
            onClick={() => onDeleteClick(venue)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 hover:border-red-200 rounded-xl bg-red-50/30 hover:bg-red-50 text-xs font-semibold text-red-600 transition"
            title="Delete this venue listing"
            id={`delete-${venue.id}`}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageVenues() {
  const { data: venues = [], isLoading, isError } = useMyVenues();
  const deleteVenueMutation = useDeleteVenue();

  // Dialog States
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteTrigger = (venue) => {
    setSelectedVenue(venue);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVenue) return;
    try {
      await deleteVenueMutation.mutateAsync(selectedVenue.id);
      setConfirmOpen(false);
      setSelectedVenue(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">My Venues Space Directory</h1>
          <p className="text-stone-500 text-sm font-medium">
            {isLoading ? 'Retrieving listings...' : `Aggregated count: ${venues.length} venue spaces`}
          </p>
        </div>
        <Link
          to="/vendor/venues/new"
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-br from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-rose-600/20 transition transform active:scale-95 shrink-0"
          id="add-new-venue-link-btn"
        >
          <Plus size={15} /> Add New Venue
        </Link>
      </div>

      {/* Loading list shimmer */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white border rounded-3xl h-44 animate-pulse flex items-center p-4 gap-5">
              <div className="w-44 h-full rounded-2xl bg-stone-150 shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-stone-150 rounded-lg w-1/3"></div>
                <div className="h-4 bg-stone-150 rounded-lg w-2/3"></div>
                <div className="h-4 bg-stone-150 rounded-lg w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-800 text-center space-y-2">
          <h3 className="font-bold text-sm">Failed to Load Venues</h3>
          <p className="text-xs">We encountered an issue fetching your listings. Please refresh or try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && venues.length === 0 && (
        <div className="bg-white border border-dashed border-stone-250 p-12 text-center rounded-3xl flex flex-col items-center justify-center gap-4 text-stone-400">
          <Store size={48} className="stroke-1 text-stone-300" />
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-bold text-stone-850">No Venues Registered Yet</h2>
            <p className="text-stone-500 text-xs">Publish your marquees, lawn spaces or halls to collect bookings.</p>
          </div>
          <Link
            to="/vendor/venues/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 hover:border-rose-300 bg-rose-50/30 hover:bg-rose-50 rounded-xl text-xs font-bold text-rose-600 transition"
          >
            <Plus size={14} /> Add Your First Listing
          </Link>
        </div>
      )}

      {/* Venues Card List */}
      {!isLoading && !isError && venues.length > 0 && (
        <div className="space-y-4">
          {venues.map(venue => (
            <VenueCard 
              key={venue.id} 
              venue={venue} 
              onDeleteClick={handleDeleteTrigger} 
            />
          ))}
        </div>
      )}

      {/* ── 5. CONFIRMATION DELETION DIALOG MODAL ───────────────────────── */}
      {confirmOpen && selectedVenue && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl border border-stone-200 p-6 shadow-2xl relative space-y-4">
            
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="bg-red-50 p-2.5 rounded-full text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-stone-900">Delete Listing Space?</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Are you absolutely certain you want to remove <strong className="text-stone-800">{selectedVenue.name}</strong>? This action is permanent.
                </p>
              </div>
              <button 
                onClick={() => setConfirmOpen(false)} 
                className="text-stone-400 hover:text-stone-600 shrink-0 ml-auto"
                aria-label="Close confirm dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Message Box */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-3 text-[11px] leading-normal text-red-800">
              Note: Deleting this space will withdraw its visibility from customers and cancel related active enquiries.
            </div>

            {/* Actions panel */}
            <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-3.5 py-2 border border-stone-250 bg-white rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
              >
                Keep Listing
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteVenueMutation.isPending}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                id="confirm-delete-action-btn"
              >
                {deleteVenueMutation.isPending && <Spinner size="sm" color="current" />}
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
