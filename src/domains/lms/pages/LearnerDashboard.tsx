
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Target,
  TrendingUp,
  PlayCircle
} from 'lucide-react';

export const LearnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickStats = [
    {
      title: "Active Courses",
      value: "3",
      icon: BookOpen,
      description: "In progress"
    },
    {
      title: "Hours This Week",
      value: "4.2h",
      icon: Clock,
      description: "Learning time"
    },
    {
      title: "Certificates",
      value: "8",
      icon: Award,
      description: "Earned"
    },
    {
      title: "Overall Progress",
      value: "75%",
      icon: TrendingUp,
      description: "Completion rate"
    }
  ];

  const activeCourses = [
    {
      id: '1',
      title: 'Workplace Safety Fundamentals',
      progress: 75,
      dueDate: '2024-01-25',
      estimatedTime: '45 min remaining'
    },
    {
      id: '2',
      title: 'Sexual Harassment Prevention',
      progress: 30,
      dueDate: '2024-01-30',
      estimatedTime: '1.5 hours remaining'
    },
    {
      id: '3',
      title: 'Fire Safety & Emergency Procedures',
      progress: 90,
      dueDate: '2024-02-05',
      estimatedTime: '15 min remaining'
    }
  ];

  const recentAchievements = [
    {
      title: 'CPR Certification',
      date: '2024-01-15',
      type: 'Certificate'
    },
    {
      title: 'First Aid Training',
      date: '2024-01-10',
      type: 'Certificate'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Dashboard</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <Badge variant="secondary">Learner Portal</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Continue Learning</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/learning/my-courses')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCourses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{course.title}</h4>
                  <Button size="sm" variant="ghost">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{course.estimatedTime}</span>
                  <span>Due: {course.dueDate}</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Achievements</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/learning/my-certificates')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.type} • {achievement.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/learning/modules')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Catalog
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/learning/assignments')}
            >
              <Target className="mr-2 h-4 w-4" />
              View Assignments
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/learning/progress')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Track Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
