import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Calendar, 
  Clock,
  Send,
  Download,
  Settings,
  Plus,
  Edit,
  Trash,
  Play,
  Pause,
  Eye,
  Copy,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  template_config: any;
  layout_config: any;
  is_active: boolean;
  is_system_template: boolean;
  created_at: string;
}

interface ScheduledReport {
  id: string;
  template_id: string;
  name: string;
  description: string;
  schedule_frequency: string;
  schedule_time: string;
  schedule_day_of_week?: number;
  schedule_day_of_month?: number;
  recipients: string[];
  last_generated_at?: string;
  next_generation_at: string;
  is_active: boolean;
  report_format: string;
  template?: ReportTemplate;
}

interface ReportInstance {
  id: string;
  template_id: string;
  report_name: string;
  generated_at: string;
  generated_by?: string;
  file_url?: string;
  file_size?: number;
  status: string;
  error_message?: string;
  template?: ReportTemplate;
}

const REPORT_TYPES = [
  { value: 'kpi', label: 'KPI Dashboard', icon: BarChart3 },
  { value: 'performance', label: 'Performance Report', icon: TrendingUp },
  { value: 'compliance', label: 'Compliance Report', icon: Shield },
  { value: 'financial', label: 'Financial Report', icon: Users },
  { value: 'custom', label: 'Custom Report', icon: Settings }
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' }
];

export function ReportingCenter() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [reportInstances, setReportInstances] = useState<ReportInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [newSchedule, setNewSchedule] = useState({
    template_id: '',
    name: '',
    description: '',
    schedule_frequency: 'weekly',
    schedule_time: '09:00',
    schedule_day_of_week: 1,
    schedule_day_of_month: 1,
    recipients: [''],
    report_format: 'pdf'
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    report_type: 'kpi',
    template_config: {},
    layout_config: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadTemplates(),
        loadScheduledReports(),
        loadReportInstances()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load reporting data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTemplates(data || []);
  };

  const loadScheduledReports = async () => {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select(`
        *,
        template:report_templates(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setScheduledReports(data || []);
  };

  const loadReportInstances = async () => {
    const { data, error } = await supabase
      .from('report_instances')
      .select(`
        *,
        template:report_templates(*)
      `)
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setReportInstances(data || []);
  };

  const handleCreateTemplate = async () => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .insert({
          ...newTemplate,
          template_config: JSON.stringify(newTemplate.template_config),
          layout_config: JSON.stringify(newTemplate.layout_config)
        });

      if (error) throw error;

      await loadTemplates();
      setIsTemplateDialogOpen(false);
      setNewTemplate({
        name: '',
        description: '',
        report_type: 'kpi',
        template_config: {},
        layout_config: {}
      });

      toast({
        title: "Success",
        description: "Report template created successfully",
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleScheduleReport = async () => {
    try {
      // Calculate next generation date
      const nextGenerationAt = new Date();
      nextGenerationAt.setDate(nextGenerationAt.getDate() + 1); // Set to tomorrow for demo
      
      const { error } = await supabase
        .from('scheduled_reports')
        .insert({
          template_id: newSchedule.template_id,
          name: newSchedule.name,
          description: newSchedule.description,
          schedule_frequency: newSchedule.schedule_frequency,
          schedule_time: newSchedule.schedule_time,
          schedule_day_of_week: newSchedule.schedule_day_of_week,
          schedule_day_of_month: newSchedule.schedule_day_of_month,
          recipients: newSchedule.recipients.filter(email => email.trim()),
          next_generation_at: nextGenerationAt.toISOString(),
          report_format: newSchedule.report_format
        });

      if (error) throw error;

      await loadScheduledReports();
      setIsNewReportDialogOpen(false);
      setNewSchedule({
        template_id: '',
        name: '',
        description: '',
        schedule_frequency: 'weekly',
        schedule_time: '09:00',
        schedule_day_of_week: 1,
        schedule_day_of_month: 1,
        recipients: [''],
        report_format: 'pdf'
      });

      toast({
        title: "Success",
        description: "Report scheduled successfully",
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast({
        title: "Error",
        description: "Failed to schedule report",
        variant: "destructive",
      });
    }
  };

  const handleToggleSchedule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      await loadScheduledReports();
      toast({
        title: "Success",
        description: `Report ${!isActive ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { template_id: templateId }
      });

      if (error) throw error;

      await loadReportInstances();
      toast({
        title: "Success",
        description: "Report generation started",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadScheduledReports();
      toast({
        title: "Success",
        description: "Scheduled report deleted",
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const addRecipient = () => {
    setNewSchedule({
      ...newSchedule,
      recipients: [...newSchedule.recipients, '']
    });
  };

  const updateRecipient = (index: number, email: string) => {
    const updated = [...newSchedule.recipients];
    updated[index] = email;
    setNewSchedule({ ...newSchedule, recipients: updated });
  };

  const removeRecipient = (index: number) => {
    if (newSchedule.recipients.length > 1) {
      const updated = newSchedule.recipients.filter((_, i) => i !== index);
      setNewSchedule({ ...newSchedule, recipients: updated });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'generating': return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.report_type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reporting center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reporting Center</h1>
          <p className="text-muted-foreground">Manage report templates, schedules, and generated reports</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Report Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-type">Report Type</Label>
                    <Select value={newTemplate.report_type} onValueChange={(value) => setNewTemplate({ ...newTemplate, report_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Enter template description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isNewReportDialogOpen} onOpenChange={setIsNewReportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule-name">Report Name</Label>
                    <Input
                      id="schedule-name"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-select">Template</Label>
                    <Select value={newSchedule.template_id} onValueChange={(value) => setNewSchedule({ ...newSchedule, template_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="schedule-description">Description</Label>
                  <Textarea
                    id="schedule-description"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                    placeholder="Enter report description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={newSchedule.schedule_frequency} onValueChange={(value) => setNewSchedule({ ...newSchedule, schedule_frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map(freq => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newSchedule.schedule_time}
                      onChange={(e) => setNewSchedule({ ...newSchedule, schedule_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Format</Label>
                    <Select value={newSchedule.report_format} onValueChange={(value) => setNewSchedule({ ...newSchedule, report_format: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATS.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newSchedule.schedule_frequency === 'weekly' && (
                  <div>
                    <Label htmlFor="day-of-week">Day of Week</Label>
                    <Select value={newSchedule.schedule_day_of_week.toString()} onValueChange={(value) => setNewSchedule({ ...newSchedule, schedule_day_of_week: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newSchedule.schedule_frequency === 'monthly' && (
                  <div>
                    <Label htmlFor="day-of-month">Day of Month</Label>
                    <Input
                      id="day-of-month"
                      type="number"
                      min="1"
                      max="31"
                      value={newSchedule.schedule_day_of_month}
                      onChange={(e) => setNewSchedule({ ...newSchedule, schedule_day_of_month: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                <div>
                  <Label>Recipients</Label>
                  <div className="space-y-2">
                    {newSchedule.recipients.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                          placeholder="Enter email address"
                        />
                        {newSchedule.recipients.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRecipient(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addRecipient}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipient
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewReportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleScheduleReport}>
                    Schedule Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {REPORT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const ReportIcon = REPORT_TYPES.find(t => t.value === template.report_type)?.icon || FileText;
              return (
                <Card key={template.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ReportIcon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {template.is_system_template && (
                          <Badge variant="secondary">System</Badge>
                        )}
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {template.report_type.charAt(0).toUpperCase() + template.report_type.slice(1)} Report
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateReport(template.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{report.template?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.schedule_frequency}</Badge>
                  </TableCell>
                  <TableCell>{new Date(report.next_generation_at).toLocaleString()}</TableCell>
                  <TableCell>{report.recipients.length} recipient(s)</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {report.is_active ? (
                        <Play className="h-4 w-4 text-success" />
                      ) : (
                        <Pause className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={report.is_active ? 'text-success' : 'text-muted-foreground'}>
                        {report.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleSchedule(report.id, report.is_active)}
                      >
                        {report.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSchedule(report.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportInstances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.report_name}</TableCell>
                  <TableCell>{instance.template?.name}</TableCell>
                  <TableCell>{new Date(instance.generated_at).toLocaleString()}</TableCell>
                  <TableCell>{formatFileSize(instance.file_size)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(instance.status)}
                      <span className={
                        instance.status === 'generated' ? 'text-success' :
                        instance.status === 'failed' ? 'text-destructive' :
                        'text-muted-foreground'
                      }>
                        {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {instance.file_url && instance.status === 'generated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(instance.file_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {instance.error_message && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast({
                            title: "Error Details",
                            description: instance.error_message,
                            variant: "destructive",
                          })}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}