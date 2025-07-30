import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUp, ChevronDown, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  description?: string;
}

export interface AccessibleDataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  caption?: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: {
    pageSize: number;
    showControls?: boolean;
  };
  onRowSelect?: (row: T, index: number) => void;
  selectedRows?: Set<number>;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export const AccessibleDataTable = <T extends Record<string, any>>({
  data,
  columns,
  caption = "Data table",
  searchable = true,
  sortable = true,
  filterable = false,
  pagination,
  onRowSelect,
  selectedRows = new Set(),
  loading = false,
  emptyMessage = "No data available",
  className = ""
}: AccessibleDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  
  const tableRef = useRef<HTMLTableElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pagination.pageSize;
    return sortedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedData, currentPage, pagination]);

  const totalPages = pagination ? Math.ceil(sortedData.length / pagination.pageSize) : 1;

  const handleSort = useCallback((columnKey: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(prev => 
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortable, sortColumn, sortDirection, columns]);

  const handleKeyboardNavigation = useCallback((direction: string) => {
    if (!focusedCell) return;
    
    const { row, col } = focusedCell;
    const maxRow = paginatedData.length - 1;
    const maxCol = columns.length - 1;
    
    let newRow = row;
    let newCol = col;
    
    switch (direction) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(maxRow, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(maxCol, col + 1);
        break;
      case 'Home':
        newCol = 0;
        break;
      case 'End':
        newCol = maxCol;
        break;
    }
    
    setFocusedCell({ row: newRow, col: newCol });
    
    // Focus the cell
    const cell = tableRef.current?.querySelector(
      `[data-row="${newRow}"][data-col="${newCol}"]`
    ) as HTMLElement;
    cell?.focus();
  }, [focusedCell, paginatedData.length, columns.length]);

  useKeyboardNavigation({
    onArrowUp: () => handleKeyboardNavigation('ArrowUp'),
    onArrowDown: () => handleKeyboardNavigation('ArrowDown'),
    onArrowLeft: () => handleKeyboardNavigation('ArrowLeft'),
    onArrowRight: () => handleKeyboardNavigation('ArrowRight'),
    disabled: !focusedCell
  });

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />;
    }
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" aria-hidden="true" />
    ) : (
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    );
  };

  const handleCellFocus = (rowIndex: number, colIndex: number) => {
    setFocusedCell({ row: rowIndex, col: colIndex });
  };

  const handleRowSelect = (row: T, index: number) => {
    onRowSelect?.(row, index);
  };

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Data table">
      {/* Search and filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search table data"
                aria-describedby="search-description"
              />
              <div id="search-description" className="sr-only">
                Search through {data.length} rows of data. Results will update as you type.
              </div>
            </div>
          )}
          
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Table summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        {loading ? (
          "Loading table data..."
        ) : (
          `Table contains ${paginatedData.length} visible rows out of ${data.length} total rows. ${
            sortColumn ? `Sorted by ${columns.find(c => c.key === sortColumn)?.header} in ${sortDirection}ending order.` : ''
          }`
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table 
          ref={tableRef}
          className="w-full table-fixed"
          role="table"
          aria-label={caption}
        >
          <caption className="sr-only">{caption}</caption>
          
          <thead>
            <tr role="row" className="border-b bg-muted/50">
              {columns.map((column, colIndex) => (
                <th
                  key={column.key}
                  role="columnheader"
                  className={`px-4 py-3 text-left font-medium ${
                    column.sortable && sortable ? 'cursor-pointer hover:bg-muted' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && column.sortable) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  tabIndex={column.sortable ? 0 : -1}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : column.sortable ? 'none' : undefined
                  }
                  aria-describedby={column.description ? `${column.key}-desc` : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.header}</span>
                    {column.sortable && sortable && getSortIcon(column.key)}
                  </div>
                  
                  {column.description && (
                    <div id={`${column.key}-desc`} className="sr-only">
                      {column.description}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  role="row"
                  className={`border-b hover:bg-muted/50 ${
                    selectedRows.has(rowIndex) ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleRowSelect(row, rowIndex)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowSelect(row, rowIndex);
                    }
                  }}
                  tabIndex={onRowSelect ? 0 : -1}
                  aria-selected={selectedRows.has(rowIndex)}
                >
                  {columns.map((column, colIndex) => {
                    const value = row[column.key];
                    const cellContent = column.render ? column.render(value, row) : String(value || '');
                    
                    return (
                      <td
                        key={column.key}
                        role="gridcell"
                        className={`px-4 py-3 ${
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                        data-row={rowIndex}
                        data-col={colIndex}
                        tabIndex={0}
                        onFocus={() => handleCellFocus(rowIndex, colIndex)}
                        aria-describedby={`${column.key}-${rowIndex}-desc`}
                      >
                        {cellContent}
                        <div id={`${column.key}-${rowIndex}-desc`} className="sr-only">
                          {column.header}: {String(value || 'empty')}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.showControls && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pagination.pageSize + 1, sortedData.length)} to{' '}
            {Math.min(currentPage * pagination.pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              Previous
            </Button>
            
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};