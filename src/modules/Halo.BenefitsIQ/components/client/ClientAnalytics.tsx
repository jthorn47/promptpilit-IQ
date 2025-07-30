// Client Analytics - Advanced predictive analytics and insights
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Target,
  Users,
  DollarSign,
  Download,
  Calendar
} from "lucide-react";

interface ClientAnalyticsProps {
  companyId: string;
}

interface TrendData {
  month: string;
  cost: number;
  enrollment: number;
  utilization: number;
}

interface PredictiveModel {
  metric: string;
  current: number;
  projected12m: number;
  projected24m: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface RiskMetric {
  category: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
}

export const ClientAnalytics: React.FC<ClientAnalyticsProps> = ({ 
  companyId 
}) => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [companyId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data - in real app, this would come from ML models
      setTrendData([
        { month: 'Jan', cost: 28500, enrollment: 92, utilization: 68 },
        { month: 'Feb', cost: 29200, enrollment: 94, utilization: 72 },
        { month: 'Mar', cost: 28800, enrollment: 93, utilization: 70 },
        { month: 'Apr', cost: 30100, enrollment: 95, utilization: 75 },
        { month: 'May', cost: 29800, enrollment: 94, utilization: 73 },
        { month: 'Jun', cost: 31200, enrollment: 96, utilization: 78 },
        { month: 'Jul', cost: 30800, enrollment: 95, utilization: 76 },
        { month: 'Aug', cost: 32100, enrollment: 97, utilization: 80 },
        { month: 'Sep', cost: 31800, enrollment: 96, utilization: 79 },
        { month: 'Oct', cost: 33000, enrollment: 98, utilization: 82 },
        { month: 'Nov', cost: 32500, enrollment: 97, utilization: 81 },
        { month: 'Dec', cost: 34200, enrollment: 99, utilization: 85 }
      ]);

      setPredictiveModels([
        {
          metric: 'Total Benefit Costs',
          current: 384000,
          projected12m: 405600,
          projected24m: 428000,
          confidence: 85,
          trend: 'up'
        },
        {
          metric: 'Medical Claims per Employee',
          current: 4200,
          projected12m: 4410,
          projected24m: 4630,
          confidence: 78,
          trend: 'up'
        },
        {
          metric: 'Employee Enrollment Rate',
          current: 96,
          projected12m: 97,
          projected24m: 98,
          confidence: 92,
          trend: 'up'
        },
        {
          metric: 'Voluntary Benefits Adoption',
          current: 65,
          projected12m: 72,
          projected24m: 78,
          confidence: 88,
          trend: 'up'
        }
      ]);

      setRiskMetrics([
        {
          category: 'Cost Escalation Risk',
          score: 7.2,
          level: 'medium',
          description: 'Medical costs trending 5.6% above industry average',
          recommendations: [
            'Implement wellness programs to reduce claims',
            'Consider alternative plan designs',
            'Negotiate carrier rates at renewal'
          ]
        },
        {
          category: 'Compliance Risk',
          score: 2.1,
          level: 'low',
          description: 'Strong compliance posture with minor gaps',
          recommendations: [
            'Update COBRA administration procedures',
            'Enhance record-keeping processes'
          ]
        },
        {
          category: 'Employee Satisfaction Risk',
          score: 4.5,
          level: 'medium',
          description: 'Satisfaction scores declining in dental coverage',
          recommendations: [
            'Survey employees on dental plan preferences',
            'Explore additional dental plan options',
            'Improve communication about dental benefits'
          ]
        },
        {
          category: 'Carrier Stability Risk',
          score: 3.2,
          level: 'low',
          description: 'All carriers have strong financial ratings',
          recommendations: [
            'Continue monitoring carrier financial health',
            'Maintain relationship with backup carriers'
          ]
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'stable': return <div className="h-4 w-4 bg-yellow-500 rounded-full" />;
      default: return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Predictive insights and trend analysis for your benefits program
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Models</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="benchmarks">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Cost Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Interactive chart showing monthly benefit costs
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">5.6%</div>
                      <div className="text-sm text-muted-foreground">YoY Growth</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(34200)}</div>
                      <div className="text-sm text-muted-foreground">Dec Cost</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12%</div>
                      <div className="text-sm text-muted-foreground">Volatility</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enrollment Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Enrollment distribution by plan type
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medical Plans</span>
                      <span className="font-medium">99%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dental Plans</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vision Plans</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Life Insurance</span>
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Utilization Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Utilization Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">82%</div>
                    <div className="text-sm text-muted-foreground">Medical Utilization</div>
                    <div className="text-xs text-green-600">+3% vs target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">68%</div>
                    <div className="text-sm text-muted-foreground">Preventive Care</div>
                    <div className="text-xs text-green-600">+12% vs last year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">24%</div>
                    <div className="text-sm text-muted-foreground">Specialist Visits</div>
                    <div className="text-xs text-yellow-600">Stable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Predictive Forecasting</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Machine learning models predicting future benefit metrics
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveModels.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{model.metric}</h3>
                          {getTrendIcon(model.trend)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {model.confidence}% confidence
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {typeof model.current === 'number' && model.current > 1000 
                              ? formatCurrency(model.current)
                              : `${model.current}${model.metric.includes('Rate') || model.metric.includes('Adoption') ? '%' : ''}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">Current</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {typeof model.projected12m === 'number' && model.projected12m > 1000 
                              ? formatCurrency(model.projected12m)
                              : `${model.projected12m}${model.metric.includes('Rate') || model.metric.includes('Adoption') ? '%' : ''}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">12 Months</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {typeof model.projected24m === 'number' && model.projected24m > 1000 
                              ? formatCurrency(model.projected24m)
                              : `${model.projected24m}${model.metric.includes('Rate') || model.metric.includes('Adoption') ? '%' : ''}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">24 Months</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Change over 24 months: </span>
                          <span className={model.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                            {model.trend === 'up' ? '+' : ''}
                            {(((model.projected24m - model.current) / model.current) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="space-y-4">
            {riskMetrics.map((risk, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{risk.category}</h3>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1">{risk.score}/10</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getRiskColor(risk.level)}`}>
                        {risk.level.toUpperCase()} RISK
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {risk.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-center gap-2 text-sm">
                          <Target className="h-3 w-3 text-blue-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cost per Employee</p>
                    <p className="text-2xl font-bold">{formatCurrency(8533)}</p>
                    <p className="text-xs text-green-600">12% below industry avg</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enrollment Rate</p>
                    <p className="text-2xl font-bold">96%</p>
                    <p className="text-xs text-green-600">Above industry avg</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claims Ratio</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-yellow-600">Near industry avg</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
                    <p className="text-2xl font-bold">4.2/5</p>
                    <p className="text-xs text-green-600">Above benchmark</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};