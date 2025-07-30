import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Play, BookOpen, Award } from 'lucide-react';

export const TrainingIQPage: React.FC = () => {
  const courses = [
    {
      id: 1,
      title: 'HR Compliance Fundamentals',
      description: 'Essential compliance training for HR professionals',
      progress: 75,
      duration: '2 hours',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Advanced Payroll Processing',
      description: 'Advanced techniques for payroll management',
      progress: 100,
      duration: '3 hours',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Employee Relations Best Practices',
      description: 'Building positive employee relationships',
      progress: 0,
      duration: '1.5 hours',
      status: 'not-started'
    }
  ];

  return (
    <StandardPageLayout
      title="Training IQ"
      subtitle="Employee training and development platform"
      headerActions={
        <Button>
          <GraduationCap className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge 
                  variant={
                    course.status === 'completed' ? 'default' : 
                    course.status === 'in-progress' ? 'secondary' : 'outline'
                  }
                >
                  {course.status === 'in-progress' ? 'In Progress' : 
                   course.status === 'completed' ? 'Completed' : 'Not Started'}
                </Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    {course.status === 'not-started' ? 'Start' : 'Continue'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  {course.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Award className="h-4 w-4 mr-1" />
                      Certificate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
};