import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PayrollContext {
  currentRoute?: string;
  userId?: string;
  timestamp?: string;
}

interface IntentRequest {
  query: string;
  mode: 'Q&A' | 'Task Guidance' | 'Troubleshooting';
  context?: PayrollContext;
}

// Intent classification patterns
const INTENT_PATTERNS = {
  'Q&A': {
    payroll_status: /status|current|running|progress/i,
    employee_info: /employee|john|jane|staff|worker/i,
    tax_info: /tax|withholding|deduction|federal|state/i,
    reports: /report|summary|total|count/i,
    general: /what|how|when|where|why/i
  },
  'Task Guidance': {
    run_payroll: /run|process|execute|start.*payroll/i,
    add_bonus: /bonus|extra|additional.*pay/i,
    tax_setup: /setup|configure|tax.*filing/i,
    generate_stubs: /stub|pay.*stub|generate/i,
    off_cycle: /off.cycle|retro|adjustment/i
  },
  'Troubleshooting': {
    tax_calculation: /wrong|incorrect|tax.*calculation/i,
    missing_hours: /missing|hours|time/i,
    ach_errors: /ach|batch.*error|failed/i,
    payroll_failed: /failed|error|problem.*payroll/i,
    exceptions: /exception|alert|issue/i
  }
};

// Response templates
const RESPONSE_TEMPLATES = {
  'Q&A': {
    payroll_status: "I can see you're asking about payroll status. Currently, the system shows active payroll runs and pending processes. Would you like me to check specific details?",
    employee_info: "I can help you look up employee information. For privacy reasons, I'll need specific employee IDs or names. What employee details are you looking for?",
    tax_info: "Tax calculations are handled by our Multi-State Tax Engine. I can explain withholding rules, rates, or help troubleshoot specific tax issues. What would you like to know?",
    reports: "I can help generate various payroll reports. Available options include pay period summaries, tax reports, and employee breakdowns. What type of report do you need?",
    general: "I'm here to help with payroll questions. Could you be more specific about what you'd like to know?"
  },
  'Task Guidance': {
    run_payroll: "Here's how to run payroll step-by-step:\n\n1. Navigate to Payroll > Processing\n2. Select pay period and employees\n3. Review time entries and adjustments\n4. Run calculations and review\n5. Submit for processing\n\nWould you like detailed guidance on any of these steps?",
    add_bonus: "To add a bonus payment:\n\n1. Go to Payroll > Off-Cycle\n2. Select 'Bonus Payment' type\n3. Choose employee(s)\n4. Enter bonus amount and reason\n5. Review tax calculations\n6. Process payment\n\nNeed help with any specific step?",
    tax_setup: "Tax filing setup involves:\n\n1. Configure jurisdictions in Tax Engine\n2. Set up employee tax profiles\n3. Define withholding rules\n4. Test calculations\n5. Enable filing\n\nWhich area would you like to focus on?",
    generate_stubs: "To generate pay stubs:\n\n1. Ensure payroll is processed\n2. Go to Reports > Pay Stubs\n3. Select pay period and employees\n4. Choose format (PDF/email)\n5. Generate and distribute\n\nAny specific requirements for the stubs?",
    off_cycle: "Off-cycle payroll processing:\n\n1. Access Off-Cycle module\n2. Select adjustment type\n3. Choose affected employees\n4. Enter details and amounts\n5. Review conflicts\n6. Process immediately or schedule\n\nWhat type of off-cycle adjustment do you need?"
  },
  'Troubleshooting': {
    tax_calculation: "Tax calculation issues can stem from:\n\n- Incorrect employee tax profiles\n- Missing jurisdiction setup\n- Outdated tax tables\n- State reciprocity conflicts\n\nLet me help diagnose the specific issue. Can you provide the employee ID and error details?",
    missing_hours: "Missing hours troubleshooting:\n\n1. Check time entry source\n2. Verify employee schedule\n3. Review approval status\n4. Check for system sync issues\n\nWhich employee has missing hours? I can help investigate further.",
    ach_errors: "ACH batch errors typically involve:\n\n- Invalid account information\n- Insufficient funds\n- Bank routing issues\n- File format problems\n\nWhat's the specific error message? I can help resolve the issue.",
    payroll_failed: "When payroll runs fail, common causes are:\n\n- Missing employee data\n- Tax calculation errors\n- System connectivity issues\n- Validation failures\n\nCan you share the error details so I can provide specific troubleshooting steps?",
    exceptions: "Payroll exceptions need attention. I can help you:\n\n- Review pending exceptions\n- Understand root causes\n- Provide resolution steps\n- Prevent future issues\n\nWhich exceptions are you seeing?"
  }
};

function classifyIntent(query: string, mode: string): string {
  const patterns = INTENT_PATTERNS[mode as keyof typeof INTENT_PATTERNS];
  
  for (const [intent, pattern] of Object.entries(patterns)) {
    if (pattern.test(query)) {
      return intent;
    }
  }
  
  return 'general';
}

function generateResponse(intent: string, mode: string, query: string): string {
  const templates = RESPONSE_TEMPLATES[mode as keyof typeof RESPONSE_TEMPLATES];
  const template = templates[intent as keyof typeof templates];
  
  if (template) {
    return template;
  }
  
  // Fallback responses
  const fallbacks = {
    'Q&A': "I understand you're looking for information. Could you provide more details about what you'd like to know regarding payroll?",
    'Task Guidance': "I can guide you through various payroll tasks. Could you specify which process you need help with?",
    'Troubleshooting': "I'm here to help resolve payroll issues. Could you describe the specific problem you're encountering?"
  };
  
  return fallbacks[mode as keyof typeof fallbacks] || "I'm here to help with payroll. Could you provide more details about your request?";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode, context }: IntentRequest = await req.json();

    console.log('Payroll Copilot Request:', { query, mode, context });

    // Classify the intent
    const intent = classifyIntent(query, mode);
    
    // Generate response
    const response = generateResponse(intent, mode, query);

    // Log the interaction
    try {
      await supabase.functions.invoke('log-ai-assistant-interaction', {
        body: {
          conversation_id: `copilot_${Date.now()}`,
          training_module_id: 'payroll_copilot',
          module_name: 'Smart Payroll Assistant',
          topic: intent,
          user_role: 'payroll_manager', // This would come from auth context
          current_section: context?.currentRoute,
          question: query,
          response: response
        }
      });
    } catch (logError) {
      console.error('Failed to log interaction:', logError);
      // Don't fail the request if logging fails
    }

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return new Response(JSON.stringify({ 
      response,
      intent,
      mode,
      suggestions: getSuggestions(intent, mode)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in payroll-copilot-intent-parser:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      response: "I'm experiencing technical difficulties. Please try again or contact support for assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSuggestions(intent: string, mode: string): string[] {
  const suggestions: Record<string, string[]> = {
    'Q&A': [
      "Show me this month's payroll summary",
      "What are the current tax rates?",
      "How many employees are active?"
    ],
    'Task Guidance': [
      "Walk me through tax setup",
      "Help me process a bonus",
      "Guide me through ACH processing"
    ],
    'Troubleshooting': [
      "Debug this tax calculation",
      "Fix missing employee hours",
      "Resolve payroll exceptions"
    ]
  };

  return suggestions[mode] || [];
}