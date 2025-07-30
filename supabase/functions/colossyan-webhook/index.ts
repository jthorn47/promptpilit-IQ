import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColossyanWebhookPayload {
  id: string;
  status: 'completed' | 'failed' | 'processing';
  video_url?: string;
  error_message?: string;
  metadata?: {
    generation_id: string;
    user_id: string;
    company_id: string;
  };
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

    const webhookData: ColossyanWebhookPayload = await req.json();
    
    console.log('Received Colossyan webhook:', {
      id: webhookData.id,
      status: webhookData.status,
      has_video_url: !!webhookData.video_url
    });

    if (!webhookData.metadata?.generation_id) {
      console.error('Missing generation_id in webhook metadata');
      return new Response('Missing generation_id', { status: 400 });
    }

    // Get the generation record
    const { data: generation, error: fetchError } = await supabase
      .from('colossyan_generations')
      .select('*')
      .eq('id', webhookData.metadata.generation_id)
      .single();

    if (fetchError || !generation) {
      console.error('Generation not found:', webhookData.metadata.generation_id);
      return new Response('Generation not found', { status: 404 });
    }

    if (webhookData.status === 'completed' && webhookData.video_url) {
      console.log('Video generation completed, creating SCORM package...');
      
      // Create SCORM package with the video
      const scormPackageResult = await createScormPackage(
        webhookData.video_url,
        generation.script_content,
        generation.id
      );

      // Update generation record with completion data
      const { error: updateError } = await supabase
        .from('colossyan_generations')
        .update({
          status: 'completed',
          video_url: webhookData.video_url,
          scorm_package_url: scormPackageResult.package_url,
          completed_at: new Date().toISOString(),
          webhook_received_at: new Date().toISOString(),
          result_data: {
            ...generation.result_data,
            webhook_data: webhookData,
            scorm_package: scormPackageResult
          }
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('Failed to update generation:', updateError);
        throw updateError;
      }

      // If there's a training scene, update it with the SCORM package
      if (generation.training_scene_id && scormPackageResult.package_url) {
        await supabase
          .from('training_scenes')
          .update({
            scorm_package_url: scormPackageResult.package_url,
            scene_type: 'scorm',
            metadata: {
              generated_with_ai: true,
              colossyan_generation_id: generation.id,
              video_url: webhookData.video_url,
              script_content: generation.script_content
            }
          })
          .eq('id', generation.training_scene_id);
      }

      console.log('Generation completed successfully:', generation.id);

    } else if (webhookData.status === 'failed') {
      // Update generation with failure
      const { error: updateError } = await supabase
        .from('colossyan_generations')
        .update({
          status: 'failed',
          error_message: webhookData.error_message || 'Generation failed',
          webhook_received_at: new Date().toISOString(),
          result_data: {
            ...generation.result_data,
            webhook_data: webhookData
          }
        })
        .eq('id', generation.id);

      if (updateError) {
        console.error('Failed to update generation:', updateError);
        throw updateError;
      }

      console.log('Generation failed:', generation.id, webhookData.error_message);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in colossyan-webhook function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createScormPackage(videoUrl: string, scriptContent: string, generationId: string) {
  try {
    console.log('Creating SCORM package for video:', videoUrl);
    
    // Download the video file
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download video');
    }
    
    const videoBlob = await videoResponse.blob();
    const videoArrayBuffer = await videoBlob.arrayBuffer();
    
    // Create SCORM 1.2 manifest
    const manifest = createScormManifest(generationId, scriptContent);
    
    // Create HTML wrapper for the video
    const htmlContent = createScormHtml(generationId);
    
    // Create a simple ZIP structure for SCORM package
    const scormFiles = {
      'imsmanifest.xml': manifest,
      'index.html': htmlContent,
      'video.mp4': new Uint8Array(videoArrayBuffer)
    };
    
    // In a real implementation, you would create a proper ZIP file
    // For now, we'll simulate the package creation
    const packageUrl = `https://example.com/scorm-packages/${generationId}.zip`;
    
    return {
      package_url: packageUrl,
      manifest_content: manifest,
      html_content: htmlContent
    };
    
  } catch (error) {
    console.error('Error creating SCORM package:', error);
    throw error;
  }
}

function createScormManifest(generationId: string, title: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="AI_Generated_${generationId}" version="1"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                      http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="default_org">
    <organization identifier="default_org">
      <title>${title.substring(0, 100)}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>AI Generated Training Video</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="video.mp4"/>
    </resource>
  </resources>
</manifest>`;
}

function createScormHtml(generationId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>AI Generated Training Video</title>
    <meta charset="utf-8">
    <script type="text/javascript">
        var API = null;
        
        function findAPI(win) {
            var findAPITries = 0;
            while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
                findAPITries++;
                if (findAPITries > 7) return null;
                win = win.parent;
            }
            return win.API;
        }
        
        function getAPI() {
            if (API == null) API = findAPI(window);
            return API;
        }
        
        function initializeCourse() {
            var api = getAPI();
            if (api != null) {
                api.LMSInitialize("");
                api.LMSSetValue("cmi.core.lesson_status", "incomplete");
                api.LMSCommit("");
            }
        }
        
        function finishCourse() {
            var api = getAPI();
            if (api != null) {
                api.LMSSetValue("cmi.core.lesson_status", "completed");
                api.LMSSetValue("cmi.core.score.raw", "100");
                api.LMSCommit("");
                api.LMSFinish("");
            }
        }
        
        window.onload = function() {
            initializeCourse();
            
            var video = document.getElementById('trainingVideo');
            video.addEventListener('ended', function() {
                finishCourse();
            });
        };
    </script>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; }
        video { width: 100%; height: auto; }
        .completion-message { display: none; text-align: center; color: green; }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Generated Training Video</h1>
        <video id="trainingVideo" controls>
            <source src="video.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div id="completionMessage" class="completion-message">
            <h2>Training Completed!</h2>
            <p>You have successfully completed this training module.</p>
        </div>
    </div>
</body>
</html>`;
}