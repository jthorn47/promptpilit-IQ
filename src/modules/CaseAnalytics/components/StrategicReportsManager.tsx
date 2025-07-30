import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, 
  FileText, Download, Target, Clock, Zap, Award, ExternalLink 
} from 'lucide-react';
import { strategicAnalyticsService, TeamPerformanceMetrics, ClientAnalytics, CostAnalysis, StrategicInsights } from '../services/StrategicAnalyticsService';
import { CaseAnalyticsFilters } from '../types';
import { useToast } from '@/hooks/use-toast';

interface StrategicReportsManagerProps {
  companyId?: string;
}

export const StrategicReportsManager = ({ companyId }: StrategicReportsManagerProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(90);
  const [loading, setLoading] = useState(true);
  const [teamMetrics, setTeamMetrics] = useState<TeamPerformanceMetrics[]>([]);
  const [clientAnalytics, setClientAnalytics] = useState<ClientAnalytics[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [insights, setInsights] = useState<StrategicInsights | null>(null);
  const { toast } = useToast();

  const filters: CaseAnalyticsFilters = {
    companyId,
    dateRange: {
      start: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  };

  useEffect(() => {
    loadStrategicData();
  }, [companyId, dateRange]);

  const loadStrategicData = async () => {
    try {
      setLoading(true);
      const [team, clients, cost, strategicInsights] = await Promise.all([
        strategicAnalyticsService.getTeamPerformanceMetrics(filters),
        strategicAnalyticsService.getClientAnalytics(filters),
        strategicAnalyticsService.getCostAnalysis(filters),
        strategicAnalyticsService.getStrategicInsights(filters)
      ]);

      setTeamMetrics(team);
      setClientAnalytics(clients);
      setCostAnalysis(cost);
      setInsights(strategicInsights);
    } catch (error) {
      console.error('Error loading strategic data:', error);
      toast({
        title: "Error",
        description: "Failed to load strategic analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateClientPDF = async (clientId: string, clientName: string) => {
    try {
      const pdfBlob = await strategicAnalyticsService.generateClientSummaryPDF(clientId, filters);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${clientName}-service-summary.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Client summary PDF generated for ${clientName}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading strategic analytics...</div>;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Strategic Analytics</h2>
          <p className="text-muted-foreground">Operational insights and strategic reporting</p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold">{clientAnalytics.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {insights?.risingVolumeClients.length || 0} rising volume
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold">{teamMetrics.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {insights?.unbalancedWorkloads.length || 0} overloaded
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">${costAnalysis?.totalLaborCost.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      ${costAnalysis?.costPerCase.toFixed(0) || 0} per case
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High-Touch Clients</p>
                    <p className="text-2xl font-bold">{costAnalysis?.highTouchClients.length || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost by Case Type</CardTitle>
                <CardDescription>Labor cost distribution across case categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(costAnalysis?.costByType || {}).map(([type, cost]) => ({
                        name: type.replace('_', ' ').toUpperCase(),
                        value: cost
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(costAnalysis?.costByType || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Volume</CardTitle>
                <CardDescription>Clients with highest case volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientAnalytics.slice(0, 10).map(client => ({
                    name: client.companyName.substring(0, 15),
                    cases: client.activeCases,
                    cost: client.costToServe
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cases" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Analytics Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Performance Dashboard</CardTitle>
              <CardDescription>Detailed analytics for each client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientAnalytics.map((client) => (
                  <div key={client.companyId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{client.companyName}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{client.activeCases} active cases</span>
                          <span>{(client.avgResolutionTime / (1000 * 60 * 60)).toFixed(1)}h avg resolution</span>
                          <span>${client.costToServe.toLocaleString()} cost</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateClientPDF(client.companyId, client.companyName)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          QBR Report
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{client.activeCases}</p>
                        <p className="text-xs text-muted-foreground">Active Cases</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-500">{client.escalations}</p>
                        <p className="text-xs text-muted-foreground">Escalations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{client.idleCases}</p>
                        <p className="text-xs text-muted-foreground">Idle Cases</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{client.feedbackScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>

                    {client.caseVolumeGrowth > 20 && (
                      <div className="mt-4">
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Rising Volume: +{client.caseVolumeGrowth.toFixed(1)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Metrics</CardTitle>
                <CardDescription>Individual team member performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMetrics.map((member) => (
                    <div key={member.userId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{member.userName || member.userId}</h4>
                        <Badge variant={member.feedbackScore > 4 ? "default" : member.feedbackScore > 3 ? "secondary" : "destructive"}>
                          {member.feedbackScore.toFixed(1)}/5.0
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Cases Handled</p>
                          <p className="font-semibold">{member.totalCasesHandled}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Resolution</p>
                          <p className="font-semibold">{(member.averageResolutionTime / (1000 * 60 * 60)).toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">First Response</p>
                          <p className="font-semibold">{(member.averageFirstResponseTime / (1000 * 60 * 60)).toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">SLA Compliance</p>
                          <p className="font-semibold">{member.slaComplianceRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Team performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamMetrics.map(member => ({
                    name: member.userName?.substring(0, 10) || member.userId.substring(0, 8),
                    cases: member.totalCasesHandled,
                    score: member.feedbackScore
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cases" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-6">
          {costAnalysis && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Labor Cost</p>
                        <p className="text-2xl font-bold">${costAnalysis.totalLaborCost.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cost Per Case</p>
                        <p className="text-2xl font-bold">${costAnalysis.costPerCase.toFixed(0)}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">High-Touch Clients</p>
                        <p className="text-2xl font-bold">{costAnalysis.highTouchClients.length}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>High-Touch Clients Analysis</CardTitle>
                  <CardDescription>Clients requiring significant resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis.highTouchClients.map((client) => (
                      <div key={client.companyId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{client.companyName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {client.caseCount} cases • ${client.costPerCase.toFixed(0)} per case
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${client.totalCost.toLocaleString()}</p>
                          <Badge variant={
                            client.marginImpact === 'high' ? 'destructive' : 
                            client.marginImpact === 'medium' ? 'secondary' : 'default'
                          }>
                            {client.marginImpact} impact
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Strategic Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {insights && (
            <>
              {/* Performance Outliers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Top Performers
                    </CardTitle>
                    <CardDescription>Team members excelling in client service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.performanceOutliers.topPerformers.map((performer) => (
                        <div key={performer.userId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">{performer.userName || performer.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              {performer.totalCasesHandled} cases handled
                            </p>
                          </div>
                          <Badge variant="default">
                            {performer.feedbackScore.toFixed(1)}/5.0
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Needs Attention
                    </CardTitle>
                    <CardDescription>Team members who may need support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.performanceOutliers.needsAttention.map((member) => (
                        <div key={member.userId} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <p className="font-medium">{member.userName || member.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.totalCasesHandled} cases handled
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {member.feedbackScore.toFixed(1)}/5.0
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rising Volume Clients */}
              {insights.risingVolumeClients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      Rising Volume Clients
                    </CardTitle>
                    <CardDescription>Clients with significant case volume increases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.risingVolumeClients.map((client) => (
                        <div key={client.companyId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{client.companyName}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.activeCases} active cases
                            </p>
                          </div>
                          <Badge variant="destructive">
                            +{client.caseVolumeGrowth.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Workload Balance */}
              {insights.unbalancedWorkloads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Workload Imbalance
                    </CardTitle>
                    <CardDescription>Team members with significantly higher case loads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.unbalancedWorkloads.map((member) => (
                        <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{member.userName || member.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              {(member.averageResolutionTime / (1000 * 60 * 60)).toFixed(1)}h avg resolution
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {member.totalCasesHandled} cases
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};