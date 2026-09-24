import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin, Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, LayoutList, Calendar, Users, RotateCcw, Check, SearchX,
} from 'lucide-react';
import { useVenuesList } from '../../hooks/useVenues';
import VenueCard from '../../components/shared/VenueCard';
import VenueCardSkeleton from '../../components/shared/VenueCardSkeleton';
import { EmptyState } from '../../components/ui';
import { PAKISTAN_CITIES, AMENITIES, VENUE_TYPES } from '../../utils/constants';
import { formatPKRCompact } from '../../utils/venue';
import { formatShortDate } from '../../utils/formatters';

// ─── Constants ───────────────────────────────────────────────────────────────
// Budget is per plate — typical Pakistani wedding menus sit between Rs 1k and 8k.
const PRICE_MIN = 0;
const PRICE_MAX = 10_000;
const PRICE_STEP = 250;
const CAPACITY_MIN = 0;
const CAPACITY_MAX = 3000;
const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const DEFAULT_FILTERS = {
  city: '', query: '', type: '', date: '',
  minPrice: PRICE_MIN, maxPrice: PRICE_MAX, minCapacity: CAPACITY_MIN,
  amenities: [], sort: 'newest', page: 1,
};

// ─── URL param helpers (the URL is the single source of truth) ───────────────
function num(params, key, fallback) {
  const raw = params.get(key);
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function paramsToFilters(params) {
  return {
    city:        params.get('city') || '',
    query:       params.get('q')    || '',
    type:        params.get('type') || '',
    date:        params.get('date') || '',
    minPrice:    num(params, 'minPrice', PRICE_MIN),
    maxPrice:    num(params, 'maxPrice', PRICE_MAX),
    // `guests` kept as an alias for older links
    minCapacity: num(params, 'minCap', num(params, 'guests', CAPACITY_MIN)),
    amenities:   params.get('amenities') ? params.get('amenities').split(',').filter(Boolean) : [],
    sort:        params.get('sort') || 'newest',
    page:        Math.max(1, num(params, 'page', 1)),
  };
}

function filtersToParams(f) {
  const p = {};
  if (f.city)                                p.city = f.city;
  if (f.query)                               p.q = f.query;
  if (f.type)                                p.type = f.type;
  if (f.date)                                p.date = f.date;
  if (f.minPrice !== PRICE_MIN)              p.minPrice = f.minPrice;
  if (f.maxPrice !== PRICE_MAX)              p.maxPrice = f.maxPrice;
  if (f.minCapacity > CAPACITY_MIN)          p.minCap = f.minCapacity;
  if (f.amenities.length)                    p.amenities = f.amenities.join(',');
  if (f.sort !== 'newest')                   p.sort = f.sort;
  if (f.page > 1)                            p.page = f.page;
  return p;
}

/** Only send filters that actually narrow results to the API. */
function toQuery(f) {
  return {
    city: f.city || undefined,
    query: f.query || undefined,
    type: f.type || undefined,
    minPrice: f.minPrice > PRICE_MIN ? f.minPrice : undefined,
    maxPrice: f.maxPrice < PRICE_MAX ? f.maxPrice : undefined,
    minCapacity: f.minCapacity > CAPACITY_MIN ? f.minCapacity : undefined,
    amenities: f.amenities,
    sort: f.sort,
    page: f.page,
    limit: PAGE_LIMIT,
  };
}

const priceLabel = (v, isMax) => (isMax && v >= PRICE_MAX ? `${formatPKRCompact(v)}+` : formatPKRCompact(v));

// ─── Dual range slider ───────────────────────────────────────────────────────
function PriceSlider({ min, max, onMinChange, onMaxChange }) {
  const pct = (v) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2 text-sm">
        <span className="rounded-lg bg-stone-100 px-2.5 py-1 font-semibold text-stone-800">{priceLabel(min)}</span>
        <span className="h-px flex-1 bg-stone-200" />
        <span className="rounded-lg bg-stone-100 px-2.5 py-1 font-semibold text-stone-800">{priceLabel(max, true)}</span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-stone-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
        />
        <input
          type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={min}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - PRICE_STEP))}
          className="range-thumb" aria-label="Minimum price per plate"
        />
        <input
          type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={max}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + PRICE_STEP))}
          className="range-thumb" aria-label="Maximum price per plate"
        />
      </div>
    </div>
  );
}

function CapacitySlider({ value, onChange }) {
  const pct = (value / CAPACITY_MAX) * 100;
  return (
    <div>
      <p className="mb-3 text-sm text-stone-600">
        {value > 0 ? <>At least <strong className="text-stone-900">{value.toLocaleString()}</strong> guests</> : 'Any size'}
      </p>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-stone-200" />
        <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400 to-rose-600" style={{ width: `${pct}%` }} />
        <input
          type="range" min={CAPACITY_MIN} max={CAPACITY_MAX} step={50} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-thumb" aria-label="Minimum guest capacity"
        />
      </div>
    </div>
  );
}

// ─── Filter panel ────────────────────────────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <section className="border-t border-stone-100 py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{title}</h3>
      {children}
    </section>
  );
}

function FilterPanel({ draft, setDraft, onApply, onReset, isDirty, isOpen, onClose }) {
  function toggleAmenity(id) {
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id) ? prev.amenities.filter((a) => a !== id) : [...prev.amenities, id],
    }));
  }

  const body = (
    <>
      <FilterSection title="City">
        <div className="flex flex-wrap gap-2">
          {PAKISTAN_CITIES.map((c) => {
            const active = draft.city === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, city: active ? '' : c }))}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95 ${
                  active
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Budget per plate">
        <PriceSlider
          min={draft.minPrice}
          max={draft.maxPrice}
          onMinChange={(v) => setDraft((prev) => ({ ...prev, minPrice: v }))}
          onMaxChange={(v) => setDraft((prev) => ({ ...prev, maxPrice: v }))}
        />
      </FilterSection>

      <FilterSection title="Guest capacity">
        <CapacitySlider value={draft.minCapacity} onChange={(v) => setDraft((prev) => ({ ...prev, minCapacity: v }))} />
      </FilterSection>

      <FilterSection title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const active = draft.amenities.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-medium transition-all active:scale-95 ${
                  active
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {a.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm lg:hidden animate-in fade-in-0" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
          lg:static lg:z-0 lg:h-auto lg:w-72 lg:[@media(min-height:760px)]:sticky lg:[@media(min-height:760px)]:top-[12.5rem] lg:[@media(min-height:760px)]:max-h-[calc(100vh-14rem)] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:rounded-3xl lg:shadow-soft lg:ring-1 lg:ring-stone-900/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Filters"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold text-stone-900">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </h2>
          <div className="flex items-center gap-1">
            {isDirty && (
              <button onClick={onReset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-stone-500 hover:bg-stone-100 lg:hidden" aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-none">{body}</div>

        <div className="border-t border-stone-100 p-4">
          <button
            onClick={onApply}
            className="h-11 w-full rounded-xl bg-stone-900 text-sm font-semibold text-white shadow-soft transition-all hover:bg-rose-700 active:scale-[0.98]"
          >
            Show results
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 1);
  const end   = Math.min(totalPages, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn = 'grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-all';

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Page navigation">
      <button className={`${btn} text-stone-600 hover:bg-white hover:shadow-soft disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none`} disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <button className={`${btn} text-stone-600 hover:bg-white hover:shadow-soft`} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="px-1 text-stone-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${btn} ${p === page ? 'bg-stone-900 text-white shadow-soft' : 'text-stone-600 hover:bg-white hover:shadow-soft'}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-stone-400">…</span>}
          <button className={`${btn} text-stone-600 hover:bg-white hover:shadow-soft`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button className={`${btn} text-stone-600 hover:bg-white hover:shadow-soft disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none`} disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-3 pr-1 text-[13px] font-medium text-stone-700 shadow-sm ring-1 ring-stone-900/10 animate-in fade-in-0 zoom-in-95">
      {children}
      <button onClick={onRemove} className="grid h-5 w-5 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Remove filter">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function VenueListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsKey = searchParams.toString();

  const filters = useMemo(() => paramsToFilters(searchParams), [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [draft, setDraft] = useState(filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchInput, setSearchInput] = useState(filters.query);

  // Keep the draft panel and search box in step with the URL (incl. back/forward & external links)
  useEffect(() => {
    setDraft(filters);
    setSearchInput(filters.query);
  }, [filters]);

  // Lock page scroll while the mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const setFilters = (updater) => {
    const next = typeof updater === 'function' ? updater(filters) : updater;
    setSearchParams(filtersToParams(next), { replace: true });
  };

  const { data: result, isLoading, isFetching, isError, refetch } = useVenuesList(toQuery(filters));

  const venues      = result?.data  || [];
  const totalCount  = result?.count || 0;
  const totalPages  = Math.ceil(totalCount / PAGE_LIMIT);

  function handleApply() {
    setFilters({ ...draft, query: filters.query, page: 1 });
    setIsSidebarOpen(false);
  }

  function handleReset() {
    setFilters({ ...DEFAULT_FILTERS, sort: filters.sort });
    setIsSidebarOpen(false);
  }

  function handlePageChange(page) {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, query: searchInput.trim(), page: 1 }));
  }

  const priceActive = filters.minPrice !== PRICE_MIN || filters.maxPrice !== PRICE_MAX;
  const activeFilterCount = [
    filters.city,
    filters.query,
    filters.type,
    priceActive,
    filters.minCapacity > CAPACITY_MIN,
    ...filters.amenities,
  ].filter(Boolean).length;

  const draftDirty = Boolean(
    draft.city || draft.minPrice !== PRICE_MIN || draft.maxPrice !== PRICE_MAX ||
    draft.minCapacity > CAPACITY_MIN || draft.amenities.length
  );

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
        <span className="eyebrow">Venues</span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">
          {filters.city ? <>Wedding venues in <span className="italic text-rose-700">{filters.city}</span></> : 'Find your perfect venue'}
        </h1>
      </div>

      {/* ── Sticky search + type bar ───────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-stone-900/5 bg-ivory/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="venue-search-input"
                type="search"
                className="h-12 w-full rounded-full border border-stone-200 bg-white pl-11 pr-24 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100"
                placeholder="Search by venue name…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="absolute right-[4.5rem] top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  onClick={() => { setSearchInput(''); setFilters((prev) => ({ ...prev, query: '', page: 1 })); }}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-rose-700">
                Search
              </button>
            </form>

            <button
              className={`relative inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all lg:hidden ${
                activeFilterCount > 0 ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-800'
              }`}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open filters"
              id="open-filters-btn"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] text-white">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Type segmented chips */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
            {[{ value: '', label: 'All venues' }, ...VENUE_TYPES].map((t) => {
              const active = filters.type === t.value;
              return (
                <button
                  key={t.value || 'all'}
                  onClick={() => setFilters((prev) => ({ ...prev, type: t.value, page: 1 }))}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
                    active ? 'bg-rose-600 text-white shadow-glow' : 'bg-white text-stone-600 ring-1 ring-stone-900/10 hover:text-stone-900 hover:ring-stone-900/20'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-start gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <FilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={handleApply}
          onReset={handleReset}
          isDirty={draftDirty || activeFilterCount > 0}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1" id="venues-main">
          {/* Results bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500" aria-live="polite">
              {isLoading ? (
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Searching venues…</span>
              ) : isError ? (
                <span>Results unavailable</span>
              ) : (
                <>
                  <strong className="text-stone-900">{totalCount.toLocaleString()}</strong> venue{totalCount !== 1 ? 's' : ''} found
                  {isFetching && <span className="ml-2 text-xs text-rose-600">· updating</span>}
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  id="sort-select"
                  aria-label="Sort venues"
                  className="h-10 cursor-pointer appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-9 text-[13px] font-semibold text-stone-700 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              </div>

              <div className="hidden rounded-full bg-white p-1 shadow-sm ring-1 ring-stone-900/10 sm:flex" role="group" aria-label="View mode">
                {[
                  { mode: 'grid', icon: LayoutGrid, id: 'grid-view-btn' },
                  { mode: 'list', icon: LayoutList, id: 'list-view-btn' },
                ].map(({ mode, icon: Icon, id }) => (
                  <button
                    key={mode}
                    id={id}
                    onClick={() => setViewMode(mode)}
                    aria-label={`${mode} view`}
                    aria-pressed={viewMode === mode}
                    className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
                      viewMode === mode ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(activeFilterCount > 0 || filters.date) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {filters.date && (
                <Chip onRemove={() => setFilters((prev) => ({ ...prev, date: '' }))}>
                  <Calendar className="h-3.5 w-3.5 text-rose-500" /> {formatShortDate(filters.date)}
                </Chip>
              )}
              {filters.city && (
                <Chip onRemove={() => setFilters((prev) => ({ ...prev, city: '', page: 1 }))}>
                  <MapPin className="h-3.5 w-3.5 text-rose-500" /> {filters.city}
                </Chip>
              )}
              {filters.type && (
                <Chip onRemove={() => setFilters((prev) => ({ ...prev, type: '', page: 1 }))}>
                  {VENUE_TYPES.find((t) => t.value === filters.type)?.label || filters.type}
                </Chip>
              )}
              {filters.query && (
                <Chip onRemove={() => setFilters((prev) => ({ ...prev, query: '', page: 1 }))}>
                  &ldquo;{filters.query}&rdquo;
                </Chip>
              )}
              {priceActive && (
                <Chip onRemove={() => setFilters((prev) => ({ ...prev, minPrice: PRICE_MIN, maxPrice: PRICE_MAX, page: 1 }))}>
                  {priceLabel(filters.minPrice)} – {priceLabel(filters.maxPrice, true)} / plate
                </Chip>
              )}
              {filters.minCapacity > CAPACITY_MIN && (
                <Chip onRemove={() => setFilters((prev) => ({ ...prev, minCapacity: CAPACITY_MIN, page: 1 }))}>
                  <Users className="h-3.5 w-3.5 text-rose-500" /> {filters.minCapacity}+ guests
                </Chip>
              )}
              {filters.amenities.map((a) => (
                <Chip key={a} onRemove={() => setFilters((prev) => ({ ...prev, amenities: prev.amenities.filter((x) => x !== a), page: 1 }))}>
                  {AMENITIES.find((x) => x.id === a)?.label || a}
                </Chip>
              ))}
              {activeFilterCount > 0 && (
                <button className="px-2 text-[13px] font-semibold text-rose-700 hover:underline" onClick={handleReset}>
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-3xl bg-white ring-1 ring-stone-900/5">
              <EmptyState
                title="We couldn't load venues"
                description="Something went wrong while fetching venues. Please try again."
                action={{ label: 'Retry', onClick: () => refetch() }}
              />
            </div>
          )}

          {/* Skeleton grid */}
          {isLoading && (
            <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-5'}>
              {Array.from({ length: 6 }).map((_, i) => <VenueCardSkeleton key={i} />)}
            </div>
          )}

          {/* Real results */}
          {!isLoading && venues.length > 0 && (
            <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'} ${
              viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-5'
            }`}>
              {venues.map((venue, i) => (
                <div key={venue.id} className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <VenueCard venue={venue} layout={viewMode} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && venues.length === 0 && (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60">
              <EmptyState
                icon={<SearchX className="h-7 w-7" />}
                title="No venues match your search"
                description="Try widening your budget, lowering the guest count, or searching another city."
                action={activeFilterCount > 0 ? { label: 'Clear all filters', onClick: handleReset } : undefined}
              />
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <Pagination page={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </main>
      </div>
    </div>
  );
}
