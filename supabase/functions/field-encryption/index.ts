import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EncryptionRequest {
  data: any;
  fieldName: string;
  tableName: string;
  operation: 'encrypt' | 'decrypt';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, fieldName, tableName, operation }: EncryptionRequest = await req.json();

    console.log(`Field encryption ${operation} for ${tableName}.${fieldName}`);

    // Check if field requires encryption
    const { data: classification, error: classError } = await supabase
      .from('data_classifications')
      .select('*')
      .eq('table_name', tableName)
      .eq('column_name', fieldName)
      .single();

    if (classError || !classification) {
      console.log(`No classification found for ${tableName}.${fieldName}, proceeding without encryption`);
      return new Response(
        JSON.stringify({ data: data, encrypted: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!classification.encryption_required) {
      return new Response(
        JSON.stringify({ data: data, encrypted: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get encryption key
    const { data: encryptionKey, error: keyError } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('key_type', 'field_encryption')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (keyError || !encryptionKey) {
      console.error('No active encryption key found');
      return new Response(
        JSON.stringify({ error: 'No encryption key available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    if (operation === 'encrypt') {
      result = await encryptData(data, encryptionKey);
    } else {
      result = await decryptData(data, encryptionKey);
    }

    // Log the encryption/decryption activity
    await logEncryptionActivity(supabase, {
      tableName,
      fieldName,
      operation,
      classification: classification.classification_level,
      complianceFlags: classification.compliance_requirements
    });

    return new Response(
      JSON.stringify({ 
        data: result, 
        encrypted: operation === 'encrypt',
        classification: classification.classification_level
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in field encryption:', error);
    return new Response(
      JSON.stringify({ error: 'Encryption operation failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function encryptData(plaintext: string, encryptionKey: any): Promise<string> {
  // In a production environment, you would use a proper encryption library
  // For demo purposes, we'll use base64 encoding with a salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Simple XOR encryption for demo (use AES-256-GCM in production)
  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ salt[i % salt.length];
  }
  
  // Combine salt and encrypted data
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt);
  combined.set(encrypted, salt.length);
  
  // Return base64 encoded result
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(ciphertext: string, encryptionKey: any): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(atob(ciphertext).split('').map(char => char.charCodeAt(0)));
    
    // Extract salt and encrypted data
    const salt = combined.slice(0, 16);
    const encrypted = combined.slice(16);
    
    // Decrypt using XOR
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ salt[i % salt.length];
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

async function logEncryptionActivity(supabase: any, activity: any) {
  await supabase.functions.invoke('security-audit', {
    body: {
      eventType: 'encryption_operation',
      resourceType: activity.tableName,
      action: activity.operation,
      sensitiveDataAccessed: true,
      dataClassification: activity.classification,
      complianceFlags: activity.complianceFlags,
      metadata: {
        fieldName: activity.fieldName,
        encryptionRequired: true
      }
    }
  });
}