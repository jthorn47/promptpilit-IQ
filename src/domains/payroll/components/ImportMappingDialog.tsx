import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileText, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ImportMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (mappings: Record<string, string>, file: File) => void;
  itemType: 'pay_types' | 'deductions';
}

const SYSTEM_FIELDS = {
  pay_types: [
    { value: 'code', label: 'Pay Code' },
    { value: 'name', label: 'Pay Type Name' },
    { value: 'description', label: 'Description' },
    { value: 'pay_category', label: 'Category' },
    { value: 'rate', label: 'Default Rate' },
    { value: 'calculation_method', label: 'Calculation Method' },
    { value: 'is_taxable', label: 'Taxable (Y/N)' },
    { value: 'is_overtime', label: 'Overtime (Y/N)' },
    { value: 'gl_account', label: 'GL Account' },
    { value: 'is_active', label: 'Active Status (Y/N)' }
  ],
  deductions: [
    { value: 'code', label: 'Deduction Code' },
    { value: 'name', label: 'Deduction Name' },
    { value: 'description', label: 'Description' },
    { value: 'deduction_type', label: 'Deduction Type' },
    { value: 'calculation_method', label: 'Calculation Method' },
    { value: 'employee_rate', label: 'Employee Rate' },
    { value: 'employer_rate', label: 'Employer Rate' },
    { value: 'annual_limit', label: 'Annual Limit' },
    { value: 'is_pretax', label: 'Pre-tax (Y/N)' },
    { value: 'gl_account', label: 'GL Account' },
    { value: 'is_active', label: 'Active Status (Y/N)' }
  ]
};

export const ImportMappingDialog: React.FC<ImportMappingDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  itemType
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileType, setFileType] = useState<'csv' | 'excel' | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV (.csv) or Excel (.xlsx, .xls) file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setFileType(isCSV ? 'csv' : 'excel');
    
    // Read file headers
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let headers: string[] = [];
        
        if (isCSV) {
          // Parse CSV
          const text = e.target?.result as string;
          const lines = text.split('\n');
          if (lines.length > 0) {
            headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          }
        } else {
          // Parse Excel
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
          
          if (jsonData.length > 0) {
            headers = jsonData[0].map(h => String(h || '').trim());
          }
        }
        
        setCsvHeaders(headers.filter(h => h.length > 0));
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({
          title: "File parsing error",
          description: "Unable to read the file. Please check the file format and try again.",
          variant: "destructive"
        });
      }
    };
    
    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleMappingChange = (systemField: string, csvColumn: string) => {
    setMappings(prev => ({
      ...prev,
      [systemField]: csvColumn === '__skip__' ? '' : csvColumn
    }));
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or Excel file to import",
        variant: "destructive"
      });
      return;
    }

    const requiredFields = itemType === 'pay_types' ? ['code', 'name'] : ['code', 'name'];
    const missingFields = requiredFields.filter(field => !mappings[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required mappings",
        description: `Please map the following required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onImport(mappings, selectedFile);
      toast({
        title: "Import successful",
        description: `Successfully imported ${itemType.replace('_', ' ')} from ${fileType?.toUpperCase()} file`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing the data. Please check your file and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const systemFields = SYSTEM_FIELDS[itemType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {itemType === 'pay_types' ? 'Pay Types' : 'Deductions'}</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file and map the columns to system fields. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                1. Select File (CSV or Excel)
              </CardTitle>
              <CardDescription>
                Supported formats: .csv, .xlsx, .xls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    {fileType === 'excel' ? (
                      <FileSpreadsheet className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>{selectedFile.name}</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded uppercase">
                      {fileType}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Field Mapping */}
          {csvHeaders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  2. Map Fields
                </CardTitle>
                <CardDescription>
                  Map your {fileType === 'excel' ? 'Excel' : 'CSV'} columns to system fields. Fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {systemFields.map((field) => {
                    const isRequired = ['code', 'name'].includes(field.value);
                    return (
                      <div key={field.value} className="grid grid-cols-2 gap-4 items-center">
                        <Label className="flex items-center gap-1">
                          {field.label}
                          {isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Select
                          value={mappings[field.value] || '__skip__'}
                          onValueChange={(value) => handleMappingChange(field.value, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${fileType === 'excel' ? 'Excel' : 'CSV'} column`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__skip__">-- Skip this field --</SelectItem>
                            {csvHeaders.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview/Validation */}
          {Object.keys(mappings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  3. Review Mappings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(mappings).map(([systemField, csvColumn]) => {
                    if (!csvColumn) return null;
                    const fieldInfo = systemFields.find(f => f.value === systemField);
                    return (
                      <div key={systemField} className="flex justify-between text-sm">
                        <span className="font-medium">{fieldInfo?.label}:</span>
                        <span className="text-muted-foreground">{csvColumn}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || csvHeaders.length === 0 || isProcessing}
            >
              {isProcessing ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};