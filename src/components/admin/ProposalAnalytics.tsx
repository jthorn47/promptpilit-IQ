import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Filter,
  Download,
  Calendar,
  Users,
  FileText,
  Phone,
  MessageSquare,
  UserCheck
} from "lucide-react";

// Mock data for proposal success metrics
const weeklyWinRateData = [
  { week: 'Week 1', winRate: 45, proposals: 12, won: 5 },
  { week: 'Week 2', winRate: 52, proposals: 15, won: 8 },
  { week: 'Week 3', winRate: 38, proposals: 18, won: 7 },
  { week: 'Week 4', winRate: 61, proposals: 14, won: 9 },
  { week: 'Week 5', winRate: 48, proposals: 16, won: 8 },
  { week: 'Week 6', winRate: 57, proposals: 21, won: 12 },
  { week: 'Week 7', winRate: 43, proposals: 19, won: 8 },
  { week: 'Week 8', winRate: 65, proposals: 17, won: 11 },
];

const timeToCloseData = [
  { week: 'Week 1', avgDays: 14, industry: 'Technology', rep: 'Sarah Chen' },
  { week: 'Week 2', avgDays: 18, industry: 'Healthcare', rep: 'Michael Rodriguez' },
  { week: 'Week 3', avgDays: 12, industry: 'Manufacturing', rep: 'Emma Thompson' },
  { week: 'Week 4', avgDays: 16, industry: 'Technology', rep: 'Sarah Chen' },
  { week: 'Week 5', avgDays: 20, industry: 'Retail', rep: 'Michael Rodriguez' },
  { week: 'Week 6', avgDays: 11, industry: 'Healthcare', rep: 'Emma Thompson' },
  { week: 'Week 7', avgDays: 15, industry: 'Technology', rep: 'Sarah Chen' },
  { week: 'Week 8', avgDays: 13, industry: 'Manufacturing', rep: 'Michael Rodriguez' },
];

const proposalTypeData = [
  { type: 'Compliance', won: 45, lost: 23, total: 68 },
  { type: 'ASO', won: 32, lost: 18, total: 50 },
  { type: 'SB 553', won: 28, lost: 12, total: 40 },
  { type: 'Payroll', won: 19, lost: 15, total: 34 },
  { type: 'Benefits', won: 23, lost: 11, total: 34 },
];

const nextStepData = [
  { step: 'Follow-up in 2 days', count: 124, percentage: 38 },
  { step: 'Schedule call', count: 89, percentage: 27 },
  { step: 'Schedule demo', count: 67, percentage: 20 },
  { step: 'No action', count: 49, percentage: 15 },
];

const industryOptions = ['All Industries', 'Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Finance'];
const repOptions = ['All Reps', 'Sarah Chen', 'Michael Rodriguez', 'Emma Thompson', 'James Wilson'];
const companySizeOptions = ['All Sizes', '1-10', '11-50', '51-200', '201-500', '500+'];

const COLORS = ['#655DC6', '#8B7CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

export const ProposalAnalytics = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedRep, setSelectedRep] = useState('All Reps');
  const [selectedCompanySize, setSelectedCompanySize] = useState('All Sizes');
  const [timeRange, setTimeRange] = useState('8weeks');

  const filteredData = useMemo(() => {
    // In a real app, this would filter based on the selected filters
    // For now, we'll just return the mock data
    return {
      weeklyWinRate: weeklyWinRateData,
      timeToClose: timeToCloseData,
      proposalType: proposalTypeData,
      nextStep: nextStepData
    };
  }, [selectedIndustry, selectedRep, selectedCompanySize, timeRange]);

  const exportData = (format: 'csv' | 'pdf') => {
    const data = {
      weeklyWinRate: filteredData.weeklyWinRate,
      timeToClose: filteredData.timeToClose,
      proposalType: filteredData.proposalType,
      nextStep: filteredData.nextStep
    };

    if (format === 'csv') {
      const csvContent = Object.entries(data).map(([key, value]) => {
        const headers = Object.keys(value[0] || {}).join(',');
        const rows = value.map(item => Object.values(item).join(',')).join('\n');
        return `${key.toUpperCase()}\n${headers}\n${rows}`;
      }).join('\n\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-analytics-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 60) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposal Success Analytics</h1>
          <p className="text-muted-foreground">Track proposal performance and success metrics over time</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4weeks">Last 4 weeks</SelectItem>
              <SelectItem value="8weeks">Last 8 weeks</SelectItem>
              <SelectItem value="12weeks">Last 12 weeks</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sales Rep</label>
              <Select value={selectedRep} onValueChange={setSelectedRep}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repOptions.map(rep => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Company Size</label>
              <Select value={selectedCompanySize} onValueChange={setSelectedCompanySize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Win Rate</p>
                <p className="text-2xl font-bold">52%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time to Close</p>
                <p className="text-2xl font-bold">15 days</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">132</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proposals Won</p>
                <p className="text-2xl font-bold">68</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="winrate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="winrate">Win Rate Trends</TabsTrigger>
          <TabsTrigger value="timetoclose">Time to Close</TabsTrigger>
          <TabsTrigger value="proposaltype">Proposal Types</TabsTrigger>
          <TabsTrigger value="nextsteps">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="winrate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Week</CardTitle>
              <CardDescription>Track proposal success rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={filteredData.weeklyWinRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}%`, 
                      name === 'winRate' ? 'Win Rate' : name
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="winRate" 
                    stroke="#655DC6" 
                    fill="#655DC6" 
                    fillOpacity={0.3}
                    name="Win Rate %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.weeklyWinRate.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{week.week}</p>
                      <p className="text-sm text-muted-foreground">
                        {week.won} won out of {week.proposals} proposals
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getWinRateColor(week.winRate)}`}>
                        {week.winRate}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetoclose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Time to Close</CardTitle>
              <CardDescription>Track how long it takes to close proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredData.timeToClose}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} days`, 'Average Days']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgDays" 
                    stroke="#655DC6" 
                    strokeWidth={3}
                    name="Average Days to Close"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposaltype" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Type Performance</CardTitle>
                <CardDescription>Win rates by proposal type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredData.proposalType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="won" fill="#655DC6" name="Won" />
                    <Bar dataKey="lost" fill="#E5E7EB" name="Lost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proposal Type Distribution</CardTitle>
                <CardDescription>Total proposals by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={filteredData.proposalType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} (${((percentage || 0) * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {filteredData.proposalType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Proposal Type Success Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.proposalType.map((type, index) => {
                  const winRate = Math.round((type.won / type.total) * 100);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{type.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {type.won} won, {type.lost} lost
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getWinRateColor(winRate)}`}>
                          {winRate}%
                        </p>
                        <p className="text-sm text-muted-foreground">win rate</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nextsteps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps After Sending</CardTitle>
                <CardDescription>What actions are chosen after sending proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={filteredData.nextStep}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ step, percentage }) => `${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {filteredData.nextStep.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Step Breakdown</CardTitle>
                <CardDescription>Detailed breakdown of chosen next steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.nextStep.map((step, index) => {
                    const icon = step.step.includes('Follow-up') ? <MessageSquare className="h-5 w-5" /> :
                                 step.step.includes('call') ? <Phone className="h-5 w-5" /> :
                                 step.step.includes('demo') ? <Users className="h-5 w-5" /> :
                                 <UserCheck className="h-5 w-5" />;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex items-center gap-2">
                            {icon}
                            <div>
                              <p className="font-medium">{step.step}</p>
                              <p className="text-sm text-muted-foreground">
                                {step.count} selections
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {step.percentage}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};