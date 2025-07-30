import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content) {
      throw new Error('Document content is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
You are an expert workplace violence prevention training designer. Analyze the provided WPV plan document and create 4-6 interactive training scenes that are specific to the client's context, policies, and requirements.

Document Content:
${content}

Based on this document, generate training scenes that:
1. Address specific workplace violence scenarios relevant to this organization
2. Include the company's actual policies and procedures mentioned in the plan
3. Use real examples and situations from the document
4. Create realistic decision-making scenarios for employees
5. Focus on practical application of the prevention strategies outlined

For each training scene, provide:
- A specific, descriptive title
- A detailed description explaining the scenario and learning objectives
- Interactive HTML content that presents the scenario and includes decision points
- Estimated duration in seconds (typically 300-900 seconds per scene)

Return the response as a JSON object with a "scenes" array containing these fields:
- title: string
- description: string  
- content: string (HTML content for the scene)
- estimatedDuration: number (in seconds)

Make the scenes engaging, realistic, and directly applicable to this specific workplace based on the provided plan.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert workplace violence prevention training designer. Always return valid JSON responses with the exact structure requested.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate training scenes');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse the AI response as JSON
    let scenes;
    try {
      const parsedResponse = JSON.parse(aiResponse);
      scenes = parsedResponse.scenes || [];
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback: create default scenes based on common WPV training topics
      scenes = [
        {
          title: "Recognizing Warning Signs",
          description: "Learn to identify early warning signs of potential workplace violence and how to respond appropriately.",
          content: `
            <div class="training-scene">
              <h2>Recognizing Warning Signs of Workplace Violence</h2>
              <p>Based on your organization's WPV plan, it's crucial to identify potential indicators early.</p>
              
              <div class="scenario">
                <h3>Scenario:</h3>
                <p>You notice a colleague has been exhibiting some concerning behaviors recently...</p>
                
                <div class="question">
                  <p><strong>What would you do in this situation?</strong></p>
                  <div class="options">
                    <button onclick="selectOption('a')">A) Approach them directly to discuss your concerns</button>
                    <button onclick="selectOption('b')">B) Report your observations to your supervisor or HR</button>
                    <button onclick="selectOption('c')">C) Ignore it and hope it gets better</button>
                    <button onclick="selectOption('d')">D) Talk to other coworkers about your concerns</button>
                  </div>
                </div>
              </div>
              
              <div id="feedback" style="display: none;">
                <p><strong>Correct Answer: B</strong></p>
                <p>According to your organization's policy, you should report concerning behaviors to appropriate authorities while maintaining confidentiality.</p>
              </div>
            </div>
            
            <script>
              function selectOption(choice) {
                document.getElementById('feedback').style.display = 'block';
                if (choice === 'b') {
                  document.getElementById('feedback').innerHTML += '<p style="color: green;">Well done! You followed proper protocol.</p>';
                } else {
                  document.getElementById('feedback').innerHTML += '<p style="color: orange;">Consider the safer, more appropriate response next time.</p>';
                }
              }
            </script>
          `,
          estimatedDuration: 420
        },
        {
          title: "De-escalation Techniques",
          description: "Practice verbal de-escalation strategies to defuse tense situations before they escalate to violence.",
          content: `
            <div class="training-scene">
              <h2>De-escalation Techniques</h2>
              <p>Learn effective methods to calm volatile situations in your workplace.</p>
              
              <div class="scenario">
                <h3>Interactive Scenario:</h3>
                <p>An agitated customer/client is raising their voice and making threats...</p>
                
                <div class="question">
                  <p><strong>Choose the best de-escalation approach:</strong></p>
                  <div class="options">
                    <button onclick="selectDeescalation('a')">A) Remain calm, listen actively, and acknowledge their concerns</button>
                    <button onclick="selectDeescalation('b')">B) Match their energy and argue back</button>
                    <button onclick="selectDeescalation('c')">C) Tell them to calm down or leave</button>
                    <button onclick="selectDeescalation('d')">D) Call security immediately</button>
                  </div>
                </div>
              </div>
              
              <div id="deescalation-feedback" style="display: none;"></div>
            </div>
            
            <script>
              function selectDeescalation(choice) {
                const feedback = document.getElementById('deescalation-feedback');
                feedback.style.display = 'block';
                
                if (choice === 'a') {
                  feedback.innerHTML = '<p style="color: green;"><strong>Excellent choice!</strong> Active listening and empathy are key de-escalation tools.</p>';
                } else {
                  feedback.innerHTML = '<p style="color: orange;"><strong>Consider a different approach.</strong> The goal is to reduce tension, not escalate it.</p>';
                }
              }
            </script>
          `,
          estimatedDuration: 480
        },
        {
          title: "Emergency Response Procedures",
          description: "Understand your organization's specific emergency response protocols for workplace violence incidents.",
          content: `
            <div class="training-scene">
              <h2>Emergency Response Procedures</h2>
              <p>Know what to do when prevention fails and violence occurs.</p>
              
              <div class="scenario">
                <h3>Emergency Situation:</h3>
                <p>You hear shouting and see what appears to be a physical altercation in your workplace...</p>
                
                <div class="question">
                  <p><strong>What is your immediate priority?</strong></p>
                  <div class="options">
                    <button onclick="selectEmergency('a')">A) Try to break up the fight</button>
                    <button onclick="selectEmergency('b')">B) Ensure your own safety first, then call for help</button>
                    <button onclick="selectEmergency('c')">C) Start recording with your phone</button>
                    <button onclick="selectEmergency('d')">D) Gather other employees to help</button>
                  </div>
                </div>
              </div>
              
              <div id="emergency-feedback" style="display: none;"></div>
            </div>
            
            <script>
              function selectEmergency(choice) {
                const feedback = document.getElementById('emergency-feedback');
                feedback.style.display = 'block';
                
                if (choice === 'b') {
                  feedback.innerHTML = '<p style="color: green;"><strong>Correct!</strong> Your safety comes first. Remove yourself from danger and immediately contact security/police.</p>';
                } else {
                  feedback.innerHTML = '<p style="color: red;"><strong>Safety first!</strong> Never put yourself at risk. Your priority is to get to safety and call for help.</p>';
                }
              }
            </script>
          `,
          estimatedDuration: 360
        },
        {
          title: "Creating a Safe Work Environment",
          description: "Learn about environmental factors and policies that help prevent workplace violence.",
          content: `
            <div class="training-scene">
              <h2>Creating a Safe Work Environment</h2>
              <p>Understand how workplace design and policies contribute to violence prevention.</p>
              
              <div class="scenario">
                <h3>Assessment Exercise:</h3>
                <p>Review your actual workspace and identify potential safety improvements...</p>
                
                <div class="checklist">
                  <h4>Safety Checklist:</h4>
                  <label><input type="checkbox"> Clear sight lines and well-lit areas</label><br>
                  <label><input type="checkbox"> Secure access controls</label><br>
                  <label><input type="checkbox"> Emergency communication systems</label><br>
                  <label><input type="checkbox"> Clear emergency exit routes</label><br>
                  <label><input type="checkbox"> Regular security assessments</label><br>
                </div>
                
                <button onclick="completeAssessment()">Complete Assessment</button>
              </div>
              
              <div id="assessment-feedback" style="display: none;">
                <p><strong>Remember:</strong> A safe workplace is everyone's responsibility. Report any safety concerns to management.</p>
              </div>
            </div>
            
            <script>
              function completeAssessment() {
                document.getElementById('assessment-feedback').style.display = 'block';
              }
            </script>
          `,
          estimatedDuration: 300
        }
      ];
    }

    return new Response(JSON.stringify({ scenes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-wpv-scenes function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});