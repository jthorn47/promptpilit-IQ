import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuestionBuilderTabs } from "./QuestionBuilderTabs";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  Play,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Video,
  Image,
  FileText,
  HelpCircle,
  Save,
  Eye,
  Settings,
  Tag,
  Globe,
  Accessibility,
  Award,
  Download,
  Upload,
  Package,
  ShieldCheck,
  PenTool,
  Wand2
} from "lucide-react";
import { ModuleSettingsTab } from "./ModuleSettingsTab";
import { PreviewTab } from "./PreviewTab";

import { useTour } from "../tour/TourProvider";
import { ScormConfigTab } from "./ScormConfigTab";
import { DisclaimerSettingsTab } from "./DisclaimerSettingsTab";
import { AccessibilitySettingsTab } from "./AccessibilitySettingsTab";
import { VimeoVideoManager } from "../admin/VimeoVideoManager";
import { DocumentBuilder } from "../document-builder/DocumentBuilder";
import { CustomScormPlayer } from "../ui/custom-scorm-player";
import { ColossyanGeneratorModal } from "./components/ColossyanGeneratorModal";

type SceneTypeWithAI = 'video' | 'image' | 'quiz' | 'document' | 'scorm' | 'document_builder' | 'ai_video';

interface TrainingScene {
  id: string;
  title: string;
  description: string;
  scene_type: 'video' | 'image' | 'quiz' | 'document' | 'scorm' | 'document_builder';
  content_url?: string;
  scorm_package_url?: string;
  html_content?: string;
  scene_order: number;
  estimated_duration: number;
  is_required: boolean;
  auto_advance: boolean;
  metadata?: {
    is_ai_generated?: boolean;
    colossyan_generation_id?: string;
    quiz_config?: QuizConfig;
    media_config?: MediaConfig;
    accessibility_config?: AccessibilityConfig;
    multilingual_content?: MultilingualContent;
  };
}

interface QuizConfig {
  questions: QuizQuestion[];
  passing_score: number;
  allow_retries: boolean;
  max_retries: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  show_correct_answers: boolean;
  time_limit?: number;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question_text: string;
  options?: string[];
  correct_answer: string | number;
  explanation?: string;
  timestamp?: number; // For timestamp-based insertion
  points: number;
}

interface MediaConfig {
  autoplay: boolean;
  show_controls: boolean;
  subtitles_enabled: boolean;
  audio_narration?: string;
  overlay_text?: string;
  downloadable_resources?: DownloadableResource[];
}

interface DownloadableResource {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'document' | 'audio' | 'other';
  size: number;
}

interface AccessibilityConfig {
  alt_text: string;
  keyboard_navigation: boolean;
  high_contrast_mode: boolean;
  screen_reader_text?: string;
  captions_available: boolean;
  audio_descriptions: boolean;
}

interface MultilingualContent {
  languages: string[];
  default_language: string;
  translations: Record<string, {
    title: string;
    description: string;
    content: string;
  }>;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  industry: string;
  target_roles: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_completion_time: number;
  scorm_compatible: boolean;
  scorm_version?: '1.2' | '2004';
  accessibility_compliant: boolean;
  thumbnail_url?: string;
  scenes: TrainingScene[];
  metadata: {
    learning_objectives: string[];
    prerequisites: string[];
    completion_criteria: CompletionCriteria;
    certificate_template?: string;
    scorm_config?: ScormConfig;
    accessibility_settings?: AccessibilitySettings;
  };
}

interface AccessibilitySettings {
  wcag_compliance_level: 'A' | 'AA' | 'AAA';
  keyboard_navigation: boolean;
  screen_reader_support: boolean;
  high_contrast_mode: boolean;
  captions_required: boolean;
  audio_descriptions: boolean;
  sign_language_interpretation: boolean;
  reduced_motion: boolean;
  focus_indicators: boolean;
  alt_text_required: boolean;
  color_contrast_ratio: number;
  font_size_adjustable: boolean;
  auto_pause_media: boolean;
  skip_navigation_links: boolean;
  aria_labels_complete: boolean;
  semantic_markup: boolean;
  error_identification: boolean;
  language_identification: boolean;
}

interface ScormConfig {
  enabled: boolean;
  version: '1.2' | '2004';
  manifestFile?: string;
  packageUrl?: string;
  launchSettings: {
    autoStart: boolean;
    allowReview: boolean;
    showNavigation: boolean;
    allowBookmarking: boolean;
    maxTimeAllowed?: number;
    timeLimitAction: 'exit' | 'continue' | 'message';
  };
  completionSettings: {
    trackingMode: 'completion_status' | 'success_status' | 'score';
    passingScore?: number;
    maxAttempts?: number;
    allowRetry: boolean;
    saveProgress: boolean;
  };
  dataSettings: {
    trackInteractions: boolean;
    trackObjectives: boolean;
    trackTime: boolean;
    suspendData: boolean;
    studentPreferences: boolean;
  };
  securitySettings: {
    preventCheating: boolean;
    allowPrintScreen: boolean;
    allowRightClick: boolean;
    allowTextSelection: boolean;
    secureMode: boolean;
  };
  displaySettings: {
    width: number;
    height: number;
    resizable: boolean;
    fullscreen: boolean;
    showMenubar: boolean;
    showStatusbar: boolean;
    showToolbar: boolean;
  };
}

interface CompletionCriteria {
  min_score: number;
  required_scenes: string[];
  time_requirements?: {
    min_time_spent: number;
    max_time_allowed?: number;
  };
}

interface EnhancedTrainingBuilderProps {
  moduleId?: string;
  onClose: () => void;
  isNewModule?: boolean;
}

export const EnhancedTrainingBuilder = ({ 
  moduleId, 
  onClose, 
  isNewModule = false 
}: EnhancedTrainingBuilderProps) => {
  const [module, setModule] = useState<TrainingModule>({
    id: (moduleId && moduleId !== 'new' && !isNewModule) ? moduleId : crypto.randomUUID(),
    title: '',
    description: '',
    category: 'General',
    tags: [],
    language: 'en',
    industry: '',
    target_roles: [],
    difficulty_level: 'beginner',
    estimated_completion_time: 0,
    scorm_compatible: false,
    accessibility_compliant: true,
    scenes: [],
    metadata: {
      learning_objectives: [],
      prerequisites: [],
      completion_criteria: {
        min_score: 80,
        required_scenes: []
      },
      scorm_config: {
        enabled: false,
        version: '1.2',
        launchSettings: {
          autoStart: false,
          allowReview: true,
          showNavigation: true,
          allowBookmarking: true,
          timeLimitAction: 'continue'
        },
        completionSettings: {
          trackingMode: 'completion_status',
          allowRetry: true,
          saveProgress: true
        },
        dataSettings: {
          trackInteractions: true,
          trackObjectives: true,
          trackTime: true,
          suspendData: true,
          studentPreferences: true
        },
        securitySettings: {
          preventCheating: false,
          allowPrintScreen: true,
          allowRightClick: true,
          allowTextSelection: true,
          secureMode: false
        },
        displaySettings: {
          width: 800,
          height: 600,
          resizable: true,
          fullscreen: true,
          showMenubar: false,
          showStatusbar: false,
          showToolbar: false
        }
      }
    }
  });

  const [currentScene, setCurrentScene] = useState<TrainingScene | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenes' | 'quiz' | 'settings' | 'preview' | 'scorm' | 'disclaimers' | 'accessibility' | 'certificates' | 'vimeo'>('scenes');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showColossyanModal, setShowColossyanModal] = useState(false);

  const { toast } = useToast();
  const { startTour } = useTour();

  // File upload functionality
  const { uploading, uploadProgress, uploadFile } = useFileUpload({
    onFileUploaded: async (filePath: string, fileName: string) => {
      if (!currentScene) return;
      
      console.log('🔗 File uploaded:', { filePath, fileName });
      
      // Check if this is a SCORM file (based on file name or URL)
      const isScormFile = fileName.toLowerCase().endsWith('.zip') || 
                         filePath.includes('/scorm/') ||
                         filePath.includes('scorm-launch');
      
      // Update the current scene with the uploaded content
      if (isScormFile && currentScene.scene_type === 'scorm') {
        // For SCORM files, update scorm_package_url
        const updatedScenes = module.scenes.map(s =>
          s.id === currentScene.id ? { ...s, scorm_package_url: filePath } : s
        );
        setModule(prev => ({ ...prev, scenes: updatedScenes }));
        setCurrentScene({ ...currentScene, scorm_package_url: filePath });
        console.log('🎓 SCORM package URL updated:', filePath);
      } else {
        // For other files, update content_url
        const updatedScenes = module.scenes.map(s =>
          s.id === currentScene.id ? { ...s, content_url: filePath } : s
        );
        setModule(prev => ({ ...prev, scenes: updatedScenes }));
        setCurrentScene({ ...currentScene, content_url: filePath });
      }
      
      setSaveStatus('unsaved');
      
      toast({
        title: "File Uploaded",
        description: `${fileName} has been uploaded successfully`,
      });
    }
  });

  // Load existing module
  useEffect(() => {
    if (moduleId && moduleId !== 'new' && !isNewModule) {
      loadModule();
    }
  }, [moduleId, isNewModule]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const { data: moduleData, error: moduleError } = await supabase
        .from('training_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      const { data: scenesData, error: scenesError } = await supabase
        .from('training_scenes')
        .select('*')
        .eq('training_module_id', moduleId)
        .order('scene_order');

      if (scenesError) throw scenesError;

      setModule({
        id: moduleData.id,
        title: moduleData.title || '',
        description: moduleData.description || '',
        category: moduleData.category || '',
        tags: (moduleData as any).tags || [],
        language: (moduleData as any).language || 'en',
        industry: (moduleData as any).industry || '',
        target_roles: (moduleData as any).target_roles || [],
        difficulty_level: (moduleData as any).difficulty_level || 'beginner',
        estimated_completion_time: (moduleData as any).estimated_completion_time || 0,
        scorm_compatible: (moduleData as any).scorm_compatible || false,
        scorm_version: (moduleData as any).scorm_version,
        accessibility_compliant: (moduleData as any).accessibility_compliant || true,
        metadata: (moduleData as any).metadata || {
          learning_objectives: [],
          prerequisites: [],
          completion_criteria: { min_score: 80, required_scenes: [] }
        },
        scenes: (scenesData || []).map(scene => ({
          ...scene,
          scene_type: scene.scene_type as 'video' | 'image' | 'quiz' | 'document' | 'scorm',
          metadata: scene.metadata as any
        }))
      });
    } catch (error) {
      console.error('Error loading module:', error);
      toast({
        title: "Error",
        description: "Failed to load training module",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // Scene Management
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(module.scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update scene orders
    const updatedScenes = items.map((scene, index) => ({
      ...scene,
      scene_order: index
    }));

    setModule(prev => ({ ...prev, scenes: updatedScenes }));
    setSaveStatus('unsaved');
  };

  const addScene = (type: SceneTypeWithAI) => {
    const newScene: TrainingScene = {
      id: crypto.randomUUID(),
      title: `New ${type === 'ai_video' ? 'AI Video' : type} Scene`,
      description: '',
      scene_type: type === 'ai_video' ? 'video' : type, // Store as video but track AI generation separately
      scene_order: module.scenes.length,
      estimated_duration: 5,
      is_required: true,
      auto_advance: false,
      metadata: {
        is_ai_generated: type === 'ai_video',
        accessibility_config: {
          alt_text: '',
          keyboard_navigation: true,
          high_contrast_mode: false,
          captions_available: false,
          audio_descriptions: false
        },
        multilingual_content: {
          languages: ['en'],
          default_language: 'en',
          translations: {
            en: {
              title: `New ${type === 'ai_video' ? 'AI Video' : type} Scene`,
              description: '',
              content: ''
            }
          }
        }
      }
    };

    setModule(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene]
    }));
    setCurrentScene(newScene);
    
    // Auto-switch to Question Builder tab for quiz scenes
    if (type === 'quiz') {
      setActiveTab('quiz');
    }
    
    setSaveStatus('unsaved');
  };

  const deleteScene = (sceneId: string) => {
    setModule(prev => ({
      ...prev,
      scenes: prev.scenes.filter(scene => scene.id !== sceneId)
    }));
    if (currentScene?.id === sceneId) {
      setCurrentScene(null);
    }
    setSaveStatus('unsaved');
  };

  const duplicateScene = (scene: TrainingScene) => {
    const duplicatedScene: TrainingScene = {
      ...scene,
      id: crypto.randomUUID(),
      title: `${scene.title} (Copy)`,
      scene_order: module.scenes.length
    };

    setModule(prev => ({
      ...prev,
      scenes: [...prev.scenes, duplicatedScene]
    }));
    setSaveStatus('unsaved');
  };

  const cloneModule = async (sourceModuleId: string, newTitle?: string) => {
    try {
      setLoading(true);
      
      // Fetch source module
      const { data: sourceModule, error: moduleError } = await supabase
        .from('training_modules')
        .select('*')
        .eq('id', sourceModuleId)
        .single();

      if (moduleError) throw moduleError;

      // Fetch source scenes
      const { data: sourceScenes, error: scenesError } = await supabase
        .from('training_scenes')
        .select('*')
        .eq('training_module_id', sourceModuleId)
        .order('scene_order');

      if (scenesError) throw scenesError;

      // Generate new IDs
      const newModuleId = crypto.randomUUID();
      const newTitle_final = newTitle || `${sourceModule.title} (Clone)`;

      // Clone module data
      const clonedModuleData = {
        ...sourceModule,
        id: newModuleId,
        title: newTitle_final,
        status: 'draft',
        created_at: undefined, // Let database set new timestamp
        updated_at: undefined
      };

      // Insert cloned module
      const { error: insertModuleError } = await supabase
        .from('training_modules')
        .insert(clonedModuleData);

      if (insertModuleError) throw insertModuleError;

      // Clone scenes with new IDs
      const clonedScenes = (sourceScenes || []).map(scene => ({
        ...scene,
        id: crypto.randomUUID(),
        training_module_id: newModuleId,
        created_at: undefined,
        updated_at: undefined
      }));

      // Insert cloned scenes
      if (clonedScenes.length > 0) {
        const { error: insertScenesError } = await supabase
          .from('training_scenes')
          .insert(clonedScenes);

        if (insertScenesError) throw insertScenesError;
      }

      toast({
        title: "Success",
        description: `Module "${newTitle_final}" cloned successfully!`,
      });

      // Load the cloned module
      setModule({
        id: newModuleId,
        title: clonedModuleData.title,
        description: clonedModuleData.description || '',
        category: clonedModuleData.category || '',
        tags: (clonedModuleData as any).tags || [],
        language: (clonedModuleData as any).language || 'en',
        industry: (clonedModuleData as any).industry || '',
        target_roles: (clonedModuleData as any).target_roles || [],
        difficulty_level: (clonedModuleData as any).difficulty_level || 'beginner',
        estimated_completion_time: (clonedModuleData as any).estimated_completion_time || 0,
        scorm_compatible: (clonedModuleData as any).scorm_compatible || false,
        scorm_version: (clonedModuleData as any).scorm_version,
        accessibility_compliant: (clonedModuleData as any).accessibility_compliant || true,
        metadata: (clonedModuleData as any).metadata || {
          learning_objectives: [],
          prerequisites: [],
          completion_criteria: { min_score: 80, required_scenes: [] }
        },
        scenes: clonedScenes.map(scene => ({
          ...scene,
          scene_type: scene.scene_type as 'video' | 'image' | 'quiz' | 'document' | 'scorm',
          metadata: scene.metadata as any
        }))
      });

      return newModuleId;

    } catch (error) {
      console.error('Error cloning module:', error);
      toast({
        title: "Error",
        description: "Failed to clone training module",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save functionality
  const handleSave = async (silent = false) => {
    try {
      // Validate required fields
      if (!module.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a module title before saving",
          variant: "destructive",
        });
        return;
      }

      setSaveStatus('saving');
      
      // Save module
      const moduleUpdateData = {
        title: module.title,
        description: module.description,
        category: module.category,
        tags: module.tags,
        language: module.language,
        industry: module.industry,
        target_roles: module.target_roles,
        difficulty_level: module.difficulty_level,
        estimated_completion_time: module.estimated_completion_time,
        scorm_compatible: module.scorm_compatible,
        scorm_version: module.scorm_version,
        accessibility_compliant: module.accessibility_compliant,
        thumbnail_url: module.thumbnail_url,
        vimeo_video_id: (module as any).vimeo_video_id,
        vimeo_embed_url: (module as any).vimeo_embed_url,
        completion_threshold_percentage: (module as any).completion_threshold_percentage,
        metadata: JSON.parse(JSON.stringify(module.metadata)),
        status: 'draft'
      };

      // Generate new UUID for new modules to prevent duplicate key errors
      const finalModuleId = (isNewModule || moduleId === 'new') ? crypto.randomUUID() : module.id;
      
      const { error: moduleError } = (isNewModule || moduleId === 'new')
        ? await supabase.from('training_modules').insert({ ...moduleUpdateData, id: finalModuleId })
        : await supabase.from('training_modules').update(moduleUpdateData).eq('id', module.id);

      if (moduleError) throw moduleError;

      // Update module state with the correct ID for new modules
      if (isNewModule || moduleId === 'new') {
        setModule(prev => ({ ...prev, id: finalModuleId }));
      }

      // Save scenes
      for (const scene of module.scenes) {
        const { error: sceneError } = await supabase
          .from('training_scenes')
          .upsert({
            id: scene.id,
            training_module_id: finalModuleId,
            title: scene.title,
            description: scene.description,
            scene_type: scene.scene_type,
            content_url: scene.content_url,
            scorm_package_url: scene.scorm_package_url,
            html_content: scene.html_content,
            scene_order: scene.scene_order,
            estimated_duration: scene.estimated_duration,
            is_required: scene.is_required,
            auto_advance: scene.auto_advance,
            metadata: scene.metadata as any
          });

        if (sceneError) throw sceneError;
      }

      setSaveStatus('saved');
      
      if (!silent) {
        toast({
          title: "Success", 
          description: "Training module saved successfully",
        });
        
        // Only redirect when explicitly saving, not on auto-save
        // onClose(); // Removed this line to prevent navigation on settings changes
      }
    } catch (error) {
      console.error('Error saving module:', error);
      setSaveStatus('unsaved');
    }
  };

  const handlePublish = async () => {
    try {
      // Validation before publishing
      if (!module.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Module title is required",
          variant: "destructive",
        });
        return;
      }

      if (module.scenes.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one scene is required",
          variant: "destructive",
        });
        return;
      }

      // Save first
      await handleSave(true);

      // Then publish
      const { error } = await supabase
        .from('training_modules')
        .update({ status: 'published' })
        .eq('id', module.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training module published successfully",
      });
    } catch (error) {
      console.error('Error publishing module:', error);
      toast({
        title: "Error",
        description: "Failed to publish training module",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading training builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              ← Back to Modules
            </Button>
            <div className="flex-1">
              <Input
                value={module.title}
                onChange={(e) => {
                  setModule(prev => ({ ...prev, title: e.target.value }));
                  setSaveStatus('unsaved');
                }}
                placeholder="Enter training module title"
                className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`transition-colors ${
                  saveStatus === 'saved' ? 'text-green-600' : 
                  saveStatus === 'saving' ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  Status: {saveStatus === 'saved' ? '✓ Saved' : 
                           saveStatus === 'saving' ? '⏳ Saving...' : '⚠ Unsaved changes'}
                </span>
                {module.scorm_compatible && <Badge variant="secondary">SCORM</Badge>}
                {module.accessibility_compliant && <Badge variant="secondary">WCAG 2.2 AA</Badge>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => startTour('training-builder')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Take Tour
            </Button>
            <Button 
              onClick={() => cloneModule('fb33e984-b169-4b56-a442-09b4ac021f94', 'COR-1594 Clone')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Clone COR-1594
            </Button>
            <Button variant="outline" onClick={() => handleSave()}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="bg-primary">
              <Upload className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-9 border-b rounded-none h-auto p-0 flex-shrink-0">
            <TabsTrigger value="scenes" className="rounded-none py-3 px-4">
              <GripVertical className="w-4 h-4 mr-2" />
              Scenes
            </TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-none py-3 px-4" data-tour="quiz-tab">
              <HelpCircle className="w-4 h-4 mr-2" />
              Question Builder
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none py-3 px-4" data-tour="settings-tab">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="rounded-none py-3 px-4">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="scorm" className="rounded-none py-3 px-4">
              <Package className="w-4 h-4 mr-2" />
              SCORM
            </TabsTrigger>
            <TabsTrigger value="disclaimers" className="rounded-none py-3 px-4">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Disclaimers
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="rounded-none py-3 px-4">
              <Accessibility className="w-4 h-4 mr-2" />
              WCAG 2.2
            </TabsTrigger>
            <TabsTrigger value="vimeo" className="rounded-none py-3 px-4">
              <Video className="w-4 h-4 mr-2" />
              Vimeo
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {/* Scenes Tab - Scene Management with Sidebar Layout */}
            <TabsContent value="scenes" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="h-full flex">
                {/* Scene Sidebar */}
                <div className="w-80 border-r overflow-y-auto bg-muted/30" data-tour="scene-sidebar">
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Scenes</h3>
                    
                    {/* Scene Types */}
                    <div className="mb-4 space-y-2" data-tour="scene-types">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addScene('video')}
                        className="w-full justify-start"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Add Video Scene
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addScene('ai_video')}
                        className="w-full justify-start bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Add AI Training Video Scene
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addScene('image')}
                        className="w-full justify-start"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Add Image Scene
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addScene('document_builder')}
                        className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Add Document Builder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addScene('quiz')}
                        className="w-full justify-start"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Add Question Builder
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => addScene('scorm')}
                         className="w-full justify-start"
                       >
                         <Package className="w-4 h-4 mr-2" />
                         Add SCORM Scene
                       </Button>
                     </div>

                    {/* Scene List */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="scenes">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {module.scenes.map((scene, index) => (
                              <Draggable key={scene.id} draggableId={scene.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`cursor-pointer transition-colors ${
                                      currentScene?.id === scene.id
                                        ? 'ring-2 ring-primary bg-primary/5'
                                        : 'hover:bg-muted/50'
                                    } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                    onClick={() => setCurrentScene(scene)}
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-muted-foreground hover:text-foreground"
                                        >
                                          <GripVertical className="w-4 h-4" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            {scene.scene_type === 'video' && <Video className="w-4 h-4" />}
                                            {scene.scene_type === 'image' && <Image className="w-4 h-4" />}
                                            {scene.scene_type === 'document' && <FileText className="w-4 h-4" />}
                                             {scene.scene_type === 'quiz' && <HelpCircle className="w-4 h-4" />}
                                             {scene.scene_type === 'scorm' && <Package className="w-4 h-4" />}
                                            <span className="font-medium text-sm truncate">
                                              {scene.title}
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {scene.estimated_duration}m • {scene.scene_type}
                                          </div>
                                        </div>

                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              duplicateScene(scene);
                                            }}
                                          >
                                            <Copy className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteScene(scene.id);
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {module.scenes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <GripVertical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No scenes yet</p>
                        <p className="text-xs">Add your first scene to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scene Editor */}
                <div className="flex-1 overflow-y-auto">
                  {currentScene ? (
                    <div className="p-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold mb-2">{currentScene.title}</h2>
                        <Badge variant="outline" className="mb-4">
                          {currentScene.scene_type.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Scene Content Preview */}
                      <Card className="mb-6">
                        <CardContent className="p-6">
                           <div className="min-h-64 bg-muted/30 rounded-lg flex items-center justify-center mb-4 [&:has(.document-builder)]:h-auto [&:has(.document-builder)]:min-h-[600px]">
                             {currentScene.content_url ? (
                               // Show actual content if uploaded
                               <div className="w-full h-full rounded-lg overflow-hidden">
                                 {currentScene.scene_type === 'video' && (
                                   <>
                                     {currentScene.content_url.includes('vimeo.com') || currentScene.content_url.includes('youtube.com') || currentScene.content_url.includes('player.vimeo.com') ? (
                                       // Show embedded video
                                       <iframe 
                                         src={currentScene.content_url}
                                         className="w-full h-full"
                                         frameBorder="0"
                                         allow="autoplay; fullscreen; picture-in-picture"
                                         allowFullScreen
                                         title={currentScene.title}
                                       />
                                     ) : (
                                       // Show uploaded video file
                                       <video 
                                         controls 
                                         className="w-full h-full object-cover"
                                         src={currentScene.content_url}
                                       >
                                         Your browser does not support the video tag.
                                       </video>
                                     )}
                                   </>
                                 )}
                                 {currentScene.scene_type === 'image' && (
                                   <img 
                                     src={currentScene.content_url} 
                                     alt={currentScene.title}
                                     className="w-full h-full object-cover"
                                   />
                                 )}
                                 {currentScene.scene_type === 'document' && (
                                   <div className="w-full h-full flex items-center justify-center">
                                     <div className="text-center">
                                       <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                       <p className="text-muted-foreground">Document uploaded</p>
                                     </div>
                                   </div>
                                  )}
                                  {currentScene.scene_type === 'scorm' && currentScene.scorm_package_url && (
                                    <div className="w-full h-full">
                                      <CustomScormPlayer
                                        scormPackageUrl={currentScene.scorm_package_url}
                                        moduleName={currentScene.title}
                                        onComplete={(score, duration) => {
                                          console.log('Enhanced Training Builder SCORM completed:', { score, duration });
                                        }}
                                        onProgress={(progress) => {
                                          console.log('Enhanced Training Builder SCORM progress:', progress);
                                        }}
                                      />
                                    </div>
                                  )}
                               </div>
                             ) : (
                               // Show placeholder if no content
                               <>
                                 {currentScene.scene_type === 'video' && (
                                   <div className="text-center w-full">
                                     <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                                       <Play className="w-8 h-8" />
                                     </div>
                                     <p className="text-muted-foreground mb-4">No video added yet</p>
                                     
                                      {/* Video Source Options */}
                                      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                       <div className="space-y-2">
                                         <h4 className="font-medium">Upload Video File</h4>
                                         <Button 
                                           variant="outline"
                                           className="w-full" 
                                           onClick={() => document.getElementById('video-upload')?.click()}
                                           disabled={uploading}
                                         >
                                           <Upload className="w-4 h-4 mr-2" />
                                           {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload Video'}
                                         </Button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Generate with AI</h4>
                                          <Button 
                                            variant="outline"
                                            className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100" 
                                            onClick={() => setShowColossyanModal(true)}
                                            disabled={!currentScene}
                                          >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Generate Video
                                          </Button>
                                          <p className="text-xs text-muted-foreground">
                                            Create SCORM videos with Colossyan AI
                                          </p>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Embed Video</h4>
                                         <div className="space-y-2">
                                           <Input
                                             placeholder="Paste Vimeo or YouTube URL..."
                                             value=""
                                             onChange={(e) => {
                                               const url = e.target.value.trim();
                                               if (url) {
                                                 let embedUrl = url;
                                                 
                                                 // Convert YouTube URLs to embed format
                                                 if (url.includes('youtube.com/watch?v=')) {
                                                   const videoId = url.split('v=')[1]?.split('&')[0];
                                                   embedUrl = `https://www.youtube.com/embed/${videoId}`;
                                                 } else if (url.includes('youtu.be/')) {
                                                   const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                                                   embedUrl = `https://www.youtube.com/embed/${videoId}`;
                                                 }
                                                 // Convert Vimeo URLs to embed format
                                                 else if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
                                                   const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                                                   embedUrl = `https://player.vimeo.com/video/${videoId}`;
                                                 }
                                                 
                                                 const updatedScenes = module.scenes.map(s =>
                                                   s.id === currentScene.id ? { ...s, content_url: embedUrl } : s
                                                 );
                                                 setModule(prev => ({ ...prev, scenes: updatedScenes }));
                                                 setCurrentScene({ ...currentScene, content_url: embedUrl });
                                                 setSaveStatus('unsaved');
                                               }
                                             }}
                                           />
                                           <p className="text-xs text-muted-foreground">
                                             Supports Vimeo and YouTube URLs
                                           </p>
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 )}
                                 {currentScene.scene_type === 'image' && (
                                   <div className="text-center">
                                     <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                     <p className="text-muted-foreground">No image uploaded</p>
                                     <Button 
                                       className="mt-2" 
                                       onClick={() => document.getElementById('image-upload')?.click()}
                                       disabled={uploading}
                                     >
                                       <Upload className="w-4 h-4 mr-2" />
                                       {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload Image'}
                                     </Button>
                                   </div>
                                 )}
                                 {currentScene.scene_type === 'document' && (
                                   <div className="text-center">
                                     <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                     <p className="text-muted-foreground">No document uploaded</p>
                                     <Button 
                                       className="mt-2" 
                                       onClick={() => document.getElementById('document-upload')?.click()}
                                       disabled={uploading}
                                     >
                                       <Upload className="w-4 h-4 mr-2" />
                                       {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload Document'}
                                     </Button>
                                   </div>
                                 )}
                                   {currentScene.scene_type === 'quiz' && (
                                     <div className="text-center">
                                       <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                       <p className="text-muted-foreground">Questions will be created in the Question Builder tab</p>
                                     </div>
                                   )}
                                  {currentScene.scene_type === 'document_builder' && (
                                    <div className="document-builder w-full min-h-[600px] h-full">
                                      <DocumentBuilder
                                        documentId={undefined}
                                        documentTypeId={undefined}
                                        onSave={(doc) => {
                                          toast({
                                            title: "Document Saved",
                                            description: "Document has been saved successfully",
                                          });
                                        }}
                                        onClose={() => {}}
                                      />
                                     </div>
                                   )}
                                    {currentScene.scene_type === 'scorm' && (
                                      <div>
                                        {currentScene.scorm_package_url ? (
                                          <div className="space-y-4">
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Package className="w-5 h-5 text-green-600" />
                                                <span className="text-sm font-medium text-green-800 dark:text-green-200">SCORM Package Loaded</span>
                                              </div>
                                              <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                                                Your SCORM package is ready to use.
                                              </p>
                                              <div className="flex gap-2">
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    const updatedScenes = module.scenes.map(s =>
                                                      s.id === currentScene.id ? { ...s, scorm_package_url: '' } : s
                                                    );
                                                    setModule(prev => ({ ...prev, scenes: updatedScenes }));
                                                    setCurrentScene({ ...currentScene, scorm_package_url: '' });
                                                    setSaveStatus('unsaved');
                                                  }}
                                                >
                                                  <Trash2 className="w-3 h-3 mr-1" />
                                                  Remove Package
                                                </Button>
                                              </div>
                                            </div>
                                            <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                                              <CustomScormPlayer 
                                                scormPackageUrl={currentScene.scorm_package_url}
                                                onComplete={() => {
                                                  console.log('SCORM package completed');
                                                }}
                                                onProgress={(progress) => {
                                                  console.log('SCORM progress:', progress);
                                                }}
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-center">
                                            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-muted-foreground mb-4">No SCORM package uploaded</p>
                                        <Button 
                                          className="mt-2" 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('🎓 SCORM upload button clicked - NEW METHOD');
                                            
                                            // Create a fresh input element
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = '.zip';
                                            input.style.display = 'none';
                                            
                                            input.onchange = (event) => {
                                              const target = event.target as HTMLInputElement;
                                              const files = target.files;
                                              console.log('🎓 NEW METHOD - Files selected:', files?.length);
                                              
                                              if (files && files.length > 0) {
                                                const file = files[0];
                                                console.log('🎓 NEW METHOD - File details:', { 
                                                  name: file.name, 
                                                  type: file.type, 
                                                  size: file.size 
                                                });
                                                
                                                if (file.name.toLowerCase().endsWith('.zip')) {
                                                  uploadFile(file);
                                                } else {
                                                  console.error('❌ Please select a .zip file');
                                                }
                                              }
                                              
                                              // Clean up
                                              document.body.removeChild(input);
                                            };
                                            
                                            document.body.appendChild(input);
                                            input.click();
                                          }}
                                          disabled={uploading}
                                        >
                                              <Upload className="w-4 h-4 mr-2" />
                                              {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload SCORM Package'}
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-2">
                                              Supports SCORM 1.2 and SCORM 2004 (.zip files)
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                               </>
                             )}
                           </div>

                           {/* Hidden file inputs */}
                            <input
                              id="video-upload"
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                console.log('📹 Video file input triggered:', { file: file?.name, type: file?.type });
                                if (file) uploadFile(file);
                              }}
                            />
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                console.log('🖼️ Image file input triggered:', { file: file?.name, type: file?.type });
                                if (file) uploadFile(file);
                              }}
                            />
                            <input
                              id="document-upload"
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.zip"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                console.log('📄 Document file input triggered:', { file: file?.name, type: file?.type });
                                if (file) uploadFile(file);
                               }}
                             />
                             <input
                               id="scorm-upload"
                               type="file"
                               accept=".zip"
                               multiple={false}
                               className="hidden"
                               style={{ display: 'none' }}
                               onChange={(e) => {
                                 console.log('🎓 File input onChange triggered');
                                 const files = e.target.files;
                                 console.log('🎓 Files selected:', files?.length);
                                 console.log('🎓 Full file list:', Array.from(files || []).map(f => ({ name: f.name, type: f.type, size: f.size })));
                                
                                if (!files || files.length === 0) {
                                  console.log('❌ No files selected');
                                  return;
                                }
                                
                                const file = files[0];
                                console.log('🎓 SCORM file input triggered:', { 
                                  file: file?.name, 
                                  type: file?.type, 
                                  size: file?.size,
                                  currentScene: currentScene?.scene_type 
                                });
                                
                                if (file && currentScene) {
                                  if (!file.name.toLowerCase().endsWith('.zip')) {
                                    console.log('❌ Invalid file type:', file.name);
                                    toast({
                                      title: "Invalid File Type",
                                      description: "Please select a ZIP file containing SCORM content",
                                      variant: "destructive",
                                    });
                                    // Reset the input
                                    e.target.value = '';
                                    return;
                                  }
                                  console.log('✅ Valid SCORM file selected:', file.name);
                                  uploadFile(file);
                                } else {
                                  console.log('❌ Missing file or currentScene:', { file: !!file, currentScene: !!currentScene });
                                }
                                
                                // Reset the input for next use
                                e.target.value = '';
                              }}
                            />
                         </CardContent>
                        </Card>

                        {/* Video Source Management - Show if video exists */}
                        {currentScene.scene_type === 'video' && currentScene.content_url && (
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">Video Source</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedScenes = module.scenes.map(s =>
                                      s.id === currentScene.id ? { ...s, content_url: '' } : s
                                    );
                                    setModule(prev => ({ ...prev, scenes: updatedScenes }));
                                    setCurrentScene({ ...currentScene, content_url: '' });
                                    setSaveStatus('unsaved');
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remove Video
                                </Button>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="video-url">Video URL/File</Label>
                                  <Input
                                    id="video-url"
                                    value={currentScene.content_url}
                                    onChange={(e) => {
                                      let url = e.target.value.trim();
                                      
                                      // Don't auto-convert if user is typing HTML or iframe code
                                      if (!url.includes('<iframe') && !url.includes('<div')) {
                                        // Auto-convert URLs to embed format
                                        if (url.includes('youtube.com/watch?v=')) {
                                          const videoId = url.split('v=')[1]?.split('&')[0];
                                          url = `https://www.youtube.com/embed/${videoId}`;
                                        } else if (url.includes('youtu.be/')) {
                                          const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                                          url = `https://www.youtube.com/embed/${videoId}`;
                                        } else if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
                                          const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                                          url = `https://player.vimeo.com/video/${videoId}`;
                                        }
                                      }
                                      
                                      const updatedScenes = module.scenes.map(s =>
                                        s.id === currentScene.id ? { ...s, content_url: url } : s
                                      );
                                      setModule(prev => ({ ...prev, scenes: updatedScenes }));
                                      setCurrentScene({ ...currentScene, content_url: url });
                                      setSaveStatus('unsaved');
                                    }}
                                    placeholder="Paste video URL (not HTML embed code)..."
                                  />
                                </div>
                                
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p><strong>Supported formats:</strong></p>
                                  <p>• Vimeo: https://vimeo.com/123456789</p>
                                  <p>• YouTube: https://youtube.com/watch?v=abc123</p>
                                  <p>• Direct files: .mp4, .webm, .ogg</p>
                                </div>
                                
                                {currentScene.content_url.includes('player.vimeo.com') && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <Video className="w-4 h-4 text-blue-600 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium text-blue-900">Vimeo Embed Detected</p>
                                        <p className="text-blue-700">This video will use Vimeo's player with tracking capabilities.</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {currentScene.content_url.includes('youtube.com/embed') && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <Video className="w-4 h-4 text-red-600 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium text-red-900">YouTube Embed Detected</p>
                                        <p className="text-red-700">This video will use YouTube's player.</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Scene Settings */}
                       <div className="space-y-4">
                        <div>
                          <Label htmlFor="scene-title">Scene Title</Label>
                          <Input
                            id="scene-title"
                            value={currentScene.title}
                            onChange={(e) => {
                              const updatedScenes = module.scenes.map(s =>
                                s.id === currentScene.id ? { ...s, title: e.target.value } : s
                              );
                              setModule(prev => ({ ...prev, scenes: updatedScenes }));
                              setCurrentScene({ ...currentScene, title: e.target.value });
                              setSaveStatus('unsaved');
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="scene-description">Description</Label>
                          <Textarea
                            id="scene-description"
                            value={currentScene.description}
                            onChange={(e) => {
                              const updatedScenes = module.scenes.map(s =>
                                s.id === currentScene.id ? { ...s, description: e.target.value } : s
                              );
                              setModule(prev => ({ ...prev, scenes: updatedScenes }));
                              setCurrentScene({ ...currentScene, description: e.target.value });
                              setSaveStatus('unsaved');
                            }}
                            placeholder="Describe this scene..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="1"
                              value={currentScene.estimated_duration}
                              onChange={(e) => {
                                const updatedScenes = module.scenes.map(s =>
                                  s.id === currentScene.id ? { ...s, estimated_duration: parseInt(e.target.value) || 1 } : s
                                );
                                setModule(prev => ({ ...prev, scenes: updatedScenes }));
                                setCurrentScene({ ...currentScene, estimated_duration: parseInt(e.target.value) || 1 });
                                setSaveStatus('unsaved');
                              }}
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id="required"
                              checked={currentScene.is_required}
                              onCheckedChange={(checked) => {
                                const updatedScenes = module.scenes.map(s =>
                                  s.id === currentScene.id ? { ...s, is_required: checked } : s
                                );
                                setModule(prev => ({ ...prev, scenes: updatedScenes }));
                                setCurrentScene({ ...currentScene, is_required: checked });
                                setSaveStatus('unsaved');
                              }}
                            />
                            <Label htmlFor="required">Required</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <GripVertical className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Scene Selected</h3>
                        <p className="text-sm">Select a scene from the sidebar to edit its content</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz" className="h-full m-0 p-6 overflow-auto">
              {currentScene && currentScene.scene_type === 'quiz' ? (
                <QuestionBuilderTabs
                  currentScene={currentScene}
                  onClose={() => setActiveTab('scenes')}
                />
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Question Builder</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a quiz scene or create a new one to start building questions.
                  </p>
                  <Button 
                    onClick={() => {
                      addScene('quiz');
                    }}
                    className="mb-2"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Create Quiz Scene
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Or go to the Scenes tab and select an existing quiz scene.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0 overflow-auto">
              <ModuleSettingsTab 
                module={module}
                onModuleUpdate={(updatedModule) => {
                  setModule({ ...updatedModule, scenes: module.scenes });
                  setSaveStatus('unsaved');
                }}
              />
            </TabsContent>

            <TabsContent value="preview" className="h-full m-0 overflow-auto">
              <PreviewTab module={module} />
            </TabsContent>

            <TabsContent value="scorm" className="h-full m-0 overflow-auto">
              <div className="h-full overflow-y-auto">
                <ScormConfigTab
                  config={module.metadata.scorm_config || {
                    enabled: false,
                    version: '1.2',
                    launchSettings: {
                      autoStart: false,
                      allowReview: true,
                      showNavigation: true,
                      allowBookmarking: true,
                      timeLimitAction: 'continue'
                    },
                    completionSettings: {
                      trackingMode: 'completion_status',
                      allowRetry: true,
                      saveProgress: true
                    },
                    dataSettings: {
                      trackInteractions: true,
                      trackObjectives: true,
                      trackTime: true,
                      suspendData: true,
                      studentPreferences: true
                    },
                    securitySettings: {
                      preventCheating: false,
                      allowPrintScreen: true,
                      allowRightClick: true,
                      allowTextSelection: true,
                      secureMode: false
                    },
                    displaySettings: {
                      width: 800,
                      height: 600,
                      resizable: true,
                      fullscreen: true,
                      showMenubar: false,
                      showStatusbar: false,
                      showToolbar: false
                    }
                  }}
                  onConfigChange={(config) => {
                    setModule(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        scorm_config: config
                      },
                      scorm_compatible: config.enabled,
                      scorm_version: config.version
                    }));
                    setSaveStatus('unsaved');
                  }}
                  isEnabled={module.scorm_compatible}
                />
              </div>
            </TabsContent>

            <TabsContent value="disclaimers" className="h-full m-0 overflow-auto">
              <div className="h-full overflow-y-auto">
                <DisclaimerSettingsTab 
                  moduleId={module.id}
                  isEnabled={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="accessibility" className="h-full m-0 overflow-auto">
              <div className="h-full overflow-y-auto">
                <AccessibilitySettingsTab 
                  moduleId={module.id}
                  isEnabled={true}
                  settings={module.metadata?.accessibility_settings}
                  onSettingsUpdate={(settings) => {
                    setModule(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        accessibility_settings: settings
                      }
                    }));
                    setSaveStatus('unsaved');
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="vimeo" className="h-full m-0 overflow-auto">
              <div className="h-full p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Vimeo Integration</h2>
                    <p className="text-muted-foreground">
                      Configure Vimeo video settings for this training module.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.open('/admin/vimeo-videos', '_blank')}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Manage All Videos
                    </Button>
                  </div>
                </div>

                {/* Instructions Card */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Video className="w-5 h-5" />
                      How to Use Vimeo Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-blue-800 space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">📹 Module-Level Video (This Tab)</h4>
                      <p className="text-sm mb-2">Use this when you have <strong>one main video</strong> for the entire training module:</p>
                      <ul className="text-sm space-y-1 ml-4 list-disc">
                        <li>Single video training (like a webinar or presentation)</li>
                        <li>Want unified Vimeo analytics for the whole module</li>
                        <li>Need module-wide completion tracking</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">🎬 Scene-Level Videos (Scenes Tab)</h4>
                      <p className="text-sm mb-2">Use individual scenes when you have <strong>multiple videos or mixed content</strong>:</p>
                      <ul className="text-sm space-y-1 ml-4 list-disc">
                        <li>Multiple short videos across different scenes</li>
                        <li>Mixed content (videos + documents + quizzes)</li>
                        <li>Want scene-specific video settings</li>
                      </ul>
                    </div>

                    <div className="bg-white/50 rounded-lg p-3 border border-blue-300">
                      <h4 className="font-semibold mb-2">🚀 Quick Setup:</h4>
                      <ol className="text-sm space-y-1 ml-4 list-decimal">
                        <li>Paste your Vimeo URL below (e.g., https://vimeo.com/123456789)</li>
                        <li>Click "Set Video" to validate and save</li>
                        <li>Adjust completion threshold if needed (default: 80%)</li>
                        <li>Save your training module</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
                
                <VimeoVideoManager
                  currentVideoId={(module as any).vimeo_video_id || ''}
                  currentEmbedUrl={(module as any).vimeo_embed_url || ''}
                  onVideoUpdate={(videoData) => {
                    if (videoData) {
                      setModule(prev => ({
                        ...prev,
                        vimeo_video_id: videoData.videoId,
                        vimeo_embed_url: videoData.embedUrl
                      } as any));
                      setSaveStatus('unsaved');
                    } else {
                      // Clear video data
                      setModule(prev => ({
                        ...prev,
                        vimeo_video_id: null,
                        vimeo_embed_url: null
                      } as any));
                      setSaveStatus('unsaved');
                    }
                  }}
                />
                
                {/* Vimeo Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Video Playback Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="completion-threshold">Completion Threshold (%)</Label>
                      <Input
                        id="completion-threshold"
                        type="number"
                        min="1"
                        max="100"
                        value={(module as any).completion_threshold_percentage || 80}
                        onChange={(e) => {
                          setModule(prev => ({
                            ...prev,
                            completion_threshold_percentage: parseInt(e.target.value) || 80
                          } as any));
                          setSaveStatus('unsaved');
                        }}
                        placeholder="80"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Percentage of video that must be watched to mark as complete
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="track-progress"
                        checked={true}
                        disabled
                      />
                      <Label htmlFor="track-progress">Track video progress</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="resume-playback"
                        checked={true}
                        disabled
                      />
                      <Label htmlFor="resume-playback">Resume from last position</Label>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Video className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Vimeo Integration Ready</p>
                          <p className="text-sm text-green-700">
                            This training module is configured to use Vimeo for video hosting and analytics tracking.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Colossyan Generator Modal */}
      <ColossyanGeneratorModal
        open={showColossyanModal}
        onOpenChange={setShowColossyanModal}
        onVideoGenerated={(videoData) => {
          // Handle successful video generation
          if (currentScene && videoData?.video_url) {
            const updatedScenes = module.scenes.map(s =>
              s.id === currentScene.id ? { 
                ...s, 
                content_url: videoData.video_url,
                scorm_package_url: videoData.scorm_package_url || s.scorm_package_url,
                metadata: {
                  ...s.metadata,
                  is_ai_generated: true,
                  colossyan_generation_id: videoData.generation_id
                }
              } : s
            );
            setModule(prev => ({ ...prev, scenes: updatedScenes }));
            setCurrentScene({ 
              ...currentScene, 
              content_url: videoData.video_url,
              scorm_package_url: videoData.scorm_package_url || currentScene.scorm_package_url,
              metadata: {
                ...currentScene.metadata,
                is_ai_generated: true,
                colossyan_generation_id: videoData.generation_id
              }
            });
            setSaveStatus('unsaved');
            toast({
              title: "Success",
              description: "AI video generated and added to your training scene!",
            });
          }
        }}
        trainingModuleId={module.id}
        trainingSceneId={currentScene?.id}
      />
    </div>
  );
};
