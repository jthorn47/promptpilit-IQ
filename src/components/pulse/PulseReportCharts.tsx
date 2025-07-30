import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ReportData } from '@/services/PulseAnalyticsService';

interface PulseReportChartsProps {
  reportData: ReportData;
  config: {
    title: string;
    primaryChart: string;
    secondaryCharts: string[];
  };
}

// Chart colors from design system
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary-foreground))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#6366F1'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PulseReportCharts: React.FC<PulseReportChartsProps> = ({ 
  reportData, 
  config 
}) => {
  const renderChart = (chartType: string, title: string, size: 'large' | 'small' = 'small') => {
    const data = reportData.charts[chartType as keyof typeof reportData.charts];
    
    if (!data || data.length === 0) {
      return (
        <Card className={size === 'large' ? 'col-span-2' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      );
    }

    const height = size === 'large' ? 400 : 300;

    let chart;
    switch (chartType) {
      case 'caseResolutionTrend':
        chart = (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        break;

      case 'departmentBreakdown':
        chart = (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={CHART_COLORS[0]}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
        break;

      case 'resourceUtilization':
        chart = (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={CHART_COLORS[2]}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        break;

      case 'taskCompletionRate':
        chart = (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS[3]}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS[3], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: CHART_COLORS[3] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        break;

      case 'riskAssessment':
        chart = (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={CHART_COLORS[0]}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'Low Risk' ? '#10B981' :
                      entry.name === 'Medium Risk' ? '#F59E0B' :
                      '#EF4444'
                    } 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        break;

      case 'performanceMetrics':
        chart = (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={CHART_COLORS[1]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        break;

      default:
        chart = (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart type not supported
          </div>
        );
    }

    return (
      <Card className={size === 'large' ? 'col-span-2' : ''}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {chart}
        </CardContent>
      </Card>
    );
  };

  const getChartTitle = (chartType: string): string => {
    const titles: { [key: string]: string } = {
      caseResolutionTrend: 'Case Resolution Trends',
      departmentBreakdown: 'Cases by Department',
      taskCompletionRate: 'Task Completion Rate',
      resourceUtilization: 'Resource Utilization',
      riskAssessment: 'Risk Assessment',
      performanceMetrics: 'Performance Metrics'
    };
    return titles[chartType] || chartType;
  };

  return (
    <div className="space-y-6">
      {/* Primary Chart - Large */}
      <div className="grid grid-cols-1 gap-6">
        {renderChart(config.primaryChart, getChartTitle(config.primaryChart), 'large')}
      </div>

      {/* Secondary Charts - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.secondaryCharts.map(chartType => 
          renderChart(chartType, getChartTitle(chartType), 'small')
        )}
      </div>
    </div>
  );
};