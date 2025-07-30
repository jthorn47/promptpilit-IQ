import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

export async function getResendClient(): Promise<Resend> {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get the Resend integration from the database
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('credentials')
    .eq('name', 'System emails')
    .eq('status', 'active')
    .single();

  if (error || !integrations?.credentials?.api_key) {
    throw new Error("Resend integration not found or API key not configured");
  }

  return new Resend(integrations.credentials.api_key);
}