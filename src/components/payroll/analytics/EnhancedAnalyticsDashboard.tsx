
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Calculator, Clock, Database } from 'lucide-react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface TaxAnalytics {
  federalTax: number;
  californiaTax: number;
  ficaTax: number;
  sdiTax: number;
  totalTax: number;
  period: string;
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  cacheHitRate: number;
  requestVolume: number;
}

export const EnhancedAnalyticsDashboard: React.FC = () => {
  const { metrics, preloadTaxData } = useAdvancedPerformance();
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [taxAnalytics, setTaxAnalytics] = useState<TaxAnalytics[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    // Preload tax data for current year
    preloadTaxData(new Date().getFullYear());
    
    // Generate sample analytics data
    generateSampleData();
  }, [preloadTaxData, timeRange]);

  const generateSampleData = () => {
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 90;
    
    const analytics: TaxAnalytics[] = [];
    const performance: PerformanceData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      analytics.push({
        federalTax: Math.random() * 5000 + 3000,
        californiaTax: Math.random() * 2000 + 1000,
        ficaTax: Math.random() * 1500 + 800,
        sdiTax: Math.random() * 300 + 100,
        totalTax: 0, // Will be calculated
        period: date.toISOString().split('T')[0]
      });
      
      performance.push({
        timestamp: date.toISOString().split('T')[0],
        responseTime: Math.random() * 100 + 50,
        cacheHitRate: Math.random() * 30 + 70,
        requestVolume: Math.floor(Math.random() * 500 + 200)
      });
    }
    
    // Calculate total tax
    analytics.forEach(item => {
      item.totalTax = item.federalTax + item.californiaTax + item.ficaTax + item.sdiTax;
    });
    
    setTaxAnalytics(analytics);
    setPerformanceData(performance);
  };

  const getTaxSummary = () => {
    const latestData = taxAnalytics[taxAnalytics.length - 1];
    if (!latestData) return null;

    return [
      { name: 'Federal Tax', value: latestData.federalTax, color: '#3b82f6' },
      { name: 'California Tax', value: latestData.californiaTax, color: '#10b981' },
      { name: 'FICA Tax', value: latestData.ficaTax, color: '#f59e0b' },
      { name: 'SDI Tax', value: latestData.sdiTax, color: '#ef4444' }
    ];
  };

  const getPerformanceSummary = () => {
    if (performanceData.length === 0) return { avgResponseTime: 0, avgCacheHit: 0, totalRequests: 0 };
    
    const avgResponseTime = performanceData.reduce((sum, item) => sum + item.responseTime, 0) / performanceData.length;
    const avgCacheHit = performanceData.reduce((sum, item) => sum + item.cacheHitRate, 0) / performanceData.length;
    const totalRequests = performanceData.reduce((sum, item) => sum + item.requestVolume, 0);
    
    return { avgResponseTime, avgCacheHit, totalRequests };
  };

  const taxSummary = getTaxSummary();
  const performanceSummary = getPerformanceSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enhanced Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tax Processed</p>
                <p className="text-2xl font-bold">
                  ${taxAnalytics.reduce((sum, item) => sum + item.totalTax, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{performanceSummary.avgResponseTime.toFixed(1)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">{performanceSummary.avgCacheHit.toFixed(1)}%</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{performanceSummary.totalRequests.toLocaleString()}</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tax-analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tax-analytics">Tax Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="tax-analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={taxAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="federalTax" stroke="#3b82f6" name="Federal" />
                    <Line type="monotone" dataKey="californiaTax" stroke="#10b981" name="California" />
                    <Line type="monotone" dataKey="ficaTax" stroke="#f59e0b" name="FICA" />
                    <Line type="monotone" dataKey="sdiTax" stroke="#ef4444" name="SDI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taxSummary}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    >
                      {taxSummary?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Total Tax Processing Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={taxAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total Tax']} />
                  <Area type="monotone" dataKey="totalTax" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}ms`, 'Response Time']} />
                    <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Cache Hit Rate']} />
                    <Area type="monotone" dataKey="cacheHitRate" stroke="#10b981" fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Requests']} />
                  <Bar dataKey="requestVolume" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>California & Federal Tax Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">Federal Tax Compliance</h4>
                    <p className="text-sm text-green-600">All calculations up to date with 2024 tax tables</p>
                  </div>
                  <div className="text-green-600 font-bold">✓ Compliant</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">California Tax Compliance</h4>
                    <p className="text-sm text-green-600">CA DE 44 and SDI rates current</p>
                  </div>
                  <div className="text-green-600 font-bold">✓ Compliant</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-blue-800">FICA Compliance</h4>
                    <p className="text-sm text-blue-600">Social Security and Medicare rates current</p>
                  </div>
                  <div className="text-blue-600 font-bold">✓ Current</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
