import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  user_id: string;
  user_type: 'client' | 'employee' | 'internal_ops';
  company_id?: string;
  topic: string;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  message_type: 'user_message' | 'ai_response' | 'system_message';
  content: string;
  metadata?: any;
  created_at: string;
}

interface StartConversationParams {
  userId: string;
  userType: 'client' | 'employee' | 'internal_ops';
  companyId?: string;
  topic: string;
}

export const useHALOassist = (
  userId?: string,
  userType: 'client' | 'employee' | 'internal_ops' = 'internal_ops',
  companyId?: string
) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startConversation = useCallback(async ({
    userId,
    userType,
    companyId,
    topic
  }: StartConversationParams): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      // Mock conversation for demo
      const mockConversation: Conversation = {
        id: `conv_${Date.now()}`,
        user_id: userId,
        user_type: userType,
        company_id: companyId,
        topic,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCurrentConversation(mockConversation);
      setConversations(prev => [mockConversation, ...prev]);
      
      return mockConversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendMessage = useCallback(async (
    content: string,
    conversationId: string
  ) => {
    try {
      setIsLoading(true);
      
      // Mock message handling for demo
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        conversation_id: conversationId,
        message_type: 'user_message',
        content,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      toast({
        title: "Message Sent",
        description: "HALOassist is processing your request",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    // Mock implementation
    setMessages([]);
  }, []);

  const getUserPreferences = useCallback(async () => {
    // Mock implementation
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    userPreferences: null,
    isLoading,
    startConversation,
    sendMessage,
    fetchMessages,
    getUserPreferences
  };
};