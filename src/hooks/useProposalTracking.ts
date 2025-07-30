import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProposalTracking {
  id: string;
  email_id: string;
  proposal_type: 'propgen' | 'pdf';
  proposal_id?: string;
  proposal_url?: string;
  company_name: string;
  recipient_email: string;
  sent_at: string;
  status: 'sent' | 'opened' | 'no_response' | 'closed_won' | 'closed_lost';
  tracking_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProposalEvent {
  id: string;
  proposal_id: string;
  event_type: 'opened' | 'viewed' | 'downloaded' | 'shared';
  event_data: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  timestamp: string;
}

export const useProposalTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect if email contains proposal
  const detectProposal = (emailSubject: string, emailBody: string, attachments?: string[]): boolean => {
    // Enhanced detection for PropGEN-generated proposals
    const proposalKeywords = [
      'proposal', 'quote', 'estimate', 'pricing', 'contract',
      'agreement', 'propgen', 'document', 'terms', 'quotation',
      'bid', 'offer', 'price', 'cost', 'payment', 'invoice'
    ];
    
    // PropGEN specific patterns
    const propgenPatterns = [
      /propgen\.com/i,
      /propgen\.io/i,
      /proposal-[\w-]+\.pdf/i,
      /quote-[\w-]+\.pdf/i,
      /estimate-[\w-]+\.pdf/i,
      /view.*proposal/i,
      /download.*proposal/i,
      /access.*proposal/i
    ];
    
    // PDF and document patterns
    const documentPatterns = [
      /\.pdf$/i,
      /proposal.*\.pdf/i,
      /quote.*\.pdf/i,
      /estimate.*\.pdf/i,
      /contract.*\.pdf/i,
      /agreement.*\.pdf/i
    ];
    
    const content = `${emailSubject} ${emailBody}`.toLowerCase();
    
    // Check for PropGEN patterns (highest confidence)
    const hasPropsGenPattern = propgenPatterns.some(pattern => pattern.test(content));
    if (hasPropsGenPattern) return true;
    
    // Check for document attachments
    if (attachments && attachments.length > 0) {
      const hasProposalDoc = attachments.some(filename => 
        documentPatterns.some(pattern => pattern.test(filename))
      );
      if (hasProposalDoc) return true;
    }
    
    // Check for proposal keywords in subject (higher weight)
    const subjectLower = emailSubject.toLowerCase();
    const hasProposalInSubject = proposalKeywords.some(keyword => subjectLower.includes(keyword));
    if (hasProposalInSubject) return true;
    
    // Check for multiple proposal keywords in body (medium confidence)
    const keywordMatches = proposalKeywords.filter(keyword => content.includes(keyword));
    return keywordMatches.length >= 2;
  };

  // Extract PropGEN data from email content
  const extractPropgenData = (emailContent: string): { id?: string, url?: string, type: 'propgen' | 'pdf' } => {
    const propgenUrlRegex = /https?:\/\/(?:www\.)?propgen\.(?:com|io)\/[^\s]+/i;
    const propgenIdRegex = /propgen[_-]?id[:\s]*([a-zA-Z0-9-]+)/i;
    
    const urlMatch = emailContent.match(propgenUrlRegex);
    const idMatch = emailContent.match(propgenIdRegex);
    
    if (urlMatch || idMatch) {
      return {
        id: idMatch?.[1],
        url: urlMatch?.[0],
        type: 'propgen'
      };
    }
    
    return { type: 'pdf' };
  };

  // Create proposal tracking for an email
  const createProposalTracking = async (
    emailId: string,
    companyName: string,
    recipientEmail: string,
    emailContent: string = '',
    proposalType?: 'propgen' | 'pdf',
    proposalUrl?: string,
    proposalId?: string
  ): Promise<ProposalTracking | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('User not authenticated');

      // Extract PropGEN data if not provided
      const propgenData = extractPropgenData(emailContent);
      const finalType = proposalType || propgenData.type;
      const finalId = proposalId || propgenData.id;
      const finalUrl = proposalUrl || propgenData.url;

      const { data, error } = await supabase
        .from('proposal_tracking')
        .insert({
          email_id: emailId,
          proposal_type: finalType,
          proposal_id: finalId || null,
          proposal_url: finalUrl || null,
          company_name: companyName,
          recipient_email: recipientEmail,
          status: 'sent',
          tracking_data: {
            sent_count: 1,
            open_count: 0,
            view_count: 0,
            last_activity: new Date().toISOString(),
            detection_method: finalType === 'propgen' ? 'propgen_link' : 'keyword_match'
          },
          created_by: currentUser.data.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProposalTracking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create proposal tracking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get proposal tracking for an email
  const getProposalTracking = async (emailId: string): Promise<ProposalTracking | null> => {
    try {
      const { data, error } = await supabase
        .from('proposal_tracking')
        .select('*')
        .eq('email_id', emailId)
        .maybeSingle();

      if (error) throw error;
      return data as ProposalTracking | null;
    } catch (err) {
      console.error('Failed to get proposal tracking:', err);
      return null;
    }
  };

  // Update proposal status
  const updateProposalStatus = async (
    proposalId: string,
    status: ProposalTracking['status'],
    additionalData?: Record<string, any>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const updateData: any = { status };
      
      if (additionalData) {
        // Merge with existing tracking data
        const { data: existing } = await supabase
          .from('proposal_tracking')
          .select('tracking_data')
          .eq('id', proposalId)
          .single();
        
        const existingData = existing?.tracking_data as Record<string, any> || {};
        updateData.tracking_data = {
          ...existingData,
          ...additionalData,
          last_activity: new Date().toISOString()
        };
      }

      const { error } = await supabase
        .from('proposal_tracking')
        .update(updateData)
        .eq('id', proposalId);

      if (error) throw error;
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update proposal status';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Track proposal event (open, view, etc.)
  const trackProposalEvent = async (
    proposalId: string,
    eventType: ProposalEvent['event_type'],
    eventData?: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('proposal_events')
        .insert({
          proposal_id: proposalId,
          event_type: eventType,
          event_data: eventData || {},
          user_agent: navigator.userAgent,
          // Note: IP address would need to be captured server-side
        });

      if (error) throw error;

      // Update proposal tracking data based on event
      const updateData: Record<string, any> = {};
      
      switch (eventType) {
        case 'opened':
          updateData.open_count = (await getTrackingData(proposalId, 'open_count')) + 1;
          if ((await getTrackingData(proposalId, 'open_count')) === 0) {
            // First open, update status
            await updateProposalStatus(proposalId, 'opened');
          }
          break;
        case 'viewed':
          updateData.view_count = (await getTrackingData(proposalId, 'view_count')) + 1;
          break;
        case 'downloaded':
          updateData.download_count = (await getTrackingData(proposalId, 'download_count')) + 1;
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProposalStatus(proposalId, undefined as any, updateData);
      }

      return true;
    } catch (err) {
      console.error('Failed to track proposal event:', err);
      return false;
    }
  };

  // Get specific tracking data value
  const getTrackingData = async (proposalId: string, key: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('proposal_tracking')
        .select('tracking_data')
        .eq('id', proposalId)
        .single();

      if (error) return 0;
      return data?.tracking_data?.[key] || 0;
    } catch {
      return 0;
    }
  };

  // Get proposal events
  const getProposalEvents = async (proposalId: string): Promise<ProposalEvent[]> => {
    try {
      const { data, error } = await supabase
        .from('proposal_events')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data as ProposalEvent[] || [];
    } catch (err) {
      console.error('Failed to get proposal events:', err);
      return [];
    }
  };

  // Simulate tracking updates (for dummy logic as mentioned in requirements)
  const simulateTracking = async (proposalId: string): Promise<void> => {
    // Simulate random events for demo purposes
    const events: ProposalEvent['event_type'][] = ['opened', 'viewed'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    setTimeout(() => {
      trackProposalEvent(proposalId, randomEvent, {
        simulated: true,
        timestamp: new Date().toISOString()
      });
    }, Math.random() * 10000); // Random delay up to 10 seconds
  };

  return {
    detectProposal,
    extractPropgenData,
    createProposalTracking,
    getProposalTracking,
    updateProposalStatus,
    trackProposalEvent,
    getProposalEvents,
    simulateTracking,
    isLoading,
    error
  };
};