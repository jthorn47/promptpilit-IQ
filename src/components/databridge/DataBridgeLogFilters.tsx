import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { LogFilters, getAvailableModules } from '@/services/databridge/logService';
import { cn } from '@/lib/utils';

interface DataBridgeLogFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const DataBridgeLogFilters: React.FC<DataBridgeLogFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading = false
}) => {
  const [modules, setModules] = useState<{ origins: string[]; targets: string[] }>({
    origins: [],
    targets: []
  });
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );

  useEffect(() => {
    getAvailableModules().then(setModules);
  }, []);

  const handleFilterChange = (key: keyof LogFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    handleFilterChange('date_from', date ? date.toISOString() : undefined);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    handleFilterChange('date_to', date ? date.toISOString() : undefined);
  };

  const handleClearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="stale">Stale</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Origin Module Filter */}
          <div className="space-y-2">
            <Label htmlFor="origin">Origin Module</Label>
            <Select
              value={filters.origin_module || ''}
              onValueChange={(value) => handleFilterChange('origin_module', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All origins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Origins</SelectItem>
                {modules.origins.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Module Filter */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Module</Label>
            <Select
              value={filters.target_module || ''}
              onValueChange={(value) => handleFilterChange('target_module', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All targets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Targets</SelectItem>
                {modules.targets.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From Filter */}
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To Filter */}
          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Filter */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search errors or modules..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            size="sm"
          >
            Clear Filters
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};