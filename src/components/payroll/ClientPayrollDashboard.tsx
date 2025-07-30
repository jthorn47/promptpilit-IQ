import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCorePayrollEngine } from "@/domains/payroll/hooks/useCorePayrollEngine";
import { EngineStatusIndicator } from "@/components/payroll/EngineStatusIndicator";
import { HALORiskPanel } from "@/components/payroll/HALORiskPanel";
import { PreflightSimulation } from "@/components/payroll/PreflightSimulation";
import { SmartReportsForecasting } from "@/components/payroll/SmartReportsForecasting";
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Bell,
  Calendar,
  Activity,
  Target,
  Zap
} from "lucide-react";

interface HALORiskScore {
  score: number;
  level: 'low' | 'medium' | 'high';
  lastUpdated: string;
  factors: string[];
}

interface PayrollForecast {
  currentMonth: {
    projected: number;
    confidence: number;
  };
  nextMonth: {
    projected: number;
    confidence: number;
  };
}

interface SmartAlert {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  actionable: boolean;
  timestamp: string;
}

interface PayRunSummary {
  lastRunDate: string;
  totalAmount: number;
  employeeCount: number;
  deltas: Array<{
    category: string;
    change: number;
    isIncrease: boolean;
  }>;
}

export const ClientPayrollDashboard = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const payrollEngine = useCorePayrollEngine();
  const [activeView, setActiveView] = useState<'dashboard' | 'preflight' | 'reports'>('dashboard');
  
  // Mock data - would be fetched from APIs in real implementation
  const [haloRisk, setHaloRisk] = useState<HALORiskScore>({
    score: 85,
    level: 'low',
    lastUpdated: new Date().toISOString(),
    factors: ['Tax compliance up to date', 'Employee data verified', 'No overtime anomalies']
  });

  const [forecast, setForecast] = useState<PayrollForecast>({
    currentMonth: { projected: 245000, confidence: 92 },
    nextMonth: { projected: 251000, confidence: 88 }
  });

  const [alerts, setAlerts] = useState<SmartAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'FUTA Cap Approaching',
      message: '3 employees nearing FUTA wage cap for 2024',
      actionable: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2', 
      type: 'info',
      title: 'Tax Filing Due',
      message: 'Q4 941 filing due in 12 days',
      actionable: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [lastPayRun, setLastPayRun] = useState<PayRunSummary>({
    lastRunDate: '2024-01-15',
    totalAmount: 122500,
    employeeCount: 47,
    deltas: [
      { category: 'Overtime', change: 1200, isIncrease: true },
      { category: 'Benefits', change: -150, isIncrease: false },
      { category: 'Bonuses', change: 2500, isIncrease: true }
    ]
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';  
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header with Engine Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payroll Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Strategic payroll insights and control</p>
        </div>
        <div className="flex items-center gap-3">
          <EngineStatusIndicator engineSource={payrollEngine.isMockMode ? 'mock' : 'taxiq'} />
          <Button onClick={() => navigate('/admin/payroll/processing')} className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Top Row: HALO Risk Score & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HALO Risk Score Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${getRiskColor(haloRisk.level)}`} />
              HALO Risk Score
              <Badge variant={getRiskBadgeVariant(haloRisk.level)} className="ml-auto">
                {haloRisk.level.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>Real-time payroll risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getRiskColor(haloRisk.level)}`}>
                  {haloRisk.score}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        haloRisk.level === 'low' ? 'bg-green-500' :
                        haloRisk.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${haloRisk.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {formatDate(haloRisk.lastUpdated)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {haloRisk.factors.slice(0, 3).map((factor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Payroll Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Payroll Forecast
            </CardTitle>
            <CardDescription>This month & next month projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(forecast.currentMonth.projected)}</p>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-muted-foreground">
                    {forecast.currentMonth.confidence}% confidence
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Next Month</p>
                <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(forecast.nextMonth.projected)}</p>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-muted-foreground">
                    {forecast.nextMonth.confidence}% confidence
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Smart Alerts & Last Pay Run */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Smart Alerts
              <Badge variant="secondary">{alerts.length}</Badge>
            </CardTitle>
            <CardDescription>Proactive notifications and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  {alert.actionable && (
                    <Button variant="outline" size="sm">
                      Fix
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Last Pay Run Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Last Pay Run
            </CardTitle>
            <CardDescription>{formatDate(lastPayRun.lastRunDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(lastPayRun.totalAmount)}</p>
                <p className="text-sm text-muted-foreground">{lastPayRun.employeeCount} employees</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Key Changes:</p>
                {lastPayRun.deltas.map((delta, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{delta.category}</span>
                    <span className={delta.isIncrease ? 'text-green-600' : 'text-red-600'}>
                      {delta.isIncrease ? '+' : ''}{formatCurrency(delta.change)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common payroll tasks and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/simulations')}
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Run Simulation</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/employees')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Employee Directory</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/reports')}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Reports & Insights</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/payroll/setup')}
            >
              <Clock className="h-6 w-6" />
              <span className="text-sm">Upcoming Tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};