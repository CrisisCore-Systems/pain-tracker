import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ArrowUpDown } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from '../utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  className,
  emptyMessage = 'No data available',
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return filtered;
  }, [data, searchTerm, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle different types safely
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || searchable || filterable) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            {filterable && Object.keys(filters).length > 0 && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent>
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label={title || 'Data table'}>
                <thead>
                  <tr className="border-b" role="row">
                    {columns.map(column => (
                      <th
                        key={String(column.key)}
                        className={cn(
                          'text-left py-3 px-4 font-medium text-muted-foreground',
                          column.width && `w-${column.width}`,
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                        role="columnheader"
                        aria-sort={
                          sortColumn === String(column.key)
                            ? sortDirection === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span>{column.header}</span>
                          {column.sortable && sortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort(String(column.key))}
                              className="h-6 w-6 p-0 hover:bg-muted"
                              aria-label={`Sort by ${column.header} ${
                                sortColumn === String(column.key)
                                  ? sortDirection === 'asc'
                                    ? 'descending'
                                    : 'ascending'
                                  : 'ascending'
                              }`}
                            >
                              {sortColumn === column.key ? (
                                sortDirection === 'asc' ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {column.filterable && filterable && (
                            <div className="relative">
                              <Input
                                placeholder="Filter..."
                                value={filters[String(column.key)] || ''}
                                onChange={e =>
                                  handleFilterChange(String(column.key), e.target.value)
                                }
                                className="h-6 w-20 text-xs"
                                aria-label={`Filter ${column.header}`}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && <th className="w-12" role="columnheader" aria-label="Actions"></th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr
                      key={index}
                      className={cn(
                        'border-b hover:bg-muted/50 transition-colors',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row)}
                      role="row"
                      tabIndex={onRowClick ? 0 : -1}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row);
                        }
                      }}
                      aria-label={onRowClick ? `Row ${index + 1}, click to select` : undefined}
                    >
                      {columns.map(column => (
                        <td
                          key={String(column.key)}
                          className={cn(
                            'py-3 px-4',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                          role="cell"
                        >
                          {column.render
                            ? column.render(row[column.key as keyof T], row)
                            : String(row[column.key as keyof T] || '')}
                        </td>
                      ))}
                      {actions && (
                        <td className="py-3 px-4" role="cell">
                          <div className="flex items-center space-x-2">{actions(row)}</div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}{' '}
                  entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
