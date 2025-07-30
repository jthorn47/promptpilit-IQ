import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Phone, Mail, Calendar, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Activity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  assigned_to: string;
  created_by: string;
  duration_minutes: number;
  outcome?: string;
  next_steps?: string;
  priority: string;
  status: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ActivityTemplate {
  id: string;
  name: string;
  type: string;
  subject_template: string;
  description_template?: string;
  default_duration_minutes: number;
}

export const ActivitiesManager = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "",
    subject: "",
    description: "",
    contact_name: "",
    contact_email: "",
    duration_minutes: 30,
    outcome: "",
    next_steps: "",
    priority: "medium",
    status: "completed",
    scheduled_at: "",
    completed_at: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
    fetchTemplates();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

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

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleAddActivity = async () => {
    try {
      if (!newActivity.subject || !newActivity.type) {
        toast({
          title: "Error",
          description: "Please fill in required fields (subject and type)",
          variant: "destructive",
        });
        return;
      }

      const activityData = {
        ...newActivity,
        assigned_to: user?.id,
        created_by: user?.id,
        scheduled_at: newActivity.scheduled_at || null,
        completed_at: newActivity.status === 'completed' ? (newActivity.completed_at || new Date().toISOString()) : null
      };

      const { error } = await supabase
        .from('activities')
        .insert([activityData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity logged successfully",
      });

      setShowAddDialog(false);
      setNewActivity({
        type: "",
        subject: "",
        description: "",
        contact_name: "",
        contact_email: "",
        duration_minutes: 30,
        outcome: "",
        next_steps: "",
        priority: "medium",
        status: "completed",
        scheduled_at: "",
        completed_at: ""
      });
      fetchActivities();
    } catch (error: any) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add activity",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = (template: ActivityTemplate) => {
    setNewActivity({
      ...newActivity,
      type: template.type,
      subject: template.subject_template,
      description: template.description_template || "",
      duration_minutes: template.default_duration_minutes
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': case 'demo': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.contact_name && activity.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Track all your sales interactions and communications</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
              <DialogDescription>
                Record a new sales activity or interaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Activity Templates */}
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Activity Type *</Label>
                  <Select value={newActivity.type} onValueChange={(value) => setNewActivity({...newActivity, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newActivity.priority} onValueChange={(value) => setNewActivity({...newActivity, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newActivity.subject}
                  onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})}
                  placeholder="Brief description of the activity"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={newActivity.contact_name}
                    onChange={(e) => setNewActivity({...newActivity, contact_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newActivity.contact_email}
                    onChange={(e) => setNewActivity({...newActivity, contact_email: e.target.value})}
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Detailed notes about the activity..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newActivity.duration_minutes}
                    onChange={(e) => setNewActivity({...newActivity, duration_minutes: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newActivity.status} onValueChange={(value) => setNewActivity({...newActivity, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={newActivity.outcome}
                  onChange={(e) => setNewActivity({...newActivity, outcome: e.target.value})}
                  placeholder="What was the result of this activity?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  value={newActivity.next_steps}
                  onChange={(e) => setNewActivity({...newActivity, next_steps: e.target.value})}
                  placeholder="What should happen next?"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddActivity}>
                Log Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="demo">Demos</SelectItem>
            <SelectItem value="proposal">Proposals</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activities ({filteredActivities.length})</CardTitle>
              <CardDescription>Your recent sales activities and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.subject}</h4>
                        {activity.contact_name && (
                          <p className="text-sm text-gray-600">{activity.contact_name} • {activity.contact_email}</p>
                        )}
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        {activity.outcome && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Outcome:</strong> {activity.outcome}
                          </div>
                        )}
                        {activity.next_steps && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Next Steps:</strong> {activity.next_steps}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.duration_minutes}m
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredActivities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No activities found</p>
                    <p className="text-sm">Log your first activity to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Chronological view of your activities</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredActivities.length > 0 ? (
                <div className="space-y-6">
                  {filteredActivities.map((activity, index) => (
                    <div key={activity.id} className="relative">
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute left-5 top-10 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center z-10">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.subject}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {activity.contact_name && (
                            <p className="text-sm text-gray-600">{activity.contact_name}</p>
                          )}
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activities in timeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};