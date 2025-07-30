import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeSummaryData } from '../types';

interface TimeSummaryChartsProps {
  data: TimeSummaryData;
}

export const TimeSummaryCharts: React.FC<TimeSummaryChartsProps> = ({ data }) => {
  const COLORS = ['#655DC6', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];

  const pieData = data.timeCodeBreakdown.map((item, index) => ({
    name: item.timeCodeName,
    value: item.hours,
    color: item.color || COLORS[index % COLORS.length]
  }));

  const barData = data.dailyBreakdown.map(day => ({
    day: day.dayName,
    hours: day.hours,
    target: day.target,
    isCompliant: day.isCompliant
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: payload[0].color }} />
            {payload[0].name}: {payload[0].value}h
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }} />
              {entry.dataKey === 'hours' ? 'Actual' : 'Target'}: {entry.value}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Time Code Breakdown - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Time Code Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate">
                  {entry.name}: {entry.value}h ({((entry.value / data.totalHours) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Hours - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar 
                  dataKey="target" 
                  fill="#E5E7EB" 
                  name="Target"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="hours" 
                  name="Actual"
                  radius={[2, 2, 0, 0]}
                  fill="#655DC6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Non-compliant</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};