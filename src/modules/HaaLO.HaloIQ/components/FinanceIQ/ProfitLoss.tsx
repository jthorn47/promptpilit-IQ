import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { HaaLODatePicker } from '@/modules/HaaLO.Shared/components/HaaLODatePicker';
import { formatCurrency } from '@/modules/HaaLO.Shared/utils/currencyFormatter';
import { Download, FileSpreadsheet, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Calculator, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

interface ProfitLossEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  account_group: string;
  amount: number;
}

interface ProfitLossGroup {
  group_name: string;
  group_type: string;
  entries: ProfitLossEntry[];
  total: number;
}

interface ProfitLossData {
  revenue_group: ProfitLossGroup;
  cogs_group: ProfitLossGroup;
  expense_groups: ProfitLossGroup[];
  total_revenue: number;
  total_cogs: number;
  total_expenses: number;
  gross_profit: number;
  net_income: number;
}

export const ProfitLoss: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
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

  const { data: plData, isLoading, error } = useSupabaseQuery<ProfitLossData>(
    ['profit-loss', companyId, dateFrom?.toISOString().split('T')[0], dateTo?.toISOString().split('T')[0]],
    async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase.functions.invoke('calculate-profit-loss', {
        body: { 
          company_id: companyId,
          date_from: dateFrom?.toISOString().split('T')[0],
          date_to: dateTo?.toISOString().split('T')[0]
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
    if (!plData) return;
    
    const csvData = [];
    csvData.push(['Profit & Loss Statement']);
    csvData.push(['Period:', `${dateFrom?.toLocaleDateString()} - ${dateTo?.toLocaleDateString()}`]);
    csvData.push(['']);
    
    // Revenue section
    csvData.push(['REVENUE']);
    plData.revenue_group.entries.forEach(entry => {
      csvData.push([entry.account_number, entry.account_name, formatCurrency(entry.amount)]);
    });
    csvData.push(['', 'Total Revenue', formatCurrency(plData.total_revenue)]);
    csvData.push(['']);
    
    // COGS section
    if (plData.cogs_group.entries.length > 0) {
      csvData.push(['COST OF GOODS SOLD']);
      plData.cogs_group.entries.forEach(entry => {
        csvData.push([entry.account_number, entry.account_name, formatCurrency(entry.amount)]);
      });
      csvData.push(['', 'Total COGS', formatCurrency(plData.total_cogs)]);
      csvData.push(['', 'Gross Profit', formatCurrency(plData.gross_profit)]);
      csvData.push(['']);
    }
    
    // Expenses section
    plData.expense_groups.forEach(group => {
      csvData.push([group.group_name.toUpperCase()]);
      group.entries.forEach(entry => {
        csvData.push([entry.account_number, entry.account_name, formatCurrency(entry.amount)]);
      });
      csvData.push(['', `Total ${group.group_name}`, formatCurrency(group.total)]);
      csvData.push(['']);
    });
    
    csvData.push(['', 'NET INCOME', formatCurrency(plData.net_income)]);
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${dateFrom?.toISOString().split('T')[0]}-${dateTo?.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const renderAccountGroup = (group: ProfitLossGroup, isExpanded: boolean) => (
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
                <th className="p-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry, index) => (
                <tr key={`${entry.account_number}-${index}`} className="border-b">
                  <td className="p-3 font-mono text-sm">{entry.account_number}</td>
                  <td className="p-3">{entry.account_name}</td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(entry.amount)}
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
            <p className="text-destructive">Error loading profit & loss data: {error.message}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">
            Summary of revenue and expenses over a specified period
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">From Date</label>
                <HaaLODatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="Select start date"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">To Date</label>
                <HaaLODatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="Select end date"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="comparison-mode"
                checked={showComparison}
                onCheckedChange={setShowComparison}
              />
              <label htmlFor="comparison-mode" className="text-sm font-medium">
                Show comparison to previous period
              </label>
            </div>
            
            {showComparison && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Comparison functionality coming soon
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profit & Loss Statement */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Loading profit & loss data...
            </div>
          </CardContent>
        </Card>
      ) : !plData ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No data available for the selected period
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Revenue Section */}
          <Card>
            <CardHeader className="bg-success/10">
              <CardTitle className="flex items-center gap-2 text-success">
                <TrendingUp className="h-5 w-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderAccountGroup(plData.revenue_group, expandedGroups.has('Revenue'))}
            </CardContent>
          </Card>

          {/* COGS Section */}
          {plData.cogs_group.entries.length > 0 && (
            <Card>
              <CardHeader className="bg-warning/10">
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Calculator className="h-5 w-5" />
                  Cost of Goods Sold
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {renderAccountGroup(plData.cogs_group, expandedGroups.has('Cost of Goods Sold'))}
              </CardContent>
            </Card>
          )}

          {/* Gross Profit */}
          {plData.total_cogs > 0 && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-primary">Gross Profit</h3>
                  <div className="text-xl font-bold font-mono text-primary">
                    {formatCurrency(plData.gross_profit)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Revenue ({formatCurrency(plData.total_revenue)}) - COGS ({formatCurrency(plData.total_cogs)})
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operating Expenses */}
          {plData.expense_groups.map(group => (
            <Card key={group.group_name}>
              <CardHeader className="bg-destructive/10">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="h-5 w-5" />
                  {group.group_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {renderAccountGroup(group, expandedGroups.has(group.group_name))}
              </CardContent>
            </Card>
          ))}

          {/* Net Income */}
          <Card className={`border-2 ${plData.net_income >= 0 ? 'border-success/50 bg-success/10' : 'border-destructive/50 bg-destructive/10'}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className={`h-6 w-6 ${plData.net_income >= 0 ? 'text-success' : 'text-destructive'}`} />
                  <h3 className={`text-2xl font-bold ${plData.net_income >= 0 ? 'text-success' : 'text-destructive'}`}>
                    Net {plData.net_income >= 0 ? 'Income' : 'Loss'}
                  </h3>
                </div>
                <div className={`text-3xl font-bold font-mono ${plData.net_income >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(Math.abs(plData.net_income))}
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {plData.total_cogs > 0 ? 
                  `Gross Profit (${formatCurrency(plData.gross_profit)}) - Operating Expenses (${formatCurrency(plData.total_expenses)})` :
                  `Revenue (${formatCurrency(plData.total_revenue)}) - Expenses (${formatCurrency(plData.total_expenses)})`
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;