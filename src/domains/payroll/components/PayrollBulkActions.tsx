import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Archive, 
  Download, 
  Upload, 
  Edit3, 
  Copy, 
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ImportMappingDialog } from './ImportMappingDialog';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface PayrollBulkActionsProps {
  selectedCount: number;
  selectedItems: Set<string>;
  onClearSelection: () => void;
  itemType?: 'pay_types' | 'deductions';
  onImport?: (mappings: Record<string, string>, file: File) => void;
  onExport?: () => void;
}

export const PayrollBulkActions: React.FC<PayrollBulkActionsProps> = ({
  selectedCount,
  selectedItems,
  onClearSelection,
  itemType = 'pay_types',
  onImport,
  onExport
}) => {
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();

  const handleBulkActivate = () => {
    console.log('Bulk activating items:', Array.from(selectedItems));
    toast({
      title: "Items Activated",
      description: `Successfully activated ${selectedCount} items`,
    });
  };

  const handleBulkDeactivate = () => {
    console.log('Bulk deactivating items:', Array.from(selectedItems));
    toast({
      title: "Items Deactivated", 
      description: `Successfully deactivated ${selectedCount} items`,
    });
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCount} items? This action cannot be undone.`)) {
      console.log('Bulk deleting items:', Array.from(selectedItems));
      toast({
        title: "Items Deleted",
        description: `Successfully deleted ${selectedCount} items`,
      });
    }
  };

  const handleBulkExport = (format: string) => {
    console.log('Exporting items in format:', format, Array.from(selectedItems));
    if (onExport) {
      onExport();
    }
    toast({
      title: "Export Started",
      description: `Exporting ${selectedCount} items in ${format.toUpperCase()} format`,
    });
    setExportOpen(false);
  };

  const handleBulkClone = () => {
    console.log('Bulk cloning items:', Array.from(selectedItems));
    toast({
      title: "Items Cloned",
      description: `Successfully cloned ${selectedCount} items`,
    });
  };

  const handleImport = (mappings: Record<string, string>, file: File) => {
    if (onImport) {
      onImport(mappings, file);
    }
    setImportOpen(false);
  };

  const exportToCsv = () => {
    // Generate sample CSV template
    const headers = itemType === 'pay_types' 
      ? ['Code', 'Name', 'Description', 'Category', 'Rate', 'Calculation Method', 'Taxable', 'Overtime', 'GL Account', 'Active']
      : ['Code', 'Name', 'Description', 'Type', 'Calculation Method', 'Employee Rate', 'Employer Rate', 'Annual Limit', 'Pre-tax', 'GL Account', 'Active'];
    
    const sampleData = itemType === 'pay_types' 
      ? ['REG', 'Regular Pay', 'Standard hourly pay', 'Regular', '0', 'Hourly', 'Y', 'N', '1000', 'Y']
      : ['HEALTH', 'Health Insurance', 'Employee health insurance', 'Medical', 'Flat', '50', '100', '2000', 'Y', '2000', 'Y'];
    
    const csvContent = headers.join(',') + '\n' + sampleData.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemType}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Template Downloaded",
      description: `CSV template downloaded for ${itemType.replace('_', ' ')}`,
    });
  };

  const exportToExcel = () => {
    // Generate Excel template
    const headers = itemType === 'pay_types' 
      ? ['Code', 'Name', 'Description', 'Category', 'Rate', 'Calculation Method', 'Taxable', 'Overtime', 'GL Account', 'Active']
      : ['Code', 'Name', 'Description', 'Type', 'Calculation Method', 'Employee Rate', 'Employer Rate', 'Annual Limit', 'Pre-tax', 'GL Account', 'Active'];
    
    const sampleData = itemType === 'pay_types' 
      ? ['REG', 'Regular Pay', 'Standard hourly pay', 'Regular', 0, 'Hourly', 'Y', 'N', '1000', 'Y']
      : ['HEALTH', 'Health Insurance', 'Employee health insurance', 'Medical', 'Flat', 50, 100, 2000, 'Y', '2000', 'Y'];
    
    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, itemType === 'pay_types' ? 'Pay Types' : 'Deductions');
    
    // Save file
    XLSX.writeFile(wb, `${itemType}_template.xlsx`);
    
    toast({
      title: "Excel Template Downloaded",
      description: `Excel template downloaded for ${itemType.replace('_', ' ')}`,
    });
  };

  const BulkEditDialog = () => (
    <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Edit {selectedCount} Items</DialogTitle>
          <DialogDescription>
            Make changes to multiple payroll items at once. Only the fields you modify will be updated.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>GL Account</Label>
            <Input placeholder="Set GL account for all selected items..." />
          </div>
          
          <div className="space-y-2">
            <Label>Cost Center</Label>
            <Input placeholder="Set cost center for all selected items..." />
          </div>
          
          <div className="space-y-2">
            <Label>Tax Treatment</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select tax treatment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="taxable">Taxable</SelectItem>
                <SelectItem value="pre_tax">Pre-Tax</SelectItem>
                <SelectItem value="post_tax">Post-Tax</SelectItem>
                <SelectItem value="tax_exempt">Tax Exempt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Applying bulk edits');
              toast({
                title: "Bulk Edit Applied",
                description: `Successfully updated ${selectedCount} items`,
              });
              setBulkEditOpen(false);
            }}>
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ExportDialog = () => (
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export {selectedCount} Items</DialogTitle>
          <DialogDescription>
            Choose the format and options for exporting the selected payroll items.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select defaultValue="csv">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Include Fields</Label>
            <div className="text-sm text-muted-foreground">
              ✓ Basic Information (Name, Code, Category)
              <br />
              ✓ Tax Settings
              <br />
              ✓ GL Mapping
              <br />
              ✓ Status & Dates
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleBulkExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="bg-primary/10 border-b border-primary/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                {selectedCount} selected
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearSelection}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              {/* Import/Export Actions */}
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import File
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setExportOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCsv}>
                    <FileText className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download Excel Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Quick Actions */}
              <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setBulkEditOpen(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Bulk Edit
              </Button>
              
              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    More Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleBulkClone}>
                    <Copy className="mr-2 h-4 w-4" />
                    Clone Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "GL Codes Assigned",
                      description: `GL codes assigned to ${selectedCount} items`,
                    });
                  }}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Assign GL Codes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Tax Treatment Updated",
                      description: `Tax treatment updated for ${selectedCount} items`,
                    });
                  }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Update Tax Treatment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Items Archived",
                      description: `Successfully archived ${selectedCount} items`,
                    });
                  }}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Tip: Hold Shift to select ranges
          </div>
        </div>
      </div>
      
      <BulkEditDialog />
      <ExportDialog />
      <ImportMappingDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        itemType={itemType}
      />
    </>
  );
};