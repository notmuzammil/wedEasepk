import React, { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Check, Ban } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../utils/formatDate';
import { useUiStore } from '../../store/uiStore';
import DataTable from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';

const TABS = [
  { key: 'all',       label: 'All Accounts' },
  { key: 'approved',  label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

export default function ManageVendors() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  // States
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actioningId, setActioningId] = useState(null);

  // Fetch vendors with their venues count
  const fetchVendorsList = async () => {
    try {
      // Query profiles and join venues
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          venues:venues(id, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // A suspended vendor is demoted to 'customer' but keeps their venue rows,
      // so any customer that still owns venues is really a suspended vendor.
      const compiled = (data || []).filter(p =>
        p.role === 'vendor' ||
        (p.role === 'customer' && p.venues && p.venues.length > 0)
      );

      setVendors(compiled);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, []);

  // Update role handler
  const handleUpdateRole = async (userId, targetRole, successMessage) => {
    setActioningId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', userId);

      if (error) throw error;

      showToast(successMessage, 'success');
      
      // If suspended, optionally hide their venues by setting them to 'suspended'
      if (targetRole === 'customer') {
        await supabase
          .from('venues')
          .update({ status: 'suspended' })
          .eq('vendor_id', userId);
      } else if (targetRole === 'vendor') {
        // optionally re-activate their venues
        await supabase
          .from('venues')
          .update({ status: 'live' })
          .eq('vendor_id', userId)
          .eq('status', 'suspended');
      }

      await fetchVendorsList();
      queryClient.invalidateQueries({ queryKey: ['pending-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: vendors.length };
    TABS.forEach(t => {
      if (t.key !== 'all') {
        counts[t.key] = vendors.filter(v => {
          if (t.key === 'approved') return v.role === 'vendor';
          if (t.key === 'suspended') return v.role === 'customer'; // customer role with venues means suspended vendor
          return false;
        }).length;
      }
    });
    return counts;
  }, [vendors]);

  // Filtered dataset
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchStatus = filter === 'all' ||
        (filter === 'approved' && v.role === 'vendor') ||
        (filter === 'suspended' && v.role === 'customer');

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !searchQuery ||
        v.full_name?.toLowerCase().includes(q) ||
        v.phone?.includes(q);

      return matchStatus && matchSearch;
    });
  }, [vendors, filter, searchQuery]);

  // DataTable column specs
  const columns = [
    {
      key: 'vendor',
      label: 'Vendor Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white font-bold text-xs flex items-center justify-center select-none shrink-0">
            {row.full_name ? row.full_name[0].toUpperCase() : 'V'}
          </div>
          <div className="font-semibold text-stone-850">{row.full_name || 'Anonymous Vendor'}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <div className="text-stone-500 font-semibold">{row.phone || 'Not provided'}</div>,
    },
    {
      key: 'venues_count',
      label: 'Venues count',
      align: 'center',
      render: (row) => <div className="font-bold text-stone-700">{row.venues?.length || 0} spaces</div>,
    },
    {
      key: 'created_at',
      label: 'Registration Date',
      sortable: true,
      render: (row) => <div className="font-medium text-stone-500">{formatDate(row.created_at)}</div>,
    },
    {
      key: 'status',
      label: 'Account Status',
      align: 'center',
      render: (row) => (
        row.role === 'vendor'
          ? <Badge variant="success">Active</Badge>
          : <Badge variant="neutral">Suspended</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Account Control',
      align: 'right',
      render: (row) => {
        const isActioning = actioningId === row.id;

        if (row.role === 'vendor') {
          return (
            <button
              onClick={() => handleUpdateRole(row.id, 'customer', 'Vendor account suspended.')}
              disabled={isActioning}
              className="px-3 py-1.5 border border-red-200 hover:border-red-300 bg-red-50/20 hover:bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1 shrink-0 mr-2"
              id={`suspend-vendor-${row.id}`}
            >
              <Ban size={10} /> Suspend Account
            </button>
          );
        }

        // Suspended customer role fallback
        return (
          <button
            onClick={() => handleUpdateRole(row.id, 'vendor', 'Vendor account reactivated!')}
            disabled={isActioning}
            className="px-3 py-1.5 border border-emerald-250 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-lg shadow-sm transition inline-flex items-center gap-1 shrink-0 mr-2"
            id={`activate-vendor-${row.id}`}
          >
            <Check size={10} /> Activate Account
          </button>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none font-sans">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-stone-100 pb-3">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">Vendor Management</h1>
          <p className="text-stone-500 text-sm font-medium">
            {loading ? 'Reviewing accounts...' : `Total count: ${vendors.length} venue vendor accounts`}
          </p>
        </div>
      </div>

      {/* Control panel: filter tabs + search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-stone-200 pb-2">
        
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
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

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search vendor name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 p-2 pl-9 pr-3 rounded-xl text-xs font-medium text-stone-850 focus:bg-white focus:outline-none focus:border-rose-500 transition"
            id="vendor-search-input"
          />
        </div>

      </div>

      {/* Table grid */}
      <DataTable
        columns={columns}
        data={filteredVendors}
        isLoading={loading}
        pageSize={10}
        emptyMessage={searchQuery ? "No vendor accounts match your query filter." : "No vendor accounts found in this status catalog."}
      />

    </div>
  );
}
