import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { GlobalContactFilters } from '../../hooks/useGlobalContacts';
import { useContactFilterOptions } from '../../hooks/useGlobalContacts';

interface ContactFiltersProps {
  filters: GlobalContactFilters;
  onFiltersChange: (filters: GlobalContactFilters) => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { data: filterOptions } = useContactFilterOptions();
  const options = filterOptions;

  const handleFilterChange = (key: keyof GlobalContactFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilter = (key: keyof GlobalContactFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof GlobalContactFilters] !== undefined && 
    filters[key as keyof GlobalContactFilters] !== ''
  ).length;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name, email, or phone..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Company Filter */}
        <div className="space-y-2">
          <Label>Company</Label>
          <Select
            value={filters.companyId || ''}
            onValueChange={(value) => handleFilterChange('companyId', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {options?.companies?.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title Filter */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Select
            value={filters.title || ''}
            onValueChange={(value) => handleFilterChange('title', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Titles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Titles</SelectItem>
              {options?.titles?.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assigned Rep Filter */}
        <div className="space-y-2">
          <Label>Assigned Rep</Label>
          <Select
            value={filters.assignedRep || ''}
            onValueChange={(value) => handleFilterChange('assignedRep', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Reps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {options?.assignedReps?.map((rep) => (
                <SelectItem key={rep} value={rep}>
                  {rep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary Contact Filter */}
        <div className="space-y-2">
          <Label>Contact Type</Label>
          <Select
            value={filters.isPrimary === undefined ? '' : filters.isPrimary.toString()}
            onValueChange={(value) => 
              handleFilterChange('isPrimary', 
                value === '' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Contacts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              <SelectItem value="true">Primary Only</SelectItem>
              <SelectItem value="false">Secondary Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Active Filters ({activeFiltersCount})</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('search')}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.companyId && (
              <Badge variant="secondary" className="gap-1">
                Company: {options?.companies?.find(c => c.id === filters.companyId)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('companyId')}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.title && (
              <Badge variant="secondary" className="gap-1">
                Title: {filters.title}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('title')}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.assignedRep && (
              <Badge variant="secondary" className="gap-1">
                Rep: {filters.assignedRep}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('assignedRep')}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.isPrimary !== undefined && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.isPrimary ? 'Primary' : 'Secondary'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('isPrimary')}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};