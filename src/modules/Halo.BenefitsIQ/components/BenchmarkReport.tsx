import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, DollarSign, Download, RefreshCw } from 'lucide-react';
import { useMarketBenchmarks, useCreateBenchmarkingSession } from '../hooks/useBenefitsIQ';

interface BenchmarkReportProps {
  companyId: string;
}

export const BenchmarkReport: React.FC<BenchmarkReportProps> = ({ companyId }) => {
  const [benchmarkFilters, setBenchmarkFilters] = useState({
    industry: '',
    region: '',
    company_size_range: '',
    benchmark_type: 'medical'
  });
  
  const [isRunning, setIsRunning] = useState(false);
  
  const { data: marketBenchmarks, isLoading } = useMarketBenchmarks(benchmarkFilters);
  const createSession = useCreateBenchmarkingSession();

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      await createSession.mutateAsync({
        company_id: companyId,
        session_name: `Benchmark Analysis - ${new Date().toLocaleDateString()}`,
        benchmark_criteria: benchmarkFilters,
        benchmark_results: {},
        comparison_data: {},
        created_by: 'current-user-id' // TODO: Get from auth
      });
    } catch (error) {
      console.error('Failed to create benchmark session:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const mockBenchmarkData = {
    companyScore: 78,
    industryAverage: 72,
    regionAverage: 75,
    percentile: 67,
    metrics: [
      {
        category: 'Medical Premium Cost',
        companyValue: '$485/month',
        marketAverage: '$522/month',
        percentile: 35,
        trend: 'favorable'
      },
      {
        category: 'Deductible Amount',
        companyValue: '$1,500',
        marketAverage: '$1,800',
        percentile: 42,
        trend: 'favorable'
      },
      {
        category: 'Out-of-Pocket Maximum',
        companyValue: '$6,000',
        marketAverage: '$6,500',
        percentile: 38,
        trend: 'favorable'
      },
      {
        category: 'Employer Contribution',
        companyValue: '85%',
        marketAverage: '78%',
        percentile: 72,
        trend: 'above_average'
      }
    ],
    recommendations: [
      'Consider increasing employee contribution to align with market standards',
      'Your deductible is competitive - maintain current levels',
      'Explore HSA options to enhance employee value proposition',
      'Consider dental and vision add-ons for comprehensive coverage'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Benchmark Report</h2>
          <p className="text-muted-foreground">Compare your benefits against market standards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isRunning}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleRunBenchmark} disabled={isRunning || isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Benchmark'}
          </Button>
        </div>
      </div>

      {/* Benchmark Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Parameters</CardTitle>
          <CardDescription>Configure your benchmark comparison criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={benchmarkFilters.industry} onValueChange={(value) => 
                setBenchmarkFilters(prev => ({ ...prev, industry: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={benchmarkFilters.region} onValueChange={(value) => 
                setBenchmarkFilters(prev => ({ ...prev, region: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northeast">Northeast</SelectItem>
                  <SelectItem value="southeast">Southeast</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                  <SelectItem value="southwest">Southwest</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select value={benchmarkFilters.company_size_range} onValueChange={(value) => 
                setBenchmarkFilters(prev => ({ ...prev, company_size_range: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50">1-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Benefit Type</Label>
              <Select value={benchmarkFilters.benchmark_type} onValueChange={(value) => 
                setBenchmarkFilters(prev => ({ ...prev, benchmark_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="dental">Dental</SelectItem>
                  <SelectItem value="vision">Vision</SelectItem>
                  <SelectItem value="life">Life Insurance</SelectItem>
                  <SelectItem value="disability">Disability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Results */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBenchmarkData.companyScore}/100</div>
                <Progress value={mockBenchmarkData.companyScore} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {mockBenchmarkData.percentile}th percentile
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Industry Average</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBenchmarkData.industryAverage}/100</div>
                <Progress value={mockBenchmarkData.industryAverage} className="mt-3" />
                <p className="text-xs text-green-600 mt-2">
                  +{mockBenchmarkData.companyScore - mockBenchmarkData.industryAverage} vs industry
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regional Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBenchmarkData.regionAverage}/100</div>
                <Progress value={mockBenchmarkData.regionAverage} className="mt-3" />
                <p className="text-xs text-green-600 mt-2">
                  +{mockBenchmarkData.companyScore - mockBenchmarkData.regionAverage} vs region
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Position</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Above Average</div>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  Competitive
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Strong position
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
              <CardDescription>How your benefits compare to market standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBenchmarkData.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric.category}</span>
                        <Badge className={
                          metric.trend === 'favorable' 
                            ? 'bg-green-100 text-green-800' 
                            : metric.trend === 'above_average' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {metric.trend === 'favorable' ? 'Favorable' : 
                           metric.trend === 'above_average' ? 'Above Average' : 'Below Average'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Your Value: {metric.companyValue}</span>
                        <span>Market Average: {metric.marketAverage}</span>
                        <span>{metric.percentile}th percentile</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of all benchmark metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Detailed metrics analysis will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions for benefits optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBenchmarkData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>Historical data and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Market trends and historical analysis will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};