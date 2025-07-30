import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Database, BarChart3, TrendingUp, Activity, Tags, FileText, Settings, Target, Paperclip, MessageSquare, PieChart, Mail } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const childModules = [
  {
    id: 'crm-dashboard',
    label: 'CRM Dashboard',
    route: '/admin/connectiq/dashboard',
    icon: BarChart3,
    description: 'Customer relationship management overview',
    status: 'active'
  },
  {
    id: 'companies',
    label: 'Companies',
    route: '/admin/connectiq/companies',
    icon: Database,
    description: 'Manage company accounts and contacts',
    status: 'active'
  },
  {
    id: 'contacts',
    label: 'Contacts',
    route: '/admin/connectiq/contacts',
    icon: Users,
    description: 'Manage customer contacts and relationships',
    status: 'active'
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    route: '/admin/connectiq/opportunities',
    icon: TrendingUp,
    description: 'Manage deals and sales opportunities',
    status: 'active'
  },
  {
    id: 'activities',
    label: 'Activities',
    route: '/admin/connectiq/activities',
    icon: Activity,
    description: 'Manage tasks, calls, and notes',
    status: 'active'
  },
  {
    id: 'tags',
    label: 'Tags',
    route: '/admin/connectiq/tags',
    icon: Tags,
    description: 'Organize contacts and deals with custom tags',
    status: 'active'
  },
  {
    id: 'notes',
    label: 'Notes',
    route: '/admin/connectiq/notes',
    icon: FileText,
    description: 'Customer interaction notes and communications',
    status: 'active'
  },
  {
    id: 'custom-fields',
    label: 'Custom Fields',
    route: '/admin/connectiq/custom-fields',
    icon: Settings,
    description: 'Create and manage custom fields',
    status: 'active'
  },
  {
    id: 'pipelines',
    label: 'Pipelines & Stages',
    route: '/admin/connectiq/pipelines',
    icon: Target,
    description: 'Manage sales pipelines and deal stages',
    status: 'active'
  },
  {
    id: 'contracts',
    label: 'Client Contracts',
    route: '/admin/connectiq/contracts',
    icon: FileText,
    description: 'Manage client contracts and agreements',
    status: 'active'
  },
  {
    id: 'attachments',
    label: 'Attachments',
    route: '/admin/connectiq/attachments',
    icon: Paperclip,
    description: 'Manage files and documents',
    status: 'active'
  },
  {
    id: 'communications',
    label: 'Communications Log',
    route: '/admin/connectiq/communications',
    icon: MessageSquare,
    description: 'Track all customer communications',
    status: 'active'
  },
  {
    id: 'reporting',
    label: 'Deal Value Reporting',
    route: '/admin/connectiq/reporting',
    icon: PieChart,
    description: 'Analyze deal values and revenue metrics',
    status: 'active'
  },
  {
    id: 'lead-sources',
    label: 'Lead Source Attribution',
    route: '/admin/connectiq/lead-sources',
    icon: Users,
    description: 'Track and analyze lead source performance',
    status: 'active'
  },
  {
    id: 'email-templates',
    label: 'Email Templates',
    route: '/admin/connectiq/email-templates',
    icon: Mail,
    description: 'Create and manage CRM email templates',
    status: 'active'
  }
];

export const ConnectIQPage: React.FC = () => {
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
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Connect IQ</h1>
              <p className="text-muted-foreground">Customer Relationship Management</p>
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