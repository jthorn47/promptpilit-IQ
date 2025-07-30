import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator,
  Upload,
  Plus,
  Search,
  FileText,
  TrendingUp,
  DollarSign,
  Building2,
  BookOpen
} from 'lucide-react';
import { GeneralLedger } from '@/modules/HaaLO.HaloIQ/components/FinanceIQ/GeneralLedger';
import { useChartOfAccounts, ChartOfAccount } from '../hooks/useChartOfAccounts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinanceIQProps {
  companyId: string;
}

const FinanceIQ: React.FC<FinanceIQProps> = ({ companyId }) => {
  const { toast } = useToast();
  const { accounts, isLoading, createAccount, isCreating } = useChartOfAccounts(companyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [newAccount, setNewAccount] = useState({
    account_number: '',
    full_name: '',
    account_type: 'Asset' as const,
    detail_type: '',
    description: '',
    initial_balance: 0,
  });

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_number.includes(searchTerm);
    const matchesType = selectedType === 'all' || account.account_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddAccount = () => {
    createAccount({
      ...newAccount,
      company_id: companyId,
      current_balance: newAccount.initial_balance,
      is_active: true,
      sort_order: 0,
    });
    setShowAddForm(false);
    setNewAccount({
      account_number: '',
      full_name: '',
      account_type: 'Asset',
      detail_type: '',
      description: '',
      initial_balance: 0,
    });
  };

  const handleFileUpload = async () => {
    if (!jsonFile) return;

    setIsSeeding(true);
    try {
      const fileContent = await jsonFile.text();
      const accountsData = JSON.parse(fileContent);

      const { data, error } = await supabase.functions.invoke('seed-chart-of-accounts', {
        body: {
          accounts: accountsData,
          company_id: companyId,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Successfully imported ${data.accounts_created} accounts`,
      });
      
      setJsonFile(null);
    } catch (error) {
      console.error('Error seeding accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import accounts from JSON',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const accountTypeSummary = accounts.reduce((acc, account) => {
    acc[account.account_type] = (acc[account.account_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Calculator className="h-6 w-6 text-primary" />
          Finance IQ
        </h3>
        <p className="text-muted-foreground">
          Comprehensive financial management and accounting tools
        </p>
      </div>

      {/* Finance IQ Tabs */}
      <Tabs defaultValue="chart-of-accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart-of-accounts" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger value="general-ledger" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            General Ledger
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart-of-accounts" className="space-y-6 mt-6">
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-2">Chart of Accounts</h4>
            <p className="text-muted-foreground">
              Manage your company's chart of accounts and financial structure
            </p>
          </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Assets</p>
                <p className="text-2xl font-bold">{accountTypeSummary.Asset || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold">{accountTypeSummary.Revenue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Asset">Assets</SelectItem>
              <SelectItem value="Liability">Liabilities</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {/* JSON Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import from JSON
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <Button 
              onClick={handleFileUpload}
              disabled={!jsonFile || isSeeding}
              variant="outline"
            >
              {isSeeding ? 'Importing...' : 'Import JSON'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a JSON file containing account data to bulk import your chart of accounts.
          </p>
        </CardContent>
      </Card>

      {/* Add Account Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={newAccount.account_number}
                  onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                  placeholder="1001.00"
                />
              </div>
              <div>
                <Label htmlFor="account_type">Account Type</Label>
                <Select
                  value={newAccount.account_type}
                  onValueChange={(value: any) => setNewAccount({ ...newAccount, account_type: value })}
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
              <div className="md:col-span-2">
                <Label htmlFor="full_name">Account Name</Label>
                <Input
                  id="full_name"
                  value={newAccount.full_name}
                  onChange={(e) => setNewAccount({ ...newAccount, full_name: e.target.value })}
                  placeholder="Cash and Cash Equivalents"
                />
              </div>
              <div>
                <Label htmlFor="detail_type">Detail Type</Label>
                <Input
                  id="detail_type"
                  value={newAccount.detail_type}
                  onChange={(e) => setNewAccount({ ...newAccount, detail_type: e.target.value })}
                  placeholder="Checking Account"
                />
              </div>
              <div>
                <Label htmlFor="initial_balance">Initial Balance</Label>
                <Input
                  id="initial_balance"
                  type="number"
                  step="0.01"
                  value={newAccount.initial_balance}
                  onChange={(e) => setNewAccount({ ...newAccount, initial_balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAccount}
                disabled={isCreating || !newAccount.account_number || !newAccount.full_name}
              >
                {isCreating ? 'Creating...' : 'Add Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No accounts found. Add your first account or import from JSON.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  style={{ paddingLeft: `${(account.level || 0) * 20 + 16}px` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {account.account_number}
                      </span>
                      <span className="font-medium">{account.full_name}</span>
                      <Badge variant="outline">{account.account_type}</Badge>
                    </div>
                    {account.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {account.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${account.current_balance.toLocaleString()}
                    </div>
                    {account.detail_type && (
                      <div className="text-sm text-muted-foreground">
                        {account.detail_type}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="general-ledger" className="mt-6">
          <GeneralLedger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceIQ;