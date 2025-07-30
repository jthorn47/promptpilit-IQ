import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  companyName: string;
  contactName: string;
  onSaveContent: (content: string) => void;
}

export const AIChatModal = ({ 
  isOpen, 
  onClose, 
  section, 
  companyName, 
  contactName, 
  onSaveContent 
}: AIChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Section titles for context
  const sectionTitles = {
    'current-state': 'Current State Analysis',
    'gaps-risks': 'Gaps and Risks Identified',
    'impact-inaction': 'Impact of Inaction',
    'path-forward': 'Path Forward',
    'custom-solution': 'Custom Solution',
    'investment-analysis': 'Investment Analysis'
  };

  // Initialize chat with context when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: `init-${section}`,
        role: 'assistant',
        content: `Hi! I'm here to help you create compelling content for the "${sectionTitles[section as keyof typeof sectionTitles]}" section of ${companyName}'s HR Blueprint.\n\nI can help you:\n• Generate initial content based on their HR assessment\n• Refine and customize the messaging\n• Adjust tone and focus areas\n• Create compelling sales-focused content\n\nWhat would you like me to create for this section?`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, section, companyName]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
      );

      try {
        console.log('Sending message to AI for section:', section);
        
        // Simplified prompt for testing
        const simplePrompt = `For the HR Blueprint section "${sectionTitles[section as keyof typeof sectionTitles]}", create professional content for ${companyName} based on this request: ${currentInput}. Keep it concise and sales-focused.`;
        
        console.log('Making API call with timeout protection');
        
        const apiCall = supabase.functions.invoke('generate-hr-blueprint', {
          body: {
            section: 'chat-assistant',
            prompt: simplePrompt,
            companyName,
            contactName,
            industry: 'Professional Services',
            companySize: 'Small Business',
            riskLevel: 'Medium',
            riskScore: 75,
            assessmentResponses: {
              payroll_frequency: 'bi-weekly',
              employee_count: '15-25'
            },
            aiReport: {
              summary: 'Medium risk identified'
            },
            companyEmail: 'info@company.com'
          }
        });

        const response = await Promise.race([apiCall, timeoutPromise]) as any;
      console.log('API response received:', response);

      if (response?.error) {
        console.error('API error:', response.error);
        throw new Error(response.error.message || 'AI service error');
      }

      let content = 'I apologize, but I received an invalid response. Please try again.';
      
      if (response?.data?.content) {
        content = response.data.content;
      } else if (typeof response?.data === 'string') {
        content = response.data;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      console.log('AI message added successfully');

    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      
      let errorMsg = 'I encountered an error. Please try again.';
      
      if (error.message.includes('timed out')) {
        errorMsg = 'The request timed out. Please try a shorter message.';
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Chat Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('Message sending completed, loading state reset');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSaveAndClose = () => {
    // Find the last assistant message to use as content
    const lastAssistantMessage = messages
      .filter(m => m.role === 'assistant')
      .pop();
    
    if (lastAssistantMessage && !lastAssistantMessage.id.startsWith('init')) {
      onSaveContent(lastAssistantMessage.content);
      toast({
        title: "Content Saved",
        description: "The AI-generated content has been saved to your tile.",
      });
    }
    onClose();
  };

  const resetChat = () => {
    const initialMessage: Message = {
      id: `init-${section}-${Date.now()}`,
      role: 'assistant',
      content: `Hi! I'm here to help you create compelling content for the "${sectionTitles[section as keyof typeof sectionTitles]}" section of ${companyName}'s HR Blueprint.\n\nWhat would you like me to create for this section?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setInputValue("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-slate-800 text-white border-slate-700" aria-describedby="ai-chat-description">
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 text-white hover:bg-slate-700"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-white pr-8">
            <Bot className="w-5 h-5 text-blue-400" />
            AI Chat Assistant - {sectionTitles[section as keyof typeof sectionTitles]}
          </DialogTitle>
          <div id="ai-chat-description" className="sr-only">
            Interactive AI chat to customize HR Blueprint content for your client
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4 border border-slate-600 rounded-lg bg-slate-900/50" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-700 text-slate-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to create, refine, or adjust the content..."
              disabled={isLoading}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetChat} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Start Over
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleSaveAndClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Content & Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};