import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SystemTrigger {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  action_type: string;
  action_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const SystemTriggersManager = () => {
  const [triggers, setTriggers] = useState<SystemTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<SystemTrigger | null>(null);
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    description: '',
    trigger_event: '',
    action_type: '',
    action_config: {},
    is_active: true
  });
  const { toast } = useToast();
  const { hasRole } = useAuth();

  // Pre-defined system triggers
  const systemTriggers = [
    {
      id: 'risk-assessment-propgen',
      name: 'HR Risk Assessment → Enable PropGEN',
      description: 'Automatically enables PropGEN module when risk assessment is completed',
      trigger_event: 'risk_assessment_completed',
      action_type: 'enable_module',
      action_config: { module: 'propgen' },
      is_active: true,
      is_system: true
    },
    {
      id: 'proposal-generated-stage',
      name: 'Proposal Generated → Update Stage',
      description: 'Updates company stage to "Proposal Sent" when proposal is generated',
      trigger_event: 'proposal_generated',
      action_type: 'update_stage',
      action_config: { stage: 'proposal_sent' },
      is_active: true,
      is_system: true
    },
    {
      id: 'client-stage-onboarding',
      name: 'Client Stage → Activate Onboarding',
      description: 'Activates onboarding module when company becomes a client',
      trigger_event: 'company_stage_changed',
      action_type: 'enable_module',
      action_config: { module: 'onboarding', condition: { stage: 'client' } },
      is_active: true,
      is_system: true
    },
    {
      id: 'spin-content-complete',
      name: 'SPIN Content → Update Workflow',
      description: 'Updates PropGEN workflow when SPIN content is completed',
      trigger_event: 'spin_content_generated',
      action_type: 'update_workflow',
      action_config: { workflow: 'propgen', step: 'content_ready' },
      is_active: true,
      is_system: true
    }
  ];

  const triggerEvents = [
    { value: 'risk_assessment_completed', label: 'Risk Assessment Completed' },
    { value: 'proposal_generated', label: 'Proposal Generated' },
    { value: 'company_stage_changed', label: 'Company Stage Changed' },
    { value: 'spin_content_generated', label: 'SPIN Content Generated' },
    { value: 'investment_analysis_saved', label: 'Investment Analysis Saved' },
    { value: 'training_completed', label: 'Training Completed' },
    { value: 'certificate_issued', label: 'Certificate Issued' }
  ];

  const actionTypes = [
    { value: 'enable_module', label: 'Enable Module' },
    { value: 'update_stage', label: 'Update Stage' },
    { value: 'update_workflow', label: 'Update Workflow' },
    { value: 'send_notification', label: 'Send Notification' },
    { value: 'create_record', label: 'Create Record' }
  ];

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      // For now, just show the system triggers since we don't have a database table yet
      const triggersWithTimestamp = systemTriggers.map(trigger => ({
        ...trigger,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      setTriggers(triggersWithTimestamp);
    } catch (error) {
      console.error('Error loading system triggers:', error);
      setTriggers([]);
    } finally {
      setLoading(false);
    }
  };

  const createTrigger = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Custom system triggers will be available in a future update.",
    });
    setShowCreateForm(false);
    resetForm();
  };

  const toggleTrigger = async (trigger: any, isActive: boolean) => {
    if (trigger.is_system) {
      toast({
        title: "Notice",
        description: "System triggers cannot be disabled. They are core to the platform functionality.",
      });
      return;
    }

    toast({
      title: "Feature Coming Soon",
      description: "Custom system triggers will be available in a future update.",
    });
  };

  const testTrigger = async (trigger: any) => {
    try {
      await supabase.functions.invoke('propgen-integration-handler', {
        body: {
          triggerType: trigger.trigger_event,
          companyId: 'test-company',
          triggerData: {
            test_mode: true,
            trigger_name: trigger.name,
            action_type: trigger.action_type,
            action_config: trigger.action_config,
            triggered_at: new Date().toISOString()
          }
        }
      });

      toast({
        title: "Test Sent",
        description: "Test trigger executed successfully. Check logs for details.",
      });
    } catch (error) {
      console.error('Error testing trigger:', error);
      toast({
        title: "Error",
        description: "Failed to test trigger",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewTrigger({
      name: '',
      description: '',
      trigger_event: '',
      action_type: '',
      action_config: {},
      is_active: true
    });
    setEditingTrigger(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Triggers</h2>
          <p className="text-muted-foreground">Manage automated system-wide workflow triggers</p>
        </div>
        {hasRole('super_admin') && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Trigger
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingTrigger) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTrigger ? 'Edit System Trigger' : 'Create System Trigger'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="trigger-name">Trigger Name</Label>
                <Input
                  id="trigger-name"
                  value={newTrigger.name}
                  onChange={(e) => setNewTrigger({...newTrigger, name: e.target.value})}
                  placeholder="e.g., Auto-enable LMS on client conversion"
                />
              </div>
              <div>
                <Label htmlFor="trigger-event">Trigger Event</Label>
                <select
                  id="trigger-event"
                  value={newTrigger.trigger_event}
                  onChange={(e) => setNewTrigger({...newTrigger, trigger_event: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select event</option>
                  {triggerEvents.map(event => (
                    <option key={event.value} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTrigger.description}
                onChange={(e) => setNewTrigger({...newTrigger, description: e.target.value})}
                placeholder="Describe what this trigger does..."
              />
            </div>

            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <select
                id="action-type"
                value={newTrigger.action_type}
                onChange={(e) => setNewTrigger({...newTrigger, action_type: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select action</option>
                {actionTypes.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={createTrigger}>
                {editingTrigger ? 'Update' : 'Create'} Trigger
              </Button>
              <Button variant="outline" onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triggers List */}
      <div className="space-y-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{trigger.name}</h3>
                    <p className="text-sm text-muted-foreground">{trigger.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(trigger as any).is_system && (
                    <Badge variant="secondary">System</Badge>
                  )}
                  <Switch
                    checked={trigger.is_active}
                    onCheckedChange={(checked) => toggleTrigger(trigger, checked)}
                    disabled={(trigger as any).is_system}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testTrigger(trigger)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">Trigger Event</p>
                  <Badge variant="outline" className="mt-1">
                    {triggerEvents.find(e => e.value === trigger.trigger_event)?.label || trigger.trigger_event}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Action</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {actionTypes.find(a => a.value === trigger.action_type)?.label || trigger.action_type}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {trigger.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-sm">
                      {trigger.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {trigger.created_at && (
                <p className="text-xs text-muted-foreground mt-4">
                  Created: {new Date(trigger.created_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {triggers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No system triggers configured</h3>
              <p className="text-muted-foreground mb-4">
                Create automated triggers to manage system-wide workflows
              </p>
              {hasRole('super_admin') && (
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Your First Trigger
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};