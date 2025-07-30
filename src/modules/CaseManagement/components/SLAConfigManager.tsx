import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Settings, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CaseType, CasePriority } from '../types';

interface SLAConfig {
  id: string;
  company_id?: string;
  case_type: string;
  priority: string;
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SLAConfigFormData {
  case_type: string;
  priority: string;
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours?: number;
  is_active: boolean;
}

const defaultFormData: SLAConfigFormData = {
  case_type: 'general',
  priority: 'medium',
  response_time_hours: 4,
  resolution_time_hours: 24,
  escalation_time_hours: 2,
  is_active: true,
};

export const SLAConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<SLAConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<SLAConfig | null>(null);
  const [formData, setFormData] = useState<SLAConfigFormData>(defaultFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSLAConfigs();
  }, []);

  const fetchSLAConfigs = async () => {
    try {
      setLoading(true);
      // Mock implementation until Supabase types are updated
      setConfigs([]);
    } catch (error) {
      console.error('Error fetching SLA configs:', error);
      toast.error('Failed to load SLA configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Mock implementation until Supabase types are updated
      toast.success('SLA configuration will be available after types are updated');
      setIsDialogOpen(false);
      setEditingConfig(null);
      setFormData(defaultFormData);
    } catch (error: any) {
      console.error('Error saving SLA config:', error);
      toast.error('Failed to save SLA configuration');
    }
  };

  const handleEdit = (config: SLAConfig) => {
    setEditingConfig(config);
    setFormData({
      case_type: config.case_type,
      priority: config.priority,
      response_time_hours: config.response_time_hours,
      resolution_time_hours: config.resolution_time_hours,
      escalation_time_hours: config.escalation_time_hours,
      is_active: config.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this SLA configuration?')) {
      return;
    }

    try {
      // Mock implementation until Supabase types are updated
      toast.success('SLA configuration will be available after types are updated');
    } catch (error) {
      console.error('Error deleting SLA config:', error);
      toast.error('Failed to delete SLA configuration');
    }
  };

  const handleCreateNew = () => {
    setEditingConfig(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatCaseType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              SLA Configuration
            </CardTitle>
            <CardDescription>
              Define response and resolution time targets for different case types and priorities
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? 'Edit SLA Configuration' : 'Create SLA Configuration'}
                </DialogTitle>
                <DialogDescription>
                  Set response and resolution time targets for case management
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="case_type">Case Type</Label>
                    <Select
                      value={formData.case_type}
                      onValueChange={(value: string) => 
                        setFormData(prev => ({ ...prev, case_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="payroll">Payroll</SelectItem>
                        <SelectItem value="benefits">Benefits</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: string) => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="response_time">Response Time (hours)</Label>
                    <Input
                      id="response_time"
                      type="number"
                      min="1"
                      value={formData.response_time_hours}
                      onChange={(e) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          response_time_hours: parseInt(e.target.value) || 1 
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution_time">Resolution Time (hours)</Label>
                    <Input
                      id="resolution_time"
                      type="number"
                      min="1"
                      value={formData.resolution_time_hours}
                      onChange={(e) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          resolution_time_hours: parseInt(e.target.value) || 1 
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escalation_time">Escalation Time (hours)</Label>
                  <Input
                    id="escalation_time"
                    type="number"
                    min="1"
                    placeholder="Optional"
                    value={formData.escalation_time_hours || ''}
                    onChange={(e) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        escalation_time_hours: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label htmlFor="is_active">Active Configuration</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingConfig ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {configs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No SLA Configurations</h3>
            <p className="text-muted-foreground mb-4">
              Create your first SLA configuration to enable automatic monitoring
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Resolution Time</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    {formatCaseType(config.case_type)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(config.priority)}>
                      {config.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{config.response_time_hours}h</TableCell>
                  <TableCell>{config.resolution_time_hours}h</TableCell>
                  <TableCell>
                    {config.escalation_time_hours ? (
                      <span className="text-sm">
                        +{config.escalation_time_hours}h
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Disabled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};