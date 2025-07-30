import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield } from 'lucide-react';
import { HROIQClientDashboard } from '../HROIQClientDashboard';

export const HROIQClientRoute: React.FC = () => {
  console.log('🔍 HROIQClientRoute rendering');
  const navigate = useNavigate();
  const clientId = 'demo-client-123'; // This could be from URL params or context
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/hro-iq')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HRO IQ Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HRO IQ - Client Dashboard</h1>
              <p className="text-muted-foreground">Human Resource Outsourcing Intelligence Platform</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Active Retainer
        </Badge>
      </div>

      <HROIQClientDashboard
        clientId={clientId}
        onRequestSupport={() => navigate('/admin/hro-iq/service-log')}
        onSendOnboarding={() => navigate('/admin/hro-iq/onboarding')}
        onUploadDocs={() => console.log('Upload docs functionality')}
        onViewHistory={() => navigate('/admin/hro-iq/service-log')}
      />
    </div>
  );
};

export default HROIQClientRoute;