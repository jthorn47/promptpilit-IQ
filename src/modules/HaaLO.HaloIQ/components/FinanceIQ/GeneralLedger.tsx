import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Filter, Download, Search, Loader2 } from 'lucide-react';
import { useGeneralLedger, type GeneralLedgerFilters } from '@/modules/HaaLO.Shared/hooks/useGeneralLedger';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const GeneralLedger: React.FC = () => {
  console.log('🔧 GeneralLedger component mounted');
  const { toast } = useToast();
  const { user } = useAuth();
  const [filters, setFilters] = useState<GeneralLedgerFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Get company ID from user profile
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) {
        console.log('❌ No user ID found for GeneralLedger');
        return;
      }
      
      console.log('🔍 Fetching company ID for GeneralLedger user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      console.log('📋 GeneralLedger profile fetch result:', { profile, error });
      
      if (profile?.company_id) {
        console.log('✅ GeneralLedger company ID found:', profile.company_id);
        setCompanyId(profile.company_id);
      } else {
        console.log('❌ No company ID found in profile for GeneralLedger');
      }
    };
    
    fetchCompanyId();
  }, [user?.id]);

  const { 
    entries, 
    isLoading, 
    bulkUpload, 
    isUploading 
  } = useGeneralLedger(companyId || '', filters);

  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    return entries.filter(entry => 
      entry.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.split_account.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [entries, searchTerm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid JSON format. Expected an array of journal entries.');
      }

      // Validate required fields
      const requiredFields = ['date', 'type', 'split_account', 'amount', 'balance', 'account_name'];
      const invalidEntries = jsonData.filter(entry => 
        !requiredFields.every(field => entry.hasOwnProperty(field))
      );

      if (invalidEntries.length > 0) {
        throw new Error(`Invalid entries found. Missing required fields: ${requiredFields.join(', ')}`);
      }

      // Transform data to match our schema
      const transformedEntries = jsonData.map(entry => ({
        company_id: companyId,
        date: entry.date,
        type: entry.type,
        reference: entry.reference || null,
        name: entry.name || null,
        description: entry.description || null,
        split_account: entry.split_account,
        amount: parseFloat(entry.amount),
        balance: parseFloat(entry.balance),
        account_name: entry.account_name,
      }));

      await bulkUpload(transformedEntries);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to parse JSON file',
        variant: 'destructive',
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'debit':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const applyFilters = () => {
    // Filters are already applied through the hook when filters state changes
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setShowFilters(false);
  };

  const totalBalance = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [filteredEntries]);

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage your company's journal entries and transactions
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button disabled={isUploading} className="flex items-center gap-2 text-sm w-full sm:w-auto" size="sm">
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload JSON'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{filteredEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-xs md:text-base">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Credit Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">
              {filteredEntries.filter(e => e.type.toLowerCase() === 'credit').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Debit Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">
              {filteredEntries.filter(e => e.type.toLowerCase() === 'debit').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Journal Entries</CardTitle>
            <CardDescription>
              Apply filters to narrow down your journal entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-sm">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-sm">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm">Transaction Type</Label>
                <Select 
                  value={filters.type || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-sm">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Search account names..."
                  value={filters.accountName || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, accountName: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAmount" className="text-sm">Min Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minAmount || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: parseFloat(e.target.value) || undefined }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount" className="text-sm">Max Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.maxAmount || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) || undefined }))}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={clearFilters} size="sm" className="text-sm">
                Clear Filters
              </Button>
              <Button onClick={applyFilters} size="sm" className="text-sm">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
          <CardDescription>
            Complete list of all journal entries and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No journal entries</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a JSON file to get started.
              </p>
            </div>
          ) : (
            <div className="hidden md:block">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Reference</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Split Account</TableHead>
                      <TableHead className="text-right text-xs">Amount</TableHead>
                      <TableHead className="text-right text-xs">Balance</TableHead>
                      <TableHead className="text-xs">Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium text-xs">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTransactionTypeColor(entry.type)} text-xs px-1 py-0`}>
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.reference || '—'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {entry.description || entry.name || '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.split_account}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <span className={entry.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {formatCurrency(entry.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatCurrency(entry.balance)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.account_name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Mobile Card Layout */}
          {filteredEntries.length > 0 && (
            <div className="md:hidden space-y-3">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{formatDate(entry.date)}</div>
                      <div className="text-xs text-muted-foreground">{entry.account_name}</div>
                    </div>
                    <Badge className={`${getTransactionTypeColor(entry.type)} text-xs`}>
                      {entry.type}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Amount:</span>
                      <span className={`font-mono text-sm font-medium ${entry.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(entry.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Balance:</span>
                      <span className="font-mono text-sm">{formatCurrency(entry.balance)}</span>
                    </div>
                    {entry.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Split: {entry.split_account}
                    </div>
                    {entry.reference && (
                      <div className="text-xs text-muted-foreground">
                        Ref: {entry.reference}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};