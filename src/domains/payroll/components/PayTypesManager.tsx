import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { PayType } from '../types';
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
import { PayTypeForm } from './PayTypeForm';
import { usePayTypes, useCreatePayType, useUpdatePayType } from '../hooks/usePayTypes';
import { toast } from 'sonner';

interface PayTypesManagerProps {
  companyId: string;
}

export const PayTypesManager: React.FC<PayTypesManagerProps> = ({ companyId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayType, setEditingPayType] = useState<PayType | null>(null);

  const { data: payTypes = [], isLoading, error } = usePayTypes(companyId);
  const createPayType = useCreatePayType();
  const updatePayType = useUpdatePayType();

  const filteredPayTypes = payTypes.filter(payType => 
    payType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payType.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePayType = () => {
    setEditingPayType(null);
    setIsDialogOpen(true);
  };

  const handleEditPayType = (payType: PayType) => {
    setEditingPayType(payType);
    setIsDialogOpen(true);
  };

  const handleClonePayType = async (payType: PayType) => {
    try {
      const clonedPayType = {
        ...payType,
        name: `${payType.name} (Copy)`,
        code: `${payType.code}_COPY`,
        company_id: companyId,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
      delete clonedPayType.id;
      delete clonedPayType.created_at;
      delete clonedPayType.updated_at;
      
      await createPayType.mutateAsync(clonedPayType);
      toast.success('Pay type cloned successfully');
    } catch (error) {
      toast.error('Failed to clone pay type');
    }
  };

  const handleSavePayType = async (payTypeData: Partial<PayType>) => {
    try {
      if (editingPayType) {
        await updatePayType.mutateAsync({
          id: editingPayType.id,
          updates: payTypeData
        });
        toast.success('Pay type updated successfully');
      } else {
        await createPayType.mutateAsync({
          ...payTypeData,
          company_id: companyId,
        });
        toast.success('Pay type created successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save pay type');
    }
  };

  const handleDeletePayType = async (payTypeId: string) => {
    if (confirm('Are you sure you want to delete this pay type?')) {
      try {
        await updatePayType.mutateAsync({
          id: payTypeId,
          updates: { is_active: false }
        });
        toast.success('Pay type deactivated successfully');
      } catch (error) {
        toast.error('Failed to delete pay type');
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading pay types...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error loading pay types: {error.message}</div>;
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Earnings
                <Badge variant="secondary">{payTypes.length}</Badge>
              </CardTitle>
              <CardDescription>
                Manage earnings definitions including regular pay, overtime, bonuses, and commissions
              </CardDescription>
            </div>
            <Button onClick={handleCreatePayType}>
              <Plus className="mr-2 h-4 w-4" />
              Add Earnings Type
            </Button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search earnings types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableCaption>
              {filteredPayTypes.length} earnings type{filteredPayTypes.length !== 1 ? 's' : ''} found
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayTypes.map((payType) => (
                <TableRow key={payType.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{payType.name}</div>
                      {payType.description && (
                        <div className="text-xs text-muted-foreground">
                          {payType.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {payType.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {payType.pay_category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {'rate' in payType && typeof payType.rate === 'number' && payType.rate > 0 ? `$${payType.rate.toFixed(2)}` : 'Variable'}
                      {'default_rate_multiplier' in payType && typeof payType.default_rate_multiplier === 'number' && payType.default_rate_multiplier !== 1 && (
                        <div className="text-xs text-muted-foreground">
                          {payType.default_rate_multiplier}x multiplier
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payType.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm">
                        {payType.is_active ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEditPayType(payType)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClonePayType(payType)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Clone
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePayType(payType.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPayTypes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? 'No earnings types match your search criteria' 
                : 'No earnings types found. Create your first earnings type to get started.'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPayType ? 'Edit Earnings Type' : 'Create Earnings Type'}
            </DialogTitle>
            <DialogDescription>
              Configure earnings type settings and tax treatment options.
            </DialogDescription>
          </DialogHeader>
          
          <PayTypeForm
            payType={editingPayType}
            onSubmit={handleSavePayType}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
