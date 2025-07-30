import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  BookOpen,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useGLJournals, GLFilters } from '@/modules/HaaLO.Shared/hooks/useGLModule';
import { useChartOfAccounts } from '@/modules/HaaLO.Shared/hooks/useChartOfAccounts';

interface LedgerViewProps {
  companyId: string;
  onViewJournal?: (journalId: string) => void;
  onEditJournal?: (journalId: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  companyId,
  onViewJournal,
  onEditJournal
}) => {
  const [filters, setFilters] = useState<GLFilters>({
    dateFrom: '',
    dateTo: '',
    accountId: '',
    source: '',
    status: '',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'journal' | 'account'>('journal');

  const { journals, isLoading } = useGLJournals(companyId, filters);
  const { accounts } = useChartOfAccounts(companyId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredJournals = journals.filter(journal => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      journal.journal_number.toLowerCase().includes(searchLower) ||
      journal.memo?.toLowerCase().includes(searchLower) ||
      journal.source.toLowerCase().includes(searchLower) ||
      journal.entries?.some(entry => 
        entry.description?.toLowerCase().includes(searchLower) ||
        entry.account?.full_name?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Group entries by account for account view
  const entriesByAccount = journals.reduce((acc, journal) => {
    journal.entries?.forEach(entry => {
      const accountKey = entry.account_id;
      if (!acc[accountKey]) {
        acc[accountKey] = {
          account: entry.account,
          entries: []
        };
      }
      acc[accountKey].entries.push({
        ...entry,
        journal_number: journal.journal_number,
        journal_date: journal.date,
        journal_memo: journal.memo,
        journal_status: journal.status
      });
    });
    return acc;
  }, {} as Record<string, any>);

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      accountId: '',
      source: '',
      status: '',
    });
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            General Ledger
          </h1>
          <p className="text-muted-foreground">
            View and analyze journal entries and account activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="account">Account</Label>
              <Select
                value={filters.accountId || ''}
                onValueChange={(value) => setFilters({ ...filters, accountId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_number} - {account.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                value={filters.source || ''}
                onValueChange={(value) => setFilters({ ...filters, source: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sources</SelectItem>
                  <SelectItem value="Manual">Manual Entry</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="AP">Accounts Payable</SelectItem>
                  <SelectItem value="AR">Accounts Receivable</SelectItem>
                  <SelectItem value="Adjustment">Journal Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search journals, accounts, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'journal' | 'account')}>
        <TabsList>
          <TabsTrigger value="journal">Journal View</TabsTrigger>
          <TabsTrigger value="account">Account View</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries ({filteredJournals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Journal #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead className="text-right">Debits</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournals.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell className="font-mono">{journal.journal_number}</TableCell>
                      <TableCell>{formatDate(journal.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{journal.source}</Badge>
                      </TableCell>
                      <TableCell>{journal.memo || '—'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(journal.total_debits)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(journal.total_credits)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={journal.status === 'Posted' ? "default" : "secondary"}>
                            {journal.status}
                          </Badge>
                          {!journal.is_balanced && (
                        <Badge variant="destructive">
                          Unbalanced
                        </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewJournal?.(journal.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {journal.status === 'Draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditJournal?.(journal.id)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          {Object.entries(entriesByAccount).map(([accountId, accountData]) => (
            <Card key={accountId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {accountData.account?.account_number} - {accountData.account?.full_name}
                  </span>
                  <Badge variant="outline">
                    {accountData.account?.account_type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Journal #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountData.entries.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.journal_date)}</TableCell>
                        <TableCell className="font-mono">{entry.journal_number}</TableCell>
                        <TableCell>{entry.description || entry.journal_memo || '—'}</TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.journal_status === 'Posted' ? "default" : "secondary"}>
                            {entry.journal_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};