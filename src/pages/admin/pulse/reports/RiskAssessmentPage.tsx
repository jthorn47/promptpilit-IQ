import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { ArrowLeft, Download, FileText, AlertTriangle, TrendingUp, Users, Filter, Eye, Crown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { usePulseCases } from '@/modules/CaseManagement/hooks/usePulseCases';
import { PulseExportService } from '@/services/PulseExportService';
import { useToast } from '@/hooks/use-toast';
import { addDays, format as formatDate, parseISO, differenceInDays } from 'date-fns';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

interface RiskMetrics {
  totalCases: number;
  highRiskCases: number;
  averageRiskScore: number;
  repeatOffenders: number;
  riskMatrixData: Array<{
    caseType: string;
    riskScore: number;
    count: number;
    color: string;
  }>;
  clientLeaderboard: Array<{
    clientId: string;
    clientName: string;
    highRiskCases: number;
    totalCases: number;
    riskPercentage: number;
    avgRiskScore: number;
  }>;
  repeatOffendersList: Array<{
    employeeId: string;
    employeeName: string;
    caseCount: number;
    highRiskCases: number;
    departments: string[];
    latestCaseDate: string;
  }>;
  riskTrends: Array<{
    period: string;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  }>;
}

interface HighRiskCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  riskScore: number;
  assignedTeam: string;
  createdAt: string;
  clientName: string;
  employeesInvolved: string[];
  riskFactors: string[];
  daysOpen: number;
}

const RISK_COLORS = {
  critical: 'hsl(var(--destructive))',
  high: '#FF6B35',
  medium: '#F7931E',
  low: 'hsl(var(--chart-1))',
  safe: '#4CAF50'
};

const getRiskLevel = (score: number): string => {
  if (score >= 90) return 'critical';
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'safe';
};

const getRiskColor = (score: number): string => {
  const level = getRiskLevel(score);
  return RISK_COLORS[level as keyof typeof RISK_COLORS];
};

export const RiskAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');
  const [riskThreshold, setRiskThreshold] = useState<number>(80);
  const [isExporting, setIsExporting] = useState(false);

  const { cases, loading } = usePulseCases({
    dateRange: dateRange.from && dateRange.to ? {
      start: dateRange.from,
      end: dateRange.to
    } : undefined
  });

  // Calculate risk metrics
  const metrics = useMemo((): RiskMetrics => {
    if (!cases.length) {
      return {
        totalCases: 0,
        highRiskCases: 0,
        averageRiskScore: 0,
        repeatOffenders: 0,
        riskMatrixData: [],
        clientLeaderboard: [],
        repeatOffendersList: [],
        riskTrends: []
      };
    }

    // Filter cases based on filters
    let filteredCases = cases;
    
    if (clientFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.client_id === clientFilter);
    }
    
    if (caseTypeFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.type === caseTypeFilter);
    }

    // Calculate risk scores for cases (simplified algorithm)
    const casesWithRisk = filteredCases.map(c => {
      let riskScore = 40; // Base score
      
      // Priority impact
      if (c.priority === 'high') riskScore += 30;
      else if (c.priority === 'medium') riskScore += 15;
      
      // Age impact
      const daysOpen = differenceInDays(new Date(), new Date(c.created_at));
      if (daysOpen > 30) riskScore += 20;
      else if (daysOpen > 14) riskScore += 10;
      
      // Case type impact
      if (['compliance', 'safety', 'hr'].includes(c.type || '')) riskScore += 15;
      
      // Tags impact (legal sensitive cases)
      const hasLegalTags = c.tags?.some(tag => 
        ['harassment', 'discrimination', 'safety_violation', 'ada', 'fmla'].includes(tag.toLowerCase())
      );
      if (hasLegalTags) riskScore += 25;
      
      // Random variation for demo
      riskScore += Math.floor(Math.random() * 20) - 10;
      
      return {
        ...c,
        riskScore: Math.max(0, Math.min(100, riskScore))
      };
    });

    const highRiskCases = casesWithRisk.filter(c => c.riskScore >= riskThreshold);
    const averageRiskScore = casesWithRisk.length > 0 
      ? casesWithRisk.reduce((sum, c) => sum + c.riskScore, 0) / casesWithRisk.length 
      : 0;

    // Calculate repeat offenders (employees with 2+ cases)
    const employeeCaseMap = new Map<string, any[]>();
    casesWithRisk.forEach(c => {
      if (c.related_employees?.length) {
        c.related_employees.forEach(empId => {
          if (!employeeCaseMap.has(empId)) {
            employeeCaseMap.set(empId, []);
          }
          employeeCaseMap.get(empId)!.push(c);
        });
      }
    });

    const repeatOffendersList = Array.from(employeeCaseMap.entries())
      .filter(([_, cases]) => cases.length >= 2)
      .map(([employeeId, empCases]) => ({
        employeeId,
        employeeName: `Employee ${employeeId.slice(0, 8)}`,
        caseCount: empCases.length,
        highRiskCases: empCases.filter(c => c.riskScore >= riskThreshold).length,
        departments: [...new Set(empCases.map(c => c.assigned_team).filter(Boolean))],
        latestCaseDate: formatDate(
          new Date(Math.max(...empCases.map(c => new Date(c.created_at).getTime()))),
          'MMM dd, yyyy'
        )
      }))
      .sort((a, b) => b.caseCount - a.caseCount);

    // Risk matrix data (case type vs risk score)
    const typeRiskMap = new Map<string, {total: number, riskSum: number, highRisk: number}>();
    casesWithRisk.forEach(c => {
      const type = c.type || 'Unknown';
      if (!typeRiskMap.has(type)) {
        typeRiskMap.set(type, {total: 0, riskSum: 0, highRisk: 0});
      }
      const data = typeRiskMap.get(type)!;
      data.total++;
      data.riskSum += c.riskScore;
      if (c.riskScore >= riskThreshold) data.highRisk++;
    });

    const riskMatrixData = Array.from(typeRiskMap.entries()).map(([caseType, data]) => ({
      caseType,
      riskScore: data.riskSum / data.total,
      count: data.total,
      color: getRiskColor(data.riskSum / data.total)
    }));

    // Client leaderboard
    const clientRiskMap = new Map<string, {cases: any[], highRisk: number}>();
    casesWithRisk.forEach(c => {
      const clientId = c.client_id || 'Unknown';
      if (!clientRiskMap.has(clientId)) {
        clientRiskMap.set(clientId, {cases: [], highRisk: 0});
      }
      const data = clientRiskMap.get(clientId)!;
      data.cases.push(c);
      if (c.riskScore >= riskThreshold) data.highRisk++;
    });

    const clientLeaderboard = Array.from(clientRiskMap.entries())
      .map(([clientId, data]) => ({
        clientId,
        clientName: `Client ${clientId.slice(0, 8)}`,
        highRiskCases: data.highRisk,
        totalCases: data.cases.length,
        riskPercentage: (data.highRisk / data.cases.length) * 100,
        avgRiskScore: data.cases.reduce((sum, c) => sum + c.riskScore, 0) / data.cases.length
      }))
      .sort((a, b) => b.highRiskCases - a.highRiskCases)
      .slice(0, 10);

    // Risk trends (simplified - group by week)
    const riskTrends = Array.from({length: 4}, (_, i) => {
      const weekStart = addDays(new Date(), -((4-i) * 7));
      const weekEnd = addDays(weekStart, 6);
      const weekCases = casesWithRisk.filter(c => {
        const caseDate = new Date(c.created_at);
        return caseDate >= weekStart && caseDate <= weekEnd;
      });
      
      return {
        period: `Week ${i + 1}`,
        highRisk: weekCases.filter(c => c.riskScore >= 80).length,
        mediumRisk: weekCases.filter(c => c.riskScore >= 60 && c.riskScore < 80).length,
        lowRisk: weekCases.filter(c => c.riskScore < 60).length
      };
    });

    return {
      totalCases: casesWithRisk.length,
      highRiskCases: highRiskCases.length,
      averageRiskScore,
      repeatOffenders: repeatOffendersList.length,
      riskMatrixData,
      clientLeaderboard,
      repeatOffendersList,
      riskTrends
    };
  }, [cases, clientFilter, caseTypeFilter, riskThreshold]);

  // High-risk cases for detailed table
  const highRiskCases = useMemo((): HighRiskCase[] => {
    if (!cases.length) return [];

    let filteredCases = cases;
    
    if (clientFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.client_id === clientFilter);
    }
    
    if (caseTypeFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.type === caseTypeFilter);
    }

    return filteredCases
      .map(c => {
        // Calculate risk score (same logic as above)
        let riskScore = 40;
        if (c.priority === 'high') riskScore += 30;
        else if (c.priority === 'medium') riskScore += 15;
        
        const daysOpen = differenceInDays(new Date(), new Date(c.created_at));
        if (daysOpen > 30) riskScore += 20;
        else if (daysOpen > 14) riskScore += 10;
        
        if (['compliance', 'safety', 'hr'].includes(c.type || '')) riskScore += 15;
        
        const hasLegalTags = c.tags?.some(tag => 
          ['harassment', 'discrimination', 'safety_violation'].includes(tag.toLowerCase())
        );
        if (hasLegalTags) riskScore += 25;
        
        riskScore += Math.floor(Math.random() * 20) - 10;
        riskScore = Math.max(0, Math.min(100, riskScore));

        return {
          id: c.id,
          title: c.title,
          type: c.type || 'Unknown',
          priority: c.priority,
          riskScore,
          assignedTeam: c.assigned_team || 'Unassigned',
          createdAt: formatDate(new Date(c.created_at), 'MMM dd, yyyy'),
          clientName: `Client ${c.client_id?.slice(0, 8) || 'Unknown'}`,
          employeesInvolved: c.related_employees?.slice(0, 2) || [],
          riskFactors: [
            ...(c.priority === 'high' ? ['High Priority'] : []),
            ...(daysOpen > 30 ? ['Long Duration'] : []),
            ...(hasLegalTags ? ['Legal Sensitivity'] : []),
            ...(c.type === 'compliance' ? ['Compliance Issue'] : [])
          ],
          daysOpen
        };
      })
      .filter(c => c.riskScore >= riskThreshold)
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [cases, clientFilter, caseTypeFilter, riskThreshold]);

  // Get unique values for filters
  const caseTypes = useMemo(() => {
    const types = [...new Set(cases.map(c => c.type).filter(Boolean))];
    return types.sort();
  }, [cases]);

  const clients = useMemo(() => {
    const clientIds = [...new Set(cases.map(c => c.client_id).filter(Boolean))];
    return clientIds;
  }, [cases]);

  const handleExport = async (format: 'pdf' | 'csv' | 'print') => {
    setIsExporting(true);
    try {
      if (format === 'print') {
        window.print();
        setIsExporting(false);
        return;
      }

      const reportData = {
        title: 'Risk Assessment Report',
        dateRange: `${formatDate(dateRange.from!, 'MMM dd, yyyy')} - ${formatDate(dateRange.to!, 'MMM dd, yyyy')}`,
        metrics: {
          totalCases: metrics.totalCases,
          highRiskCases: metrics.highRiskCases,
          averageRiskScore: metrics.averageRiskScore,
          repeatOffenders: metrics.repeatOffenders,
          // Required fields for PulseMetrics
          openCases: cases.filter(c => c.status === 'open').length,
          inProgressCases: cases.filter(c => c.status === 'in_progress').length,
          closedCases: cases.filter(c => c.status === 'closed').length,
          overdueCount: 0,
          criticalCount: cases.filter(c => c.priority === 'high').length,
          avgResolutionTime: 0,
          performanceScore: metrics.averageRiskScore,
          complianceScore: 100 - metrics.averageRiskScore,
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          totalHours: 0,
          billableHours: 0
        },
        charts: {
          caseResolutionTrend: metrics.riskTrends.map(item => ({
            name: item.period,
            value: item.highRisk + item.mediumRisk + item.lowRisk
          })),
          departmentBreakdown: metrics.riskMatrixData.map(item => ({
            name: item.caseType,
            value: item.count
          })),
          taskCompletionRate: [],
          resourceUtilization: [],
          riskAssessment: [],
          performanceMetrics: []
        },
        tables: {
          topPerformers: [],
          highRiskCases: highRiskCases.map(c => ({
            id: c.id.slice(0, 8),
            title: c.title,
            priority: c.priority,
            daysOpen: c.daysOpen,
            assignee: c.assignedTeam
          }))
        }
      };

      const exportOptions = {
        format: format as 'pdf' | 'csv',
        includeMetrics: true,
        includeCharts: true,
        includeTables: true,
        pageOrientation: 'landscape' as const,
        customStyling: {
          headerColor: 'hsl(var(--destructive))',
          accentColor: 'hsl(var(--warning))'
        }
      };

      await PulseExportService.exportReport(reportData, format, exportOptions);
      
      toast({
        title: "Export Successful",
        description: `Risk assessment exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export risk assessment",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <StandardPageLayout
        title="Risk Assessment"
        subtitle="Loading risk assessment data..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-destructive"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Risk Assessment"
      subtitle="Strategic risk monitoring and pattern detection"
      headerActions={
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/pulse/reports')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('print')}
            disabled={isExporting}
          >
            <Eye className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      }
    >

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Risk Assessment Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <CalendarDateRangePicker
              value={{ from: dateRange.from, to: dateRange.to }}
              onValueChange={(value) => setDateRange({ from: value?.from, to: value?.to })}
            />
            
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(clientId => (
                  <SelectItem key={clientId} value={clientId}>Client {clientId?.slice(0, 8)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {caseTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskThreshold.toString()} onValueChange={(value) => setRiskThreshold(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">Critical (90+)</SelectItem>
                <SelectItem value="80">High Risk (80+)</SelectItem>
                <SelectItem value="70">Medium Risk (70+)</SelectItem>
                <SelectItem value="60">Low Risk (60+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Alert */}
      {metrics.highRiskCases > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Executive Risk Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-semibold text-destructive">{metrics.highRiskCases}</span> high-risk cases 
              detected requiring immediate executive attention. 
              <span className="font-semibold ml-2">{metrics.repeatOffenders}</span> repeat offenders identified.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.highRiskCases}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalCases > 0 ? ((metrics.highRiskCases / metrics.totalCases) * 100).toFixed(1) : 0}% of total cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getRiskColor(metrics.averageRiskScore) }}>
              {metrics.averageRiskScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk level: {getRiskLevel(metrics.averageRiskScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Offenders</CardTitle>
            <Users className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.repeatOffenders}
            </div>
            <p className="text-xs text-muted-foreground">
              Employees with 2+ cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalCases}
            </div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Matrix by Case Type</CardTitle>
            <CardDescription>Case types plotted by risk score and volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="riskScore" name="Risk Score" />
                  <YAxis dataKey="count" name="Case Count" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{data.caseType}</p>
                            <p>Risk Score: {data.riskScore.toFixed(1)}</p>
                            <p>Cases: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={metrics.riskMatrixData}>
                    {metrics.riskMatrixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Trends</CardTitle>
            <CardDescription>Risk distribution over time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="highRisk" stackId="a" fill={RISK_COLORS.high} name="High Risk" />
                  <Bar dataKey="mediumRisk" stackId="a" fill={RISK_COLORS.medium} name="Medium Risk" />
                  <Bar dataKey="lowRisk" stackId="a" fill={RISK_COLORS.low} name="Low Risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Risk Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-warning" />
            <CardTitle>Client Risk Leaderboard</CardTitle>
            <CardDescription>Clients ranked by high-risk activity</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>High-Risk Cases</TableHead>
                  <TableHead>Total Cases</TableHead>
                  <TableHead>Risk %</TableHead>
                  <TableHead>Avg Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.clientLeaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.clientLeaderboard.map((client, index) => (
                    <TableRow key={client.clientId} className={index < 3 ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        <div className="flex items-center">
                          {index === 0 && <Crown className="h-4 w-4 text-yellow-500 mr-1" />}
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{client.clientName}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {client.highRiskCases}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.totalCases}</TableCell>
                      <TableCell>
                        <Badge variant={client.riskPercentage > 50 ? 'destructive' : 'secondary'}>
                          {client.riskPercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: getRiskColor(client.avgRiskScore) }} className="font-semibold">
                          {client.avgRiskScore.toFixed(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Repeat Offenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Repeat Offenders</CardTitle>
          <CardDescription>Employees involved in multiple cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Total Cases</TableHead>
                  <TableHead>High-Risk Cases</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Latest Case</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.repeatOffendersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No repeat offenders found
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.repeatOffendersList.map((employee) => (
                    <TableRow key={employee.employeeId} className="bg-warning/5">
                      <TableCell className="font-medium">{employee.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {employee.caseCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.highRiskCases > 0 ? 'destructive' : 'secondary'}>
                          {employee.highRiskCases}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {employee.departments.slice(0, 2).map(dept => (
                            <Badge key={dept} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                          {employee.departments.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{employee.departments.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{employee.latestCaseDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* High-Risk Cases Details */}
      <Card>
        <CardHeader>
          <CardTitle>High-Risk Cases Detail</CardTitle>
          <CardDescription>Cases above risk threshold requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Risk Factors</TableHead>
                  <TableHead>Days Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No high-risk cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  highRiskCases.map((caseItem) => (
                    <TableRow key={caseItem.id} className="bg-destructive/5">
                      <TableCell className="font-mono text-xs">
                        {caseItem.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">{caseItem.title}</TableCell>
                      <TableCell>{caseItem.type}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="destructive"
                          style={{ backgroundColor: getRiskColor(caseItem.riskScore) }}
                        >
                          {caseItem.riskScore}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          caseItem.priority === 'high' ? 'destructive' : 
                          caseItem.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {caseItem.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{caseItem.clientName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {caseItem.riskFactors.slice(0, 2).map((factor) => (
                            <Badge key={factor} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                          {caseItem.riskFactors.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{caseItem.riskFactors.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={caseItem.daysOpen > 30 ? 'destructive' : 'outline'}>
                          {caseItem.daysOpen}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};