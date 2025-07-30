import { useState, useEffect } from 'react';

export interface ActivityEntry {
  id: string;
  type: 'reply' | 'forward' | 'task_created' | 'crm_linked' | 'pulse_linked' | 'chat_message' | 'ai_summary' | 'ai_rewrite' | 'calendar_push' | 'proposal_sent' | 'proposal_opened' | 'proposal_status_updated';
  actor: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

export const useEmailActivityHistory = (emailId: string) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock function to simulate fetching activities
  const fetchActivities = async (emailId: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockActivities: ActivityEntry[] = [
      {
        id: '1',
        type: 'ai_summary',
        actor: 'AI Assistant',
        timestamp: '2 min ago',
        description: 'Generated email summary with key action items',
        metadata: { confidence: 0.95 }
      },
      {
        id: '2',
        type: 'crm_linked',
        actor: 'John Doe',
        timestamp: '5 min ago',
        description: 'Linked to CRM contact: Sarah Chen at ACME Corp',
        metadata: { contactId: 'contact_123', companyId: 'company_456' }
      },
      {
        id: '3',
        type: 'task_created',
        actor: 'John Doe',
        timestamp: '8 min ago',
        description: 'Created task: "Review Q4 strategy document"',
        metadata: { taskId: 'task_789', priority: 'high' }
      },
      {
        id: '4',
        type: 'reply',
        actor: 'John Doe',
        timestamp: '15 min ago',
        description: 'Replied to this thread',
        metadata: { messageId: 'msg_456' }
      },
      {
        id: '5',
        type: 'chat_message',
        actor: 'Team Chat',
        timestamp: '30 min ago',
        description: 'Internal discussion about this email started',
        metadata: { chatId: 'chat_123' }
      },
      {
        id: '6',
        type: 'pulse_linked',
        actor: 'Jane Smith',
        timestamp: '1 hour ago',
        description: 'Linked to Pulse case: "Q4 Strategic Review"',
        metadata: { caseId: 'case_987', status: 'in_progress' }
      },
      {
        id: '7',
        type: 'calendar_push',
        actor: 'AI Assistant',
        timestamp: '2 hours ago',
        description: 'Created calendar event: "Q4 Strategy Review Meeting"',
        metadata: { eventId: 'event_654', date: '2024-10-25' }
      },
      {
        id: '8',
        type: 'forward',
        actor: 'John Doe',
        timestamp: '3 hours ago',
        description: 'Forwarded to Strategy Team',
        metadata: { recipients: ['strategy@company.com'] }
      }
    ];
    
    setActivities(mockActivities);
    setLoading(false);
  };

  const addActivity = (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEntry = {
      ...activity,
      id: Date.now().toString(),
      timestamp: 'just now'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  useEffect(() => {
    if (emailId) {
      fetchActivities(emailId);
    }
  }, [emailId]);

  return {
    activities,
    loading,
    addActivity,
    refresh: () => fetchActivities(emailId)
  };
};