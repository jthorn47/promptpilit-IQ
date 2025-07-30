import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bot, 
  Send, 
  Lightbulb, 
  TrendingUp,
  Calculator,
  Shield,
  Clock,
  User,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

interface HALOCopilotProps {
  companyId?: string;
  context?: Record<string, any>;
  className?: string;
}

export const HALOCopilot: React.FC<HALOCopilotProps> = ({ 
  companyId, 
  context = {},
  className = ""
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm HALO Copilot, your AI payroll assistant. I can help you with payroll calculations, tax compliance, forecasting, and answer questions like:\n\n• \"Why is net pay down this period?\"\n• \"What's our projected Q3 payroll?\"\n• \"Who's nearing overtime thresholds?\"\n\nWhat would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { icon: Calculator, text: "Explain last payroll calculation", category: "calculations" },
    { icon: TrendingUp, text: "Show payroll forecast", category: "forecasting" },
    { icon: Shield, text: "Check compliance status", category: "compliance" },
    { icon: Clock, text: "Who's nearing overtime?", category: "monitoring" }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    const typingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date().toISOString(),
      isTyping: true
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('halo-copilot', {
        body: {
          question,
          companyId: companyId || user?.id,
          context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: data.answer || data.fallback || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => prev.slice(0, -1).concat(assistantMessage));

    } catch (error) {
      console.error('HALO Copilot error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I'm experiencing technical difficulties. Please try again or contact support if the issue persists.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
      toast.error("Failed to get response from HALO Copilot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Card className={`flex flex-col h-96 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          HALO Copilot
          <Badge variant="secondary" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuestion(q.text)}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <q.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{q.text}</span>
              <span className="sm:hidden">{q.category}</span>
            </Button>
          ))}
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm">
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-pulse">●</div>
                        <div className="animate-pulse delay-100">●</div>
                        <div className="animate-pulse delay-200">●</div>
                      </div>
                    ) : (
                      formatMessage(message.content)
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask HALO anything about payroll..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage(inputValue)} 
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