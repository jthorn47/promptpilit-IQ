
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2, Upload } from 'lucide-react';
import { useChartOfAccounts, type ChartOfAccount } from '@/modules/HaaLO.Shared/hooks/useChartOfAccounts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


interface CreateAccountData {
  full_name: string;
  account_number: string;
  account_type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parent_account_id?: string;
  description?: string;
  is_active: boolean;
  initial_balance: number;
  current_balance: number;
  sort_order: number;
}

export const ChartOfAccounts: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateAccountData>({
    full_name: '',
    account_number: '',
    account_type: 'Asset',
    parent_account_id: '',
    description: '',
    is_active: true,
    initial_balance: 0,
    current_balance: 0,
    sort_order: 1,
  });

  // Get company ID from user profile
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) {
        console.log('❌ No user ID found for ChartOfAccounts');
        return;
      }
      
      console.log('🔍 Fetching company ID for ChartOfAccounts user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      console.log('📋 ChartOfAccounts profile fetch result:', { profile, error });
      
      if (profile?.company_id) {
        console.log('✅ ChartOfAccounts company ID found:', profile.company_id);
        setCompanyId(profile.company_id);
      } else {
        console.log('❌ No company ID found in profile for ChartOfAccounts');
      }
    };
    
    fetchCompanyId();
  }, [user?.id]);

  const { accounts, isLoading, createAccount, updateAccount, deleteAccount, isCreating, isUpdating, isDeleting } = useChartOfAccounts(companyId || '');

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account =>
    account.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Organize accounts by type
  const organizeAccountsByType = (accounts: ChartOfAccount[]) => {
    const organized: Record<string, ChartOfAccount[]> = {
      Asset: [],
      Liability: [],
      Equity: [],
      Revenue: [],
      Expense: [],
    };

    accounts.forEach(account => {
      if (organized[account.account_type]) {
        organized[account.account_type].push(account);
      }
    });

    // Sort accounts within each type by account number
    Object.keys(organized).forEach(type => {
      organized[type].sort((a, b) => a.account_number.localeCompare(b.account_number));
    });

    return organized;
  };

  const organizedAccounts = organizeAccountsByType(filteredAccounts);

  const resetForm = () => {
    setFormData({
      full_name: '',
      account_number: '',
      account_type: 'Asset',
      parent_account_id: '',
      description: '',
      is_active: true,
      initial_balance: 0,
      current_balance: 0,
      sort_order: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      toast({
        title: 'Error',
        description: 'Company ID not found. Please ensure you have a company profile.',
        variant: 'destructive'
      });
      return;
    }

    const accountData = {
      ...formData,
      company_id: companyId,
      parent_account_id: formData.parent_account_id || undefined,
    };

    if (editingAccount) {
      updateAccount({ ...accountData, id: editingAccount.id });
    } else {
      createAccount(accountData);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingAccount(null);
  };

  const handleEdit = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setFormData({
      full_name: account.full_name,
      account_number: account.account_number,
      account_type: account.account_type,
      parent_account_id: account.parent_account_id || '',
      description: account.description || '',
      is_active: account.is_active,
      initial_balance: account.initial_balance,
      current_balance: account.current_balance,
      sort_order: account.sort_order,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    deleteAccount(accountId);
    setDeleteAccountId(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Liability': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Equity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Revenue': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Expense': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Show loading while fetching company ID
  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your company's financial account structure
          </p>
        </div>
        <div className="flex gap-2">
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Accounts by Type */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']} className="space-y-4">
          {Object.entries(organizedAccounts).map(([type, typeAccounts]) => (
            <AccordionItem key={type} value={type} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge className={getTypeColor(type)}>{type}</Badge>
                  <span className="font-medium">{typeAccounts.length} accounts</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {typeAccounts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No accounts in this category</p>
                ) : (
                  <div className="space-y-2">
                    {typeAccounts.map((account) => (
                      <Card key={account.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{account.full_name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {account.account_number}
                                </Badge>
                                {!account.is_active && (
                                  <Badge variant="destructive" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              {account.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {account.description}
                                </p>
                              )}
                              <div className="flex gap-4 text-sm">
                                <span>
                                  <span className="font-medium">Initial:</span> ${account.initial_balance.toLocaleString()}
                                </span>
                                <span>
                                  <span className="font-medium">Current:</span> ${account.current_balance.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(account)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeleteAccountId(account.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingAccount(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter account name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="e.g., 1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type</Label>
              <Select 
                value={formData.account_type} 
                onValueChange={(value: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense') => 
                  setFormData({ ...formData, account_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_account">Parent Account (Optional)</Label>
              <Select 
                value={formData.parent_account_id} 
                onValueChange={(value) => setFormData({ ...formData, parent_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {accounts
                    .filter(account => 
                      account.account_type === formData.account_type && 
                      account.id !== editingAccount?.id
                    )
                    .map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_number} - {account.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_balance">Initial Balance</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                value={formData.initial_balance}
                onChange={(e) => setFormData({ ...formData, initial_balance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingAccount(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAccount ? 'Update' : 'Create'} Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountId && handleDelete(deleteAccountId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
