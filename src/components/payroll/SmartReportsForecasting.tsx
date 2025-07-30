import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Eye,
  Target,
  AlertTriangle,
  FileText,
  BarChart3,
  Building2,
  MapPin
} from "lucide-react";

interface TaxThreshold {
  tax_type: string;
  description: string;
  threshold_amount: number;
  current_amount: number;
  percentage_used: number;
  projected_hit_date?: string;
  employees_affected: number;
}

interface PayrollBreakdown {
  category: string;
  current_period: number;
  previous_period: number;
  ytd_amount: number;
  budget_vs_actual: number;
  trend: 'up' | 'down' | 'stable';
}

interface ForecastData {
  period: string;
  projected_gross: number;
  projected_net: number;
  projected_taxes: number;
  confidence: number;
}

interface SmartReportsForecastingProps {
  companyId?: string;
  timeRange?: string;
}

export const SmartReportsForecasting: React.FC<SmartReportsForecastingProps> = ({
  companyId,
  timeRange = 'current_quarter'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  // Mock data - would be fetched from APIs
  const taxThresholds: TaxThreshold[] = [
    {
      tax_type: 'FUTA',
      description: 'Federal Unemployment Tax Act',
      threshold_amount: 7000,
      current_amount: 5200,
      percentage_used: 74,
      projected_hit_date: '2024-03-15',
      employees_affected: 3
    },
    {
      tax_type: 'SUTA CA',
      description: 'State Unemployment Tax - California',
      threshold_amount: 7000,
      current_amount: 4800,
      percentage_used: 69,
      employees_affected: 5
    },
    {
      tax_type: 'SDI CA',
      description: 'State Disability Insurance - California',
      threshold_amount: 153164,
      current_amount: 45000,
      percentage_used: 29,
      employees_affected: 12
    }
  ];

  const payrollBreakdowns: PayrollBreakdown[] = [
    {
      category: 'Gross Wages',
      current_period: 245000,
      previous_period: 238000,
      ytd_amount: 980000,
      budget_vs_actual: 102,
      trend: 'up'
    },
    {
      category: 'Federal Taxes',
      current_period: 49000,
      previous_period: 47600,
      ytd_amount: 196000,
      budget_vs_actual: 98,
      trend: 'up'
    },
    {
      category: 'State Taxes',
      current_period: 14700,
      previous_period: 14280,
      ytd_amount: 58800,
      budget_vs_actual: 105,
      trend: 'up'
    },
    {
      category: 'Benefits',
      current_period: 36750,
      previous_period: 35700,
      ytd_amount: 147000,
      budget_vs_actual: 95,
      trend: 'stable'
    },
    {
      category: 'Net Pay',
      current_period: 144550,
      previous_period: 140420,
      ytd_amount: 578200,
      budget_vs_actual: 103,
      trend: 'up'
    }
  ];

  const forecastData: ForecastData[] = [
    { period: 'Mar 2024', projected_gross: 251000, projected_net: 148000, projected_taxes: 65000, confidence: 92 },
    { period: 'Apr 2024', projected_gross: 248000, projected_net: 146000, projected_taxes: 64000, confidence: 88 },
    { period: 'May 2024', projected_gross: 253000, projected_net: 149000, projected_taxes: 66000, confidence: 85 },
    { period: 'Jun 2024', projected_gross: 255000, projected_net: 150000, projected_taxes: 67000, confidence: 82 }
  ];

  const departments = ['All Departments', 'Engineering', 'Sales', 'Marketing', 'Operations', 'HR'];
  const states = ['All States', 'California', 'New York', 'Texas', 'Florida'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground rotate-90" />;
    }
  };

  const downloadReport = (reportType: string) => {
    // Mock download functionality
    const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log(`Downloading ${fileName}`);
    // In real implementation, would call API to generate and download report
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Smart Reports & Forecasting</h2>
          <p className="text-muted-foreground">Visual breakdowns, forecasts, and HALO insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept.toLowerCase().replace(' ', '_')}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {states.map(state => (
                <SelectItem key={state} value={state.toLowerCase().replace(' ', '_')}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
          <TabsTrigger value="thresholds">Tax Thresholds</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Period</p>
                    <p className="text-2xl font-bold">{formatCurrency(245000)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">YTD Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(980000)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-2xl font-bold">47</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Forecast</p>
                    <p className="text-2xl font-bold">{formatCurrency(251000)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Download Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => downloadReport('payroll_summary')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Payroll Summary
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => downloadReport('tax_liability')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tax Liability
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => downloadReport('halo_insights')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  HALO Insights
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Department Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Engineering</span>
                    <span className="text-sm font-medium">{formatCurrency(98000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sales</span>
                    <span className="text-sm font-medium">{formatCurrency(76000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Operations</span>
                    <span className="text-sm font-medium">{formatCurrency(71000)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">State Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">California</span>
                    <span className="text-sm font-medium">{formatCurrency(147000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New York</span>
                    <span className="text-sm font-medium">{formatCurrency(68000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Texas</span>
                    <span className="text-sm font-medium">{formatCurrency(30000)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdowns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payroll Category Breakdown</CardTitle>
                <Button variant="outline" size="sm" onClick={() => downloadReport('detailed_breakdown')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollBreakdowns.map((breakdown, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(breakdown.trend)}
                      <div>
                        <div className="font-medium">{breakdown.category}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: {formatCurrency(breakdown.current_period)} | 
                          Previous: {formatCurrency(breakdown.previous_period)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(breakdown.ytd_amount)}</div>
                      <div className="text-sm">
                        <Badge variant={breakdown.budget_vs_actual >= 100 ? 'secondary' : 'default'}>
                          {breakdown.budget_vs_actual}% of budget
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tax Threshold Tracking</CardTitle>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Set Alerts
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxThresholds.map((threshold, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium">{threshold.tax_type}</div>
                          <div className="text-sm text-muted-foreground">{threshold.description}</div>
                        </div>
                        <Badge variant={threshold.percentage_used >= 80 ? 'destructive' : threshold.percentage_used >= 60 ? 'secondary' : 'default'}>
                          {threshold.percentage_used}% Used
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {formatCurrency(threshold.current_amount)} / {formatCurrency(threshold.threshold_amount)}</span>
                          <span>{threshold.employees_affected} employees</span>
                        </div>
                        <Progress value={threshold.percentage_used} className="h-2" />
                        {threshold.projected_hit_date && (
                          <div className="text-xs text-red-600">
                            Projected threshold hit: {new Date(threshold.projected_hit_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payroll Forecasting</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Methodology
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium">{forecast.period}</div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {forecast.confidence}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Gross</div>
                        <div className="font-medium">{formatCurrency(forecast.projected_gross)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Taxes</div>
                        <div className="font-medium">{formatCurrency(forecast.projected_taxes)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Net</div>
                        <div className="font-medium">{formatCurrency(forecast.projected_net)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};