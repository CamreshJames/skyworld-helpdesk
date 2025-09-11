import React, { useState, useMemo, useEffect } from 'react';
import './Table.css';

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

interface TableProps<T> {
    data: T[];
    columnsMap: Partial<Record<keyof T | string, Partial<ColumnProps<T>>>>;
    className?: string;
    pageSizeOptions?: number[]; 
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
        render: columnDetails?.render
    }));
};

function Table<T>({ data, columnsMap, className = '', pageSizeOptions = [5, 10, 20] }: TableProps<T>) {
    const columns = useMemo(() => generateColumns(columnsMap), [columnsMap]);

    const [sortConfig, setSortConfig] = useState<{
        key: keyof T | string | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
        let result = [...data];

        // Apply global search
        if (searchTerm) {
            result = result.filter((row) =>
                columns.some((col) => {
                    if (col.hide || !col.isFilterable) return false;
                    const value = String(row[col.id as keyof T] ?? '');
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }

        // Apply column filters
        Object.entries(filters).forEach(([key, filterValue]) => {
            if (filterValue) {
                result = result.filter((row) => {
                    const value = String(row[key as keyof T] ?? '');
                    return value.toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });

        // Sort data
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof T] ?? '';
                const bValue = b[sortConfig.key as keyof T] ?? '';
                const col = columns.find((c) => c.id === sortConfig.key);
                const dataType = col?.data_type ?? 'text';

                if (dataType === 'number') {
                    return sortConfig.direction === 'asc'
                        ? Number(aValue) - Number(bValue)
                        : Number(bValue) - Number(aValue);
                } else if (dataType === 'date') {
                    return sortConfig.direction === 'asc'
                        ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
                        : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
                } else {
                    return sortConfig.direction === 'asc'
                        ? String(aValue).localeCompare(String(bValue))
                        : String(bValue).localeCompare(String(aValue));
                }
            });
        }

        return result;
    }, [data, searchTerm, filters, sortConfig, columns]);

    // Pagination
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Handle sorting
    const handleSort = (key: keyof T | string) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle page size change
    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
    };

    return (
        <div className={`table-container ${className}`}>
            {/* Search Bar */}
            <div className="table-search">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="table-search-input"
                />
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
                                        className={col.isSortable ? 'sortable' : ''}
                                        onClick={() => col.isSortable && handleSort(col.id)}
                                    >
                                        {col.caption}
                                        {sortConfig.key === col.id && (
                                            <span className="sort-icon">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                )
                        )}
                    </tr>

                    <tr>
                        {columns.map(
                            (col) =>
                                !col.hide &&
                                col.isFilterable && (
                                    <th key={`filter-${String(col.id)}`} style={{ width: col.size }}>
                                        <input
                                            type="text"
                                            placeholder={`Filter ${col.caption}`}
                                            value={filters[String(col.id)] ?? ''}
                                            onChange={(e) => handleFilterChange(String(col.id), e.target.value)}
                                            className="table-filter-input"
                                        />
                                    </th>
                                )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.filter((c) => !c.hide).length} className="no-data">
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
        </div>
    );
}

export default Table;