import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CertificateRequest {
  assignmentId: string;
  employeeId: string;
  moduleId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { assignmentId, employeeId, moduleId }: CertificateRequest = await req.json();

    if (!assignmentId || !employeeId || !moduleId) {
      throw new Error('Missing required fields: assignmentId, employeeId, or moduleId');
    }

    console.log('Generating certificate for:', { assignmentId, employeeId, moduleId });

    // Get assignment details with training module and employee info
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('training_assignments')
      .select(`
        *,
        training_modules(id, title, description, credit_value),
        employees(id, first_name, last_name, user_id)
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError) {
      console.error('Error fetching assignment:', assignmentError);
      throw new Error('Assignment not found');
    }

    // Get completion data
    const { data: completionData, error: completionError } = await supabase
      .from('training_completions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('employee_id', employeeId)
      .single();

    if (completionError) {
      console.error('Error fetching completion:', completionError);
      throw new Error('Training completion not found');
    }

    // Generate certificate data
    const certificateNumber = `CERT-${Date.now()}-${employeeId.slice(-4)}`;
    const verificationToken = crypto.randomUUID();
    const learnerName = `${assignmentData.employees.first_name} ${assignmentData.employees.last_name}`;
    const courseTitle = assignmentData.training_modules.title;
    const completionDate = new Date(completionData.completed_at);
    
    // Create certificate record
    const { data: certificateData, error: certificateError } = await supabase
      .from('certificates')
      .insert({
        user_id: assignmentData.employees.user_id,
        employee_id: employeeId,
        training_module_id: moduleId,
        course_title: courseTitle,
        learner_name: learnerName,
        instructor_name: 'Jeffrey D. Thorn',
        score: completionData.quiz_score || null,
        completion_date: completionDate.toISOString(),
        certificate_number: certificateNumber,
        qr_code_data: `https://verify.easelearn.com/${certificateNumber}`,
        verification_token: verificationToken,
        status: 'active',
        company_id: assignmentData.company_id,
        certificate_data: {
          assignment_id: assignmentId,
          credit_value: assignmentData.training_modules.credit_value,
          description: assignmentData.training_modules.description,
          completion_method: 'online_training',
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (certificateError) {
      console.error('Error creating certificate:', certificateError);
      throw new Error('Failed to create certificate record');
    }

    console.log('Certificate created successfully:', certificateData.id);

    // For now, return success with certificate data
    // In a full implementation, you might generate a PDF here
    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificateData.id,
          certificateNumber: certificateNumber,
          verificationToken: verificationToken,
          // For now, we'll point to a certificate viewer page
          certificateUrl: `/certificates/view/${certificateData.id}`,
        },
        message: 'Certificate generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Certificate generation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate certificate'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});