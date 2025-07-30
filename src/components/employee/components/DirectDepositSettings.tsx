import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Calendar
} from 'lucide-react';

const DirectDepositSettings: React.FC = () => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['direct-deposit-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_direct_deposits')
        .select('*')
        .eq('is_active', true)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const addAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const { data, error } = await supabase
        .from('employee_direct_deposits')
        .insert({
          ...accountData,
          effective_date: new Date().toISOString().split('T')[0]
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-deposit-accounts'] });
      setIsAddingAccount(false);
      toast({
        title: "Account Added",
        description: "Your direct deposit account has been added successfully.",
      });
    }
  });

  const validateRoutingNumber = (routing: string) => {
    if (routing.length !== 9) return false;
    // Basic routing number validation
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    const sum = routing.split('').reduce((acc, digit, index) => {
      return acc + (parseInt(digit) * weights[index]);
    }, 0);
    return sum % 10 === 0;
  };

  const AccountForm = ({ account = null, onCancel }: { account?: any; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      account_nickname: account?.account_nickname || '',
      bank_name: account?.bank_name || '',
      routing_number: account?.routing_number || '',
      account_number_encrypted: account?.account_number_encrypted || '',
      account_type: account?.account_type || 'checking',
      allocation_type: account?.allocation_type || 'percentage',
      allocation_value: account?.allocation_value || 100,
      is_primary: account?.is_primary || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateRoutingNumber(formData.routing_number)) {
        toast({
          title: "Invalid Routing Number",
          description: "Please enter a valid 9-digit routing number.",
          variant: "destructive"
        });
        return;
      }

      addAccountMutation.mutate(formData);
    };

    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>{account ? 'Edit Account' : 'Add New Account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nickname">Account Nickname</Label>
                <Input
                  id="nickname"
                  value={formData.account_nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_nickname: e.target.value }))}
                  placeholder="e.g., Main Checking"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank Name</Label>
                <Input
                  id="bank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="e.g., Chase Bank"
                />
              </div>
              <div>
                <Label htmlFor="routing">Routing Number</Label>
                <Input
                  id="routing"
                  value={formData.routing_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, routing_number: e.target.value }))}
                  placeholder="9-digit routing number"
                  maxLength={9}
                  required
                />
              </div>
              <div>
                <Label htmlFor="account">Account Number</Label>
                <Input
                  id="account"
                  type="password"
                  value={formData.account_number_encrypted}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number_encrypted: e.target.value }))}
                  placeholder="Account number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Account Type</Label>
                <Select value={formData.account_type} onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="allocation">Allocation Amount (%)</Label>
                <Input
                  id="allocation"
                  type="number"
                  value={formData.allocation_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, allocation_value: parseFloat(e.target.value) }))}
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={addAccountMutation.isPending}>
                {addAccountMutation.isPending ? 'Saving...' : 'Save Account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Direct Deposit Settings</h2>
          <p className="text-muted-foreground">Manage your bank accounts and payment allocations</p>
        </div>
        <Button 
          onClick={() => setIsAddingAccount(true)}
          className="hover-scale"
          disabled={isAddingAccount}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Add Account Form */}
      {isAddingAccount && (
        <AccountForm onCancel={() => setIsAddingAccount(false)} />
      )}

      {/* Existing Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts?.map((account) => (
          <Card key={account.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover-scale">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <CardTitle className="text-lg">{account.account_nickname}</CardTitle>
                  {account.is_primary && (
                    <Badge>Primary</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingAccount(account.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Bank</div>
                  <div className="font-medium">{account.bank_name || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Account Type</div>
                  <div className="font-medium capitalize">{account.account_type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Routing</div>
                  <div className="font-mono">****{account.routing_number?.slice(-4)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Account</div>
                  <div className="font-mono">****{account.account_number_encrypted?.slice(-4)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">Allocation</div>
                  <div className="font-bold text-lg">
                    {account.allocation_value}%
                  </div>
                </div>
                <Badge variant={account.verification_status === 'verified' ? 'default' : 'secondary'}>
                  {account.verification_status === 'verified' ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {account.verification_status}
                </Badge>
              </div>

              {account.effective_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Effective: {new Date(account.effective_date).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* HALO Notification */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>HALO Notice:</strong> Your changes will take effect on the next payroll run. 
          Account information is encrypted and secured with HALOshield protection.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DirectDepositSettings;
