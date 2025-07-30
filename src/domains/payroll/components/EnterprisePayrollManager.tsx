import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Plus, 
  Settings, 
  Download, 
  Upload,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Archive,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayrollFilterPanel } from './PayrollFilterPanel';
import { PayrollItemDrawer } from './PayrollItemDrawer';
import { PayrollBulkActions } from './PayrollBulkActions';
import { ImportMappingDialog } from './ImportMappingDialog';
import { usePayTypes } from '../hooks/usePayTypes';
import { useDeductions } from '../hooks/useDeductions';
import { PayType } from '../types';
import { DeductionDefinition } from '../hooks/useDeductions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface EnterprisePayrollManagerProps {
  companyId: string;
}

type SortField = 'name' | 'code' | 'category' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';
type ItemType = 'earnings' | 'deductions';

interface FilterState {
  search: string;
  type: ItemType | 'all';
  category: string;
  taxTreatment: string;
  status: 'all' | 'active' | 'inactive';
  glAccount: string;
}

export const EnterprisePayrollManager: React.FC<EnterprisePayrollManagerProps> = ({ companyId }) => {
  // State management
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(PayType | DeductionDefinition) | null>(null);
  const [editingType, setEditingType] = useState<ItemType>('earnings');
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    taxTreatment: 'all',
    status: 'active',
    glAccount: 'all'
  });

  // Data fetching
  console.log('🔍 EnterprisePayrollManager - companyId:', companyId);
  const { data: payTypes = [], isLoading: payTypesLoading } = usePayTypes(companyId);
  const { data: deductions = [], isLoading: deductionsLoading } = useDeductions(companyId);
  console.log('🔍 EnterprisePayrollManager - payTypes:', payTypes, 'deductions:', deductions);

  // Combined and filtered data
  const combinedData = useMemo(() => {
    const earnings = payTypes.map(pt => ({ ...pt, itemType: 'earnings' as const }));
    const deductionItems = deductions.map(d => ({ ...d, itemType: 'deductions' as const }));
    
    return [...earnings, ...deductionItems].filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(searchLower) ||
          item.code.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all' && item.itemType !== filters.type) return false;

      // Status filter
      if (filters.status !== 'all') {
        const isActive = item.is_active ?? true;
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      // Category filter (earnings have pay_category, deductions have deduction_type)
      if (filters.category !== 'all') {
        const category = 'pay_category' in item ? item.pay_category : 
                        'deduction_type' in item ? item.deduction_type : '';
        if (category !== filters.category) return false;
      }

      return true;
    });
  }, [payTypes, deductions, filters]);

  // Sorted data
  const sortedData = useMemo(() => {
    return [...combinedData].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different field types
      if (sortField === 'status') {
        aValue = a.is_active ? 'active' : 'inactive';
        bValue = b.is_active ? 'active' : 'inactive';
      } else if (sortField === 'category') {
        aValue = 'pay_category' in a ? a.pay_category : 
                'deduction_type' in a ? a.deduction_type : '';
        bValue = 'pay_category' in b ? b.pay_category : 
                'deduction_type' in b ? b.deduction_type : '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? 
        (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) :
        (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
    });
  }, [combinedData, sortField, sortDirection]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Event handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleEditItem = (item: PayType | DeductionDefinition, type: ItemType) => {
    setEditingItem(item);
    setEditingType(type);
    setDrawerOpen(true);
  };

  const handleCreateNew = (type: ItemType) => {
    setEditingItem(null);
    setEditingType(type);
    setDrawerOpen(true);
  };

  const handleImport = async (mappings: Record<string, string>, file: File) => {
    try {
      console.log('Starting import process with mappings:', mappings);
      
      // Parse the file
      let jsonData: any[] = [];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        jsonData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      // Map and validate data
      const mappedData = jsonData.map(row => {
        const mappedRow: any = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Only add company_id if it's a valid UUID (not 'global')
        if (companyId && companyId !== 'global') {
          mappedRow.company_id = companyId;
        }

        // Map fields based on user mappings
        Object.entries(mappings).forEach(([systemField, csvColumn]) => {
          if (csvColumn && csvColumn !== '__skip__' && row[csvColumn] !== undefined) {
            let value = row[csvColumn];
            
            // Convert boolean fields
            if (['is_active', 'is_taxable', 'is_overtime', 'is_pretax'].includes(systemField)) {
              value = ['y', 'yes', 'true', '1', 'active'].includes(String(value).toLowerCase());
            }
            
            // Convert numeric fields
            if (['rate', 'employee_rate', 'employer_rate', 'annual_limit'].includes(systemField)) {
              value = value ? parseFloat(String(value)) : null;
            }
            
            mappedRow[systemField] = value;
          }
        });

        return mappedRow;
      }).filter(row => row.code && row.name); // Only include rows with required fields

      if (mappedData.length === 0) {
        throw new Error('No valid data found to import');
      }

      // Insert data into appropriate table
      const tableName = filters.type === 'earnings' || filters.type === 'all' ? 'pay_types' : 'deduction_definitions';
      
      const { error } = await supabase
        .from(tableName)
        .insert(mappedData);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      toast({
        title: "Import completed",
        description: `Successfully imported ${mappedData.length} ${tableName.replace('_', ' ')} records.`,
      });
      
      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "There was an error importing your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    console.log('Export selected items:', Array.from(selectedItems));
    // Here you would implement the export logic
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
      )}
    </button>
  );

  const isLoading = payTypesLoading || deductionsLoading;

  return (
    <div className="flex h-screen bg-background">
      {/* Left Filter Panel */}
      <PayrollFilterPanel 
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={sortedData.length}
        earningsCount={payTypes.length}
        deductionsCount={deductions.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Action Bar */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold">Payroll Configuration</h1>
              <p className="text-sm text-muted-foreground">
                Manage earnings types and deductions for enterprise payroll processing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleCreateNew('earnings')}>
                    Create Earnings Type
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateNew('deductions')}>
                    Create Deduction
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or code..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, type: value as ItemType | 'all' }))
            }>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="earnings">Earnings</SelectItem>
                <SelectItem value="deductions">Deductions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value as FilterState['status'] }))
            }>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <PayrollBulkActions 
            selectedCount={selectedItems.size}
            selectedItems={selectedItems}
            onClearSelection={() => setSelectedItems(new Set())}
            itemType={filters.type === 'all' ? 'pay_types' : (filters.type === 'earnings' ? 'pay_types' : 'deductions')}
            onImport={handleImport}
            onExport={handleExport}
          />
        )}

        {/* Data Grid */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <SortButton field="name">Name</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="code">Code</SortButton>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <SortButton field="category">Category</SortButton>
                </TableHead>
                <TableHead>Tax Treatment</TableHead>
                <TableHead>GL Account</TableHead>
                <TableHead>
                  <SortButton field="status">Status</SortButton>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    Loading payroll items...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No items found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {('description' in item && item.description) && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {item.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.itemType === 'earnings' ? 'Earnings' : 'Deduction'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {'pay_category' in item ? String(item.pay_category || '') : 
                         'deduction_type' in item ? String(item.deduction_type || '').replace('_', ' ') : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {'tax_type' in item ? String(item.tax_type || '') : 
                         'deduction_type' in item ? String(item.deduction_type || '').replace('_', '-') : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {'gl_account' in item ? String(item.gl_account || 'Not set') : 'Not set'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.is_active ? 'bg-success' : 'bg-muted-foreground'
                        }`} />
                        <span className="text-sm">
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(item, item.itemType)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            {item.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} items
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm px-3 py-1">
                  {currentPage} of {totalPages}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <PayrollItemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={editingItem}
        itemType={editingType}
        companyId={companyId}
      />

      {/* Import Dialog */}
      <ImportMappingDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        itemType={filters.type === 'earnings' || filters.type === 'all' ? 'pay_types' : 'deductions'}
      />
    </div>
  );
};