import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin, Users, Utensils, Star, ChevronLeft, ChevronRight,
  Check, Calendar, Clock, ArrowLeft, Share2, Heart, Wifi,
  Car, Wind, Zap, Music, Sparkles, Palette, X, Info, Phone, MessageSquare
} from 'lucide-react';
import { useVenueDetail } from '../../hooks/useVenues';
import { useCreateBooking, useVenueAvailability } from '../../hooks/useBookings';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { BOOKING_SLOTS, AMENITIES } from '../../utils/constants';
import { formatCurrency, getTodayDateString, formatDate } from '../../utils/formatDate';
import { Spinner } from '../../components/ui/Spinner';

// ─── AMENITY ICONS MAPPING ───────────────────────────────────────────────────
const AMENITY_ICONS = {
  catering:      <Utensils className="h-5 w-5 text-rose-500" />,
  sound_system:  <Music className="h-5 w-5 text-rose-500" />,
  ac:            <Wind className="h-5 w-5 text-rose-500" />,
  generator:     <Zap className="h-5 w-5 text-rose-500" />,
  bridal_room:   <Sparkles className="h-5 w-5 text-rose-500" />,
  valet:         <Car className="h-5 w-5 text-rose-500" />,
  decor:         <Palette className="h-5 w-5 text-rose-500" />,
  wifi:          <Wifi className="h-5 w-5 text-rose-500" />,
  parking:       <Car className="h-5 w-5 text-rose-500" />,
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';

// Helper to check range overlap
const isDateRangeOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(start1);
  const e1 = new Date(end1 || start1);
  const s2 = new Date(start2);
  const e2 = new Date(end2 || start2);
  return s1 <= e2 && s2 <= e1;
};

// Form Validation Schema
const localBookingSchema = z.object({
  bookingDate: z.string().min(1, 'Booking date is required'),
  eventEndDate: z.string().optional().or(z.literal('')),
  slot: z.enum(['afternoon', 'evening', 'full_day']),
  numberOfGuests: z.coerce.number().min(50, 'Minimum 50 guests required'),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.bookingDate && data.eventEndDate) {
    const start = new Date(data.bookingDate);
    const end = new Date(data.eventEndDate);
    return end >= start;
  }
  return true;
}, {
  message: "End date must be on or after start date",
  path: ["eventEndDate"],
});

export default function VenueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);
  const { session, profile } = useAuthStore();

  const { data: venue, isLoading, isError } = useVenueDetail(id);
  const { data: bookings } = useVenueAvailability(id);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return localStorage.getItem(`wishlist_${id}`) === 'true';
    } catch {
      return false;
    }
  });

  const createBookingMutation = useCreateBooking();

  // RHF Setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(localBookingSchema),
    defaultValues: {
      bookingDate: '',
      eventEndDate: '',
      slot: 'evening',
      numberOfGuests: 150,
      notes: '',
    }
  });

  const selectedGuests = useWatch({ control, name: 'numberOfGuests', defaultValue: 150 });
  const selectedDate = useWatch({ control, name: 'bookingDate' });
  const selectedEndDate = useWatch({ control, name: 'eventEndDate' });
  const selectedSlot = useWatch({ control, name: 'slot', defaultValue: 'evening' });

  // Calculate booking days
  const bookingDaysCount = useMemo(() => {
    if (!selectedDate) return 1;
    if (!selectedEndDate) return 1;
    const start = new Date(selectedDate);
    const end = new Date(selectedEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    if (end < start) return 1;
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [selectedDate, selectedEndDate]);

  // Live Price Calculator
  const estimatedTotal = useMemo(() => {
    if (!venue) return 0;
    if (venue.price_per_day) {
      return venue.price_per_day * bookingDaysCount;
    } else {
      const perPlateCost = venue.price_per_plate || 0;
      const base = perPlateCost * (selectedGuests || 0) * bookingDaysCount;
      const minSpendTotal = (venue.min_spending || 0) * bookingDaysCount;
      return Math.max(base, minSpendTotal);
    }
  }, [venue, selectedGuests, bookingDaysCount]);

  // Slot Conflict Detection (Pending bookings included)
  const isConflict = useMemo(() => {
    if (!bookings || !selectedDate) return false;
    return bookings.some(b => {
      // Skip cancelled
      if (b.status === 'cancelled') return false;

      // Check dates overlap
      const overlap = isDateRangeOverlap(
        selectedDate,
        selectedEndDate || selectedDate,
        b.booking_date,
        b.event_end_date
      );
      if (!overlap) return false;

      // Check slots overlap
      const slotOverlap = selectedSlot === 'full_day' || b.slot === 'full_day' || selectedSlot === b.slot;
      return slotOverlap;
    });
  }, [bookings, selectedDate, selectedEndDate, selectedSlot]);

  // Images list
  const gallery = useMemo(() => {
    if (!venue) return [];
    const imgs = venue.venue_images || venue.images || [];
    if (imgs.length === 0) return [FALLBACK_IMAGE];
    return imgs.map(img =>
      typeof img === 'string' ? img : img.storage_path || img.url || FALLBACK_IMAGE
    );
  }, [venue]);

  // Image Navigation
  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev - 1 + gallery.length) % gallery.length);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev + 1) % gallery.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev - 1 + gallery.length) % gallery.length);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev + 1) % gallery.length);
      } else if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, gallery.length]);

  // Wishlist Action
  const toggleWishlist = () => {
    setWishlist(prev => {
      const val = !prev;
      try {
        localStorage.setItem(`wishlist_${id}`, String(val));
      } catch (err) {
        console.error(err);
      }
      showToast(val ? 'Venue saved to your wishlist!' : 'Venue removed from wishlist.', 'success');
      return val;
    });
  };

  // Share Action
  const handleShare = () => {
    try {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied to clipboard! Share it with friends.', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  // Booking Submit handler
  const onSubmit = async (data) => {
    if (isConflict) return;
    try {
      await createBookingMutation.mutateAsync({
        venueId: venue.id,
        customerId: profile.id,
        eventDate: data.bookingDate,
        eventEndDate: data.eventEndDate || null,
        guests: parseInt(data.numberOfGuests, 10),
        notes: data.notes || '',
        totalPrice: estimatedTotal,
        slot: data.slot,
      });
      navigate('/my-bookings');
    } catch (err) {
      console.error(err);
    }
  };

  // Maps URL Generator
  const mapSearchQuery = useMemo(() => {
    if (!venue) return '';
    return encodeURIComponent(`${venue.address || ''}, ${venue.area || ''}, ${venue.city || ''}`);
  }, [venue]);

  const mapIframeUrl = useMemo(() => {
    if (!mapSearchQuery) return '';
    return `https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [mapSearchQuery]);

  // Loading spinner
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-stone-50 text-stone-500 gap-4">
        <Spinner size="lg" />
        <p className="animate-pulse text-sm font-medium tracking-wide">Gathering venue specifications...</p>
      </div>
    );
  }

  // Error block
  if (isError || !venue) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-stone-200 shadow-xl space-y-6">
        <div className="text-4xl text-rose-500">🏛️</div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Venue Specifications Unavailable</h2>
        <p className="text-stone-500 text-sm">We couldn't retrieve information for this listing. It may have been unlisted or is under revision.</p>
        <Link to="/venues" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold text-sm transition">
          <ArrowLeft size={16} /> Return to Listing Directory
        </Link>
      </div>
    );
  }

  const reviewSummaryAvg = venue.reviews?.length > 0 
    ? (venue.reviews.reduce((acc, curr) => acc + curr.rating, 0) / venue.reviews.length) 
    : 0;

  const amenityKeys = Array.isArray(venue.amenities) ? venue.amenities : [];

  return (
    <div className="bg-stone-50 min-h-screen pb-20 font-sans text-stone-850">
      {/* ── 1. BREADCRUMBS & TOP BAR ─────────────────────────────────────── */}
      <div className="bg-white border-b border-rose-100/50 sticky top-[64px] z-30 select-none">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-stone-500 hover:text-rose-600 font-medium text-sm transition"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 hover:border-rose-400 hover:text-rose-600 rounded-xl bg-white text-xs font-semibold text-stone-600 transition"
              aria-label="Copy venue link"
            >
              <Share2 size={14} /> Share
            </button>
            <button
              onClick={toggleWishlist}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-semibold transition ${
                wishlist 
                  ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100/50' 
                  : 'border-stone-200 bg-white text-stone-600 hover:border-rose-300 hover:text-rose-500'
              }`}
              aria-label="Save to wishlist"
            >
              <Heart size={14} fill={wishlist ? 'currentColor' : 'none'} className={wishlist ? 'scale-110 transition-transform' : ''} />
              {wishlist ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. GALLERY HERO ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div 
          className="relative h-[260px] sm:h-[380px] md:h-[480px] w-full rounded-3xl overflow-hidden bg-stone-200 shadow-lg group cursor-zoom-in"
          onClick={() => { setLightboxIndex(activeImageIndex); setLightboxOpen(true); }}
        >
          {/* Main Image */}
          <img
            src={gallery[activeImageIndex]}
            alt={venue.name}
            className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
          />

          {/* Nav Controls */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-50% -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-stone-850 hover:text-rose-600 rounded-full flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
                aria-label="Prev image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-50% -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-stone-850 hover:text-rose-600 rounded-full flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Bottom Indicators */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full select-none">
            {activeImageIndex + 1} / {gallery.length}
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {gallery.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none select-none">
            {gallery.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  activeImageIndex === idx ? 'border-rose-600 scale-95 shadow-md' : 'border-transparent hover:border-rose-300'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 4 && gallery.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 text-white text-xs font-bold flex items-center justify-center">
                    +{gallery.length - 5}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. TWO COLUMN LAYOUT ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: VENUE DETAILS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header block */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider rounded-full border border-rose-100">
                {venue.type ? venue.type.replace('_', ' ') : 'Venue'}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                venue.status === 'live' || venue.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {venue.status === 'live' || venue.status === 'approved' ? '● Live' : 'Under Review'}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {venue.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{[venue.address, venue.area, venue.city].filter(Boolean).join(', ')}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                <span className="font-bold text-stone-850">{reviewSummaryAvg > 0 ? reviewSummaryAvg.toFixed(1) : 'New'}</span>
                {venue.reviews?.length > 0 && (
                  <span className="text-stone-400">({venue.reviews.length} reviews)</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Capacity Limit</span>
              <span className="text-stone-850 font-bold text-base mt-1 flex items-center gap-1.5">
                <Users size={16} className="text-rose-500" />
                {venue.capacity_max 
                  ? `${venue.capacity || 50} - ${venue.capacity_max}` 
                  : `${venue.capacity || '?'} guests`
                }
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {venue.price_per_day ? 'Daily Rent Rate' : 'Plate Starting Cost'}
              </span>
              <span className="text-stone-850 font-bold text-base mt-1 flex items-center gap-1.5">
                <Utensils size={16} className="text-rose-500" />
                {venue.price_per_day 
                  ? `${formatCurrency(venue.price_per_day)}/day` 
                  : `${formatCurrency(venue.price_per_plate)}/plate`
                }
              </span>
            </div>

            {venue.min_spending > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Minimum Spending</span>
                <span className="text-stone-850 font-bold text-base mt-1 flex items-center gap-1.5">
                  <Zap size={16} className="text-rose-500" />
                  {formatCurrency(venue.min_spending)}
                </span>
              </div>
            )}
          </div>

          {/* About Space */}
          {venue.description && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">About this venue</h2>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{venue.description}</p>
            </div>
          )}

          {/* Amenities Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Services & Amenities</h2>
            {amenityKeys.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenityKeys.map((a) => {
                  const details = AMENITIES.find(item => item.id === a) || { label: a.replace(/_/g, ' ') };
                  return (
                    <div key={a} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-100 rounded-xl hover:bg-rose-50/10 transition">
                      <span className="p-1.5 bg-rose-50 rounded-lg shrink-0">
                        {AMENITY_ICONS[a] || <Check className="h-4 w-4 text-rose-500" />}
                      </span>
                      <span className="text-xs font-semibold text-stone-700">{details.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-stone-400 text-xs italic">No specific services declared.</p>
            )}
          </div>

          {/* Map Location */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Venue Address</h2>
            <div className="flex items-start gap-2.5 text-stone-600 text-sm">
              <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{[venue.address, venue.area, venue.city].filter(Boolean).join(', ')}</span>
            </div>
            
            {mapIframeUrl && (
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-stone-200 shadow-inner mt-4">
                <iframe
                  title={`Map location for ${venue.name}`}
                  src={mapIframeUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}
          </div>

          {/* Vendor Details */}
          {venue.vendor && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Management & Host</h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white font-serif font-bold text-lg flex items-center justify-center shadow-md select-none shrink-0">
                  {venue.vendor.full_name ? venue.vendor.full_name[0].toUpperCase() : 'V'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-850 truncate">{venue.vendor.full_name || 'Owner'}</h4>
                  <p className="text-xs text-stone-400 mt-0.5">Verified Vendor Profile</p>
                </div>
                {venue.vendor.phone && (
                  <a
                    href={`tel:${venue.vendor.phone}`}
                    className="flex items-center justify-center h-10 w-10 rounded-full border border-rose-100 bg-rose-50/30 hover:bg-rose-50 text-rose-600 transition"
                    title={`Call host: ${venue.vendor.phone}`}
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/60 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
              Reviews & Feedback {venue.reviews?.length > 0 && `(${venue.reviews.length})`}
            </h2>

            {venue.reviews && venue.reviews.length > 0 ? (
              <div className="space-y-6">
                {/* Score Header */}
                <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-150">
                  <div className="text-center shrink-0 border-r border-stone-200 pr-6">
                    <span className="block text-3xl font-extrabold text-stone-900">{reviewSummaryAvg.toFixed(1)}</span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Average Rating</span>
                  </div>
                  <div className="space-y-1 select-none">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star 
                          key={n} 
                          className={`h-4 w-4 ${n <= Math.round(reviewSummaryAvg) ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500 font-medium">Based on {venue.reviews.length} bookings feedback</span>
                  </div>
                </div>

                {/* Reviews Feed */}
                <div className="space-y-4 divide-y divide-stone-100">
                  {venue.reviews.map((r, i) => (
                    <div key={r.id || i} className={`pt-4 ${i === 0 ? 'pt-0' : ''} space-y-2`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center select-none">
                            {r.customer?.full_name ? r.customer.full_name[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-stone-850">{r.customer?.full_name || 'Customer'}</span>
                            <div className="flex gap-0.5 mt-0.5 select-none">
                              {[1,2,3,4,5].map(n => (
                                <Star 
                                  key={n} 
                                  className={`h-3 w-3 ${n <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-250'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-stone-400">{formatDate(r.created_at)}</span>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-stone-600 leading-relaxed pl-11">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-250 flex flex-col items-center justify-center gap-2 text-stone-400 select-none">
                <MessageSquare size={32} className="stroke-1 text-stone-300" />
                <span className="text-xs font-bold tracking-wide uppercase mt-2">No reviews recorded</span>
                <span className="text-stone-400 text-xs">Be the first to submit booking requests for this hall!</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: BOOKING WIDGET */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-[130px] space-y-6">
            
            {/* Booking Card Widget */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden">
              
              {/* Card Header Price Details */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 border-b border-rose-100/50">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Pricing Model</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-extrabold text-rose-600">
                    {venue.price_per_day 
                      ? formatCurrency(venue.price_per_day) 
                      : formatCurrency(venue.price_per_plate)
                    }
                  </span>
                  <span className="text-xs text-stone-400 font-semibold uppercase">
                    {venue.price_per_day ? '/ Day' : '/ Plate'}
                  </span>
                </div>
                {venue.min_spending > 0 && !venue.price_per_day && (
                  <div className="mt-2 text-stone-400 text-xs flex items-center justify-between">
                    <span>Minimum spend:</span>
                    <strong className="text-stone-700 font-semibold">{formatCurrency(venue.min_spending)}</strong>
                  </div>
                )}
              </div>

              {/* Card Content & Forms */}
              <div className="p-6">
                
                {/* Authenticated Customer Form */}
                {!session ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-stone-500 text-xs">You must be logged in with a Customer profile to place booking requests.</p>
                    <Link
                      to={`/login?redirect=/venues/${id}`}
                      className="block w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/10 text-center transition"
                      id="login-to-book-btn"
                    >
                      Login to Book
                    </Link>
                  </div>
                ) : profile?.role !== 'customer' ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-2.5">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      Booking creation is restricted to Customer users. You are authenticated as an <span className="font-bold capitalize">{profile.role}</span>.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Event Start Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Calendar size={12} className="text-rose-500" /> Start Date *
                      </label>
                      <input
                        type="date"
                        min={getTodayDateString()}
                        {...register('bookingDate')}
                        className={`w-full bg-stone-50 border p-2.5 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:outline-none transition ${
                          errors.bookingDate ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-rose-500'
                        }`}
                        id="event-start-date"
                      />
                      {errors.bookingDate && (
                        <p className="text-red-500 text-[10px] font-medium mt-1">{errors.bookingDate.message}</p>
                      )}
                    </div>

                    {/* Event End Date (Optional) */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Calendar size={12} className="text-stone-400" /> End Date (Optional)
                      </label>
                      <input
                        type="date"
                        min={selectedDate || getTodayDateString()}
                        {...register('eventEndDate')}
                        className={`w-full bg-stone-50 border p-2.5 rounded-xl text-xs font-medium text-stone-850 focus:bg-white focus:outline-none transition ${
                          errors.eventEndDate ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-rose-500'
                        }`}
                        id="event-end-date"
                      />
                      {errors.eventEndDate && (
                        <p className="text-red-500 text-[10px] font-medium mt-1">{errors.eventEndDate.message}</p>
                      )}
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Clock size={12} className="text-rose-500" /> Slot Choice *
                      </label>
                      <select
                        {...register('slot')}
                        className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                        id="booking-slot-select"
                      >
                        {BOOKING_SLOTS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guests Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Users size={12} className="text-rose-500" /> Guest Attendance *
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={venue.capacity_max || venue.capacity || 2000}
                        {...register('numberOfGuests')}
                        className={`w-full bg-stone-50 border p-2.5 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:outline-none transition ${
                          errors.numberOfGuests ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-rose-500'
                        }`}
                        id="booking-guests-count"
                      />
                      {errors.numberOfGuests && (
                        <p className="text-red-500 text-[10px] font-medium mt-1">{errors.numberOfGuests.message}</p>
                      )}
                      <p className="text-[10px] text-stone-400 mt-1">
                        Capacity: {venue.capacity || 50} - {venue.capacity_max || 'No limit'} guests
                      </p>
                    </div>

                    {/* Special Notes (Textarea) */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Special Instructions / Notes
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs font-medium text-stone-850 focus:bg-white focus:outline-none focus:border-rose-500 transition resize-none"
                        placeholder="Specify event type, menu selections, setup details..."
                        id="booking-notes-input"
                      ></textarea>
                    </div>

                    {/* Real-time Conflict Warning Panel */}
                    {isConflict && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-2.5 text-xs text-red-800 leading-relaxed font-medium">
                        <Info className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <span>This schedule (dates and time slot) conflicts with an existing booking. Please try another selection.</span>
                      </div>
                    )}

                    {/* Booking Total summary */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-stone-500 block">Estimated Cost</span>
                        <span className="text-[10px] text-stone-400 font-bold block">
                          {bookingDaysCount} day{bookingDaysCount > 1 ? 's' : ''} duration
                        </span>
                      </div>
                      <span className="text-lg font-black text-rose-600" id="estimated-total-display">
                        {formatCurrency(estimatedTotal)}
                      </span>
                    </div>

                    {/* Request Submit Button */}
                    <button
                      type="submit"
                      disabled={isConflict || createBookingMutation.isPending}
                      className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-[0.99]"
                      id="submit-booking-request-btn"
                    >
                      {createBookingMutation.isPending ? 'Submitting Request...' : 'Send Booking Request'}
                    </button>
                    <p className="text-[10px] text-stone-400 text-center select-none mt-1">Pending requests do not charge your account immediately.</p>
                  </form>
                )}

              </div>
            </div>

            {/* Availability Notice Box */}
            <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 flex items-start gap-2.5">
              <Info className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-normal text-stone-600">
                <span className="font-semibold text-stone-700">Availability Note:</span> Pending reservations and approved bookings are marked as unavailable immediately. Please consult the host regarding any calendar issues.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── 4. LIGHTBOX OVERLAY MODAL ────────────────────────────────────── */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Header */}
          <div className="absolute top-4 right-4 flex items-center gap-4">
            <span className="text-white text-xs font-semibold bg-stone-850/60 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {gallery.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition border border-white/15"
              aria-label="Close Gallery Lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Large Image View */}
          <div className="relative max-w-4xl max-h-[70vh] w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={gallery[lightboxIndex]}
              alt={`Enlarged view ${lightboxIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl transition-all duration-300 transform scale-100"
            />

            {/* Lightbox Nav controls */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex(prev => (prev - 1 + gallery.length) % gallery.length)}
                  className="absolute left-0 sm:-left-16 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full flex items-center justify-center transition"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setLightboxIndex(prev => (prev + 1) % gallery.length)}
                  className="absolute right-0 sm:-right-16 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full flex items-center justify-center transition"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails List */}
          {gallery.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-full px-4 select-none" onClick={e => e.stopPropagation()}>
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden border transition shrink-0 ${
                    lightboxIndex === idx ? 'border-rose-500 scale-95' : 'border-white/15 hover:border-white/40'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
