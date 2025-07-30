import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SBW9237IntroScene } from "./sbw9237/SBW9237IntroScene";
import { SBW9237ScormScene } from "./sbw9237/SBW9237ScormScene";
import { SBW9237PlanViewerScene } from "./sbw9237/SBW9237PlanViewerScene";
import { SBW9237CompletionScene } from "./sbw9237/SBW9237CompletionScene";

type SBW9237Scene = 'intro' | 'scorm' | 'plan_viewer' | 'completion';

interface TrainingProgress {
  intro_completed: boolean;
  scorm_completed: boolean;
  plan_viewed: boolean;
  plan_certified: boolean;
}

interface SBW9237TrainingFlowProps {
  previewMode?: boolean;
  clientId?: string;
  testingMode?: boolean; // New prop to bypass timing restrictions
}

export const SBW9237TrainingFlow = ({ previewMode = false, clientId, testingMode = false }: SBW9237TrainingFlowProps = {}) => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('🎯 SBW9237TrainingFlow init:', { previewMode, clientId, assignmentId, testingMode, actualClientId: clientId });
  
  const [currentScene, setCurrentScene] = useState<SBW9237Scene>('intro');
  const [assignment, setAssignment] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [wpvPlan, setWpvPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<TrainingProgress>({
    intro_completed: false,
    scorm_completed: false,
    plan_viewed: false,
    plan_certified: false,
  });

  const fetchTrainingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎯 fetchTrainingData called with:', { previewMode, clientId, assignmentId });

      if (previewMode && clientId) {
        console.log('🎭 Preview mode - fetching client module data for:', clientId);
        
        // Fetch client's SBW9237 module directly
        const { data: moduleData, error: moduleError } = await supabase
          .from("client_sbw9237_modules")
          .select("*")
          .eq("client_id", clientId)
          .maybeSingle();

        console.log('📦 Module data:', { moduleData, moduleError });

        if (moduleError) {
          console.error('❌ Module fetch error:', moduleError);
          throw new Error(`Failed to fetch module: ${moduleError.message}`);
        }
        
        if (!moduleData) {
          console.error('❌ No module data found for client:', clientId);
          throw new Error('No SBW-9237 module found for this client');
        }
        
        // Fetch client info
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("company_name, company_settings_id")
          .eq("id", clientId)
          .single();

        console.log('🏢 Client data:', { clientData, clientError });

        if (clientError) {
          console.error('❌ Client fetch error:', clientError);
          throw new Error(`Failed to fetch client: ${clientError.message}`);
        }
        
        // Create mock assignment data for preview
        setAssignment({
          id: "preview",
          employees: { company_id: clientData.company_settings_id },
          training_modules: { title: "SBW-9237 Workplace Violence Prevention" }
        });
        
        setCompanySettings({ 
          company_name: clientData.company_name,
          intro_audio_url: moduleData.intro_audio_url,
          intro_custom_text: moduleData.intro_custom_text,
          company_logo_url: moduleData.intro_company_logo_url,
          scorm_package_url: moduleData.scorm_package_url,
          // Custom SCORM fields
          use_custom_scorm: moduleData.use_custom_scorm,
          custom_scorm_package_url: moduleData.custom_scorm_package_url,
          custom_scorm_script: moduleData.custom_scorm_script
        });
        
        setWpvPlan(moduleData);
        console.log('✅ Preview data loaded successfully');
        
      } else if (assignmentId) {
        console.log('📋 Assignment mode - fetching assignment data for:', assignmentId);
        
        // Original assignment-based flow
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("training_assignments")
          .select(`
            *,
            training_modules(
              id,
              title,
              description,
              credit_value,
              video_code
            ),
            employees(
              id,
              first_name,
              last_name,
              company_id
            )
          `)
          .eq("id", assignmentId)
          .single();

        if (assignmentError) throw assignmentError;
        setAssignment(assignmentData);

        // Fetch company settings for branding
        const { data: companyData, error: companyError } = await supabase
          .from("company_settings")
          .select("*")
          .eq("id", assignmentData.employees.company_id)
          .single();

        if (companyError) throw companyError;
        setCompanySettings(companyData);

        // Fetch SBW9237 module for intro audio
        const { data: moduleData, error: moduleError } = await supabase
          .from("client_sbw9237_modules")
          .select("intro_audio_url")
          .eq("company_id", assignmentData.employees.company_id)
          .single();

        if (!moduleError && moduleData) {
          setCompanySettings(prev => ({
            ...prev,
            intro_audio_url: moduleData.intro_audio_url
          }));
        }
        
        // Fetch WPV plan for the company
        const { data: wpvData, error: wpvError } = await supabase
          .from("wpv_plans")
          .select("*")
          .eq("company_id", assignmentData.employees.company_id)
          .eq("status", "uploaded")
          .order("upload_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!wpvError && wpvData) {
          setWpvPlan(wpvData);
        }

        // Check existing progress
        await checkExistingProgress(assignmentData);
      } else {
        console.error('❌ Neither preview mode nor assignment ID provided');
        throw new Error('Missing required parameters for training data');
      }

    } catch (error: any) {
      console.error('💥 fetchTrainingData error:', error);
      setError(error.message || 'Failed to load training data');
    } finally {
      console.log('🏁 fetchTrainingData complete, setting loading to false');
      setLoading(false);
    }
  }, [previewMode, clientId, assignmentId]);

  useEffect(() => {
    console.log('🔄 Effect triggered:', { assignmentId, previewMode, clientId });
    if (assignmentId || (previewMode && clientId)) {
      fetchTrainingData();
    }

    // Cleanup function to ensure no audio continues playing when component unmounts
    return () => {
      // Stop any playing audio when the training flow unmounts
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
        audio.load();
      });
    };
  }, [assignmentId, previewMode, clientId, fetchTrainingData]);

  const checkExistingProgress = async (assignmentData: any) => {
    try {
      // Check SCORM completion
      const { data: scormProgress } = await supabase
        .from("scorm_progress")
        .select("completion_status")
        .eq("employee_id", assignmentData.employee_id)
        .eq("assignment_id", assignmentData.id)
        .maybeSingle();

      const scormCompleted = scormProgress?.completion_status === 'completed';

      // Check if training was already completed
      const { data: completionData } = await supabase
        .from("training_completions")
        .select("*")
        .eq("assignment_id", assignmentData.id)
        .eq("employee_id", assignmentData.employee_id)
        .maybeSingle();

      const isFullyCompleted = !!completionData;

      setProgress({
        intro_completed: scormCompleted || isFullyCompleted,
        scorm_completed: scormCompleted,
        plan_viewed: isFullyCompleted,
        plan_certified: isFullyCompleted,
      });

      // Set current scene based on progress
      if (isFullyCompleted) {
        setCurrentScene('completion');
      } else if (scormCompleted) {
        setCurrentScene('plan_viewer');
      } else {
        setCurrentScene('intro');
      }

    } catch (error) {
      console.error("Error checking SBW-9237 progress:", error);
    }
  };

  const handleIntroComplete = () => {
    setProgress(prev => ({ ...prev, intro_completed: true }));
    setCurrentScene('scorm');
  };

  const handleScormComplete = async (score?: number) => {
    console.log("🎉 SBW-9237 SCORM completion detected, score:", score);
    console.log("🎯 Current scene before completion:", currentScene);
    console.log("🎯 WPV Plan data:", wpvPlan);
    
    setProgress(prev => ({ ...prev, scorm_completed: true }));
    
    toast({
      title: "Core Training Complete!",
      description: `Score: ${score || 100}%. Proceeding to WPV Plan review.`,
    });

    // Short delay before advancing
    setTimeout(() => {
      console.log("🎯 Advancing to plan_viewer scene");
      setCurrentScene('plan_viewer');
    }, 2000);
  };

  const handlePlanViewComplete = () => {
    setProgress(prev => ({ ...prev, plan_viewed: true, plan_certified: true }));
    setCurrentScene('completion');
  };

  const handleReturnToDashboard = () => {
    if (previewMode) {
      // In preview mode, don't navigate
      console.log('Preview mode - not navigating to dashboard');
    } else {
      navigate(`/learner/${assignment.employee_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {previewMode ? 'Loading preview...' : 'Loading training...'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Debug: {previewMode ? `Preview mode for client ${clientId}` : `Assignment ${assignmentId}`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Training Load Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!assignment || !companySettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Training Not Found</h2>
          <p className="text-muted-foreground mb-4">Unable to load training content</p>
          <button 
            onClick={() => previewMode ? window.location.reload() : navigate(-1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            {previewMode ? 'Retry' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentScene === 'intro' && (
        <SBW9237IntroScene
          companySettings={companySettings}
          onNext={handleIntroComplete}
          isCompleted={progress.intro_completed}
          testingMode={testingMode}
        />
      )}
      
      {currentScene === 'scorm' && (
        <SBW9237ScormScene
          assignment={assignment}
          companySettings={companySettings}
          onComplete={handleScormComplete}
          testingMode={testingMode}
        />
      )}
      
      {currentScene === 'plan_viewer' && (
        <SBW9237PlanViewerScene
          companySettings={companySettings}
          wpvPlan={wpvPlan}
          onComplete={handlePlanViewComplete}
          testingMode={testingMode}
        />
      )}
      
      {currentScene === 'completion' && (
        <SBW9237CompletionScene
          assignment={assignment}
          companySettings={companySettings}
          onReturnToDashboard={handleReturnToDashboard}
        />
      )}
    </>
  );
};