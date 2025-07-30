import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  Timer,
  Calendar,
  Shield,
  FolderOpen,
  CheckSquare,
  GraduationCap,
  Settings,
  Zap,
  Calculator
} from 'lucide-react';

import FinanceIQ from '@/modules/HaaLO.Shared/components/FinanceIQ';

interface HaaLOIQTabProps {
  clientName: string;
  companyId?: string;
}

export const HaaLOIQTab = ({ clientName, companyId }: HaaLOIQTabProps) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  const modules = [
    {
      id: 'time-tracking',
      name: 'Time Tracking',
      icon: Timer,
      description: 'Advanced time tracking with GPS verification and project-based billing.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'leave-management',
      name: 'Leave Management',
      icon: Calendar,
      description: 'Streamlined PTO requests, approvals, and accrual tracking.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: Shield,
      description: 'Automated compliance monitoring and reporting tools.',
      status: 'Locked',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FolderOpen,
      description: 'Secure document storage, e-signatures, and workflow automation.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'tasks-workflows',
      name: 'Tasks & Workflows',
      icon: CheckSquare,
      description: 'Automated task management and customizable workflow builders.',
      status: 'Not Installed',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'easelearn',
      name: 'EaseLearn',
      icon: GraduationCap,
      description: 'Comprehensive learning management system with certification tracking.',
      status: 'Locked',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'finance',
      name: 'Finance IQ',
      icon: Calculator,
      description: 'Chart of accounts management, financial reporting, and accounting intelligence.',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  const handleModuleClick = (moduleId: string, status: string) => {
    if (status === 'Active') {
      setActiveModule(moduleId);
    }
  };

  const getButtonForStatus = (moduleId: string, status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Button 
            className="w-full"
            onClick={() => handleModuleClick(moduleId, status)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {moduleId === 'finance' ? 'Open Finance IQ' : 'Configure'}
          </Button>
        );
      case 'Locked':
      case 'Not Installed':
        return (
          <Button variant="outline" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        );
      default:
        return (
          <Button variant="outline" className="w-full">
            Install
          </Button>
        );
    }
  };

  // Show Finance IQ module if selected
  if (activeModule === 'finance') {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveModule(null)}
            className="mr-4"
          >
            ← Back to HaaLO IQ
          </Button>
          <h2 className="text-xl font-semibold">Finance IQ</h2>
        </div>
        {companyId ? (
          <FinanceIQ companyId={companyId} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Company ID required to access Finance IQ
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-primary" />
          HaaLO IQ - Module Management
        </h3>
        <p className="text-muted-foreground">
          Manage and configure HaaLO modules for {clientName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card key={module.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <Badge className={module.statusColor}>{module.status}</Badge>
                </div>
                <CardTitle className="text-lg">{module.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                {getButtonForStatus(module.id, module.status)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};