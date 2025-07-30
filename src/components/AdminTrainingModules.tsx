import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { TrainingBuilder } from "./TrainingBuilder";

import { AdminTrainingModulesHeader } from "./admin/AdminTrainingModulesHeader";
import { AdminTrainingModulesTable } from "./admin/AdminTrainingModulesTable";
import { TrainingModuleForm } from "./admin/TrainingModuleForm";
import { TrainingModulePreview } from "./admin/TrainingModulePreview";
import { TrainingPublishingDialog } from "./admin/TrainingPublishingDialog";

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
  publishing_scope?: string;
  client_access?: {
    is_published: boolean;
    published_at: string | null;
  };
}

export const AdminTrainingModules = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedModuleForScenes, setSelectedModuleForScenes] = useState<TrainingModule | "new" | null>(null);
  const [viewingModule, setViewingModule] = useState<TrainingModule | null>(null);
  const [publishingModule, setPublishingModule] = useState<TrainingModule | null>(null);
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    video_type: "upload",
    vimeo_video_id: "",
    vimeo_embed_url: "",
    completion_threshold_percentage: 80,
    is_required: false,
    credit_value: 1,
    quiz_enabled: false,
    status: "draft",
    scorm_file_path: "",
    scorm_file_name: "",
    scorm_compatible: false,
    scorm_version: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
    
    // Set up real-time subscription to training_modules table
    logger.ui.debug('Setting up real-time subscription for training_modules');
    const subscription = supabase
      .channel('training-modules-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'training_modules' 
        }, 
        (payload) => {
          logger.ui.debug('Real-time update received', { 
            eventType: payload.eventType,
            recordId: (payload.new as any)?.id || (payload.old as any)?.id 
          });
          // Refetch modules when any change occurs
          fetchModules();
        }
      )
      .subscribe((status) => {
        logger.ui.debug('Subscription status changed', { status });
      });

    return () => {
      logger.ui.debug('Cleaning up real-time subscription');
      supabase.removeChannel(subscription);
    };
  }, [selectedClientId]);

  // Debug logging for WPV Plan button visibility
  useEffect(() => {
    logger.ui.debug('Training modules summary', {
      totalModules: modules.length,
      moduleIds: modules.map(m => m.id),
      hasWPVModule: modules.some(m => m.title === 'Core WPV Training')
    });
    
    modules.forEach(m => {
      if (m.title.includes('WPV') || m.title.includes('Violence')) {
        logger.ui.debug('Found WPV-related module', { 
          title: m.title, 
          status: m.status 
        });
      }
    });
  }, [modules]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      console.log('🎓 Fetching training modules...');
      
      // Fetch training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("training_modules")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('🎓 Supabase response:', { data: modulesData, error: modulesError });

      if (modulesError) {
        console.error('🎓 Error fetching modules:', modulesError);
        throw modulesError;
      }

      // Fetch scene counts for each module
      const moduleIds = modulesData?.map(m => m.id) || [];
      const { data: sceneCounts, error: sceneError } = await supabase
        .from("training_scenes")
        .select("training_module_id")
        .in("training_module_id", moduleIds);

      if (sceneError) {
        console.error('🎓 Error fetching scene counts:', sceneError);
      }

      // Count scenes per module
      const sceneCountMap = (sceneCounts || []).reduce((acc, scene) => {
        acc[scene.training_module_id] = (acc[scene.training_module_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Fetch client-specific access if a client is selected
      let clientAccessMap: Record<string, any> = {};
      if (selectedClientId) {
        const { data: clientAccessData, error: clientAccessError } = await supabase
          .from("training_module_client_access")
          .select("training_module_id, is_published, published_at")
          .eq("client_id", selectedClientId);

        if (clientAccessError) {
          console.error('🎓 Error fetching client access:', clientAccessError);
        } else {
          clientAccessMap = (clientAccessData || []).reduce((acc, access) => {
            acc[access.training_module_id] = {
              is_published: access.is_published,
              published_at: access.published_at
            };
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine modules with scene counts and client access
      const modulesWithSceneCounts = (modulesData || []).map(module => ({
        ...module,
        scene_count: sceneCountMap[module.id] || 0,
        client_access: selectedClientId ? clientAccessMap[module.id] : undefined
      }));

      console.log('🎓 Fetched modules with scene counts and client access:', modulesWithSceneCounts?.map(m => ({ id: m.id, title: m.title, scene_count: m.scene_count, client_access: m.client_access })));
      setModules(modulesWithSceneCounts);
    } catch (error) {
      console.error("Error fetching training modules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch training modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Please enter a training title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const moduleData = {
        ...formData,
        credit_value: Number(formData.credit_value),
      };

      if (editingModule) {
        const { error } = await supabase
          .from("training_modules")
          .update(moduleData)
          .eq("id", editingModule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Training module updated successfully",
        });
      } else {
        const { data: newModule, error } = await supabase
          .from("training_modules")
          .insert([moduleData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Training module created successfully. Opening builder...",
        });

        // Automatically switch to training builder for the new module
        console.log('Setting selectedModuleForScenes to:', newModule);
        setSelectedModuleForScenes(newModule);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchModules();
    } catch (error: any) {
      console.error("Error saving training module:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save training module",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (module: TrainingModule) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      video_url: module.video_url || "",
      video_type: module.video_type,
      vimeo_video_id: module.vimeo_video_id || "",
      vimeo_embed_url: module.vimeo_embed_url || "",
      completion_threshold_percentage: module.completion_threshold_percentage || 80,
      is_required: module.is_required,
      credit_value: module.credit_value,
      quiz_enabled: module.quiz_enabled,
      status: module.status,
      scorm_file_path: module.scorm_file_path || "",
      scorm_file_name: module.scorm_file_name || "",
      scorm_compatible: module.scorm_compatible || false,
      scorm_version: module.scorm_version || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training module?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("training_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training module deleted successfully",
      });

      fetchModules();
    } catch (error: any) {
      console.error("Error deleting training module:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete training module",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from("training_modules")
        .update({ is_published: !isPublished })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Training module ${!isPublished ? 'published' : 'unpublished'} successfully`,
      });

      fetchModules();
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update publish status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      video_type: "upload",
      vimeo_video_id: "",
      vimeo_embed_url: "",
      completion_threshold_percentage: 80,
      is_required: false,
      credit_value: 1,
      quiz_enabled: false,
      status: "draft",
      scorm_file_path: "",
      scorm_file_name: "",
      scorm_compatible: false,
      scorm_version: "",
    });
    setEditingModule(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePublish = async (moduleId: string, scope: string, clientIds: string[], notes: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Update the training module's publishing scope
      const { error: moduleError } = await supabase
        .from("training_modules")
        .update({ 
          publishing_scope: scope,
          is_published: true 
        })
        .eq("id", moduleId);

      if (moduleError) throw moduleError;

      // If publishing to specific clients, update client access
      if (scope === "specific_clients" && clientIds.length > 0) {
        // Delete existing client access records for this module
        const { error: deleteError } = await supabase
          .from("training_module_client_access")
          .delete()
          .eq("training_module_id", moduleId);

        if (deleteError) throw deleteError;

        // Insert new client access records
        const accessRecords = clientIds.map(clientId => ({
          training_module_id: moduleId,
          client_id: clientId,
          is_published: true,
          published_at: new Date().toISOString(),
          published_by: userId,
          notes
        }));

        const { error: insertError } = await supabase
          .from("training_module_client_access")
          .insert(accessRecords);

        if (insertError) throw insertError;
      }

      // Add audit trail
      const { error: auditError } = await supabase
        .from("training_module_publishing_audit")
        .insert({
          training_module_id: moduleId,
          action_type: "published",
          publishing_scope: scope,
          client_ids: scope === "specific_clients" ? clientIds : [],
          performed_by: userId,
          notes
        });

      if (auditError) {
        console.error("Error creating audit trail:", auditError);
      }

      // Refresh modules to show updated status
      fetchModules();
    } catch (error) {
      console.error("Error publishing training module:", error);
      throw error;
    }
  };

  const handleClientTogglePublish = async (moduleId: string, clientId: string, isPublished: boolean) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const { error } = await supabase
        .from("training_module_client_access")
        .upsert({
          training_module_id: moduleId,
          client_id: clientId,
          is_published: !isPublished,
          published_at: !isPublished ? new Date().toISOString() : null,
          published_by: userId
        }, {
          onConflict: "training_module_id,client_id"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Training module ${!isPublished ? 'published' : 'unpublished'} for client`,
      });

      fetchModules();
    } catch (error: any) {
      console.error("Error toggling client publish status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client publish status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
        <div className="container mx-auto p-6">
          <div className="space-y-8">
            <div className="relative bg-gradient-card rounded-2xl p-8 shadow-soft border border-border/50">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Training Modules</h1>
              </div>
            </div>
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading training modules...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we want to create a new module, go directly to TrainingBuilder
  if (selectedModuleForScenes === "new") {
    return (
      <TrainingBuilder 
        moduleId="new"
        moduleName="New Training Module"
        onClose={() => setSelectedModuleForScenes(null)}
        isNewModule={true}
      />
    );
  }

  // If we have a selected module, show TrainingBuilder
  if (selectedModuleForScenes && typeof selectedModuleForScenes !== "string") {
    return (
      <TrainingBuilder 
        moduleId={selectedModuleForScenes.id}
        moduleName={selectedModuleForScenes.title}
        onClose={() => setSelectedModuleForScenes(null)}
        isNewModule={false}
      />
    );
  }

  // Filter modules based on search and category
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  console.log('🎓 Rendering AdminTrainingModulesHeader with showWPVPlan=true');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
      <div className="container mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 blur-3xl" />
          <div className="relative">
            <AdminTrainingModulesHeader
              onCreateModule={() => setSelectedModuleForScenes("new")}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedClientId={selectedClientId}
              onClientSelect={setSelectedClientId}
            />
          </div>
        </div>


        <div className="relative">
        <AdminTrainingModulesTable
          modules={filteredModules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={setViewingModule}
          onBuildScenes={setSelectedModuleForScenes}
          onTogglePublish={handleTogglePublish}
          onClientTogglePublish={handleClientTogglePublish}
          onOpenPublishDialog={setPublishingModule}
          viewMode={viewMode}
          canEdit={true}
          selectedClientId={selectedClientId}
        />
        </div>

        <TrainingModuleForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          editingModule={editingModule}
          formData={formData}
          onFormDataChange={handleInputChange}
          onSubmit={handleSubmit}
          isCreating={isCreating}
        />

        <TrainingModulePreview
          module={viewingModule}
          isOpen={!!viewingModule}
          onClose={() => setViewingModule(null)}
        />

        <TrainingPublishingDialog
          isOpen={!!publishingModule}
          onClose={() => setPublishingModule(null)}
          module={publishingModule}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
};