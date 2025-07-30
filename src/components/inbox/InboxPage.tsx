import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Star, 
  Clock, 
  Mail, 
  CheckCircle2, 
  Settings, 
  Sun, 
  Moon, 
  Eye,
  ArrowLeft,
  Trash2,
  Archive,
  Reply,
  Forward,
  Building2,
  FileText,
  TrendingUp,
  DollarSign,
  Inbox,
  Send,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EmailActionDropdown, ActionType } from '@/components/email/EmailActionDropdown';
import { ActionDrawer } from '@/components/email/ActionDrawer';
import { InboxSearchWithAI, EmailSummaryCard } from './InboxSearchWithAI';
import { CRMSidePanel } from './CRMSidePanel';
import { PulseSidePanel } from './PulseSidePanel';
import { ActivityHistoryPanel } from './ActivityHistoryPanel';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { useEmailActivityHistory } from '@/hooks/useEmailActivityHistory';
import { ProposalCreationDrawer } from './ProposalCreationDrawer';
import { ProposalNextStepsModal } from './ProposalNextStepsModal';
import { RevenueDashboard } from './RevenueDashboard';
import { DealCoachSidebar } from './DealCoachSidebar';

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isDone: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  avatar: string;
}

type Theme = 'light' | 'dark' | 'zen';
type Section = 'today' | 'unread' | 'starred' | 'done';
type SidebarTab = 'inbox' | 'revenue' | 'sent' | 'drafts';

const dummyEmails: Email[] = [
  {
    id: '1',
    sender: 'Sarah Chen',
    senderEmail: 'sarah@acme.com',
    subject: 'Q4 Strategy Review - Action Items',
    preview: 'Following up on our discussion about the strategic initiatives for Q4. I have compiled the action items and would love your feedback on the proposed timeline...',
    content: 'Following up on our discussion about the strategic initiatives for Q4. I have compiled the action items and would love your feedback on the proposed timeline. The key areas we need to focus on are: 1) Market expansion in the Southwest region, 2) Product feature enhancements based on customer feedback, 3) Team restructuring for better efficiency. Please let me know if you have any questions or concerns about these initiatives.',
    timestamp: '9:24 AM',
    isRead: false,
    isStarred: true,
    isDone: false,
    priority: 'high',
    tags: ['strategy', 'urgent', 'sales'],
    avatar: 'SC'
  },
  {
    id: '2',
    sender: 'Marcus Rodriguez',
    senderEmail: 'marcus@designco.io',
    subject: 'New design system components ready',
    preview: 'The component library updates are ready for review. We have added the new button variants and improved the accessibility features...',
    content: 'The component library updates are ready for review. We have added the new button variants and improved the accessibility features. The new components include: enhanced form controls, better navigation patterns, and improved color contrast ratios. All components have been tested for WCAG compliance.',
    timestamp: '8:45 AM',
    isRead: true,
    isStarred: false,
    isDone: false,
    priority: 'medium',
    tags: ['design', 'review'],
    avatar: 'MR'
  },
  {
    id: '3',
    sender: 'Emma Thompson',
    senderEmail: 'emma@startup.com',
    subject: 'Partnership proposal discussion',
    preview: 'Thank you for taking the time to discuss our partnership proposal. I am excited about the potential collaboration and would like to schedule a follow-up...',
    content: 'Thank you for taking the time to discuss our partnership proposal. I am excited about the potential collaboration and would like to schedule a follow-up meeting to discuss the implementation details. We believe our combined expertise can deliver exceptional value to both our customer bases. Could we schedule a call this week to discuss the next steps?',
    timestamp: 'Yesterday',
    isRead: false,
    isStarred: true,
    isDone: false,
    priority: 'high',
    tags: ['partnership', 'business', 'proposal'],
    avatar: 'ET'
  },
  {
    id: '4',
    sender: 'Team Updates',
    senderEmail: 'updates@company.com',
    subject: 'Weekly team digest - October 2024',
    preview: 'This week highlights: New feature launches, team achievements, and upcoming events. Check out what everyone has been working on...',
    content: 'This week highlights: New feature launches, team achievements, and upcoming events. Check out what everyone has been working on. The development team shipped three major features, sales exceeded their monthly targets, and we welcomed two new team members.',
    timestamp: '2 days ago',
    isRead: true,
    isStarred: false,
    isDone: true,
    priority: 'low',
    tags: ['digest', 'team'],
    avatar: 'TU'
  },
  {
    id: '5',
    sender: 'Alex Kim',
    senderEmail: 'alex@techcorp.com',
    subject: 'Code review feedback',
    preview: 'I have reviewed your latest pull request. Overall looks great! Just a few minor suggestions for optimization and one question about the error handling...',
    content: 'I have reviewed your latest pull request. Overall looks great! Just a few minor suggestions for optimization and one question about the error handling. The implementation follows our coding standards well, and the test coverage is excellent. Could you clarify the approach for handling network timeouts?',
    timestamp: '3 days ago',
    isRead: true,
    isStarred: false,
    isDone: true,
    priority: 'medium',
    tags: ['code', 'feedback'],
    avatar: 'AK'
  }
];

export const InboxPage = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [activeSection, setActiveSection] = useState<Section>('today');
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emails, setEmails] = useState<Email[]>(dummyEmails);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>(dummyEmails);
  const [isAISearch, setIsAISearch] = useState(false);
  const [emailSummaries, setEmailSummaries] = useState<any[]>([]);
  const [crmSidePanel, setCrmSidePanel] = useState(false);
  const [pulseSidePanel, setPulseSidePanel] = useState(false);
  const [actionDrawer, setActionDrawer] = useState<{
    open: boolean;
    type: ActionType;
    email: Email | null;
  }>({ open: false, type: 'task', email: null });
  const [proposalDrawer, setProposalDrawer] = useState(false);
  const [nextStepsModalData, setNextStepsModalData] = useState<any>(null);

  const sections = [
    { id: 'today' as Section, label: 'Today', icon: Clock, count: emails.filter(e => !e.isRead && e.timestamp.includes('AM')).length },
    { id: 'unread' as Section, label: 'Unread', icon: Mail, count: emails.filter(e => !e.isRead).length },
    { id: 'starred' as Section, label: 'Starred', icon: Star, count: emails.filter(e => e.isStarred).length },
    { id: 'done' as Section, label: 'Done', icon: CheckCircle2, count: emails.filter(e => e.isDone).length }
  ];

  const sidebarTabs = [
    { id: 'inbox' as SidebarTab, label: 'Inbox', icon: Inbox, count: emails.filter(e => !e.isRead).length },
    { id: 'revenue' as SidebarTab, label: 'Revenue', icon: TrendingUp, count: 0 },
    { id: 'sent' as SidebarTab, label: 'Sent', icon: Send, count: 0 },
    { id: 'drafts' as SidebarTab, label: 'Drafts', icon: FileText, count: 0 }
  ];

  const handleSearchResults = (results: Email[], isAI: boolean, summaries?: any[]) => {
    setIsAISearch(isAI);
    setEmailSummaries(summaries || []);
    
    // Apply section filter to search results
    if (searchQuery) {
      setFilteredEmails(results);
    } else {
      // No search query, apply section filter
      const sectionFiltered = emails.filter(email => {
        switch (activeSection) {
          case 'today':
            return !email.isRead && email.timestamp.includes('AM');
          case 'unread':
            return !email.isRead;
          case 'starred':
            return email.isStarred;
          case 'done':
            return email.isDone;
          default:
            return true;
        }
      });
      setFilteredEmails(sectionFiltered);
    }
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    if (!searchQuery) {
      // Re-apply section filter when no search is active
      handleSearchResults(emails, false);
    }
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'zen'];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const markAsDone = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isDone: !email.isDone, isRead: true } : email
    ));
  };

  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const handleEmailAction = (action: ActionType, email: Email) => {
    setActionDrawer({ open: true, type: action, email });
  };

  const handleProposalNext = (proposalData: any) => {
    setProposalDrawer(false);
    setNextStepsModalData({
      proposalData: {
        companyName: proposalData.companyName,
        contactName: proposalData.contactName,
        contactEmail: proposalData.contactEmail,
        proposalTitle: proposalData.proposalTitle
      },
      threadId: selectedEmail?.id || 'default-thread'
    });
  };

  const handleProposalClick = (proposalId: string) => {
    // Navigate to specific proposal thread
    console.log('Navigate to proposal:', proposalId);
  };

  const renderMainContent = () => {
    switch (activeSidebarTab) {
      case 'revenue':
        return <RevenueDashboard onProposalClick={handleProposalClick} />;
      case 'sent':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Sent Messages</h2>
            <p className="text-muted-foreground">Sent messages will appear here.</p>
          </div>
        );
      case 'drafts':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Drafts</h2>
            <p className="text-muted-foreground">Draft messages will appear here.</p>
          </div>
        );
      default:
        return renderInboxContent();
    }
  };

  const renderInboxContent = () => {
    if (selectedEmail) {
      return (
        <EmailDetail 
          key="detail"
          email={selectedEmail} 
          onBack={() => setSelectedEmail(null)}
          onStar={() => toggleStar(selectedEmail.id)}
          onDone={() => markAsDone(selectedEmail.id)}
          onOpenCRM={() => setCrmSidePanel(true)}
          onOpenPulse={() => setPulseSidePanel(true)}
          onCreateProposal={() => setProposalDrawer(true)}
        />
      );
    }

    return (
      <motion.div
        key="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-6"
      >
        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InboxSearchWithAI
            emails={emails}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchResults={handleSearchResults}
          />
        </motion.div>

        {/* Sections */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {sections.map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              onClick={() => handleSectionChange(section.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap transition-all duration-200",
                activeSection === section.id ? "shadow-sm" : "hover-scale"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
              {section.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {section.count}
                </Badge>
              )}
            </Button>
          ))}
        </motion.div>

        {/* Email List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredEmails.map((email, index) => (
              <div key={email.id}>
                <EmailCard
                  email={email}
                  index={index}
                  onClick={() => {
                    setSelectedEmail(email);
                    markAsRead(email.id);
                  }}
                  onStar={() => toggleStar(email.id)}
                  onDone={() => markAsDone(email.id)}
                  onAction={(action) => handleEmailAction(action, email)}
                />
                {/* Show AI summary if available */}
                {isAISearch && emailSummaries.find(s => s.id === email.id) && (
                  <EmailSummaryCard
                    summary={emailSummaries.find(s => s.id === email.id)?.summary || ''}
                    relevance={emailSummaries.find(s => s.id === email.id)?.relevance || 'low'}
                  />
                )}
              </div>
            ))}
          </AnimatePresence>

          {filteredEmails.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-light">No emails found</p>
                <p className="text-sm">Try adjusting your search or section filter</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 ease-out flex",
      theme === 'light' && "bg-background text-foreground",
      theme === 'dark' && "bg-background text-foreground dark",
      theme === 'zen' && "bg-gradient-to-br from-slate-50 to-stone-100 text-slate-800"
    )}>
      {/* Left Sidebar */}
      <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Halo Mail</h1>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarTabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeSidebarTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveSidebarTab(tab.id)}
              className={cn(
                "w-full justify-start text-left",
                activeSidebarTab === tab.id ? "shadow-sm" : "hover-scale"
              )}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-border bg-background/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            {selectedEmail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmail(null)}
                className="hover-scale"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedEmail ? selectedEmail.subject : 
                 activeSidebarTab === 'revenue' ? 'Revenue Dashboard' :
                 activeSidebarTab === 'sent' ? 'Sent Messages' :
                 activeSidebarTab === 'drafts' ? 'Drafts' : 'Inbox'}
              </h2>
              {!selectedEmail && activeSidebarTab === 'inbox' && (
                <p className="text-sm text-muted-foreground">
                  {filteredEmails.length} conversations
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hover-scale"
            >
              {theme === 'light' && <Sun className="w-4 h-4" />}
              {theme === 'dark' && <Moon className="w-4 h-4" />}
              {theme === 'zen' && <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="hover-scale">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {renderMainContent()}
          </AnimatePresence>
        </div>
      </div>

      {/* CRM Side Panel */}
      {selectedEmail && (
        <CRMSidePanel
          email={selectedEmail}
          isOpen={crmSidePanel}
          onClose={() => setCrmSidePanel(false)}
        />
      )}
      
      {/* Pulse Side Panel */}
      {selectedEmail && (
        <PulseSidePanel
          email={selectedEmail}
          isOpen={pulseSidePanel}
          onClose={() => setPulseSidePanel(false)}
        />
      )}
      
      {/* Action Drawer */}
      {actionDrawer.open && actionDrawer.email && (
        <ActionDrawer
          open={actionDrawer.open}
          onClose={() => setActionDrawer({ ...actionDrawer, open: false })}
          actionType={actionDrawer.type}
          emailSubject={actionDrawer.email.subject}
          emailBody={actionDrawer.email.preview}
          emailSender={actionDrawer.email.sender}
        />
      )}
      
      {/* Proposal Creation Drawer */}
      {selectedEmail && (
        <ProposalCreationDrawer
          isOpen={proposalDrawer}
          onClose={() => setProposalDrawer(false)}
          onNext={handleProposalNext}
          emailContext={{
            sender: selectedEmail.sender,
            senderEmail: selectedEmail.senderEmail,
            subject: selectedEmail.subject,
            companyName: selectedEmail.sender.split(' ')[0] + ' Corp' // Mock company name
          }}
        />
      )}
      
      {/* Proposal Next Steps Modal */}
      <ProposalNextStepsModal
        isOpen={!!nextStepsModalData}
        onClose={() => setNextStepsModalData(null)}
        proposalData={nextStepsModalData?.proposalData || {}}
        threadId={nextStepsModalData?.threadId}
      />
    </div>
  );
};

interface EmailCardProps {
  email: Email;
  index: number;
  onClick: () => void;
  onStar: () => void;
  onDone: () => void;
  onAction: (action: ActionType) => void;
}

const EmailCard = ({ email, index, onClick, onStar, onDone, onAction }: EmailCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ delay: index * 0.05 }}
    layout
  >
    <Card 
      className={cn(
        "group p-4 cursor-pointer border-0 bg-muted/20 hover:bg-muted/40 transition-all duration-200 hover-scale",
        !email.isRead && "bg-primary/5 border-l-2 border-l-primary"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-medium">
          {email.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className={cn(
                "font-medium truncate",
                !email.isRead && "text-foreground",
                email.isRead && "text-muted-foreground"
              )}>
                {email.sender}
              </p>
              {email.priority === 'high' && (
                <div className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {email.timestamp}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStar();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
              >
                <Star className={cn(
                  "w-3 h-3",
                  email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )} />
              </Button>
              <EmailActionDropdown 
                onAction={onAction}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <h3 className={cn(
            "font-medium mb-1 truncate",
            !email.isRead && "text-foreground",
            email.isRead && "text-muted-foreground"
          )}>
            {email.subject}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {email.preview}
          </p>

          {email.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {email.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onStar: () => void;
  onDone: () => void;
  onOpenCRM: () => void;
  onOpenPulse: () => void;
  onCreateProposal: () => void;
}

const EmailDetail = ({ email, onBack, onStar, onDone, onOpenCRM, onOpenPulse, onCreateProposal }: EmailDetailProps) => {
  const { activities, loading } = useEmailActivityHistory(email.id);
  const [isDealCoachOpen, setIsDealCoachOpen] = useState(false);

  // Check if this email thread should show Deal Coach
  const isDealThread = email.tags.some(tag => 
    tag.toLowerCase().includes('sales') || tag.toLowerCase().includes('proposal')
  );

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-300",
          isDealCoachOpen ? "mr-80" : ""
        )}
      >
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-0 bg-muted/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-lg font-medium">
              {email.avatar}
            </div>
            <div>
              <h3 className="font-medium">{email.sender}</h3>
              <p className="text-sm text-muted-foreground">{email.senderEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenCRM}
              className="text-xs"
            >
              <Building2 className="w-4 h-4 mr-1" />
              CRM
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenPulse}
              className="text-xs"
            >
              <FileText className="w-4 h-4 mr-1" />
              Pulse
            </Button>
            {isDealThread && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDealCoachOpen(!isDealCoachOpen)}
                className={cn(
                  "text-xs",
                  isDealCoachOpen ? "bg-primary text-primary-foreground" : ""
                )}
              >
                <Brain className="w-4 h-4 mr-1" />
                Deal Coach
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onStar}>
              <Star className={cn(
                "w-4 h-4",
                email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )} />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-light mb-2">{email.subject}</h2>
            <p className="text-sm text-muted-foreground">{email.timestamp}</p>
          </div>

          <div className="prose prose-sm max-w-none leading-relaxed">
            <p>{email.preview}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          {/* Proposal Tracking */}
          <ProposalStatusBadge
            emailId={email.id}
            emailSubject={email.subject}
            emailBody={email.preview}
            senderEmail={email.senderEmail}
            onSendEmail={(subject, body) => {
              // Handle email sending - could integrate with email provider
              console.log('Sending follow-up email:', { subject, body, to: email.senderEmail });
              // This would typically integrate with your email service
              // For now, we'll just log and show a success message
            }}
            className="py-2"
          />

          <div className="flex gap-2 pt-4">
            <Button>
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline">
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </Button>
            <Button variant="outline" onClick={onCreateProposal} className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
              <FileText className="w-4 h-4 mr-2" />
              Generate Proposal
            </Button>
            <Button variant="outline" onClick={onDone}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {email.isDone ? 'Undone' : 'Done'}
            </Button>
          </div>
        </div>
      </Card>
        </div>
        
        <div className="lg:col-span-1">
          <ActivityHistoryPanel 
            activities={activities} 
            loading={loading}
            className="sticky top-4"
          />
        </div>
      </motion.div>

      {/* Deal Coach Sidebar */}
      {isDealThread && (
        <DealCoachSidebar
          email={email}
          isOpen={isDealCoachOpen}
          onToggle={() => setIsDealCoachOpen(!isDealCoachOpen)}
          threadMessages={[]} // This would be populated with actual thread messages
        />
      )}
    </div>
  );
};