import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, FileText, FolderOpen, CheckSquare, BarChart3, Bell, Brain, Scale, Settings, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const childModules = [
  {
    id: 'cases',
    label: 'Cases',
    route: '/admin/pulse/cases',
    icon: FileText,
    description: 'Track HR, safety, and compliance-related case files with full timeline, notes, and document storage.',
    status: 'active'
  },
  {
    id: 'templates',
    label: 'Case Templates',
    route: '/admin/pulse/templates',
    icon: FileText,
    description: 'Prebuilt workflows for common case types such as harassment, ADA, disciplinary action, and investigations.',
    status: 'active'
  },
  {
    id: 'documents',
    label: 'Documents & Evidence',
    route: '/admin/pulse/documents',
    icon: FolderOpen,
    description: 'Centralized secure storage for witness statements, signed forms, and case evidence with file preview support.',
    status: 'active'
  },
  {
    id: 'tasks',
    label: 'Task Tracker',
    route: '/admin/pulse/tasks',
    icon: CheckSquare,
    description: 'Assign and track tasks related to each case with status, deadlines, and user assignments.',
    status: 'active'
  },
  {
    id: 'reports',
    label: 'Reporting & Compliance',
    route: '/admin/pulse/reports',
    icon: BarChart3,
    description: 'Visual dashboards and exportable reports showing case trends, resolution times, and department breakdowns.',
    status: 'active'
  },
  {
    id: 'alerts',
    label: 'Alerts & Triggers',
    route: '/admin/pulse/alerts',
    icon: Bell,
    description: 'Set up automatic alerts and escalation triggers for overdue tasks, unresolved cases, or legal deadlines.',
    status: 'active'
  },
  {
    id: 'insights',
    label: 'Case Insights',
    route: '/admin/pulse/insights',
    icon: Brain,
    description: 'AI-generated risk insights, case summaries, and recommended next actions (coming soon).',
    status: 'coming_soon'
  },
  {
    id: 'legal',
    label: 'Legal Review',
    route: '/admin/pulse/legal',
    icon: Scale,
    description: 'Invite internal or external counsel for privileged review of selected cases and private notes (coming soon).',
    status: 'coming_soon'
  },
  {
    id: 'hali',
    label: 'HALI – SMS Support Assistant',
    route: '/admin/pulse/hali',
    icon: MessageSquare,
    description: 'SMS-based employee support assistant for HR, payroll, and software issues with automated escalation.',
    status: 'active'
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/admin/pulse/settings',
    icon: Settings,
    description: 'Manage case types, tags, access roles, escalation rules, and notification preferences.',
    status: 'active'
  }
];

export const PulseCMSPage: React.FC = () => {
  const navigate = useNavigate();

  const handleModuleClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/halo-iq')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Halo IQ
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pulse CMS</h1>
              <p className="text-muted-foreground">Content and case management system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Child Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card 
              key={module.id}
              className="border-border cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleModuleClick(module.route)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <CardTitle>{module.label}</CardTitle>
                  <div className="ml-auto">
                    <div className={`w-2 h-2 rounded-full ${
                      module.status === 'active' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {module.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};