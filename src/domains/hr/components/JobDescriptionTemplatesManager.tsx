import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  FileText,
  Plus,
  Eye,
  Copy,
  SortAsc,
  SortDesc,
  BookOpen
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobDescriptionTemplates, JobDescriptionTemplate } from '@/hooks/useJobDescriptionTemplates';
import { JobDescriptionTemplateViewDialog } from './JobDescriptionTemplateViewDialog';
import { useToast } from '@/hooks/use-toast';

export const JobDescriptionTemplatesManager: React.FC = () => {
  const { templates, loading, error } = useJobDescriptionTemplates();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof JobDescriptionTemplate>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTemplate, setSelectedTemplate] = useState<JobDescriptionTemplate | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    console.log('Filtering templates. Total:', templates.length);
    
    let filtered = templates.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || 
                               item.department === selectedDepartment;
      
      const matchesLevel = selectedLevel === 'all' || 
                          item.level === selectedLevel;
      
      return matchesSearch && matchesDepartment && matchesLevel;
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    console.log('Filtered templates:', filtered.length);
    return filtered;
  }, [templates, searchTerm, selectedDepartment, selectedLevel, sortBy, sortOrder]);

  // Get unique departments and levels
  const departments = React.useMemo(() => {
    const depts = new Set<string>();
    templates.forEach(item => {
      depts.add(item.department);
    });
    return Array.from(depts).sort();
  }, [templates]);

  const levels = React.useMemo(() => {
    const lvls = new Set<string>();
    templates.forEach(item => {
      lvls.add(item.level);
    });
    return Array.from(lvls).sort();
  }, [templates]);

  const handleViewTemplate = (template: JobDescriptionTemplate) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  const handleCopyTemplate = (template: JobDescriptionTemplate) => {
    // Copy template data to clipboard as JSON for easy pasting
    const templateData = {
      title: template.title,
      department: template.department,
      level: template.level,
      summary: template.summary,
      key_responsibilities: template.key_responsibilities,
      required_qualifications: template.required_qualifications,
      preferred_qualifications: template.preferred_qualifications,
      skills_required: template.skills_required,
      skills_preferred: template.skills_preferred,
      flsa_classification: template.flsa_classification,
    };
    
    navigator.clipboard.writeText(JSON.stringify(templateData, null, 2)).then(() => {
      toast({
        title: "Template Copied",
        description: "Job description template has been copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy template to clipboard",
        variant: "destructive",
      });
    });
  };

  const handleSort = (field: keyof JobDescriptionTemplate) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job description templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium text-destructive">Error Loading Templates</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Job Description Templates
          </h2>
          <p className="text-muted-foreground">
            Pre-built job description templates to accelerate your hiring process
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Templates ({filteredData.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Job Title
                      {sortBy === 'title' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center gap-1">
                      Department
                      {sortBy === 'department' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center gap-1">
                      Level
                      {sortBy === 'level' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>FLSA</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((template) => (
                  <TableRow key={template.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{template.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {template.summary}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{template.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {template.industry || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {template.experience_years_min !== undefined && template.experience_years_max !== undefined
                          ? `${template.experience_years_min}-${template.experience_years_max} years`
                          : template.experience_years_min !== undefined
                            ? `${template.experience_years_min}+ years`
                            : 'Not specified'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={template.flsa_classification === 'exempt' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {template.flsa_classification || 'Not specified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewTemplate(template)}
                          title="View template details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleCopyTemplate(template)}
                          title="Copy template to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                        <div className="text-lg font-medium">No templates found</div>
                        <div className="text-sm text-muted-foreground">
                          {searchTerm || selectedDepartment !== 'all' || selectedLevel !== 'all'
                            ? "Try adjusting your search or filters"
                            : "No job description templates available"
                          }
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Template View Dialog */}
      <JobDescriptionTemplateViewDialog
        template={selectedTemplate}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onCopyTemplate={handleCopyTemplate}
      />
    </div>
  );
};