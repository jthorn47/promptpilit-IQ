import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, ChevronDown, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

interface FilterConfig {
  id: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'multiSelect' | 'number'
  label: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  value?: any
}

interface SmartFiltersProps {
  filters: FilterConfig[]
  onFiltersChange: (filters: FilterConfig[]) => void
  onAddFilter: () => void
  onSaveView?: (name: string) => void
  savedViews?: Array<{ id: string; name: string; filters: FilterConfig[] }>
  onLoadView?: (view: any) => void
}

export function SmartFilters({
  filters,
  onFiltersChange,
  onAddFilter,
  onSaveView,
  savedViews = [],
  onLoadView
}: SmartFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = useCallback((id: string, value: any) => {
    const updated = filters.map(filter => 
      filter.id === id ? { ...filter, value } : filter
    )
    onFiltersChange(updated)
  }, [filters, onFiltersChange])

  const removeFilter = useCallback((id: string) => {
    const updated = filters.filter(filter => filter.id !== id)
    onFiltersChange(updated)
  }, [filters, onFiltersChange])

  const clearAllFilters = useCallback(() => {
    const cleared = filters.map(filter => ({ ...filter, value: undefined }))
    onFiltersChange(cleared)
  }, [filters, onFiltersChange])

  const getActiveFilterCount = () => {
    return filters.filter(f => f.value !== undefined && f.value !== '' && f.value !== null).length
  }

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full"
          />
        )

      case 'select':
        return (
          <Select value={filter.value || ''} onValueChange={(value) => updateFilter(filter.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiSelect':
        const selectedValues = filter.value || []
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedValues.length > 0 
                  ? `${selectedValues.length} selected`
                  : `Select ${filter.label.toLowerCase()}`
                }
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-3">
              <div className="space-y-2">
                {filter.options?.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...selectedValues, option.value]
                          : selectedValues.filter((v: string) => v !== option.value)
                        updateFilter(filter.id, newValues)
                      }}
                    />
                    <label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )

      case 'dateRange':
        const dateValue = filter.value as DateRange | undefined
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue?.from ? (
                  dateValue.to ? (
                    <>
                      {format(dateValue.from, "LLL dd, y")} -{" "}
                      {format(dateValue.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateValue.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateValue?.from}
                selected={dateValue}
                onSelect={(date) => updateFilter(filter.id, date)}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, parseFloat(e.target.value) || undefined)}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Smart Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Saved Views */}
          {savedViews.length > 0 && (
            <Select onValueChange={onLoadView}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Load view" />
              </SelectTrigger>
              <SelectContent>
                {savedViews.map(view => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            Advanced
          </Button>
          
          <Button variant="outline" size="sm" onClick={onAddFilter}>
            <Plus className="h-4 w-4 mr-1" />
            Add Filter
          </Button>
          
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick search across all data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Grid */}
      {filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {filters.map((filter, index) => (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  {filter.label}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-6 w-6 p-0 hover:bg-destructive/10"
                >
                  ×
                </Button>
              </div>
              {renderFilter(filter)}
            </motion.div>
          ))}
        </div>
      )}

      {/* Advanced Options */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border pt-4 mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Sort By
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sort field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Last Modified</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Order
              </label>
              <Select defaultValue="desc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Limit Results
              </label>
              <Select defaultValue="100">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                  <SelectItem value="500">500 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filters.length === 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Filters Applied</h4>
          <p className="text-muted-foreground mb-4">
            Add filters to refine your data and create focused reports
          </p>
          <Button onClick={onAddFilter}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Filter
          </Button>
        </div>
      )}
    </Card>
  )
}