import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Clock,
  Award,
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react';

export const HROIQLMSTracker: React.FC = () => {
  // Mock LMS data
  const creditSummary = {
    totalCredits: 500,
    usedCredits: 342,
    remainingCredits: 158,
    monthlyAllocation: 50,
    usedThisMonth: 23
  };

  const trainingTypes = [
    {
      name: 'Compliance Training',
      totalCredits: 150,
      usedCredits: 89,
      employees: 25,
      required: true
    },
    {
      name: 'Leadership Development',
      totalCredits: 100,
      usedCredits: 67,
      employees: 8,
      required: false
    },
    {
      name: 'Technical Skills',
      totalCredits: 120,
      usedCredits: 98,
      employees: 15,
      required: false
    },
    {
      name: 'Safety Training',
      totalCredits: 80,
      usedCredits: 55,
      employees: 25,
      required: true
    },
    {
      name: 'Soft Skills',
      totalCredits: 50,
      usedCredits: 33,
      employees: 12,
      required: false
    }
  ];

  const employeeProgress = [
    {
      id: '1',
      name: 'John Smith',
      department: 'Engineering',
      completedCourses: 8,
      totalAssigned: 10,
      creditsUsed: 24,
      lastActivity: '2024-02-05',
      status: 'on_track'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      department: 'Marketing',
      completedCourses: 12,
      totalAssigned: 12,
      creditsUsed: 18,
      lastActivity: '2024-02-03',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      department: 'Sales',
      completedCourses: 4,
      totalAssigned: 10,
      creditsUsed: 12,
      lastActivity: '2024-01-28',
      status: 'behind'
    },
    {
      id: '4',
      name: 'Emily Brown',
      department: 'HR',
      completedCourses: 15,
      totalAssigned: 15,
      creditsUsed: 22,
      lastActivity: '2024-02-04',
      status: 'completed'
    },
    {
      id: '5',
      name: 'David Lee',
      department: 'Finance',
      completedCourses: 7,
      totalAssigned: 8,
      creditsUsed: 16,
      lastActivity: '2024-02-01',
      status: 'on_track'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_track': return 'bg-blue-100 text-blue-800';
      case 'behind': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const creditUtilization = Math.round((creditSummary.usedCredits / creditSummary.totalCredits) * 100);
  const monthlyUtilization = Math.round((creditSummary.usedThisMonth / creditSummary.monthlyAllocation) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">LMS Credit Tracker</h2>
          <p className="text-muted-foreground">Monitor training credits and employee learning progress</p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creditSummary.totalCredits}</div>
            <Progress value={creditUtilization} className="mt-2" />
            <p className="text-muted-foreground text-sm mt-2">{creditUtilization}% utilized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Used Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{creditSummary.usedCredits}</div>
            <p className="text-muted-foreground text-sm">Total consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{creditSummary.remainingCredits}</div>
            <p className="text-muted-foreground text-sm">Available credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{creditSummary.usedThisMonth}</div>
            <Progress value={monthlyUtilization} className="mt-2" />
            <p className="text-muted-foreground text-sm mt-2">of {creditSummary.monthlyAllocation} allocated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Training Categories
          </CardTitle>
          <CardDescription>
            Credit usage breakdown by training type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingTypes.map((type, index) => {
              const utilization = Math.round((type.usedCredits / type.totalCredits) * 100);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{type.name}</h3>
                        {type.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type.employees} employees • {type.usedCredits}/{type.totalCredits} credits
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={utilization} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {utilization}%
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Progress
          </CardTitle>
          <CardDescription>
            Individual learning progress and credit usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeeProgress.map((employee) => {
              const completionRate = Math.round((employee.completedCourses / employee.totalAssigned) * 100);
              
              return (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.department} • Last active: {employee.lastActivity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">{employee.completedCourses}/{employee.totalAssigned}</div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium">{employee.creditsUsed}</div>
                      <p className="text-xs text-muted-foreground">Credits</p>
                    </div>
                    
                    <div className="w-24">
                      <Progress value={completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center mt-1">{completionRate}%</p>
                    </div>
                    
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">January 2024</span>
                <span className="text-sm font-medium">67 credits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">February 2024</span>
                <span className="text-sm font-medium">23 credits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Projected March</span>
                <span className="text-sm font-medium text-muted-foreground">45 credits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm">5 employees completed all required training</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm">92% completion rate this quarter</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Credit efficiency improved by 15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROIQLMSTracker;