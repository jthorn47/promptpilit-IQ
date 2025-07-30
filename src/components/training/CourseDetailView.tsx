import { useState } from "react";
import { X, Edit, Calendar, Award, Clock, Tag, Users, BookOpen, CheckCircle, XCircle, Globe, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface TrainingModule {
  id: string;
  title: string;
  public_title?: string | null;
  description: string | null;
  category: string | null;
  tags?: string[] | null;
  target_roles?: string[] | null;
  language?: string | null;
  estimated_duration: number | null;
  estimated_completion_time?: number | null;
  status: string | null;
  credit_value: number | null;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  is_required: boolean | null;
  difficulty_level?: string | null;
  industry?: string | null;
  accessibility_compliant?: boolean | null;
  completion_method?: string | null;
  metadata?: any;
  prerequisites?: string[];
  // Additional fields from existing interface
  video_url?: string | null;
  video_type?: string;
  vimeo_video_id?: string | null;
  vimeo_embed_url?: string | null;
  video_duration_seconds?: number | null;
  completion_threshold_percentage?: number;
  quiz_enabled?: boolean;
  quiz_questions?: any;
  passing_score?: number;
  scorm_file_path?: string | null;
  scorm_file_name?: string | null;
  scorm_compatible?: boolean;
  scorm_version?: string | null;
  thumbnail_url?: string | null;
  scene_count?: number;
  course_id?: string | null;
}

interface CourseDetailViewProps {
  module: TrainingModule | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (module: TrainingModule) => void;
  canEdit?: boolean;
}

export const CourseDetailView = ({ 
  module, 
  isOpen, 
  onClose, 
  onEdit, 
  canEdit = false 
}: CourseDetailViewProps) => {
  if (!isOpen || !module) return null;

  const getCourseId = (title: string, moduleId: string) => {
    const cleanTitle = title
      .replace(/\b(the|and|of|for|in|on|at|to|a|an)\b/gi, '')
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .substring(0, 3);
    
    const idSuffix = moduleId.slice(-4).replace(/[a-f]/gi, match => {
      const charCode = match.toLowerCase().charCodeAt(0);
      return String(charCode - 97);
    }).replace(/[g-z]/gi, match => {
      const charCode = match.toLowerCase().charCodeAt(0);
      return String((charCode - 97) % 10);
    });
    
    return `COR-${cleanTitle}${idSuffix}`;
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      case 'archived':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getPrerequisites = () => {
    if (module.metadata?.prerequisites) return module.metadata.prerequisites;
    if (module.prerequisites) return module.prerequisites;
    return [];
  };

  const getLearningObjective = () => {
    if (module.metadata?.learning_objective) return module.metadata.learning_objective;
    if (module.description) return module.description;
    return 'No learning objective specified';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l border-border shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Course Details</h2>
                <p className="text-sm text-muted-foreground">Compliance training metadata</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(module)}
                  className="hover:bg-primary/5"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Course Title & ID */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  {module.public_title && module.public_title !== module.title && (
                    <p className="text-sm text-muted-foreground">
                      Public Title: {module.public_title}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Course ID</p>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {getCourseId(module.title, module.id)}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(module.status)}
                      <span className="text-sm font-medium capitalize">
                        {module.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {module.tags && module.tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <span>Tags</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {module.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Target Roles */}
              {module.target_roles && module.target_roles.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Target Role</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      {module.target_roles.join(', ')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Learning Objective */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Learning Objective</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed">
                    {getLearningObjective()}
                  </p>
                </CardContent>
              </Card>

              {/* Prerequisites */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Prerequisites</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {getPrerequisites().length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {getPrerequisites().map((prereq: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </CardContent>
              </Card>

              {/* Course Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Language</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">{module.language || 'English'}</p>
                  </CardContent>
                </Card>

                {/* Duration */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      {formatDuration(module.estimated_duration || module.estimated_completion_time)}
                    </p>
                  </CardContent>
                </Card>

                {/* Credits */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Credits</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">{module.credit_value || 0}</p>
                  </CardContent>
                </Card>

                {/* Publish Date */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Publish Date</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">
                      {format(new Date(module.created_at), 'MMM dd, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metadata */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Category:</span>
                      <p>{module.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Industry:</span>
                      <p>{module.industry || 'General'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Required:</span>
                      <p>{module.is_required ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Difficulty:</span>
                      <p className="capitalize">{module.difficulty_level || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Published:</span>
                      <p>{module.is_published ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Accessible:</span>
                      <p>{module.accessibility_compliant ? 'Yes' : 'Not verified'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {format(new Date(module.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    <p>Updated: {format(new Date(module.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                    <p>Module ID: <code className="font-mono">{module.id}</code></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};