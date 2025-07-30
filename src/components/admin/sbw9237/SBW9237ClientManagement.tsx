import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Upload, Eye, Settings, ArrowLeft, Music, X, Play, Package, FileText, Share2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { SBW9237TrainingFlow } from "@/components/learner/SBW9237TrainingFlow";
import { ScrollTimingEditor } from "./ScrollTimingEditor";
import { ColossyanGeneratorModal } from "@/components/training-builder/components/ColossyanGeneratorModal";
import { WPVDocumentConverter } from "@/components/admin/wpv/WPVDocumentConverter";

// Lazy load the SCORM player for better performance
const ScormPlayer = lazy(() => import("@/components/ui/scorm-player").then(module => ({ 
  default: module.ScormPlayer 
})));

interface ScrollTimingConfig {
  segments: Array<{
    id: string;
    text: string;
    startTime: number;
    label: string;
  }>;
  audioDuration: number;
  lastUpdated: string;
}

interface SBW9237Module {
  id: string;
  client_id: string;
  company_id: string;
  status: 'unpublished' | 'published' | 'archived';
  wpv_plan_content: string | null;
  wpv_plan_file_url: string | null;
  wpv_plan_type: 'html' | 'pdf' | 'website';
  wpv_plan_audio_url: string | null;
  intro_custom_text: string | null;
  intro_company_logo_url: string | null;
  intro_audio_url: string | null;
  intro_scroll_timing_config: ScrollTimingConfig | null;
  scorm_package_url: string;
  video_url: string | null;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  // New custom SCORM fields
  use_custom_scorm: boolean;
  custom_scorm_package_url: string | null;
  custom_scorm_generation_id: string | null;
  custom_scorm_script: string | null;
}

interface Client {
  id: string;
  company_name: string;
  company_settings_id: string;
}

export const SBW9237ClientManagement = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [module, setModule] = useState<SBW9237Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form states
  const [introText, setIntroText] = useState("");
  const [introAudioUrl, setIntroAudioUrl] = useState("");
  const [scrollTimingConfig, setScrollTimingConfig] = useState<ScrollTimingConfig | null>(null);
  const [wpvPlanContent, setWpvPlanContent] = useState("");
  const [wpvPlanType, setWpvPlanType] = useState<'html' | 'pdf' | 'website'>('html');
  const [wpvPlanWebsiteUrl, setWpvPlanWebsiteUrl] = useState("");
  const [wpvPlanAudioUrl, setWpvPlanAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // SCORM states
  const [scormPackageUrl, setScormPackageUrl] = useState("");
  const [scormCompleted, setScormCompleted] = useState(false);
  
  // Custom SCORM states
  const [useCustomScorm, setUseCustomScorm] = useState(false);
  const [customScormScript, setCustomScormScript] = useState("");
  const [showColossyanModal, setShowColossyanModal] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientAndModule();
    }
  }, [clientId]);

  const fetchClientAndModule = async () => {
    try {
      setLoading(true);
      
      // Fetch client info
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, company_name, company_settings_id')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch SBW-9237 module
      const { data: moduleData, error: moduleError } = await supabase
        .from('client_sbw9237_modules')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (moduleError && moduleError.code !== 'PGRST116') {
        throw moduleError;
      }

      if (moduleData) {
        // Cast the data as unknown first, then to our interface for safe typing
        const typedModule = moduleData as unknown as SBW9237Module;
        setModule(typedModule);
        setIntroText(moduleData.intro_custom_text || "");
        setIntroAudioUrl(moduleData.intro_audio_url || "");
        // Parse the JSONB field safely
        const timingConfig = moduleData.intro_scroll_timing_config as unknown as ScrollTimingConfig | null;
        setScrollTimingConfig(timingConfig);
        setWpvPlanContent(moduleData.wpv_plan_content || "");
        setWpvPlanType(moduleData.wpv_plan_type as 'html' | 'pdf' | 'website');
        setWpvPlanWebsiteUrl(moduleData.wpv_plan_file_url || "");
        setWpvPlanAudioUrl(moduleData.wpv_plan_audio_url || "");
        setScormPackageUrl(moduleData.scorm_package_url || "");
        
        // Set custom SCORM fields
        setUseCustomScorm(moduleData.use_custom_scorm || false);
        setCustomScormScript(moduleData.custom_scorm_script || "");
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!client || !module) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('client_sbw9237_modules')
        .update({
          intro_custom_text: introText,
          intro_audio_url: introAudioUrl,
          intro_scroll_timing_config: scrollTimingConfig as any, // Cast to any for JSONB storage
          wpv_plan_content: wpvPlanType === 'website' ? wpvPlanWebsiteUrl : wpvPlanContent,
          wpv_plan_file_url: wpvPlanType === 'website' ? wpvPlanWebsiteUrl : null,
          wpv_plan_type: wpvPlanType,
          wpv_plan_audio_url: wpvPlanAudioUrl,
          use_custom_scorm: useCustomScorm,
          custom_scorm_script: customScormScript,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;

      toast.success('Configuration saved successfully');
      await fetchClientAndModule(); // Refresh data
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const publishModule = async () => {
    if (!module) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('client_sbw9237_modules')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;

      toast.success('SBW-9237 module published! It will now appear in the client admin portal.');
      await fetchClientAndModule(); // Refresh data
    } catch (error) {
      console.error('Error publishing module:', error);
      toast.error('Failed to publish module');
    } finally {
      setSaving(false);
    }
  };

  const unpublishModule = async () => {
    if (!module) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('client_sbw9237_modules')
        .update({
          status: 'unpublished',
          published_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;

      toast.success('SBW-9237 module unpublished');
      await fetchClientAndModule(); // Refresh data
    } catch (error) {
      console.error('Error unpublishing module:', error);
      toast.error('Failed to unpublish module');
    } finally {
      setSaving(false);
    }
  };

  const uploadAudioFile = async (file: File) => {
    if (!client) return;

    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${client.id}/intro-audio-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('training-audio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training-audio')
        .getPublicUrl(fileName);

      setIntroAudioUrl(publicUrl);
      toast.success('Audio file uploaded successfully');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload audio file');
    } finally {
      setUploading(false);
    }
  };

  const removeAudioFile = async () => {
    if (!introAudioUrl) return;

    try {
      // Extract filename from URL
      const urlParts = introAudioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fullPath = `${client?.id}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('training-audio')
        .remove([fullPath]);

      if (error) throw error;

      setIntroAudioUrl("");
      toast.success('Audio file removed');
    } catch (error) {
      console.error('Error removing audio:', error);
      toast.error('Failed to remove audio file');
    }
  };

  const uploadWpvAudioFile = async (file: File) => {
    if (!client) return;

    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${client.id}/wpv-audio-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('training-audio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training-audio')
        .getPublicUrl(fileName);

      setWpvPlanAudioUrl(publicUrl);
      toast.success('WPV plan audio uploaded successfully');
    } catch (error) {
      console.error('Error uploading WPV audio:', error);
      toast.error('Failed to upload WPV plan audio file');
    } finally {
      setUploading(false);
    }
  };

  const removeWpvAudioFile = async () => {
    if (!wpvPlanAudioUrl) return;

    try {
      // Extract filename from URL
      const urlParts = wpvPlanAudioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fullPath = `${client?.id}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('training-audio')
        .remove([fullPath]);

      if (error) throw error;

      setWpvPlanAudioUrl("");
      toast.success('WPV plan audio removed');
    } catch (error) {
      console.error('Error removing WPV audio:', error);
      toast.error('Failed to remove WPV plan audio file');
    }
  };

  const uploadWpvPdfFile = async (file: File) => {
    if (!client || !module) return;

    console.log('📄 PDF File selected:', file.name, file.type, file.size);
    
    if (!file.type.includes('pdf')) {
      console.log('❌ Invalid file type:', file.type);
      toast.error('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      
      // Create unique filename
      const fileName = `${client.id}/wpv-plan-${Date.now()}.pdf`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('training-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training-files')
        .getPublicUrl(fileName);

      // Update module with PDF URL in wpv_plan_content and wpv_plan_file_url
      const { error: updateError } = await supabase
        .from('client_sbw9237_modules')
        .update({
          wpv_plan_content: publicUrl,
          wpv_plan_file_url: publicUrl,
          wpv_plan_type: 'pdf',
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (updateError) throw updateError;

      setWpvPlanContent(publicUrl);
      setWpvPlanWebsiteUrl(publicUrl);
      toast.success('PDF file uploaded successfully');
      await fetchClientAndModule(); // Refresh data
    } catch (error: any) {
      console.error('❌ PDF upload failed:', error);
      toast.error(error.message || 'Failed to upload PDF file');
    } finally {
      setUploading(false);
    }
  };

  const uploadScormPackage = async (file: File) => {
    if (!client || !module) return;

    console.log('🎓 SCORM File selected:', file.name, file.type, file.size);
    
    if (!file.name.endsWith('.zip')) {
      console.log('❌ Invalid file type:', file.name);
      toast.error('Please select a ZIP file containing SCORM content');
      return;
    }

    try {
      setUploading(true);
      
      // Upload to Supabase Storage - using same pattern as COR-1594
      const fileName = `scorm_${Date.now()}_${file.name}`;
      const filePath = `training-files/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('training-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('training-files')
        .getPublicUrl(filePath);
      
      console.log('✅ SCORM file uploaded to:', publicUrl);

      // Update client module
      const { error: updateError } = await supabase
        .from('client_sbw9237_modules')
        .update({
          scorm_package_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (updateError) throw updateError;

      setScormPackageUrl(publicUrl);
      toast.success('SCORM package uploaded successfully');
      await fetchClientAndModule(); // Refresh data
    } catch (error: any) {
      console.error('❌ SCORM upload failed:', error);
      toast.error(error.message || 'Failed to upload SCORM package');
    } finally {
      setUploading(false);
    }
  };

  const removeScormPackage = async () => {
    if (!scormPackageUrl || !module) return;

    try {
      // Extract filename from URL
      const urlParts = scormPackageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fullPath = `${client?.id}/${fileName}`;

      // Delete from storage
      const { error } = await supabase.storage
        .from('scorm-packages')
        .remove([fullPath]);

      if (error) throw error;

      // Update database to default
      const { error: updateError } = await supabase
        .from('client_sbw9237_modules')
        .update({
          scorm_package_url: '/scorm-packages/SBW-9237.zip',
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (updateError) throw updateError;

      setScormPackageUrl("/scorm-packages/SBW-9237.zip");
      toast.success('SCORM package removed');
      await fetchClientAndModule(); // Refresh data
    } catch (error) {
      console.error('Error removing SCORM package:', error);
      toast.error('Failed to remove SCORM package');
    }
  };

  const handleScormComplete = (score?: number, duration?: string) => {
    console.log("🎉 Admin SCORM testing completed:", { score, duration });
    setScormCompleted(true);
    toast.success(`SCORM testing completed! Score: ${score || 100}%`);
  };

  const ScormPlayerFallback = () => (
    <div className="min-h-[400px] bg-accent/5 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading SCORM player...</p>
      </div>
    </div>
  );

  const handleCustomScormGenerated = async (videoData: any) => {
    if (!module || !videoData) return;

    try {
      console.log('🎬 Custom SCORM video generated:', videoData);
      
      // Update the module with the custom SCORM data
      const { error } = await supabase
        .from('client_sbw9237_modules')
        .update({
          custom_scorm_package_url: videoData.scorm_package_url || videoData.video_url,
          custom_scorm_generation_id: videoData.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;

      toast.success('Custom SCORM video generated successfully!');
      await fetchClientAndModule(); // Refresh data
    } catch (error) {
      console.error('Error saving custom SCORM data:', error);
      toast.error('Failed to save custom SCORM video');
    }
  };

  const previewWorkflow = () => {
    if (!module) {
      toast.error('No training module configured');
      return;
    }
    
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SBW-9237 configuration...</p>
        </div>
      </div>
    );
  }

  if (!client || !module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Client Not Found</h3>
              <p className="text-muted-foreground">Unable to load client or SBW-9237 module data.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => navigate(`/admin/clients/${clientId}`)}
                className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground self-start"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Client Profile
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  SBW-9237 Configuration
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Configure SB 553 Workplace Violence Prevention Training for {client.company_name}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <Badge 
                variant={module.status === 'published' ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {module.status === 'published' && <CheckCircle className="w-4 h-4 mr-1" />}
                {module.status === 'unpublished' && <AlertCircle className="w-4 h-4 mr-1" />}
                {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
          <Button
            onClick={previewWorkflow}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Workflow
          </Button>
          
          <Button
            onClick={saveConfiguration}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>

          {module.status === 'unpublished' ? (
            <Button
              onClick={publishModule}
              disabled={saving || (!wpvPlanContent.trim() && !wpvPlanWebsiteUrl.trim())}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {saving ? 'Publishing...' : 'Publish Module'}
            </Button>
          ) : (
            <Button
              onClick={unpublishModule}
              disabled={saving}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {saving ? 'Unpublishing...' : 'Unpublish'}
            </Button>
          )}
        </div>

        {/* Share Published Plan */}
        {module.status === 'published' && (
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Share2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-900 mb-2">Share Published Training Plan</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Your training plan is now published and ready to share. Use the links below to provide access to learners.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <Label className="text-xs font-medium text-gray-700">Public Training URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={`${window.location.origin}/training-flow?planId=${module.id}`}
                            readOnly
                            className="text-sm bg-gray-50"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/training-flow?planId=${module.id}`);
                              toast.success("Training URL copied to clipboard!");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <Label className="text-xs font-medium text-gray-700">WPV Plan Viewer URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={`${window.location.origin}/wvpp/view?planId=${module.id}`}
                            readOnly
                            className="text-sm bg-gray-50"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/wvpp/view?planId=${module.id}`);
                              toast.success("WPV Plan URL copied to clipboard!");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/training-flow?planId=${module.id}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Training
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/wvpp/view?planId=${module.id}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View WPV Plan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="w-full max-w-[100vw] h-full max-h-[100vh] p-0 m-0 rounded-none md:max-w-[98vw] md:max-h-[98vh] md:rounded-lg md:m-6">
            <DialogHeader className="p-3 md:p-4 pb-2 md:pb-0 bg-background border-b">
              <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
                <Eye className="w-4 h-4" />
                Training Preview - {client.company_name}
              </DialogTitle>
            </DialogHeader>
            <div className="h-[calc(100vh-60px)] md:h-[90vh] overflow-auto">
              {showPreview && (
                <div className="h-full">
                  <SBW9237TrainingFlow previewMode={true} clientId={clientId} testingMode={true} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Configuration Tabs */}
        <Tabs defaultValue="intro" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="intro" className="text-xs md:text-sm px-2 md:px-4">
              Intro
            </TabsTrigger>
            <TabsTrigger value="scorm" className="text-xs md:text-sm px-2 md:px-4">
              SCORM
            </TabsTrigger>
            <TabsTrigger value="wpv-plan" className="text-xs md:text-sm px-2 md:px-4">
              WPV Plan
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm px-2 md:px-4">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduction Scene</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the welcome message for this client's training.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="intro-text">Custom Introduction Text</Label>
                  <Textarea
                    id="intro-text"
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    placeholder="Enter custom introduction text..."
                    className="min-h-[120px] mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This text will appear on the welcome screen before the training begins.
                  </p>
                </div>

                <div>
                  <Label>Introduction Audio (Optional)</Label>
                  <div className="mt-2">
                    {introAudioUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          <Music className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Audio file uploaded</p>
                            <audio controls className="w-full mt-2">
                              <source src={introAudioUrl} type="audio/mpeg" />
                              <source src={introAudioUrl} type="audio/wav" />
                              <source src={introAudioUrl} type="audio/mp4" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeAudioFile}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Music className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload an audio file for the introduction
                        </p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadAudioFile(file);
                          }}
                          className="hidden"
                          id="audio-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('audio-upload')?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Select Audio File'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: MP3, WAV, M4A. The audio will play during the welcome screen.
                    </p>
                  </div>
                </div>

                {/* Scroll Timing Controls */}
                <ScrollTimingEditor
                  initialText={introText}
                  audioUrl={introAudioUrl}
                  config={scrollTimingConfig}
                  onConfigChange={setScrollTimingConfig}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scorm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SCORM Training Package</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload and test the SCORM training package for this client.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom SCORM Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                    <div className="space-y-1">
                      <h4 className="font-medium">Use Custom SCORM Video</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate a custom AI video using your client's WPV Plan content instead of the default SBW-9237 training.
                      </p>
                    </div>
                    <Switch
                      checked={useCustomScorm}
                      onCheckedChange={(checked) => {
                        setUseCustomScorm(checked);
                        if (checked && wpvPlanContent) {
                          // Pre-populate script with WPV plan content
                          setCustomScormScript(`Welcome to ${client.company_name}'s Workplace Violence Prevention Training.

Today we'll review your company's specific WPV Plan and policies.

${wpvPlanContent.replace(/<[^>]*>/g, '').substring(0, 1000)}...

Please review this plan carefully as it contains important safety protocols specific to your workplace.`);
                        }
                      }}
                    />
                  </div>

                  {useCustomScorm && (
                    <div className="space-y-4 p-4 border rounded-lg bg-primary/5">
                      <div>
                        <Label htmlFor="custom-script">Custom Training Script</Label>
                        <Textarea
                          id="custom-script"
                          value={customScormScript}
                          onChange={(e) => setCustomScormScript(e.target.value)}
                          placeholder="Enter the script for your custom AI-generated SCORM video..."
                          className="min-h-[200px] mt-2"
                          maxLength={2000}
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-muted-foreground">
                            This script will be used to generate a custom training video using AI.
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {2000 - customScormScript.length} characters remaining
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowColossyanModal(true)}
                        disabled={!customScormScript.trim()}
                        className="w-full"
                      >
                        Generate Custom SCORM Video
                      </Button>

                      {module.custom_scorm_package_url && (
                        <div className="mt-4 p-3 border rounded-lg bg-green-50">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Custom SCORM Generated</span>
                          </div>
                          <p className="text-xs text-green-700">
                            Your custom SCORM video has been generated and will be used in the training.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Default SCORM Package Upload</Label>
                  <div className="mt-2">
                    {scormPackageUrl && scormPackageUrl !== "/scorm-packages/SBW-9237.zip" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          <Package className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">SCORM package uploaded</p>
                            <p className="text-xs text-muted-foreground mt-1">{scormPackageUrl}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeScormPackage}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* SCORM Player for Testing */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Test SCORM Package</h4>
                            <Badge variant={scormCompleted ? "default" : "secondary"}>
                              {scormCompleted ? "Completed" : "Not Started"}
                            </Badge>
                          </div>
                          
                          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                            <Suspense fallback={<ScormPlayerFallback />}>
                              <ScormPlayer
                                scormPackageUrl={scormPackageUrl}
                                onComplete={handleScormComplete}
                                employeeId="admin-test"
                                trainingModuleId={module.id}
                                moduleName={`SBW-9237 Test for ${client.company_name}`}
                                testingMode={true}
                              />
                            </Suspense>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Use this player to test the SCORM package before publishing the module.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Package className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload a SCORM package (.zip file)
                        </p>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadScormPackage(file);
                          }}
                          className="hidden"
                          id="scorm-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('scorm-upload')?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Select SCORM Package'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a ZIP file containing your SCORM package. The player will extract and test it automatically.
                    </p>
                  </div>
                </div>

                {scormPackageUrl === "/scorm-packages/SBW-9237.zip" && (
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900 mb-1">Default SCORM Package</h4>
                          <p className="text-sm text-amber-700">
                            Currently using the default placeholder SCORM package URL. Upload a real SCORM package above to replace it.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wpv-plan" className="space-y-6">
            <WPVDocumentConverter 
              clientId={client?.id || ""} 
              onConversionComplete={(planData) => {
                toast.success("WPV plan updated with converted document data");
                fetchClientAndModule(); // Refresh the data
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Workplace Violence Prevention Plan</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add the WPV plan that learners must review after the training video.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plan-type">Plan Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="html"
                        checked={wpvPlanType === 'html'}
                        onChange={() => setWpvPlanType('html')}
                      />
                      HTML Content
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="pdf"
                        checked={wpvPlanType === 'pdf'}
                        onChange={() => setWpvPlanType('pdf')}
                      />
                      PDF File
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="website"
                        checked={wpvPlanType === 'website'}
                        onChange={() => setWpvPlanType('website')}
                      />
                      Website Link
                    </label>
                  </div>
                </div>

                {wpvPlanType === 'html' ? (
                  <div>
                    <Label htmlFor="wpv-plan">WPV Plan Content (HTML)</Label>
                    <Textarea
                      id="wpv-plan"
                      value={wpvPlanContent}
                      onChange={(e) => setWpvPlanContent(e.target.value)}
                      placeholder="Enter the WPV plan content in HTML format..."
                      className="min-h-[300px] mt-2 font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can use HTML tags for formatting. This content will be displayed in a scrollable viewer.
                    </p>
                  </div>
                ) : wpvPlanType === 'website' ? (
                  <div>
                    <Label htmlFor="wpv-plan-url">WPV Plan Website URL</Label>
                    <Input
                      id="wpv-plan-url"
                      value={wpvPlanWebsiteUrl}
                      onChange={(e) => setWpvPlanWebsiteUrl(e.target.value)}
                      placeholder="https://example.com/wpv-plan"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the website URL where learners can view and scroll through the WPV plan content.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label>WPV Plan PDF File</Label>
                    <div className="mt-2">
                      {wpvPlanContent ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                            <FileText className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">PDF file uploaded</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                File stored and ready for viewing
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setWpvPlanContent("");
                                setWpvPlanWebsiteUrl("");
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-3">
                            Upload a PDF file containing your WPV plan
                          </p>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadWpvPdfFile(file);
                            }}
                            className="hidden"
                            id="wpv-pdf-upload"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('wpv-pdf-upload')?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {uploading ? 'Uploading...' : 'Select PDF File'}
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload a PDF file containing your WPV plan. The content will be displayed in a scrollable viewer.
                      </p>
                    </div>
                  </div>
                 )}
                
                {/* WPV Plan Audio Section */}
                <div>
                  <Label>WPV Plan Audio Explanation (Optional)</Label>
                  <div className="mt-2">
                     {wpvPlanAudioUrl ? (
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                           <Music className="w-5 h-5 text-primary" />
                           <div className="flex-1">
                             <p className="text-sm font-medium">WPV plan audio uploaded</p>
                             <audio controls className="w-full mt-2">
                               <source src={wpvPlanAudioUrl} type="audio/mpeg" />
                               <source src={wpvPlanAudioUrl} type="audio/wav" />
                               <source src={wpvPlanAudioUrl} type="audio/mp4" />
                               Your browser does not support the audio element.
                             </audio>
                           </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeWpvAudioFile}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Music className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload an audio file to explain the WPV plan
                        </p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadWpvAudioFile(file);
                          }}
                          className="hidden"
                          id="wpv-audio-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('wpv-audio-upload')?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Select Audio File'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload an audio narration that explains the WPV plan content. This will play during step 3 of the training.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video & SCORM Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure the training video and SCORM package.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scorm-url">SCORM Package URL</Label>
                  <Input
                    id="scorm-url"
                    value={module.scorm_package_url}
                    disabled
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is the default SBW-9237 SCORM package URL.
                  </p>
                </div>

                <div>
                  <Label htmlFor="video-url">Video URL (Optional)</Label>
                  <Input
                    id="video-url"
                    value={module.video_url || ""}
                    disabled
                    placeholder="Custom video URL (if different from SCORM)"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Publishing Requirements */}
        {module.status === 'unpublished' && (
          <Card className="mt-6 border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Publishing Requirements</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li className="flex items-center gap-2">
                      {(wpvPlanContent.trim() || wpvPlanWebsiteUrl.trim()) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      WPV Plan content is required
                    </li>
                    <li className="flex items-center gap-2">
                      {introText.trim() ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      Introduction text is recommended
                    </li>
                  </ul>
                  <p className="text-xs text-amber-600 mt-2">
                    Once published, this module will appear in {client.company_name}'s admin portal for learner assignment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Colossyan Generator Modal */}
      <ColossyanGeneratorModal
        open={showColossyanModal}
        onOpenChange={setShowColossyanModal}
        onVideoGenerated={handleCustomScormGenerated}
        trainingModuleId={module.id}
      />
    </div>
  );
};