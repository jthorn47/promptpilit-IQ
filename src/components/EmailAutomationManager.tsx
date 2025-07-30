import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Mail, Clock, CheckCircle, Settings, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailAutomation {
  id: string;
  name: string;
  trigger_type: 'training_assigned' | 'training_due_soon' | 'training_overdue' | 'training_completed' | 'welcome_new_employee';
  delay_hours: number;
  is_active: boolean;
  template_type: string;
  subject_template: string;
  body_template?: string;
  send_to_learner: boolean;
  send_to_manager: boolean;
  send_to_admin: boolean;
  company_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  last_sent_count?: number;
}

interface EmailStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  bounce_rate: number;
  open_rate: number;
  click_rate: number;
}

export const EmailAutomationManager = () => {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAutomation, setNewAutomation] = useState<Partial<EmailAutomation>>({
    name: '',
    trigger_type: 'training_assigned',
    delay_hours: 0,
    is_active: true,
    template_type: 'training_assignment',
    subject_template: 'New Training Assignment: {{training_name}}',
    send_to_learner: true,
    send_to_manager: false,
    send_to_admin: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAutomations();
    fetchEmailStats();
  }, []);

  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations((data || []) as EmailAutomation[]);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast({
        title: "Error",
        description: "Failed to load email automations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      // This would integrate with your email service to get real stats
      // For now, showing mock data structure
      setStats({
        total_sent: 1250,
        total_opened: 875,
        total_clicked: 234,
        bounce_rate: 2.1,
        open_rate: 70.0,
        click_rate: 18.7
      });
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const createAutomation = async () => {
    try {
      if (!newAutomation.name || !newAutomation.trigger_type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('email_automations')
        .insert([{
          name: newAutomation.name!,
          trigger_type: newAutomation.trigger_type!,
          delay_hours: newAutomation.delay_hours || 0,
          is_active: newAutomation.is_active || true,
          template_type: newAutomation.template_type || 'training_assignment',
          subject_template: newAutomation.subject_template!,
          send_to_learner: newAutomation.send_to_learner || true,
          send_to_manager: newAutomation.send_to_manager || false,
          send_to_admin: newAutomation.send_to_admin || false
        }])
        .select()
        .single();

      if (error) throw error;

      setAutomations([data as EmailAutomation, ...automations]);
      setShowCreateForm(false);
      setNewAutomation({
        name: '',
        trigger_type: 'training_assigned',
        delay_hours: 0,
        is_active: true,
        template_type: 'training_assignment',
        subject_template: 'New Training Assignment: {{training_name}}',
        send_to_learner: true,
        send_to_manager: false,
        send_to_admin: false
      });

      toast({
        title: "Success",
        description: "Email automation created successfully",
      });
    } catch (error) {
      console.error('Error creating automation:', error);
      toast({
        title: "Error",
        description: "Failed to create email automation",
        variant: "destructive",
      });
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_automations')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setAutomations(automations.map(auto => 
        auto.id === id ? { ...auto, is_active: isActive } : auto
      ));

      toast({
        title: "Success",
        description: `Automation ${isActive ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Error",
        description: "Failed to update automation",
        variant: "destructive",
      });
    }
  };

  const triggerTypes = [
    { value: 'training_assigned', label: 'Training Assigned', description: 'When a learner is assigned new training' },
    { value: 'training_due_soon', label: 'Training Due Soon', description: 'X hours before training deadline' },
    { value: 'training_overdue', label: 'Training Overdue', description: 'When training passes deadline' },
    { value: 'training_completed', label: 'Training Completed', description: 'When learner completes training' },
    { value: 'welcome_new_employee', label: 'Welcome New Employee', description: 'When new employee is added' }
  ];

  const getTriggerColor = (type: string) => {
    switch (type) {
      case 'training_assigned': return 'bg-blue-100 text-blue-800';
      case 'training_due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'training_overdue': return 'bg-red-100 text-red-800';
      case 'training_completed': return 'bg-green-100 text-green-800';
      case 'welcome_new_employee': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading email automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Automation</h1>
          <p className="text-muted-foreground">Automate training notifications and reminders</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Mail className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      <Tabs defaultValue="automations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          {/* Email Stats Overview */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_sent.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.open_rate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.click_rate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.bounce_rate}%</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create Automation Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Email Automation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Automation Name</Label>
                    <Input
                      id="name"
                      value={newAutomation.name}
                      onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                      placeholder="e.g., Welcome New Employees"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trigger">Trigger Event</Label>
                    <Select 
                      value={newAutomation.trigger_type} 
                      onValueChange={(value: any) => setNewAutomation({...newAutomation, trigger_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerTypes.map(trigger => (
                          <SelectItem key={trigger.value} value={trigger.value}>
                            <div>
                              <div className="font-medium">{trigger.label}</div>
                              <div className="text-xs text-muted-foreground">{trigger.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="delay">Delay (hours)</Label>
                    <Input
                      id="delay"
                      type="number"
                      min="0"
                      value={newAutomation.delay_hours}
                      onChange={(e) => setNewAutomation({...newAutomation, delay_hours: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Hours to wait after trigger before sending (0 = immediate)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject Template</Label>
                    <Input
                      id="subject"
                      value={newAutomation.subject_template}
                      onChange={(e) => setNewAutomation({...newAutomation, subject_template: e.target.value})}
                      placeholder="Use {{variables}} for dynamic content"
                    />
                  </div>
                </div>

                <div>
                  <Label>Send To</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="send_learner"
                        checked={newAutomation.send_to_learner}
                        onCheckedChange={(checked) => setNewAutomation({...newAutomation, send_to_learner: checked})}
                      />
                      <Label htmlFor="send_learner">Learner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="send_manager"
                        checked={newAutomation.send_to_manager}
                        onCheckedChange={(checked) => setNewAutomation({...newAutomation, send_to_manager: checked})}
                      />
                      <Label htmlFor="send_manager">Manager</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="send_admin"
                        checked={newAutomation.send_to_admin}
                        onCheckedChange={(checked) => setNewAutomation({...newAutomation, send_to_admin: checked})}
                      />
                      <Label htmlFor="send_admin">Admin</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createAutomation}>Create Automation</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automations List */}
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{automation.name}</h3>
                        <Badge className={getTriggerColor(automation.trigger_type)}>
                          {triggerTypes.find(t => t.value === automation.trigger_type)?.label}
                        </Badge>
                        {automation.is_active ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Play className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 border-gray-600">
                            <Pause className="w-3 h-3 mr-1" />
                            Paused
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{automation.subject_template}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Delay: {automation.delay_hours}h</span>
                        <span>
                          Recipients: {[
                            automation.send_to_learner && 'Learner',
                            automation.send_to_manager && 'Manager', 
                            automation.send_to_admin && 'Admin'
                          ].filter(Boolean).join(', ')}
                        </span>
                        {automation.last_sent_count && (
                          <span>Last run: {automation.last_sent_count} emails</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {automations.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Email Automations</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first email automation to start engaging learners automatically
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Automation
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Email Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed analytics coming soon. This will show email performance metrics, 
                engagement rates, and automation effectiveness.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Template management coming soon. This will allow you to create and edit 
                custom email templates for different automation types.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};