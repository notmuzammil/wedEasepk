import React, { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Store, Search, Filter, Check, Ban, Eye, AlertCircle, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useUiStore } from '../../store/uiStore';
import { formatCurrency } from '../../utils/formatDate';
import DataTable from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { PAKISTAN_CITIES } from '../../utils/constants';

const TABS = [
  { key: 'all',              label: 'All Listings' },
  { key: 'pending_approval', label: 'Pending Review' },
  { key: 'live',             label: 'Live' },
  { key: 'suspended',        label: 'Suspended' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600';

export default function ManageListings() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  // States
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actioningId, setActioningId] = useState(null);

  // Fetch all listings with vendor details
  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          vendor:profiles!venues_vendor_id_fkey(full_name, phone),
          venue_images(storage_path, is_cover)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching admin listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Update listing status handler
  const handleUpdateStatus = async (venueId, targetStatus, successMessage) => {
    setActioningId(venueId);
    try {
      const { error } = await supabase
        .from('venues')
        .update({ status: targetStatus })
        .eq('id', venueId);

      if (error) throw error;
      
      showToast(successMessage, 'success');
      await fetchListings();
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues-list'] });
    } catch (err) {
      showToast(err.message || 'Listing update failed', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: venues.length };
    TABS.forEach(t => {
      if (t.key !== 'all') {
        counts[t.key] = venues.filter(v => {
          if (t.key === 'pending_approval') return v.status === 'pending_approval' || v.status === 'pending';
          return v.status === t.key;
        }).length;
      }
    });
    return counts;
  }, [venues]);

  // Filtering
  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      const matchStatus = filter === 'all' ||
        (filter === 'pending_approval' && (v.status === 'pending_approval' || v.status === 'pending')) ||
        v.status === filter;

      const matchCity = !selectedCity || v.city === selectedCity;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !searchQuery ||
        v.name?.toLowerCase().includes(q) ||
        v.vendor?.full_name?.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q);

      return matchStatus && matchCity && matchSearch;
    });
  }, [venues, filter, selectedCity, searchQuery]);

  // DataTable column specs
  const columns = [
    {
      key: 'cover',
      label: 'Photo',
      render: (row) => {
        const cover = row.venue_images?.find(i => i.is_cover)?.storage_path || row.images?.[0] || FALLBACK_IMAGE;
        return (
          <div className="w-12 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
            <img src={cover} alt={row.name} className="w-full h-full object-cover" />
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Space Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-stone-850 truncate max-w-xs">{row.name}</div>
          <div className="text-[10px] text-stone-400 font-bold capitalize mt-0.5">{row.type} · {row.city}</div>
        </div>
      ),
    },
    {
      key: 'vendor',
      label: 'Owner / Vendor',
      render: (row) => (
        <div>
          <div className="font-semibold text-stone-800">{row.vendor?.full_name || 'Vendor Profile'}</div>
          {row.vendor?.phone && <div className="text-[10px] text-stone-400 font-medium">📞 {row.vendor.phone}</div>}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Guests Range',
      align: 'center',
      render: (row) => (
        <div className="font-bold text-stone-700">
          {row.capacity_max 
            ? `${row.capacity_min || 50} - ${row.capacity_max}` 
            : `${row.capacity || '?'} max`
          }
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Starting Price',
      align: 'right',
      render: (row) => (
        <div className="font-bold text-emerald-800">
          {row.price_per_day 
            ? `${formatCurrency(row.price_per_day)}/d` 
            : `${formatCurrency(row.price_per_plate)}/p`
          }
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (row) => {
        let variant = 'neutral';
        let label = row.status;
        if (row.status === 'draft') {
          variant = 'neutral';
          label = 'Draft';
        } else if (row.status === 'pending_approval' || row.status === 'pending') {
          variant = 'warning';
          label = 'Pending';
        } else if (row.status === 'live' || row.status === 'approved') {
          variant = 'success';
          label = 'Live';
        } else if (row.status === 'suspended' || row.status === 'rejected') {
          variant = 'danger';
          label = 'Suspended';
        }
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Listing Action Control',
      align: 'right',
      render: (row) => {
        const isActioning = actioningId === row.id;

        return (
          <div className="flex justify-end gap-2 shrink-0 select-none">
            <a
              href={`/venues/${row.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 border border-stone-200 hover:border-rose-400 bg-stone-50 hover:bg-rose-50/10 text-stone-600 hover:text-rose-600 text-[10px] font-bold uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1"
              title="Preview space listing"
              id={`preview-listing-${row.id}`}
            >
              <Eye size={10} /> Preview
            </a>

            {(row.status === 'pending_approval' || row.status === 'pending') && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'live', 'Venue listings activated publicly!')}
                disabled={isActioning}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1"
              >
                <Check size={10} /> Approve
              </button>
            )}

            {row.status === 'live' && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'suspended', 'Listing suspended successfully.')}
                disabled={isActioning}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1"
                id={`suspend-listing-${row.id}`}
              >
                <Ban size={10} /> Suspend
              </button>
            )}

            {row.status === 'suspended' && (
              <button
                onClick={() => handleUpdateStatus(row.id, 'live', 'Listing re-activated successfully!')}
                disabled={isActioning}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1"
                id={`unsuspend-listing-${row.id}`}
              >
                <Check size={10} /> Re-activate
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none font-sans">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-stone-100 pb-3">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">banquet Listings</h1>
          <p className="text-stone-500 text-sm font-medium">
            {loading ? 'Reviewing spaces...' : `Total count: ${venues.length} registered properties`}
          </p>
        </div>
      </div>

      {/* Control panel: filter tabs + city select + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition ${
                filter === t.key 
                  ? 'border-rose-600 text-rose-600 font-bold' 
                  : 'border-transparent text-stone-500 hover:text-rose-500'
              }`}
              id={`filter-tab-${t.key}`}
            >
              {t.label}
              {tabCounts[t.key] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
                  filter === t.key ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {tabCounts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dropdown & Searches */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* City select */}
          <div className="relative shrink-0 select-none">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-semibold text-stone-700 focus:bg-white focus:outline-none focus:border-rose-500 transition pr-8"
              id="city-filter-select"
            >
              <option value="">All Cities</option>
              {PAKISTAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative shrink-0 w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search space name, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 p-2 pl-9 pr-3 rounded-xl text-xs font-medium text-stone-850 focus:bg-white focus:outline-none focus:border-rose-500 transition"
              id="listing-search-input"
            />
          </div>
        </div>

      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredVenues}
        isLoading={loading}
        pageSize={10}
        emptyMessage={searchQuery || selectedCity ? "No listings match your search query." : "No listings found in this status catalog."}
      />

    </div>
  );
}
