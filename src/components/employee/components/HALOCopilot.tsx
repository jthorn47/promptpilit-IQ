import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  Brain,
  HelpCircle
} from 'lucide-react';
// Remove import as we'll use crypto.randomUUID() instead

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: any[];
  confidence?: number;
}

const HALOCopilot: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm HALO, your AI payroll assistant. I can help you understand your pay stub, taxes, benefits, and answer any payroll-related questions. What would you like to know?",
      timestamp: new Date(),
      confidence: 1.0
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversationHistory } = useQuery({
    queryKey: ['copilot-history', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_copilot_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const askHALOMutation = useMutation({
    mutationFn: async (userQuestion: string) => {
      // TODO: Replace with actual AI API call
      const mockResponse = await new Promise<string>((resolve) => {
        setTimeout(() => {
          if (userQuestion.toLowerCase().includes('fica')) {
            resolve("FICA stands for Federal Insurance Contributions Act. It includes Social Security (6.2% up to the wage base) and Medicare (1.45% on all wages) taxes. These are matched by your employer, so you and your employer each pay the same amount.");
          } else if (userQuestion.toLowerCase().includes('pay') && userQuestion.toLowerCase().includes('less')) {
            resolve("There are several reasons your paycheck might be less than expected: overtime vs regular hours, pre-tax deductions (like health insurance or 401k), tax withholding changes, or missing hours. I can help you compare your current pay stub with previous ones to identify the difference.");
          } else if (userQuestion.toLowerCase().includes('w-4')) {
            resolve("You can update your W-4 tax withholding through your HR department or payroll system. Changes typically take effect on the next payroll cycle. Would you like me to explain how different W-4 settings affect your take-home pay?");
          } else {
            resolve("I'd be happy to help you with that! Could you provide more specific details about your question? I have access to your pay history, tax documents, and can explain any payroll concepts you'd like to understand better.");
          }
        }, 1500);
      });

      // Save conversation to database
      const { error } = await supabase
        .from('employee_copilot_conversations')
        .insert({
          session_id: sessionId,
          employee_id: 'temp-employee-id', // TODO: Get from auth context
          question: userQuestion,
          answer: mockResponse,
          confidence_score: 0.95,
          sources: ['pay_stub_data', 'tax_regulations']
        });

      if (error) console.error('Error saving conversation:', error);

      return mockResponse;
    },
    onSuccess: (response, userQuestion) => {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: response,
          timestamp: new Date(),
          confidence: 0.95,
          sources: ['Pay Stub Data', 'Tax Regulations']
        }
      ]);
      queryClient.invalidateQueries({ queryKey: ['copilot-history'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    askHALOMutation.mutate(question);
    setQuestion('');
  };

  const suggestedQuestions = [
    "Why was my check less this week?",
    "What's FICA and why do I pay it?",
    "Can I change my W-4?",
    "How do I read my pay stub?",
    "What are my year-to-date earnings?",
    "Why are my taxes different each pay period?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Copilot (Mini HALO)
          </h2>
          <p className="text-muted-foreground">Ask natural questions about your payroll</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 border-primary/20">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suggested Questions */}
        <Card className="lg:col-span-1 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Quick Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQuestions.map((q, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left justify-start h-auto p-3 hover-scale"
                onClick={() => setQuestion(q)}
              >
                <div className="text-sm">{q}</div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat with HALO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-96 w-full rounded border p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.confidence && message.type === 'assistant' && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {(message.confidence * 100).toFixed(0)}% confident
                            </Badge>
                            {message.sources && (
                              <div className="text-xs text-muted-foreground">
                                Sources: {message.sources.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground px-3">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {message.type === 'assistant' && (
                        <div className="flex gap-1 mt-2 px-3">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 order-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {askHALOMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="text-sm text-muted-foreground ml-2">HALO is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything about your payroll..."
                disabled={askHALOMutation.isPending}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!question.trim() || askHALOMutation.isPending}
                className="hover-scale"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HALOCopilot;