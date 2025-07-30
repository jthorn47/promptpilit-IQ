import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  HelpCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingContext: {
    moduleId: string;
    moduleName: string;
    topic: string;
    userRole?: string;
    currentSection?: string;
  };
  className?: string;
}

const COACH_GPT_PROMPT = `You are CoachGPT, a helpful AI training assistant. You help learners understand what they're learning by:

1. Explaining the concept clearly and concisely
2. Providing a real-world example that relates to their role and situation
3. Asking one thoughtful reflection question to help them apply the knowledge

Keep your responses focused, practical, and encouraging. Adapt your examples to the user's role when possible.`;

export const AIAssistantModal = ({ 
  isOpen, 
  onClose, 
  trainingContext,
  className = ""
}: AIAssistantModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when modal opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConversationId);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: `Hi! I'm CoachGPT, your AI training assistant for "${trainingContext.moduleName}". I'm here to help you understand the concepts, see real-world applications, and reflect on what you're learning. What would you like to explore?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, conversationId, trainingContext.moduleName]);

  const logQuestion = async (question: string, response: string) => {
    try {
      // TODO: Enable logging after migration is run
      console.log('AI Assistant interaction:', {
        conversationId,
        moduleId: trainingContext.moduleId,
        moduleName: trainingContext.moduleName,
        topic: trainingContext.topic,
        userRole: trainingContext.userRole,
        currentSection: trainingContext.currentSection,
        question,
        response
      });
    } catch (error) {
      console.error('Failed to log AI assistant interaction:', error);
    }
  };

  const loadContextualFAQs = async () => {
    try {
      const { data: faqs } = await supabase
        .from('module_faq_knowledge')
        .select('*')
        .eq('module_id', trainingContext.moduleId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      return faqs || [];
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      return [];
    }
  };

  const callAIAssistant = async (userMessage: string): Promise<string> => {
    try {
      // Load contextual FAQs for this module
      const faqs = await loadContextualFAQs();
      
      const faqContext = faqs.length > 0 
        ? `\n\nFrequently Asked Questions for this module:\n${faqs.map(faq => 
            `Q: ${faq.question}\nA: ${faq.answer}`
          ).join('\n\n')}`
        : '';

      const contextualPrompt = `${COACH_GPT_PROMPT}

Training Context:
- Module: ${trainingContext.moduleName}
- Topic: ${trainingContext.topic}
- User Role: ${trainingContext.userRole || 'Learner'}
- Current Section: ${trainingContext.currentSection || 'General'}
${faqContext}

User Question: ${userMessage}

Please respond according to the CoachGPT format: explain the concept, provide a real-world example relevant to their role, and ask one reflection question. If the question matches any of the FAQs above, incorporate that information in your response.`;

      const response = await fetch('/functions/v1/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw'}`,
        },
        body: JSON.stringify({
          prompt: contextualPrompt,
          conversation_id: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response || 'I apologize, but I couldn\'t generate a response right now. Please try again.';
    } catch (error) {
      console.error('AI Assistant API error:', error);
      return 'I\'m having trouble connecting right now. Please try again in a moment.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await callAIAssistant(userMessage.content);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Log the interaction
      await logQuestion(userMessage.content, aiResponse);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Can you explain this concept in simpler terms?",
    "How does this apply to my daily work?",
    "What are some common mistakes to avoid?",
    "Can you give me a practical example?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">CoachGPT Assistant</h3>
            <p className="text-xs text-muted-foreground">{trainingContext.moduleName}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Training Context */}
      <div className="p-3 bg-muted/30 border-b">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            {trainingContext.topic}
          </Badge>
          {trainingContext.userRole && (
            <Badge variant="outline" className="text-xs">
              {trainingContext.userRole}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">CoachGPT is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="p-3 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Suggested questions:
          </p>
          <div className="space-y-1">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-auto p-2 text-left"
                onClick={() => handleSuggestedQuestion(question)}
              >
                <HelpCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask CoachGPT about what you're learning..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};