import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Link, Trash2, Save, RefreshCw, Zap } from 'lucide-react';
import { useChartOfAccounts } from '@/modules/HaaLO.Shared/hooks/useChartOfAccounts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccountMappingProps {
  companyId: string;
}

interface GLAccountMapping {
  id: string;
  gl_account_name: string;
  gl_field_type: 'account_name' | 'split_account' | 'name';
  chart_account_id: string;
  chart_account_name?: string;
  chart_account_number?: string;
}

interface UnmatchedGLEntry {
  account_name: string;
  split_account: string;
  name: string;
  entry_count: number;
  total_amount: number;
}

export const AccountMapping: React.FC<AccountMappingProps> = ({ companyId }) => {
  const [mappings, setMappings] = useState<GLAccountMapping[]>([]);
  const [unmatchedEntries, setUnmatchedEntries] = useState<UnmatchedGLEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const { accounts } = useChartOfAccounts(companyId);
  const { toast } = useToast();

  // Load existing mappings and unmatched entries
  useEffect(() => {
    if (companyId) {
      loadMappings();
      loadUnmatchedEntries();
    }
  }, [companyId]);

  const loadMappings = async () => {
    setIsLoading(true);
    try {
      // First get the mappings
      const { data: mappingsData, error: mappingsError } = await supabase
        .from('gl_account_mappings')
        .select('id, gl_account_name, gl_field_type, chart_account_id')
        .eq('company_id', companyId);

      if (mappingsError) throw mappingsError;

      // Then get chart of accounts for the referenced IDs
      const chartAccountIds = mappingsData.map(m => m.chart_account_id);
      const { data: accountsData, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('id, full_name, account_number')
        .in('id', chartAccountIds);

      if (accountsError) throw accountsError;

      // Combine the data
      const mappingsWithNames = mappingsData.map(mapping => {
        const chartAccount = accountsData.find(acc => acc.id === mapping.chart_account_id);
        return {
          ...mapping,
          gl_field_type: mapping.gl_field_type as 'account_name' | 'split_account' | 'name',
          chart_account_name: chartAccount?.full_name || '',
          chart_account_number: chartAccount?.account_number || ''
        };
      });

      setMappings(mappingsWithNames);
    } catch (error) {
      console.error('Error loading mappings:', error);
      toast({
        title: "Error",
        description: "Failed to load account mappings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnmatchedEntries = async () => {
    try {
      // Get distinct GL account names that don't have mappings
      const { data, error } = await supabase.rpc('get_unmatched_gl_entries', {
        p_company_id: companyId
      });

      if (error) throw error;
      setUnmatchedEntries(data || []);
    } catch (error) {
      console.error('Error loading unmatched entries:', error);
    }
  };

  const createMapping = async (
    glAccountName: string, 
    glFieldType: 'account_name' | 'split_account' | 'name',
    chartAccountId: string
  ) => {
    try {
      const { error } = await supabase
        .from('gl_account_mappings')
        .insert({
          company_id: companyId,
          gl_account_name: glAccountName,
          gl_field_type: glFieldType,
          chart_account_id: chartAccountId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account mapping created successfully",
      });

      await loadMappings();
      await loadUnmatchedEntries();
    } catch (error) {
      console.error('Error creating mapping:', error);
      toast({
        title: "Error",
        description: "Failed to create account mapping",
        variant: "destructive",
      });
    }
  };

  const autoMapObviousMatches = async () => {
    setIsAutoMapping(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const mappingsToCreate = [];

      // Filter out split entries and find obvious matches
      const regularEntries = unmatchedEntries.filter(entry => 
        entry.account_name !== '-Split-' && 
        entry.split_account !== '-Split-' && 
        entry.name !== '-Split-'
      );

      for (const entry of regularEntries) {
        // Check if mapping already exists for this GL account name
        const existingMapping = mappings.find(m => 
          m.gl_account_name === entry.account_name && m.gl_field_type === 'account_name'
        );

        if (!existingMapping) {
          // Try to find exact matches for account_name
          const exactMatch = accounts.find(account => 
            account.full_name === entry.account_name ||
            account.account_number === entry.account_name ||
            (account.account_number && entry.account_name.startsWith(account.account_number + ' '))
          );

          if (exactMatch) {
            mappingsToCreate.push({
              company_id: companyId,
              gl_account_name: entry.account_name,
              gl_field_type: 'account_name',
              chart_account_id: exactMatch.id,
              created_by: user.user?.id
            });
          }
        }
      }

      if (mappingsToCreate.length > 0) {
        const { error } = await supabase
          .from('gl_account_mappings')
          .upsert(mappingsToCreate, {
            onConflict: 'company_id,gl_account_name,gl_field_type',
            ignoreDuplicates: true
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: `Created ${mappingsToCreate.length} automatic mappings`,
        });

        await loadMappings();
        await loadUnmatchedEntries();
      } else {
        toast({
          title: "No New Matches",
          description: "No new automatic matches were found",
        });
      }
    } catch (error) {
      console.error('Error auto-mapping:', error);
      toast({
        title: "Error",
        description: "Failed to create automatic mappings",
        variant: "destructive",
      });
    } finally {
      setIsAutoMapping(false);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('gl_account_mappings')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account mapping deleted successfully",
      });

      await loadMappings();
      await loadUnmatchedEntries();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast({
        title: "Error",
        description: "Failed to delete account mapping",
        variant: "destructive",
      });
    }
  };

  const calculateBalancesWithMappings = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.rpc('calculate_account_balances_with_mappings', {
        p_company_id: companyId
      });

      if (error) throw error;

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const accountsUpdated = result.accounts_updated || 0;
        const entriesProcessed = result.total_entries || 0;
        const mappedEntries = result.mapped_entries || 0;

        toast({
          title: "Balance Calculation Complete",
          description: `Updated ${accountsUpdated} accounts from ${entriesProcessed} entries (${mappedEntries} using manual mappings). Please refresh to see updated amounts.`,
        });

        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error('Error calculating balances:', error);
      toast({
        title: "Error",
        description: "Failed to calculate account balances",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Filter out split entries and apply search
  const regularEntries = unmatchedEntries.filter(entry => 
    entry.account_name !== '-Split-' && 
    entry.split_account !== '-Split-' && 
    entry.name !== '-Split-'
  );

  const splitEntries = unmatchedEntries.filter(entry => 
    entry.account_name === '-Split-' || 
    entry.split_account === '-Split-' || 
    entry.name === '-Split-'
  );

  const filteredEntries = regularEntries.filter(entry =>
    entry.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.split_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Link className="h-8 w-8" />
            Account Mapping
          </h1>
          <p className="text-muted-foreground">
            Manually map general ledger entries to chart of accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={autoMapObviousMatches}
            disabled={isAutoMapping || regularEntries.length === 0}
            variant="outline"
          >
            {isAutoMapping ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Auto-Map Matches
          </Button>
          <Button 
            onClick={calculateBalancesWithMappings}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isCalculating ? 'Calculating...' : 'Calculate with Mappings'}
          </Button>
        </div>
      </div>

      {/* Split entries warning */}
      {splitEntries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800">Split Entries Detected</h3>
          <p className="text-sm text-blue-700 mt-1">
            Found {splitEntries.length} split entries (marked as "-Split-"). These are transaction 
            split lines and don't need account mapping - they can be safely ignored.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Existing Mappings */}
        <Card>
          <CardHeader>
            <CardTitle>Current Mappings ({mappings.length})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Active manual account mappings
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {mapping.gl_account_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-1">
                        {mapping.gl_field_type}
                      </Badge>
                      → {mapping.chart_account_number} {mapping.chart_account_name}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMapping(mapping.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {mappings.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No mappings created yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unmatched Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Entries Needing Mapping ({filteredEntries.length})</CardTitle>
            <p className="text-sm text-muted-foreground">
              GL entries that need to be mapped to chart of accounts
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={loadUnmatchedEntries}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEntries.map((entry, index) => (
                <UnmatchedEntryCard
                  key={index}
                  entry={entry}
                  accounts={accounts}
                  onCreateMapping={createMapping}
                />
              ))}
              {filteredEntries.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No entries match your search' : 'No entries need mapping (excluding split entries)'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface UnmatchedEntryCardProps {
  entry: UnmatchedGLEntry;
  accounts: any[];
  onCreateMapping: (glName: string, fieldType: 'account_name' | 'split_account' | 'name', chartAccountId: string) => void;
}

const UnmatchedEntryCard: React.FC<UnmatchedEntryCardProps> = ({ entry, accounts, onCreateMapping }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedField, setSelectedField] = useState<'account_name' | 'split_account' | 'name'>('account_name');
  const [expanded, setExpanded] = useState(false);

  const handleCreateMapping = () => {
    if (!selectedAccount) return;

    const fieldValue = entry[selectedField];
    onCreateMapping(fieldValue, selectedField, selectedAccount);
    setSelectedAccount('');
    setExpanded(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {entry.account_name}
          </div>
          <div className="text-xs text-muted-foreground">
            {entry.entry_count} entries • {formatCurrency(entry.total_amount)}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div>
            <label className="text-sm font-medium">GL Field:</label>
            <Select value={selectedField} onValueChange={(value: any) => setSelectedField(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account_name">Account Name: {entry.account_name}</SelectItem>
                <SelectItem value="split_account">Split Account: {entry.split_account}</SelectItem>
                <SelectItem value="name">Name: {entry.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Chart of Account:</label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_number} - {account.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleCreateMapping}
            disabled={!selectedAccount}
            className="w-full"
          >
            Create Mapping
          </Button>
        </div>
      )}
    </div>
  );
};
