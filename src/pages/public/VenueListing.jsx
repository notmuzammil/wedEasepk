import React from 'react';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useVenues } from '../../hooks/useVenues';
import { KARACHI_AREAS, VENUE_TYPES } from '../../utils/constants';
import { VenueCard } from '../../components/shared/VenueCard';
import { Button } from '../../components/ui/Button';

const VenueListing = () => {
  const { filters, setFilters, resetFilters } = useUiStore();
  
  // Query venues matching current filters
  const { data: venues, isLoading, isError } = useVenues({
    ...filters,
    status: 'approved'
  });

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleSearchChange = (event) => {
    setFilters({ query: event.target.value });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Bar header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-950">Browse Wedding Spaces</h1>
          <p className="text-stone-500 text-sm mt-1">Filter through Karachi's top halls, marquees, lawns and banquets.</p>
        </div>
        
        {/* Text search */}
        <div className="relative w-full md:w-80 shadow-sm rounded-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search venues by name..."
            value={filters.query || ''}
            onChange={handleSearchChange}
            className="block w-full pl-9 rounded-lg border-stone-300 text-sm focus:border-emerald-800 focus:ring-emerald-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-semibold text-stone-850 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-850" /> Filters
            </h3>
            <button 
              onClick={resetFilters}
              className="text-xs text-stone-500 hover:text-emerald-850 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset All
            </button>
          </div>

          {/* Area select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Area</label>
            <select
              value={filters.area || ''}
              onChange={(e) => handleFilterChange('area', e.target.value)}
              className="w-full rounded-lg border-stone-300 py-2 text-sm focus:border-emerald-800 focus:ring-emerald-800"
            >
              <option value="">All Karachi Areas</option>
              {KARACHI_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Venue Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Venue Type</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full rounded-lg border-stone-300 py-2 text-sm focus:border-emerald-800 focus:ring-emerald-800"
            >
              <option value="">All Types</option>
              {VENUE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Guests Capacity (Min)</label>
            <input
              type="number"
              placeholder="e.g. 200"
              value={filters.capacity || ''}
              onChange={(e) => handleFilterChange('capacity', e.target.value)}
              className="w-full rounded-lg border-stone-300 py-2 text-sm focus:border-emerald-800 focus:ring-emerald-800"
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Price per Plate</label>
            <select
              value={filters.priceRange || ''}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="w-full rounded-lg border-stone-300 py-2 text-sm focus:border-emerald-800 focus:ring-emerald-800"
            >
              <option value="">Any Price</option>
              <option value="low">Under Rs. 1,500</option>
              <option value="mid">Rs. 1,500 - Rs. 3,000</option>
              <option value="high">Above Rs. 3,000</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((n) => (
                <div key={n} className="animate-pulse bg-white border rounded-2xl h-80"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl">
              Failed to load venues. Please refresh the page.
            </div>
          ) : venues && venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center space-y-4">
              <p className="text-stone-500 text-lg font-medium">No matching wedding spaces found.</p>
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VenueListing;
