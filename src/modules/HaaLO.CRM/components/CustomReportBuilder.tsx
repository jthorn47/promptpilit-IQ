import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Trash2,
  Save,
  Play,
  FileText,
  Calendar,
  Filter,
  Download,
  Settings,
  BarChart3,
  Table,
  PieChart
} from 'lucide-react';

interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  table: string;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  type: 'table' | 'chart' | 'dashboard';
  fields: string[];
  filters: ReportFilter[];
  createdAt: string;
  lastRun: string;
}

const availableFields: ReportField[] = [
  { id: 'lead_name', name: 'Lead Name', type: 'string', table: 'leads' },
  { id: 'lead_status', name: 'Lead Status', type: 'string', table: 'leads' },
  { id: 'lead_source', name: 'Lead Source', type: 'string', table: 'leads' },
  { id: 'lead_created', name: 'Created Date', type: 'date', table: 'leads' },
  { id: 'deal_value', name: 'Deal Value', type: 'number', table: 'deals' },
  { id: 'deal_stage', name: 'Deal Stage', type: 'string', table: 'deals' },
  { id: 'deal_close_date', name: 'Close Date', type: 'date', table: 'deals' },
  { id: 'company_name', name: 'Company Name', type: 'string', table: 'companies' },
  { id: 'company_industry', name: 'Industry', type: 'string', table: 'companies' },
  { id: 'company_size', name: 'Company Size', type: 'number', table: 'companies' },
  { id: 'activity_type', name: 'Activity Type', type: 'string', table: 'activities' },
  { id: 'activity_date', name: 'Activity Date', type: 'date', table: 'activities' }
];

const savedReports: SavedReport[] = [
  {
    id: '1',
    name: 'Monthly Sales Report',
    description: 'Comprehensive monthly sales performance analysis',
    type: 'dashboard',
    fields: ['deal_value', 'deal_stage', 'deal_close_date'],
    filters: [],
    createdAt: '2024-01-15',
    lastRun: '2024-01-20'
  },
  {
    id: '2',
    name: 'Lead Source Analysis',
    description: 'Analysis of lead sources and conversion rates',
    type: 'chart',
    fields: ['lead_source', 'lead_status', 'lead_created'],
    filters: [],
    createdAt: '2024-01-10',
    lastRun: '2024-01-19'
  },
  {
    id: '3',
    name: 'Pipeline Health Check',
    description: 'Current pipeline status and health metrics',
    type: 'table',
    fields: ['deal_stage', 'deal_value', 'company_name'],
    filters: [],
    createdAt: '2024-01-05',
    lastRun: '2024-01-18'
  }
];

export const CustomReportBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState<'table' | 'chart' | 'dashboard'>('table');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setFilters(filters.map(f => f.id === filterId ? { ...f, ...updates } : f));
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const runReport = () => {
    console.log('Running report with:', {
      name: reportName,
      type: reportType,
      fields: selectedFields,
      filters
    });
    // Implementation for running the report
  };

  const saveReport = () => {
    console.log('Saving report:', {
      name: reportName,
      description: reportDescription,
      type: reportType,
      fields: selectedFields,
      filters
    });
    // Implementation for saving the report
  };

  const exportReport = (format: string) => {
    console.log(`Exporting report as ${format}`);
    // Implementation for exporting reports
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Custom Report Builder</h1>
          <p className="text-muted-foreground">Create and manage custom reports for your CRM data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Report Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportDescription">Description</Label>
                    <Textarea
                      id="reportDescription"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Enter report description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">
                          <div className="flex items-center gap-2">
                            <Table className="h-4 w-4" />
                            Table Report
                          </div>
                        </SelectItem>
                        <SelectItem value="chart">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Chart Report
                          </div>
                        </SelectItem>
                        <SelectItem value="dashboard">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Dashboard Report
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={saveReport} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Report
                    </Button>
                    <Button onClick={runReport} variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Run Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Field Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Fields</CardTitle>
                  <CardDescription>Select fields to include in your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableFields.map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={field.id} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {field.name}
                          </Label>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {field.table}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {field.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Preview */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Report Filters
                    </div>
                    <Button onClick={addFilter} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filters.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No filters added. Click "Add Filter" to create filter conditions.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filters.map((filter) => (
                        <div key={filter.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Select 
                            value={filter.field} 
                            onValueChange={(value) => updateFilter(filter.id, { field: value })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map((field) => (
                                <SelectItem key={field.id} value={field.id}>
                                  {field.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select 
                            value={filter.operator} 
                            onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="between">Between</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            placeholder="Filter value"
                            className="flex-1"
                          />

                          <Button 
                            onClick={() => removeFilter(filter.id)} 
                            variant="outline" 
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>
                    Preview of your report with current configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedFields.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select fields to see report preview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{reportType} Report</Badge>
                        <Badge variant="secondary">{selectedFields.length} fields</Badge>
                        <Badge variant="secondary">{filters.length} filters</Badge>
                      </div>

                      {reportType === 'table' && (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                {selectedFields.map((fieldId) => {
                                  const field = availableFields.find(f => f.id === fieldId);
                                  return (
                                    <th key={fieldId} className="text-left p-3 font-medium">
                                      {field?.name}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {selectedFields.map((fieldId) => (
                                  <td key={fieldId} className="p-3 text-muted-foreground">
                                    Sample data
                                  </td>
                                ))}
                              </tr>
                              <tr className="border-t">
                                {selectedFields.map((fieldId) => (
                                  <td key={fieldId} className="p-3 text-muted-foreground">
                                    Sample data
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {reportType === 'chart' && (
                        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Chart visualization will appear here</p>
                          </div>
                        </div>
                      )}

                      {reportType === 'dashboard' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground">Widget 1</span>
                          </div>
                          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground">Widget 2</span>
                          </div>
                          <div className="h-32 bg-muted rounded-lg flex items-center justify-center col-span-2">
                            <span className="text-muted-foreground">Main Chart</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription className="mt-1">{report.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {report.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last run: {report.lastRun}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {report.fields.length} fields
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {report.filters.length} filters
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Sales Performance Template</CardTitle>
                <CardDescription>Comprehensive sales metrics and KPIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Dashboard</Badge>
                    <Badge variant="secondary">Popular</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Includes revenue trends, deal pipeline, team performance
                  </p>
                  <Button className="w-full">Use Template</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Lead Analysis Template</CardTitle>
                <CardDescription>Lead source and conversion analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Chart</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track lead sources, conversion rates, and quality metrics
                  </p>
                  <Button className="w-full" variant="outline">Use Template</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Activity Summary Template</CardTitle>
                <CardDescription>Team activity and productivity report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Table</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Daily/weekly activity summaries and productivity metrics
                  </p>
                  <Button className="w-full" variant="outline">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};