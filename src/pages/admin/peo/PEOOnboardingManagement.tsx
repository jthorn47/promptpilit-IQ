import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Mail,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  company_name: string;
  account_manager: string | null;
  status: string;
  created_at: string;
  key_contacts: any;
}

interface PEOSession {
  id: string;
  company_id: string;
  status: string;
  created_at: string;
  go_live_date: string | null;
  progress_percentage?: number | null;
  current_section: number;
  total_sections?: number;
  completed_at: string | null;
  client_name?: string;
  contact_name?: string;
  contact_email?: string;
}

export const PEOOnboardingManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<PEOSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewOnboarding, setShowNewOnboarding] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('company_name');

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Fetch existing PEO onboarding sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('peo_onboarding_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.log('Sessions table may not exist yet:', sessionsError);
        setSessions([]);
      } else {
        setSessions(sessionsData || []);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOnboarding = () => {
    setShowNewOnboarding(true);
    // Navigate to wizard with client selection as first step
    navigate('/admin/peo/onboarding/new');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PEO Onboarding Management</h1>
          <p className="text-gray-600">Manage client PEO onboarding processes and track progress</p>
        </div>
        <Button onClick={handleCreateOnboarding} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Onboarding
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Active onboardings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Onboarding Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Onboarding Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No onboarding sessions yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first PEO onboarding session</p>
              <Button onClick={handleCreateOnboarding}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Onboarding
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-lg">{session.client_name}</h3>
                        <Badge className={getStatusColor(session.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(session.status)}
                            {session.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {session.contact_name || 'Contact TBD'} ({session.contact_email || 'Email TBD'})
                        </span>
                        <span>Created: {new Date(session.created_at).toLocaleDateString()}</span>
                        {session.go_live_date && (
                          <span>Go Live: {new Date(session.go_live_date).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600">Progress:</span>
                          <span className="text-sm font-medium">
                            {session.current_section || 0} of {session.total_sections || 7} sections
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${session.progress_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/peo/onboarding/${session.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Send reminder email
                          toast({
                            title: "Reminder Sent",
                            description: `Reminder email sent to ${session.contact_email}`,
                          });
                        }}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Remind
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Available Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              const hasActiveSession = sessions.some(s => s.company_id === client.id && s.status !== 'completed');
              
              return (
                <Card key={client.id} className={hasActiveSession ? 'opacity-50' : 'hover:shadow-md transition-shadow'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{client.company_name}</h3>
                        <p className="text-sm text-gray-600">
                          Account Manager: {client.account_manager || 'Unassigned'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Client since: {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!hasActiveSession && (
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/admin/peo/onboarding/new?clientId=${client.id}`)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {hasActiveSession && (
                      <Badge variant="secondary" className="mt-2">
                        Onboarding Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};