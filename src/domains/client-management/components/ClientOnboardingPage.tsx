import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, FileText, Settings, CheckCircle } from 'lucide-react';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientOnboardingPage: React.FC = () => {
  const onboardingSteps = [
    {
      id: 1,
      title: 'Client Information',
      description: 'Collect basic client details and contact information',
      icon: UserPlus,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Document Collection',
      description: 'Gather required legal and business documents',
      icon: FileText,
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'System Configuration',
      description: 'Set up client-specific settings and preferences',
      icon: Settings,
      status: 'pending'
    },
    {
      id: 4,
      title: 'Final Review',
      description: 'Review all information and activate client account',
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StandardLayout 
      title="Client Onboarding"
      subtitle="Streamlined client setup and configuration"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Start New Onboarding
          </Button>
        </div>

        {/* Onboarding Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Process</CardTitle>
            <CardDescription>Follow these steps to successfully onboard new clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {onboardingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    {index < onboardingSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Onboarding Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Onboarding Sessions</CardTitle>
            <CardDescription>Clients currently in the onboarding process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
              <p className="text-muted-foreground mb-4">Start a new client onboarding process to see it here</p>
              <Button variant="outline">
                Start Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};