import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Utensils, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';

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
    price_per_plate,
    price_per_day,
    images,
    status
  } = venue;

  // Handles dual-schema support for robust fallback listing
  const venueCity = city || area || 'Karachi';
  const venueCapacity = capacity || capacity_max || 300;
  const venuePrice = price_per_plate || price_per_day || 1200;

  // Use a high-quality wedding hall cover image fallback if none exists
  const thumbnail = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800';

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
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-rose-300 border border-stone-200 transition-all duration-300 min-h-[400px]">
      {/* Venue Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={thumbnail}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-rose-600 text-white font-semibold px-2.5 py-1 rounded-lg text-[10px] tracking-wider uppercase shadow-md">
            {getTypeLabel()}
          </span>
          {showStatus && status && (
            <Badge variant={status === 'approved' || status === 'live' ? 'success' : 'warning'}>
              <span className="text-[9px] uppercase font-bold tracking-wider">{status}</span>
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

        {/* Rating Stars component block */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded ml-1">
            4.9
          </span>
        </div>

        {/* Info Grid (Capacity + Plate pricing) */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 text-xs text-stone-600 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate">Guests: <strong>{venueCapacity}+</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate">Plate: <strong>{formatPKR(venuePrice)}</strong></span>
          </div>
        </div>

        {/* CTA Details Button */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-stone-400 uppercase font-semibold tracking-wider">Est. Budget</span>
            <span className="text-sm font-bold text-rose-600">{formatPKR(venuePrice * 200)}</span>
          </div>
          <Link
            to={`/venues/${id}`}
            className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VenueCard;
