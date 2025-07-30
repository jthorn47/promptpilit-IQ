import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Table as TableIcon, PieChart, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line } from 'recharts';

interface ReportVisualizationProps {
  data: {
    title: string;
    data: any[];
    chartType: 'bar' | 'pie' | 'line';
    columns: string[];
  };
}

export const ReportVisualization: React.FC<ReportVisualizationProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderChart = () => {
    switch (data.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <RechartsPieChart data={data.data} cx="50%" cy="50%" outerRadius={100}>
                {data.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPieChart>
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const renderTable = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {data.columns.map((column, index) => (
              <TableHead key={index}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.value}</TableCell>
              <TableCell>{row.category || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Chart
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      {/* Data Summary */}
      <div className="flex gap-4">
        <Badge variant="outline">
          {data.data.length} records
        </Badge>
        <Badge variant="outline">
          {data.chartType} chart
        </Badge>
      </div>

      {/* Visualization */}
      <Card>
        <CardContent className="pt-6">
          {viewMode === 'chart' ? renderChart() : renderTable()}
        </CardContent>
      </Card>
    </div>
  );
};