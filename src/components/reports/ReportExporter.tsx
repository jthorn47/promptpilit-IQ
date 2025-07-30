import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Table, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportExporterProps {
  data: any[];
  reportType: string;
  columns: { key: string; label: string }[];
  companyName?: string;
}

export function ReportExporter({ data, reportType, columns, companyName = 'EaseLearn' }: ReportExporterProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(col => col.key));
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

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
    
    XLSX.writeFile(workbook, `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
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

    doc.save(`${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
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
      switch (exportFormat) {
        case 'csv':
          exportToCSV();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'pdf':
          exportToPDF();
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
          Export Report
        </CardTitle>
        <CardDescription>
          Customize and export your {reportType.toLowerCase()} data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {data.length} records • {selectedColumns.length} columns
          </p>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedColumns.length === 0}
            className="min-w-32"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background" />
            ) : (
              getFormatIcon()
            )}
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}