/**
 * @fileoverview Enhanced Email Viewer with Live Thread Support
 * @module EnhancedEmailViewer
 * @author Lovable AI
 * @version 1.0.0
 * 
 * ARCHITECTURE NOTES:
 * - Integrates classic email view with live thread mode
 * - Automatic detection of internal vs external threads
 * - Seamless switching between view modes
 * - Maintains thread context and conversation flow
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  Mail, 
  Reply, 
  Forward, 
  Archive, 
  Trash2, 
  Star,
  Users,
  Clock,
  ExternalLink
} from 'lucide-react';

// Import components
import { LiveThreadViewer, isInternalThread } from './LiveThreadViewer';
import { EmailMessage } from '@/hooks/useCRMEmail';

// ============================================
// INTERFACES
// ============================================

/**
 * Enhanced email message for thread viewing
 */
interface ThreadEmailMessage extends EmailMessage {
  thread_id: string;
  reply_to_id?: string;
  read_by?: Array<{
    user_id: string;
    user_name: string;
    read_at: string;
  }>;
  is_internal: boolean;
  participants?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  is_starred?: boolean;
}

/**
 * Props for EnhancedEmailViewer
 */
interface EnhancedEmailViewerProps {
  /** Primary email message */
  message: ThreadEmailMessage;
  /** Thread messages (if part of a conversation) */
  threadMessages?: ThreadEmailMessage[];
  /** Current user information */
  currentUser: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  /** Company domain for internal detection */
  companyDomain: string;
  /** Dialog open state */
  open: boolean;
  /** Close dialog callback */
  onClose: () => void;
  /** Reply callback */
  onReply?: (messageId: string) => void;
  /** Forward callback */
  onForward?: (messageId: string) => void;
  /** Archive callback */
  onArchive?: (messageId: string) => void;
  /** Delete callback */
  onDelete?: (messageId: string) => void;
  /** Star/unstar callback */
  onStar?: (messageId: string) => void;
  /** Send message callback for live thread */
  onSendMessage?: (message: string, replyToId?: string) => void;
  /** Thread update callback */
  onThreadUpdate?: (threadId: string) => void;
  /** Custom CSS classes */
  className?: string;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Extract participants from thread messages
 */
const extractParticipants = (messages: ThreadEmailMessage[]) => {
  const participantMap = new Map();
  
  messages.forEach(message => {
    if (!participantMap.has(message.sender_email)) {
      participantMap.set(message.sender_email, {
        id: message.sender_email,
        name: message.sender_name || message.sender_email,
        email: message.sender_email,
        avatar: undefined, // Would come from user profiles
        is_online: false,
        last_seen: message.created_at
      });
    }
    
    // Add recipients
    message.recipients?.forEach(recipient => {
      if (!participantMap.has(recipient.email)) {
        participantMap.set(recipient.email, {
          id: recipient.email,
          name: recipient.name || recipient.email,
          email: recipient.email,
          avatar: undefined,
          is_online: false,
          last_seen: new Date().toISOString()
        });
      }
    });
  });
  
  return Array.from(participantMap.values());
};

/**
 * Format email date
 */
const formatEmailDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * EnhancedEmailViewer - Email viewer with live thread support
 * 
 * INTEGRATION NOTES:
 * - Automatically detects if thread is internal vs external
 * - Provides toggle between live chat and classic email views
 * - Maintains all standard email functionality
 * - Seamlessly integrates with existing email workflows
 * 
 * FUTURE ENHANCEMENTS:
 * - AI-powered thread summarization
 * - Smart reply suggestions based on context
 * - Integration with calendar for meeting scheduling
 * - Attachment preview and inline editing
 */
export const EnhancedEmailViewer: React.FC<EnhancedEmailViewerProps> = ({
  message,
  threadMessages = [],
  currentUser,
  companyDomain,
  open,
  onClose,
  onReply,
  onForward,
  onArchive,
  onDelete,
  onStar,
  onSendMessage,
  onThreadUpdate,
  className
}) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [viewMode, setViewMode] = useState<'live' | 'classic'>('classic');
  const [isStarred, setIsStarred] = useState(message.is_starred || false);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  /**
   * All messages in thread including the primary message
   */
  const allMessages = useMemo(() => {
    const messages = [message, ...threadMessages];
    return messages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [message, threadMessages]);

  /**
   * Thread participants
   */
  const participants = useMemo(() => 
    extractParticipants(allMessages),
    [allMessages]
  );

  /**
   * Check if thread is internal
   */
  const isInternal = useMemo(() => 
    isInternalThread(participants, companyDomain),
    [participants, companyDomain]
  );

  /**
   * Thread statistics
   */
  const threadStats = useMemo(() => ({
    messageCount: allMessages.length,
    participantCount: participants.length,
    isMultiMessage: allMessages.length > 1,
    lastMessageTime: allMessages[allMessages.length - 1]?.created_at
  }), [allMessages, participants]);

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Auto-select live mode for internal threads
   */
  useEffect(() => {
    if (isInternal && threadStats.isMultiMessage) {
      setViewMode('live');
    } else {
      setViewMode('classic');
    }
  }, [isInternal, threadStats.isMultiMessage]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle star toggle
   */
  const handleStarToggle = () => {
    setIsStarred(!isStarred);
    onStar?.(message.id);
  };

  /**
   * Handle view mode change
   */
  const handleViewModeChange = (mode: 'live' | 'classic') => {
    setViewMode(mode);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  /**
   * Render classic email view
   */
  const renderClassicView = () => (
    <div className="space-y-4">
      {allMessages.map((msg, index) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={participants.find(p => p.email === msg.sender_email)?.avatar} />
                    <AvatarFallback>
                      {msg.sender_name?.[0] || msg.sender_email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{msg.sender_name || msg.sender_email}</h4>
                    <p className="text-sm text-muted-foreground">{msg.sender_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {formatEmailDate(msg.created_at)}
                  </p>
                  {msg.recipients && msg.recipients.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      To: {msg.recipients.map(r => r.email).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{msg.subject}</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {msg.body_preview || 'No content available'}
                    </p>
                  </div>
                </div>
                
                {msg.has_attachments && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <span>Has attachments</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  /**
   * Render thread header
   */
  const renderThreadHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold truncate">
            {message.subject || 'No Subject'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {isInternal && (
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Internal
            </Badge>
          )}
          
          {threadStats.isMultiMessage && (
            <Badge variant="outline" className="text-xs">
              {threadStats.messageCount} messages
            </Badge>
          )}
          
          {!message.is_read && (
            <Badge variant="default" className="text-xs">
              Unread
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View mode toggle for internal threads */}
        {isInternal && threadStats.isMultiMessage && (
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'live' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('live')}
              className="h-8 px-3"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Live
            </Button>
            <Button
              variant={viewMode === 'classic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('classic')}
              className="h-8 px-3"
            >
              <Mail className="w-4 h-4 mr-1" />
              Classic
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStarToggle}
            className={cn(
              "h-8 w-8 p-0",
              isStarred && "text-yellow-500"
            )}
          >
            <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply?.(message.id)}
            className="h-8 w-8 p-0"
          >
            <Reply className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onForward?.(message.id)}
            className="h-8 w-8 p-0"
          >
            <Forward className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive?.(message.id)}
            className="h-8 w-8 p-0"
          >
            <Archive className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(message.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-4xl max-h-[90vh] flex flex-col",
        viewMode === 'live' && "max-w-3xl",
        className
      )}>
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="sr-only">Email Thread</DialogTitle>
          {renderThreadHeader()}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'live' && isInternal ? (
              <motion.div
                key="live-thread"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <LiveThreadViewer
                  messages={allMessages.map(msg => ({
                    ...msg,
                    is_internal: true
                  }))}
                  participants={participants}
                  currentUserId={currentUser.id}
                  config={{
                    realTimeEnabled: false,
                    pollingInterval: 30000,
                    showTypingIndicators: true,
                    showReadReceipts: true,
                    autoScroll: true,
                    companyDomain
                  }}
                  onSendMessage={onSendMessage}
                  onThreadUpdate={onThreadUpdate}
                  onViewModeChange={handleViewModeChange}
                  viewMode={viewMode}
                />
              </motion.div>
            ) : (
              <motion.div
                key="classic-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto p-6"
              >
                {renderClassicView()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// DEVELOPER INTEGRATION NOTES
// ============================================

/**
 * INTEGRATION EXAMPLE:
 * 
 * ```tsx
 * <EnhancedEmailViewer
 *   message={selectedEmail}
 *   threadMessages={emailThread}
 *   currentUser={{
 *     id: user.id,
 *     email: user.email,
 *     name: user.name,
 *     avatar: user.avatar
 *   }}
 *   companyDomain="easeworks.com"
 *   open={viewerOpen}
 *   onClose={() => setViewerOpen(false)}
 *   onReply={(id) => openComposer('reply', id)}
 *   onSendMessage={(message, replyToId) => sendThreadMessage(message, replyToId)}
 *   onThreadUpdate={(threadId) => refreshThread(threadId)}
 * />
 * ```
 * 
 * THREAD DETECTION:
 * - Uses thread_id to group related messages
 * - Automatically detects internal vs external participants
 * - Provides appropriate UI for each thread type
 * 
 * REAL-TIME FEATURES:
 * - Live thread mode for internal conversations
 * - Typing indicators and read receipts
 * - Automatic mode switching based on thread type
 * 
 * RESPONSIVE DESIGN:
 * - Optimized for desktop and mobile viewing
 * - Adaptive layout based on screen size
 * - Touch-friendly controls for mobile devices
 */