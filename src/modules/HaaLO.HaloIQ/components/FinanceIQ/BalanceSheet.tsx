import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency } from '@/modules/HaaLO.Shared/utils/currencyFormatter';
import { Download, FileSpreadsheet, CalendarIcon, Building2, CreditCard, PiggyBank, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

interface BalanceSheetEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  net_balance: number;
}

interface BalanceSheetGroup {
  group_name: string;
  group_type: string;
  entries: BalanceSheetEntry[];
  total: number;
}

interface BalanceSheetData {
  asset_groups: BalanceSheetGroup[];
  liability_groups: BalanceSheetGroup[];
  equity_groups: BalanceSheetGroup[];
  retained_earnings: number;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  is_balanced: boolean;
  difference: number;
}

export const BalanceSheet: React.FC = () => {
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Current Assets', 'Current Liabilities', 'Equity']));
  
  // Get company ID from user profile
  React.useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
      }
    };
    
    fetchCompanyId();
  }, []);

  const { data: bsData, isLoading, error } = useSupabaseQuery<BalanceSheetData>(
    ['balance-sheet', companyId, asOfDate?.toISOString().split('T')[0]],
    async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase.functions.invoke('calculate-balance-sheet', {
        body: { 
          company_id: companyId,
          as_of_date: asOfDate?.toISOString().split('T')[0]
        }
      });
      
      if (error) throw error;
      return data;
    },
    { enabled: !!companyId }
  );

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleExportPDF = () => {
    toast.info('PDF export functionality coming soon');
  };

  const handleExportCSV = () => {
    if (!bsData) return;
    
    const csvData = [];
    csvData.push(['Balance Sheet']);
    csvData.push(['As of:', format(asOfDate, 'PPP')]);
    csvData.push(['']);
    
    // Assets section
    csvData.push(['ASSETS']);
    bsData.asset_groups.forEach(group => {
      csvData.push([group.group_name]);
      group.entries.forEach(entry => {
        csvData.push([entry.account_number, entry.account_name, formatCurrency(entry.net_balance)]);
      });
      csvData.push(['', `Total ${group.group_name}`, formatCurrency(group.total)]);
      csvData.push(['']);
    });
    csvData.push(['', 'TOTAL ASSETS', formatCurrency(bsData.total_assets)]);
    csvData.push(['']);
    
    // Liabilities section
    csvData.push(['LIABILITIES']);
    bsData.liability_groups.forEach(group => {
      csvData.push([group.group_name]);
      group.entries.forEach(entry => {
        csvData.push([entry.account_number, entry.account_name, formatCurrency(entry.net_balance)]);
      });
      csvData.push(['', `Total ${group.group_name}`, formatCurrency(group.total)]);
      csvData.push(['']);
    });
    csvData.push(['', 'TOTAL LIABILITIES', formatCurrency(bsData.total_liabilities)]);
    csvData.push(['']);
    
    // Equity section
    csvData.push(['EQUITY']);
    bsData.equity_groups.forEach(group => {
      csvData.push([group.group_name]);
      group.entries.forEach(entry => {
        csvData.push([entry.account_number, entry.account_name, formatCurrency(entry.net_balance)]);
      });
      csvData.push(['', `Total ${group.group_name}`, formatCurrency(group.total)]);
      csvData.push(['']);
    });
    csvData.push(['', 'TOTAL EQUITY', formatCurrency(bsData.total_equity)]);
    csvData.push(['']);
    csvData.push(['', 'TOTAL LIABILITIES & EQUITY', formatCurrency(bsData.total_liabilities + bsData.total_equity)]);
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${asOfDate.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const renderAccountGroup = (group: BalanceSheetGroup, isExpanded: boolean) => (
    <div key={group.group_name} className="border rounded-lg">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
        onClick={() => toggleGroup(group.group_name)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-semibold">{group.group_name}</span>
        </div>
        <span className="font-mono font-semibold">
          {formatCurrency(group.total)}
        </span>
      </div>
      
      {isExpanded && group.entries.length > 0 && (
        <div className="border-t bg-muted/20">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left font-medium">Account #</th>
                <th className="p-3 text-left font-medium">Account Name</th>
                <th className="p-3 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry, index) => (
                <tr key={`${entry.account_number}-${index}`} className="border-b">
                  <td className="p-3 font-mono text-sm">{entry.account_number}</td>
                  <td className="p-3">{entry.account_name}</td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(entry.net_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading balance sheet data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
          <p className="text-muted-foreground">
            Statement of financial position showing assets, liabilities, and equity
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* As-Of Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>As of Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !asOfDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {asOfDate ? format(asOfDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={asOfDate}
                    onSelect={(date) => date && setAsOfDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Alert */}
      {bsData && !bsData.is_balanced && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Balance Sheet is out of balance!</span>
              <span className="text-sm">
                Difference: {formatCurrency(Math.abs(bsData.difference))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Sheet Statement */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Loading balance sheet data...
            </div>
          </CardContent>
        </Card>
      ) : !bsData ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No data available for the selected date
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Assets Section */}
          <Card>
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {bsData.asset_groups.map(group => 
                renderAccountGroup(group, expandedGroups.has(group.group_name))
              )}
              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-primary">
                  <span>Total Assets</span>
                  <span className="font-mono">{formatCurrency(bsData.total_assets)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities Section */}
          <Card>
            <CardHeader className="bg-warning/10">
              <CardTitle className="flex items-center gap-2 text-warning">
                <CreditCard className="h-5 w-5" />
                Liabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {bsData.liability_groups.map(group => 
                renderAccountGroup(group, expandedGroups.has(group.group_name))
              )}
              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-warning">
                  <span>Total Liabilities</span>
                  <span className="font-mono">{formatCurrency(bsData.total_liabilities)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equity Section */}
          <Card>
            <CardHeader className="bg-success/10">
              <CardTitle className="flex items-center gap-2 text-success">
                <PiggyBank className="h-5 w-5" />
                Equity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {bsData.equity_groups.map(group => 
                renderAccountGroup(group, expandedGroups.has(group.group_name))
              )}
              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-success">
                  <span>Total Equity</span>
                  <span className="font-mono">{formatCurrency(bsData.total_equity)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totals Summary */}
          <Card className={`border-2 ${bsData.is_balanced ? 'border-success/50 bg-success/10' : 'border-destructive/50 bg-destructive/10'}`}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total Assets</span>
                  <span className="font-mono font-bold">{formatCurrency(bsData.total_assets)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total Liabilities & Equity</span>
                  <span className="font-mono font-bold">{formatCurrency(bsData.total_liabilities + bsData.total_equity)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className={`flex justify-between items-center text-xl font-bold ${bsData.is_balanced ? 'text-success' : 'text-destructive'}`}>
                    <span>{bsData.is_balanced ? '✓ Balanced' : '⚠ Out of Balance'}</span>
                    {!bsData.is_balanced && (
                      <span className="text-sm font-normal">
                        Difference: {formatCurrency(Math.abs(bsData.difference))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BalanceSheet;