import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './Table.css';
import { SortIcon, FilterIcon, RefreshIcon } from '../icons';

// Define a type for icon components to accept a color prop
interface IconProps {
  color?: string;
}

// Update icon component types to include color prop
interface TableIcons {
  SortIcon: React.FC<IconProps>;
  FilterIcon: React.FC<IconProps>;
  RefreshIcon: React.FC<IconProps>;
}

export interface ColumnProps<T> {
  id: keyof T | string;
  caption: string;
  size?: number;
  align?: 'left' | 'center' | 'right';
  hide?: boolean;
  isSortable?: boolean;
  isFilterable?: boolean;
  data_type?: 'text' | 'number' | 'date';
  render?: (data: T) => React.ReactNode;
}

// Define filter condition types
type FilterCondition = 'contains' | 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';

interface FilterCriterion<T> {
  key: keyof T | string;
  condition: FilterCondition;
  value: string;
}

interface TableProps<T> {
  data: T[];
  columnsMap: Partial<Record<keyof T | string, Partial<ColumnProps<T>>>>;
  className?: string;
  pageSizeOptions?: number[];
  tableId?: string; // Optional ID for persisting sort/filter state
  iconColor?: string; // Optional color for icons (defaults to #374151)
  icons?: TableIcons; // Allow custom icons with color prop
}

const generateColumns = <T,>(
  columnsMap: Partial<Record<keyof T | string, Partial<ColumnProps<T>>>>
): ColumnProps<T>[] => {
  return Object.entries(columnsMap).map(([columnId, columnDetails]) => ({
    id: columnId,
    caption:
      columnDetails?.caption ??
      columnId
        .toLowerCase()
        .split('_')
        .map((splitStr) => splitStr.charAt(0).toUpperCase() + splitStr.slice(1))
        .join(' '),
    size: columnDetails?.size ?? 100,
    align: columnDetails?.align ?? 'left',
    hide: columnDetails?.hide ?? false,
    isSortable: columnDetails?.isSortable ?? true,
    isFilterable: columnDetails?.isFilterable ?? true,
    data_type: columnDetails?.data_type ?? 'text',
    render: columnDetails?.render,
  }));
};

type SortCriterion<T> = { key: keyof T | string; direction: 'asc' | 'desc' };

function Table<T>({
  data,
  columnsMap,
  className = '',
  pageSizeOptions = [5, 10, 20],
  tableId,
  iconColor,
  icons = { SortIcon, FilterIcon, RefreshIcon },
}: TableProps<T>) {
  const columns = useMemo(() => generateColumns(columnsMap), [columnsMap]);
  const effectiveIconColor = iconColor || '#374151';

  const [sortConfig, setSortConfig] = useState<SortCriterion<T>[]>([]);
  const [filterConfig, setFilterConfig] = useState<FilterCriterion<T>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const availableColumns = useMemo(
    () =>
      columns
        .filter((c) => !c.hide && c.isFilterable)
        .map((c) => ({ id: c.id, caption: c.caption as string, data_type: c.data_type })),
    [columns]
  );

  // Persist state to localStorage on changes (if tableId provided)
  useEffect(() => {
    if (tableId) {
      try {
        localStorage.setItem(`table-filters-${tableId}`, JSON.stringify(filterConfig));
        localStorage.setItem(`table-sorts-${tableId}`, JSON.stringify(sortConfig));
      } catch (error) {
        console.error('Failed to save table state to localStorage:', error);
      }
    }
  }, [filterConfig, sortConfig, tableId]);

  // Load persisted state from localStorage on mount (if tableId provided)
  useEffect(() => {
    if (tableId) {
      try {
        const savedFilters = localStorage.getItem(`table-filters-${tableId}`);
        if (savedFilters) {
          setFilterConfig(JSON.parse(savedFilters));
        }
        const savedSorts = localStorage.getItem(`table-sorts-${tableId}`);
        if (savedSorts) {
          setSortConfig(JSON.parse(savedSorts));
        }
      } catch (error) {
        console.error('Failed to load table state from localStorage:', error);
      }
    }
  }, [tableId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Compute number of active filters and sorts for badges
  const numActiveFilters = useMemo(
    () => filterConfig.filter((f) => f.value && f.value.trim().length > 0).length,
    [filterConfig]
  );
  const numActiveSorts = sortConfig.length;

  // Filter and sort data (memoized for performance)
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply global search across filterable columns
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      result = result.filter((row) =>
        columns.some((col) => {
          if (col.hide || !col.isFilterable) return false;
          const value = String(row[col.id as keyof T] ?? '');
          return value.toLowerCase().includes(lowerSearch);
        })
      );
    }

    // Apply column-specific filters
    filterConfig.forEach(({ key, condition, value }) => {
      if (value && value.trim()) {
        const lowerValue = value.toLowerCase().trim();
        const col = columns.find((c) => c.id === key);
        const dataType = col?.data_type ?? 'text';
        result = result.filter((row) => {
          const cellValue = row[key as keyof T] ?? '';
          const stringValue = String(cellValue).toLowerCase();
          if (dataType === 'number') {
            const numValue = Number(cellValue);
            const filterNum = Number(value);
            if (isNaN(numValue) || isNaN(filterNum)) return false;
            switch (condition) {
              case 'equals':
                return numValue === filterNum;
              case 'not_equals':
                return numValue !== filterNum;
              case 'greater_than':
                return numValue > filterNum;
              case 'less_than':
                return numValue < filterNum;
              default:
                return stringValue.includes(lowerValue);
            }
          } else if (dataType === 'date') {
            const dateValue = new Date(cellValue as string).getTime();
            const filterDate = new Date(value).getTime();
            if (isNaN(dateValue) || isNaN(filterDate)) return false;
            switch (condition) {
              case 'equals':
                return dateValue === filterDate;
              case 'not_equals':
                return dateValue !== filterDate;
              case 'greater_than':
                return dateValue > filterDate;
              case 'less_than':
                return dateValue < filterDate;
              default:
                return stringValue.includes(lowerValue);
            }
          } else {
            switch (condition) {
              case 'contains':
                return stringValue.includes(lowerValue);
              case 'equals':
                return stringValue === lowerValue;
              case 'not_equals':
                return stringValue !== lowerValue;
              case 'starts_with':
                return stringValue.startsWith(lowerValue);
              case 'ends_with':
                return stringValue.endsWith(lowerValue);
              default:
                return stringValue.includes(lowerValue);
            }
          }
        });
      }
    });

    // Apply multi-column sorting (stable sort via multiple comparators)
    if (sortConfig.length > 0) {
      result.sort((a, b) => {
        for (const { key, direction } of sortConfig) {
          const col = columns.find((c) => c.id === key);
          const dataType = col?.data_type ?? 'text';
          const aValue = a[key as keyof T] ?? '';
          const bValue = b[key as keyof T] ?? '';

          if (dataType === 'number') {
            const aNum = Number(aValue);
            const bNum = Number(bValue);
            if (isNaN(aNum) || isNaN(bNum)) {
              return direction === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
            }
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
          } else if (dataType === 'date') {
            const aTime = new Date(aValue as string).getTime();
            const bTime = new Date(bValue as string).getTime();
            if (isNaN(aTime) || isNaN(bTime)) {
              return direction === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
            }
            return direction === 'asc' ? aTime - bTime : bTime - aTime;
          } else {
            return direction === 'asc'
              ? String(aValue).localeCompare(String(bValue))
              : String(bValue).localeCompare(String(aValue));
          }
        }
        return 0; // Stable if all equal
      });
    }

    return result;
  }, [data, searchTerm, filterConfig, sortConfig, columns]);

  // Pagination calculations (moved before handlePageChange to fix TS2448/TS2454)
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Add a new filter criterion
  const addFilterCriterion = useCallback(() => {
    const availCol = availableColumns.find((c) => !filterConfig.some((f) => f.key === c.id));
    const newKey = availCol?.id || (availableColumns[0]?.id || '');
    if (newKey) {
      setFilterConfig((prev) => [
        ...prev,
        { key: newKey as keyof T | string, condition: 'contains', value: '' },
      ]);
      setCurrentPage(1);
    }
  }, [availableColumns, filterConfig]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterConfig([]);
    setCurrentPage(1);
  }, []);

  // Clear all sorts
  const clearSorts = useCallback(() => {
    setSortConfig([]);
    setCurrentPage(1);
  }, []);

  // Refresh: clear everything
  const handleRefresh = useCallback(() => {
    clearFilters();
    clearSorts();
    setSearchTerm('');
    setCurrentPage(1);
  }, [clearFilters, clearSorts]);

  // Add a new sort criterion
  const addSortCriterion = useCallback(() => {
    const availCol = availableColumns.find((c) => !sortConfig.some((s) => s.key === c.id));
    const newKey = availCol?.id || (availableColumns[0]?.id || '');
    if (newKey) {
      setSortConfig((prev) => [...prev, { key: newKey as keyof T | string, direction: 'asc' }]);
      setCurrentPage(1);
    }
  }, [availableColumns, sortConfig]);

  // Handle search (live update)
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  }, []);

  // Get primary sort icon for header display
  const getPrimarySortIcon = useCallback(
    (colId: keyof T | string) => {
      if (sortConfig.length > 0 && sortConfig[0].key === colId) {
        return (
          <span className="sort-icon">
            {sortConfig[0].direction === 'asc' ? '↑' : '↓'}
          </span>
        );
      }
      return null;
    },
    [sortConfig]
  );

  // Available filter conditions based on data type
  const getFilterConditions = (dataType: string | undefined): FilterCondition[] => {
    switch (dataType) {
      case 'number':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'contains'];
      case 'date':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'contains'];
      default:
        return ['contains', 'equals', 'not_equals', 'starts_with', 'ends_with'];
    }
  };

  const { SortIcon, FilterIcon, RefreshIcon } = icons;

  return (
    <div className={`table-container ${className}`}>
      {/* Header: Search + Controls */}
      <div className="table-header">
        <div className="table-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="table-search-input"
          />
        </div>
        <div className="table-controls">
          {/* Filter Button */}
          <div className="icon-btn-wrapper">
            <button
              className="icon-btn"
              onClick={() => setShowFilterModal(true)}
              title="Filters"
            >
              <FilterIcon color={effectiveIconColor} />
            </button>
            {numActiveFilters > 0 && (
              <div className="badge-wrapper">
                <span className="badge">{numActiveFilters}</span>
                <button
                  className="clear-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  title="Clear all filters"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          {/* Sort Button */}
          <div className="icon-btn-wrapper">
            <button
              className="icon-btn"
              onClick={() => setShowSortModal(true)}
              title="Sort"
            >
              <SortIcon color={effectiveIconColor} />
            </button>
            {numActiveSorts > 0 && (
              <div className="badge-wrapper">
                <span className="badge">{numActiveSorts}</span>
                <button
                  className="clear-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSorts();
                  }}
                  title="Clear all sorts"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          {/* Refresh Button */}
          <div className="icon-btn-wrapper">
            <button
              className="icon-btn"
              onClick={handleRefresh}
              title="Refresh (clear all)"
            >
              <RefreshIcon color={effectiveIconColor} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="table">
        <thead>
          <tr>
            {columns.map(
              (col) =>
                !col.hide && (
                  <th
                    key={String(col.id)}
                    style={{ width: col.size, textAlign: col.align }}
                  >
                    {col.caption}
                    {getPrimarySortIcon(col.id)}
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.filter((c) => !c.hide).length}
                className="no-data"
              >
                No data available
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <tr key={index}>
                {columns.map(
                  (col) =>
                    !col.hide && (
                      <td key={String(col.id)} style={{ textAlign: col.align }}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.id as keyof T] ?? '')}
                      </td>
                    )
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="table-pagination">
        <div className="page-size">
          <span>Rows per page:</span>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="page-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Filters</h3>
            <div className="filter-items">
              {filterConfig.map((filter, index) => (
                <div key={index} className="filter-item">
                  <div className="filter-criteria">
                    <select
                      value={String(filter.key)}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        if (newKey) {
                          const newConfig = [...filterConfig];
                          newConfig[index].key = newKey as keyof T | string;
                          setFilterConfig(newConfig);
                          setCurrentPage(1);
                        }
                      }}
                      className="filter-select"
                    >
                      {availableColumns.map((col) => (
                        <option key={String(col.id)} value={String(col.id)}>
                          {col.caption}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filter.condition}
                      onChange={(e) => {
                        const newConfig = [...filterConfig];
                        newConfig[index].condition = e.target.value as FilterCondition;
                        setFilterConfig(newConfig);
                        setCurrentPage(1);
                      }}
                      className="filter-select"
                    >
                      {getFilterConditions(
                        availableColumns.find((c) => c.id === filter.key)?.data_type
                      ).map((condition) => (
                        <option key={condition} value={condition}>
                          {condition
                            .split('_')
                            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                            .join(' ')}
                        </option>
                      ))}
                    </select>
                    <div className="input-group">
                      <input
                        type={
                          availableColumns.find((c) => c.id === filter.key)?.data_type === 'number'
                            ? 'number'
                            : 'text'
                        }
                        value={filter.value}
                        onChange={(e) => {
                          const newConfig = [...filterConfig];
                          newConfig[index].value = e.target.value;
                          setFilterConfig(newConfig);
                          setCurrentPage(1);
                        }}
                        placeholder="Enter value..."
                        className="table-filter-input"
                      />
                      {filter.value && filter.value.trim() && (
                        <button
                          className="clear-filter-btn"
                          onClick={() => {
                            const newConfig = [...filterConfig];
                            newConfig[index].value = '';
                            setFilterConfig(newConfig);
                            setCurrentPage(1);
                          }}
                          title="Clear this filter"
                        >
                          clear
                        </button>
                      )}
                    </div>
                    <button
                      className="clear-filter-btn"
                      onClick={() => {
                        setFilterConfig((prev) => prev.filter((_, i) => i !== index));
                        setCurrentPage(1);
                      }}
                      title="Remove this filter"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addFilterCriterion} className="add-filter-btn">
              + Add Filter Criterion
            </button>
            <div className="modal-actions">
              <button onClick={() => { clearFilters(); setShowFilterModal(false); }}>
                Clear All
              </button>
              <button onClick={() => setShowFilterModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSortModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Sorting</h3>
            <div className="sort-items">
              {sortConfig.map((sort, index) => (
                <div key={index} className="sort-item">
                  <div className="sort-criteria">
                    <select
                      value={String(sort.key)}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        if (newKey) {
                          const existingIndex = sortConfig.findIndex(
                            (s, i) => i !== index && s.key === newKey
                          );
                          if (existingIndex === -1) {
                            const newConfig = [...sortConfig];
                            newConfig[index].key = newKey as keyof T | string;
                            setSortConfig(newConfig);
                            setCurrentPage(1);
                          }
                        }
                      }}
                      className="sort-select"
                    >
                      {availableColumns.map((col) => (
                        <option key={String(col.id)} value={String(col.id)}>
                          {col.caption}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sort.direction}
                      onChange={(e) => {
                        const newConfig = [...sortConfig];
                        newConfig[index].direction = e.target.value as 'asc' | 'desc';
                        setSortConfig(newConfig);
                        setCurrentPage(1);
                      }}
                      className="sort-select"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                    {index > 0 && (
                      <button
                        className="sort-move-btn"
                        onClick={() => {
                          const newConfig = [...sortConfig];
                          [newConfig[index - 1], newConfig[index]] = [
                            newConfig[index],
                            newConfig[index - 1],
                          ];
                          setSortConfig(newConfig);
                          setCurrentPage(1);
                        }}
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    <button
                      className="clear-filter-btn"
                      onClick={() => {
                        setSortConfig((prev) => prev.filter((_, i) => i !== index));
                        setCurrentPage(1);
                      }}
                      title="Remove this sort"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {sortConfig.length < 5 && (
              <button onClick={addSortCriterion} className="add-sort-btn">
                + Add Sort Criterion
              </button>
            )}
            <div className="modal-actions">
              <button onClick={() => { clearSorts(); setShowSortModal(false); }}>
                Clear All
              </button>
              <button onClick={() => setShowSortModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;