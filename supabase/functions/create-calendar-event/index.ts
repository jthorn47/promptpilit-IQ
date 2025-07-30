import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarRequest {
  title: string;
  notes: string;
  startDate?: string;
  endDate?: string;
  extractDateFromContent?: boolean;
  emailContent?: string;
  senderName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const eventData: CalendarRequest = await req.json();
    let startDate = eventData.startDate;
    let endDate = eventData.endDate;

    // Extract date/time from email content using GPT if requested
    if (eventData.extractDateFromContent && eventData.emailContent) {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (openAIApiKey) {
        try {
          const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'Extract date and time information from email content. Return only a JSON object with "startDate" and "endDate" in ISO format, or null if no clear date/time is found. Be conservative - only extract if clearly mentioned.'
                },
                {
                  role: 'user',
                  content: `Extract date/time from: ${eventData.emailContent}`
                }
              ],
              max_tokens: 150,
              temperature: 0.1
            }),
          });

          if (gptResponse.ok) {
            const gptData = await gptResponse.json();
            const extractedData = JSON.parse(gptData.choices[0].message.content);
            
            if (extractedData.startDate) {
              startDate = extractedData.startDate;
              endDate = extractedData.endDate || extractedData.startDate;
            }
          }
        } catch (error) {
          console.log('Failed to extract date with GPT:', error);
          // Continue without extracted dates
        }
      }
    }

    // Default to 1 hour from now if no dates provided
    if (!startDate) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      startDate = now.toISOString();
      
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 1);
      endDate = endTime.toISOString();
    }

    // Check for Google Calendar integration
    const googleCalendarKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    const googleAccessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN'); // This would come from OAuth

    if (googleCalendarKey && googleAccessToken) {
      // Create Google Calendar event
      const calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${googleCalendarKey}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: eventData.title,
            description: `${eventData.notes}\n\nCreated from email by: ${eventData.senderName}`,
            start: {
              dateTime: startDate,
              timeZone: 'UTC'
            },
            end: {
              dateTime: endDate,
              timeZone: 'UTC'
            },
            attendees: [{
              email: user.email,
              responseStatus: 'accepted'
            }]
          })
        }
      );

      if (!calendarResponse.ok) {
        throw new Error('Failed to create Google Calendar event');
      }

      const calendarEvent = await calendarResponse.json();
      
      return new Response(JSON.stringify({
        success: true,
        eventId: calendarEvent.id,
        system: 'google-calendar',
        message: 'Calendar event created successfully in Google Calendar',
        eventUrl: calendarEvent.htmlLink
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Use internal database as fallback
      const { data: event, error } = await supabase
        .from('email_calendar_events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.notes,
          start_date: startDate,
          end_date: endDate,
          sender_name: eventData.senderName,
          status: 'scheduled',
          metadata: {
            source: 'email',
            imported_at: new Date().toISOString(),
            extracted_from_content: eventData.extractDateFromContent
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        eventId: event.id,
        system: 'internal',
        message: 'Calendar event created successfully',
        startDate: startDate,
        endDate: endDate
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});