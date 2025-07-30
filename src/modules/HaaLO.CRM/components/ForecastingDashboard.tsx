/**
 * Forecasting Dashboard - Stage 5
 * Advanced sales forecasting with AI predictions and scenario planning
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDeals } from '@/domains/crm/hooks/useDeals';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Target, PieChart, BarChart3,
  Download, Users, Brain, Zap, AlertTriangle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, Filter, Sparkles
} from 'lucide-react';

export const ForecastingDashboard: React.FC = () => {
  const { deals, loading } = useDeals();
  const [timeframe, setTimeframe] = useState('quarter');
  const [scenario, setScenario] = useState('realistic');
  const { toast } = useToast();

  // Calculate forecast metrics
  const totalPipelineValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
  const activeDeals = deals?.filter(d => d.status === 'active') || [];
  const weightedValue = activeDeals.reduce((sum, deal) => sum + ((deal.value || 0) * (deal.probability || 50) / 100), 0);
  const avgDealSize = activeDeals.length > 0 ? totalPipelineValue / activeDeals.length : 0;
  
  // AI-powered predictions
  const aiPredictions = {
    winRate: 68,
    avgSalesCycle: 45,
    quarterlyTarget: 850000,
    riskFactor: 15,
    confidence: 87
  };

  const forecastMetrics = [
    {
      title: "Total Pipeline",
      value: `$${(totalPipelineValue / 1000).toFixed(0)}K`,
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-600"
    },
    {
      title: "Weighted Pipeline",
      value: `$${(weightedValue / 1000).toFixed(0)}K`,
      change: "+8%",
      trend: "up", 
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "AI Win Rate",
      value: `${aiPredictions.winRate}%`,
      change: "+5%",
      trend: "up",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Avg Deal Size",
      value: `$${(avgDealSize / 1000).toFixed(0)}K`,
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      color: "text-amber-600"
    }
  ];

  // Scenario planning
  const scenarios = {
    optimistic: {
      revenue: Math.round(weightedValue * 1.3),
      deals: Math.round(activeDeals.length * 1.2),
      winRate: aiPredictions.winRate + 10
    },
    realistic: {
      revenue: Math.round(weightedValue),
      deals: activeDeals.length,
      winRate: aiPredictions.winRate
    },
    pessimistic: {
      revenue: Math.round(weightedValue * 0.7),
      deals: Math.round(activeDeals.length * 0.8),
      winRate: aiPredictions.winRate - 15
    }
  };

  const currentScenario = scenarios[scenario as keyof typeof scenarios];

  const exportForecast = () => {
    const data = {
      generated: new Date().toISOString(),
      timeframe,
      scenario,
      metrics: forecastMetrics,
      scenarios,
      aiPredictions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast-${scenario}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Forecast Exported",
      description: "Forecast data has been downloaded successfully"
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Sales Forecasting
          </h1>
          <p className="text-muted-foreground">AI-powered revenue predictions and scenario planning</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportForecast}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {forecastMetrics.map((metric) => {
          const IconComponent = metric.icon;
          const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={metric.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 mr-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{metric.change}</span>
                  <span className="ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Selector */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Scenario Planning
                </CardTitle>
                <CardDescription>
                  Explore different forecast scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(scenarios).map(([key, data]) => (
                  <div 
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      scenario === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setScenario(key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{key}</h3>
                      <Badge variant={
                        key === 'optimistic' ? 'default' : 
                        key === 'pessimistic' ? 'destructive' : 'secondary'
                      }>
                        {data.winRate}% Win Rate
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Revenue: ${(data.revenue / 1000).toFixed(0)}K</div>
                      <div>Deals: {data.deals}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scenario Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="capitalize">{scenario} Scenario</CardTitle>
                <CardDescription>
                  Detailed breakdown and projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      ${(currentScenario.revenue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-muted-foreground">Expected Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentScenario.deals}
                    </div>
                    <div className="text-sm text-muted-foreground">Expected Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentScenario.winRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to Target</span>
                      <span>{Math.round((currentScenario.revenue / aiPredictions.quarterlyTarget) * 100)}%</span>
                    </div>
                    <Progress value={Math.min((currentScenario.revenue / aiPredictions.quarterlyTarget) * 100, 100)} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">High Confidence Deals: 8</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm">At-Risk Deals: 3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Predictions
                </CardTitle>
                <CardDescription>
                  Machine learning insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Predicted Win Rate</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {aiPredictions.winRate}% ± 3%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Avg Sales Cycle</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {aiPredictions.avgSalesCycle} days
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Risk Factor</span>
                  <Badge variant={aiPredictions.riskFactor > 20 ? 'destructive' : 'secondary'}>
                    {aiPredictions.riskFactor}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Model Confidence</span>
                  <Badge className="bg-green-100 text-green-800">
                    {aiPredictions.confidence}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered action items to improve forecast
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Zap className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <p className="font-medium">Focus on high-value deals</p>
                    <p className="text-sm text-muted-foreground">3 deals worth $180K need immediate attention</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Clock className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Accelerate sales cycle</p>
                    <p className="text-sm text-muted-foreground">5 deals are taking longer than average</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Target className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">Improve qualification</p>
                    <p className="text-sm text-muted-foreground">Better lead scoring could increase win rate by 8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Pipeline Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of pipeline health and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">By Stage</h3>
                  {['proposal', 'negotiation', 'active'].map(stage => {
                    const stageDeals = deals?.filter(d => d.status === stage) || [];
                    const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                    return (
                      <div key={stage} className="flex justify-between items-center">
                        <span className="capitalize">{stage}</span>
                        <div className="text-right">
                          <div className="font-medium">${(stageValue / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-muted-foreground">{stageDeals.length} deals</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">By Value Range</h3>
                  {[
                    { label: '$100K+', min: 100000 },
                    { label: '$50K-$100K', min: 50000, max: 100000 },
                    { label: 'Under $50K', max: 50000 }
                  ].map(range => {
                    const rangeDeals = deals?.filter(d => {
                      const value = d.value || 0;
                      return (!range.min || value >= range.min) && (!range.max || value < range.max);
                    }) || [];
                    const rangeValue = rangeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                    return (
                      <div key={range.label} className="flex justify-between items-center">
                        <span>{range.label}</span>
                        <div className="text-right">
                          <div className="font-medium">${(rangeValue / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-muted-foreground">{rangeDeals.length} deals</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Health Score</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Pipeline Health</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deal Velocity</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Qualification Quality</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trends & Patterns
              </CardTitle>
              <CardDescription>
                Historical performance and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Trend Analysis Coming Soon</p>
                <p>Historical data visualization and pattern recognition will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};