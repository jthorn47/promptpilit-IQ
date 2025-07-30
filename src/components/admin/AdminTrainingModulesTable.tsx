import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Edit, 
  Eye, 
  Trash2, 
  Award,
  Layers,
  Play,
  Share2,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CourseDetailView } from "@/components/training/CourseDetailView";

// Import training category images (using existing high-quality images)
import workplaceViolenceImg from "@/assets/training/workplace-violence-prevention.jpg";
import sexualHarassmentImg from "@/assets/training/sexual-harassment-prevention.jpg";
import diversityImg from "@/assets/training/diversity-equity-inclusion.jpg";
import cybersecurityImg from "@/assets/training/cybersecurity-awareness.jpg";
import dataPrivacyImg from "@/assets/training/data-privacy-gdpr.jpg";
import antiDiscriminationImg from "@/assets/training/anti-discrimination.jpg";
import codeOfConductImg from "@/assets/training/code-of-conduct.jpg";
import workplaceSafetyImg from "@/assets/training/workplace-safety-fundamentals.jpg";
import emergencyResponseImg from "@/assets/training/emergency-response.jpg";
import mentalHealthImg from "@/assets/training/mental-health-awareness.jpg";
import conflictResolutionImg from "@/assets/training/conflict-resolution.jpg";
import leadershipImg from "@/assets/training/leadership-development.jpg";
import customerServiceImg from "@/assets/training/customer-service.jpg";
import timeManagementImg from "@/assets/training/time-management.jpg";
import communicationImg from "@/assets/training/communication-skills.jpg";
import teamBuildingImg from "@/assets/training/team-building.jpg";
import performanceImg from "@/assets/training/performance-management.jpg";
import hiringImg from "@/assets/training/hiring-interviewing.jpg";
import oshaImg from "@/assets/training/osha-safety.jpg";
import fireSafetyImg from "@/assets/training/fire-safety.jpg";
import firstAidImg from "@/assets/training/first-aid-cpr.jpg";
import environmentalImg from "@/assets/training/environmental-compliance.jpg";

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: string;
  vimeo_video_id: string | null;
  vimeo_embed_url: string | null;
  video_duration_seconds: number | null;
  completion_threshold_percentage: number;
  estimated_duration: number | null;
  is_required: boolean;
  credit_value: number;
  quiz_enabled: boolean;
  quiz_questions: any;
  passing_score: number;
  status: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  scorm_file_path: string | null;
  scorm_file_name: string | null;
  scorm_compatible: boolean;
  scorm_version: string | null;
  category: string;
  thumbnail_url: string | null;
  scene_count?: number;
  course_id?: string | null;
  publishing_scope?: string;
  client_access?: {
    is_published: boolean;
    published_at: string | null;
  };
  // Additional extended fields for course details
  public_title?: string | null;
  tags?: string[] | null;
  target_roles?: string[] | null;
  language?: string | null;
  estimated_completion_time?: number | null;
  difficulty_level?: string | null;
  industry?: string | null;
  accessibility_compliant?: boolean | null;
  completion_method?: string | null;
  metadata?: any;
  prerequisites?: string[];
}

interface AdminTrainingModulesTableProps {
  modules: TrainingModule[];
  onEdit: (module: TrainingModule) => void;
  onDelete: (id: string) => void;
  onPreview: (module: TrainingModule) => void;
  onBuildScenes: (module: TrainingModule) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  onClientTogglePublish?: (moduleId: string, clientId: string, isPublished: boolean) => void;
  onOpenPublishDialog?: (module: TrainingModule) => void;
  viewMode: 'table' | 'cards';
  canEdit?: boolean;
  selectedClientId?: string;
}

export const AdminTrainingModulesTable = ({
  modules,
  onEdit,
  onDelete,
  onPreview,
  onBuildScenes,
  onTogglePublish,
  onClientTogglePublish,
  onOpenPublishDialog,
  viewMode,
  canEdit = true,
  selectedClientId
}: AdminTrainingModulesTableProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedModuleForDetails, setSelectedModuleForDetails] = useState<TrainingModule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<TrainingModule | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'destructive';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCourseId = (title: string, moduleId: string) => {
    // Extract first 3 letters from title, removing common words and spaces
    const cleanTitle = title
      .replace(/\b(the|and|of|for|in|on|at|to|a|an)\b/gi, '') // Remove common words
      .replace(/[^a-zA-Z]/g, '') // Remove non-letters
      .toUpperCase()
      .substring(0, 3);
    
    // Use last 4 characters of module ID and convert any letters to numbers
    const idSuffix = moduleId.slice(-4).replace(/[a-f]/gi, match => {
      const charCode = match.toLowerCase().charCodeAt(0);
      return String(charCode - 97); // Convert a-f to 0-5
    }).replace(/[g-z]/gi, match => {
      const charCode = match.toLowerCase().charCodeAt(0);
      return String((charCode - 97) % 10); // Convert g-z to 0-9
    });
    
    return `${cleanTitle}-${idSuffix}`;
  };

  const getCategoryImage = (category: string) => {
    switch (category) {
      case 'HR':
        return codeOfConductImg;
      case 'Safety':
        return workplaceSafetyImg;
      case 'Compliance':
        return environmentalImg;
      case 'Security':
        return cybersecurityImg;
      case 'Leadership':
        return leadershipImg;
      case 'Technical':
        return cybersecurityImg;
      case 'Customer Service':
        return customerServiceImg;
      case 'Diversity & Inclusion':
        return diversityImg;
      case 'Environmental':
        return environmentalImg;
      default:
        return workplaceSafetyImg;
    }
  };

  const handleDeleteClick = (module: TrainingModule) => {
    setModuleToDelete(module);
    setDeleteConfirmText("");
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText === "DELETE" && moduleToDelete) {
      onDelete(moduleToDelete.id);
      setDeleteDialogOpen(false);
      setModuleToDelete(null);
      setDeleteConfirmText("");
    }
  };
  return (
    <div className="relative bg-gradient-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50 p-3 md:p-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base md:text-lg font-semibold">Training Modules</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {modules.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No training modules yet</h3>
                  <p className="text-muted-foreground">Get started by creating your first training module</p>
                </div>
              </div>
            </div>
          ) : (
            viewMode === 'table' ? (
                <div className="overflow-hidden">
                  <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted">
                            <TableHead className="font-semibold">Title</TableHead>
                            <TableHead className="font-semibold">Credits</TableHead>
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold" title="Published">P</TableHead>
                            <TableHead className="font-semibold" title="Language">L</TableHead>
                            <TableHead className="font-semibold">Created</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                    <TableBody>
                      {modules.map((module) => (
                        <TableRow key={module.id} className="hover:bg-muted/30 transition-all duration-200 group hover-lift border-b border-border/30">
                           <TableCell className="py-3">
                             <div className="space-y-1">
                               <div 
                                 className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                                 onClick={() => setSelectedModuleForDetails(module)}
                                 title="Click to view course details"
                               >
                                 {module.title}
                               </div>
                               <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                                 {module.description || 'No description available'}
                               </div>
                             </div>
                           </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center space-x-2">
                              <Award className="w-3 h-3 text-amber-500" />
                              <span className="font-medium text-sm">{module.credit_value}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center space-x-2">
                              {module.scorm_file_path ? (
                                <>
                                  <Layers className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs font-medium text-blue-700">SCORM</span>
                                </>
                              ) : module.video_url ? (
                                <>
                                  <Eye className="w-3 h-3 text-green-500" />
                                  <span className="text-xs font-medium text-green-700">Video</span>
                                </>
                              ) : (
                                <>
                                  <BookOpen className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs font-medium text-gray-700">Basic</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant={getStatusBadgeVariant(module.status)} className="font-medium text-xs">
                              {module.status}
                            </Badge>
                          </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-center">
                                <span className="text-sm font-medium" title={module.is_published ? "Published" : "Unpublished"}>
                                  {module.is_published ? "P" : "UP"}
                                </span>
                              </div>
                            </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-center">
                              <span className="text-sm" title="English">EN</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(module.created_at), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                           <TableCell className="py-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPreview(module)}
                                className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onBuildScenes(module)}
                                className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 relative"
                              >
                                <Layers className="w-4 h-4" />
                                {module.scene_count !== undefined && module.scene_count > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {module.scene_count}
                                  </span>
                                )}
                              </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setSelectedModuleForDetails(module)}
                                 className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                 title="View course details"
                               >
                                 <Info className="w-4 h-4" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => onEdit(module)}
                                 className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                               >
                                 <Edit className="w-4 h-4" />
                               </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* Card View */
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {modules.map((module) => (
                    <Card key={module.id} className="border border-border/50 hover:border-primary/20 transition-all duration-200 hover:shadow-lg overflow-hidden">
                         {/* Thumbnail Image */}
                        <div 
                          className="h-24 overflow-hidden relative cursor-pointer group"
                          onClick={() => {
                            console.log('🖼️ Image clicked, opening full builder for module:', module.title);
                            onBuildScenes(module);
                          }}
                          title="Click to open training module builder"
                        >
                         <img
                           src={module.thumbnail_url || getCategoryImage(module.category)} 
                           alt={module.thumbnail_url ? `${module.title} thumbnail` : `${module.category} training illustration`}
                           className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                           onError={(e) => {
                             console.error(`🚨 Failed to load thumbnail for ${module.title}:`, e.currentTarget.src);
                             e.currentTarget.src = getCategoryImage(module.category);
                           }}
                           onLoad={() => {
                             console.log(`✅ Successfully loaded thumbnail for ${module.title}:`, module.thumbnail_url || getCategoryImage(module.category));
                           }}
                         />
                         <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent group-hover:from-primary/20 transition-all duration-200" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                           <Edit className="w-4 h-4 text-white drop-shadow-lg" />
                         </div>
                       </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                           {/* Header */}
                            <div className="flex items-start justify-between">
                               <div className="flex-1 min-w-0">
                                  <h3 
                                    className="font-semibold text-lg text-foreground cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => setSelectedModuleForDetails(module)}
                                    title="Click to view course details"
                                  >
                                    {module.title}
                                  </h3>
                                   <div className="flex items-center gap-2 mt-1 text-xs text-primary/50 justify-center">
                                     <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <span className="cursor-help flex items-center gap-2">
                                             <span title={module.category}>
                                               {module.category.substring(0, 2).toUpperCase()}
                                             </span>
                                             <span>•</span>
                                             <span title={module.is_published ? "Published" : "Unpublished"}>
                                               {module.is_published ? "P" : "UP"}
                                             </span>
                                             <span>•</span>
                                             <span title="English">E</span>
                                             <span>•</span>
                                             {/* Role Indicators */}
                                             <span title={module.target_roles?.includes('supervisor') ? "Supervisor" : "Learner"}>
                                               {module.target_roles?.includes('supervisor') ? "S" : "L"}
                                             </span>
                                             <span>•</span>
                                             {/* Difficulty Level Indicators */}
                                             <span title={module.difficulty_level === 'advanced' ? "Advanced" : "Beginner"}>
                                               {module.difficulty_level === 'advanced' ? "A" : "B"}
                                             </span>
                                             <span>•</span>
                                             <span 
                                               className="cursor-pointer hover:text-primary transition-colors font-mono"
                                               onClick={() => {
                                                 const courseId = getCourseId(module.title, module.id);
                                                 navigator.clipboard.writeText(courseId);
                                                 toast({
                                                   title: "Course ID copied!",
                                                   description: `${courseId} copied to clipboard`,
                                                 });
                                               }}
                                               title="Click to copy Course ID"
                                             >
                                               {getCourseId(module.title, module.id)}
                                             </span>
                                           </span>
                                         </TooltipTrigger>
                                         <TooltipContent>
                                           <p>Category: {module.category} • Status: {module.is_published ? 'Published' : 'Unpublished'} • Language: English • Role: {module.target_roles?.includes('supervisor') ? 'Supervisor' : 'Learner'} • Difficulty: {module.difficulty_level === 'advanced' ? 'Advanced' : 'Beginner'} • Course ID: {getCourseId(module.title, module.id)}</p>
                                         </TooltipContent>
                                       </Tooltip>
                                     </TooltipProvider>
                                   </div>
                                 <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                   {module.description || "No description available"}
                                 </p>
                              </div>
                            </div>

                          {/* Info Row */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>{module.credit_value} credits</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {module.scorm_file_path ? (
                                  <>
                                    <Layers className="w-4 h-4 text-blue-500" />
                                    <span className="text-blue-700">SCORM</span>
                                  </>
                                ) : module.video_url ? (
                                  <>
                                    <Eye className="w-4 h-4 text-green-500" />
                                    <span className="text-green-700">Video</span>
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-700">Basic</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <span className="text-muted-foreground">
                              {format(new Date(module.created_at), 'MMM dd')}
                            </span>
                          </div>

                           {/* Actions */}
                           <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => onPreview(module)}
                               className="flex-1 hover:bg-primary/5"
                             >
                               <Eye className="w-4 h-4 mr-2" />
                               Preview
                             </Button>
                             
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onBuildScenes(module)}
                                className="flex-1 hover:bg-primary/5 relative"
                              >
                                <Layers className="w-4 h-4 mr-2" />
                                Scenes
                                {module.scene_count !== undefined && module.scene_count > 0 && (
                                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                                    {module.scene_count}
                                  </span>
                                )}
                               </Button>
                               
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setSelectedModuleForDetails(module)}
                                 className="flex-1 hover:bg-primary/5"
                                 title="View course details"
                               >
                                 <Info className="w-4 h-4 mr-2" />
                                 Details
                               </Button>

                                {module.title !== "Core WPV Training" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteClick(module)}
                                    className="flex-1 hover:bg-destructive/90"
                                    title="Delete module"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                )}
                            </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )
           )}
         </CardContent>
       </div>
       
        {/* Course Detail View */}
        <CourseDetailView
          module={selectedModuleForDetails}
          isOpen={!!selectedModuleForDetails}
          onClose={() => setSelectedModuleForDetails(null)}
          onEdit={onEdit}
          canEdit={canEdit}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Delete Training Module
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <p>
                  You are about to permanently delete <strong>"{moduleToDelete?.title}"</strong>.
                </p>
                <p className="text-destructive font-medium">
                  This action cannot be undone and will permanently remove all associated data.
                </p>
                <p>
                  To confirm, type <strong>DELETE</strong> in all caps below:
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full"
                autoFocus
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setModuleToDelete(null);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== "DELETE"}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };