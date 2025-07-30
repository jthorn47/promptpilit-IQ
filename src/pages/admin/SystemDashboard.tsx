import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { 
  Monitor, 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  Archive,
  Mail,
  Plug,
  Smartphone
} from 'lucide-react';

interface SystemToolItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SystemDashboard: React.FC = () => {
  const navigate = useNavigate();

  const systemTools: SystemToolItem[] = [
    {
      id: 'system-dashboard',
      title: 'System Dashboard',
      description: 'Monitor system performance, health metrics, and overall status.',
      url: '/admin/system/dashboard',
      icon: Monitor
    },
    {
      id: 'email-templates',
      title: 'System Email Templates',
      description: 'Manage email templates for authentication, security, and notifications.',
      url: '/admin/system/email-templates',
      icon: Mail
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Create, edit, and manage user accounts and their access.',
      url: '/admin/users',
      icon: Users
    },
    {
      id: 'permissions',
      title: 'Permissions & Roles',
      description: 'Configure user roles, permissions, and access control policies.',
      url: '/admin/permissions',
      icon: Shield
    },
    {
      id: 'system-config',
      title: 'PropGEN Configuration',
      description: 'Manage PropGEN financial settings and regulatory configuration.',
      url: '/admin/system-settings',
      icon: Settings
    },
    {
      id: 'integration-hub',
      title: 'Integration Hub',
      description: 'Manage integrations, monitor webhooks, and track security events.',
      url: '/admin/integrations',
      icon: Plug
    },
    {
      id: '2fa-management',
      title: '2FA Management',
      description: 'Manage two-factor authentication settings and security.',
      url: '/admin/2fa',
      icon: Smartphone
    },
    {
      id: 'system-logs',
      title: 'System Logs',
      description: 'View system logs, error reports, and audit trails.',
      url: '/admin/system/logs',
      icon: FileText
    },
    {
      id: 'backup-restore',
      title: 'Backup & Restore',
      description: 'Manage system backups and data recovery operations.',
      url: '/admin/system/backup',
      icon: Archive
    }
  ];

  const handleToolClick = (url: string) => {
    navigate(url);
  };

  return (
    <StandardPageLayout
      title="System Administration"
      subtitle="Manage users, roles, permissions, and system configuration"
      badge="System"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleToolClick(tool.url)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </StandardPageLayout>
  );
};