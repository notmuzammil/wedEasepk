import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react';
import { useVenuesList } from '../../hooks/useVenues';
import VenueCard from '../../components/shared/VenueCard';
import VenueCardSkeleton from '../../components/shared/VenueCardSkeleton';
import { PAKISTAN_CITIES, AMENITIES } from '../../utils/constants';

// ─── Constants ───────────────────────────────────────────────────────────────
const PRICE_MIN = 50_000;
const PRICE_MAX = 5_000_000;
const CAPACITY_MIN = 50;
const CAPACITY_MAX = 3000;
const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

function formatPKR(n) {
  if (n >= 1_000_000) return `₨${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₨${Math.round(n / 1_000)}K`;
  return `₨${n}`;
}

// ─── URL param helpers ────────────────────────────────────────────────────────
function paramsToFilters(params) {
  return {
    city:        params.get('city')       || '',
    query:       params.get('q')          || '',
    minPrice:    params.get('minPrice')   ? Number(params.get('minPrice'))   : PRICE_MIN,
    maxPrice:    params.get('maxPrice')   ? Number(params.get('maxPrice'))   : PRICE_MAX,
    minCapacity: params.get('minCap')     ? Number(params.get('minCap'))     : CAPACITY_MIN,
    amenities:   params.get('amenities')  ? params.get('amenities').split(',') : [],
    sort:        params.get('sort')       || 'newest',
    page:        params.get('page')       ? Number(params.get('page'))       : 1,
  };
}

function filtersToParams(filters) {
  const p = {};
  if (filters.city)                                  p.city     = filters.city;
  if (filters.query)                                 p.q        = filters.query;
  if (filters.minPrice  && filters.minPrice  !== PRICE_MIN)    p.minPrice = filters.minPrice;
  if (filters.maxPrice  && filters.maxPrice  !== PRICE_MAX)    p.maxPrice = filters.maxPrice;
  if (filters.minCapacity && filters.minCapacity !== CAPACITY_MIN) p.minCap = filters.minCapacity;
  if (filters.amenities && filters.amenities.length)           p.amenities = filters.amenities.join(',');
  if (filters.sort      && filters.sort !== 'newest')          p.sort     = filters.sort;
  if (filters.page      && filters.page  !== 1)                p.page     = filters.page;
  return p;
}

// ─── Price Range Slider ───────────────────────────────────────────────────────
function PriceSlider({ min, max, onMinChange, onMaxChange }) {
  return (
    <div className="price-slider">
      <div className="price-labels">
        <span>{formatPKR(min)}</span>
        <span>{formatPKR(max)}</span>
      </div>
      <div className="range-track">
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50_000}
          value={min}
          onChange={e => onMinChange(Math.min(Number(e.target.value), max - 50_000))}
          className="range-input range-input--min"
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50_000}
          value={max}
          onChange={e => onMaxChange(Math.max(Number(e.target.value), min + 50_000))}
          className="range-input range-input--max"
        />
      </div>
    </div>
  );
}

// ─── Capacity Slider ──────────────────────────────────────────────────────────
function CapacitySlider({ value, onChange }) {
  return (
    <div className="price-slider">
      <div className="price-labels">
        <span>Min {value} guests</span>
      </div>
      <input
        type="range"
        min={CAPACITY_MIN}
        max={CAPACITY_MAX}
        step={50}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="range-input"
        style={{ width: '100%' }}
      />
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, draft, setDraft, onApply, onReset, isOpen, onClose }) {
  const noneActive =
    !filters.city &&
    filters.minPrice === PRICE_MIN &&
    filters.maxPrice === PRICE_MAX &&
    filters.minCapacity === CAPACITY_MIN &&
    filters.amenities.length === 0;

  function toggleAmenity(id) {
    setDraft(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="filter-backdrop" onClick={onClose} />}

      <aside className={`filter-panel ${isOpen ? 'filter-panel--open' : ''}`}>
        <div className="filter-header">
          <h2 className="filter-title">
            <SlidersHorizontal size={18} />
            Filters
          </h2>
          {!noneActive && (
            <button className="filter-reset-btn" onClick={onReset}>
              Reset all
            </button>
          )}
          <button className="filter-close-btn" onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>

        {/* City ──────────────────────────────────── */}
        <section className="filter-section">
          <h3 className="filter-section-title">City</h3>
          <div className="city-pill-grid">
            {PAKISTAN_CITIES.map(c => (
              <button
                key={c}
                className={`city-pill ${draft.city === c ? 'city-pill--active' : ''}`}
                onClick={() => setDraft(prev => ({ ...prev, city: prev.city === c ? '' : c, page: 1 }))}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Price ─────────────────────────────────── */}
        <section className="filter-section">
          <h3 className="filter-section-title">Price per plate</h3>
          <PriceSlider
            min={draft.minPrice}
            max={draft.maxPrice}
            onMinChange={v => setDraft(prev => ({ ...prev, minPrice: v, page: 1 }))}
            onMaxChange={v => setDraft(prev => ({ ...prev, maxPrice: v, page: 1 }))}
          />
        </section>

        {/* Capacity ───────────────────────────────── */}
        <section className="filter-section">
          <h3 className="filter-section-title">Minimum capacity</h3>
          <CapacitySlider
            value={draft.minCapacity}
            onChange={v => setDraft(prev => ({ ...prev, minCapacity: v, page: 1 }))}
          />
        </section>

        {/* Amenities ──────────────────────────────── */}
        <section className="filter-section">
          <h3 className="filter-section-title">Amenities</h3>
          <div className="amenities-list">
            {AMENITIES.map(a => (
              <label key={a.id} className="amenity-row">
                <input
                  type="checkbox"
                  className="amenity-checkbox"
                  checked={draft.amenities.includes(a.id)}
                  onChange={() => toggleAmenity(a.id)}
                />
                <span className="amenity-label">{a.label}</span>
              </label>
            ))}
          </div>
        </section>

        <button className="apply-btn" onClick={onApply}>
          Apply Filters
        </button>
      </aside>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Page navigation">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="page-ellipsis">…</span>}
          <button className="page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function VenueListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Sync state from URL
  const [filters, setFilters] = useState(() => paramsToFilters(searchParams));
  // Draft state (edited in sidebar before Apply)
  const [draft, setDraft] = useState(filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchInput, setSearchInput] = useState(filters.query);

  // Push filter changes to URL
  const syncUrl = useCallback((f) => {
    setSearchParams(filtersToParams(f), { replace: true });
  }, [setSearchParams]);

  // Fetch data
  const { data: result, isLoading, isFetching, isError } = useVenuesList({
    ...filters,
    limit: PAGE_LIMIT,
  });

  const venues      = result?.data  || [];
  const totalCount  = result?.count || 0;
  const totalPages  = Math.ceil(totalCount / PAGE_LIMIT);

  // Sync URL on filter change
  useEffect(() => {
    syncUrl(filters);
    setDraft(filters);
  }, [filters, syncUrl]);

  // Keep search input in sync when URL changes externally
  useEffect(() => {
    const fromUrl = paramsToFilters(searchParams);
    setFilters(fromUrl);
    setSearchInput(fromUrl.query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  function handleApply() {
    setFilters({ ...draft, page: 1 });
    setIsSidebarOpen(false);
  }

  function handleReset() {
    const fresh = {
      city: '', query: '', minPrice: PRICE_MIN, maxPrice: PRICE_MAX,
      minCapacity: CAPACITY_MIN, amenities: [], sort: 'newest', page: 1,
    };
    setDraft(fresh);
    setFilters(fresh);
    setSearchInput('');
    setIsSidebarOpen(false);
  }

  function handleSortChange(sort) {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  }

  function handlePageChange(page) {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: searchInput.trim(), page: 1 }));
  }

  const activeFilterCount = [
    filters.city,
    filters.query,
    filters.minPrice !== PRICE_MIN || filters.maxPrice !== PRICE_MAX,
    filters.minCapacity !== CAPACITY_MIN,
    ...filters.amenities,
  ].filter(Boolean).length;

  return (
    <div className="vlp-root">
      {/* ── Top Search Bar ─────────────────────────── */}
      <div className="vlp-top-bar">
        <div className="vlp-top-bar-inner">
          <form className="vlp-search-form" onSubmit={handleSearchSubmit}>
            <Search size={18} className="vlp-search-icon" />
            <input
              id="venue-search-input"
              type="text"
              className="vlp-search-input"
              placeholder="Search venues by name, city…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="vlp-search-clear"
                onClick={() => { setSearchInput(''); setFilters(prev => ({ ...prev, query: '', page: 1 })); }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <button
            className={`vlp-filter-toggle ${activeFilterCount > 0 ? 'vlp-filter-toggle--active' : ''}`}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open filters"
            id="open-filters-btn"
          >
            <SlidersHorizontal size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Active Filter Chips ─────────────────────── */}
      {activeFilterCount > 0 && (
        <div className="vlp-chips">
          {filters.city && (
            <span className="filter-chip">
              <MapPin size={12} />
              {filters.city}
              <button onClick={() => setFilters(prev => ({ ...prev, city: '', page: 1 }))}><X size={12} /></button>
            </span>
          )}
          {filters.query && (
            <span className="filter-chip">
              "{filters.query}"
              <button onClick={() => { setSearchInput(''); setFilters(prev => ({ ...prev, query: '', page: 1 })); }}><X size={12} /></button>
            </span>
          )}
          {(filters.minPrice !== PRICE_MIN || filters.maxPrice !== PRICE_MAX) && (
            <span className="filter-chip">
              {formatPKR(filters.minPrice)} – {formatPKR(filters.maxPrice)}
              <button onClick={() => setFilters(prev => ({ ...prev, minPrice: PRICE_MIN, maxPrice: PRICE_MAX, page: 1 }))}><X size={12} /></button>
            </span>
          )}
          {filters.minCapacity !== CAPACITY_MIN && (
            <span className="filter-chip">
              {filters.minCapacity}+ guests
              <button onClick={() => setFilters(prev => ({ ...prev, minCapacity: CAPACITY_MIN, page: 1 }))}><X size={12} /></button>
            </span>
          )}
          {filters.amenities.map(a => {
            const label = AMENITIES.find(x => x.id === a)?.label || a;
            return (
              <span key={a} className="filter-chip">
                {label}
                <button onClick={() => setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(x => x !== a), page: 1 }))}><X size={12} /></button>
              </span>
            );
          })}
          <button className="clear-all-chips" onClick={handleReset}>Clear all</button>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────── */}
      <div className="vlp-body">
        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          draft={draft}
          setDraft={setDraft}
          onApply={handleApply}
          onReset={handleReset}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="vlp-main" id="venues-main">
          {/* Results bar */}
          <div className="results-bar">
            <p className="results-count">
              {isLoading ? (
                <span className="results-loading">Searching venues…</span>
              ) : (
                <>
                  <strong>{totalCount.toLocaleString()}</strong> venue{totalCount !== 1 ? 's' : ''} found
                  {filters.city && <> in <span className="results-city">{filters.city}</span></>}
                </>
              )}
              {isFetching && !isLoading && <span className="results-updating"> · updating…</span>}
            </p>

            <div className="results-controls">
              {/* Sort */}
              <div className="sort-wrapper">
                <label className="sort-label" htmlFor="sort-select">Sort:</label>
                <div className="sort-select-wrap">
                  <select
                    id="sort-select"
                    className="sort-select"
                    value={filters.sort}
                    onChange={e => handleSortChange(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="sort-chevron" />
                </div>
              </div>

              {/* View mode */}
              <div className="view-toggle" role="group" aria-label="View mode">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  id="grid-view-btn"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  id="list-view-btn"
                >
                  <LayoutList size={16} />
                </button>
              </div>

              {/* Desktop filter toggle */}
              <button
                className="desktop-filter-btn"
                onClick={() => setIsSidebarOpen(prev => !prev)}
                id="desktop-filters-btn"
              >
                <SlidersHorizontal size={15} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="vlp-error">
              <p>Something went wrong loading venues. Please try again.</p>
              <button className="error-retry-btn" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {/* Skeleton grid */}
          {isLoading && (
            <div className={`venues-grid venues-grid--${viewMode}`}>
              {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                <VenueCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Real results */}
          {!isLoading && venues.length > 0 && (
            <div className={`venues-grid venues-grid--${viewMode}`}>
              {venues.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && venues.length === 0 && (
            <div className="vlp-empty">
              <div className="vlp-empty-icon">🔍</div>
              <h2>No venues found</h2>
              <p>Try adjusting your filters or searching in a different city.</p>
              <button className="vlp-empty-reset" onClick={handleReset}>
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>

      <style>{`
        /* ────────────────────────────────────────────────────────
           VenueListingPage — Scoped Styles
        ──────────────────────────────────────────────────────── */
        .vlp-root {
          min-height: 100vh;
          background: #fdf8f8;
          font-family: 'Inter', sans-serif;
        }

        /* ── Top Search Bar ─────────────────────────────────── */
        .vlp-top-bar {
          background: #fff;
          border-bottom: 1px solid #f1e8ec;
          padding: 14px 0;
          position: sticky;
          top: 64px;
          z-index: 100;
        }
        .vlp-top-bar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .vlp-search-form {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .vlp-search-icon {
          position: absolute;
          left: 14px;
          color: #9ca3af;
          pointer-events: none;
        }
        .vlp-search-input {
          width: 100%;
          padding: 10px 40px 10px 42px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          background: #f9fafb;
        }
        .vlp-search-input:focus {
          border-color: #e11d48;
          background: #fff;
        }
        .vlp-search-clear {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          padding: 4px;
        }
        .vlp-filter-toggle {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          position: relative;
        }
        .vlp-filter-toggle--active {
          border-color: #e11d48;
          color: #e11d48;
          background: #fff5f7;
        }
        .filter-badge {
          background: #e11d48;
          color: #fff;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 1px 6px;
          min-width: 18px;
          text-align: center;
        }

        /* ── Active Filter Chips ─────────────────────────── */
        .vlp-chips {
          max-width: 1400px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fff5f7;
          color: #c21d47;
          border: 1px solid #fecdd3;
          border-radius: 99px;
          padding: 4px 10px 4px 10px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .filter-chip button {
          background: none;
          border: none;
          cursor: pointer;
          color: #e11d48;
          display: flex;
          padding: 0;
          margin-left: 2px;
        }
        .clear-all-chips {
          background: none;
          border: none;
          color: #e11d48;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          padding: 0 6px;
        }

        /* ── Body layout ───────────────────────────────────── */
        .vlp-body {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }

        /* ── Filter Panel ──────────────────────────────────── */
        .filter-backdrop {
          display: none;
        }
        .filter-panel {
          width: 272px;
          flex-shrink: 0;
          background: #fff;
          border: 1px solid #f1e8ec;
          border-radius: 16px;
          padding: 20px;
          position: sticky;
          top: 130px;
          max-height: calc(100vh - 160px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #fecdd3 transparent;
        }
        .filter-panel::-webkit-scrollbar { width: 4px; }
        .filter-panel::-webkit-scrollbar-thumb { background: #fecdd3; border-radius: 4px; }

        .filter-header {
          display: flex;
          align-items: center;
          margin-bottom: 18px;
          gap: 8px;
        }
        .filter-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 7px;
          flex: 1;
          margin: 0;
        }
        .filter-reset-btn {
          background: none;
          border: none;
          color: #e11d48;
          font-size: 0.8rem;
          cursor: pointer;
          white-space: nowrap;
          font-weight: 500;
        }
        .filter-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          padding: 2px;
          display: none; /* hidden on desktop; shown on mobile */
        }
        .filter-section {
          border-top: 1px solid #f3f4f6;
          padding-top: 14px;
          margin-top: 14px;
        }
        .filter-section-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 10px 0;
        }

        /* City pills */
        .city-pill-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .city-pill {
          padding: 5px 11px;
          border-radius: 99px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s;
          font-weight: 500;
          color: #374151;
        }
        .city-pill:hover { border-color: #e11d48; color: #e11d48; }
        .city-pill--active {
          border-color: #e11d48;
          background: #fff5f7;
          color: #e11d48;
        }

        /* Price/Capacity sliders */
        .price-slider { margin-top: 8px; }
        .price-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .range-track { position: relative; }
        .range-input {
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 99px;
          background: linear-gradient(to right, #fecdd3, #e11d48);
          outline: none;
          cursor: pointer;
          display: block;
          margin: 4px 0;
        }
        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #e11d48;
          border: 2px solid #fff;
          box-shadow: 0 1px 6px rgba(225,29,72,0.4);
          cursor: pointer;
        }

        /* Amenities */
        .amenities-list { display: flex; flex-direction: column; gap: 8px; }
        .amenity-row {
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }
        .amenity-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #e11d48;
          cursor: pointer;
          flex-shrink: 0;
        }
        .amenity-label { font-size: 0.85rem; color: #374151; }

        /* Apply button */
        .apply-btn {
          margin-top: 18px;
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #e11d48, #f43f5e);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .apply-btn:hover { opacity: 0.92; transform: translateY(-1px); }

        /* ── Main Results Area ──────────────────────────────── */
        .vlp-main { flex: 1; min-width: 0; }

        .results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .results-count { font-size: 0.9rem; color: #6b7280; margin: 0; }
        .results-count strong { color: #111827; }
        .results-city { color: #e11d48; font-weight: 600; }
        .results-loading { color: #9ca3af; font-style: italic; }
        .results-updating { color: #e11d48; font-size: 0.8rem; }

        .results-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Sort */
        .sort-label { font-size: 0.85rem; color: #6b7280; }
        .sort-wrapper { display: flex; align-items: center; gap: 6px; }
        .sort-select-wrap { position: relative; }
        .sort-select {
          appearance: none;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 7px 30px 7px 11px;
          font-size: 0.85rem;
          color: #374151;
          cursor: pointer;
          outline: none;
          font-weight: 500;
        }
        .sort-select:focus { border-color: #e11d48; }
        .sort-chevron {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #9ca3af;
        }

        /* View toggle */
        .view-toggle {
          display: flex;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .view-btn {
          background: #fff;
          border: none;
          padding: 7px 10px;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .view-btn--active { background: #fff5f7; color: #e11d48; }
        .view-btn:not(:last-child) { border-right: 1px solid #e5e7eb; }

        /* Desktop sidebar toggle */
        .desktop-filter-btn {
          display: none; /* shown on larger screens below */
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s;
        }
        .desktop-filter-btn:hover { border-color: #e11d48; color: #e11d48; }

        /* ── Venues Grid ────────────────────────────────────── */
        .venues-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 32px;
        }
        .venues-grid--grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        .venues-grid--list {
          grid-template-columns: 1fr;
        }

        /* ── Error ──────────────────────────────────────────── */
        .vlp-error {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }
        .error-retry-btn {
          margin-top: 12px;
          padding: 10px 22px;
          background: #e11d48;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        /* ── Empty State ────────────────────────────────────── */
        .vlp-empty {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }
        .vlp-empty-icon { font-size: 3.5rem; margin-bottom: 12px; }
        .vlp-empty h2 { font-size: 1.3rem; color: #1f2937; margin: 0 0 8px; }
        .vlp-empty p { font-size: 0.9rem; margin: 0 0 20px; }
        .vlp-empty-reset {
          padding: 10px 22px;
          background: #e11d48;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .vlp-empty-reset:hover { opacity: 0.9; }

        /* ── Pagination ─────────────────────────────────────── */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding-bottom: 40px;
        }
        .page-btn {
          min-width: 38px;
          height: 38px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          color: #374151;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          padding: 0 4px;
        }
        .page-btn:hover:not(:disabled) { border-color: #e11d48; color: #e11d48; }
        .page-btn--active {
          background: #e11d48;
          border-color: #e11d48;
          color: #fff;
        }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-ellipsis { color: #9ca3af; padding: 0 4px; font-size: 0.9rem; }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 1024px) {
          .filter-panel {
            position: fixed;
            top: 0;
            left: -310px;
            width: 290px;
            height: 100vh;
            max-height: 100vh;
            z-index: 500;
            border-radius: 0 16px 16px 0;
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
            transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          .filter-panel--open {
            left: 0;
          }
          .filter-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.35);
            z-index: 499;
            backdrop-filter: blur(2px);
          }
          .filter-close-btn { display: flex; }
          .vlp-body { padding: 16px; }
        }

        @media (max-width: 640px) {
          .vlp-top-bar-inner { padding: 0 14px; }
          .vlp-body { padding: 12px; gap: 0; }
          .results-bar { flex-direction: column; align-items: flex-start; }
          .sort-label { display: none; }
          .venues-grid--grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .venues-grid--grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
