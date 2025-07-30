import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleFormField, AccessibleTextareaField, AccessibleSelectField } from '@/components/AccessibleForm';
import { MessageCircle, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  subject: string;
  message: string;
  priority: string;
  is_resolved: boolean;
  sent_by: string;
  sent_to_role: string;
  created_at: string;
  is_read: boolean;
}

interface MessageCenterProps {
  sessionId: string;
  currentSectionId?: string;
  userRole: 'client_admin' | 'onboarding_manager';
  onClose: () => void;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({
  sessionId,
  currentSectionId,
  userRole,
  onClose
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    section_id: currentSectionId || ''
  });

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    loadMessages();
  }, [sessionId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('peo_onboarding_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('peo_onboarding_messages')
        .insert({
          session_id: sessionId,
          section_id: newMessage.section_id || null,
          subject: newMessage.subject,
          message: newMessage.message,
          priority: newMessage.priority,
          sent_to_role: userRole === 'client_admin' ? 'onboarding_manager' : 'client_admin'
        });

      if (error) throw error;

      setNewMessage({
        subject: '',
        message: '',
        priority: 'normal',
        section_id: currentSectionId || ''
      });
      setShowNewMessage(false);
      loadMessages();

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error Sending Message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('peo_onboarding_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  };

  const resolveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('peo_onboarding_messages')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
      setSelectedMessage(null);

      toast({
        title: "Message Resolved",
        description: "Message has been marked as resolved."
      });
    } catch (error: any) {
      toast({
        title: "Error Resolving Message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Message Center</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Message List */}
          <div className="col-span-1 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Messages ({messages.length})</h3>
              <Button
                size="sm"
                onClick={() => setShowNewMessage(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'border-primary' : ''
                  } ${!message.is_read ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.is_read) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{message.subject}</h4>
                      {message.is_resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {message.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(message.priority)}`}
                      >
                        {message.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message Details / New Message Form */}
          <div className="col-span-2">
            {showNewMessage ? (
              <Card>
                <CardHeader>
                  <CardTitle>New Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AccessibleFormField
                    label="Subject"
                    name="subject"
                    value={newMessage.subject}
                    onChange={(value) => setNewMessage({ ...newMessage, subject: value })}
                    placeholder="Enter message subject"
                    required
                  />

                  <AccessibleSelectField
                    label="Priority"
                    name="priority"
                    value={newMessage.priority}
                    onChange={(value) => setNewMessage({ ...newMessage, priority: value })}
                    options={priorityOptions}
                  />

                  <AccessibleTextareaField
                    label="Message"
                    name="message"
                    value={newMessage.message}
                    onChange={(value) => setNewMessage({ ...newMessage, message: value })}
                    placeholder="Enter your message..."
                    rows={6}
                    required
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewMessage(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge
                          variant="outline"
                          className={getPriorityColor(selectedMessage.priority)}
                        >
                          {selectedMessage.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(selectedMessage.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {!selectedMessage.is_resolved && (
                      <Button
                        size="sm"
                        onClick={() => resolveMessage(selectedMessage.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  {selectedMessage.is_resolved && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">This message has been resolved</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to view details</p>
                  <p className="text-sm">or create a new message</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};