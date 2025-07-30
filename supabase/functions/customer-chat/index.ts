import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

// Detect if response needs review
const needsReview = (userMessage: string, aiResponse: string): { needsReview: boolean; reason?: string } => {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();
  
  // Check for escalation keywords
  const escalationKeywords = ['speak to', 'talk to', 'human', 'representative', 'agent', 'person', 'manager', 'help me', 'not working', 'frustrated', 'angry', 'complaint'];
  const hasEscalation = escalationKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Check for vague or unhelpful responses
  const vagueResponses = ['i don\'t know', 'not sure', 'can\'t help', 'unable to', 'sorry, i', 'apologize'];
  const hasVagueResponse = vagueResponses.some(phrase => lowerResponse.includes(phrase));
  
  // Check if response is too short (might be incomplete)
  const isTooShort = aiResponse.length < 50;
  
  if (hasEscalation) return { needsReview: true, reason: 'User requested human assistance' };
  if (hasVagueResponse) return { needsReview: true, reason: 'AI gave vague or unhelpful response' };
  if (isTooShort) return { needsReview: true, reason: 'Response too short, may be incomplete' };
  
  return { needsReview: false };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, sessionId } = await req.json();
    const startTime = Date.now();
    
    console.log('Customer chat request:', { message, historyLength: conversationHistory?.length, sessionId });

    if (!message) {
      throw new Error('Message is required');
    }

    // Get user info from headers
    const userAgent = req.headers.get('user-agent') || '';
    const userIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    
    // Create or update chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .upsert({
        session_id: sessionId || crypto.randomUUID(),
        user_ip: userIP,
        user_agent: userAgent,
        total_messages: (conversationHistory?.length || 0) + 1
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    // Build conversation context from history
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant for EaseLearn, a workplace safety training company that has been in business since 2000. You help potential customers learn about our training solutions.

Key information about EaseLearn:
- Founded in 2000, 24+ years of experience
- Specializes in workplace violence prevention and sexual harassment training
- Serves 3,000+ companies and has trained 25,000+ employees
- 99.8% compliance rate
- Offers interactive, mobile-ready training modules
- Available in all 50 states
- Contact: hello@easelearn.com, 888-843-0880
- Three main plans: Easy, Easier, Easiest (per-seat pricing)

IMPORTANT: If someone asks about booking a demo, seeing a demo, scheduling a call, or wants to speak with someone, provide them with our calendar scheduler link: https://calendly.com/easelearn-demo

TOP 50 FAQs - Use this knowledge to answer questions:

SB 553 (Workplace Violence Prevention):
1. What is SB 553? California's new law requiring employers to create a Workplace Violence Prevention Plan (WVPP) and provide training.
2. Who does SB 553 apply to? Most employers in California with at least one employee.
3. When did SB 553 take effect? July 1, 2024.
4. What does SB 553 require? A written WVPP, annual training, and documentation of violent incidents.
5. Do I need a WVPP if I have an IIPP? Yes. SB 553 requires a separate or integrated WVPP with specific elements.
6. What must the WVPP include? Risk assessments, reporting procedures, response protocols, and training.
7. Can I use a template for my WVPP? Yes — EaseLearn offers a guided wizard that builds your plan.
8. How often must I update the plan? Whenever workplace risks or personnel change, and review it at least annually.
9. Who needs training? All employees, including part-time and temporary workers.
10. How often is training required? At least once a year and upon hire.
11. Does training need to be interactive? Yes. Employees must be able to ask questions.
12. Can I use self-paced or video training? Yes, if it allows questions and meets Cal/OSHA's interactive standard.
13. Are remote employees included? Yes, if they interact with others or are exposed to risk.
14. Are any industries exempt? Yes. Law enforcement, corrections, and certain healthcare facilities have exemptions.
15. What happens if I don't comply? You may face citations, fines, or Cal/OSHA inspections.

Sexual Harassment (SB 1343 & AB 1825):
16. What is SB 1343? A law requiring harassment training for employers with 5+ employees.
17. What is AB 1825? The original law requiring training for supervisors at companies with 50+ employees.
18. Who must take training? All employees: 1 hour for staff, 2 hours for supervisors.
19. How often is training required? Every 2 years and within 6 months of hire/promotion.
20. Do seasonal or temp workers need training? Yes, if they'll work more than 6 months.
21. Is training available in Spanish? Yes. EaseLearn offers English and Spanish options with subtitles.
22. Is the training legally compliant? Yes. It meets all California legal requirements.
23. What if I miss the deadline? You could face penalties and increased legal risk.

EaseLearn Platform Features:
24. What is EaseLearn? A compliance platform for training, plan creation, and tracking.
25. What makes it different? It's built specifically for California laws like SB 553 and SB 1343.
26. Does it include both training and plans? Yes. Everything is in one place.
27. Can I track employee progress? Yes, in real-time from your admin dashboard.
28. Are reminders sent automatically? Yes. Due dates and renewal reminders are automated.
29. Can I download certificates? Yes. Every course includes a completion certificate.
30. Can I assign by job role? Yes. Assign supervisor or employee versions easily.
31. Can I bulk assign training? Yes. Upload users and assign in seconds.
32. Is the platform mobile-friendly? Yes. Accessible on phones, tablets, and desktops.
33. Do employees need to log in? No. Kiosk mode allows login-free access.
34. Is it ADA/WCAG compliant? Yes. We meet WCAG 2.2 AA standards.

Workplace Violence Plan Wizard:
35. How do I create my WVPP? Use our guided wizard — it takes about 15 minutes.
36. Can I customize my plan? Yes. The wizard adapts based on your inputs.
37. What do I need to complete it? Company contact info, site risks, procedures, and roles.
38. Do I get a PDF of the plan? Yes. It's automatically generated and sent to you.
39. Is the plan reviewed by legal experts? Yes. Our framework is built with legal compliance in mind.
40. Can I edit my plan later? Only with an upgraded license or request.
41. What if I make a mistake in the wizard? You can preview and edit answers before submitting.
42. Is my data secure? Yes. We use encrypted storage and secure access protocols.

Pricing, Access & Support:
43. What does it cost? Training starts at $20 per employee. Plans are $399.
44. Are plans included with training? Only in bundled packages. Otherwise, sold separately.
45. Do you offer free training? Yes — one free supervisor and three free employee seats per account.
46. Can I buy training for multiple locations? Yes. You can manage multiple locations from one admin portal.
47. Do you offer non-profit or small business discounts? Yes. Contact us for eligibility.
48. Can I get a demo? Yes — email support@easelearn.com to schedule one.
49. How do I get help? Use the live chat, email us, or call our support line.
50. Can I integrate this with my HR system? Yes — integrations available via API or custom setup.

Be helpful, professional, and focus on understanding their training needs. If they ask about pricing, explain our per-seat model and direct them to our instant pricing calculator. If they need immediate assistance, remind them they can call 888-843-0880.

Keep responses concise but informative. Always aim to help them find the right training solution for their organization.`
      }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: Message) => {
        messages.push({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text
        });
      });
    }

    // Add the current message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('Sending to OpenAI with', messages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response generated');
    }

    const responseTime = Date.now() - startTime;
    console.log('AI response generated successfully in', responseTime, 'ms');

    // Check if response needs review
    const reviewCheck = needsReview(message, aiResponse);
    
    // Log the message to database
    if (session) {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          message_id: crypto.randomUUID(),
          user_message: message,
          ai_response: aiResponse,
          response_time_ms: responseTime,
          requires_review: reviewCheck.needsReview,
          review_reason: reviewCheck.reason
        });

      if (messageError) {
        console.error('Message logging error:', messageError);
      }

      // Create notification if review is needed
      if (reviewCheck.needsReview) {
        const { error: notificationError } = await supabase
          .from('chat_notifications')
          .insert({
            notification_type: 'needs_review',
            session_id: session.id,
            title: 'Chat Message Needs Review',
            description: `User message: "${message.substring(0, 100)}..." - Reason: ${reviewCheck.reason}`
          });

        if (notificationError) {
          console.error('Notification error:', notificationError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true,
      sessionId: session?.session_id || sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in customer-chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm experiencing technical difficulties. Please try again or contact us directly at hello@easelearn.com or call 888-843-0880 for immediate assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});