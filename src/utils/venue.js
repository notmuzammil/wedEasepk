/**
 * Venue display helpers shared by cards, listings and dashboards.
 * Venues come from two schema generations (city/area, capacity/capacity_max,
 * price_per_plate/price_per_day, images[]/venue_images[]) — these normalise them.
 */

export const FALLBACK_VENUE_IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1000';

const TYPE_LABELS = {
  hall: 'Wedding Hall',
  marquee: 'Marquee',
  banquet: 'Banquet',
  lawn: 'Lawn',
};

export function getVenueTypeLabel(type) {
  return TYPE_LABELS[type] || 'Venue';
}

/** Cover image: flagged cover in venue_images → first venue_image → images[0] → fallback. */
export function getVenueCover(venue) {
  if (!venue) return FALLBACK_VENUE_IMAGE;
  const rows = venue.venue_images || [];
  const cover = rows.find((r) => r?.is_cover) || rows[0];
  const fromRows = typeof cover === 'string' ? cover : cover?.storage_path || cover?.url;
  return fromRows || venue.images?.[0] || venue.cover_image || FALLBACK_VENUE_IMAGE;
}

export function getVenueLocation(venue) {
  const parts = [venue?.area, venue?.city].filter(Boolean);
  // Avoid "Karachi, Karachi" when both columns hold the same value
  return [...new Set(parts)].join(', ') || 'Pakistan';
}

export function getVenueCapacity(venue) {
  return venue?.capacity_max || venue?.capacity || null;
}

/** Returns { amount, unit } — unit is 'plate' or 'day'. */
export function getVenuePrice(venue) {
  if (venue?.price_per_plate) return { amount: Number(venue.price_per_plate), unit: 'plate' };
  if (venue?.price_per_day) return { amount: Number(venue.price_per_day), unit: 'day' };
  return { amount: null, unit: null };
}

/** Average of joined reviews, or null when there are none. */
export function getVenueRating(venue) {
  const reviews = venue?.reviews;
  if (Array.isArray(reviews) && reviews.length) {
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return { value: sum / reviews.length, count: reviews.length };
  }
  if (venue?.rating) return { value: Number(venue.rating), count: venue.review_count || null };
  return null;
}

/** Compact PKR: 1,250 → "Rs 1,250", 250,000 → "Rs 2.5 lac", 12,000,000 → "Rs 1.2 cr". */
export function formatPKRCompact(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  if (v >= 10_000_000) return `Rs ${+(v / 10_000_000).toFixed(1)} cr`;
  if (v >= 100_000) return `Rs ${+(v / 100_000).toFixed(1)} lac`;
  return `Rs ${v.toLocaleString('en-PK')}`;
}
