import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Calendar,
  Paperclip,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { EmailMessage } from '@/hooks/useCRMEmail';
import { EmailComposer } from './EmailComposer';
import { EmailActionDropdown, ActionType } from '@/components/email/EmailActionDropdown';
import { ActionDrawer } from '@/components/email/ActionDrawer';
import { AISummaryBubble } from './ai/AISummaryBubble';
import { AISuggestedReply } from './ai/AISuggestedReply';

interface EmailViewerProps {
  message: EmailMessage;
  open: boolean;
  onClose: () => void;
}

export function EmailViewer({ message, open, onClose }: EmailViewerProps) {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [replyType, setReplyType] = useState<'reply' | 'reply-all' | 'forward'>('reply');
  const [actionDrawer, setActionDrawer] = useState<{
    open: boolean;
    type: ActionType;
  }>({ open: false, type: 'task' });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const handleReply = (type: 'reply' | 'reply-all' | 'forward') => {
    setReplyType(type);
    setShowReplyComposer(true);
  };

  const getReplyRecipient = () => {
    if (replyType === 'reply') {
      return message.sender_email || '';
    }
    // For reply-all and forward, more complex logic would be needed
    return message.sender_email || '';
  };

  const getReplySubject = () => {
    const prefix = replyType === 'forward' ? 'Fwd:' : 'Re:';
    const subject = message.subject || '(No Subject)';
    return subject.startsWith(prefix) ? subject : `${prefix} ${subject}`;
  };

  const handleEmailAction = (action: ActionType) => {
    setActionDrawer({ open: true, type: action });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{message.subject || '(No Subject)'}</span>
              <div className="flex items-center gap-2">
                {message.tracking_enabled && (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Tracked
                  </Badge>
                )}
                {message.has_attachments && (
                  <Badge variant="outline" className="text-xs">
                    <Paperclip className="w-3 h-3 mr-1" />
                    Attachments
                  </Badge>
                )}
                {!message.is_read && message.message_type === 'received' && (
                  <Badge variant="secondary" className="text-xs">
                    Unread
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4">
            {/* Email Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {getInitials(message.sender_name, message.sender_email)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {message.sender_name || message.sender_email}
                      </p>
                      {message.sender_name && (
                        <p className="text-sm text-muted-foreground">
                          {message.sender_email}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(message.sent_at || message.received_at || message.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">To: </span>
                      <span>
                        {message.recipients?.map(r => r.email).join(', ') || 'Unknown'}
                      </span>
                    </div>
                    
                    {message.cc_recipients && message.cc_recipients.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">CC: </span>
                        <span>
                          {message.cc_recipients.map(r => r.email).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />
            </div>

            {/* Email Body */}
            <div className="space-y-4">
              {message.body_content ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: message.is_html ? message.body_content : message.body_content.replace(/\n/g, '<br>') 
                  }}
                />
              ) : message.body_preview ? (
                <p className="text-muted-foreground">
                  {message.body_preview}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No content available
                </p>
              )}

              {/* AI Features */}
              {message.message_type === 'received' && (
                <div className="space-y-3">
                  <Separator />
                  <div className="space-y-3">
                    <AISummaryBubble 
                      emails={[{
                        id: message.id,
                        subject: message.subject || '(No Subject)',
                        sender: message.sender_name || message.sender_email || 'Unknown',
                        body: message.body_content || message.body_preview || '',
                        timestamp: message.received_at || message.created_at
                      }]}
                    />
                    
                    <AISuggestedReply 
                      emails={[{
                        id: message.id,
                        subject: message.subject || '(No Subject)',
                        sender: message.sender_name || message.sender_email || 'Unknown',
                        body: message.body_content || message.body_preview || '',
                        timestamp: message.received_at || message.created_at
                      }]}
                      onUse={(reply) => {
                        console.log('Using suggested reply:', reply);
                        // TODO: Open reply composer with pre-filled content
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Attachments */}
              {message.has_attachments && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4" />
                    <span className="font-medium">Attachments</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Attachment details would be displayed here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleReply('reply')}
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleReply('reply-all')}
              >
                <ReplyAll className="w-4 h-4 mr-2" />
                Reply All
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleReply('forward')}
              >
                <Forward className="w-4 h-4 mr-2" />
                Forward
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              
              <EmailActionDropdown 
                onAction={handleEmailAction}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Composer */}
      {showReplyComposer && (
        <EmailComposer
          open={showReplyComposer}
          onClose={() => setShowReplyComposer(false)}
          replyTo={{
            subject: getReplySubject(),
            recipient: getReplyRecipient(),
          originalBody: message.body_content || message.body_preview
        }}
      />
      )}

      {/* Action Drawer */}
      {actionDrawer.open && (
        <ActionDrawer
          open={actionDrawer.open}
          onClose={() => setActionDrawer({ ...actionDrawer, open: false })}
          actionType={actionDrawer.type}
          emailSubject={message.subject || '(No Subject)'}
          emailBody={message.body_preview || message.body_content || ''}
          emailSender={message.sender_name || message.sender_email}
        />
      )}
    </>
  );
}