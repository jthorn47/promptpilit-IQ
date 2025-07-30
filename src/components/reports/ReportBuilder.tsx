import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Play, 
  Calendar, 
  Filter,
  Columns,
  SortAsc,
  Calculator
} from 'lucide-react';
import { useReporting } from '@/hooks/useReporting';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  filters: FilterConfig[];
  columns: ColumnConfig[];
  groupBy: string[];
  sortBy: SortConfig[];
  calculations: CalculationConfig[];
  dateRange: { from: Date | null; to: Date | null };
}

interface FilterConfig {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ColumnConfig {
  id: string;
  field: string;
  label: string;
  visible: boolean;
  order: number;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface CalculationConfig {
  id: string;
  type: 'sum' | 'average' | 'count' | 'min' | 'max';
  field: string;
  label: string;
}

const DATA_SOURCES = [
  { value: 'payroll', label: 'Payroll Data', fields: ['employee_name', 'pay_type', 'rate', 'hours', 'total_pay', 'pay_period'] },
  { value: 'employees', label: 'Employee Information', fields: ['name', 'email', 'department', 'position', 'hire_date', 'status'] },
  { value: 'time_tracking', label: 'Time Tracking', fields: ['employee_name', 'date', 'hours_worked', 'overtime_hours', 'project'] },
  { value: 'benefits', label: 'Benefits', fields: ['employee_name', 'benefit_type', 'coverage', 'premium', 'deduction'] },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
];

export function ReportBuilder({ onClose, editingReport }: { onClose?: () => void; editingReport?: any }) {
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    dataSource: '',
    filters: [],
    columns: [],
    groupBy: [],
    sortBy: [],
    calculations: [],
    dateRange: { from: null, to: null },
  });

  const [activeStep, setActiveStep] = useState(0);
  const { saveReport } = useReporting();
  const { toast } = useToast();

  useEffect(() => {
    if (editingReport) {
      setConfig({
        name: editingReport.name || '',
        description: editingReport.description || '',
        dataSource: editingReport.data_source || '',
        ...editingReport.report_config,
      });
    }
  }, [editingReport]);

  const availableFields = DATA_SOURCES.find(ds => ds.value === config.dataSource)?.fields || [];

  const handleDataSourceChange = (value: string) => {
    const fields = DATA_SOURCES.find(ds => ds.value === value)?.fields || [];
    setConfig(prev => ({
      ...prev,
      dataSource: value,
      columns: fields.map((field, index) => ({
        id: `col-${index}`,
        field,
        label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        visible: true,
        order: index,
      })),
      filters: [],
      groupBy: [],
      sortBy: [],
      calculations: [],
    }));
  };

  const addFilter = () => {
    const newFilter: FilterConfig = {
      id: `filter-${Date.now()}`,
      field: availableFields[0] || '',
      operator: 'equals',
      value: '',
    };
    setConfig(prev => ({ ...prev, filters: [...prev.filters, newFilter] }));
  };

  const updateFilter = (id: string, updates: Partial<FilterConfig>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      ),
    }));
  };

  const removeFilter = (id: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== id),
    }));
  };

  const handleColumnToggle = (field: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.field === field ? { ...col, visible: !col.visible } : col
      ),
    }));
  };

  const handleColumnReorder = (result: any) => {
    if (!result.destination) return;

    const newColumns = Array.from(config.columns);
    const [reorderedColumn] = newColumns.splice(result.source.index, 1);
    newColumns.splice(result.destination.index, 0, reorderedColumn);

    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    setConfig(prev => ({ ...prev, columns: updatedColumns }));
  };

  const addCalculation = () => {
    const newCalculation: CalculationConfig = {
      id: `calc-${Date.now()}`,
      type: 'sum',
      field: availableFields.find(f => f.includes('total') || f.includes('amount') || f.includes('hours')) || availableFields[0] || '',
      label: 'New Calculation',
    };
    setConfig(prev => ({ ...prev, calculations: [...prev.calculations, newCalculation] }));
  };

  const updateCalculation = (id: string, updates: Partial<CalculationConfig>) => {
    setConfig(prev => ({
      ...prev,
      calculations: prev.calculations.map(calc =>
        calc.id === id ? { ...calc, ...updates } : calc
      ),
    }));
  };

  const removeCalculation = (id: string) => {
    setConfig(prev => ({
      ...prev,
      calculations: prev.calculations.filter(calc => calc.id !== id),
    }));
  };

  const handleSave = async () => {
    if (!config.name || !config.dataSource) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and select a data source",
        variant: "destructive",
      });
      return;
    }

    const reportData = {
      name: config.name,
      description: config.description,
      data_source: config.dataSource,
      report_config: {
        filters: config.filters,
        columns: config.columns,
        groupBy: config.groupBy,
        sortBy: config.sortBy,
        calculations: config.calculations,
        dateRange: config.dateRange,
      },
      is_template: false,
    };

    const result = await saveReport(reportData);
    if (result.success && onClose) {
      onClose();
    }
  };

  const steps = [
    { title: 'Data Source', icon: Filter },
    { title: 'Filters', icon: Filter },
    { title: 'Columns', icon: Columns },
    { title: 'Grouping & Sort', icon: SortAsc },
    { title: 'Calculations', icon: Calculator },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingReport ? 'Edit Report' : 'Report Builder'}
          </CardTitle>
          <CardDescription>
            Create custom reports with filters, grouping, and calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter report name"
              />
            </div>
            <div>
              <Label htmlFor="data-source">Data Source</Label>
              <Select value={config.dataSource} onValueChange={handleDataSourceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map(source => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this report"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex justify-center space-x-1 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <Button
              key={index}
              variant={activeStep === index ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStep(index)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <IconComponent className="h-4 w-4" />
              {step.title}
            </Button>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Source Configuration</CardTitle>
            <CardDescription>Configure your data source and date range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date Range (Optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={config.dateRange.from ? config.dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, from: e.target.value ? new Date(e.target.value) : null }
                  }))}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={config.dateRange.to ? config.dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, to: e.target.value ? new Date(e.target.value) : null }
                  }))}
                  placeholder="End date"
                />
              </div>
            </div>
            {config.dataSource && (
              <div>
                <Label>Available Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableFields.map(field => (
                    <Badge key={field} variant="secondary">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Filters
              <Button onClick={addFilter} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </CardTitle>
            <CardDescription>Add filters to narrow down your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map(field => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, { operator: value })}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Filter value"
                    className="flex-1"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {config.filters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No filters added. Click "Add Filter" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Selection</CardTitle>
            <CardDescription>Choose and reorder the columns to include in your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Available Columns</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {config.columns.map((column) => (
                    <div key={column.field} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.field}
                        checked={column.visible}
                        onCheckedChange={() => handleColumnToggle(column.field)}
                      />
                      <Label htmlFor={column.field} className="text-sm font-normal cursor-pointer">
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Column Order</Label>
                <DragDropContext onDragEnd={handleColumnReorder}>
                  <Droppable droppableId="columns">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-64 overflow-y-auto">
                        {config.columns
                          .filter(col => col.visible)
                          .sort((a, b) => a.order - b.order)
                          .map((column, index) => (
                            <Draggable key={column.field} draggableId={column.field} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center gap-2 p-2 bg-muted rounded border"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{column.label}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Grouping & Sorting</CardTitle>
            <CardDescription>Configure how your data should be grouped and sorted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Group By</Label>
              <div className="flex flex-wrap gap-2">
                {availableFields.map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${field}`}
                      checked={config.groupBy.includes(field)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig(prev => ({ ...prev, groupBy: [...prev.groupBy, field] }));
                        } else {
                          setConfig(prev => ({ ...prev, groupBy: prev.groupBy.filter(f => f !== field) }));
                        }
                      }}
                    />
                    <Label htmlFor={`group-${field}`} className="text-sm cursor-pointer">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium mb-3 block">Sort By</Label>
              <div className="space-y-3">
                {config.sortBy.map((sort, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Select 
                      value={sort.field} 
                      onValueChange={(value) => {
                        const newSortBy = [...config.sortBy];
                        newSortBy[index] = { ...sort, field: value };
                        setConfig(prev => ({ ...prev, sortBy: newSortBy }));
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map(field => (
                          <SelectItem key={field} value={field}>
                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={sort.direction} 
                      onValueChange={(value: 'asc' | 'desc') => {
                        const newSortBy = [...config.sortBy];
                        newSortBy[index] = { ...sort, direction: value };
                        setConfig(prev => ({ ...prev, sortBy: newSortBy }));
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSortBy = config.sortBy.filter((_, i) => i !== index);
                        setConfig(prev => ({ ...prev, sortBy: newSortBy }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      sortBy: [...prev.sortBy, { field: availableFields[0] || '', direction: 'asc' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sort
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Calculations
              <Button onClick={addCalculation} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Calculation
              </Button>
            </CardTitle>
            <CardDescription>Add calculations like totals, averages, and counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.calculations.map((calc) => (
                <div key={calc.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Select value={calc.type} onValueChange={(value: any) => updateCalculation(calc.id, { type: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">Sum</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="min">Minimum</SelectItem>
                      <SelectItem value="max">Maximum</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={calc.field} onValueChange={(value) => updateCalculation(calc.id, { field: value })}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map(field => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={calc.label}
                    onChange={(e) => updateCalculation(calc.id, { label: e.target.value })}
                    placeholder="Calculation label"
                    className="flex-1"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCalculation(calc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {config.calculations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No calculations added. Click "Add Calculation" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {activeStep > 0 && (
            <Button variant="outline" onClick={() => setActiveStep(activeStep - 1)}>
              Previous
            </Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button onClick={() => setActiveStep(activeStep + 1)}>
              Next
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Report
          </Button>
        </div>
      </div>
    </div>
  );
}