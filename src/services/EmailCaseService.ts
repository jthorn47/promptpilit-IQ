import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  email_id: string;
  subject: string;
  from: string;
  to: string;
  content: string;
  received_at: string;
  message_id?: string;
  thread_id?: string;
  company_domain?: string;
}

export interface AIProcessingResult {
  decision: 'create_case' | 'auto_close' | 'no_case_needed' | 'needs_review';
  reasoning: string;
  confidence: number;
  case_id?: string;
}

export interface ManualCaseFromEmailRequest {
  email_id: string;
  subject: string;
  from: string;
  content: string;
  case_type?: string;
  priority?: string;
  assigned_to?: string;
  company_id?: string;
  tags?: string[];
}

export class EmailCaseService {
  
  /**
   * Process an email automatically using AI to determine if a case should be created
   */
  static async processEmailWithAI(emailData: EmailData): Promise<AIProcessingResult> {
    try {
      const { data, error } = await supabase.functions.invoke('process-email-to-case', {
        body: emailData
      });

      if (error) {
        console.error('Error processing email with AI:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('EmailCaseService: processEmailWithAI error:', error);
      throw error;
    }
  }

  /**
   * Manually create a case from an email through the UI
   */
  static async createCaseFromEmail(request: ManualCaseFromEmailRequest): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('manual-email-to-case', {
        body: request
      });

      if (error) {
        console.error('Error creating case from email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('EmailCaseService: createCaseFromEmail error:', error);
      throw error;
    }
  }

  /**
   * Get email-case mapping for an email
   */
  static async getEmailCaseMapping(emailId: string) {
    try {
      const { data, error } = await supabase
        .from('email_case_mappings')
        .select(`
          *,
          cases:case_id (
            id,
            title,
            status,
            priority,
            type,
            created_at
          )
        `)
        .eq('email_id', emailId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email case mapping:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('EmailCaseService: getEmailCaseMapping error:', error);
      throw error;
    }
  }

  /**
   * Get AI processing logs for analysis
   */
  static async getAIProcessingLogs(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('ai_case_processing_log')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching AI processing logs:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('EmailCaseService: getAIProcessingLogs error:', error);
      throw error;
    }
  }

  /**
   * Get AI processing statistics
   */
  static async getAIProcessingStats() {
    try {
      const { data, error } = await supabase
        .from('ai_case_processing_log')
        .select('ai_decision, confidence_score')
        .gte('processed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) {
        console.error('Error fetching AI processing stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        created_cases: data.filter(d => d.ai_decision === 'create_case').length,
        auto_closed: data.filter(d => d.ai_decision === 'auto_close').length,
        no_case_needed: data.filter(d => d.ai_decision === 'no_case_needed').length,
        needs_review: data.filter(d => d.ai_decision === 'needs_review').length,
        average_confidence: data.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / data.length
      };

      return stats;
    } catch (error) {
      console.error('EmailCaseService: getAIProcessingStats error:', error);
      throw error;
    }
  }

  /**
   * Bulk process multiple emails
   */
  static async bulkProcessEmails(emails: EmailData[]): Promise<AIProcessingResult[]> {
    try {
      const results = await Promise.allSettled(
        emails.map(email => this.processEmailWithAI(email))
      );

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Failed to process email ${emails[index].email_id}:`, result.reason);
          return {
            decision: 'needs_review' as const,
            reasoning: 'Processing failed',
            confidence: 0
          };
        }
      });
    } catch (error) {
      console.error('EmailCaseService: bulkProcessEmails error:', error);
      throw error;
    }
  }

  /**
   * Search for cases by email content or sender
   */
  static async searchCasesByEmail(query: string) {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          email_case_mappings!case_id (
            email_id,
            email_message_id
          )
        `)
        .or(`related_contact_email.ilike.%${query}%,description.ilike.%${query}%,title.ilike.%${query}%`)
        .eq('source', 'email')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching cases by email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('EmailCaseService: searchCasesByEmail error:', error);
      throw error;
    }
  }
}