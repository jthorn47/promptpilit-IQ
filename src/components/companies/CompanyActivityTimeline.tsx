import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Phone, Mail, FileText, User, Clock, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActivityCreateDialog } from "./ActivityCreateDialog";
import { ActivityFilters } from "../activities/ActivityFilters";
import { exportActivitiesToCSV } from "../activities/ActivityExport";
import { getActivityTypeLabel, getActivityTypeCategory } from "../activities/ActivityTypeSelector";
import { Activity, ActivityFilter } from "../activities/types";


interface CompanyActivityTimelineProps {
  companyId: string;
  companyName: string;
  clientType?: string;
}

const activityTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: Clock,
};

const activityTypeColors = {
  call: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  email: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  note: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  task: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const CompanyActivityTimeline: React.FC<CompanyActivityTimelineProps> = ({
  companyId,
  companyName,
  clientType
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilter>({
    dateRange: { from: undefined, to: undefined },
    types: [],
    userId: '',
    clientType: ''
  });
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
    fetchUsers();
  }, [companyId, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activities')
        .select('*')
        .eq('company_id', companyId);

      // Apply filters
      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }
      if (filters.types.length > 0) {
        query = query.in('type', filters.types);
      }
      if (filters.userId) {
        query = query.eq('created_by', filters.userId);
      }
      if (filters.clientType) {
        query = query.eq('client_type', filters.clientType);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email')
        .limit(100);

      if (error) throw error;
      
      setUsers(data?.map(user => ({
        id: user.user_id,
        name: user.email || 'Unknown User'
      })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateActivity = async (activityData: any) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          ...activityData,
          company_id: companyId,
          client_type: clientType,
        }])
        .select('*')
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
      return false;
    }
  };

  const getActivityIcon = (type: string) => {
    const category = getActivityTypeCategory(type);
    if (category === "Non-Revenue Stage") return <Phone className="h-4 w-4" />;
    if (category === "Conversion") return <Calendar className="h-4 w-4" />;
    if (category === "Client Management") return <User className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getActivityTypeColor = (type: string) => {
    const category = getActivityTypeCategory(type);
    if (category === "Non-Revenue Stage") return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (category === "Conversion") return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (category === "Client Management") return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueActivityTypes = [...new Set(activities.map(a => a.type))];
  const uniqueClientTypes = [...new Set(activities.map(a => a.client_type).filter(Boolean))];

  const hasActiveFilters = Boolean(filters.dateRange.from || filters.dateRange.to || 
                          filters.types.length > 0 || filters.userId || filters.clientType);

  const handleExport = () => {
    exportActivitiesToCSV(activities, `${companyName.replace(/\s+/g, '_')}_activities`);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      types: [],
      userId: '',
      clientType: ''
    });
  };

  const getUserName = (userId: string, activity: any) => {
    const user = users.find(u => u.id === userId);
    if (user) return user.name;
    if (activity.profiles?.email) return activity.profiles.email;
    return 'Unknown User';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading activities...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          <p className="text-sm text-muted-foreground">
            All interactions and activities for {companyName}
            {clientType && ` (${clientType.charAt(0).toUpperCase() + clientType.slice(1)})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Search className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <ActivityFilters
          dateRange={filters.dateRange}
          onDateRangeChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
          activityTypes={uniqueActivityTypes}
          selectedTypes={filters.types}
          onTypeChange={(types) => setFilters(prev => ({ ...prev, types }))}
          users={users}
          selectedUser={filters.userId}
          onUserChange={(userId) => setFilters(prev => ({ ...prev, userId }))}
          clientTypes={uniqueClientTypes}
          selectedClientType={filters.clientType}
          onClientTypeChange={(clientType) => setFilters(prev => ({ ...prev, clientType }))}
          onExport={handleExport}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {hasActiveFilters 
                  ? "No activities match your current filters"
                  : "No activities found for this company"
                }
              </p>
              <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Button>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getActivityTypeColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{activity.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge className={getActivityTypeColor(activity.type)} variant="outline">
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                        <span>{formatDate(activity.created_at)}</span>
                        {activity.contact_name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {activity.contact_name}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              {(activity.description || activity.outcome || activity.next_steps) && (
                <CardContent className="pt-0 space-y-3">
                  {activity.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  )}
                  
                  {activity.outcome && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Outcome</h4>
                      <p className="text-sm text-muted-foreground">{activity.outcome}</p>
                    </div>
                  )}
                  
                  {activity.next_steps && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Next Steps</h4>
                      <p className="text-sm text-muted-foreground">{activity.next_steps}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                    <span>Created by: {getUserName(activity.created_by, activity)}</span>
                    {activity.duration_minutes && (
                      <span>Duration: {activity.duration_minutes}min</span>
                    )}
                    {activity.priority !== 'medium' && (
                      <Badge variant="outline" className="text-xs">
                        {activity.priority} priority
                      </Badge>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Activity Dialog */}
      <ActivityCreateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateActivity}
        companyName={companyName}
        companyId={companyId}
        clientType={clientType}
      />
    </div>
  );
};