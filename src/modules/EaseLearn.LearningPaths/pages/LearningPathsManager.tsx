import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Route, Plus, Search, Users, ArrowRight } from 'lucide-react';

export const LearningPathsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockPaths = [
    {
      id: '1',
      title: 'New Employee Safety Training',
      description: 'Complete safety orientation for new hires',
      courses: ['Workplace Safety Fundamentals', 'Fire Safety', 'Emergency Procedures'],
      enrollments: 45,
      completionRate: 78,
      status: 'active'
    },
    {
      id: '2',
      title: 'Management Certification Track',
      description: 'Leadership and compliance training for managers',
      courses: ['Leadership Basics', 'HR Compliance', 'Performance Management'],
      enrollments: 12,
      completionRate: 92,
      status: 'active'
    },
    {
      id: '3',
      title: 'Annual Compliance Refresh',
      description: 'Yearly compliance training updates',
      courses: ['Updated Regulations', 'Policy Changes', 'Best Practices'],
      enrollments: 234,
      completionRate: 67,
      status: 'draft'
    }
  ];

  const filteredPaths = mockPaths.filter(path =>
    path.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Learning Path
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paths</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 active, 1 draft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">291</div>
            <p className="text-xs text-muted-foreground">Across all paths</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">79%</div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search learning paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid gap-6">
        {filteredPaths.map((path) => (
          <Card key={path.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                </div>
                {getStatusBadge(path.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Course Sequence */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Course Sequence:</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {path.courses.map((course, index) => (
                      <React.Fragment key={course}>
                        <span className="bg-muted px-2 py-1 rounded">{course}</span>
                        {index < path.courses.length - 1 && (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {path.enrollments} enrolled
                    </div>
                    <div className="flex items-center">
                      <Route className="mr-1 h-4 w-4" />
                      {path.completionRate}% completion
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Path
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <div className="text-center py-12">
          <Route className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No learning paths found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first learning path to get started.'}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Learning Path
          </Button>
        </div>
      )}
    </div>
  );
};