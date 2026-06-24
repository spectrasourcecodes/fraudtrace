import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  emptyState,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter data
  const filteredData = data.filter((row) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = columns.some((col) => {
        const value = row[col.accessor];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && row[key] !== value) {
        return false;
      }
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Table Controls */}
      {(searchable || filterable) && (
        <div className="flex items-center justify-between mb-4 space-x-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
          
          {filterable && (
            <Button
              variant="outline"
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
              {columns
                .filter((col) => col.filterable)
                .map((col) => (
                  <div key={col.accessor}>
                    <label className="block text-sm text-gray-400 mb-2">
                      {col.header}
                    </label>
                    <select
                      value={filters[col.accessor] || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          [col.accessor]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">All</option>
                      {col.filterOptions?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {paginatedData.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-700/50">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50">
                  {columns.map((column) => (
                    <th
                      key={column.accessor}
                      onClick={() => column.sortable && handleSort(column.accessor)}
                      className={`
                        px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider
                        ${column.sortable ? 'cursor-pointer hover:text-white select-none' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.header}</span>
                        {column.sortable && getSortIcon(column.accessor)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={row.id || rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      transition-colors duration-200
                      ${onRowClick ? 'cursor-pointer hover:bg-slate-700/50' : ''}
                    `}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {column.cell ? (
                          column.cell(row[column.accessor], row)
                        ) : (
                          <span className="text-sm text-gray-300">
                            {row[column.accessor]}
                          </span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + pageSize, sortedData.length)} of{' '}
                {sortedData.length} results
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`
                          w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${
                            currentPage === page
                              ? 'bg-cyan-500 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-slate-700'
                          }
                        `}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        emptyState || (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No results found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default DataTable;