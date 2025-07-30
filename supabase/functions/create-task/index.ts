import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskRequest {
  title: string;
  notes: string;
  senderName: string;
  emailTimestamp: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
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

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const taskData: TaskRequest = await req.json();

    // Check if we have a Pulse API endpoint configured
    const pulseApiUrl = Deno.env.get('PULSE_API_URL');
    const pulseApiKey = Deno.env.get('PULSE_API_KEY');

    if (pulseApiUrl && pulseApiKey) {
      // Use external Pulse API
      const pulseResponse = await fetch(`${pulseApiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pulseApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.notes,
          assignee: user.email,
          priority: taskData.priority || 'medium',
          tags: [`sender:${taskData.senderName}`, `email-import`],
          due_date: taskData.dueDate,
          source: 'email',
          metadata: {
            email_timestamp: taskData.emailTimestamp,
            sender: taskData.senderName,
            imported_at: new Date().toISOString()
          }
        })
      });

      if (!pulseResponse.ok) {
        throw new Error('Failed to create task in Pulse');
      }

      const pulseTask = await pulseResponse.json();
      
      return new Response(JSON.stringify({
        success: true,
        taskId: pulseTask.id,
        system: 'pulse',
        message: 'Task created successfully in Pulse'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Use internal database as fallback
      const { data: task, error } = await supabase
        .from('email_tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          notes: taskData.notes,
          sender_name: taskData.senderName,
          email_timestamp: taskData.emailTimestamp,
          priority: taskData.priority || 'medium',
          status: 'pending',
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
          tags: [`sender:${taskData.senderName}`, 'email-import'],
          metadata: {
            source: 'email',
            imported_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        taskId: task.id,
        system: 'internal',
        message: 'Task created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});