import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user_message' | 'ai_response' | 'system_message';
  content: string;
  timestamp: Date;
  metadata?: {
    actions?: string[];
    confidence?: number;
    sources?: string[];
  };
}

interface ChatInterfaceProps {
  conversationId: string | null;
  userType: 'client' | 'employee' | 'internal_ops';
  companyId?: string;
  onSendMessage: (message: string, conversationId: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  userType,
  companyId,
  onSendMessage,
  isLoading
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system_message',
      content: `Welcome to HALOassist! I'm your AI payroll copilot. I can help you with payroll questions, run calculations, file forms, and more. How can I assist you today?`,
      timestamp: new Date(),
      metadata: { confidence: 1.0 }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user_message',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      await onSendMessage(userMessage.content, conversationId);
      
      // Simulate AI response for demo
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai_response',
          content: generateMockResponse(userMessage.content, userType),
          timestamp: new Date(),
          metadata: {
            confidence: 0.92,
            sources: ['HALOcalc', 'HALOfiling'],
            actions: ['view_report', 'export_data']
          }
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateMockResponse = (userInput: string, userType: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('payroll') && input.includes('run')) {
      return `I can help you run payroll! Based on your ${userType} permissions, I can:

• Calculate gross pay and deductions for all employees
• Generate ACH files for direct deposits  
• Create pay stubs and tax forms
• Update payroll registers

Would you like me to start the payroll run for this period? I'll need to verify the pay period dates first.`;
    }
    
    if (input.includes('tax') || input.includes('filing')) {
      return `For tax filing assistance, I can access HALOfiling to:

• Check current tax liabilities across federal, state, and local jurisdictions
• Prepare and submit quarterly reports (941, state unemployment)
• Generate year-end forms (W-2s, 1099s)
• Calculate estimated tax payments

Which specific tax forms or filings do you need help with?`;
    }
    
    if (input.includes('employee') && input.includes('add')) {
      return `I'll help you add a new employee to the system. I can auto-populate the onboarding forms based on your requirements:

• Gather basic employee information
• Set up payroll details (salary, deductions, tax withholdings)
• Configure benefits enrollment
• Generate I-9 and W-4 forms

Shall I start the employee onboarding workflow?`;
    }
    
    return `I understand you're asking about "${userInput}". Let me analyze this with HALOcalc and provide you with accurate payroll information. 

Based on your ${userType} access level, I can help with calculations, compliance checks, and administrative tasks. What specific aspect would you like me to focus on?`;
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    toast({
      title: "Feedback Recorded",
      description: `Thanks for your ${isPositive ? 'positive' : 'negative'} feedback!`,
    });
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`flex ${message.type === 'user_message' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user_message' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.type === 'user_message' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.type === 'ai_response'
                      ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.type === 'user_message' ? (
                      <User className="w-4 h-4" />
                    ) : message.type === 'ai_response' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`rounded-lg p-4 ${
                    message.type === 'user_message'
                      ? 'bg-primary text-primary-foreground'
                      : message.type === 'ai_response'
                      ? 'bg-muted border'
                      : 'bg-accent/20 border border-accent'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Message Metadata */}
                    {message.metadata && (
                      <div className="mt-3 space-y-2">
                        {message.metadata.confidence && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(message.metadata.confidence * 100)}% confident
                            </Badge>
                          </div>
                        )}
                        
                        {message.metadata.sources && (
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.sources.map((source, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        {message.type === 'ai_response' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleFeedback(message.id, true)}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleFeedback(message.id, false)}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted border rounded-lg p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask HALOassist about payroll, taxes, employees, or calculations..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || !conversationId}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !conversationId}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          HALOassist can access real-time data from HALOcalc, HALOfiling, HALOnet, and HALOvision
        </p>
      </div>
    </div>
  );
};