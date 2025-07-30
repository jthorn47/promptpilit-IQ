import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, BarChart3, PieChart, Calendar, RefreshCw } from 'lucide-react';

export const AnalyticsForecastingPage: React.FC = () => {
  const forecasts = [
    {
      id: 1,
      metric: 'Employee Turnover',
      current: 12.5,
      predicted: 15.2,
      trend: 'increasing',
      confidence: 85,
      period: 'Next Quarter'
    },
    {
      id: 2,
      metric: 'Hiring Needs',
      current: 45,
      predicted: 62,
      trend: 'increasing',
      confidence: 92,
      period: 'Next 6 Months'
    },
    {
      id: 3,
      metric: 'Training Completion Rate',
      current: 78,
      predicted: 85,
      trend: 'increasing',
      confidence: 88,
      period: 'Next Quarter'
    },
    {
      id: 4,
      metric: 'Compliance Score',
      current: 94,
      predicted: 91,
      trend: 'decreasing',
      confidence: 79,
      period: 'Next Month'
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'increasing' ? '↗️' : trend === 'decreasing' ? '↘️' : '→';
  };

  return (
    <StandardPageLayout
      title="Analytics & Forecasting"
      subtitle="Predictive analytics and business forecasting"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forecasts.map((forecast) => (
          <Card key={forecast.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{forecast.metric}</CardTitle>
                <Badge variant="outline">{forecast.period}</Badge>
              </div>
              <CardDescription>
                Predictive analysis with {forecast.confidence}% confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{forecast.current}%</div>
                    <div className="text-sm text-muted-foreground">Current</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${getTrendColor(forecast.trend)}`}>
                      {getTrendIcon(forecast.trend)}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTrendColor(forecast.trend)}`}>
                      {forecast.predicted}%
                    </div>
                    <div className="text-sm text-muted-foreground">Predicted</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Confidence Level</span>
                    <span>{forecast.confidence}%</span>
                  </div>
                  <Progress value={forecast.confidence} className="h-2" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    View Trend
                  </Button>
                  <Button size="sm" variant="outline">
                    <PieChart className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
};