import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, CheckCircle, Volume2, VolumeX, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Capacitor } from '@capacitor/core';

// Import the SBW9237 training flow directly
import { SBW9237TrainingFlow } from "@/components/learner/SBW9237TrainingFlow";

interface SBW9237Module {
  id: string;
  client_id: string;
  status: 'unpublished' | 'published' | 'archived';
  wpv_plan_content: string | null;
  wpv_plan_file_url: string | null;
  wpv_plan_type: 'html' | 'pdf' | 'website';
  wpv_plan_audio_url: string | null;
  intro_custom_text: string | null;
  intro_company_logo_url: string | null;
  intro_audio_url: string | null;
  scorm_package_url: string;
  video_url: string | null;
}

interface Client {
  id: string;
  company_name: string;
}

const TrainingFlow = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // DEBUG: Component is being rendered
  console.log('=== TrainingFlow Component Loaded ===');
  console.log('URL params:', Object.fromEntries(searchParams.entries()));
  console.log('Current URL:', window.location.href);
  
  // For admin routes like /admin/clients/{id}/sbw9237, extract client ID from URL
  const pathSegments = window.location.pathname.split('/');
  const isAdminRoute = pathSegments.includes('admin') && pathSegments.includes('clients') && pathSegments.includes('sbw9237');
  const clientIdFromPath = isAdminRoute ? pathSegments[pathSegments.indexOf('clients') + 1] : null;
  
  console.log('🔍 TrainingFlow URL parsing:', { 
    pathname: window.location.pathname, 
    pathSegments, 
    isAdminRoute, 
    clientIdFromPath 
  });
  
  const isPreview = searchParams.get('preview') === 'sbw9237' || searchParams.has('planId') || isAdminRoute;
  const clientId = searchParams.get('client') || clientIdFromPath;
  const planId = searchParams.get('planId');
  
  const [client, setClient] = useState<Client | null>(null);
  const [module, setModule] = useState<SBW9237Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Create assignment object for the SBW9237 flow
  const assignment = module ? {
    id: module.id,
    employee_id: 'preview-user',
    employees: {
      id: 'preview-user',
      first_name: 'Preview',
      last_name: 'User'
    },
    training_modules: {
      id: module.id,
      title: 'SBW-9237 Workplace Violence Prevention',
      description: 'California Labor Code §6401.9 (SB 553) compliance training'
    }
  } : null;

  useEffect(() => {
    console.log('=== TrainingFlow useEffect ===');
    console.log('clientId:', clientId);
    console.log('planId:', planId);
    console.log('isPreview:', isPreview);
    console.log('Condition check:', (clientId && isPreview) || planId);
    
    // Check if running on mobile platform
    setIsMobile(Capacitor.isNativePlatform() || window.innerWidth <= 768);
    
    console.log('🎯 TrainingFlow useEffect conditions:', {
      clientId,
      clientIdFromPath,
      planId,
      isPreview,
      condition1: (clientId && isPreview),
      condition2: !!planId,
      condition3: (clientIdFromPath && isPreview),
      finalCondition: (clientId && isPreview) || planId || (clientIdFromPath && isPreview)
    });
    
    if ((clientId && isPreview) || planId || (clientIdFromPath && isPreview)) {
      console.log('✅ Calling fetchData');
      fetchData();
    } else {
      console.log('❌ Not calling fetchData, conditions not met');
      setLoading(false);
    }
  }, [clientId, isPreview, planId]);

  const fetchData = async () => {
    let actualClientId = clientId;
    
    try {
      setLoading(true);
      console.log('🔄 TrainingFlow fetchData START:', { clientId, planId, isPreview });
      
      // SHARED URL FLOW: If we have a planId but no clientId (shared public URL)
      if (planId && !clientId) {
        console.log('📋 Shared URL - Looking for module by planId:', planId);
        
        // For shared URLs, try to find the published module by ID
        const { data: moduleData, error: moduleError } = await supabase
          .from('client_sbw9237_modules')
          .select(`
            *,
            clients!inner (
              id,
              company_name
            )
          `)
          .eq('id', planId)
          .eq('status', 'published')  // Only published modules for shared URLs
          .maybeSingle();

        console.log('📋 Shared URL module search:', { moduleData, moduleError });
        
        if (moduleError) {
          console.error('❌ Error fetching shared module:', moduleError);
          throw new Error(`Unable to load shared training: ${moduleError.message}`);
        }
        
        if (!moduleData) {
          console.error('❌ No published module found for planId:', planId);
          throw new Error('Training not found or not available for public access');
        }
        
        if (moduleData && moduleData.clients) {
          console.log('✅ Found shared module and client:', moduleData);
          setModule(moduleData as SBW9237Module);
          setClient(moduleData.clients as unknown as Client);
          return;
        } else {
          throw new Error('Training data incomplete - missing client information');
        }
      }
      
      // ADMIN PREVIEW FLOW: Fetch by clientId (admin routes)
      if (actualClientId) {
        console.log('🔧 Admin preview - Fetching by clientId:', actualClientId);
        
        // Fetch client info
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, company_name')
          .eq('id', actualClientId)
          .maybeSingle();

        console.log('🔧 Client data:', { clientData, clientError });

        if (clientError) {
          console.error('❌ Client fetch error:', clientError);
          throw new Error(`Unable to load client: ${clientError.message}`);
        }
        if (!clientData) {
          throw new Error('Client not found');
        }
        setClient(clientData);

        // Fetch SBW-9237 module (allow both published and unpublished for admin preview)
        const { data: moduleData, error: moduleError } = await supabase
          .from('client_sbw9237_modules')
          .select('*')
          .eq('client_id', actualClientId)
          .maybeSingle();

        console.log('🔧 Module data:', { moduleData, moduleError });

        if (moduleError) {
          console.error('❌ Module fetch error:', moduleError);
          throw new Error(`Unable to load training module: ${moduleError.message}`);
        }
        if (!moduleData) {
          throw new Error('Training module not found for this client');
        }
        setModule(moduleData as SBW9237Module);
      } else {
        throw new Error('No client ID provided or found');
      }

    } catch (error) {
      console.error('❌ TRAINING FLOW ERROR:', error);
      console.error('📊 Error context:', {
        message: error.message,
        clientId: actualClientId || clientId,
        planId,
        isPreview,
        isSharedUrl: !!planId && !clientId,
        isAdminPreview: !!clientId && isPreview,
        pathname: window.location.pathname,
        search: window.location.search,
        stack: error.stack
      });
      
      // Show user-friendly error message
      const errorMsg = error.message || 'Unable to load training content';
      toast.error(errorMsg);
      console.log('🚨 TRAINING LOAD FAILED - User will see error state');
    } finally {
      setLoading(false);
      console.log('🏁 TrainingFlow fetchData COMPLETE');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading training workflow...</p>
        </div>
      </div>
    );
  }

  // Better error state handling
  if (!isPreview || !client || !module) {
    console.log('🚫 Training not available:', { isPreview, hasClient: !!client, hasModule: !!module });
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Training Not Available</h3>
              <p className="text-muted-foreground mb-4">
                {!isPreview ? 'Invalid training link' : 
                 !client ? 'Company information not found' :
                 !module ? 'Training content not found' :
                 'Unable to load training content'}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Debug: preview={String(isPreview)}, client={String(!!client)}, module={String(!!module)}</div>
                <div>planId: {planId || 'none'}, clientId: {clientId || 'none'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${Capacitor.isNativePlatform() ? 'capacitor-app' : ''} ${isMobile ? 'mobile-container' : ''}`}>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Loading Error</h3>
                  <p className="text-muted-foreground mb-4">There was an issue loading the training flow.</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                  >
                    Retry Training
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        {module && client ? (
          <>
            <SBW9237TrainingFlow
              previewMode={true}
              clientId={clientIdFromPath || clientId || client.id}
              testingMode={false}
            />
          </>
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Preparing training content...</p>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default TrainingFlow;