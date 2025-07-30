import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const filePath = url.searchParams.get('path');
    
    if (!filePath) {
      return new Response('Missing file path parameter', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('🎓 SCORM Proxy - Serving file:', filePath);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the file from storage
    const { data: fileData, error } = await supabase.storage
      .from('training-files')
      .download(filePath);

    if (error) {
      console.error('❌ Error downloading file:', error);
      return new Response('File not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Determine correct Content-Type based on file extension
    const getContentType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop();
      
      switch (ext) {
        case 'html':
        case 'htm':
          return 'text/html; charset=utf-8';
        case 'js':
          return 'application/javascript; charset=utf-8';
        case 'css':
          return 'text/css; charset=utf-8';
        case 'json':
          return 'application/json; charset=utf-8';
        case 'xml':
          return 'application/xml; charset=utf-8';
        case 'png':
          return 'image/png';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'gif':
          return 'image/gif';
        case 'svg':
          return 'image/svg+xml';
        case 'mp4':
          return 'video/mp4';
        case 'mp3':
          return 'audio/mpeg';
        case 'woff':
        case 'woff2':
          return 'font/woff2';
        case 'ttf':
          return 'font/ttf';
        case 'eot':
          return 'application/vnd.ms-fontobject';
        default:
          return 'application/octet-stream';
      }
    };

    const contentType = getContentType(filePath);
    console.log('🎓 SCORM Proxy - Content-Type:', contentType);

    // If it's an HTML file, ensure correct Content-Type and inject base tag
    if (contentType.startsWith('text/html')) {
      const htmlText = await fileData.text();
      const baseHref = `${supabaseUrl}/storage/v1/object/public/training-files/${filePath.substring(0, filePath.lastIndexOf('/') + 1)}`;
      const baseTag = `<base href="${baseHref}">`;
      
      let modifiedHtml = htmlText;
      if (!htmlText.includes('<base href=')) {
        modifiedHtml = htmlText.replace(/<head[^>]*>/i, match => `${match}\n${baseTag}`);
        console.log('🎓 SCORM Proxy - Injected base href:', baseHref);
      }

      return new Response(modifiedHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // For non-HTML files, return as-is with correct Content-Type
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('❌ SCORM Proxy error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});