import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WikiIntegrationProps {
  companyId: string;
  userRole: string;
  industry?: string;
}

export const useWikiIntegration = ({ companyId, userRole, industry = 'general' }: WikiIntegrationProps) => {
  
  // Process Q&A into wiki article
  const processQAForWiki = useCallback(async (
    question: string,
    answer: string,
    topic: string,
    sourceType: 'coachgpt_qa' | 'course_content' | 'scenario' = 'coachgpt_qa',
    sourceId?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('wiki-processor', {
        body: {
          question,
          answer,
          topic,
          userRole,
          companyId,
          sourceType,
          sourceId,
          industry
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing Q&A for wiki:', error);
      return null;
    }
  }, [companyId, userRole, industry]);

  // Search wiki before triggering fresh CoachGPT
  const searchWikiFirst = useCallback(async (query: string) => {
    try {
      const { data: articles, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .textSearch('title,content', query)
        .limit(3);

      if (error) throw error;
      
      if (articles && articles.length > 0) {
        // Log the search
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          await supabase.from('wiki_usage_logs').insert({
            article_id: articles[0].id,
            user_id: user.data.user.id,
            company_id: companyId,
            user_role: userRole,
            access_type: 'search',
            search_query: query
          });
        }
        
        return {
          hasResults: true,
          articles,
          suggestion: `Found ${articles.length} relevant article${articles.length > 1 ? 's' : ''} in your knowledge base.`
        };
      }
      
      return { hasResults: false, articles: [], suggestion: null };
    } catch (error) {
      console.error('Error searching wiki:', error);
      return { hasResults: false, articles: [], suggestion: null };
    }
  }, [companyId, userRole]);

  // Rate wiki article helpfulness
  const rateArticleHelpfulness = useCallback(async (articleId: string, rating: number) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Log the rating
      await supabase.from('wiki_usage_logs').insert({
        article_id: articleId,
        user_id: user.data.user.id,
        company_id: companyId,
        user_role: userRole,
        access_type: 'rating',
        helpful_rating: rating
      });

      // Update article helpfulness score
      const { data: currentArticle } = await supabase
        .from('wiki_articles')
        .select('helpfulness_score, usage_count')
        .eq('id', articleId)
        .single();

      if (currentArticle) {
        const newScore = ((currentArticle.helpfulness_score * currentArticle.usage_count) + rating) / (currentArticle.usage_count + 1);
        
        await supabase
          .from('wiki_articles')
          .update({ helpfulness_score: newScore })
          .eq('id', articleId);
      }

      return true;
    } catch (error) {
      console.error('Error rating article:', error);
      return false;
    }
  }, [companyId, userRole]);

  // Generate weekly summary
  const generateWeeklySummary = useCallback(async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      weekStart.setHours(0, 0, 0, 0);

      // Get usage stats for the week
      const { data: weeklyUsage } = await supabase
        .from('wiki_usage_logs')
        .select('article_id, access_type, search_query')
        .eq('company_id', companyId)
        .gte('created_at', weekStart.toISOString())
        .order('created_at', { ascending: false });

      // Get articles created this week
      const { data: newArticles } = await supabase
        .from('wiki_articles')
        .select('title, category, usage_count')
        .eq('company_id', companyId)
        .gte('created_at', weekStart.toISOString());

      // Analyze trending topics
      const searchQueries = weeklyUsage?.filter(log => log.search_query) || [];
      const trendingSearches = searchQueries.reduce((acc, log) => {
        acc[log.search_query] = (acc[log.search_query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topSearches = Object.entries(trendingSearches)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([query]) => query);

      const summaryData = {
        week_start: weekStart.toISOString().split('T')[0],
        total_searches: searchQueries.length,
        new_articles_count: newArticles?.length || 0,
        top_searches: topSearches,
        new_articles: newArticles?.map(a => ({ title: a.title, category: a.category })) || []
      };

      // Store summary
      await supabase.from('wiki_weekly_summaries').insert({
        company_id: companyId,
        week_start_date: weekStart.toISOString().split('T')[0],
        summary_data: summaryData,
        trending_topics: topSearches
      });

      return summaryData;
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      return null;
    }
  }, [companyId]);

  return {
    processQAForWiki,
    searchWikiFirst,
    rateArticleHelpfulness,
    generateWeeklySummary
  };
};