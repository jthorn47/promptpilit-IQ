import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, Download, FileSpreadsheet, Printer, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTrialBalance } from '@/modules/HaaLO.Shared/hooks/useTrialBalance';
import { useToast } from '@/hooks/use-toast';

interface TrialBalanceProps {
  companyId: string;
}

export const TrialBalance: React.FC<TrialBalanceProps> = ({ companyId }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showInactiveAccounts, setShowInactiveAccounts] = useState(false);
  const { toast } = useToast();
  
  const { entries, totals, isLoading, error } = useTrialBalance(companyId, dateFrom, dateTo);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateEndingBalance = (entry: any) => {
    // Calculate net balance based on account type
    if (['Asset', 'Expense'].includes(entry.account_type)) {
      return entry.debit_amount - entry.credit_amount;
    } else {
      return entry.credit_amount - entry.debit_amount;
    }
  };

  const getBalanceType = (entry: any) => {
    const balance = calculateEndingBalance(entry);
    if (balance === 0) return 'Zero';
    
    if (['Asset', 'Expense'].includes(entry.account_type)) {
      return balance > 0 ? 'Debit' : 'Credit';
    } else {
      return balance > 0 ? 'Credit' : 'Debit';
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "PDF export functionality coming soon!",
    });
  };

  const handleExportCSV = () => {
    if (!entries.length) {
      toast({
        title: "No Data",
        description: "No trial balance data to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Account Code', 'Account Name', 'Account Type', 'Debit Total', 'Credit Total', 'Ending Balance', 'Balance Type'],
      ...entries.map(entry => [
        entry.account_number,
        entry.account_name,
        entry.account_type,
        entry.debit_amount.toFixed(2),
        entry.credit_amount.toFixed(2),
        Math.abs(calculateEndingBalance(entry)).toFixed(2),
        getBalanceType(entry)
      ]),
      ['', '', '', '', '', '', ''],
      ['TOTALS', '', '', totals?.total_debits.toFixed(2) || '0.00', totals?.total_credits.toFixed(2) || '0.00', '', '']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Trial balance data exported to CSV file.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter entries based on show inactive accounts toggle
  const filteredEntries = showInactiveAccounts 
    ? entries 
    : entries.filter(entry => entry.debit_amount !== 0 || entry.credit_amount !== 0);

  const formatDateRange = () => {
    if (!dateFrom && !dateTo) return 'All Periods';
    if (dateFrom && dateTo) return `${dateFrom} to ${dateTo}`;
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo) return `Through ${dateTo}`;
    return '';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            Trial Balance
          </h1>
          <p className="text-muted-foreground mt-2">
            Summary of account balances ensuring debits equal credits
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formatDateRange()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Start Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="All dates"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">End Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="All dates"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="showInactive"
                checked={showInactiveAccounts}
                onCheckedChange={setShowInactiveAccounts}
              />
              <Label htmlFor="showInactive">Show inactive accounts</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading trial balance: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Status */}
      {totals && !isLoading && !error && (
        <Alert variant={totals.is_balanced ? "default" : "destructive"}>
          {totals.is_balanced ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>
            {totals.is_balanced 
              ? "Trial Balance is in balance - Total debits equal total credits."
              : `Trial Balance is out of balance by ${formatCurrency(Math.abs(totals.difference))}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Summary</CardTitle>
            {!isLoading && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Showing {filteredEntries.length} accounts</span>
                {totals && (
                  <Badge variant={totals.is_balanced ? "default" : "destructive"}>
                    {totals.is_balanced ? "Balanced" : `Out by ${formatCurrency(Math.abs(totals.difference))}`}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Calculating trial balance...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No trial balance data found</p>
              <p>Try adjusting your date range or enable inactive accounts.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Account Code</TableHead>
                    <TableHead className="font-semibold">Account Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="text-right font-semibold">Debit Total</TableHead>
                    <TableHead className="text-right font-semibold">Credit Total</TableHead>
                    <TableHead className="text-right font-semibold">Ending Balance</TableHead>
                    <TableHead className="text-center font-semibold">Balance Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, index) => {
                    const endingBalance = calculateEndingBalance(entry);
                    const balanceType = getBalanceType(entry);
                    
                    return (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{entry.account_number}</TableCell>
                        <TableCell className="font-medium">{entry.account_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {entry.account_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {endingBalance !== 0 ? formatCurrency(Math.abs(endingBalance)) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          {balanceType !== 'Zero' && (
                            <Badge 
                              variant={balanceType === 'Debit' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {balanceType}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Totals Row */}
                  {totals && (
                    <TableRow className="font-bold border-t-2 bg-muted/30">
                      <TableCell colSpan={3} className="text-lg">TOTALS</TableCell>
                      <TableCell className={`text-right text-lg ${totals.is_balanced ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(totals.total_debits)}
                      </TableCell>
                      <TableCell className={`text-right text-lg ${totals.is_balanced ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(totals.total_credits)}
                      </TableCell>
                      <TableCell className="text-right text-lg">
                        {totals.difference !== 0 ? formatCurrency(Math.abs(totals.difference)) : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.is_balanced ? (
                          <Badge variant="default">Balanced</Badge>
                        ) : (
                          <Badge variant="destructive">
                            {totals.difference > 0 ? 'Debit Heavy' : 'Credit Heavy'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};