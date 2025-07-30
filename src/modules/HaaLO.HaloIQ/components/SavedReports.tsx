import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Search, Filter, Play, Edit, Trash2, Share2, Download, Eye, Calendar, Clock } from 'lucide-react';

interface SavedReport {
  id: string;
  name: string;
  description: string;
  tags: string[];
  visibility: 'private' | 'submit_admin' | 'team_share';
  prompt: string;
  createdAt: string;
  lastRun?: string;
  isScheduled?: boolean;
}

export const SavedReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');

  // Mock data - replace with actual data fetching
  const [savedReports] = useState<SavedReport[]>([
    {
      id: '1',
      name: 'Monthly Payroll Summary',
      description: 'Comprehensive payroll breakdown by department',
      tags: ['payroll', 'monthly', 'departments'],
      visibility: 'private',
      prompt: 'Show me payroll costs by department this month',
      createdAt: '2024-01-15T10:00:00Z',
      lastRun: '2024-01-20T09:00:00Z',
      isScheduled: true
    },
    {
      id: '2',
      name: 'Employee Headcount Trends',
      description: 'Tracking employee growth over time',
      tags: ['headcount', 'trends', 'hr'],
      visibility: 'submit_admin',
      prompt: 'Employee headcount trends over the last 6 months',
      createdAt: '2024-01-10T14:30:00Z',
      lastRun: '2024-01-18T08:00:00Z'
    },
    {
      id: '3',
      name: 'Overtime Analysis',
      description: 'Overtime hours breakdown by location',
      tags: ['overtime', 'location', 'quarterly'],
      visibility: 'private',
      prompt: 'Overtime hours by location this quarter',
      createdAt: '2024-01-05T16:15:00Z'
    }
  ]);

  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || report.tags.includes(filterTag);
    const matchesVisibility = !filterVisibility || report.visibility === filterVisibility;
    
    return matchesSearch && matchesTag && matchesVisibility;
  });

  const allTags = [...new Set(savedReports.flatMap(report => report.tags))];

  const handleRunReport = (report: SavedReport) => {
    console.log('Running report:', report.name);
    // TODO: Implement report execution
  };

  const handleEditReport = (report: SavedReport) => {
    console.log('Editing report:', report.name);
    // TODO: Implement report editing
  };

  const handleDeleteReport = (reportId: string) => {
    console.log('Deleting report:', reportId);
    // TODO: Implement report deletion
  };

  const handleExportReport = (report: SavedReport) => {
    console.log('Exporting report:', report.name);
    // TODO: Implement report export
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Badge variant="outline">Private</Badge>;
      case 'submit_admin':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'team_share':
        return <Badge variant="default">Team Shared</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Save className="h-6 w-6" />
            Saved Reports
          </h2>
          <p className="text-muted-foreground">
            Access and manage your saved report templates
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {filteredReports.length} reports
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterVisibility} onValueChange={setFilterVisibility}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All visibility</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="submit_admin">Pending Review</SelectItem>
                <SelectItem value="team_share">Team Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg leading-tight">{report.name}</CardTitle>
                  <CardDescription className="text-sm">{report.description}</CardDescription>
                </div>
                {report.isScheduled && (
                  <Badge variant="outline" className="ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {report.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between">
                {getVisibilityBadge(report.visibility)}
                <span className="text-xs text-muted-foreground">
                  Created {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Last Run */}
              {report.lastRun && (
                <p className="text-xs text-muted-foreground">
                  Last run: {new Date(report.lastRun).toLocaleString()}
                </p>
              )}

              {/* Prompt Preview */}
              <div className="bg-muted p-2 rounded text-xs">
                <span className="font-medium">Prompt: </span>
                {report.prompt}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRunReport(report)}
                  className="flex-1"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditReport(report)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportReport(report)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Report</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{report.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Save className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterTag || filterVisibility
                ? 'Try adjusting your filters to see more reports.'
                : 'Create your first report using the Report Builder.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};