/**
 * @fileoverview Live Thread Viewer - Chat-like interface for internal email conversations
 * @module LiveThreadViewer
 * @author Lovable AI
 * @version 1.0.0
 * 
 * ARCHITECTURE NOTES:
 * - Chat-like interface for internal email threads
 * - Real-time updates with polling fallback
 * - Bubble-style messages with read receipts
 * - Typing indicators for active conversations
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  Mail, 
  Send, 
  Eye, 
  EyeOff, 
  Clock, 
  Check, 
  CheckCheck,
  MoreVertical,
  Reply,
  Forward,
  Archive
} from 'lucide-react';

// Import base types
import { EmailMessage } from '@/hooks/useCRMEmail';

// ============================================
// INTERFACES
// ============================================

/**
 * Enhanced message interface for live thread
 */
interface LiveThreadMessage extends EmailMessage {
  thread_id: string;
  reply_to_id?: string;
  read_by?: Array<{
    user_id: string;
    user_name: string;
    read_at: string;
  }>;
  is_typing?: boolean;
  is_internal: boolean;
}

/**
 * Thread participant information
 */
interface ThreadParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
  is_typing?: boolean;
}

/**
 * Live thread configuration
 */
interface LiveThreadConfig {
  /** Enable real-time updates */
  realTimeEnabled: boolean;
  /** Polling interval in milliseconds */
  pollingInterval: number;
  /** Show typing indicators */
  showTypingIndicators: boolean;
  /** Show read receipts */
  showReadReceipts: boolean;
  /** Auto-scroll to new messages */
  autoScroll: boolean;
  /** Company domain for internal detection */
  companyDomain: string;
}

/**
 * Props for LiveThreadViewer
 */
interface LiveThreadViewerProps {
  /** Thread messages */
  messages: LiveThreadMessage[];
  /** Thread participants */
  participants: ThreadParticipant[];
  /** Current user ID */
  currentUserId: string;
  /** Thread configuration */
  config: LiveThreadConfig;
  /** Callback when new message is sent */
  onSendMessage?: (message: string, replyToId?: string) => void;
  /** Callback when thread is updated */
  onThreadUpdate?: (threadId: string) => void;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'live' | 'classic') => void;
  /** Current view mode */
  viewMode?: 'live' | 'classic';
  /** Custom CSS classes */
  className?: string;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Check if all participants are internal (same domain)
 */
export const isInternalThread = (
  participants: ThreadParticipant[], 
  companyDomain: string
): boolean => {
  return participants.every(p => p.email.endsWith(`@${companyDomain}`));
};

/**
 * Get user initials for avatar
 */
const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format message timestamp for chat display
 */
const formatChatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  
  return date.toLocaleDateString();
};

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * LiveThreadViewer - Chat-like interface for internal email threads
 * 
 * INTEGRATION NOTES:
 * - Automatically detects internal vs external threads
 * - Provides real-time updates with polling fallback
 * - Includes typing indicators and read receipts
 * - Seamlessly switches between live and classic views
 * 
 * FUTURE ENHANCEMENTS:
 * - WebSocket integration for true real-time updates
 * - Voice message support
 * - File drag-and-drop attachment
 * - Thread branching for complex conversations
 */
export const LiveThreadViewer: React.FC<LiveThreadViewerProps> = ({
  messages,
  participants,
  currentUserId,
  config,
  onSendMessage,
  onThreadUpdate,
  onViewModeChange,
  viewMode = 'live',
  className
}) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  /**
   * Check if this is an internal thread
   */
  const isInternal = useMemo(() => 
    isInternalThread(participants, config.companyDomain),
    [participants, config.companyDomain]
  );

  /**
   * Sort messages chronologically
   */
  const sortedMessages = useMemo(() => 
    [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
    [messages]
  );

  /**
   * Current user info
   */
  const currentUser = useMemo(() => 
    participants.find(p => p.id === currentUserId),
    [participants, currentUserId]
  );

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Auto-scroll to bottom on new messages
   */
  useEffect(() => {
    if (config.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages, config.autoScroll]);

  /**
   * Polling for updates (fallback for real-time)
   */
  useEffect(() => {
    if (!config.realTimeEnabled) {
      const interval = setInterval(() => {
        onThreadUpdate?.(messages[0]?.thread_id);
      }, config.pollingInterval);
      
      return () => clearInterval(interval);
    }
  }, [config.realTimeEnabled, config.pollingInterval, messages, onThreadUpdate]);

  /**
   * Typing indicator simulation
   */
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  /**
   * Mock typing users update
   */
  useEffect(() => {
    if (config.showTypingIndicators) {
      const mockTypingUsers = participants
        .filter(p => p.is_typing && p.id !== currentUserId)
        .map(p => p.name);
      setTypingUsers(mockTypingUsers);
    }
  }, [participants, currentUserId, config.showTypingIndicators]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle sending a new message
   */
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    onSendMessage?.(newMessage, replyToId);
    setNewMessage('');
    setReplyToId(undefined);
    setIsTyping(false);
  };

  /**
   * Handle typing detection
   */
  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  /**
   * Render message bubble
   */
  const renderMessageBubble = (message: LiveThreadMessage, index: number) => {
    const isOwnMessage = message.sender_email === currentUser?.email;
    const participant = participants.find(p => p.email === message.sender_email);
    const nextMessage = sortedMessages[index + 1];
    const isLastInGroup = !nextMessage || 
      nextMessage.sender_email !== message.sender_email ||
      new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 300000; // 5 minutes

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 mb-4",
          isOwnMessage ? "justify-end" : "justify-start"
        )}
      >
        {/* Avatar (only for others and last in group) */}
        {!isOwnMessage && isLastInGroup && (
          <Avatar className="w-8 h-8 mt-1">
            <AvatarImage src={participant?.avatar} />
            <AvatarFallback className="text-xs">
              {getUserInitials(participant?.name || message.sender_name || '')}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Spacer for grouped messages */}
        {!isOwnMessage && !isLastInGroup && (
          <div className="w-8" />
        )}

        {/* Message content */}
        <div className={cn(
          "flex flex-col max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}>
          {/* Sender name (only for others and first in group) */}
          {!isOwnMessage && (index === 0 || sortedMessages[index - 1].sender_email !== message.sender_email) && (
            <span className="text-xs text-muted-foreground mb-1 px-2">
              {participant?.name || message.sender_name}
            </span>
          )}

          {/* Message bubble */}
          <div className={cn(
            "rounded-2xl px-4 py-2 max-w-full break-words",
            isOwnMessage 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-foreground",
            isLastInGroup ? "mb-1" : "mb-0.5"
          )}>
            <p className="text-sm leading-relaxed">
              {message.body_preview || message.subject}
            </p>
          </div>

          {/* Message metadata */}
          {isLastInGroup && (
            <div className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground mt-1",
              isOwnMessage ? "justify-end" : "justify-start"
            )}>
              <span>{formatChatTime(message.created_at)}</span>
              
              {/* Read receipts for own messages */}
              {isOwnMessage && config.showReadReceipts && (
                <div className="flex items-center gap-1">
                  {message.read_by && message.read_by.length > 0 ? (
                    <CheckCheck className="w-3 h-3 text-green-500" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  {message.read_by && message.read_by.length > 0 && (
                    <span className="text-xs">
                      {message.read_by.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  /**
   * Render typing indicator
   */
  const renderTypingIndicator = () => {
    if (!config.showTypingIndicators || typingUsers.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 mb-4"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-muted-foreground rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.length} people are typing...`
          }
        </span>
      </motion.div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={cn("live-thread-viewer h-full flex flex-col", className)}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant) => (
                <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {messages[0]?.subject || 'Live Thread'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {participants.length} participants
              </p>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            {isInternal && (
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'live' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.('live')}
                  className="h-7 px-2"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Live
                </Button>
                <Button
                  variant={viewMode === 'classic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.('classic')}
                  className="h-7 px-2"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Classic
                </Button>
              </div>
            )}
            
            {!isInternal && (
              <Badge variant="secondary" className="text-xs">
                External Thread
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sortedMessages.map((message, index) => 
            renderMessageBubble(message, index)
          )}
          
          <AnimatePresence>
            {renderTypingIndicator()}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Message input */}
      <div className="border-t p-4">
        {replyToId && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded">
            <Reply className="w-4 h-4" />
            <span className="text-sm">Replying to message</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToId(undefined)}
            >
              ×
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-11 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DEVELOPER INTEGRATION NOTES
// ============================================

/**
 * INTEGRATION EXAMPLE:
 * 
 * ```tsx
 * <LiveThreadViewer
 *   messages={threadMessages}
 *   participants={threadParticipants}
 *   currentUserId={currentUser.id}
 *   config={{
 *     realTimeEnabled: false,
 *     pollingInterval: 30000,
 *     showTypingIndicators: true,
 *     showReadReceipts: true,
 *     autoScroll: true,
 *     companyDomain: 'easeworks.com'
 *   }}
 *   onSendMessage={(message, replyToId) => sendThreadMessage(message, replyToId)}
 *   onThreadUpdate={(threadId) => refreshThread(threadId)}
 *   onViewModeChange={(mode) => setViewMode(mode)}
 * />
 * ```
 * 
 * REAL-TIME INTEGRATION:
 * - Replace polling with WebSocket or Supabase real-time subscriptions
 * - Implement actual typing indicators with user presence
 * - Add read receipt tracking in database
 * 
 * STYLING NOTES:
 * - All styles are scoped to .live-thread-viewer
 * - Uses semantic tokens for consistent theming
 * - Responsive design with mobile-first approach
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Implement message virtualization for long threads
 * - Add message caching and pagination
 * - Optimize re-renders with React.memo and useMemo
 */