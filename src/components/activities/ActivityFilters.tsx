import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, Download, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getActivityTypeLabel, getActivityTypeCategory } from "./ActivityTypeSelector";

interface ActivityFiltersProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  activityTypes: string[];
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  users: Array<{ id: string; name: string }>;
  selectedUser: string;
  onUserChange: (userId: string) => void;
  clientTypes: string[];
  selectedClientType: string;
  onClientTypeChange: (clientType: string) => void;
  onExport: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  activityTypes,
  selectedTypes,
  onTypeChange,
  users,
  selectedUser,
  onUserChange,
  clientTypes,
  selectedClientType,
  onClientTypeChange,
  onExport,
  onClearFilters,
  hasActiveFilters
}) => {
  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  // Group activity types by category
  const groupedTypes = activityTypes.reduce((acc, type) => {
    const category = getActivityTypeCategory(type);
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-3 w-3 mr-1" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => onDateRangeChange({
                  from: range?.from,
                  to: range?.to
                })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Activity Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Activity Types</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedTypes.length === 0 ? "All types" : 
                 selectedTypes.length === 1 ? getActivityTypeLabel(selectedTypes[0]) :
                 `${selectedTypes.length} types selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <div key={category}>
                    <div className="font-medium text-sm text-muted-foreground mb-2">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {types.map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => handleTypeToggle(type)}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{getActivityTypeLabel(type)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* User Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Logged By</label>
          <Select value={selectedUser} onValueChange={onUserChange}>
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Client Type</label>
          <Select value={selectedClientType} onValueChange={onClientTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {clientTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};