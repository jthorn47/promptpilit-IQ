import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle,
  Calculator,
  XCircle,
  RefreshCw,
  Shield
} from 'lucide-react';

interface Conflict {
  id: string;
  type: 'duplicate_payment' | 'payroll_overlap' | 'insufficient_funds' | 'tax_calculation' | 'holiday_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId?: string;
  employeeName?: string;
  description: string;
  recommendation: string;
  detectedAt: string;
  resolved: boolean;
  runId?: string;
  payPeriod?: string;
  amount?: number;
}

const mockConflicts: Conflict[] = [
  {
    id: '1',
    type: 'duplicate_payment',
    severity: 'high',
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    description: 'Employee already received bonus payment in current pay period',
    recommendation: 'Review existing payments before processing duplicate bonus',
    detectedAt: '2024-01-16T10:30:00Z',
    resolved: false,
    runId: 'OC-2024-003',
    payPeriod: 'Jan 1-15, 2024',
    amount: 2500
  },
  {
    id: '2',
    type: 'payroll_overlap',
    severity: 'medium',
    description: 'Off-cycle run overlaps with scheduled regular payroll processing',
    recommendation: 'Schedule off-cycle run after regular payroll completion',
    detectedAt: '2024-01-16T09:15:00Z',
    resolved: true,
    runId: 'OC-2024-004',
    payPeriod: 'Jan 16-31, 2024'
  },
  {
    id: '3',
    type: 'tax_calculation',
    severity: 'critical',
    employeeId: 'EMP-005',
    employeeName: 'Sarah Wilson',
    description: 'Tax withholding calculation error due to YTD exceeding Social Security wage base',
    recommendation: 'Manually review tax calculations for high earners',
    detectedAt: '2024-01-15T14:20:00Z',
    resolved: false,
    amount: 5000
  },
  {
    id: '4',
    type: 'insufficient_funds',
    severity: 'critical',
    description: 'Payroll account balance insufficient for processing all payments',
    recommendation: 'Transfer additional funds or reduce payment amounts',
    detectedAt: '2024-01-16T11:45:00Z',
    resolved: false,
    runId: 'OC-2024-005',
    amount: 25000
  }
];

export const ConflictDetector: React.FC = () => {
  const [conflicts, setConflicts] = useState<Conflict[]>(mockConflicts);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved');
  const [isScanning, setIsScanning] = useState(false);

  const filteredConflicts = conflicts.filter(conflict => {
    switch (filter) {
      case 'unresolved':
        return !conflict.resolved;
      case 'critical':
        return conflict.severity === 'critical';
      default:
        return true;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'duplicate_payment': return 'Duplicate Payment';
      case 'payroll_overlap': return 'Payroll Overlap';
      case 'insufficient_funds': return 'Insufficient Funds';
      case 'tax_calculation': return 'Tax Calculation Error';
      case 'holiday_conflict': return 'Holiday Conflict';
      default: return type;
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate_payment': return <DollarSign className="h-4 w-4" />;
      case 'payroll_overlap': return <Calendar className="h-4 w-4" />;
      case 'insufficient_funds': return <AlertTriangle className="h-4 w-4" />;
      case 'tax_calculation': return <Calculator className="h-4 w-4" />;
      case 'holiday_conflict': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const runConflictScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      // In real implementation, this would trigger API call to detect conflicts
    }, 3000);
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(conflicts.map(conflict => 
      conflict.id === conflictId ? { ...conflict, resolved: true } : conflict
    ));
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

  const criticalCount = conflicts.filter(c => c.severity === 'critical' && !c.resolved).length;
  const unresolvedCount = conflicts.filter(c => !c.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conflict Detection & Resolution</h2>
          <p className="text-muted-foreground">
            Automatically detect and resolve payroll conflicts before processing
          </p>
        </div>
        <Button 
          onClick={runConflictScan}
          disabled={isScanning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Run Conflict Scan'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conflicts</p>
                <p className="text-2xl font-bold">{conflicts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold text-orange-600">{unresolvedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {conflicts.filter(c => c.resolved).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All Conflicts
        </Button>
        <Button
          variant={filter === 'unresolved' ? 'default' : 'outline'}
          onClick={() => setFilter('unresolved')}
          size="sm"
        >
          Unresolved ({unresolvedCount})
        </Button>
        <Button
          variant={filter === 'critical' ? 'default' : 'outline'}
          onClick={() => setFilter('critical')}
          size="sm"
        >
          Critical ({criticalCount})
        </Button>
      </div>

      {/* Critical Alert */}
      {criticalCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalCount} critical conflict{criticalCount !== 1 ? 's' : ''} detected!</strong>
            {' '}These must be resolved before processing any off-cycle payroll runs.
          </AlertDescription>
        </Alert>
      )}

      {/* Conflicts List */}
      <div className="space-y-4">
        {filteredConflicts.map((conflict) => (
          <Card key={conflict.id} className={`border-l-4 ${
            conflict.severity === 'critical' ? 'border-l-red-500' :
            conflict.severity === 'high' ? 'border-l-orange-500' :
            conflict.severity === 'medium' ? 'border-l-yellow-500' :
            'border-l-blue-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={getSeverityColor(conflict.severity)} className="flex items-center gap-1">
                      {getSeverityIcon(conflict.severity)}
                      {conflict.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getConflictTypeIcon(conflict.type)}
                      {getConflictTypeLabel(conflict.type)}
                    </Badge>
                    {conflict.resolved && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-semibold mb-2">{conflict.description}</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Recommendation</p>
                        <p className="text-sm text-blue-700">{conflict.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                    {conflict.employeeName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{conflict.employeeName}</span>
                      </div>
                    )}
                    {conflict.payPeriod && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{conflict.payPeriod}</span>
                      </div>
                    )}
                    {conflict.amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>${conflict.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Detected: {formatDate(conflict.detectedAt)}
                    {conflict.runId && (
                      <span className="ml-2">• Run: {conflict.runId}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!conflict.resolved && (
                    <Button
                      size="sm"
                      onClick={() => resolveConflict(conflict.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Resolved
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredConflicts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="font-semibold mb-2">No Conflicts Detected</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'All systems are clear for off-cycle payroll processing'
                  : `No ${filter} conflicts found`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auto-Resolution Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Automatic Conflict Prevention
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                The system automatically scans for conflicts before processing any off-cycle runs. 
                This includes checking for duplicate payments, overlapping payroll periods, 
                insufficient funds, and tax calculation errors.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time validation during run creation</li>
                <li>• Pre-processing conflict scans</li>
                <li>• Integration with regular payroll schedule</li>
                <li>• Automatic tax recalculation verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};