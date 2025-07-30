import { useState, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, MessageCircle, Phone, User, Building2, Clock, Filter, Search, Brain, RefreshCw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SMSCase {
  id: string;
  issue_category: string;
  description?: string;
  last_message?: string;
  wants_hr: boolean;
  status: string;
  created_at: string;
  ai_summary?: string;
  ai_suggested_action?: string;
  ai_confidence_score?: number;
  ai_processed_at?: string;
  employee_name?: string;
  client_name?: string;
  phone_number?: string;
  clients?: {
    company_name: string;
  };
  employees?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  sms_conversations?: {
    phone_number: string;
    conversation_step: string;
    last_message_at: string;
    conversation_data: any;
  }[];
}

export const SMSCasesDashboardPage = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [hrFilter, setHrFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: smsCases, isLoading, refetch } = useSupabaseQuery(
    'sms_cases_dashboard',
    async () => {
      const { data, error } = await supabase
        .from('sms_cases')
        .select(`
          *,
          clients:client_id(company_name),
          employees:employee_id(first_name, last_name, phone_number),
          sms_conversations!sms_conversations_case_id_fkey(
            phone_number,
            conversation_step,
            last_message_at,
            conversation_data
          )
        `)
        .order('created_at', { ascending: false });
      
      return { data, error };
    }
  );

  // Get unique values for filters
  const uniqueCategories = useMemo(() => {
    if (!smsCases) return [];
    return [...new Set(smsCases.map((c: any) => c.issue_category))].filter(Boolean);
  }, [smsCases]);

  const uniqueClients = useMemo(() => {
    if (!smsCases) return [];
    return [...new Set(smsCases.map((c: any) => c.client_name || c.clients?.company_name))].filter(Boolean);
  }, [smsCases]);

  // Filter cases
  const filteredCases = useMemo(() => {
    if (!smsCases) return [];
    
    return smsCases.filter((case_: any) => {
      const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || case_.issue_category === categoryFilter;
      const matchesClient = clientFilter === 'all' || case_.clients?.company_name === clientFilter;
      const matchesHR = hrFilter === 'all' || (hrFilter === 'true' && case_.wants_hr) || (hrFilter === 'false' && !case_.wants_hr);
      
      const searchableText = `
        ${case_.employees?.first_name || case_.employee_name} ${case_.employees?.last_name}
        ${case_.clients?.company_name || case_.client_name}
        ${case_.employees?.phone_number || case_.phone_number}
        ${case_.issue_category}
        ${case_.description || case_.last_message}
      `.toLowerCase();
      
      const matchesSearch = searchTerm === '' || searchableText.includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCategory && matchesClient && matchesHR && matchesSearch;
    });
  }, [smsCases, statusFilter, categoryFilter, clientFilter, hrFilter, searchTerm]);

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sms_cases')
        .update({ status: newStatus })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Case Updated",
        description: `Case status updated to ${newStatus}`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive",
      });
    }
  };

  const handleRefreshAI = async (caseId: string, case_: SMSCase) => {
    try {
      const { error } = await supabase.functions.invoke('ai-case-analysis', {
        body: {
          caseId: caseId,
          description: case_.description || case_.last_message,
          issueCategory: case_.issue_category,
          wantsHr: case_.wants_hr,
          employeeName: case_.employee_name || `${case_.employees?.first_name} ${case_.employees?.last_name}`,
          clientName: case_.client_name || case_.clients?.company_name
        }
      });

      if (error) throw error;

      toast({
        title: "AI Analysis Refreshed",
        description: "Case summary and action recommendations updated",
      });

      refetch();
    } catch (error) {
      console.error('Error refreshing AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to refresh AI analysis",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'submitted': 'secondary',
      'open': 'default',
      'in_progress': 'secondary',
      'closed': 'outline',
      'escalated': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getCurrentStep = (case_: SMSCase) => {
    if (case_.sms_conversations && case_.sms_conversations.length > 0) {
      return case_.sms_conversations[0].conversation_step || 'completed';
    }
    return 'completed';
  };

  const getLastMessage = (case_: SMSCase) => {
    if (case_.sms_conversations && case_.sms_conversations.length > 0) {
      return new Date(case_.sms_conversations[0].last_message_at).toLocaleString();
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">SMS Cases Dashboard</h1>
          <p className="text-muted-foreground">Manage SMS-based case submissions</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Cases Dashboard</h1>
          <p className="text-muted-foreground">Manage SMS-based case submissions</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            SMS Cases ({filteredCases.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {uniqueClients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={hrFilter} onValueChange={setHrFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="HR Help" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="true">HR Requested</SelectItem>
                <SelectItem value="false">No HR Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HR Help</TableHead>
                  <TableHead>AI Summary</TableHead>
                  <TableHead>Suggested Action</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No SMS cases found matching your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((case_: any) => (
                    <TableRow key={case_.id}>
                      <TableCell className="font-mono">
                        {case_.employees?.phone_number || case_.phone_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {case_.employee_name || `${case_.employees?.first_name} ${case_.employees?.last_name}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {case_.client_name || case_.clients?.company_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{case_.issue_category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(case_.status)}</TableCell>
                      <TableCell>
                        {case_.wants_hr ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <AlertCircle className="h-3 w-3" />
                            YES
                          </Badge>
                        ) : (
                          <Badge variant="secondary">NO</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {case_.ai_summary ? (
                          <div className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground line-clamp-2">{case_.ai_summary}</p>
                              {case_.ai_confidence_score && (
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-amber-500" />
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(case_.ai_confidence_score * 100)}% confidence
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">AI analysis pending...</div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {case_.ai_suggested_action ? (
                          <div className="flex items-start gap-2">
                            <div className="space-y-1">
                              <p className="text-sm font-medium line-clamp-2">{case_.ai_suggested_action}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefreshAI(case_.id, case_)}
                                className="h-6 px-2 text-xs"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Refresh
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshAI(case_.id, case_)}
                            className="text-xs"
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            Analyze
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(case_.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={case_.status} 
                          onValueChange={(value) => handleStatusUpdate(case_.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};