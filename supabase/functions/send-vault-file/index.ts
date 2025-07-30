import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { conversationId, fileId, fileName } = await req.json();

    if (!conversationId || !fileId) {
      throw new Error('Missing required parameters');
    }

    console.log(`📁 Sending vault file ${fileName} to conversation ${conversationId}`);

    // Get conversation details
    const { data: conversation, error: convError } = await supabaseClient
      .from('sms_conversations')
      .select('phone_number')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // Generate secure temporary link (24 hour expiry)
    const { data: fileData, error: fileError } = await supabaseClient
      .from('vault_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError) throw fileError;

    // Create secure sharing link
    const { data: urlData, error: urlError } = await supabaseClient
      .storage
      .from('vault')
      .createSignedUrl(fileData.file_path, 86400); // 24 hours

    if (urlError) throw urlError;

    // Send SMS with file link
    const message = `📄 ${fileName} has been shared with you. Download: ${urlData.signedUrl} (expires in 24 hours)`;
    
    const { data: smsData, error: smsError } = await supabaseClient.functions.invoke('twilio-sms-helper', {
      body: {
        to: conversation.phone_number,
        message: message,
        conversationId: conversationId
      }
    });

    if (smsError) throw smsError;

    console.log(`✅ Vault file sent successfully`);

    return new Response(
      JSON.stringify({ success: true, message: 'File sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Send vault file error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});