import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, Heart, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import {
  FALLBACK_VENUE_IMAGE,
  getVenueCover,
  getVenueTypeLabel,
  getVenueLocation,
  getVenueCapacity,
  getVenuePrice,
  getVenueRating,
  formatPKRCompact,
} from '../../utils/venue';

/**
 * Reusable card to display wedding venue listings.
 *
 * @param {object} props
 * @param {object} props.venue
 * @param {boolean} [props.showStatus]
 * @param {'grid'|'list'} [props.layout='grid']
 */
export function VenueCard({ venue, showStatus = false, layout = 'grid' }) {
  const { id, name, type, status } = venue;
  const [imgSrc, setImgSrc] = useState(() => getVenueCover(venue));
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const capacity = getVenueCapacity(venue);
  const price = getVenuePrice(venue);
  const rating = getVenueRating(venue);
  const isList = layout === 'list';

  return (
    <Link
      to={`/venues/${id}`}
      className={`group relative flex h-full overflow-hidden rounded-3xl bg-white ring-1 ring-stone-900/5 shadow-soft transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lift ${
        isList ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {/* Cover */}
      <div
        className={`relative overflow-hidden bg-stone-100 ${
          isList ? 'aspect-[4/3] sm:aspect-auto sm:w-72 sm:shrink-0' : 'aspect-[4/3]'
        }`}
      >
        {!imgLoaded && <div className="skeleton absolute inset-0 rounded-none" />}
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => imgSrc !== FALLBACK_VENUE_IMAGE && setImgSrc(FALLBACK_VENUE_IMAGE)}
          className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent opacity-80" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-800 shadow-sm backdrop-blur">
            {getVenueTypeLabel(type)}
          </span>
          {showStatus && status && (
            <Badge dot variant={status === 'approved' || status === 'live' ? 'success' : 'warning'}>
              <span className="capitalize">{String(status).replace(/_/g, ' ')}</span>
            </Badge>
          )}
        </div>

        {/* Save — local, visual-only shortlist toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved((s) => !s);
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur transition-all hover:scale-110 active:scale-95"
          aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
          aria-pressed={saved}
        >
          <Heart className={`h-4 w-4 transition-colors ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {capacity && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-stone-950/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            <Users className="h-3.5 w-3.5" /> Up to {Number(capacity).toLocaleString()} guests
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-serif text-lg font-semibold text-stone-900 transition-colors group-hover:text-rose-700">
            {name}
          </h3>
          {rating ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-stone-800">
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
              {rating.value.toFixed(1)}
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-700 ring-1 ring-gold-200">
              New
            </span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span className="truncate">{getVenueLocation(venue)}</span>
        </p>

        {isList && venue.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">{venue.description}</p>
        )}

        <div className="min-h-5 flex-1" />
        <div className="flex items-end justify-between border-t border-dashed border-stone-200 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Starting at</p>
            <p className="text-base font-bold text-stone-900">
              {price.amount ? formatPKRCompact(price.amount) : 'On request'}
              {price.unit && <span className="ml-1 text-xs font-medium text-stone-500">/ {price.unit}</span>}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-stone-900 text-white transition-all duration-300 group-hover:rotate-45 group-hover:bg-rose-600">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

VenueCard.propTypes = {
  venue: PropTypes.object.isRequired,
  showStatus: PropTypes.bool,
  layout: PropTypes.oneOf(['grid', 'list']),
};

export default VenueCard;
