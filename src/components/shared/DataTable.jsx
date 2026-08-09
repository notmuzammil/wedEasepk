import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  pageSize = 10,
  emptyMessage = 'No records found.',
  searchQuery = '',
  searchFields = [],
}) {
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // 1. FILTERING (Search query support)
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((row) =>
      searchFields.some((field) => {
        const val = row[field];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, searchFields]);

  // 2. SORTING
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((c) => c.key === sortKey);
    const sorted = [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Custom sort parser if provided
      if (column?.sortValue) {
        valA = column.sortValue(a);
        valB = column.sortValue(b);
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB);
      }
      return valA - valB;
    });

    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }, [filteredData, sortKey, sortOrder, columns]);

  // Reset page when filtering/sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortKey, sortOrder]);

  // 3. PAGINATION SLICE
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize;
    return sortedData.slice(from, to);
  }, [sortedData, currentPage, pageSize]);

  // Toggle sort handler
  const handleSort = (key, sortable = true) => {
    if (!sortable) return;

    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Rendering sort icon helpers
  const renderSortIcon = (col) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-stone-400 shrink-0 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-rose-500 shrink-0 ml-1" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-rose-500 shrink-0 ml-1" />
    );
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm text-stone-700">
          
          {/* Table Headers */}
          <thead className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-6 py-4 font-semibold ${
                    col.sortable ? 'cursor-pointer hover:bg-stone-100 hover:text-stone-850 transition' : ''
                  } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-1 ${
                    col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                  }`}>
                    {col.label}
                    {renderSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              // Loading Shimmer rows
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4.5">
                      <div className="h-4 bg-stone-150 rounded-lg w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx} 
                  className="hover:bg-rose-50/15 active:bg-rose-50/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 font-medium text-stone-800 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
                    <AlertCircle size={28} strokeWidth={1.5} className="text-stone-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination Bar */}
      {!isLoading && totalPages > 1 && (
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex items-center justify-between text-xs font-medium text-stone-500">
          <span>
            Showing <strong className="text-stone-700">{((currentPage - 1) * pageSize) + 1}</strong> to{' '}
            <strong className="text-stone-700">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-stone-700">{sortedData.length}</strong> entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-stone-200 bg-white rounded-lg hover:border-rose-400 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Show pages surrounding current, plus boundaries
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 rounded-lg text-center transition ${
                      currentPage === pageNum
                        ? 'bg-rose-600 text-white font-bold'
                        : 'border border-stone-250 bg-white hover:border-rose-350 hover:text-rose-500'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return <span key={pageNum} className="text-stone-300 select-none">…</span>;
              }
              return null;
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-stone-200 bg-white rounded-lg hover:border-rose-400 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func,
      sortValue: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  pageSize: PropTypes.number,
  emptyMessage: PropTypes.string,
  searchQuery: PropTypes.string,
  searchFields: PropTypes.arrayOf(PropTypes.string),
};
