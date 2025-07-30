import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  MailOpen, 
  Reply, 
  Search, 
  Calendar,
  Paperclip,
  Eye
} from 'lucide-react';
import { EmailMessage } from '@/hooks/useCRMEmail';
import { EmailViewer } from './EmailViewer';
import { AITriageLabel } from './ai/AITriageLabel';
import { AISummaryBubble } from './ai/AISummaryBubble';
import { AISuggestedReply } from './ai/AISuggestedReply';
import { generateMockAIData } from './ai/mockAIData';
import { EmailActionDropdown, ActionType } from '@/components/email/EmailActionDropdown';
import { ActionDrawer } from '@/components/email/ActionDrawer';

interface EmailListProps {
  messages: EmailMessage[];
  type: 'inbox' | 'sent';
  emptyMessage: string;
  aiTriageEnabled?: boolean;
}

export function EmailList({ messages, type, emptyMessage, aiTriageEnabled = false }: EmailListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [expandedAI, setExpandedAI] = useState<string | null>(null);
  const [actionDrawer, setActionDrawer] = useState<{
    open: boolean;
    type: ActionType;
    message: EmailMessage | null;
  }>({ open: false, type: 'task', message: null });

  // Filter messages based on search
  const filteredMessages = messages.filter(message => 
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.body_preview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const handleEmailAction = (action: ActionType, message: EmailMessage) => {
    setActionDrawer({ open: true, type: action, message });
  };

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">
            {type === 'inbox' 
              ? 'New emails will appear here when they arrive.'
              : 'Emails you send will appear here.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${type}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Message List */}
      <div className="space-y-2">
        {filteredMessages.map((message) => (
          <Card 
            key={message.id} 
            className={`group cursor-pointer transition-colors hover:bg-muted/50 ${
              !message.is_read && type === 'inbox' ? 'border-l-4 border-l-primary' : ''
            }`}
            onClick={() => setSelectedMessage(message)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-sm">
                    {getInitials(message.sender_name, message.sender_email)}
                  </AvatarFallback>
                </Avatar>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {type === 'inbox' 
                          ? (message.sender_name || message.sender_email)
                          : message.recipients?.[0]?.email || 'Unknown'
                        }
                      </p>
                      {!message.is_read && type === 'inbox' && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          New
                        </Badge>
                      )}
                      {message.tracking_enabled && type === 'sent' && (
                        <Eye className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {message.has_attachments && (
                        <Paperclip className="w-3 h-3" />
                      )}
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(message.sent_at || message.received_at || message.created_at)}</span>
                      <EmailActionDropdown 
                        onAction={(action) => handleEmailAction(action, message)}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>

                  <p className="font-medium text-sm mb-1 truncate">
                    {message.subject || '(No Subject)'}
                  </p>
                  
                   {message.body_preview && (
                     <p className="text-sm text-muted-foreground truncate">
                       {message.body_preview}
                     </p>
                   )}

                    {/* AI Triage Features */}
                    {aiTriageEnabled && type === 'inbox' && (
                      <div className="mt-3 space-y-2">
                        {(() => {
                          const aiData = generateMockAIData(message.id);
                          // Convert message to format expected by AI components
                          const emailForAI = {
                            id: message.id,
                            subject: message.subject || '(No Subject)',
                            sender: message.sender_name || message.sender_email || 'Unknown',
                            body: message.body_content || message.body_preview || '',
                            timestamp: message.received_at || message.created_at
                          };
                          
                          return (
                            <>
                              <div className="flex items-center gap-2">
                                <AITriageLabel type={aiData.triage} />
                              </div>
                              
                              <AISummaryBubble emails={[emailForAI]} />
                              
                              {aiData.triage === 'needs-reply' && (
                                <AISuggestedReply 
                                  emails={[emailForAI]}
                                  onUse={(reply) => {
                                    console.log('Using suggested reply:', reply);
                                    // TODO: Open composer with pre-filled reply
                                  }}
                                />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                 </div>

                {/* Status Icon */}
                <div className="flex flex-col items-center gap-1">
                  {message.is_read || type === 'sent' ? (
                    <MailOpen className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && searchTerm && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No messages found matching "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Email Viewer Modal */}
      {selectedMessage && (
        <EmailViewer
          message={selectedMessage}
          open={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}

      {/* Action Drawer */}
      {actionDrawer.open && actionDrawer.message && (
        <ActionDrawer
          open={actionDrawer.open}
          onClose={() => setActionDrawer({ ...actionDrawer, open: false })}
          actionType={actionDrawer.type}
          emailSubject={actionDrawer.message.subject || '(No Subject)'}
          emailBody={actionDrawer.message.body_preview || actionDrawer.message.body_content || ''}
          emailSender={actionDrawer.message.sender_name || actionDrawer.message.sender_email}
        />
      )}
    </div>
  );
}