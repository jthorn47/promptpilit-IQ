import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, AlertTriangle, Shield, Gavel, Loader2, ArrowLeft, Home, Trash2 } from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { useCaseTemplates, CaseTemplate } from '@/hooks/useCaseTemplates';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { CaseTemplateForm } from '@/components/templates/CaseTemplateForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'hr':
      return AlertTriangle;
    case 'compliance':
      return Shield;
    case 'legal':
      return Gavel;
    default:
      return FileText;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'hr':
      return 'text-red-500';
    case 'compliance':
      return 'text-blue-500';
    case 'legal':
      return 'text-purple-500';
    default:
      return 'text-orange-500';
  }
};

export const PulseTemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<CaseTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteTemplate, setDeleteTemplate] = useState<CaseTemplate | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { templates, loading, error, createTemplate, deleteTemplate: performDelete } = useCaseTemplates();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = async (templateData: any) => {
    setCreateLoading(true);
    try {
      await createTemplate(templateData);
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUseTemplate = (template: CaseTemplate) => {
    // Navigate to case creation with template pre-selected
    navigate('/pulse/new', { state: { selectedTemplate: template } });
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplate) return;
    
    setDeleteLoading(true);
    try {
      await performDelete(deleteTemplate.id);
      setDeleteTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <StandardPageLayout
      title="Case Templates"
      subtitle="Prebuilt workflows for common case types"
      badge="Active"
    >
      <div className="space-y-6">
        {/* Navigation breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/pulse/cases')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <span>/</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Admin Home
          </Button>
        </div>
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => {
                console.log('🔥 Create Template button clicked, setting showCreateForm to true');
                setShowCreateForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Categories */}
        <div className="flex gap-2">
          {['all', 'HR', 'Compliance', 'Legal', 'Safety'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Templates' : category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading templates...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Templates</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Templates Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const IconComponent = getCategoryIcon(template.category);
              const iconColor = getCategoryColor(template.category);
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setDeleteTemplate(template)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="mb-4 flex-1">
                      {template.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{template.steps?.length || 0} steps</span>
                      <span>~{template.estimated_duration_days} days</span>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or create a new template.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Template Preview Modal */}
        <TemplatePreviewModal
          template={previewTemplate}
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />

        {/* Template Creation Form */}
        <CaseTemplateForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSave={handleCreateTemplate}
          loading={createLoading}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTemplate} onOpenChange={(open) => !open && setDeleteTemplate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteTemplate?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTemplate}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Template'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StandardPageLayout>
  );
};