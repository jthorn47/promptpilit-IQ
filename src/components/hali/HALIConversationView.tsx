import { useState } from 'react';
import { StartConversationModal } from './StartConversationModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  User, 
  Building, 
  Clock, 
  Send, 
  FileUp, 
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Filter,
  FolderOpen,
  Archive,
  TrendingUp,
  UserCheck,
  Eye
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VaultFileModal } from './VaultFileModal';

interface SMSMessage {
  id: string;
  phone_number: string;
  message_body: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status: string;
}

interface ConversationThread {
  id: string;
  phone_number: string;
  employee_name: string | null;
  client_name: string | null;
  issue_category: string;
  status: string;
  wants_hr: boolean;
  pulse_case_id?: string;
  created_at: string;
  last_message?: string;
  messages: SMSMessage[];
}

export const HALIConversationView = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showStartConversation, setShowStartConversation] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [showVaultFiles, setShowVaultFiles] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['hali_conversations', searchQuery],
    queryFn: async () => {
      // First get conversations
      let convQuery = supabase
        .from('sms_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        convQuery = convQuery.or(`phone_number.ilike.%${searchQuery}%`);
      }

      const { data: conversations, error: convError } = await convQuery;
      if (convError) throw convError;

      // Then get all messages for these conversations
      const conversationIds = conversations?.map(c => c.id) || [];
      const { data: messages, error: msgError } = await supabase
        .from('sms_logs')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      // Transform to match expected interface and attach real messages
      return conversations?.map(conv => {
        const convData = typeof conv.conversation_data === 'object' && conv.conversation_data !== null ? conv.conversation_data as any : {};
        const convMessages = messages?.filter(m => m.conversation_id === conv.id) || [];
        
        return {
          id: conv.id,
          phone_number: conv.phone_number,
          employee_name: convData.employee_name || 'Unknown',
          client_name: convData.client_name || 'Unknown', 
          issue_category: convData.issue_category || 'General',
          status: conv.is_active ? 'active' : 'closed',
          wants_hr: convData.wants_hr || false,
          pulse_case_id: conv.case_id,
          created_at: conv.created_at,
          last_message: convMessages.length > 0 ? convMessages[convMessages.length - 1].message_body : '',
          messages: convMessages.map((log: any) => ({
            id: log.id,
            phone_number: log.phone_number,
            message_body: log.message_body,
            direction: log.direction,
            timestamp: log.created_at,
            status: log.status
          }))
        };
      }) as ConversationThread[];
    }
  });

  const sendReply = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string, message: string }) => {
      console.log('🚀 Starting SMS reply send:', { conversationId, message });
      
      try {
        const { data, error } = await supabase.functions.invoke('send-sms-reply', {
          body: { conversationId, message }
        });

        console.log('📡 Supabase function response:', { data, error });

        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(error.message || 'Failed to send SMS reply');
        }

        console.log('✅ SMS reply sent successfully:', data);
        return data;
      } catch (err) {
        console.error('❌ Send reply error:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Reply mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['hali_conversations'] });
      setReplyMessage('');
      toast({
        title: "Message Sent",
        description: "Your reply has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Reply mutation error:', error);
      toast({
        title: "Send Failed", 
        description: `Failed to send message: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const selectedConv = conversations?.find(c => c.id === selectedConversation);

  const filteredConversations = conversations?.filter(conv => {
    if (activeFilter === 'open') return conv.status === 'active';
    if (activeFilter === 'resolved') return conv.status === 'closed';
    if (activeFilter === 'escalated') return conv.wants_hr;
    if (activeFilter === 'anonymous') return !conv.employee_name || conv.employee_name === 'Unknown';
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              HALI Conversations
            </CardTitle>
            <Button onClick={() => setShowStartConversation(true)}>
              <Send className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabbed Filter View */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Conversations</TabsTrigger>
              <TabsTrigger value="open">Open Cases</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="escalated">Escalated</TabsTrigger>
              <TabsTrigger value="anonymous">Anonymous</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Advanced Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone, employee name, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clients</SelectItem>
                <SelectItem value="acme-corp">Acme Corp</SelectItem>
                <SelectItem value="tech-startup">Tech Startup</SelectItem>
                <SelectItem value="manufacturing-co">Manufacturing Co</SelectItem>
              </SelectContent>
            </Select>
            <Select value={keywordFilter} onValueChange={setKeywordFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="HR">HR Issues</SelectItem>
                <SelectItem value="Payroll">Payroll</SelectItem>
                <SelectItem value="Benefits">Benefits</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-2xl font-bold">{conversations?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Conversations</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{conversations?.filter(c => c.status === 'active').length || 0}</div>
              <div className="text-sm text-muted-foreground">Active Cases</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{conversations?.filter(c => c.wants_hr).length || 0}</div>
              <div className="text-sm text-muted-foreground">HR Escalations</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{conversations?.filter(c => c.status === 'closed').length || 0}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              Conversations ({filteredConversations?.length || 0})
              {activeFilter !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilter}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations?.length ? (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{conv.phone_number}</span>
                        </div>
                        <div className="flex gap-1">
                          {conv.wants_hr && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              HR
                            </Badge>
                          )}
                          <Badge variant={conv.status === 'closed' ? 'secondary' : 'default'} className="text-xs">
                            {conv.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {conv.employee_name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {conv.client_name || 'Unknown'}
                        </div>
                      </div>

                      <div className="text-sm">
                        <Badge variant="outline">{conv.issue_category}</Badge>
                      </div>

                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                        {conv.pulse_case_id && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Case
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations found</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conversation Detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedConv ? `Conversation: ${selectedConv.phone_number}` : 'Select a conversation'}
              </span>
              {selectedConv?.pulse_case_id && (
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Pulse Case
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConv ? (
              <div className="space-y-4">
                {/* Conversation Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Employee</p>
                    <p className="text-sm text-muted-foreground">{selectedConv.employee_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-sm text-muted-foreground">{selectedConv.client_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Issue Type</p>
                    <Badge variant="outline">{selectedConv.issue_category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={selectedConv.status === 'closed' ? 'secondary' : 'default'}>
                      {selectedConv.status}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {selectedConv.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.direction === 'outbound'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message_body}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                            {message.direction === 'outbound' && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply Section */}
                {selectedConv.status !== 'closed' && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="flex-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowVaultFiles(true)}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Send Vault File
                      </Button>
                      <Button
                        onClick={() => sendReply.mutate({ conversationId: selectedConv.id, message: replyMessage })}
                        disabled={!replyMessage.trim() || sendReply.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendReply.isPending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Conversation Modal */}
      <StartConversationModal
        isOpen={showStartConversation}
        onClose={() => setShowStartConversation(false)}
      />

      {/* Vault File Modal */}
      <VaultFileModal
        isOpen={showVaultFiles}
        onClose={() => setShowVaultFiles(false)}
        onFileSelect={(file) => {
          console.log('File selected:', file);
          queryClient.invalidateQueries({ queryKey: ['hali_conversations'] });
        }}
        conversationId={selectedConv?.id}
      />
    </div>
  );
};