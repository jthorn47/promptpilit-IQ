import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIHelpAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIHelpAssistant = ({ open, onOpenChange }: AIHelpAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-help-assistant', {
        body: { message: input.trim() }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Help Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about EaseBase features and functionality!</p>
                <p className="text-sm mt-2">Try asking: "How do I create a new training module?"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Bot className="w-4 h-4" />
                    </div>
                    <Card className="max-w-[80%]">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about EaseBase features..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};