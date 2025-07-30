import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Workflow, 
  Plus, 
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar
} from "lucide-react";

interface CaseWorkflowsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowCase {
  id: string;
  title: string;
  type: 'hr' | 'finance' | 'legal' | 'operations';
  status: 'active' | 'pending' | 'completed' | 'blocked';
  progress: number;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  steps: number;
  completedSteps: number;
}

const mockCases: WorkflowCase[] = [
  {
    id: '1',
    title: 'Employee Onboarding - John Smith',
    type: 'hr',
    status: 'active',
    progress: 65,
    assignee: 'Sarah Johnson',
    dueDate: '2024-01-20',
    priority: 'high',
    steps: 8,
    completedSteps: 5
  },
  {
    id: '2',
    title: 'Invoice Processing - Q1 2024',
    type: 'finance',
    status: 'pending',
    progress: 0,
    assignee: 'Mike Davis',
    dueDate: '2024-01-25',
    priority: 'medium',
    steps: 6,
    completedSteps: 0
  },
  {
    id: '3',
    title: 'Contract Review - Client ABC',
    type: 'legal',
    status: 'completed',
    progress: 100,
    assignee: 'Emma Wilson',
    dueDate: '2024-01-15',
    priority: 'urgent',
    steps: 4,
    completedSteps: 4
  }
];

export const CaseWorkflowsModal: React.FC<CaseWorkflowsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCase, setSelectedCase] = useState<WorkflowCase | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">{/* Added overflow-y-auto for scrolling */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Workflow className="h-5 w-5" />
            <span>Case Workflows</span>
          </DialogTitle>
          <DialogDescription>
            Manage and track case workflows across your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Cases</TabsTrigger>
            <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Active Workflows ({mockCases.length})</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {mockCases.map((caseItem) => (
                  <Card 
                    key={caseItem.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCase?.id === caseItem.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{caseItem.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={`text-xs ${getStatusColor(caseItem.status)}`}>
                              {caseItem.status}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(caseItem.priority)}`}>
                              {caseItem.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{caseItem.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{caseItem.completedSteps}/{caseItem.steps} steps</span>
                        </div>
                        <Progress value={caseItem.progress} className="h-2" />
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{caseItem.assignee}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Case Details</h3>
                {selectedCase ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedCase.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Execute Step
                        </Button>
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={`ml-2 text-xs ${getStatusColor(selectedCase.status)}`}>
                            {selectedCase.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <Badge className={`ml-2 text-xs ${getPriorityColor(selectedCase.priority)}`}>
                            {selectedCase.priority}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Workflow Steps</h4>
                        <div className="space-y-2">
                          {Array.from({ length: selectedCase.steps }, (_, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              {i < selectedCase.completedSteps ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : i === selectedCase.completedSteps ? (
                                <Clock className="h-4 w-4 text-blue-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={`text-sm ${i < selectedCase.completedSteps ? 'line-through text-muted-foreground' : ''}`}>
                                Step {i + 1}: {i === 0 ? 'Initial Setup' : i === selectedCase.steps - 1 ? 'Final Review' : `Process Step ${i}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a case to view details</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Employee Onboarding', steps: 8, category: 'HR' },
                { name: 'Invoice Processing', steps: 6, category: 'Finance' },
                { name: 'Contract Review', steps: 4, category: 'Legal' },
                { name: 'Customer Support', steps: 5, category: 'Operations' },
              ].map((template, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.category} • {template.steps} steps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        console.log(`Creating new case from template: ${template.name}`);
                        // Here you would typically create a new case from the template
                        // For now, we'll show a simple alert
                        alert(`Creating new ${template.name} workflow...`);
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-blue-600">
                    {mockCases.filter(c => c.status === 'active').length}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-green-600">
                    {mockCases.filter(c => c.status === 'completed').length}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">2.5d</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Configuration</CardTitle>
                <CardDescription>Configure workflow settings and automation rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Automation Settings</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Auto-assign workflows</label>
                        <p className="text-xs text-muted-foreground">Automatically assign new workflows to available team members</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Email notifications</label>
                        <p className="text-xs text-muted-foreground">Send email alerts for workflow status changes</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Deadline warnings</label>
                        <p className="text-xs text-muted-foreground">Alert team members when deadlines are approaching</p>
                      </div>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Escalation Rules</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Escalation timeout (hours)</label>
                      <input 
                        type="number" 
                        defaultValue="24" 
                        className="mt-1 w-full px-3 py-2 border rounded-md"
                        min="1"
                        max="168"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Priority escalation</label>
                      <select className="mt-1 w-full px-3 py-2 border rounded-md" defaultValue="manager">
                        <option value="manager">Escalate to Manager</option>
                        <option value="team-lead">Escalate to Team Lead</option>
                        <option value="admin">Escalate to Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};