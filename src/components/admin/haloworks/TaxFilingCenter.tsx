import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Upload,
  RefreshCw,
  Edit,
  DollarSign
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

interface TaxFiling {
  id: string;
  clientName: string;
  clientId: string;
  formType: string;
  quarter: string;
  year: number;
  dueDate: string;
  status: 'due' | 'filed' | 'failed' | 'amended' | 'processing';
  filingMethod: 'e-file' | 'manual' | 'third-party';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  filedDate?: string;
  errors?: string[];
}

export const TaxFilingCenter = () => {
  // Mock tax filing data
  const taxFilings: TaxFiling[] = [
    {
      id: 'tf_001',
      clientName: 'TechFlow Solutions',
      clientId: 'cl_001',
      formType: '941',
      quarter: 'Q4',
      year: 2023,
      dueDate: '2024-01-31',
      status: 'filed',
      filingMethod: 'e-file',
      amount: 15750,
      paymentStatus: 'paid',
      filedDate: '2024-01-25'
    },
    {
      id: 'tf_002',
      clientName: 'Green Valley Manufacturing',
      clientId: 'cl_002',
      formType: '940',
      quarter: 'Annual',
      year: 2023,
      dueDate: '2024-01-31',
      status: 'processing',
      filingMethod: 'e-file',
      amount: 8420,
      paymentStatus: 'pending'
    },
    {
      id: 'tf_003',
      clientName: 'Sunrise Healthcare',
      clientId: 'cl_003',
      formType: '941',
      quarter: 'Q4',
      year: 2023,
      dueDate: '2024-01-31',
      status: 'failed',
      filingMethod: 'e-file',
      amount: 22100,
      paymentStatus: 'failed',
      errors: ['Invalid SSN format for employee #12', 'Missing wage allocation data']
    },
    {
      id: 'tf_004',
      clientName: 'Metro Construction LLC',
      clientId: 'cl_004',
      formType: 'W-2s',
      quarter: 'Annual',
      year: 2023,
      dueDate: '2024-01-31',
      status: 'due',
      filingMethod: 'e-file',
      amount: 0,
      paymentStatus: 'paid'
    }
  ];

  const getStatusBadge = (status: TaxFiling['status']) => {
    switch (status) {
      case 'filed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Filed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'amended':
        return <Badge className="bg-yellow-100 text-yellow-800"><Edit className="h-3 w-3 mr-1" />Amended</Badge>;
      case 'due':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: TaxFiling['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFilingMethodBadge = (method: TaxFiling['filingMethod']) => {
    const colors = {
      'e-file': 'bg-blue-100 text-blue-800',
      'manual': 'bg-gray-100 text-gray-800',
      'third-party': 'bg-purple-100 text-purple-800'
    };
    
    return <Badge className={colors[method]}>{method === 'e-file' ? 'E-File' : method === 'third-party' ? 'Third Party' : 'Manual'}</Badge>;
  };

  // Calculate summary stats
  const totalForms = taxFilings.length;
  const dueForms = taxFilings.filter(f => f.status === 'due').length;
  const failedForms = taxFilings.filter(f => f.status === 'failed').length;
  const totalTaxAmount = taxFilings.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Forms</p>
                <p className="text-2xl font-bold">{totalForms}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Forms</p>
                <p className="text-2xl font-bold text-orange-600">{dueForms}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Forms</p>
                <p className="text-2xl font-bold text-red-600">{failedForms}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tax Liability</p>
                <p className="text-2xl font-bold">${(totalTaxAmount / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Filing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tax Filing Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Form Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filing Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxFilings.map((filing) => (
                <TableRow key={filing.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{filing.clientName}</p>
                      <p className="text-xs text-muted-foreground">{filing.clientId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{filing.formType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{filing.quarter}</p>
                      <p className="text-xs text-muted-foreground">{filing.year}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{filing.dueDate}</span>
                      {new Date(filing.dueDate) < new Date() && filing.status !== 'filed' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(filing.status)}
                      {filing.filedDate && (
                        <p className="text-xs text-muted-foreground">Filed: {filing.filedDate}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getFilingMethodBadge(filing.filingMethod)}</TableCell>
                  <TableCell>
                    {filing.amount > 0 ? (
                      <span className="font-medium">${filing.amount.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{getPaymentBadge(filing.paymentStatus)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                        {filing.status === 'failed' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry Filing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Corrected File
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Switch to Manual Filing
                            </DropdownMenuItem>
                          </>
                        )}
                        {filing.status === 'filed' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Trigger Amendment
                            </DropdownMenuItem>
                          </>
                        )}
                        {filing.status === 'due' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              File Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Switch Filing Method
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          View Tax Payments
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Download Forms
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

      {/* Error Details for Failed Forms */}
      {taxFilings.some(f => f.status === 'failed' && f.errors) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Filing Errors Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxFilings
                .filter(f => f.status === 'failed' && f.errors)
                .map((filing) => (
                  <div key={filing.id} className="border-l-4 border-l-red-500 pl-4 bg-red-50 p-4 rounded-r">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{filing.clientName} - {filing.formType}</h4>
                      <Badge variant="destructive">Failed</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-red-700">
                      {filing.errors?.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Corrected File
                      </Button>
                      <Button size="sm" variant="outline">
                        Switch to Manual
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};