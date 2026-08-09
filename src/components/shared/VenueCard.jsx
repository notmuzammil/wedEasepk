import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Utensils } from 'lucide-react';
import { Badge } from '../ui/Badge';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800';

/**
 * Picks a cover photo, preferring the venue_images relation (where the vendor
 * flags a cover) and falling back to the legacy `images` text[] column.
 */
function resolveCover(venue) {
  const rows = venue.venue_images;
  if (Array.isArray(rows) && rows.length > 0) {
    const cover = rows.find((i) => i.is_cover) || rows[0];
    if (cover?.storage_path) return cover.storage_path;
  }
  const legacy = venue.images;
  if (Array.isArray(legacy) && legacy.length > 0 && typeof legacy[0] === 'string') {
    return legacy[0];
  }
  return FALLBACK_IMAGE;
}

/**
 * Reusable card to display wedding venue listings.
 *
 * @param {object} props
 * @param {object} props.venue
 * @param {boolean} [props.showStatus]
 */
export function VenueCard({ venue, showStatus = false }) {
  const {
    id,
    name,
    type,
    area,
    city,
    capacity,
    capacity_max,
    capacity_min,
    price_per_plate,
    price_per_day,
    status,
  } = venue;

  // Vendors without a distinct area have it mirrored from city — don't
  // render "Karachi, Karachi".
  const venueCity =
    [...new Set([area, city].filter(Boolean))].join(', ') || 'Pakistan';
  const venueCapacity = capacity_max || capacity || null;
  const capacityLabel = venueCapacity
    ? `${capacity_min ? `${capacity_min}–` : 'Up to '}${venueCapacity}`
    : 'On request';

  // A venue is priced either per day or per plate — never assume both.
  const isPerDay = Boolean(price_per_day);
  const venuePrice = isPerDay ? price_per_day : price_per_plate;

  const thumbnail = resolveCover(venue);

  const getTypeLabel = () => {
    switch (type) {
      case 'hall': return 'Wedding Hall';
      case 'marquee': return 'Marquee';
      case 'banquet': return 'Banquet Space';
      case 'lawn': return 'Wedding Lawn';
      default: return 'Premium Venue';
    }
  };

  // Helper to format prices into PKR Pakistani Rupees
  const formatPKR = (amount) => {
    if (amount === null || amount === undefined) return 'On request';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-soft hover:shadow-lift hover:border-rose-200 hover:-translate-y-1 transition-all duration-300 min-h-[400px]">
      {/* Venue Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={thumbnail}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Scrim keeps the type pill legible over bright photography */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-stone-950/45 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/95 text-rose-700 font-semibold px-2.5 py-1 rounded-lg text-[10px] tracking-wider uppercase shadow-soft backdrop-blur-sm">
            {getTypeLabel()}
          </span>
          {showStatus && status && (
            <Badge variant={status === 'approved' || status === 'live' ? 'success' : 'warning'}>
              <span className="text-[9px] uppercase font-bold tracking-wider">
                {status.replace(/_/g, ' ')}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="flex flex-col flex-grow p-5 space-y-3 bg-gradient-to-b from-white to-stone-50/40">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-stone-900 truncate group-hover:text-rose-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center text-xs font-light text-stone-500">
            <MapPin className="h-3.5 w-3.5 mr-1 text-rose-500 shrink-0" />
            <span className="truncate">{venueCity}</span>
          </div>
        </div>

        {/* Info Grid (Capacity + pricing) */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 text-xs text-stone-600 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate">Guests: <strong>{capacityLabel}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate">
              {isPerDay ? 'Per day' : 'Per plate'}: <strong>{formatPKR(venuePrice)}</strong>
            </span>
          </div>
        </div>

        {/* CTA Details Button */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-stone-400 uppercase font-semibold tracking-wider">
              {isPerDay ? 'Starting from' : 'Per plate'}
            </span>
            <span className="text-sm font-bold text-rose-600">{formatPKR(venuePrice)}</span>
          </div>
          <Link
            to={`/venues/${id}`}
            className="inline-flex items-center justify-center bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-soft hover:shadow-glow"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VenueCard;
