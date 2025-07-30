import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Table, 
  Image, 
  Mail, 
  Calendar,
  Clock,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReporting } from '@/hooks/useReporting';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface EnhancedReportExporterProps {
  data: any[];
  reportType: string;
  columns: { key: string; label: string }[];
  companyName?: string;
  savedReportId?: string;
}

export function EnhancedReportExporter({ 
  data, 
  reportType, 
  columns, 
  companyName = 'EaseLearn',
  savedReportId
}: EnhancedReportExporterProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(col => col.key));
  const [isExporting, setIsExporting] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  
  // Email options
  const [emailRecipients, setEmailRecipients] = useState<string[]>(['']);
  const [emailSubject, setEmailSubject] = useState(`${reportType} Report - ${new Date().toLocaleDateString()}`);
  const [emailMessage, setEmailMessage] = useState(`Please find the attached ${reportType} report.`);
  
  // Schedule options
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(1); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState(1);
  
  const { toast } = useToast();
  const { scheduleReport, executeReport } = useReporting();

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const exportToCSV = () => {
    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    const headers = filteredColumns.map(col => col.label);
    const rows = data.map(row => 
      filteredColumns.map(col => {
        const value = row[col.key];
        return typeof value === 'object' ? JSON.stringify(value) : value || '';
      })
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    const worksheetData = [
      filteredColumns.map(col => col.label),
      ...data.map(row => 
        filteredColumns.map(col => {
          const value = row[col.key];
          return typeof value === 'object' ? JSON.stringify(value) : value || '';
        })
      )
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);

    // Add company branding
    const title = `${companyName} - ${reportType} Report`;
    const dateRange = `Generated: ${new Date().toLocaleDateString()}`;
    
    XLSX.utils.sheet_add_aoa(worksheet, [[title], [dateRange], []], { origin: 'A1' });
    
    const filename = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    return { filename, blob: null }; // For email usage, we'd need to create blob
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    
    // Add header with company branding
    doc.setFontSize(20);
    doc.text(`${companyName}`, 20, 20);
    doc.setFontSize(16);
    doc.text(`${reportType} Report`, 20, 35);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

    // Prepare table data
    const tableHeaders = filteredColumns.map(col => col.label);
    const tableRows = data.map(row => 
      filteredColumns.map(col => {
        const value = row[col.key];
        return typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      })
    );

    // Add table
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [101, 93, 198], // EaseLearn primary color
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    const filename = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    return { filename, blob: doc.output('blob') };
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "No columns selected",
        description: "Please select at least one column to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      let result;
      switch (exportFormat) {
        case 'csv':
          exportToCSV();
          break;
        case 'excel':
          result = exportToExcel();
          break;
        case 'pdf':
          result = exportToPDF();
          break;
      }

      toast({
        title: "Export successful",
        description: `${reportType} report exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailSend = async () => {
    const validEmails = emailRecipients.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: "No valid recipients",
        description: "Please add at least one valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!savedReportId) {
      toast({
        title: "Report not saved",
        description: "Please save the report first before emailing.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const result = await executeReport(savedReportId, {
        sendEmail: true,
        recipients: validEmails,
      });

      if (result.success) {
        toast({
          title: "Email sent",
          description: `Report sent to ${validEmails.length} recipient(s).`,
        });
        setShowEmailOptions(false);
      }
    } catch (error) {
      toast({
        title: "Email failed",
        description: "Failed to send report via email.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSchedule = async () => {
    if (!savedReportId) {
      toast({
        title: "Report not saved",
        description: "Please save the report first before scheduling.",
        variant: "destructive",
      });
      return;
    }

    const validEmails = emailRecipients.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: "No valid recipients",
        description: "Please add at least one valid email address for scheduled delivery.",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduleData = {
        saved_report_id: savedReportId,
        schedule_frequency: scheduleFrequency,
        schedule_time: scheduleTime,
        schedule_day_of_week: scheduleFrequency === 'weekly' ? scheduleDayOfWeek : null,
        schedule_day_of_month: scheduleFrequency === 'monthly' ? scheduleDayOfMonth : null,
        email_recipients: validEmails,
        email_subject: emailSubject,
        email_message: emailMessage,
        export_format: exportFormat,
        is_active: true,
      };

      const result = await scheduleReport(scheduleData);
      
      if (result.success) {
        setShowScheduleOptions(false);
      }
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: "Failed to schedule report delivery.",
        variant: "destructive",
      });
    }
  };

  const addEmailRecipient = () => {
    setEmailRecipients(prev => [...prev, '']);
  };

  const updateEmailRecipient = (index: number, value: string) => {
    setEmailRecipients(prev => prev.map((email, i) => i === index ? value : email));
  };

  const removeEmailRecipient = (index: number) => {
    if (emailRecipients.length > 1) {
      setEmailRecipients(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'csv':
        return <Table className="h-4 w-4" />;
      case 'excel':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <Image className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Share Report
        </CardTitle>
        <CardDescription>
          Export, email, or schedule automatic delivery of your {reportType.toLowerCase()} report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div>
          <Label className="text-sm font-medium">Export Format</Label>
          <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setExportFormat(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV - Comma Separated Values</SelectItem>
              <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
              <SelectItem value="pdf">PDF - Branded Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Column Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Include Columns</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={selectedColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                />
                <Label
                  htmlFor={column.key}
                  className="text-sm font-normal cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Options */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedColumns.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background" />
            ) : (
              getFormatIcon()
            )}
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowEmailOptions(!showEmailOptions)}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Report
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowScheduleOptions(!showScheduleOptions)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule Delivery
          </Button>
        </div>

        {/* Email Options */}
        {showEmailOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Recipients</Label>
                <div className="space-y-2 mt-1">
                  {emailRecipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmailRecipient(index, e.target.value)}
                        placeholder="email@example.com"
                        className="flex-1"
                      />
                      {index > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeEmailRecipient(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addEmailRecipient}>
                    Add Recipient
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email-message">Message</Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEmailSend} disabled={isExporting}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline" onClick={() => setShowEmailOptions(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Options */}
        {showScheduleOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Automatic Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={scheduleFrequency} onValueChange={(value: any) => setScheduleFrequency(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {scheduleFrequency === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <Select value={scheduleDayOfWeek.toString()} onValueChange={(value) => setScheduleDayOfWeek(parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scheduleFrequency === 'monthly' && (
                <div>
                  <Label>Day of Month</Label>
                  <Select value={scheduleDayOfMonth.toString()} onValueChange={(value) => setScheduleDayOfMonth(parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Recipients (for scheduled delivery)</Label>
                <div className="space-y-2 mt-1">
                  {emailRecipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmailRecipient(index, e.target.value)}
                        placeholder="email@example.com"
                        className="flex-1"
                      />
                      {index > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeEmailRecipient(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addEmailRecipient}>
                    Add Recipient
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSchedule}>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Delivery
                </Button>
                <Button variant="outline" onClick={() => setShowScheduleOptions(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{data.length} records</span>
            <span>{selectedColumns.length} columns</span>
            {showEmailOptions && <Badge variant="secondary">Email Ready</Badge>}
            {showScheduleOptions && <Badge variant="secondary">Schedule Ready</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}