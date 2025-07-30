import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlayCircle, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  RefreshCw,
  Ban,
  Unlock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

interface PayRun {
  id: string;
  clientName: string;
  clientId: string;
  payPeriod: string;
  status: 'processing' | 'confirmed' | 'failed' | 'held' | 'scheduled';
  amount: number;
  employees: number;
  scheduledDate: string;
  processedDate?: string;
  achStatus: string;
  taxStatus: string;
  vendorStatus: string;
  progress: number;
  issues: number;
}

export const PayRunMonitor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock pay run data
  const payRuns: PayRun[] = [
    {
      id: 'pr_001',
      clientName: 'TechFlow Solutions',
      clientId: 'cl_001',
      payPeriod: '2024-01-16 to 2024-01-31',
      status: 'processing',
      amount: 125000,
      employees: 45,
      scheduledDate: '2024-01-31',
      achStatus: 'pending',
      taxStatus: 'processing',
      vendorStatus: 'queued',
      progress: 65,
      issues: 0
    },
    {
      id: 'pr_002',
      clientName: 'Green Valley Manufacturing',
      clientId: 'cl_002',
      payPeriod: '2024-01-16 to 2024-01-31',
      status: 'confirmed',
      amount: 287500,
      employees: 127,
      scheduledDate: '2024-01-31',
      processedDate: '2024-01-30 14:30',
      achStatus: 'confirmed',
      taxStatus: 'filed',
      vendorStatus: 'completed',
      progress: 100,
      issues: 0
    },
    {
      id: 'pr_003',
      clientName: 'Sunrise Healthcare',
      clientId: 'cl_003',
      payPeriod: '2024-01-16 to 2024-01-31',
      status: 'failed',
      amount: 189000,
      employees: 89,
      scheduledDate: '2024-01-31',
      achStatus: 'failed',
      taxStatus: 'pending',
      vendorStatus: 'failed',
      progress: 25,
      issues: 3
    },
    {
      id: 'pr_004',
      clientName: 'Metro Construction LLC',
      clientId: 'cl_004',
      payPeriod: '2024-01-16 to 2024-01-31',
      status: 'held',
      amount: 156000,
      employees: 78,
      scheduledDate: '2024-01-31',
      achStatus: 'held',
      taxStatus: 'held',
      vendorStatus: 'held',
      progress: 0,
      issues: 1
    }
  ];

  const getStatusBadge = (status: PayRun['status']) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'held':
        return <Badge className="bg-yellow-100 text-yellow-800"><Lock className="h-3 w-3 mr-1" />Held</Badge>;
      case 'scheduled':
        return <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDisbursementBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'filed':
        return <Badge className="bg-green-100 text-green-800">✓</Badge>;
      case 'processing':
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">⧗</Badge>;
      case 'failed':
        return <Badge variant="destructive">✗</Badge>;
      case 'held':
        return <Badge className="bg-yellow-100 text-yellow-800">⏸</Badge>;
      case 'queued':
        return <Badge variant="outline">⋯</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayRuns = payRuns.filter(payRun => {
    const matchesSearch = payRun.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payRun.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payRun.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pay runs or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('processing')}>Processing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>Confirmed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('failed')}>Failed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('held')}>Held</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('scheduled')}>Scheduled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pay Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Pay Run Monitor ({filteredPayRuns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Disbursements</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayRuns.map((payRun) => (
                <TableRow key={payRun.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{payRun.clientName}</p>
                      <p className="text-xs text-muted-foreground">{payRun.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payRun.payPeriod}</p>
                      <p className="text-xs text-muted-foreground">Due: {payRun.scheduledDate}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(payRun.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${payRun.amount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{payRun.employees}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={payRun.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">{payRun.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-xs">
                        <div className="flex items-center gap-1">
                          <span>ACH:</span>
                          {getDisbursementBadge(payRun.achStatus)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Tax:</span>
                          {getDisbursementBadge(payRun.taxStatus)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Vendor:</span>
                          {getDisbursementBadge(payRun.vendorStatus)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payRun.issues > 0 ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        {payRun.issues}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">0</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {payRun.status === 'failed' && (
                          <>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry Bank File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {payRun.status === 'held' && (
                          <>
                            <DropdownMenuItem>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unlock Batch
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {(payRun.status === 'processing' || payRun.status === 'scheduled') && (
                          <>
                            <DropdownMenuItem>
                              <Lock className="h-4 w-4 mr-2" />
                              Lock Batch
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="h-4 w-4 mr-2" />
                          Cancel/Void
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};