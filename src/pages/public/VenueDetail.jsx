import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin, Users, Utensils, Star, ChevronLeft, ChevronRight,
  Check, Calendar, Clock, ArrowLeft, Share2, Heart, Wifi,
  Car, Wind, Zap, Music, Camera
} from 'lucide-react';
import { useVenueDetail } from '../../hooks/useVenues';
import { useCreateBooking, useVenueAvailability } from '../../hooks/useBookings';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { bookingSchema } from '../../utils/validators';
import { BOOKING_SLOTS, AMENITIES } from '../../utils/constants';
import { formatCurrency, getTodayDateString, formatDate } from '../../utils/formatDate';
import { Button } from '../../components/ui/Button';

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS = {
  catering:      <Utensils size={16} />,
  sound_system:  <Music size={16} />,
  ac:            <Wind size={16} />,
  generator:     <Zap size={16} />,
  bridal_room:   <Camera size={16} />,
  valet:         <Car size={16} />,
  decor:         <Star size={16} />,
  wifi:          <Wifi size={16} />,
  parking:       <Car size={16} />,
};

// ─── Image Gallery ────────────────────────────────────────────────────────────
const FALLBACK = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';

function Gallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [FALLBACK];

  const prev = () => setActive(i => (i - 1 + list.length) % list.length);
  const next = () => setActive(i => (i + 1) % list.length);

  return (
    <div className="vd-gallery">
      {/* Main image */}
      <div className="vd-gallery-main">
        <img
          key={active}
          src={list[active]}
          alt={`Venue photo ${active + 1}`}
          className="vd-gallery-img"
        />
        {list.length > 1 && (
          <>
            <button className="vd-nav vd-nav--prev" onClick={prev} aria-label="Previous photo">
              <ChevronLeft size={22} />
            </button>
            <button className="vd-nav vd-nav--next" onClick={next} aria-label="Next photo">
              <ChevronRight size={22} />
            </button>
            <div className="vd-gallery-counter">{active + 1} / {list.length}</div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="vd-thumbs">
          {list.slice(0, 5).map((src, i) => (
            <button
              key={i}
              className={`vd-thumb ${i === active ? 'vd-thumb--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} />
              {i === 4 && list.length > 5 && (
                <div className="vd-thumb-more">+{list.length - 5}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Star Rating display ──────────────────────────────────────────────────────
function Stars({ rating = 0, count = 0 }) {
  return (
    <div className="vd-stars">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={15} className={n <= Math.round(rating) ? 'vd-star--filled' : 'vd-star--empty'} />
      ))}
      <span className="vd-rating-val">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
      {count > 0 && <span className="vd-rating-count">({count} reviews)</span>}
    </div>
  );
}

// ─── Booking Widget ───────────────────────────────────────────────────────────
function BookingWidget({ venue, bookings }) {
  const navigate = useNavigate();
  const { session, profile } = useAuthStore();
  const createBookingMutation = useCreateBooking();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { bookingDate: '', slot: 'evening', numberOfGuests: 150 }
  });

  const guests = useWatch({ control, name: 'numberOfGuests', defaultValue: 150 });
  const date   = useWatch({ control, name: 'bookingDate' });
  const slot   = useWatch({ control, name: 'slot' });

  const computedTotal = useMemo(() => {
    if (!venue) return 0;
    return Math.max(
      Number(venue.price_per_plate || 0) * Number(guests || 0),
      Number(venue.min_spending || 0)
    );
  }, [venue, guests]);

  const isSlotTaken = useMemo(() => {
    if (!bookings || !date || !slot) return false;
    return bookings.some(b => b.booking_date === date && b.slot === slot && b.status !== 'cancelled');
  }, [bookings, date, slot]);

  const onSubmit = async (data) => {
    if (isSlotTaken) return;
    try {
      await createBookingMutation.mutateAsync({
        customer_id: profile.id,
        venue_id: venue.id,
        booking_date: data.bookingDate,
        slot: data.slot,
        number_of_guests: parseInt(data.numberOfGuests, 10),
        total_price: computedTotal,
        status: 'pending_approval',
        payment_status: 'unpaid'
      });
      navigate('/my-bookings');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="vd-widget">
      {/* Price header */}
      <div className="vd-widget-price">
        <div>
          <span className="vd-widget-label">Price per plate</span>
          <span className="vd-widget-amount">{formatCurrency(venue.price_per_plate || venue.price_per_day)}</span>
        </div>
        {venue.min_spending && (
          <div className="vd-widget-min">
            Min. spend: <strong>{formatCurrency(venue.min_spending)}</strong>
          </div>
        )}
      </div>

      {/* Quick facts */}
      <div className="vd-widget-facts">
        <div className="vd-fact">
          <Users size={15} />
          <span>Up to <strong>{venue.capacity || venue.capacity_max || '?'}</strong> guests</span>
        </div>
        <div className="vd-fact">
          <MapPin size={15} />
          <span>{venue.city || venue.area || 'Karachi'}</span>
        </div>
      </div>

      {/* Auth gating */}
      {!session ? (
        <div className="vd-widget-auth">
          <p>Sign in to request a booking</p>
          <Link to={`/login?redirect=/venues/${venue.id}`} className="vd-signin-btn">
            Sign In to Book
          </Link>
        </div>
      ) : profile?.role !== 'customer' ? (
        <div className="vd-widget-role-note">
          Booking is only available for Customer accounts.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="vd-form">
          {/* Date */}
          <div className="vd-field">
            <label className="vd-label">
              <Calendar size={13} /> Event Date
            </label>
            <input
              type="date"
              min={getTodayDateString()}
              {...register('bookingDate')}
              className={`vd-input ${errors.bookingDate ? 'vd-input--error' : ''}`}
              id="booking-date"
            />
            {errors.bookingDate && <p className="vd-error">{errors.bookingDate.message}</p>}
          </div>

          {/* Slot */}
          <div className="vd-field">
            <label className="vd-label">
              <Clock size={13} /> Time Slot
            </label>
            <select {...register('slot')} className="vd-input" id="booking-slot">
              {BOOKING_SLOTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Guests */}
          <div className="vd-field">
            <label className="vd-label">
              <Users size={13} /> Number of Guests
            </label>
            <input
              type="number"
              min={1}
              max={venue.capacity || venue.capacity_max || 5000}
              {...register('numberOfGuests')}
              className={`vd-input ${errors.numberOfGuests ? 'vd-input--error' : ''}`}
              id="booking-guests"
            />
            {errors.numberOfGuests && <p className="vd-error">{errors.numberOfGuests.message}</p>}
          </div>

          {/* Slot conflict warning */}
          {isSlotTaken && (
            <div className="vd-slot-taken">
              ⚠️ This date and time slot is already reserved. Please choose another.
            </div>
          )}

          {/* Total */}
          <div className="vd-total">
            <span>Estimated Total</span>
            <strong>{formatCurrency(computedTotal)}</strong>
          </div>

          <button
            type="submit"
            className="vd-book-btn"
            disabled={isSlotTaken || createBookingMutation.isPending}
            id="submit-booking-btn"
          >
            {createBookingMutation.isPending ? 'Sending Request…' : 'Request Booking'}
          </button>
          <p className="vd-book-note">No payment required now. Vendor confirms first.</p>
        </form>
      )}
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
function Reviews({ reviews = [] }) {
  if (reviews.length === 0) return (
    <div className="vd-no-reviews">
      <Star size={32} className="vd-no-reviews-icon" />
      <p>No reviews yet — be the first to book this venue!</p>
    </div>
  );

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="vd-reviews">
      <div className="vd-reviews-header">
        <div className="vd-reviews-avg">
          <span className="vd-reviews-score">{avg}</span>
          <Stars rating={parseFloat(avg)} count={reviews.length} />
        </div>
      </div>
      <div className="vd-reviews-list">
        {reviews.map(r => (
          <div key={r.id} className="vd-review">
            <div className="vd-review-top">
              <div className="vd-reviewer-avatar">
                {(r.customer?.full_name || 'A')[0].toUpperCase()}
              </div>
              <div>
                <span className="vd-reviewer-name">{r.customer?.full_name || 'Anonymous'}</span>
                <div className="vd-review-stars">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={12} className={n <= r.rating ? 'vd-star--filled' : 'vd-star--empty'} />
                  ))}
                </div>
              </div>
              <span className="vd-review-date">{formatDate(r.created_at)}</span>
            </div>
            {r.comment && <p className="vd-review-comment">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useUiStore(s => s.showToast);
  const [wishlist, setWishlist] = useState(false);

  const { data: venue, isLoading, isError } = useVenueDetail(id);
  const { data: bookings } = useVenueAvailability(id);

  const avgRating = useMemo(() => {
    if (!venue?.reviews || venue.reviews.length === 0) return 0;
    return venue.reviews.reduce((s, r) => s + r.rating, 0) / venue.reviews.length;
  }, [venue]);

  const gallery = useMemo(() => {
    if (!venue) return [];
    const imgs = venue.venue_images || venue.images || [];
    if (imgs.length === 0) return [FALLBACK];
    return imgs.map(img =>
      typeof img === 'string' ? img : img.storage_path || img.url || FALLBACK
    );
  }, [venue]);

  if (isLoading) {
    return (
      <div className="vd-loading">
        <div className="vd-spinner" />
        <p>Loading venue details…</p>
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className="vd-error-state">
        <h2>Venue not found</h2>
        <p>This venue may have been removed or is unavailable.</p>
        <Link to="/venues" className="vd-back-link">
          <ArrowLeft size={16} /> Back to listings
        </Link>
      </div>
    );
  }

  const amenityList = Array.isArray(venue.amenities) ? venue.amenities : [];

  return (
    <div className="vd-root">

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="vd-breadcrumb">
        <div className="vd-breadcrumb-inner">
          <button className="vd-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={16} /> Back to listings
          </button>
          <div className="vd-breadcrumb-actions">
            <button
              className="vd-action-btn"
              onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Link copied!', 'success'); }}
              aria-label="Share venue"
            >
              <Share2 size={16} /> Share
            </button>
            <button
              className={`vd-action-btn ${wishlist ? 'vd-action-btn--active' : ''}`}
              onClick={() => setWishlist(w => !w)}
              aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} fill={wishlist ? 'currentColor' : 'none'} />
              {wishlist ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Gallery ────────────────────────────────────────── */}
      <Gallery images={gallery} />

      {/* ── Main content grid ──────────────────────────────── */}
      <div className="vd-content">

        {/* LEFT: Info ─────────────────────────────────────── */}
        <div className="vd-info">

          {/* Header */}
          <div className="vd-info-header">
            <span className="vd-type-badge">{venue.type?.replace('_', ' ') || 'Venue'}</span>
            <h1 className="vd-title">{venue.name}</h1>
            <div className="vd-meta-row">
              <span className="vd-meta-item">
                <MapPin size={14} />
                {[venue.address, venue.area, venue.city].filter(Boolean).join(', ')}
              </span>
              <Stars rating={avgRating} count={venue.reviews?.length || 0} />
            </div>
          </div>

          {/* About */}
          {venue.description && (
            <section className="vd-section">
              <h2 className="vd-section-title">About this space</h2>
              <p className="vd-description">{venue.description}</p>
            </section>
          )}

          {/* Quick specs */}
          <section className="vd-section">
            <h2 className="vd-section-title">Venue Details</h2>
            <div className="vd-specs-grid">
              <div className="vd-spec">
                <Users size={18} className="vd-spec-icon" />
                <div>
                  <span className="vd-spec-label">Capacity</span>
                  <span className="vd-spec-val">
                    {venue.capacity_max
                      ? `${venue.capacity || 50} – ${venue.capacity_max} guests`
                      : `Up to ${venue.capacity || '?'} guests`}
                  </span>
                </div>
              </div>
              <div className="vd-spec">
                <Utensils size={18} className="vd-spec-icon" />
                <div>
                  <span className="vd-spec-label">Price per plate</span>
                  <span className="vd-spec-val">{formatCurrency(venue.price_per_plate || venue.price_per_day)}</span>
                </div>
              </div>
              {venue.min_spending && (
                <div className="vd-spec">
                  <Zap size={18} className="vd-spec-icon" />
                  <div>
                    <span className="vd-spec-label">Minimum spending</span>
                    <span className="vd-spec-val">{formatCurrency(venue.min_spending)}</span>
                  </div>
                </div>
              )}
              {venue.type && (
                <div className="vd-spec">
                  <Camera size={18} className="vd-spec-icon" />
                  <div>
                    <span className="vd-spec-label">Venue type</span>
                    <span className="vd-spec-val capitalize">{venue.type.replace('_', ' ')}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Amenities */}
          {amenityList.length > 0 && (
            <section className="vd-section">
              <h2 className="vd-section-title">Amenities Included</h2>
              <div className="vd-amenities-grid">
                {amenityList.map(a => {
                  const label = AMENITIES.find(x => x.id === a)?.label || a.replace(/_/g, ' ');
                  return (
                    <div key={a} className="vd-amenity">
                      <span className="vd-amenity-icon">
                        {AMENITY_ICONS[a] || <Check size={16} />}
                      </span>
                      <span className="vd-amenity-label">{label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Vendor info */}
          {venue.vendor && (
            <section className="vd-section">
              <h2 className="vd-section-title">Hosted by</h2>
              <div className="vd-vendor">
                <div className="vd-vendor-avatar">
                  {(venue.vendor.full_name || 'V')[0].toUpperCase()}
                </div>
                <div>
                  <span className="vd-vendor-name">{venue.vendor.full_name}</span>
                  {venue.vendor.phone && (
                    <a href={`tel:${venue.vendor.phone}`} className="vd-vendor-phone">
                      📞 {venue.vendor.phone}
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="vd-section">
            <h2 className="vd-section-title">
              Reviews {venue.reviews?.length > 0 && `(${venue.reviews.length})`}
            </h2>
            <Reviews reviews={venue.reviews || []} />
          </section>
        </div>

        {/* RIGHT: Booking widget ─────────────────────────── */}
        <div className="vd-sidebar">
          <BookingWidget venue={venue} bookings={bookings} />
        </div>
      </div>

      {/* ── Scoped styles ────────────────────────────────── */}
      <style>{`
        /* VenueDetail scoped styles */
        .vd-root {
          min-height: 100vh;
          background: #fdf8f8;
          font-family: 'Inter', sans-serif;
          padding-bottom: 60px;
        }

        /* ── Breadcrumb ─────────────────────────────────── */
        .vd-breadcrumb {
          background: #fff;
          border-bottom: 1px solid #f1e8ec;
          padding: 12px 0;
        }
        .vd-breadcrumb-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vd-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.15s;
        }
        .vd-back-btn:hover { color: #e11d48; }
        .vd-breadcrumb-actions { display: flex; gap: 8px; }
        .vd-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          font-size: 0.8rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
        }
        .vd-action-btn:hover { border-color: #e11d48; color: #e11d48; }
        .vd-action-btn--active { color: #e11d48; border-color: #fecdd3; background: #fff5f7; }

        /* ── Gallery ────────────────────────────────────── */
        .vd-gallery {
          max-width: 1200px;
          margin: 24px auto 0;
          padding: 0 24px;
        }
        .vd-gallery-main {
          position: relative;
          width: 100%;
          height: 460px;
          border-radius: 20px;
          overflow: hidden;
          background: #f3f4f6;
        }
        .vd-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }
        .vd-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        .vd-nav:hover { background: #fff; color: #e11d48; }
        .vd-nav--prev { left: 16px; }
        .vd-nav--next { right: 16px; }
        .vd-gallery-counter {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 99px;
          backdrop-filter: blur(4px);
        }
        .vd-thumbs {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .vd-thumb {
          width: 80px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          position: relative;
          transition: all 0.15s;
          padding: 0;
        }
        .vd-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .vd-thumb--active { border-color: #e11d48; }
        .vd-thumb:hover { border-color: #fda4af; }
        .vd-thumb-more {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Content grid ───────────────────────────────── */
        .vd-content {
          max-width: 1200px;
          margin: 32px auto 0;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 36px;
          align-items: flex-start;
        }

        /* ── Info column ────────────────────────────────── */
        .vd-info { min-width: 0; }
        .vd-info-header {
          padding-bottom: 24px;
          border-bottom: 1px solid #f1e8ec;
          margin-bottom: 28px;
        }
        .vd-type-badge {
          display: inline-block;
          background: #fff5f7;
          color: #e11d48;
          border: 1px solid #fecdd3;
          border-radius: 99px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }
        .vd-title {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          margin: 0 0 10px;
          font-family: 'Playfair Display', 'Georgia', serif;
        }
        .vd-meta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .vd-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Stars */
        .vd-stars { display: flex; align-items: center; gap: 3px; }
        .vd-star--filled { color: #f59e0b; fill: #f59e0b; }
        .vd-star--empty  { color: #d1d5db; fill: none; }
        .vd-rating-val { font-weight: 700; font-size: 0.875rem; color: #111827; margin-left: 4px; }
        .vd-rating-count { font-size: 0.8rem; color: #9ca3af; margin-left: 2px; }

        /* Section */
        .vd-section {
          padding-bottom: 28px;
          margin-bottom: 28px;
          border-bottom: 1px solid #f3f4f6;
        }
        .vd-section:last-child { border-bottom: none; }
        .vd-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px;
          font-family: 'Playfair Display', 'Georgia', serif;
        }
        .vd-description {
          font-size: 0.9rem;
          line-height: 1.8;
          color: #4b5563;
          white-space: pre-line;
          margin: 0;
        }

        /* Specs grid */
        .vd-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .vd-spec {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fff;
          border: 1px solid #f1e8ec;
          border-radius: 12px;
          padding: 14px;
        }
        .vd-spec-icon { color: #e11d48; flex-shrink: 0; margin-top: 2px; }
        .vd-spec-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 3px;
        }
        .vd-spec-val { font-size: 0.9rem; font-weight: 600; color: #111827; }

        /* Amenities */
        .vd-amenities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .vd-amenity {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #f1e8ec;
          border-radius: 10px;
          padding: 11px 14px;
        }
        .vd-amenity-icon { color: #e11d48; display: flex; }
        .vd-amenity-label { font-size: 0.85rem; color: #374151; font-weight: 500; }

        /* Vendor */
        .vd-vendor {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 1px solid #f1e8ec;
          border-radius: 14px;
          padding: 16px;
        }
        .vd-vendor-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e11d48, #f43f5e);
          color: #fff;
          font-weight: 700;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vd-vendor-name { display: block; font-weight: 600; color: #111827; font-size: 0.95rem; }
        .vd-vendor-phone {
          display: block;
          font-size: 0.8rem;
          color: #e11d48;
          text-decoration: none;
          margin-top: 3px;
        }
        .vd-vendor-phone:hover { text-decoration: underline; }

        /* Reviews */
        .vd-no-reviews {
          text-align: center;
          padding: 32px;
          background: #fafafa;
          border-radius: 14px;
          border: 1px dashed #e5e7eb;
          color: #9ca3af;
          font-size: 0.875rem;
        }
        .vd-no-reviews-icon { color: #d1d5db; margin: 0 auto 10px; display: block; }
        .vd-reviews-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        .vd-reviews-score {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
          margin-right: 10px;
        }
        .vd-reviews-avg { display: flex; align-items: center; }
        .vd-reviews-list { display: flex; flex-direction: column; gap: 18px; }
        .vd-review {
          background: #fff;
          border: 1px solid #f1e8ec;
          border-radius: 14px;
          padding: 16px;
        }
        .vd-review-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }
        .vd-reviewer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fda4af, #e11d48);
          color: #fff;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vd-reviewer-name { font-weight: 600; font-size: 0.875rem; color: #111827; }
        .vd-review-stars { display: flex; gap: 2px; margin-top: 3px; }
        .vd-review-date { font-size: 0.75rem; color: #9ca3af; margin-left: auto; }
        .vd-review-comment { font-size: 0.875rem; color: #4b5563; line-height: 1.6; margin: 0; }

        /* ── Booking Widget (sidebar) ──────────────────── */
        .vd-sidebar { position: sticky; top: 90px; }
        .vd-widget {
          background: #fff;
          border: 1px solid #f1e8ec;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 24px rgba(225,29,72,0.08);
        }
        .vd-widget-price {
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 16px;
        }
        .vd-widget-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .vd-widget-amount {
          display: block;
          font-size: 1.6rem;
          font-weight: 800;
          color: #e11d48;
          line-height: 1;
        }
        .vd-widget-min {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 6px;
        }
        .vd-widget-facts {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 16px;
        }
        .vd-fact {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #6b7280;
        }
        .vd-fact svg { color: #e11d48; flex-shrink: 0; }
        .vd-widget-auth {
          text-align: center;
          padding: 20px 0;
        }
        .vd-widget-auth p {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 12px;
        }
        .vd-signin-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #e11d48, #f43f5e);
          color: #fff;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .vd-signin-btn:hover { opacity: 0.9; }
        .vd-widget-role-note {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 12px;
          font-size: 0.8rem;
          color: #92400e;
          text-align: center;
        }

        /* Form */
        .vd-form { display: flex; flex-direction: column; gap: 14px; }
        .vd-field { display: flex; flex-direction: column; gap: 5px; }
        .vd-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .vd-input {
          padding: 10px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
          background: #fafafa;
          width: 100%;
          box-sizing: border-box;
        }
        .vd-input:focus { border-color: #e11d48; background: #fff; }
        .vd-input--error { border-color: #f87171; }
        .vd-error { font-size: 0.75rem; color: #ef4444; margin: 0; }
        .vd-slot-taken {
          background: #fff5f5;
          border: 1px solid #fecdd3;
          border-radius: 10px;
          padding: 10px;
          font-size: 0.8rem;
          color: #be123c;
          font-weight: 500;
        }
        .vd-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          background: #fff5f7;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .vd-total strong { font-size: 1.2rem; font-weight: 800; color: #e11d48; }
        .vd-book-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #e11d48, #f43f5e);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(225,29,72,0.3);
        }
        .vd-book-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(225,29,72,0.4); }
        .vd-book-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .vd-book-note {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: center;
          margin: 0;
        }

        /* ── States ─────────────────────────────────────── */
        .vd-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 16px;
          color: #9ca3af;
          font-size: 0.875rem;
        }
        .vd-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid #fecdd3;
          border-top-color: #e11d48;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .vd-error-state {
          text-align: center;
          padding: 80px 20px;
          max-width: 500px;
          margin: 0 auto;
        }
        .vd-error-state h2 { font-size: 1.5rem; color: #111827; margin: 0 0 8px; }
        .vd-error-state p { color: #6b7280; margin: 0 0 20px; }
        .vd-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #e11d48;
          font-weight: 600;
          text-decoration: none;
          font-size: 0.875rem;
        }
        .vd-back-link:hover { text-decoration: underline; }

        /* ── Responsive ─────────────────────────────────── */
        @media (max-width: 900px) {
          .vd-content {
            grid-template-columns: 1fr;
          }
          .vd-sidebar {
            position: static;
            order: -1; /* show booking widget first on mobile */
          }
          .vd-gallery-main { height: 280px; }
          .vd-title { font-size: 1.5rem; }
          .vd-specs-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .vd-gallery, .vd-content, .vd-breadcrumb-inner { padding: 0 14px; }
          .vd-gallery { margin-top: 12px; }
          .vd-gallery-main { height: 220px; border-radius: 14px; }
          .vd-amenities-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
