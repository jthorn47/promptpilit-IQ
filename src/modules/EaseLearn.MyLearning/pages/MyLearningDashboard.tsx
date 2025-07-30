import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Award, BookOpen } from 'lucide-react';

export const MyLearningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assigned');

  const mockAssignedCourses = [
    {
      id: '1',
      title: 'Workplace Safety Fundamentals',
      description: 'Essential safety training for all employees',
      progress: 75,
      dueDate: '2024-01-25',
      estimatedTime: '45 min',
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Sexual Harassment Prevention',
      description: 'Mandatory training on preventing workplace harassment',
      progress: 0,
      dueDate: '2024-01-30',
      estimatedTime: '30 min',
      status: 'not_started'
    }
  ];

  const mockCompletedCourses = [
    {
      id: '3',
      title: 'Fire Safety & Emergency Procedures',
      description: 'Fire safety protocols and emergency response',
      completedDate: '2024-01-10',
      score: 95,
      certificateId: 'cert-123'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <Badge variant="secondary">Learner Dashboard</Badge>
      </div>

      {/* Progress Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 in progress, 1 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">1 certificate earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37.5%</div>
            <Progress value={37.5} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'assigned' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('assigned')}
          >
            Assigned Courses
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </Button>
        </div>

        {/* Assigned Courses */}
        {activeTab === 'assigned' && (
          <div className="grid gap-4">
            {mockAssignedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <Badge variant={course.status === 'in_progress' ? 'default' : 'secondary'}>
                      {course.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: {course.progress}%</span>
                      <span>Due: {course.dueDate}</span>
                    </div>
                    <Progress value={course.progress} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {course.estimatedTime}
                      </div>
                      <Button size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        {course.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Completed Courses */}
        {activeTab === 'completed' && (
          <div className="grid gap-4">
            {mockCompletedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm">Completed: {course.completedDate}</div>
                      <div className="text-sm">Score: {course.score}%</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Award className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};