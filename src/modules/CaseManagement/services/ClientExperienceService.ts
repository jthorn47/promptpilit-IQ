// Mock Client Experience Service until database tables are available
export interface ClientCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at: string;
  company_settings?: {
    company_name: string;
  };
}

export interface CaseClientUpdate {
  id: string;
  case_id: string;
  update_type: string;
  title: string;
  content?: string;
  is_visible_to_client: boolean;
  created_at: string;
  created_by?: string;
}

export interface CaseTimeline {
  caseId: string;
  title: string;
  status: string;
  updates: CaseClientUpdate[];
  isClientVisible: boolean;
  shareToken?: string;
}

export interface ClientDashboardData {
  openCases: ClientCase[];
  closedCases: ClientCase[];
  totalCases: number;
  avgResolutionTime: number;
}

export interface CaseClientVisibility {
  id: string;
  case_id: string;
  is_client_visible: boolean;
  share_token?: string;
  client_contact_email?: string;
  created_by?: string;
  created_at: string;
}

export interface CaseClientFeedback {
  id: string;
  case_id: string;
  feedback_type: 'thumbs_up' | 'thumbs_down';
  sentiment_score?: number;
  comment?: string;
  client_email?: string;
  client_name?: string;
  submitted_at: string;
}

export interface ClientNotificationSettings {
  id: string;
  company_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  slack_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export const ClientExperienceService = {
  // Generate secure share token for case
  async generateShareToken(caseId: string, clientEmail?: string): Promise<{ data: CaseClientVisibility | null; error: any }> {
    console.log('ClientExperienceService: generateShareToken called - returning mock data');
    const mockData: CaseClientVisibility = {
      id: 'vis1',
      case_id: caseId,
      is_client_visible: true,
      share_token: 'mock-token-' + Math.random().toString(36),
      client_contact_email: clientEmail,
      created_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  },

  // Get case timeline for public view
  async getCaseTimeline(shareToken: string): Promise<{ data: CaseTimeline | null; error: any }> {
    console.log('ClientExperienceService: getCaseTimeline called - returning mock data');
    const mockTimeline: CaseTimeline = {
      caseId: 'case1',
      title: 'Mock Case',
      status: 'open',
      updates: [],
      isClientVisible: true,
      shareToken
    };
    return { data: mockTimeline, error: null };
  },

  // Get client dashboard data for authenticated company
  async getClientDashboard(companyId: string): Promise<{ data: ClientDashboardData | null; error: any }> {
    console.log('ClientExperienceService: getClientDashboard called - returning mock data');
    const mockData: ClientDashboardData = {
      openCases: [],
      closedCases: [],
      totalCases: 0,
      avgResolutionTime: 0
    };
    return { data: mockData, error: null };
  },

  // Toggle case client visibility
  async toggleCaseVisibility(caseId: string, isVisible: boolean): Promise<{ data: CaseClientVisibility | null; error: any }> {
    console.log('ClientExperienceService: toggleCaseVisibility called - returning mock data');
    const mockData: CaseClientVisibility = {
      id: 'vis1',
      case_id: caseId,
      is_client_visible: isVisible,
      created_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  },

  // Add client-visible update
  async addClientUpdate(
    caseId: string, 
    updateType: string, 
    title: string, 
    content?: string, 
    isVisibleToClient: boolean = false
  ): Promise<{ data: CaseClientUpdate | null; error: any }> {
    console.log('ClientExperienceService: addClientUpdate called - returning mock data');
    const mockData: CaseClientUpdate = {
      id: 'update1',
      case_id: caseId,
      update_type: updateType,
      title,
      content,
      is_visible_to_client: isVisibleToClient,
      created_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  },

  // Submit client feedback
  async submitClientFeedback(
    caseId: string,
    feedbackType: 'thumbs_up' | 'thumbs_down',
    sentimentScore?: number,
    comment?: string,
    clientEmail?: string,
    clientName?: string
  ): Promise<{ data: CaseClientFeedback | null; error: any }> {
    console.log('ClientExperienceService: submitClientFeedback called - returning mock data');
    const mockData: CaseClientFeedback = {
      id: 'feedback1',
      case_id: caseId,
      feedback_type: feedbackType,
      sentiment_score: sentimentScore,
      comment,
      client_email: clientEmail,
      client_name: clientName,
      submitted_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  },

  // Get notification settings for company
  async getNotificationSettings(companyId: string): Promise<{ data: ClientNotificationSettings | null; error: any }> {
    console.log('ClientExperienceService: getNotificationSettings called - returning mock data');
    const mockData: ClientNotificationSettings = {
      id: 'settings1',
      company_id: companyId,
      email_notifications: true,
      sms_notifications: false,
      slack_notifications: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  },

  // Update notification settings
  async updateNotificationSettings(
    companyId: string, 
    settings: Partial<Omit<ClientNotificationSettings, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: ClientNotificationSettings | null; error: any }> {
    console.log('ClientExperienceService: updateNotificationSettings called - returning mock data');
    const mockData: ClientNotificationSettings = {
      id: 'settings1',
      company_id: companyId,
      email_notifications: true,
      sms_notifications: false,
      slack_notifications: false,
      ...settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { data: mockData, error: null };
  },

  // Get case feedback for analytics
  async getCaseFeedback(caseId: string): Promise<{ data: CaseClientFeedback[] | null; error: any }> {
    console.log('ClientExperienceService: getCaseFeedback called - returning mock data');
    return { data: [], error: null };
  },

  // Get all feedback for company analytics
  async getCompanyFeedbackAnalytics(companyId: string): Promise<{ data: any; error: any }> {
    console.log('ClientExperienceService: getCompanyFeedbackAnalytics called - returning mock data');
    const mockData = {
      totalFeedback: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      satisfactionRate: 0,
      averageSentiment: 0,
      recentFeedback: []
    };
    return { data: mockData, error: null };
  }
};