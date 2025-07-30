
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrendAnalysis } from '../../hooks/useAnalytics';

interface TrendAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const TrendAnalysisModal: React.FC<TrendAnalysisModalProps> = ({
  open,
  onOpenChange,
  companyId,
}) => {
  const { data: trends, isLoading, error } = useTrendAnalysis(companyId);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatChartData = (trendData: Record<string, any>) => {
    return Object.entries(trendData).map(([key, value]) => ({
      period: key.toUpperCase(),
      value: typeof value === 'number' ? value : 0
    }));
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Trend Analysis</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p>Error loading trend analysis. Please try again later.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Trend Analysis Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading trend analysis...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {trends?.map((trend) => (
                <Card key={trend.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(trend.trend_direction)}
                        <span className="capitalize">{trend.analysis_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {trend.time_period}
                        </Badge>
                        <Badge 
                          variant={trend.trend_direction === 'up' ? 'default' : trend.trend_direction === 'down' ? 'destructive' : 'secondary'}
                        >
                          {trend.growth_rate >= 0 ? '+' : ''}{(trend.growth_rate * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Trend Summary */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Trend Direction</h4>
                          <div className={`flex items-center space-x-2 ${getTrendColor(trend.trend_direction)}`}>
                            {getTrendIcon(trend.trend_direction)}
                            <span className="capitalize font-medium">{trend.trend_direction}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Growth Rate</h4>
                          <div className={`text-lg font-bold ${getTrendColor(trend.trend_direction)}`}>
                            {trend.growth_rate >= 0 ? '+' : ''}{(trend.growth_rate * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Analysis Period</h4>
                          <Badge variant="outline" className="capitalize">
                            {trend.time_period}
                          </Badge>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="lg:col-span-2">
                        <h4 className="text-sm font-medium mb-4">Trend Visualization</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formatChartData(trend.trend_data)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="period" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={trend.trend_direction === 'up' ? '#10b981' : trend.trend_direction === 'down' ? '#ef4444' : '#6b7280'}
                                strokeWidth={2}
                                dot={{ fill: trend.trend_direction === 'up' ? '#10b981' : trend.trend_direction === 'down' ? '#ef4444' : '#6b7280' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
