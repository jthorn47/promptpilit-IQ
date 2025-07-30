import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface WikiProcessingRequest {
  question: string;
  answer: string;
  topic: string;
  userRole: string;
  companyId: string;
  sourceType: 'coachgpt_qa' | 'course_content' | 'scenario';
  sourceId?: string;
  industry?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      question, 
      answer, 
      topic, 
      userRole, 
      companyId, 
      sourceType, 
      sourceId,
      industry = 'general'
    }: WikiProcessingRequest = await req.json();

    console.log('Processing Q&A for wiki:', { topic, userRole, sourceType });

    // Step 1: Check if similar article already exists
    const { data: existingArticles } = await supabase
      .from('wiki_articles')
      .select('*')
      .eq('company_id', companyId)
      .contains('tags', [topic.toLowerCase()])
      .eq('status', 'active')
      .limit(5);

    let shouldCreateNew = true;
    let articleToUpdate = null;

    if (existingArticles && existingArticles.length > 0) {
      // Use AI to determine if this is similar content
      const similarityCheck = await checkContentSimilarity(question, existingArticles);
      if (similarityCheck.isSimilar) {
        shouldCreateNew = false;
        articleToUpdate = similarityCheck.article;
      }
    }

    // Step 2: Generate wiki-style content
    let wikiContent;
    let title;

    if (shouldCreateNew) {
      // Create new article
      const generatedContent = await generateWikiArticle(question, answer, topic, userRole);
      wikiContent = generatedContent.content;
      title = generatedContent.title;
    } else {
      // Update existing article
      const updatedContent = await updateWikiArticle(articleToUpdate, question, answer);
      wikiContent = updatedContent.content;
      title = updatedContent.title;
    }

    // Step 3: Categorize content
    const category = categorizeContent(topic, question, answer);
    
    // Step 4: Extract tags and clean content
    const tags = extractTags(question, answer, topic);
    const cleanedContent = removePersonalInfo(wikiContent);

    // Step 5: Store or update wiki article
    if (shouldCreateNew) {
      const { data: newArticle, error } = await supabase
        .from('wiki_articles')
        .insert({
          company_id: companyId,
          title,
          content: cleanedContent,
          category,
          tags,
          user_roles: [userRole],
          industry_tags: [industry],
          source_type: sourceType,
          source_data: {
            original_question: question,
            original_answer: answer,
            topic,
            user_role: userRole
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Store source reference
      await supabase.from('wiki_article_sources').insert({
        article_id: newArticle.id,
        source_type: sourceType,
        source_id: sourceId,
        original_question: question,
        original_answer: answer,
        user_role: userRole,
        topic
      });

      console.log('Created new wiki article:', newArticle.id);

    } else {
      // Update existing article
      const updatedRoles = Array.from(new Set([...articleToUpdate.user_roles, userRole]));
      const updatedTags = Array.from(new Set([...articleToUpdate.tags, ...tags]));

      const { error } = await supabase
        .from('wiki_articles')
        .update({
          content: cleanedContent,
          user_roles: updatedRoles,
          tags: updatedTags,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', articleToUpdate.id);

      if (error) throw error;

      // Add new source reference
      await supabase.from('wiki_article_sources').insert({
        article_id: articleToUpdate.id,
        source_type: sourceType,
        source_id: sourceId,
        original_question: question,
        original_answer: answer,
        user_role: userRole,
        topic
      });

      console.log('Updated existing wiki article:', articleToUpdate.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      action: shouldCreateNew ? 'created' : 'updated',
      title 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing wiki content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkContentSimilarity(question: string, articles: any[]) {
  if (!openAIApiKey) {
    // Fallback: simple keyword matching
    const questionWords = question.toLowerCase().split(' ');
    for (const article of articles) {
      const contentWords = article.content.toLowerCase();
      const matches = questionWords.filter(word => contentWords.includes(word)).length;
      if (matches > questionWords.length * 0.6) {
        return { isSimilar: true, article };
      }
    }
    return { isSimilar: false, article: null };
  }

  const prompt = `
  Compare this new question with existing wiki articles:
  
  New Question: "${question}"
  
  Existing Articles:
  ${articles.map((a, i) => `${i + 1}. ${a.title}: ${a.content.substring(0, 200)}...`).join('\n')}
  
  Respond with JSON:
  {
    "isSimilar": boolean,
    "articleIndex": number or null,
    "reason": "explanation"
  }
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      isSimilar: result.isSimilar,
      article: result.isSimilar ? articles[result.articleIndex] : null
    };
  } catch (error) {
    console.error('Error checking similarity:', error);
    return { isSimilar: false, article: null };
  }
}

async function generateWikiArticle(question: string, answer: string, topic: string, userRole: string) {
  if (!openAIApiKey) {
    // Fallback: simple formatting
    return {
      title: `${topic} Guide`,
      content: `${answer}\n\nThis information applies to ${userRole} roles and covers key aspects of ${topic}.`
    };
  }

  const prompt = `
  Convert this Q&A into a concise wiki article (50-150 words):
  
  Question: ${question}
  Answer: ${answer}
  Topic: ${topic}
  User Role: ${userRole}
  
  Create a professional, factual wiki entry with:
  - Clear, descriptive title
  - Concise explanation
  - Practical examples if relevant
  - Remove personal pronouns and conversational tone
  
  Format as JSON:
  {
    "title": "descriptive title",
    "content": "50-150 word wiki content"
  }
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating article:', error);
    return {
      title: `${topic} Guide`,
      content: answer.substring(0, 150) + '...'
    };
  }
}

async function updateWikiArticle(existingArticle: any, newQuestion: string, newAnswer: string) {
  if (!openAIApiKey) {
    // Fallback: simple append
    return {
      title: existingArticle.title,
      content: existingArticle.content + `\n\nAdditional information: ${newAnswer.substring(0, 50)}...`
    };
  }

  const prompt = `
  Update this wiki article with new information:
  
  Current Article: "${existingArticle.content}"
  
  New Q&A:
  Question: ${newQuestion}
  Answer: ${newAnswer}
  
  Merge the information keeping it 50-150 words, factual, and removing duplicates.
  
  Format as JSON:
  {
    "title": "updated title",
    "content": "updated 50-150 word content"
  }
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error updating article:', error);
    return {
      title: existingArticle.title,
      content: existingArticle.content
    };
  }
}

function categorizeContent(topic: string, question: string, answer: string): string {
  const text = `${topic} ${question} ${answer}`.toLowerCase();
  
  if (text.includes('compliance') || text.includes('regulation') || text.includes('policy')) {
    return 'compliance';
  }
  if (text.includes('conflict') || text.includes('dispute') || text.includes('resolution')) {
    return 'conflict';
  }
  if (text.includes('document') || text.includes('report') || text.includes('record')) {
    return 'documentation';
  }
  if (text.includes('safety') || text.includes('hazard') || text.includes('risk')) {
    return 'safety';
  }
  if (text.includes('leadership') || text.includes('management') || text.includes('team')) {
    return 'leadership';
  }
  
  return 'general';
}

function extractTags(question: string, answer: string, topic: string): string[] {
  const text = `${question} ${answer}`.toLowerCase();
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
  
  const words = text.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !commonWords.includes(word))
    .slice(0, 5);
  
  return Array.from(new Set([topic.toLowerCase(), ...words]));
}

function removePersonalInfo(content: string): string {
  return content
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Name]') // Names
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[Phone]') // Phone numbers
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[Email]') // Emails
    .replace(/\b(I|my|me|mine)\b/gi, '') // Personal pronouns
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();
}