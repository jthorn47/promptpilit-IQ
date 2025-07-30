import { TriageType } from './AITriageLabel';

export interface MockAIData {
  triage: TriageType;
  summary: string;
  suggestedReply: string;
}

// Mock AI responses for testing
const mockResponses: MockAIData[] = [
  {
    triage: 'needs-reply',
    summary: 'Customer inquiry about product pricing and availability. Requires response within 24 hours.',
    suggestedReply: 'Thank you for your inquiry! I\'ll get back to you with pricing details within 24 hours.'
  },
  {
    triage: 'fyi',
    summary: 'System notification about scheduled maintenance. No action required.',
    suggestedReply: 'Acknowledged. Thank you for the notification.'
  },
  {
    triage: 'transactional',
    summary: 'Order confirmation and shipping details for recent purchase.',
    suggestedReply: 'Thank you for the order confirmation. Looking forward to receiving the shipment.'
  },
  {
    triage: 'newsletter',
    summary: 'Weekly company newsletter with product updates and team announcements.',
    suggestedReply: 'Thanks for keeping us updated!'
  },
  {
    triage: 'ignore',
    summary: 'Automated spam email about cryptocurrency investment opportunities.',
    suggestedReply: 'This email appears to be spam and can be safely ignored.'
  },
  {
    triage: 'needs-reply',
    summary: 'Meeting request for next week. Please confirm availability and preferred time slot.',
    suggestedReply: 'I\'m available next week. Tuesday or Wednesday afternoon works best for me.'
  },
  {
    triage: 'fyi',
    summary: 'Team update on project milestones and deliverables. Informational only.',
    suggestedReply: 'Thanks for the update. Great progress on the project!'
  }
];

// Generate mock AI data for an email
export function generateMockAIData(emailId: string): MockAIData {
  // Use email ID to get consistent mock data
  const hash = emailId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % mockResponses.length;
  return mockResponses[index];
}