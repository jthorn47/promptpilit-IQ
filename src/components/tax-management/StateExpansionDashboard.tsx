import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Clock, Users, TrendingUp, MapPin } from "lucide-react";

interface SupportedState {
  id: string;
  state_code: string;
  state_name: string;
  is_supported: boolean;
  support_priority: string;
  employee_count: number;
  last_employee_added: string | null;
  tax_tables_implemented: boolean;
  implementation_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpansionRequest {
  id: string;
  state_code: string;
  state_name: string;
  employee_id: string | null;
  employee_name: string | null;
  request_reason: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  estimated_completion: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function StateExpansionDashboard() {
  const [supportedStates, setSupportedStates] = useState<SupportedState[]>([]);
  const [expansionRequests, setExpansionRequests] = useState<ExpansionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch supported states
      const { data: statesData, error: statesError } = await supabase
        .from('supported_tax_states')
        .select('*')
        .order('employee_count', { ascending: false });

      if (statesError) throw statesError;

      // Fetch expansion requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('state_expansion_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      setSupportedStates(statesData || []);
      setExpansionRequests(requestsData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('state_expansion_requests')
        .update({ 
          status,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const markStateAsSupported = async (stateCode: string) => {
    try {
      const { error } = await supabase
        .from('supported_tax_states')
        .update({ 
          is_supported: true,
          tax_tables_implemented: true,
          implementation_notes: 'Tax tables implemented and tested',
          updated_at: new Date().toISOString()
        })
        .eq('state_code', stateCode);

      if (error) throw error;
      fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Error loading state expansion data: {error}</AlertDescription>
      </Alert>
    );
  }

  const unsupportedStates = supportedStates.filter(s => !s.is_supported && s.employee_count > 0);
  const supportedCount = supportedStates.filter(s => s.is_supported).length;
  const pendingRequests = expansionRequests.filter(r => r.status === 'pending').length;
  const totalEmployeesUnsupported = unsupportedStates.reduce((sum, state) => sum + state.employee_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">State Tax Expansion</h1>
          <p className="text-muted-foreground">
            Monitor and manage tax table support across states
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supported States</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportedCount}</div>
            <p className="text-xs text-muted-foreground">
              Tax tables implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              States needing implementation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsupported States</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unsupportedStates.length}</div>
            <p className="text-xs text-muted-foreground">
              States with employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployeesUnsupported}</div>
            <p className="text-xs text-muted-foreground">
              In unsupported states
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unsupported" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unsupported">Unsupported States</TabsTrigger>
          <TabsTrigger value="requests">Expansion Requests</TabsTrigger>
          <TabsTrigger value="supported">Supported States</TabsTrigger>
        </TabsList>

        <TabsContent value="unsupported" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                States Needing Tax Support
              </CardTitle>
              <CardDescription>
                States with employees that need tax table implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unsupportedStates.map((state) => (
                  <div key={state.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{state.state_code}</span>
                        <span className="text-muted-foreground">({state.state_name})</span>
                      </div>
                      <Badge variant={getPriorityColor(state.support_priority)}>
                        {state.support_priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{state.employee_count}</span>
                          <span className="text-sm text-muted-foreground">employees</span>
                        </div>
                        {state.last_employee_added && (
                          <div className="text-xs text-muted-foreground">
                            Last added: {new Date(state.last_employee_added).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => markStateAsSupported(state.state_code)}
                        size="sm"
                        variant="outline"
                      >
                        Mark as Implemented
                      </Button>
                    </div>
                  </div>
                ))}
                
                {unsupportedStates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    All states with employees have tax support implemented!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>State Expansion Requests</CardTitle>
              <CardDescription>
                Track implementation requests for new state tax support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expansionRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{request.state_code} - {request.state_name}</span>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>{request.request_reason}</div>
                        {request.employee_name && (
                          <div>Employee: {request.employee_name}</div>
                        )}
                        <div>Created: {new Date(request.created_at).toLocaleDateString()}</div>
                      </div>
                      
                      {request.admin_notes && (
                        <div className="text-sm bg-muted p-2 rounded">
                          <strong>Notes:</strong> {request.admin_notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateRequestStatus(request.id, 'in_progress', 'Implementation started')}
                            size="sm"
                            variant="outline"
                          >
                            Start Work
                          </Button>
                          <Button
                            onClick={() => updateRequestStatus(request.id, 'completed', 'Tax tables implemented')}
                            size="sm"
                          >
                            Mark Complete
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'in_progress' && (
                        <Button
                          onClick={() => updateRequestStatus(request.id, 'completed', 'Implementation completed')}
                          size="sm"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {expansionRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No expansion requests yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supported" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Supported States
              </CardTitle>
              <CardDescription>
                States with fully implemented tax support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {supportedStates.filter(s => s.is_supported).map((state) => (
                  <div key={state.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{state.state_code}</span>
                      </div>
                      <Badge variant="default">Supported</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{state.state_name}</div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{state.employee_count} employees</span>
                      </div>
                      {state.implementation_notes && (
                        <div className="mt-2 text-xs bg-green-50 p-2 rounded">
                          {state.implementation_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}