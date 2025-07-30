import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColossyanGenerationRequest {
  script: string;
  avatar?: string;
  template?: string;
  language?: string;
  brandSettings?: {
    logo?: string;
    colors?: { primary?: string; secondary?: string; };
  };
  trainingModuleId?: string;
  trainingSceneId?: string;
}

interface ColossyanConfig {
  api_key: string;
  workspace_id: string;
  brand_kit_id?: string;
  webhook_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Function started, getting user...');

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication');
    }

    console.log('User authenticated:', user.id);

    // Get request data
    const requestData: ColossyanGenerationRequest = await req.json();
    
    console.log('Colossyan generation request:', { 
      userId: user.id, 
      scriptLength: requestData.script.length,
      avatar: requestData.avatar,
      template: requestData.template 
    });

    // Get user's company from user_roles table
    console.log('Getting user role...');
    const { data: userRole, error: userRoleError } = await supabase
      .from('user_roles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    console.log('User role query result:', { userRole, userRoleError });

    if (!userRole) {
      throw new Error('User role not found');
    }

    // For super_admin, allow them to specify company or use first available company
    let companyId = userRole.company_id;
    
    if (userRole.role === 'super_admin' && !companyId) {
      // If no company specified in request, get the first available company
      const { data: firstCompany } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .single();
      
      if (!firstCompany) {
        throw new Error('No companies available in the system');
      }
      
      companyId = firstCompany.id;
    }

    console.log('Company ID determined:', companyId);

    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        company_id: companyId,
        action_type: 'colossyan_generation_attempt',
        resource_type: 'colossyan_integration',
        details: `User ${user.id} attempting to generate Colossyan video`,
        status: 'in_progress'
      });

    // Get Colossyan integration configuration
    console.log('Getting Colossyan integration...');
    
    // First, get the Colossyan provider ID
    const { data: provider } = await supabase
      .from('integration_providers')
      .select('id')
      .eq('name', 'colossyan')
      .single();
    
    if (!provider) {
      throw new Error('Colossyan provider not found in system');
    }
    
    // For super_admin, first try to find a company-specific integration, then fall back to system-wide
    let integration;
    let integrationError;
    
    if (userRole.role === 'super_admin') {
      // First try company-specific, then system-wide (company_id = null)
      const { data: companyIntegration } = await supabase
        .from('integrations')
        .select('configuration, credentials')
        .eq('company_id', companyId)
        .eq('provider_id', provider.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (companyIntegration?.credentials) {
        integration = companyIntegration;
      } else {
        // Fall back to system-wide integration
        const { data: systemIntegration, error: systemError } = await supabase
          .from('integrations')
          .select('configuration, credentials')
          .is('company_id', null)
          .eq('provider_id', provider.id)
          .eq('status', 'active')
          .maybeSingle();
        
        integration = systemIntegration;
        integrationError = systemError;
      }
    } else {
      // Regular users - only look for company-specific integration
      const { data: companyIntegration, error: companyError } = await supabase
        .from('integrations')
        .select('configuration, credentials')
        .eq('company_id', companyId)
        .eq('provider_id', provider.id)
        .eq('status', 'active')
        .maybeSingle();
      
      integration = companyIntegration;
      integrationError = companyError;
    }

    console.log('Integration query result:', { integration, integrationError });

    if (!integration?.credentials) {
      console.error('No Colossyan integration found:', { integration, provider });
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          company_id: companyId,
          action_type: 'colossyan_generation_failed',
          resource_type: 'colossyan_integration',
          details: 'Colossyan integration not configured',
          status: 'failed'
        });
      throw new Error('Colossyan integration not configured. Please set up your Colossyan Enterprise credentials in Settings.');
    }

    const colossyanConfig = integration.credentials as ColossyanConfig;

    // Create generation record
    // Handle undefined/null values for optional fields
    const insertData: any = {
      user_id: user.id,
      company_id: companyId,
      script_content: requestData.script,
      selected_avatar: requestData.avatar || null,
      selected_template: requestData.template || null,
      language_code: requestData.language || 'en',
      brand_settings: requestData.brandSettings || {},
      generation_config: {
        workspace_id: colossyanConfig.workspace_id,
        brand_kit_id: colossyanConfig.brand_kit_id
      },
      status: 'pending',
      started_at: new Date().toISOString()
    };

    // Only include training_module_id and training_scene_id if they are provided
    if (requestData.trainingModuleId) {
      insertData.training_module_id = requestData.trainingModuleId;
    }
    if (requestData.trainingSceneId) {
      insertData.training_scene_id = requestData.trainingSceneId;
    }

    console.log('Creating generation record with data:', {
      ...insertData,
      script_content: `[${insertData.script_content.length} characters]`
    });

    const { data: generation, error: insertError } = await supabase
      .from('colossyan_generations')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create generation record:', insertError);
      throw new Error('Failed to create generation record');
    }

    // Prepare Colossyan API request
    const colossyanRequest = {
      script: requestData.script,
      workspace_id: colossyanConfig.workspace_id,
      language: requestData.language || 'en',
      output_format: 'mp4',
      quality: 'high',
      ...(requestData.avatar && { avatar_id: requestData.avatar }),
      ...(colossyanConfig.brand_kit_id && { brand_kit_id: colossyanConfig.brand_kit_id }),
      ...(requestData.template && { template_id: requestData.template }),
      webhook_url: colossyanConfig.webhook_url || `${Deno.env.get('SUPABASE_URL')}/functions/v1/colossyan-webhook`,
      metadata: {
        generation_id: generation.id,
        user_id: user.id,
        company_id: companyId
      }
    };

    console.log('Sending request to Colossyan API...');

    // Call Colossyan API
    const colossyanResponse = await fetch('https://api.colossyan.com/v1/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${colossyanConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(colossyanRequest),
    });

    const colossyanData = await colossyanResponse.json();
    
    if (!colossyanResponse.ok) {
      console.error('Colossyan API error:', colossyanData);
      
      // Update generation with error
      await supabase
        .from('colossyan_generations')
        .update({
          status: 'failed',
          error_message: colossyanData.message || 'Unknown error from Colossyan API',
          result_data: colossyanData
        })
        .eq('id', generation.id);
      
      throw new Error(colossyanData.message || 'Failed to generate video');
    }

    // Update generation with Colossyan ID and processing status
    await supabase
      .from('colossyan_generations')
      .update({
        generation_id: colossyanData.id,
        status: 'processing',
        result_data: colossyanData
      })
      .eq('id', generation.id);

    console.log('Video generation started successfully:', colossyanData.id);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      colossyan_id: colossyanData.id,
      status: 'processing',
      estimated_duration: colossyanData.estimated_duration || 'Unknown'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in colossyan-generate function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});