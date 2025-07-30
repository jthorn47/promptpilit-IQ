import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface OffCycleRun {
  id: string;
  runNumber: string;
  type: 'retro_pay' | 'bonus' | 'correction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  employeeCount: number;
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  processedAt?: string;
  payPeriod: string;
  description: string;
  batchId?: string;
}

const mockRuns: OffCycleRun[] = [
  {
    id: '1',
    runNumber: 'OC-2024-001',
    type: 'bonus',
    status: 'completed',
    employeeCount: 25,
    totalAmount: 50000,
    createdBy: 'Admin User',
    createdAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T14:45:00Z',
    payPeriod: 'Q4 2023 Bonus',
    description: 'Q4 performance bonuses for sales team',
    batchId: 'BATCH-2024-001'
  },
  {
    id: '2',
    runNumber: 'OC-2024-002',
    type: 'retro_pay',
    status: 'completed',
    employeeCount: 8,
    totalAmount: 12500,
    createdBy: 'Payroll Manager',
    createdAt: '2024-01-12T09:15:00Z',
    processedAt: '2024-01-12T16:20:00Z',
    payPeriod: 'Jan 1-15, 2024',
    description: 'Overtime adjustments for engineering team',
    batchId: 'BATCH-2024-002'
  },
  {
    id: '3',
    runNumber: 'OC-2024-003',
    type: 'correction',
    status: 'pending',
    employeeCount: 3,
    totalAmount: 2750,
    createdBy: 'HR Director',
    createdAt: '2024-01-16T11:00:00Z',
    payPeriod: 'Dec 16-31, 2023',
    description: 'Payroll corrections for holiday pay calculation errors'
  },
  {
    id: '4',
    runNumber: 'OC-2024-004',
    type: 'bonus',
    status: 'failed',
    employeeCount: 15,
    totalAmount: 22500,
    createdBy: 'Admin User',
    createdAt: '2024-01-14T13:30:00Z',
    payPeriod: 'Special Recognition',
    description: 'Failed due to insufficient funds in payroll account'
  }
];

export const OffCycleHistory: React.FC = () => {
  const [runs, setRuns] = useState<OffCycleRun[]>(mockRuns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRun, setSelectedRun] = useState<OffCycleRun | null>(null);

  const filteredRuns = runs.filter(run => {
    const matchesSearch = 
      run.runNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    const matchesType = typeFilter === 'all' || run.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <AlertTriangle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'retro_pay': return 'Retro Pay';
      case 'bonus': return 'Bonus';
      case 'correction': return 'Correction';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retro_pay': return 'bg-orange-100 text-orange-800';
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'correction': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportHistory = () => {
    // This would trigger a CSV/PDF export
    console.log('Exporting off-cycle history...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Off-Cycle Payroll History</h2>
          <p className="text-muted-foreground">
            Track all retro pay, bonus, and correction runs
          </p>
        </div>
        <Button onClick={exportHistory} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by run number, description, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retro_pay">Retro Pay</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="correction">Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{runs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Processed</p>
                <p className="text-2xl font-bold">
                  ${runs.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees Affected</p>
                <p className="text-2xl font-bold">
                  {runs.reduce((sum, r) => sum + r.employeeCount, 0)}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((runs.filter(r => r.status === 'completed').length / runs.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRuns.map((run) => (
              <div key={run.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{run.runNumber}</h4>
                      <Badge variant={getStatusColor(run.status)} className="flex items-center gap-1">
                        {getStatusIcon(run.status)}
                        {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                      </Badge>
                      <Badge className={getTypeColor(run.type)}>
                        {getTypeLabel(run.type)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{run.description}</p>
                    
                    <div className="grid gap-2 md:grid-cols-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{run.employeeCount} employees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${run.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{run.payPeriod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(run.createdAt)}</span>
                      </div>
                    </div>
                    
                    {run.processedAt && (
                      <div className="mt-2 text-xs text-green-600">
                        Processed: {formatDate(run.processedAt)}
                      </div>
                    )}
                    
                    {run.batchId && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Batch ID: {run.batchId}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRun(run)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {run.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRuns.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No off-cycle runs found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run Details Modal/Sidebar would go here */}
      {selectedRun && (
        <Card className="mt-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedRun.runNumber} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">{selectedRun.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pay Period</p>
                <p className="font-medium">{selectedRun.payPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-green-600">${selectedRun.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee Count</p>
                <p className="font-medium">{selectedRun.employeeCount}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{selectedRun.description}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setSelectedRun(null)}>Close</Button>
              {selectedRun.status === 'completed' && (
                <Button variant="outline">Download Report</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};