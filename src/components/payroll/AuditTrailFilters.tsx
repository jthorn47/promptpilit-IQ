import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AuditFilters {
  employee: string;
  payPeriod: string;
  changeType: string;
  dateRange: { start: string; end: string };
  user: string;
  impact: string;
}

interface AuditTrailFiltersProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
}

export const AuditTrailFilters: React.FC<AuditTrailFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: start ? format(start, 'yyyy-MM-dd') : '',
        end: end ? format(end, 'yyyy-MM-dd') : ''
      }
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      employee: 'all',
      payPeriod: 'all',
      changeType: 'all',
      dateRange: { start: '', end: '' },
      user: 'all',
      impact: 'all'
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Filter */}
        <div className="space-y-2">
          <Label htmlFor="employee">Employee</Label>
          <Select value={filters.employee} onValueChange={(value) => handleFilterChange('employee', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              <SelectItem value="john-doe">John Doe</SelectItem>
              <SelectItem value="jane-smith">Jane Smith</SelectItem>
              <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
              <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pay Period Filter */}
        <div className="space-y-2">
          <Label htmlFor="payPeriod">Pay Period</Label>
          <Select value={filters.payPeriod} onValueChange={(value) => handleFilterChange('payPeriod', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All periods</SelectItem>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2024-02">February 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-11">November 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Change Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="changeType">Change Type</Label>
          <Select value={filters.changeType} onValueChange={(value) => handleFilterChange('changeType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All changes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All changes</SelectItem>
              <SelectItem value="manual_override">Manual Override</SelectItem>
              <SelectItem value="system_calculation">System Calculation</SelectItem>
              <SelectItem value="rate_change">Rate Change</SelectItem>
              <SelectItem value="tax_adjustment">Tax Adjustment</SelectItem>
              <SelectItem value="deduction_change">Deduction Change</SelectItem>
              <SelectItem value="approval_action">Approval Action</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-1 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    handleDateRangeChange(date, endDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    handleDateRangeChange(startDate, date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* User Filter */}
        <div className="space-y-2">
          <Label htmlFor="user">Modified By</Label>
          <Select value={filters.user} onValueChange={(value) => handleFilterChange('user', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              <SelectItem value="admin">System Admin</SelectItem>
              <SelectItem value="hr-manager">HR Manager</SelectItem>
              <SelectItem value="payroll-clerk">Payroll Clerk</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Impact Level Filter */}
        <div className="space-y-2">
          <Label htmlFor="impact">Impact Level</Label>
          <Select value={filters.impact} onValueChange={(value) => handleFilterChange('impact', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All impacts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All impacts</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};