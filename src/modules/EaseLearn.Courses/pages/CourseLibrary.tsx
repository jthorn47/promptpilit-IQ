import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, Users, Clock } from 'lucide-react';

export const CourseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockCourses = [
    {
      id: '1',
      title: 'Workplace Safety Fundamentals',
      description: 'Essential safety training for all employees',
      enrollments: 234,
      duration: '45 min',
      status: 'active',
      type: 'SCORM'
    },
    {
      id: '2',
      title: 'Sexual Harassment Prevention',
      description: 'Mandatory training on preventing workplace harassment',
      enrollments: 156,
      duration: '30 min',
      status: 'active',
      type: 'Video'
    },
    {
      id: '3',
      title: 'Fire Safety & Emergency Procedures',
      description: 'Fire safety protocols and emergency response',
      enrollments: 89,
      duration: '25 min',
      status: 'draft',
      type: 'Interactive'
    }
  ];

  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Course Library</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {course.enrollments} enrolled
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {course.duration}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {course.type}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first course.'}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
      )}
    </div>
  );
};