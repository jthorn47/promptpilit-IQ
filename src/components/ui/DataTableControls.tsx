import { useState, useCallback, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

export interface DataTableControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange: (sort: string) => void;
  totalCount?: number;
  filteredCount?: number;
  className?: string;
}

/**
 * Reusable data table controls with search, filter, and sort functionality
 * Optimized for performance with memoized callbacks
 */
export const DataTableControls: React.FC<DataTableControlsProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  selectedFilters,
  onFilterChange,
  sortOptions = [],
  currentSort,
  onSortChange,
  totalCount,
  filteredCount,
  className = "",
}) => {
  // Memoized handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleFilterToggle = useCallback((filterValue: string) => {
    const newFilters = selectedFilters.includes(filterValue)
      ? selectedFilters.filter(f => f !== filterValue)
      : [...selectedFilters, filterValue];
    onFilterChange(newFilters);
  }, [selectedFilters, onFilterChange]);

  const handleSortChange = useCallback((sortValue: string) => {
    onSortChange(sortValue);
  }, [onSortChange]);

  // Memoized filter counts
  const activeFilterCount = useMemo(() => selectedFilters.length, [selectedFilters]);
  
  // Memoized sort icon
  const currentSortOption = useMemo(() => 
    sortOptions.find(option => option.value === currentSort),
    [sortOptions, currentSort]
  );

  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}>
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {filters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {filters.map((filter) => (
                <DropdownMenuItem
                  key={filter.value}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleFilterToggle(filter.value)}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter.value)}
                      onChange={() => {}} // Handled by onClick
                      className="h-4 w-4"
                    />
                    {filter.label}
                  </span>
                  {filter.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {filter.count}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {sortOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {currentSortOption?.direction === 'desc' ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={currentSort === option.value ? "bg-muted" : ""}
                >
                  <div className="flex items-center gap-2">
                    {option.direction === 'desc' ? (
                      <SortDesc className="h-4 w-4" />
                    ) : (
                      <SortAsc className="h-4 w-4" />
                    )}
                    {option.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {(totalCount !== undefined || filteredCount !== undefined) && (
        <div className="text-sm text-muted-foreground">
          {filteredCount !== undefined && totalCount !== undefined ? (
            filteredCount !== totalCount ? (
              <span>{filteredCount} of {totalCount} items</span>
            ) : (
              <span>{totalCount} items</span>
            )
          ) : (
            <span>{totalCount || filteredCount} items</span>
          )}
        </div>
      )}
    </div>
  );
};