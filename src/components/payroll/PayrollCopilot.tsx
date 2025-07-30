import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Bot, 
  User,
  Sparkles,
  ChevronDown,
  HelpCircle,
  Settings,
  AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePayrollCopilotAnalytics } from './PayrollCopilotAnalytics';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: string;
  feedback?: 'positive' | 'negative';
}

interface PayrollCopilotProps {
  isFloating?: boolean;
  onClose?: () => void;
  currentRoute?: string;
}

const SUGGESTED_PROMPTS = {
  'Q&A': [
    "What's the status of this month's payroll?",
    "Show me pending employee exceptions",
    "Explain the latest tax calculation changes",
    "How many employees are in the current pay run?"
  ],
  'Task Guidance': [
    "Walk me through running payroll",
    "How do I add a bonus payment?",
    "Guide me through tax filing setup",
    "Help me generate pay stubs"
  ],
  'Troubleshooting': [
    "Why is this employee's tax calculation wrong?",
    "Fix missing hours for John Doe",
    "Resolve ACH batch errors",
    "Debug failed payroll run"
  ]
};

export const PayrollCopilot: React.FC<PayrollCopilotProps> = ({
  isFloating = false,
  onClose,
  currentRoute = '/payroll'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'Q&A' | 'Task Guidance' | 'Troubleshooting'>('Q&A');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { trackQuery, trackFeedback, trackModeChange, trackSuggestionUsed } = usePayrollCopilotAnalytics();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hi! I'm your Smart Payroll Assistant. I can help you with payroll questions, guide you through tasks, and troubleshoot issues. Currently in ${assistantMode} mode.`,
        timestamp: new Date(),
        mode: assistantMode
      }]);
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      mode: assistantMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Track the query
    trackQuery(content.trim(), assistantMode);

    try {
      // Call the edge function
      const response = await fetch('/api/payroll-copilot-intent-parser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          mode: assistantMode,
          context: {
            currentRoute,
            userId: 'current-user-id', // This would come from auth context
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || "I'm processing your request. This feature is still in development.",
        timestamp: new Date(),
        mode: assistantMode
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling copilot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm experiencing some technical difficulties. Please try again or contact support.",
        timestamp: new Date(),
        mode: assistantMode
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    const message = messages.find(m => m.id === messageId);
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    
    // Track feedback
    if (message && message.type === 'user') {
      trackFeedback(feedback, message.content);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    trackSuggestionUsed(prompt, assistantMode);
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Task Guidance': return <Settings className="h-4 w-4" />;
      case 'Troubleshooting': return <AlertTriangle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${isFloating ? 'w-96 max-h-[600px]' : 'w-full max-w-4xl mx-auto'} flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Smart Payroll Assistant
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Beta
            </Badge>
          </CardTitle>
          {isFloating && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Select value={assistantMode} onValueChange={(value: any) => setAssistantMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q&A">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Q&A
                </div>
              </SelectItem>
              <SelectItem value="Task Guidance">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Task Guidance
                </div>
              </SelectItem>
              <SelectItem value="Troubleshooting">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Troubleshooting
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS[assistantMode].map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1 px-2"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea 
          className="flex-1 h-80 pr-4" 
          ref={scrollAreaRef}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.type === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                        <div className="flex items-center gap-1">
                          {getModeIcon(message.mode)}
                          <span className="text-xs text-muted-foreground">{message.mode}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${message.feedback === 'positive' ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                            onClick={() => handleFeedback(message.id, 'positive')}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${message.feedback === 'negative' ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'}`}
                            onClick={() => handleFeedback(message.id, 'negative')}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask me about payroll (${assistantMode} mode)...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};