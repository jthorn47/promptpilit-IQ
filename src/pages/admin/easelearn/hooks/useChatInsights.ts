import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatInsight {
  unansweredChats: number;
  escalationQueue: number;
  failedEscalations: number;
  stalledConversations: number;
  avgResponseTime: number;
  poorRatings: number;
  commonTopics: Array<{ topic: string; count: number }>;
  recommendations: string[];
}

export const useChatInsights = () => {
  const [data, setData] = useState<ChatInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // 1. Unanswered Chats (sessions with no AI response in last 30-60 minutes)
      const { data: unansweredData, error: unansweredError } = await supabase
        .from('chat_sessions')
        .select(`
          id, started_at, ended_at,
          chat_messages!inner(ai_response, timestamp)
        `)
        .is('ended_at', null)
        .lt('started_at', thirtyMinutesAgo.toISOString());

      if (unansweredError) throw unansweredError;

      const unansweredChats = unansweredData?.filter(session => {
        const lastMessage = session.chat_messages
          ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        return !lastMessage?.ai_response;
      }).length || 0;

      // 2. Escalation Queue (messages flagged for review)
      const { data: escalationData, error: escalationError } = await supabase
        .from('chat_messages')
        .select('id, session_id, is_escalation')
        .eq('requires_review', true)
        .eq('is_escalation', true);

      if (escalationError) throw escalationError;
      const escalationQueue = escalationData?.length || 0;

      // 3. Failed Escalations (escalations with no human response)
      const { data: failedData, error: failedError } = await supabase
        .from('chat_sessions')
        .select('id, requires_review, reviewed')
        .eq('requires_review', true)
        .eq('reviewed', false)
        .lt('started_at', thirtyMinutesAgo.toISOString());

      if (failedError) throw failedError;
      const failedEscalations = failedData?.length || 0;

      // 4. Stalled Conversations (sessions ended without resolution in last 24h)
      const { data: stalledData, error: stalledError } = await supabase
        .from('chat_sessions')
        .select('id, ended_at, total_messages')
        .not('ended_at', 'is', null)
        .gte('ended_at', twentyFourHoursAgo.toISOString())
        .lt('total_messages', 3);

      if (stalledError) throw stalledError;
      const stalledConversations = stalledData?.length || 0;

      // 5. Average Response Time
      const { data: responseTimeData, error: responseTimeError } = await supabase
        .from('chat_messages')
        .select('response_time_ms')
        .not('response_time_ms', 'is', null)
        .gte('timestamp', twentyFourHoursAgo.toISOString());

      if (responseTimeError) throw responseTimeError;
      
      const avgResponseTime = responseTimeData?.length > 0 
        ? responseTimeData.reduce((sum, msg) => sum + (msg.response_time_ms || 0), 0) / responseTimeData.length / 1000
        : 0;

      // 6. Poor Ratings (messages flagged for review with reasons)
      const { data: poorRatingData, error: poorRatingError } = await supabase
        .from('chat_messages')
        .select('id, review_reason')
        .eq('requires_review', true)
        .not('review_reason', 'is', null)
        .gte('timestamp', twentyFourHoursAgo.toISOString());

      if (poorRatingError) throw poorRatingError;
      const poorRatings = poorRatingData?.length || 0;

      // 7. Common Topics (extract keywords from user messages in last 24h)
      const { data: topicsData, error: topicsError } = await supabase
        .from('chat_messages')
        .select('user_message')
        .gte('timestamp', twentyFourHoursAgo.toISOString())
        .not('user_message', 'is', null);

      if (topicsError) throw topicsError;

      // Simple keyword extraction
      const keywords: { [key: string]: number } = {};
      topicsData?.forEach(msg => {
        const words = msg.user_message?.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 3 && !['what', 'when', 'where', 'this', 'that', 'have', 'with', 'will', 'from'].includes(word));
        
        words?.forEach(word => {
          keywords[word] = (keywords[word] || 0) + 1;
        });
      });

      const commonTopics = Object.entries(keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

      // 8. AI Recommendations (basic pattern analysis)
      const recommendations: string[] = [];
      if (unansweredChats > 5) {
        recommendations.push("High volume of unanswered chats - consider improving AI response coverage");
      }
      if (avgResponseTime > 180) { // 3 minutes
        recommendations.push("Response times are slow - optimize AI processing");
      }
      if (escalationQueue > 3) {
        recommendations.push("Multiple escalations pending - review staffing levels");
      }
      if (stalledConversations > 10) {
        recommendations.push("Many conversations ending early - improve conversation flow");
      }

      setData({
        unansweredChats,
        escalationQueue,
        failedEscalations,
        stalledConversations,
        avgResponseTime: Math.round(avgResponseTime),
        poorRatings,
        commonTopics,
        recommendations
      });

    } catch (err) {
      console.error('Error fetching chat insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chat insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatInsights();

    // Set up real-time subscriptions
    const sessionsChannel = supabase
      .channel('chat-insights-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        () => {
          fetchChatInsights();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('chat-insights-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchChatInsights();
        }
      )
      .subscribe();

    // Refresh every 5 minutes
    const interval = setInterval(fetchChatInsights, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(messagesChannel);
      clearInterval(interval);
    };
  }, []);

  return { data, isLoading, error, refetch: fetchChatInsights };
};