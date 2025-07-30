import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Shield, FileText, Video } from 'lucide-react';
import { ScormSettingsPanel as ScormSettings } from './ScormSettingsPanel';
import { ModuleSettingsTab } from './ModuleSettingsTab';
import { DisclaimerSettingsTab } from './DisclaimerSettingsTab';
import { VimeoTab } from './components/VimeoTab';
import { supabase } from '@/integrations/supabase/client';

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
  metadata: {
    learning_objectives: string[];
    prerequisites: string[];
    completion_criteria: {
      min_score: number;
      required_scenes: string[];
      time_requirements?: {
        min_time_spent: number;
        max_time_allowed?: number;
      };
    };
    certificate_template?: string;
  };
}

interface TrainingBuilderRightPanelProps {
  sceneId?: string;
  moduleId: string;
  moduleName: string;
  onVideoSelected?: (videoUrl: string, videoName: string) => void;
}

export const TrainingBuilderRightPanel = ({ 
  sceneId, 
  moduleId, 
  moduleName,
  onVideoSelected
}: TrainingBuilderRightPanelProps) => {
  const [activeTab, setActiveTab] = useState('module');
  const [module, setModule] = useState<TrainingModule>({
    id: moduleId,
    title: moduleName,
    description: '',
    category: 'General',
    tags: [],
    language: 'en',
    industry: 'general',
    target_roles: [],
    difficulty_level: 'beginner',
    estimated_completion_time: 30,
    scorm_compatible: false,
    accessibility_compliant: false,
    metadata: {
      learning_objectives: [],
      prerequisites: [],
      completion_criteria: {
        min_score: 80,
        required_scenes: [],
      }
    }
  });
  const [loading, setLoading] = useState(true);

  // Load actual module data from database
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        console.log('🔄 Loading module data for ID:', moduleId);
        const { data, error } = await supabase
          .from('training_modules')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('❌ Error loading module:', error);
          return;
        }

        if (data) {
          console.log('✅ Module data loaded:', data);
          const defaultMetadata = {
            learning_objectives: [],
            prerequisites: [],
            completion_criteria: {
              min_score: 80,
              required_scenes: [],
            }
          };

          setModule({
            id: data.id,
            title: data.title || moduleName,
            description: data.description || '',
            category: data.category || 'General',
            tags: Array.isArray(data.tags) ? data.tags : [],
            language: data.language || 'en',
            industry: data.industry || 'general',
            target_roles: Array.isArray(data.target_roles) ? data.target_roles : [],
            difficulty_level: (data.difficulty_level === 'beginner' || data.difficulty_level === 'intermediate' || data.difficulty_level === 'advanced') 
              ? data.difficulty_level : 'beginner',
            estimated_completion_time: typeof data.estimated_completion_time === 'number' ? data.estimated_completion_time : 30,
            scorm_compatible: data.scorm_compatible === true,
            scorm_version: (data.scorm_version === '1.2' || data.scorm_version === '2004') ? data.scorm_version : undefined,
            accessibility_compliant: data.accessibility_compliant === true,
            thumbnail_url: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : undefined,
            metadata: (data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)) 
              ? { ...defaultMetadata, ...data.metadata } : defaultMetadata
          });
        } else {
          console.log('📝 No existing module data found, keeping defaults');
        }
      } catch (error) {
        console.error('❌ Error loading module data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModuleData();
  }, [moduleId, moduleName]);

  const handleModuleUpdate = (updatedModule: TrainingModule) => {
    console.log('🔄 Module updated:', updatedModule.title, 'Category:', updatedModule.category);
    setModule(updatedModule);
  };

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4" style={{ backgroundColor: 'hsl(248 43% 93%)', border: '1px solid hsl(248 43% 58% / 0.2)' }}>
          <TabsTrigger
            value="module" 
            className="flex items-center gap-2 data-[state=active]:text-white" 
            style={{ 
              '--tw-data-state-active-bg': 'hsl(248 43% 58%)'
            } as React.CSSProperties}
            data-active-style="background-color: hsl(248 43% 58%);"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Module</span>
          </TabsTrigger>
          <TabsTrigger 
            value="scorm" 
            className="flex items-center gap-2 data-[state=active]:text-white"
            style={{ 
              '--tw-data-state-active-bg': 'hsl(248 43% 58%)'
            } as React.CSSProperties}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">SCORM</span>
          </TabsTrigger>
          <TabsTrigger 
            value="disclaimers" 
            className="flex items-center gap-2 data-[state=active]:text-white"
            style={{ 
              '--tw-data-state-active-bg': 'hsl(248 43% 58%)'
            } as React.CSSProperties}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Legal</span>
          </TabsTrigger>
          <TabsTrigger 
            value="vimeo" 
            className="flex items-center gap-2 data-[state=active]:text-white"
            style={{ 
              '--tw-data-state-active-bg': 'hsl(248 43% 58%)'
            } as React.CSSProperties}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Vimeo</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading settings...</p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="module" className="h-full overflow-auto mt-0">
                <ModuleSettingsTab 
                  module={module} 
                  onModuleUpdate={handleModuleUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="scorm" className="h-full overflow-auto mt-0">
                {module.scorm_compatible ? (
                  <ScormSettings 
                    sceneId={sceneId} 
                    moduleName={moduleName} 
                  />
                ) : (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">SCORM Not Enabled</h3>
                    <p className="text-muted-foreground">
                      Enable SCORM compatibility in the Module tab to configure SCORM options.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="disclaimers" className="h-full overflow-auto mt-0">
                <DisclaimerSettingsTab 
                  moduleId={moduleId}
                  isEnabled={true}
                />
              </TabsContent>
              
              <TabsContent value="vimeo" className="h-full overflow-auto mt-0">
                <VimeoTab onVideoSelected={onVideoSelected} />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};