import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProposalTracking } from './useProposalTracking';

export interface FollowUpSuggestion {
  subject: string;
  body: string;
  tone: 'friendly' | 'professional' | 'urgent';
  type: 'check_in' | 'feedback_request' | 'recap' | 'reminder';
}

export interface FollowUpReminder {
  id: string;
  proposal_id: string;
  remind_at: string;
  duration_label: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export const useProposalFollowUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if follow-up is needed (2-5 days since sent with no response)
  const shouldShowFollowUp = (proposal: ProposalTracking): boolean => {
    const daysSinceSent = Math.floor(
      (Date.now() - new Date(proposal.sent_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const hasRecentActivity = proposal.tracking_data?.last_activity 
      ? Math.floor((Date.now() - new Date(proposal.tracking_data.last_activity).getTime()) / (1000 * 60 * 60 * 24)) <= 1
      : false;

    // Show follow-up if:
    // - 2+ days since sent
    // - Status is not closed (won/lost)
    // - No recent activity
    return daysSinceSent >= 2 && 
           daysSinceSent <= 14 && // Don't show after 2 weeks
           !['closed_won', 'closed_lost'].includes(proposal.status) &&
           !hasRecentActivity;
  };

  // Generate AI follow-up suggestions
  const generateFollowUpSuggestions = async (proposal: ProposalTracking): Promise<FollowUpSuggestion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const daysSinceSent = Math.floor(
        (Date.now() - new Date(proposal.sent_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const { data, error } = await supabase.functions.invoke('ai-proposal-followup', {
        body: {
          proposalId: proposal.id,
          status: proposal.status,
          companyName: proposal.company_name,
          daysSinceSent,
          lastActivity: proposal.tracking_data?.last_activity,
          proposalType: proposal.proposal_type
        }
      });

      if (error) throw error;

      return data?.suggestions || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate follow-up suggestions';
      setError(errorMessage);
      
      // Return fallback suggestions
      return [
        {
          subject: "Following up on our proposal",
          body: `Hi,\n\nI wanted to follow up on the proposal we sent for ${proposal.company_name}. Do you have any questions or would you like to discuss next steps?\n\nBest regards`,
          tone: 'professional',
          type: 'check_in'
        }
      ];
    } finally {
      setIsLoading(false);
    }
  };

  // Create follow-up reminder
  const createReminder = async (
    proposalId: string,
    duration: string,
    durationLabel: string,
    customMessage?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('User not authenticated');

      // Calculate remind time
      const now = new Date();
      const remindAt = new Date(now.getTime() + parseDuration(duration));

      const { error } = await supabase
        .from('proposal_tracking')
        .update({
          tracking_data: {
            reminder_set: true,
            remind_at: remindAt.toISOString(),
            reminder_duration: durationLabel,
            reminder_message: customMessage || `Follow up on proposal`,
            last_activity: new Date().toISOString()
          }
        })
        .eq('id', proposalId);

      if (error) throw error;
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reminder';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Parse duration string to milliseconds
  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)\s*(hour|day|week)s?/i);
    if (!match) return 24 * 60 * 60 * 1000; // Default to 1 day

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'day':
        return value * 24 * 60 * 60 * 1000;
      case 'week':
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  };

  // Check for due reminders
  const checkDueReminders = async (): Promise<ProposalTracking[]> => {
    try {
      const { data, error } = await supabase
        .from('proposal_tracking')
        .select('*')
        .not('tracking_data->>remind_at', 'is', null)
        .lt('tracking_data->>remind_at', new Date().toISOString());

      if (error) throw error;
      return (data || []) as ProposalTracking[];
    } catch (err) {
      console.error('Failed to check due reminders:', err);
      return [];
    }
  };

  return {
    shouldShowFollowUp,
    generateFollowUpSuggestions,
    createReminder,
    checkDueReminders,
    isLoading,
    error
  };
};