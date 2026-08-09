import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, ArrowRight, ShieldCheck, Heart, Sparkles, Building2, MapPin } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useVenues } from '../../hooks/useVenues';
import { PAKISTAN_CITIES } from '../../utils/constants';
import { VenueCard } from '../../components/shared/VenueCard';
import { Button } from '../../components/ui';

export default function HomePage() {
  const navigate = useNavigate();
  const setFilters = useUiStore((state) => state.setFilters);

  // Search local form states
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');

  // Featured list (slices to top 6). No explicit status — the service already
  // limits this to publicly visible venues ('live' and legacy 'approved').
  const { data: venues, isLoading, isError } = useVenues();
  const featuredVenues = venues ? venues.slice(0, 6) : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // Clear and set filters in UI state store
    setFilters({
      query: city,
      date: date,
      capacity: guests ? parseInt(guests, 10) : ''
    });

    // Only forward params the listing page actually understands.
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (guests) params.set('guests', guests);
    navigate(`/venues${params.toString() ? `?${params}` : ''}`);
  };

  const handleQuickCitySelect = (cityName) => {
    setFilters({ query: cityName });
    navigate(`/venues?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 bg-stone-50 pb-16">
      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-rose-50 via-stone-50 to-stone-50 px-4 sm:px-6 lg:px-8 py-20 overflow-hidden select-none">
        {/* Warm blush and gold light, blurred behind the content */}
        <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] rounded-full bg-gold-200/35 blur-3xl pointer-events-none" />

        {/* Soft, elegant vector floral corner shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 text-rose-300/25 pointer-events-none transform translate-x-20 -translate-y-20">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-80 h-80 text-gold-300/25 pointer-events-none transform -translate-x-20 translate-y-20">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z" />
          </svg>
        </div>

        <div className="max-w-5xl w-full text-center space-y-8 z-10 relative">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600/10 text-rose-700 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 fill-rose-600/35" /> Pakistan's Leading Venue Network
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-none">
              Find Your Perfect <span className="text-rose-600">Wedding Venue</span>
            </h1>
            {/* <p className="font-serif text-xl sm:text-2xl text-stone-600 font-medium italic max-w-2xl mx-auto">
              خوابوں کی شادی کا آغاز، بہترین مقامات کے ساتھ
            </p> */}
            <p className="text-stone-500 text-sm sm:text-base max-w-lg mx-auto font-light leading-relaxed">
              Browse top-rated banquet halls, premium lawns, and luxury marquees. Check availability, slot limits, and book instantly.
            </p>
          </div>

          {/* Core Horizontal Search Bar Form Panel */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl shadow-lift ring-1 ring-rose-100 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-stretch md:items-center"
          >
            {/* City select */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-stone-200">
              <MapPin className="h-5 w-5 text-rose-500 shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Location</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-stone-850 focus:ring-0 focus:outline-none placeholder:text-stone-400"
                >
                  <option value="">Select City</option>
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Datepicker */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-stone-200">
              <Calendar className="h-5 w-5 text-rose-500 shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Event Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-stone-850 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Guest capacity count */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2">
              <Users className="h-5 w-5 text-rose-500 shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Guests</label>
                <input
                  type="number"
                  placeholder="e.g. 300"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-stone-850 focus:ring-0 focus:outline-none placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="primary"
              className="py-3 px-6 rounded-2xl flex items-center justify-center font-semibold text-sm"
            >
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </form>
        </div>
      </section>

      {/* ── 2. CITY QUICK-SELECT PILLS ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h2 className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest">
          Quick Search By Region
        </h2>
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 scrollbar-none max-w-3xl mx-auto px-4">
          {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad', 'Sialkot'].map((cityName) => (
            <button
              key={cityName}
              onClick={() => handleQuickCitySelect(cityName)}
              className="px-5 py-2 border border-stone-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-stone-700 hover:text-rose-700 text-xs font-semibold rounded-full transition-all shrink-0 shadow-sm"
            >
              {cityName}
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. FEATURED VENUES SECTION ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Top Venues This Season
          </h2>
          <p className="text-stone-500 text-sm font-light max-w-md mx-auto">
            Handpicked popular spaces, premium lawns, and elegant banquets listed by approved vendors.
          </p>
        </div>

        {/* Dynamic fetching loading grid skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse bg-white border border-stone-200 rounded-2xl h-[420px] flex flex-col justify-between p-5 space-y-4">
                <div className="bg-stone-200 h-48 w-full rounded-xl"></div>
                <div className="h-6 bg-stone-200 w-2/3 rounded"></div>
                <div className="h-4 bg-stone-200 w-1/3 rounded"></div>
                <div className="h-10 bg-stone-200 w-full rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl max-w-xl mx-auto">
            Failed to query venues. Please try again later.
          </div>
        ) : featuredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border rounded-2xl text-stone-500 max-w-xl mx-auto">
            No live wedding venues listed in the season currently.
          </div>
        )}
      </section>

      {/* ── 4. HOW IT WORKS ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Simplify Your Booking
          </h2>
          <p className="text-stone-500 text-sm font-light max-w-md mx-auto">
            Securing your dream wedding location has never been more straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div className="space-y-3 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
              1
            </div>
            <h3 className="font-serif font-bold text-stone-900">Search & Discover</h3>
            <p className="text-stone-500 text-xs font-light leading-relaxed">
              Browse top halls, lawns and marquees across major cities. Apply plate pricing and capacity limits filters.
            </p>
          </div>

          <div className="space-y-3 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
              2
            </div>
            <h3 className="font-serif font-bold text-stone-900">Book Date & Slot</h3>
            <p className="text-stone-500 text-xs font-light leading-relaxed">
              Verify slot availability instantly, select your menu package, submit booking details, and block your date.
            </p>
          </div>

          <div className="space-y-3 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
              3
            </div>
            <h3 className="font-serif font-bold text-stone-900">Celebrate Dreams</h3>
            <p className="text-stone-500 text-xs font-light leading-relaxed">
              Upload payment receipt, coordinate setup plans with venue manager vendors, and host a celebration of a lifetime!
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. STATS BAR ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-600 bg-gradient-to-br from-rose-600 via-pink-500 to-gold-400 rounded-3xl p-8 sm:p-12 text-white shadow-lift flex flex-col sm:flex-row justify-around text-center gap-8 relative overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <div className="space-y-1 relative z-10">
            <h4 className="text-3xl sm:text-4xl font-serif font-bold">500+</h4>
            <p className="text-xs text-white/85 font-medium uppercase tracking-wider">Premium Venues</p>
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="text-3xl sm:text-4xl font-serif font-bold">10,000+</h4>
            <p className="text-xs text-white/85 font-medium uppercase tracking-wider">Happy Couples</p>
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="text-3xl sm:text-4xl font-serif font-bold">50+</h4>
            <p className="text-xs text-white/85 font-medium uppercase tracking-wider">Pakistani Cities</p>
          </div>
        </div>
      </section>

      {/* ── 6. CTA BANNER (ARE YOU A HALL OWNER) ──────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-950 ring-1 ring-gold-500/25 rounded-3xl p-8 sm:p-12 text-rose-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.02]" />
          <div className="space-y-3 relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400 uppercase tracking-widest">
              <Building2 className="h-4 w-4" /> Partner With WedEase
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Are you a Hall or Venue Owner?
            </h3>
            <p className="text-rose-200/85 text-xs sm:text-sm font-light leading-relaxed">
              List your banquet halls, lawns, or marquees on Pakistan's premier wedding portal. Coordinate bookings, secure online deposits, and manage schedules with our free admin workspace dashboard.
            </p>
          </div>

          <Button
            onClick={() => navigate('/register')}
            variant="primary"
            className="py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 relative z-10 shrink-0 self-center"
          >
            List Your Venue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
