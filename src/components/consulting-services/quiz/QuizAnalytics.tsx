import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, Target, Award } from 'lucide-react';

interface QuizAnalyticsData {
  overview: {
    total_attempts: number;
    total_completions: number;
    average_score: number;
    pass_rate: number;
    average_time_minutes: number;
  };
  question_analytics: Array<{
    question_id: string;
    question_text: string;
    total_attempts: number;
    correct_attempts: number;
    difficulty_index: number;
    average_time_seconds: number;
  }>;
  employee_performance: Array<{
    employee_id: string;
    employee_name: string;
    attempts: number;
    best_score: number;
    completion_date: string;
    status: 'passed' | 'failed' | 'in_progress';
  }>;
  time_series: Array<{
    date: string;
    attempts: number;
    completions: number;
    average_score: number;
  }>;
}

interface QuizAnalyticsProps {
  quizId: string;
  analyticsData: QuizAnalyticsData;
  onExport?: () => void;
}

export const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({
  quizId,
  analyticsData,
  onExport
}) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const performanceData = [
    { name: 'Excellent (90-100%)', value: analyticsData.employee_performance.filter(e => e.best_score >= 90).length },
    { name: 'Good (80-89%)', value: analyticsData.employee_performance.filter(e => e.best_score >= 80 && e.best_score < 90).length },
    { name: 'Fair (70-79%)', value: analyticsData.employee_performance.filter(e => e.best_score >= 70 && e.best_score < 80).length },
    { name: 'Poor (<70%)', value: analyticsData.employee_performance.filter(e => e.best_score < 70).length },
  ];

  const questionDifficultyData = analyticsData.question_analytics.map(q => ({
    question: `Q${q.question_id.slice(-2)}`,
    difficulty: Math.round((1 - q.difficulty_index / 100) * 100),
    attempts: q.total_attempts,
    correct: q.correct_attempts
  }));

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Quiz Analytics</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onExport}>Export Report</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="performance">Employee Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.total_attempts}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.overview.total_completions} completions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.average_score}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.5% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.pass_rate}%</div>
                <Progress value={analyticsData.overview.pass_rate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.average_time_minutes}m</div>
                <p className="text-xs text-muted-foreground">
                  Per completion
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
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
                <CardTitle>Question Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={questionDifficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="difficulty" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.question_analytics.map((question, index) => (
                  <div key={question.question_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {question.question_text}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge variant={question.difficulty_index >= 70 ? 'default' : question.difficulty_index >= 40 ? 'secondary' : 'destructive'}>
                          {question.difficulty_index >= 70 ? 'Easy' : question.difficulty_index >= 40 ? 'Medium' : 'Hard'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Attempts</div>
                        <div className="font-medium">{question.total_attempts}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Correct</div>
                        <div className="font-medium">{question.correct_attempts}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium">{question.difficulty_index}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg. Time</div>
                        <div className="font-medium">{Math.round(question.average_time_seconds)}s</div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={question.difficulty_index} 
                      className="mt-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.employee_performance.map((employee) => (
                  <div key={employee.employee_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{employee.employee_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.attempts} attempt{employee.attempts !== 1 ? 's' : ''} • 
                        Completed on {new Date(employee.completion_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{employee.best_score}%</div>
                        <div className="text-sm text-muted-foreground">Best Score</div>
                      </div>
                      <Badge variant={
                        employee.status === 'passed' ? 'default' : 
                        employee.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.time_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="attempts" fill="#8884d8" name="Attempts" />
                  <Line yAxisId="right" type="monotone" dataKey="average_score" stroke="#82ca9d" name="Avg Score %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};