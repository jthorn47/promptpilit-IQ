import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  FileText, 
  Zap, 
  Settings, 
  Users, 
  MessageCircle,
  Brain,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ChatInterface } from './ChatInterface';
import { ActionPanel } from './ActionPanel';
import { VoiceControls } from './VoiceControls';
import { useHALOassist } from '@/hooks/useHALOassist';
import { useAuth } from '@/contexts/AuthContext';

interface HALOassistProps {
  className?: string;
  userType?: 'client' | 'employee' | 'internal_ops';
  companyId?: string;
}

export const HALOassist: React.FC<HALOassistProps> = ({ 
  className,
  userType = 'internal_ops',
  companyId 
}) => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'form'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  
  const {
    conversations,
    isLoading,
    sendMessage,
    startConversation,
    getUserPreferences
  } = useHALOassist(user?.id, userType, companyId);

  const handleStartConversation = async () => {
    if (!user) return;
    
    const sessionId = await startConversation({
      userId: user.id,
      userType,
      companyId,
      topic: 'General HALOassist Session'
    });
    
    if (sessionId) {
      setCurrentSession(sessionId);
      setIsExpanded(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`relative ${className}`}
    >
      {!isExpanded ? (
        /* Floating Assistant Button */
        <motion.div
          variants={itemVariants}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={handleStartConversation}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Bot className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform" />
          </Button>
          
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg px-3 py-2 shadow-md"
          >
            <p className="text-sm font-medium text-foreground">HALOassist</p>
            <p className="text-xs text-muted-foreground">AI Payroll Copilot</p>
          </motion.div>
        </motion.div>
      ) : (
        /* Expanded Interface */
        <motion.div
          variants={itemVariants}
          className="fixed inset-4 z-50 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">HALOassist</h2>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Payroll Copilot • {userType.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Mode Selector */}
              <div className="flex bg-muted rounded-lg p-1">
                {(['chat', 'voice', 'form'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={activeMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveMode(mode)}
                    className="text-xs"
                  >
                    {mode === 'chat' && <MessageCircle className="w-3 h-3 mr-1" />}
                    {mode === 'voice' && <Mic className="w-3 h-3 mr-1" />}
                    {mode === 'form' && <FileText className="w-3 h-3 mr-1" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-full">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeMode === 'chat' && (
                <ChatInterface
                  conversationId={currentSession}
                  userType={userType}
                  companyId={companyId}
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                />
              )}

              {activeMode === 'voice' && (
                <VoiceControls
                  conversationId={currentSession}
                  userType={userType}
                  companyId={companyId}
                  onSendMessage={sendMessage}
                />
              )}

              {activeMode === 'form' && (
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold text-foreground">Form Assistant</h3>
                    <p className="text-muted-foreground max-w-md">
                      AI-powered form filling and document generation coming soon.
                      Ask HALOassist to help you complete forms automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="w-80 border-l border-border">
              <ActionPanel
                userType={userType}
                companyId={companyId}
                conversationId={currentSession}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="border-t border-border px-6 py-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-xs">
                  <div className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse"></div>
                  Connected
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Session: {currentSession?.slice(-8) || 'Not started'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};