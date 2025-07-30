import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Filter, 
  X, 
  DollarSign, 
  Minus,
  ChevronDown,
  ChevronRight,
  Search
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

interface FilterState {
  search: string;
  type: 'earnings' | 'deductions' | 'all';
  category: string;
  taxTreatment: string;
  status: 'all' | 'active' | 'inactive';
  glAccount: string;
}

interface PayrollFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  earningsCount: number;
  deductionsCount: number;
}

export const PayrollFilterPanel: React.FC<PayrollFilterPanelProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  earningsCount,
  deductionsCount
}) => {
  const [typeOpen, setTypeOpen] = React.useState(true);
  const [categoryOpen, setCategoryOpen] = React.useState(true);
  const [statusOpen, setStatusOpen] = React.useState(true);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      category: 'all',
      taxTreatment: 'all',
      status: 'all',
      glAccount: 'all'
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== ''
  ).length;

  const payCategories = [
    'regular_hourly',
    'overtime',
    'bonus',
    'commission',
    'holiday_pay',
    'sick_pay',
    'vacation_pay',
    'reimbursement'
  ];

  const deductionCategories = [
    'pre_tax',
    'post_tax',
    'garnishment',
    'loan_repayment'
  ];

  const taxTreatments = [
    'taxable',
    'pre_tax',
    'post_tax',
    'tax_exempt'
  ];

  return (
    <div className="w-80 border-r border-border bg-card p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-sm font-medium mb-3">Summary</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Items</span>
            <Badge variant="outline">{totalCount}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-success" />
              Earnings
            </span>
            <Badge variant="outline">{earningsCount}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-destructive" />
              Deductions
            </span>
            <Badge variant="outline">{deductionsCount}</Badge>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-2 block">Quick Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or code..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Item Type Filter */}
      <Collapsible open={typeOpen} onOpenChange={setTypeOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium mb-3">
            Item Type
            {typeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mb-6">
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Types', count: totalCount },
              { value: 'earnings', label: 'Earnings', count: earningsCount },
              { value: 'deductions', label: 'Deductions', count: deductionsCount }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${option.value}`}
                  checked={filters.type === option.value}
                  onCheckedChange={() => updateFilter('type', option.value)}
                />
                <Label 
                  htmlFor={`type-${option.value}`} 
                  className="text-sm flex-1 flex justify-between cursor-pointer"
                >
                  {option.label}
                  <span className="text-muted-foreground text-xs">{option.count}</span>
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Category Filter */}
      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium mb-3">
            Category
            {categoryOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mb-6">
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pay_categories" disabled className="font-medium">
                --- Pay Categories ---
              </SelectItem>
              {payCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
              <SelectItem value="deduction_categories" disabled className="font-medium">
                --- Deduction Categories ---
              </SelectItem>
              {deductionCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Status Filter */}
      <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium mb-3">
            Status
            {statusOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mb-6">
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status === option.value}
                  onCheckedChange={() => updateFilter('status', option.value)}
                />
                <Label 
                  htmlFor={`status-${option.value}`} 
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Advanced Filters */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium mb-3">
            Advanced Filters
            {advancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mb-6">
          {/* Tax Treatment */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Tax Treatment</Label>
            <Select value={filters.taxTreatment} onValueChange={(value) => updateFilter('taxTreatment', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tax treatment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tax Treatments</SelectItem>
                {taxTreatments.map((treatment) => (
                  <SelectItem key={treatment} value={treatment}>
                    {treatment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GL Account */}
          <div>
            <Label className="text-sm font-medium mb-2 block">GL Account</Label>
            <Input
              placeholder="Filter by GL account..."
              value={filters.glAccount === 'all' ? '' : filters.glAccount}
              onChange={(e) => updateFilter('glAccount', e.target.value || 'all')}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-sm font-medium mb-3">Active Filters</div>
          <div className="space-y-2">
            {filters.type !== 'all' && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.type}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFilter('type', 'all')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {filters.category !== 'all' && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Category: {filters.category}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFilter('category', 'all')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {filters.status !== 'all' && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFilter('status', 'all')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};