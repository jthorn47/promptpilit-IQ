import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const handler = async (req: Request): Promise<Response> => {
  console.log('👁️ Email tracking pixel accessed');

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('id');

    if (!trackingId) {
      console.error('❌ No tracking ID provided');
      return new Response(null, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client information
    const userAgent = req.headers.get('User-Agent') || '';
    const forwardedFor = req.headers.get('X-Forwarded-For');
    const realIp = req.headers.get('X-Real-IP');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Record the tracking event
    const { error: trackingError } = await supabase
      .from('crm_email_tracking')
      .update({
        opened_at: new Date().toISOString(),
        open_count: 1, // This should increment in real implementation
        ip_address: clientIp,
        user_agent: userAgent,
        status: 'opened',
      })
      .eq('tracking_id', trackingId);

    if (trackingError) {
      console.error('⚠️ Failed to update tracking:', trackingError);
    } else {
      console.log('✅ Email open tracked successfully');
    }

    // Get tracking record to notify sender
    const { data: tracking } = await supabase
      .from('crm_email_tracking')
      .select('sender_id, recipient_email')
      .eq('tracking_id', trackingId)
      .single();

    if (tracking) {
      // Create notification for sender (could be WebSocket or in-app notification)
      console.log(`📬 Email opened by ${tracking.recipient_email}`);
      
      // Here you could implement real-time notification to the sender
      // For now, we'll just log it
    }

    // Return 1x1 transparent pixel
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
      0x01, 0x00, 0x3B
    ]);

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('💥 Error in email-tracking function:', error);
    
    // Return pixel even on error to avoid breaking email display
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
      0x01, 0x00, 0x3B
    ]);

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
};

serve(handler);