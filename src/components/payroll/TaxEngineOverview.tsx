import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  MapPin, 
  Building, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useTaxEngineData } from '@/hooks/useTaxEngineData';

interface TaxEngineStats {
  totalJurisdictions: number;
  employeesWithMultiState: number;
  activeNexusStates: number;
  totalTaxWithheld: number;
}

interface ComplianceAlert {
  id: string;
  type: 'missing_nexus' | 'threshold_exceeded' | 'incomplete_setup' | 'upcoming_filing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  jurisdiction: string;
  affectedEmployees: number;
  dueDate?: string;
}


const mockAlerts: ComplianceAlert[] = [
  {
    id: '1',
    type: 'missing_nexus',
    severity: 'high',
    message: 'Nexus threshold exceeded in Texas',
    jurisdiction: 'TX',
    affectedEmployees: 12,
    dueDate: '2024-02-15'
  },
  {
    id: '2',
    type: 'upcoming_filing',
    severity: 'medium',
    message: 'Q4 withholding returns due',
    jurisdiction: 'CA',
    affectedEmployees: 28,
    dueDate: '2024-01-31'
  },
  {
    id: '3',
    type: 'incomplete_setup',
    severity: 'medium',
    message: 'Missing reciprocity agreement configuration',
    jurisdiction: 'NY-NJ',
    affectedEmployees: 8
  }
];

export const TaxEngineOverview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  
  const { stats, isLoading, error, refetch } = useTaxEngineData(clientId || undefined);
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'missing_nexus': return <Building className="h-4 w-4" />;
      case 'threshold_exceeded': return <TrendingUp className="h-4 w-4" />;
      case 'incomplete_setup': return <AlertTriangle className="h-4 w-4" />;
      case 'upcoming_filing': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Tax Data</h3>
        <p className="text-muted-foreground mb-4">
          Failed to load tax engine data. Please try again.
        </p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Engine Overview</h2>
          <p className="text-muted-foreground">
            Multi-state and international tax compliance dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Phase 2 Module
          </Badge>
          {isLoading && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading Data
            </Badge>
          )}
          {!clientId && (
            <Badge variant="destructive">
              Client Required
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jurisdictions</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalJurisdictions}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique state/local tax authorities
                </p>
              </div>
              <Globe className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Multi-State Employees</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.employeesWithMultiState}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Employees across multiple states
                </p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Nexus States</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeNexusStates}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  States with tax registrations
                </p>
              </div>
              <MapPin className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tax Withheld YTD</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `$${stats.totalTaxWithheld.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}`
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aggregated across all tax types
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{alert.message}</h4>
                    <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Jurisdiction: {alert.jurisdiction}</span>
                    <span className="mx-2">•</span>
                    <span>{alert.affectedEmployees} employees affected</span>
                    {alert.dueDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Due: {alert.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Cards */}
      {!clientId && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900">Client Selection Required</h3>
                <p className="text-sm text-orange-700">
                  Please select a client to view their tax engine data and calculations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {clientId && !isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Data Source</p>
                <p className="text-lg font-bold text-green-600">Live Payroll Engine</p>
                <p className="text-xs text-muted-foreground mt-1">Real-time calculations</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Calculation Status</p>
                <p className="text-lg font-bold text-blue-600">Active</p>
                <p className="text-xs text-muted-foreground mt-1">Backend processing enabled</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Building className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">Integration Ready</p>
                <p className="text-lg font-bold text-purple-600">Tax Engines</p>
                <p className="text-xs text-muted-foreground mt-1">Available for connection</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};