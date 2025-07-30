import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Clock, CheckCircle, User, Mail, Phone, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useActivities } from "../hooks/useActivities";
import { ActivityCreateDialog } from "@/components/companies/ActivityCreateDialog";
import { useToast } from "@/hooks/use-toast";

export const ActivitiesManager = () => {
  const { activities, loading, createActivity, updateActivity } = useActivities();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const { toast } = useToast();

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateActivity = async (activityData: any) => {
    try {
      await createActivity(activityData);
      return true;
    } catch (error) {
      console.error('Error creating activity:', error);
      return false;
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await updateActivity(activityId, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      toast({
        title: "Success",
        description: "Activity marked as completed",
      });
    } catch (error) {
      console.error('Error completing activity:', error);
      toast({
        title: "Error",
        description: "Failed to complete activity",
        variant: "destructive",
      });
    }
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setShowCreateDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-2">Manage and track your sales activities</p>
        </div>
        
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Activity</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            size="sm"
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{activity.subject}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                  <Badge className={getPriorityColor(activity.priority)}>
                    {activity.priority}
                  </Badge>
                </div>
              </div>
              <CardDescription>{activity.type}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {activity.contact_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{activity.contact_name}</span>
                </div>
              )}
              
              {activity.contact_email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{activity.contact_email}</span>
                </div>
              )}

              {activity.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {activity.description}
                </p>
              )}

              {activity.scheduled_at && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(activity.scheduled_at).toLocaleDateString()} at{' '}
                    {new Date(activity.scheduled_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}

              {activity.duration_minutes && (
                <div className="text-sm text-gray-600">
                  Duration: {activity.duration_minutes} minutes
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-400">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditActivity(activity)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {activity.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleCompleteActivity(activity.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No activities found matching your criteria.</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Activity
            </Button>
          </CardContent>
        </Card>
      )}

      <ActivityCreateDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingActivity(null);
        }}
        onSubmit={handleCreateActivity}
        companyName="General Activity"
        companyId=""
      />
    </div>
  );
};