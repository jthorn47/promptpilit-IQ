import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Plus,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { useGLJournals, useGLBatches, useGLSettings } from '@/modules/HaaLO.Shared/hooks/useGLModule';
import { useChartOfAccounts } from '@/modules/HaaLO.Shared/hooks/useChartOfAccounts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GLDashboardProps {
  companyId: string;
  onCreateJournal: () => void;
  onCreateBatch: () => void;
  onViewJournals: () => void;
  onViewBatches: () => void;
}

export const GLDashboard: React.FC<GLDashboardProps> = ({
  companyId,
  onCreateJournal,
  onCreateBatch,
  onViewJournals,
  onViewBatches
}) => {
  const [isCalculatingBalances, setIsCalculatingBalances] = useState(false);
  const { toast } = useToast();
  
  console.log('🔧 GLDashboard rendering with companyId:', companyId);
  
  const { journals, isLoading: journalsLoading } = useGLJournals(companyId);
  const { batches, isLoading: batchesLoading } = useGLBatches(companyId);
  const { settings, isLoading: settingsLoading } = useGLSettings(companyId);
  const { accounts, isLoading: accountsLoading } = useChartOfAccounts(companyId);

  console.log('🔧 GLDashboard hook states:', {
    journalsLoading,
    batchesLoading, 
    settingsLoading,
    accountsLoading,
    journalsCount: journals?.length || 0,
    batchesCount: batches?.length || 0,
    accountsCount: accounts?.length || 0
  });

  const debugAccountMatching = async () => {
    try {
      console.log('🔍 Starting account matching debug...');
      const { data, error } = await supabase.functions.invoke('debug-account-matching', {
        body: { company_id: companyId }
      });
      
      if (error) {
        console.error('Debug error:', error);
        return;
      }
      
      console.log('🎯 Account Matching Debug Results:', data);
      toast({
        title: "Debug Complete",
        description: "Check console for detailed account matching analysis",
      });
    } catch (error) {
      console.error('Debug failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateAccountBalances = async () => {
    setIsCalculatingBalances(true);
    try {
      console.log('🚀 Starting balance calculation for company:', companyId);
      
      // Remove timeout - let the database function complete naturally
      const { data, error } = await supabase.rpc('calculate_account_balances_simple', {
        p_company_id: companyId
      });

      console.log('📊 Raw response from database function:', { data, error });

      if (error) {
        console.error('❌ Database function error:', error);
        throw error;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const accountsUpdated = result.accounts_updated || 0;
        const entriesProcessed = result.total_entries || 0;
        
        console.log('✅ Balance calculation completed:', {
          accountsUpdated,
          entriesProcessed,
          result
        });

        toast({
          title: "Balance Calculation Complete",
          description: `Updated ${accountsUpdated} accounts from ${entriesProcessed} entries.`,
        });

        // Force immediate refresh to show updated balances
        console.log('🔄 Refreshing page to show updated balances...');
        window.location.reload();
      } else {
        throw new Error('No data returned from balance calculation');
      }
    } catch (error) {
      console.error('Error calculating account balances:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to calculate account balances",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingBalances(false);
    }
  };

  // Calculate dashboard metrics
  const draftJournals = (journals || []).filter(j => j.status === 'Draft');
  const unbalancedJournals = (journals || []).filter(j => !j.is_balanced);
  const pendingBatches = (batches || []).filter(b => b.status === 'Draft' || b.status === 'Ready');
  
  const totalDebits = (journals || []).reduce((sum, j) => sum + j.total_debits, 0);
  const totalCredits = (journals || []).reduce((sum, j) => sum + j.total_credits, 0);

  const assetAccounts = (accounts || []).filter(a => a.account_type === 'Asset');
  const liabilityAccounts = (accounts || []).filter(a => a.account_type === 'Liability');
  const equityAccounts = (accounts || []).filter(a => a.account_type === 'Equity');
  const revenueAccounts = (accounts || []).filter(a => a.account_type === 'Revenue');
  const expenseAccounts = (accounts || []).filter(a => a.account_type === 'Expense');

  const assetTotal = assetAccounts.reduce((sum, a) => sum + a.current_balance, 0);
  const liabilityTotal = liabilityAccounts.reduce((sum, a) => sum + a.current_balance, 0);
  const equityTotal = equityAccounts.reduce((sum, a) => sum + a.current_balance, 0);
  const revenueTotal = revenueAccounts.reduce((sum, a) => sum + a.current_balance, 0);
  const expenseTotal = expenseAccounts.reduce((sum, a) => sum + a.current_balance, 0);

  if (journalsLoading || batchesLoading || settingsLoading || accountsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-2">
        <Button 
          onClick={debugAccountMatching} 
          variant="outline"
          size="sm"
        >
          Debug Matching
        </Button>
        <Button 
          onClick={calculateAccountBalances} 
          variant="outline"
          disabled={isCalculatingBalances}
        >
          {isCalculatingBalances ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Calculator className="h-4 w-4 mr-2" />
          )}
          {isCalculatingBalances ? 'Calculating...' : 'Calculate Balances'}
        </Button>
        <Button onClick={onCreateBatch} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
        <Button onClick={onCreateJournal}>
          <Plus className="h-4 w-4 mr-2" />
          New Journal Entry
        </Button>
      </div>

      {/* Alert Cards */}
      {(unbalancedJournals.length > 0 || pendingBatches.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unbalancedJournals.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Unbalanced Journals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {unbalancedJournals.length} journal(s) have unbalanced entries
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewJournals}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Review Journals
                </Button>
              </CardContent>
            </Card>
          )}

          {pendingBatches.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Calendar className="h-5 w-5" />
                  Pending Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {pendingBatches.length} batch(es) awaiting review or posting
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewBatches}
                  className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                >
                  Review Batches
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Balance Calculation Alert */}
      {(assetTotal === 0 && liabilityTotal === 0 && equityTotal === 0 && revenueTotal === 0 && expenseTotal === 0) && (
        <Card className="border-info/50 bg-info/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-info">
              <Calculator className="h-5 w-5" />
              Account Balances Need Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Your imported general ledger data needs to be processed to calculate account balances.
            </p>
            <Button 
              onClick={calculateAccountBalances} 
              size="sm"
              disabled={isCalculatingBalances}
              className="bg-info text-info-foreground hover:bg-info/90"
            >
              {isCalculatingBalances ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              {isCalculatingBalances ? 'Calculating...' : 'Calculate Account Balances'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Journals</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(journals || []).length}</div>
            <p className="text-xs text-muted-foreground">
              {draftJournals.length} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(batches || []).length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingBatches.length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              Current period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              Current period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Group Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Account Group Balances</CardTitle>
          <p className="text-sm text-muted-foreground">
            Current balances by account type
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">Assets</div>
              <div className="text-2xl font-bold">{formatCurrency(assetTotal)}</div>
              <div className="text-sm text-muted-foreground">{assetAccounts.length} accounts</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">Liabilities</div>
              <div className="text-2xl font-bold">{formatCurrency(liabilityTotal)}</div>
              <div className="text-sm text-muted-foreground">{liabilityAccounts.length} accounts</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">Equity</div>
              <div className="text-2xl font-bold">{formatCurrency(equityTotal)}</div>
              <div className="text-sm text-muted-foreground">{equityAccounts.length} accounts</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">Revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(revenueTotal)}</div>
              <div className="text-sm text-muted-foreground">{revenueAccounts.length} accounts</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">Expenses</div>
              <div className="text-2xl font-bold">{formatCurrency(expenseTotal)}</div>
              <div className="text-sm text-muted-foreground">{expenseAccounts.length} accounts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Status */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Period Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Current Period</div>
                <div className="text-lg font-semibold">
                  {settings.current_period_open ? new Date(settings.current_period_open).toLocaleDateString() : 'Not Set'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Next Period</div>
                <div className="text-lg font-semibold">
                  {settings.next_period_open ? new Date(settings.next_period_open).toLocaleDateString() : 'Not Set'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Settings</div>
                <div className="flex gap-2">
                  <Badge variant={settings.allow_future_posting ? "default" : "secondary"}>
                    {settings.allow_future_posting ? "Future Posting Allowed" : "Future Posting Blocked"}
                  </Badge>
                  <Badge variant={settings.require_batch_approval ? "default" : "secondary"}>
                    {settings.require_batch_approval ? "Batch Approval Required" : "Direct Posting"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
