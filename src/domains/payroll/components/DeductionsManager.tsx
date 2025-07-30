import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  Filter,
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useDeductions, useCreateDeduction, useUpdateDeduction, useDeleteDeduction, DeductionDefinition } from '../hooks/useDeductions';
import { DeductionForm } from './DeductionForm';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeductionsManagerProps {
  companyId: string;
}

export const DeductionsManager: React.FC<DeductionsManagerProps> = ({ companyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<DeductionDefinition | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const { data: deductions = [], isLoading, error } = useDeductions(companyId);
  const createDeduction = useCreateDeduction();
  const updateDeduction = useUpdateDeduction();
  const deleteDeduction = useDeleteDeduction();

  const filteredDeductions = deductions.filter(deduction => {
    const matchesSearch = deduction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deduction.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || deduction.deduction_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleCreateDeduction = () => {
    setEditingDeduction(null);
    setIsDialogOpen(true);
  };

  const handleEditDeduction = (deduction: DeductionDefinition) => {
    setEditingDeduction(deduction);
    setIsDialogOpen(true);
  };

  const handleCloneDeduction = async (deduction: DeductionDefinition) => {
    try {
      const clonedDeduction = {
        ...deduction,
        name: `${deduction.name} (Copy)`,
        code: `${deduction.code}_COPY`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
      delete clonedDeduction.id;
      delete clonedDeduction.created_at;
      delete clonedDeduction.updated_at;
      
      await createDeduction.mutateAsync(clonedDeduction);
      toast.success('Deduction cloned successfully');
    } catch (error) {
      toast.error('Failed to clone deduction');
    }
  };

  const handleSaveDeduction = async (deductionData: Partial<DeductionDefinition>) => {
    try {
      if (editingDeduction) {
        await updateDeduction.mutateAsync({
          id: editingDeduction.id,
          updates: deductionData
        });
        toast.success('Deduction updated successfully');
      } else {
        await createDeduction.mutateAsync({
          ...deductionData,
          company_id: companyId,
        } as any);
        toast.success('Deduction created successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save deduction');
    }
  };

  const handleDeleteDeduction = async (id: string) => {
    if (confirm('Are you sure you want to delete this deduction?')) {
      try {
        await deleteDeduction.mutateAsync(id);
        toast.success('Deduction deleted successfully');
      } catch (error) {
        toast.error('Failed to delete deduction');
      }
    }
  };

  const getDeductionTypeColor = (type: string) => {
    switch (type) {
      case 'pre_tax': return 'bg-blue-100 text-blue-800';
      case 'post_tax': return 'bg-green-100 text-green-800';
      case 'garnishment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeductionTypeTooltip = (type: string) => {
    switch (type) {
      case 'pre_tax': return 'Deducted before calculating income taxes';
      case 'post_tax': return 'Deducted after calculating income taxes';
      case 'garnishment': return 'Court-ordered or legal deductions';
      default: return '';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading deductions...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error loading deductions: {error.message}</div>;
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Deductions
                <Badge variant="secondary">{deductions.length}</Badge>
              </CardTitle>
              <CardDescription>
                Manage deduction definitions including pre-tax benefits, post-tax deductions, and garnishments
              </CardDescription>
            </div>
            <Button onClick={handleCreateDeduction}>
              <Plus className="mr-2 h-4 w-4" />
              Add Deduction
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search deductions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="pre_tax">Pre-Tax</option>
              <option value="post_tax">Post-Tax</option>
              <option value="garnishment">Garnishments</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableCaption>
              {filteredDeductions.length} deduction{filteredDeductions.length !== 1 ? 's' : ''} found
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{deduction.name}</div>
                      {deduction.w2_reporting_code && (
                        <div className="text-xs text-muted-foreground">
                          W-2: {deduction.w2_reporting_code}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {deduction.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className={getDeductionTypeColor(deduction.deduction_type)}>
                          {deduction.deduction_type.replace('_', '-')}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getDeductionTypeTooltip(deduction.deduction_type)}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {deduction.calculation_method === 'flat_amount' && 'Fixed Amount'}
                      {deduction.calculation_method === 'percentage' && 'Percentage'}
                      {deduction.calculation_method === 'custom_formula' && 'Custom Formula'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {deduction.calculation_method === 'flat_amount' && 
                        `$${deduction.default_amount?.toFixed(2) || '0.00'}`}
                      {deduction.calculation_method === 'percentage' && 
                        `${deduction.percentage_rate?.toFixed(2) || '0.00'}%`}
                      {deduction.calculation_method === 'custom_formula' && 
                        'Formula'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {deduction.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm">
                        {deduction.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditDeduction(deduction)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCloneDeduction(deduction)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Clone
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteDeduction(deduction.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDeductions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'No deductions match your search criteria' 
                : 'No deductions found. Create your first deduction to get started.'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDeduction ? 'Edit Deduction' : 'Create Deduction'}
            </DialogTitle>
            <DialogDescription>
              Configure deduction settings including tax treatment, calculation methods, and limits.
            </DialogDescription>
          </DialogHeader>
          
          <DeductionForm
            deduction={editingDeduction}
            onSubmit={handleSaveDeduction}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};