import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TrainingScene {
  id: string;
  training_module_id: string;
  title: string;
  description: string | null;
  scene_type: 'scorm' | 'video' | 'html' | 'quiz' | 'document';
  content_url: string | null;
  scorm_package_url: string | null;
  html_content: string | null;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  is_completion_scene: boolean;
  auto_advance: boolean;
  completion_criteria: any;
  metadata: any;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

export const useSceneManagement = (moduleId: string) => {
  const [actualModuleId, setActualModuleId] = useState(moduleId);
  const [scenes, setScenes] = useState<TrainingScene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const fetchScenes = async (targetModuleId?: string) => {
    const moduleIdToFetch = targetModuleId || actualModuleId;
    
    if (!moduleIdToFetch || moduleIdToFetch === "new") {
      setScenes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_scenes")
        .select("*")
        .eq("training_module_id", moduleIdToFetch)
        .order("scene_order", { ascending: true });

      if (error) throw error;
      const scenesData = (data || []) as TrainingScene[];
      setScenes(scenesData);
      
      // Auto-select first scene when scenes are loaded
      if (scenesData.length > 0 && currentSceneIndex >= scenesData.length) {
        setCurrentSceneIndex(0);
      }
    } catch (error) {
      console.error("Error fetching scenes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch training scenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFirstScene = async () => {
    if (!user || !session) {
      toast({
        title: "Error",
        description: "You must be logged in to create scenes",
        variant: "destructive",
      });
      return null;
    }

    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      let currentModuleId = actualModuleId;

      if (moduleId === "new") {
        const moduleData = {
          title: "New Training Module",
          description: "A new training module created with the training builder",
          video_type: "upload",
          completion_threshold_percentage: 80,
          is_required: false,
          credit_value: 1,
          quiz_enabled: false,
          status: "draft",
          category: "General", // Add required category field
          created_by: user.id,
        };

        const { data: newModule, error: moduleError } = await supabase
          .from("training_modules")
          .insert([moduleData])
          .select()
          .single();

        if (moduleError) throw moduleError;

        currentModuleId = newModule.id;
        setActualModuleId(currentModuleId);
      }

      const sceneData = {
        title: "Introduction",
        description: "Welcome to your training module. This introductory scene will help learners understand what they'll be learning and set expectations for the training.",
        scene_type: 'html' as TrainingScene['scene_type'],
        training_module_id: currentModuleId,
        estimated_duration: 2,
        scene_order: 1,
        is_required: true,
        status: 'active' as TrainingScene['status'],
        completion_criteria: { type: "time_based", required_percentage: 100 },
        metadata: { isIntroductoryScene: true },
        html_content: `
          <div style="padding: 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h1 style="color: #655DC6; font-size: 32px; margin-bottom: 20px;">Welcome to Your Training</h1>
            <p style="font-size: 18px; color: #666; line-height: 1.6; max-width: 600px; margin: 0 auto 30px;">
              This training module will help you learn new skills and knowledge. Take your time to go through each section carefully.
            </p>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">What You'll Learn:</h3>
              <ul style="text-align: left; max-width: 400px; margin: 0 auto; color: #555;">
                <li style="margin-bottom: 8px;">Key concepts and principles</li>
                <li style="margin-bottom: 8px;">Practical applications</li>
                <li style="margin-bottom: 8px;">Best practices and guidelines</li>
                <li>How to apply your learning</li>
              </ul>
            </div>
            <p style="color: #888; font-style: italic;">Click continue when you're ready to begin the training.</p>
          </div>
        `,
      };

      const { data: newScene, error } = await supabase
        .from("training_scenes")
        .insert([sceneData])
        .select()
        .single();

      if (error) throw error;

      // Immediately update scenes array with the new scene and auto-select it
      setScenes([newScene as TrainingScene]);
      setCurrentSceneIndex(0);
      
      toast({
        title: "Success",
        description: "Welcome! Your first scene has been created.",
      });
      
      return currentModuleId;
    } catch (error: any) {
      console.error("Error creating scene:", error);
      toast({
        title: "Error",
        description: "Failed to create scene",
        variant: "destructive",
      });
      return null;
    }
  };

  const addScene = async () => {
    if (!actualModuleId) return;

    try {
      const newSceneOrder = scenes.length + 1;
      const sceneData = {
        title: `Scene ${newSceneOrder}`,
        description: `Training scene ${newSceneOrder}`,
        scene_type: 'video' as TrainingScene['scene_type'],
        training_module_id: actualModuleId,
        estimated_duration: 5,
        scene_order: newSceneOrder,
        is_required: true,
        status: 'active' as TrainingScene['status'],
        completion_criteria: { type: "time_based", required_percentage: 100 },
        metadata: {},
      };

      const { error } = await supabase
        .from("training_scenes")
        .insert([sceneData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "New scene added successfully!",
      });

      await fetchScenes();
      setCurrentSceneIndex(scenes.length);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add new scene",
        variant: "destructive",
      });
    }
  };

  const markAsCompletion = async (sceneId: string) => {
    try {
      await supabase
        .from("training_scenes")
        .update({ is_completion_scene: false })
        .eq("training_module_id", actualModuleId);

      const { error } = await supabase
        .from("training_scenes")
        .update({ is_completion_scene: true })
        .eq("id", sceneId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scene marked as completion scene",
      });

      fetchScenes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark scene as completion",
        variant: "destructive",
      });
    }
  };

  const updateSceneContent = async (sceneId: string, contentUrl: string, sceneType: string = 'video') => {
    try {
      let updateData: any = { scene_type: sceneType };
      
      // Update the correct field based on scene type
      if (sceneType === 'scorm') {
        updateData.scorm_package_url = contentUrl;
      } else {
        updateData.content_url = contentUrl;
      }
      
      const { error } = await supabase
        .from("training_scenes")
        .update(updateData)
        .eq("id", sceneId);

      if (error) throw error;
      
      // Find the scene and update local state only - no auto fetch
      const scene = scenes.find(s => s.id === sceneId);
      if (scene) {
        // Update the scene in local state
        setScenes(prevScenes => 
          prevScenes.map(s => 
            s.id === sceneId 
              ? { ...s, [sceneType === 'scorm' ? 'scorm_package_url' : 'content_url']: contentUrl, scene_type: sceneType as any }
              : s
          )
        );
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (moduleId !== "new") {
      fetchScenes();
    } else {
      setLoading(false);
      setScenes([]);
    }
  }, [moduleId]);

  const currentScene = scenes[currentSceneIndex];

  return {
    scenes,
    currentScene,
    currentSceneIndex,
    setCurrentSceneIndex,
    loading,
    actualModuleId,
    setActualModuleId,
    fetchScenes,
    createFirstScene,
    addScene,
    markAsCompletion,
    updateSceneContent,
  };
};