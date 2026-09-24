import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Calendar, Users, ArrowRight, ShieldCheck, Sparkles, MapPin, CheckCircle2,
  Clock, BadgePercent, Receipt, Star, Building2,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useVenues } from '../../hooks/useVenues';
import { PAKISTAN_CITIES } from '../../utils/constants';
import { VenueCard } from '../../components/shared/VenueCard';
import VenueCardSkeleton from '../../components/shared/VenueCardSkeleton';
import { Reveal } from '../../components/shared/Reveal';
import { EmptyState } from '../../components/ui';

const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

const HERO_IMAGES = {
  main: img('photo-1519167758481-83f550bb49b3', 1000),
  top: img('photo-1511795409834-ef04bbd61622', 600),
  bottom: img('photo-1606800052052-a08af7148866', 600),
};

const VENUE_TYPES = [
  { type: 'hall', label: 'Wedding Halls', blurb: 'Grand, climate-controlled', image: img('photo-1519167758481-83f550bb49b3', 700) },
  { type: 'marquee', label: 'Marquees', blurb: 'Flexible & festive', image: img('photo-1510076857177-7470076d4098', 700) },
  { type: 'banquet', label: 'Banquets', blurb: 'Elegant fine dining', image: img('photo-1511795409834-ef04bbd61622', 700) },
  { type: 'lawn', label: 'Lawns', blurb: 'Open-air under the stars', image: img('photo-1469371670807-013ccf25f16a', 700) },
];

const STEPS = [
  { icon: Search, title: 'Discover', text: 'Filter halls, lawns and marquees by city, guest count, budget and amenities.' },
  { icon: Calendar, title: 'Reserve your slot', text: 'Check live date availability, pick your slot and menu, and send a booking request.' },
  { icon: Sparkles, title: 'Celebrate', text: 'Upload your deposit receipt, coordinate with the venue, and enjoy the big day.' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified venues only', text: 'Every listing is reviewed by our team before it goes live.', wide: true },
  { icon: Clock, title: 'Real-time availability', text: 'No more back-and-forth calls to check a date.' },
  { icon: BadgePercent, title: 'Transparent pricing', text: 'Per-plate and per-day rates, upfront.' },
  { icon: Receipt, title: 'Secure deposits', text: 'Upload payment receipts and track every booking status in one dashboard.', wide: true },
];

const STATS = [
  { value: '500+', label: 'Premium venues' },
  { value: '10k+', label: 'Happy couples' },
  { value: '50+', label: 'Cities covered' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const setFilters = useUiStore((state) => state.setFilters);

  // Search local form states
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');

  // Fetch approved venues for the featured list (slices to top 6)
  const { data: venues, isLoading, isError, refetch } = useVenues({ status: 'approved' });
  const featuredVenues = venues ? venues.slice(0, 6) : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setFilters({
      query: city,
      date: date,
      capacity: guests ? parseInt(guests, 10) : ''
    });

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (date) params.set('date', date);
    if (guests) params.set('minCap', guests);
    navigate(`/venues${params.toString() ? `?${params}` : ''}`);
  };

  const handleQuickCitySelect = (cityName) => {
    setFilters({ query: cityName });
    navigate(`/venues?city=${encodeURIComponent(cityName)}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="overflow-x-clip">
      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      <section className="relative -mt-16 pt-16">
        {/* Gradient mesh backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-rose-200/60 blur-[110px]" />
          <div className="absolute top-20 right-0 h-[28rem] w-[28rem] rounded-full bg-gold-100/80 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-100/70 blur-[90px]" />
          <div className="bg-grain absolute inset-0 opacity-60" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
          {/* Copy + search */}
          <div className="lg:col-span-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-stone-700 shadow-soft ring-1 ring-stone-900/5 backdrop-blur">
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">New</span>
              Pakistan&apos;s smartest wedding venue marketplace
            </span>

            <h1 className="mt-6 font-serif text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-[4.25rem]">
              Your dream wedding,{' '}
              <span className="relative whitespace-nowrap italic text-gradient">beautifully</span>{' '}
              booked.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
              Discover handpicked banquet halls, lawns and marquees. Compare prices, check live
              availability and reserve your date — all in one place.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 grid grid-cols-1 gap-1 rounded-3xl bg-white/90 p-2 shadow-lift ring-1 ring-stone-900/5 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_0.85fr_auto] lg:rounded-full"
            >
              <label className="group flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-stone-50 lg:rounded-full">
                <MapPin className="h-5 w-5 shrink-0 text-rose-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">Location</span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full cursor-pointer appearance-none truncate bg-transparent p-0 text-sm font-semibold text-stone-900 focus:outline-none"
                    aria-label="City"
                  >
                    <option value="">Any city</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-stone-50 lg:rounded-full lg:border-l lg:border-stone-100">
                <Calendar className="h-5 w-5 shrink-0 text-rose-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">Event date</span>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full bg-transparent p-0 text-sm font-semibold focus:outline-none ${date ? 'text-stone-900' : 'text-stone-400'}`}
                    aria-label="Event date"
                  />
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors hover:bg-stone-50 lg:rounded-full lg:border-l lg:border-stone-100">
                <Users className="h-5 w-5 shrink-0 text-rose-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400">Guests</span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder="e.g. 300"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-transparent p-0 text-sm font-semibold text-stone-900 placeholder:font-medium placeholder:text-stone-400 focus:outline-none"
                    aria-label="Number of guests"
                  />
                </span>
              </label>

              <button
                type="submit"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-700 px-7 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-110 active:scale-[0.98] sm:col-span-2 lg:col-span-1 lg:rounded-full"
              >
                <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
                Search venues
              </button>
            </form>

            {/* Trust row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-stone-600">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified listings</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live availability</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Secure deposits</span>
            </div>
          </div>

          {/* Visual collage */}
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto grid h-[34rem] max-w-md grid-cols-5 grid-rows-6 gap-4">
              <div className="col-span-3 row-span-6 overflow-hidden rounded-[2rem] shadow-lift animate-in fade-in-0 zoom-in-95 duration-1000">
                <img src={HERO_IMAGES.main} alt="Decorated wedding hall" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 row-start-1 mt-10 overflow-hidden rounded-[1.75rem] shadow-lift animate-in fade-in-0 slide-in-from-top-6 duration-1000">
                <img src={HERO_IMAGES.top} alt="Wedding table setting" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 mb-10 overflow-hidden rounded-[1.75rem] shadow-lift animate-in fade-in-0 slide-in-from-bottom-6 duration-1000">
                <img src={HERO_IMAGES.bottom} alt="Wedding rings" className="h-full w-full object-cover" />
              </div>

              {/* Floating cards */}
              <div className="absolute -left-10 top-16 flex items-center gap-3 rounded-2xl bg-white/90 p-3 pr-5 shadow-lift ring-1 ring-stone-900/5 backdrop-blur animate-float">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Booking confirmed</p>
                  <p className="text-xs text-stone-500">Evening slot · 450 guests</p>
                </div>
              </div>

              <div className="absolute -right-6 bottom-20 rounded-2xl bg-stone-900/90 p-4 text-white shadow-lift backdrop-blur animate-float [animation-delay:-3s]">
                <div className="flex items-center gap-1 text-gold-300">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <p className="mt-1.5 text-sm font-semibold">Loved by couples</p>
                <p className="text-xs text-stone-400">across Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* City marquee */}
        <div className="border-y border-stone-900/5 bg-white/60 py-5 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
            <p className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400 sm:block">
              Explore by city
            </p>
            <div className="group relative flex-1 overflow-hidden mask-fade-x">
              <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
                {[...PAKISTAN_CITIES, ...PAKISTAN_CITIES].map((cityName, i) => (
                  <button
                    key={`${cityName}-${i}`}
                    onClick={() => handleQuickCitySelect(cityName)}
                    tabIndex={i >= PAKISTAN_CITIES.length ? -1 : 0}
                    aria-hidden={i >= PAKISTAN_CITIES.length || undefined}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700 hover:shadow-soft"
                  >
                    <MapPin className="h-3.5 w-3.5 text-rose-400" /> {cityName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BROWSE BY TYPE ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Find your style</span>
            <h2 className="section-title mt-3">Every kind of celebration</h2>
          </div>
          <Link to="/venues" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-rose-700">
            Browse all venues <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {VENUE_TYPES.map((t, i) => (
            <Reveal key={t.type} delay={i * 80}>
              <Link
                to={`/venues?type=${t.type}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-stone-200 shadow-soft"
              >
                <img
                  src={t.image}
                  alt={t.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-serif text-lg font-semibold text-white sm:text-2xl">{t.label}</h3>
                  <p className="mt-0.5 text-xs text-white/75 sm:text-sm">{t.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 3. FEATURED VENUES ────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Handpicked for you</span>
            <h2 className="section-title mt-3">Top venues this season</h2>
            <p className="mt-3 text-stone-500">
              Popular halls, premium lawns and elegant banquets from verified vendors.
            </p>
          </Reveal>

          <div className="mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => <VenueCardSkeleton key={n} />)}
              </div>
            ) : isError ? (
              <div className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-ivory">
                <EmptyState
                  icon={<Building2 className="h-7 w-7" />}
                  title="We couldn't load venues right now"
                  description="Please check your connection and try again in a moment."
                  action={{ label: 'Try again', onClick: () => refetch() }}
                />
              </div>
            ) : featuredVenues.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredVenues.map((venue, i) => (
                  <Reveal key={venue.id} delay={(i % 3) * 90}>
                    <VenueCard venue={venue} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-stone-300 bg-ivory">
                <EmptyState
                  icon={<Building2 className="h-7 w-7" />}
                  title="New venues are on their way"
                  description="Our vendors are adding their spaces. Check back soon, or list your own venue today."
                  action={{ label: 'List your venue', onClick: () => navigate('/register') }}
                />
              </div>
            )}
          </div>

          {featuredVenues.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                to="/venues"
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-stone-200 bg-white px-6 text-sm font-semibold text-stone-900 shadow-soft transition-all hover:border-stone-300 hover:shadow-lift"
              >
                View all venues <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title mt-3">Booking made effortless</h2>
        </Reveal>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent md:block" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 120} className="relative text-center">
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-rose-600 shadow-lift ring-1 ring-stone-900/5">
                <s.icon className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-stone-900">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-500">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 5. WHY WEDEASE (bento) ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-rose-900 p-8 text-white shadow-lift md:row-span-2">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-300/20 blur-3xl" aria-hidden="true" />
            <span className="eyebrow text-rose-100">Why WedEase</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Less stress, more celebration.
            </h2>
            <p className="mt-4 text-rose-100/90">
              We bring the whole venue hunt online — so you can spend your energy on what matters.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-serif text-2xl font-semibold sm:text-3xl">{s.value}</dd>
                  <dd className="mt-1 text-xs text-rose-100/80">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 80}
              className={`group rounded-3xl bg-white p-7 shadow-soft ring-1 ring-stone-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${f.wide ? 'md:col-span-2' : ''}`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-serif text-lg font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 6. VENDOR CTA ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-14 text-center sm:px-12 lg:py-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-rose-600/30 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow text-gold-300">
              <Building2 className="h-4 w-4" /> For venue owners
            </span>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-white sm:text-5xl">
              Fill your calendar with <span className="italic text-gold-300">WedEase</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-stone-400">
              List your hall, lawn or marquee for free. Manage bookings, deposits and schedules
              from a beautiful vendor dashboard.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-7 text-sm font-semibold text-stone-900 shadow-lg shadow-gold-500/20 transition-all hover:brightness-105 active:scale-95"
              >
                List your venue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Vendor login
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
