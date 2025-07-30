import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useAnalyticsMetrics } from "../hooks";

export const AnalyticsMetrics = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  
  const { metrics, loading, refetch } = useAnalyticsMetrics(
    selectedCategory === 'all' ? undefined : selectedCategory,
    dateRange
  );

  const categories = Array.from(new Set(metrics.map(m => m.category)));

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'completion_rate':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'engagement':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'performance':
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (value: number, previousValue?: number) => {
    if (!previousValue) return null;
    const isIncreasing = value > previousValue;
    return isIncreasing ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return <div className="p-6">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Metrics</h1>
          <p className="text-gray-600">Monitor key performance indicators and trends</p>
        </div>
        <Button onClick={() => refetch()}>Refresh Data</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={dateRange?.start || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value, end: prev?.end || '' }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateRange?.end || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value, start: prev?.start || '' }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getMetricIcon(metric.metric_name)}
                  <h3 className="font-semibold text-gray-900">{metric.metric_name}</h3>
                </div>
                {getTrendIcon(metric.metric_value)}
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {typeof metric.metric_value === 'number' ? metric.metric_value.toLocaleString() : metric.metric_value}
                </div>
                <div className="text-sm text-gray-500">
                  Category: {metric.category}
                </div>
                <div className="text-xs text-gray-400">
                  Recorded: {new Date(metric.date_recorded).toLocaleDateString()}
                </div>
                
                {metric.metadata && Object.keys(metric.metadata).length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500">Additional Info</summary>
                      <div className="mt-2 space-y-1">
                        {Object.entries(metric.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-400">{key}:</span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Metrics Found</h3>
            <p className="text-gray-500">
              No metrics match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};