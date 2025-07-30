import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export const LearningAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into learning performance, engagement, and outcomes.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2%</div>
            <p className="text-xs text-muted-foreground">
              +5.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24m</div>
            <p className="text-xs text-muted-foreground">
              -2m from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92</div>
            <p className="text-xs text-muted-foreground">
              +8 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress Trends</CardTitle>
            <CardDescription>
              Track completion rates and learning velocity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              [Learning Progress Chart]
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Development Heatmap</CardTitle>
            <CardDescription>
              Visualize competency growth across different skill areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              [Skill Heatmap]
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Learning Insights</CardTitle>
          <CardDescription>
            AI-powered recommendations and predictive analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">At-Risk Learners</h4>
              <p className="text-2xl font-bold text-orange-600">23</p>
              <p className="text-sm text-muted-foreground">Learners may need intervention</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">High Performers</h4>
              <p className="text-2xl font-bold text-green-600">147</p>
              <p className="text-sm text-muted-foreground">Ready for advanced content</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Predicted Success</h4>
              <p className="text-2xl font-bold text-blue-600">94%</p>
              <p className="text-sm text-muted-foreground">Based on current progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningAnalyticsPage;