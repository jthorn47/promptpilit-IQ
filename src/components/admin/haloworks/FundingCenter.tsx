import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingDown,
  Building2,
  Calendar
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FundingStatus {
  clientId: string;
  clientName: string;
  fundingMethod: 'ACH' | 'Wire' | 'Check' | 'Manual';
  lastDeposit: string;
  lastDepositAmount: number;
  confirmationStatus: 'confirmed' | 'pending' | 'delayed' | 'missing';
  reserveBuffer: number;
  bufferStatus: 'healthy' | 'low' | 'critical';
  nextPayrollAmount: number;
  nextPayrollDate: string;
  alerts: string[];
}

export const FundingCenter = () => {
  // Mock funding data
  const fundingStatuses: FundingStatus[] = [
    {
      clientId: 'cl_001',
      clientName: 'TechFlow Solutions',
      fundingMethod: 'ACH',
      lastDeposit: '2024-01-15',
      lastDepositAmount: 150000,
      confirmationStatus: 'confirmed',
      reserveBuffer: 75000,
      bufferStatus: 'healthy',
      nextPayrollAmount: 125000,
      nextPayrollDate: '2024-01-31',
      alerts: []
    },
    {
      clientId: 'cl_002',
      clientName: 'Green Valley Manufacturing',
      fundingMethod: 'Wire',
      lastDeposit: '2024-01-14',
      lastDepositAmount: 320000,
      confirmationStatus: 'delayed',
      reserveBuffer: 45000,
      bufferStatus: 'low',
      nextPayrollAmount: 287500,
      nextPayrollDate: '2024-01-31',
      alerts: ['Delayed confirmation', 'Low reserve buffer']
    },
    {
      clientId: 'cl_003',
      clientName: 'Sunrise Healthcare',
      fundingMethod: 'ACH',
      lastDeposit: '2024-01-10',
      lastDepositAmount: 200000,
      confirmationStatus: 'missing',
      reserveBuffer: 15000,
      bufferStatus: 'critical',
      nextPayrollAmount: 189000,
      nextPayrollDate: '2024-01-31',
      alerts: ['Missing funding', 'Critical buffer shortfall']
    },
    {
      clientId: 'cl_004',
      clientName: 'Metro Construction LLC',
      fundingMethod: 'ACH',
      lastDeposit: '2024-01-16',
      lastDepositAmount: 175000,
      confirmationStatus: 'pending',
      reserveBuffer: 55000,
      bufferStatus: 'healthy',
      nextPayrollAmount: 156000,
      nextPayrollDate: '2024-01-31',
      alerts: []
    }
  ];

  const getConfirmationBadge = (status: FundingStatus['confirmationStatus']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'delayed':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Delayed</Badge>;
      case 'missing':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Missing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBufferBadge = (status: FundingStatus['bufferStatus']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFundingMethodBadge = (method: FundingStatus['fundingMethod']) => {
    const colors = {
      ACH: 'bg-blue-100 text-blue-800',
      Wire: 'bg-purple-100 text-purple-800',
      Check: 'bg-gray-100 text-gray-800',
      Manual: 'bg-orange-100 text-orange-800'
    };
    
    return <Badge className={colors[method]}>{method}</Badge>;
  };

  // Calculate summary stats
  const totalClients = fundingStatuses.length;
  const fundingIssues = fundingStatuses.filter(f => f.confirmationStatus === 'missing' || f.confirmationStatus === 'delayed').length;
  const bufferIssues = fundingStatuses.filter(f => f.bufferStatus === 'low' || f.bufferStatus === 'critical').length;
  const totalReserves = fundingStatuses.reduce((sum, f) => sum + f.reserveBuffer, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Funding Issues</p>
                <p className="text-2xl font-bold text-red-600">{fundingIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buffer Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{bufferIssues}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reserves</p>
                <p className="text-2xl font-bold">${(totalReserves / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Client Funding Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Funding Method</TableHead>
                <TableHead>Last Deposit</TableHead>
                <TableHead>Confirmation</TableHead>
                <TableHead>Reserve Buffer</TableHead>
                <TableHead>Next Payroll</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundingStatuses.map((funding) => (
                <TableRow key={funding.clientId} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{funding.clientName}</p>
                      <p className="text-xs text-muted-foreground">{funding.clientId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getFundingMethodBadge(funding.fundingMethod)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">${funding.lastDepositAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{funding.lastDeposit}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getConfirmationBadge(funding.confirmationStatus)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${funding.reserveBuffer.toLocaleString()}</span>
                        {getBufferBadge(funding.bufferStatus)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coverage: {Math.round((funding.reserveBuffer / funding.nextPayrollAmount) * 100)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">${funding.nextPayrollAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{funding.nextPayrollDate}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {funding.alerts.length > 0 ? (
                      <div className="space-y-1">
                        {funding.alerts.map((alert, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-green-600">No Issues</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {funding.alerts.length > 0 && (
                        <Button size="sm" variant="destructive">
                          Resolve
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
    </div>
  );
};