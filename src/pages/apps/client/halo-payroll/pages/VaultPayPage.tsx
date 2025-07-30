import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, 
  Download, 
  Send, 
  RefreshCw, 
  X,
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Search
} from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { toast } from "sonner";

interface LiabilitySummary {
  totalGrossWages: number;
  employeeTaxesWithheld: number;
  employerTaxes: number;
  netPay: number;
  benefitDeductions: number;
  workersComp: number;
  totalPayrollCost: number;
  fundingStatus: 'awaiting' | 'funded' | 'partially_funded';
}

interface ACHBatch {
  id: string;
  batchId: string;
  runDate: string;
  status: 'pending' | 'sent' | 'failed';
  fundingSource: 'client_bank' | 'haalo_escrow';
  debitAmount: number;
  sentTo: string;
  achFileUrl?: string;
}

export const VaultPayPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fundingSourceFilter, setFundingSourceFilter] = useState<string>('all');

  // Mock data - in real implementation, this would come from hooks
  const liabilitySummary: LiabilitySummary = {
    totalGrossWages: 245000.00,
    employeeTaxesWithheld: 58800.00,
    employerTaxes: 18725.00,
    netPay: 186200.00,
    benefitDeductions: 12350.00,
    workersComp: 2450.00,
    totalPayrollCost: 276525.00,
    fundingStatus: 'partially_funded'
  };

  const achBatches: ACHBatch[] = [
    {
      id: '1',
      batchId: 'ACH-2024-001',
      runDate: '2024-01-15',
      status: 'sent',
      fundingSource: 'client_bank',
      debitAmount: 186200.00,
      sentTo: 'Wells Fargo ***1234',
      achFileUrl: '/download/ach-2024-001.txt'
    },
    {
      id: '2',
      batchId: 'ACH-2024-002',
      runDate: '2024-01-31',
      status: 'pending',
      fundingSource: 'haalo_escrow',
      debitAmount: 45300.00,
      sentTo: 'Chase Bank ***5678'
    },
    {
      id: '3',
      batchId: 'ACH-2024-003',
      runDate: '2024-02-15',
      status: 'failed',
      fundingSource: 'client_bank',
      debitAmount: 89750.00,
      sentTo: 'Bank of America ***9012'
    }
  ];

  const getFundingStatusColor = (status: string) => {
    switch (status) {
      case 'funded': return 'bg-success text-success-foreground';
      case 'partially_funded': return 'bg-warning text-warning-foreground';
      case 'awaiting': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleDownloadACH = (batch: ACHBatch) => {
    if (batch.achFileUrl) {
      toast.success(`Downloading ACH file for ${batch.batchId}`);
    } else {
      toast.error("ACH file has not been generated yet");
    }
  };

  const handleMarkAsSent = (batch: ACHBatch) => {
    toast.success(`${batch.batchId} has been marked as sent`);
  };

  const handleResendBatch = (batch: ACHBatch) => {
    toast.success(`${batch.batchId} has been queued for resending`);
  };

  const handleVoidBatch = (batch: ACHBatch) => {
    toast.error(`${batch.batchId} has been voided`);
  };

  const handleGenerateNewBatch = () => {
    toast.success("A new ACH batch has been created");
  };

  const filteredBatches = achBatches.filter(batch => {
    const matchesSearch = batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.sentTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    const matchesFunding = fundingSourceFilter === 'all' || batch.fundingSource === fundingSourceFilter;
    
    return matchesSearch && matchesStatus && matchesFunding;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <StandardPageLayout
      title="VaultPay"
      subtitle="Payroll Funding & Liability Overview"
    >
      <div className="space-y-4">

        {/* Liability Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Liability Summary - Last Payroll Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(liabilitySummary.totalGrossWages)}
                </div>
                <div className="text-sm text-muted-foreground">Total Gross<br />Wages</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(liabilitySummary.employeeTaxesWithheld)}
                </div>
                <div className="text-sm text-muted-foreground">Employee<br />Taxes Withheld</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(liabilitySummary.employerTaxes)}
                </div>
                <div className="text-sm text-muted-foreground">Employer<br />Taxes</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(liabilitySummary.netPay)}
                </div>
                <div className="text-sm text-muted-foreground">Net Pay</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(liabilitySummary.benefitDeductions)}
                </div>
                <div className="text-sm text-muted-foreground">Benefit<br />Deductions</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(liabilitySummary.workersComp)}
                </div>
                <div className="text-sm text-muted-foreground">Workers'<br />Comp</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(liabilitySummary.totalPayrollCost)}
                </div>
                <div className="text-sm text-muted-foreground">Total Payroll<br />Cost</div>
              </div>
              
              <div className="text-center space-y-2">
                <Badge className={getFundingStatusColor(liabilitySummary.fundingStatus)}>
                  PARTIALLY FUNDED
                </Badge>
                <div className="text-sm text-muted-foreground">Funding Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACH Batch Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                ACH Disbursements
              </CardTitle>
              <Button onClick={handleGenerateNewBatch} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate New Batch
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Batch ID or Bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={fundingSourceFilter} onValueChange={setFundingSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Funding Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="client_bank">Client Bank</SelectItem>
                  <SelectItem value="haalo_escrow">HaaLO Escrow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ACH Batches Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Run Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Funding Source</TableHead>
                    <TableHead>Debit Amount</TableHead>
                    <TableHead>Sent To</TableHead>
                    <TableHead>ACH File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batchId}</TableCell>
                      <TableCell>{formatDate(batch.runDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(batch.status)}
                          <span className="capitalize">{batch.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={batch.fundingSource === 'client_bank' ? 'default' : 'secondary'}>
                          {batch.fundingSource === 'client_bank' ? 'Client Bank' : 'HaaLO Escrow'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {formatCurrency(batch.debitAmount)}
                      </TableCell>
                      <TableCell>{batch.sentTo}</TableCell>
                      <TableCell>
                        {batch.achFileUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadACH(batch)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not Generated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {batch.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsSent(batch)}
                              className="text-success hover:text-success/80"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(batch.status === 'failed' || batch.status === 'sent') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendBatch(batch)}
                              className="text-primary hover:text-primary/80"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {batch.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVoidBatch(batch)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBatches.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No ACH batches found matching your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};