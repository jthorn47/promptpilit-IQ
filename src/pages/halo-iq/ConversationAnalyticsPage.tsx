import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Clock, 
  AlertTriangle,
  User,
  Building,
  Phone,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SMSConversation {
  id: string;
  phone_number: string;
  employee_name: string | null;
  client_name: string | null;
  current_step: string;
  last_message: string | null;
  last_updated_at: string;
  case_id: string | null;
  conversation_data: any;
  error_flagged: boolean;
  is_active: boolean;
  timeout_count: number;
  created_at: string;
}

export const ConversationAnalyticsPage = () => {
  const { toast } = useToast();
  const [stepFilter, setStepFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sms_conversations'
        },
        (payload) => {
          console.log('Real-time conversation update:', payload);
          setRefreshKey(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['sms_conversations', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_conversations')
        .select('*')
        .order('last_updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform database response to match SMSConversation interface
      return data?.map(item => ({
        id: item.id,
        phone_number: item.phone_number,
        employee_name: null, // Will be populated from conversation_data if available
        client_name: null, // Will be populated from conversation_data if available
        current_step: item.current_step,
        last_message: null, // Will be populated from conversation_data if available
        last_updated_at: item.last_updated_at,
        case_id: item.case_id,
        conversation_data: item.conversation_data,
        error_flagged: item.error_flagged,
        is_active: item.is_active,
        timeout_count: item.timeout_count,
        created_at: item.created_at
      })) || [];
    }
  });

  const { data: analytics } = useQuery({
    queryKey: ['conversation_analytics', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_conversations')
        .select('current_step, is_active, error_flagged, timeout_count, created_at');
      
      if (error) throw error;

      const totalConversations = data.length;
      const activeConversations = data.filter(c => c.is_active).length;
      const flaggedConversations = data.filter(c => c.error_flagged).length;
      const timedOutConversations = data.filter(c => c.timeout_count > 0).length;

      const stepDistribution = data.reduce((acc, conv) => {
        acc[conv.current_step] = (acc[conv.current_step] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const today = new Date();
      const todayConversations = data.filter(c => 
        new Date(c.created_at).toDateString() === today.toDateString()
      ).length;

      return {
        totalConversations,
        activeConversations,
        flaggedConversations,
        timedOutConversations,
        stepDistribution,
        todayConversations
      };
    }
  });

  const filteredConversations = conversations?.filter(conv => {
    const matchesStep = stepFilter === 'all' || conv.current_step === stepFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && conv.is_active) ||
      (statusFilter === 'inactive' && !conv.is_active) ||
      (statusFilter === 'flagged' && conv.error_flagged);
    const matchesSearch = searchQuery === '' ||
      conv.phone_number.includes(searchQuery) ||
      conv.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.client_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStep && matchesStatus && matchesSearch;
  }) || [];

  const getStepColor = (step: string) => {
    const colors = {
      'initial_contact': 'bg-blue-100 text-blue-800',
      'returning_user': 'bg-green-100 text-green-800',
      'awaiting_name': 'bg-yellow-100 text-yellow-800',
      'awaiting_client': 'bg-orange-100 text-orange-800',
      'awaiting_issue': 'bg-purple-100 text-purple-800',
      'case_update_or_new': 'bg-indigo-100 text-indigo-800',
      'complete': 'bg-gray-100 text-gray-800'
    };
    return colors[step as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStepLabel = (step: string) => {
    const labels = {
      'initial_contact': 'Initial Contact',
      'returning_user': 'Returning User',
      'awaiting_name': 'Awaiting Name',
      'awaiting_client': 'Awaiting Client',
      'awaiting_issue': 'Awaiting Issue',
      'case_update_or_new': 'Case Update/New',
      'complete': 'Complete'
    };
    return labels[step as keyof typeof labels] || step;
  };

  return (
    <StandardPageLayout
      title="Conversation Analytics"
      subtitle="HALI's Conversational Memory & Smart Flow Analytics"
      badge="Analytics"
      onRefresh={refetch}
      isRefreshing={isLoading}
    >
      <div className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{analytics?.totalConversations || 0}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold text-green-600">{analytics?.activeConversations || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Flagged Issues</p>
                  <p className="text-2xl font-bold text-red-600">{analytics?.flaggedConversations || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Count</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics?.todayConversations || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Distribution */}
        {analytics?.stepDistribution && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Conversation Flow Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(analytics.stepDistribution).map(([step, count]) => (
                  <div key={step} className="text-center">
                    <Badge className={getStepColor(step)} variant="outline">
                      {getStepLabel(step)}
                    </Badge>
                    <p className="text-2xl font-bold mt-2">{count as number}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search by phone, name, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Conversation Step</label>
                <Select value={stepFilter} onValueChange={setStepFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Steps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Steps</SelectItem>
                    <SelectItem value="initial_contact">Initial Contact</SelectItem>
                    <SelectItem value="returning_user">Returning User</SelectItem>
                    <SelectItem value="awaiting_name">Awaiting Name</SelectItem>
                    <SelectItem value="awaiting_client">Awaiting Client</SelectItem>
                    <SelectItem value="awaiting_issue">Awaiting Issue</SelectItem>
                    <SelectItem value="case_update_or_new">Case Update/New</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations ({filteredConversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`border rounded-lg p-4 space-y-3 ${
                      conversation.error_flagged ? 'border-red-200 bg-red-50' :
                      conversation.is_active ? 'border-green-200 bg-green-50' :
                      'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStepColor(conversation.current_step)} variant="outline">
                            {getStepLabel(conversation.current_step)}
                          </Badge>
                          {conversation.error_flagged && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              FLAGGED
                            </Badge>
                          )}
                          {conversation.is_active && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              ACTIVE
                            </Badge>
                          )}
                          {conversation.timeout_count > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Timeout: {conversation.timeout_count}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{conversation.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{conversation.employee_name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{conversation.client_name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(conversation.last_updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {conversation.conversation_data && typeof conversation.conversation_data === 'object' && 'intent_category' in conversation.conversation_data && (
                          <div className="text-sm text-muted-foreground">
                            Intent: <span className="font-medium">{String(conversation.conversation_data.intent_category)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <p>ID: {conversation.id.substring(0, 8)}</p>
                        {conversation.case_id && (
                          <p>Case: {conversation.case_id.substring(0, 8)}</p>
                        )}
                      </div>
                    </div>
                    
                    {conversation.last_message && (
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-sm font-medium mb-1">Last Message:</p>
                        <p className="text-sm">{conversation.last_message}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};