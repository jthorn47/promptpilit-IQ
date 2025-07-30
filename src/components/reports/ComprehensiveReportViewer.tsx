import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Mail,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  REPORT_REGISTRY, 
  getReportById, 
  ReportConfig, 
  ReportField 
} from './ReportRegistry';
import { generateReportData } from './MockDataGenerator';

interface ReportViewerProps {
  reportId: string;
  onBack: () => void;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const ComprehensiveReportViewer: React.FC<ReportViewerProps> = ({ 
  reportId, 
  onBack 
}) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const reportConfig = getReportById(reportId);
  
  if (!reportConfig) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Report not found</p>
        <Button onClick={onBack} className="mt-4">Back to Reports</Button>
      </div>
    );
  }

  // Generate mock data based on filters
  const rawData = useMemo(() => {
    return generateReportData(reportId, filters);
  }, [reportId, filters]);

  // Apply search and sorting
  const processedData = useMemo(() => {
    let data = [...rawData];

    // Apply search filter
    if (searchTerm) {
      data = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [rawData, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: ReportField) => {
    if (!field.sortable) return;
    
    setSortConfig(current => {
      if (current?.key === field.key) {
        return {
          key: field.key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key: field.key, direction: 'asc' };
    });
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const formatCellValue = (value: any, field: ReportField) => {
    if (value === null || value === undefined) return '-';
    
    switch (field.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      case 'date':
        return format(new Date(value), 'MM/dd/yyyy');
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return String(value);
    }
  };

  const getSortIcon = (field: ReportField) => {
    if (!field.sortable) return null;
    if (sortConfig?.key !== field.key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting ${reportConfig.name} as ${format.toUpperCase()}`);
    // In a real implementation, this would generate and download the file
  };

  const Icon = reportConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{reportConfig.name}</h1>
              <p className="text-muted-foreground">{reportConfig.description}</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary">{reportConfig.category}</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Options
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportConfig.filters.map(filter => (
                <div key={filter.key}>
                  <label className="text-sm font-medium mb-2 block">
                    {filter.label}
                    {filter.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {filter.type === 'select' && (
                    <Select
                      value={filters[filter.key] || ''}
                      onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === 'multiselect' && (
                    <div className="space-y-2">
                      {filter.options?.map(option => (
                        <label key={option.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters[filter.key]?.includes(option.value) || false}
                            onChange={(e) => {
                              const current = filters[filter.key] || [];
                              const updated = e.target.checked
                                ? [...current, option.value]
                                : current.filter((v: string) => v !== option.value);
                              handleFilterChange(filter.key, updated);
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {filter.type === 'daterange' && (
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        placeholder="Start Date"
                        onChange={(e) => handleFilterChange(`${filter.key}_start`, e.target.value)}
                      />
                      <Input
                        type="date"
                        placeholder="End Date"
                        onChange={(e) => handleFilterChange(`${filter.key}_end`, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search report data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {processedData.length} records
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {reportConfig.exportFormats.map(format => (
            <Button
              key={format}
              variant="outline"
              size="sm"
              onClick={() => handleExport(format)}
            >
              <Download className="w-4 h-4 mr-2" />
              {format.toUpperCase()}
            </Button>
          ))}
          {reportConfig.scheduleable && (
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  {reportConfig.fields.map(field => (
                    <th
                      key={field.key}
                      className={`px-4 py-3 text-left text-sm font-medium ${
                        field.sortable ? 'cursor-pointer hover:bg-muted' : ''
                      }`}
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-2">
                        {field.label}
                        {getSortIcon(field)}
                        {field.sensitive && (
                          <Badge variant="outline" className="text-xs">
                            Sensitive
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    {reportConfig.fields.map(field => (
                      <td key={field.key} className="px-4 py-3 text-sm">
                        {formatCellValue(row[field.key], field)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};