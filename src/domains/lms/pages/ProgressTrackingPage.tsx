
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';

export const ProgressTrackingPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const overallProgress = {
    completedCourses: 12,
    totalCourses: 16,
    completionRate: 75,
    learningHours: 24.5,
    certificatesEarned: 8
  };

  const monthlyProgress = [
    { month: 'Jan', courses: 3, hours: 8.5 },
    { month: 'Feb', courses: 4, hours: 12.0 },
    { month: 'Mar', courses: 5, hours: 4.0 }
  ];

  const courseProgress = [
    {
      title: 'Workplace Safety Fundamentals',
      progress: 100,
      completedDate: '2024-01-15',
      score: 95,
      status: 'completed'
    },
    {
      title: 'Sexual Harassment Prevention',
      progress: 75,
      dueDate: '2024-01-30',
      status: 'in_progress'
    },
    {
      title: 'Fire Safety & Emergency Procedures',
      progress: 45,
      dueDate: '2024-02-05',
      status: 'in_progress'
    }
  ];

  const learningGoals = [
    {
      title: 'Complete Safety Training Track',
      progress: 80,
      target: 'End of January',
      status: 'on_track'
    },
    {
      title: 'Earn 5 New Certificates',
      progress: 60,
      target: 'End of Quarter',
      status: 'on_track'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your learning journey and achievements</p>
        </div>
        <Badge variant="secondary">Learning Analytics</Badge>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.completionRate}%</div>
            <Progress value={overallProgress.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallProgress.completedCourses}/{overallProgress.totalCourses}
            </div>
            <p className="text-xs text-muted-foreground">Total courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.learningHours}h</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.certificatesEarned}</div>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseProgress.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{course.title}</h4>
                    <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                      {course.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Progress: {course.progress}%</span>
                    {course.status === 'completed' ? (
                      <span>Completed: {course.completedDate} • Score: {course.score}%</span>
                    ) : (
                      <span>Due: {course.dueDate}</span>
                    )}
                  </div>
                  <Progress value={course.progress} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{goal.title}</h4>
                    <Badge variant="default">On Track</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Progress: {goal.progress}%</span>
                    <span>Target: {goal.target}</span>
                  </div>
                  <Progress value={goal.progress} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Learning Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Monthly Learning Activity</h4>
                  <div className="space-y-2">
                    {monthlyProgress.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="font-medium">{month.month}</span>
                        <div className="text-sm text-muted-foreground">
                          {month.courses} courses • {month.hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
