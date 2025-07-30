import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PayConfigurationManager } from '@/components/payroll/PayConfigurationManager';


export const PayrollBasicSettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName') || 'Unknown Client';

  const handleGoBack = () => {
    if (clientId) {
      navigate(`/admin/crm/clients/${clientId}?tab=halo-payroll`);
    } else {
      navigate('/payroll');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Basic Settings ⚙️
          </h1>
          <p className="text-muted-foreground">
            {clientId ? `Configure basic payroll settings for ${clientName}` : 'Configure global basic payroll settings'}
          </p>
        </div>
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Payroll Settings</span>
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {clientId ? 'Client' : 'Payroll'}
          </Button>
        </div>

        {clientId ? (
          <PayConfigurationManager clientId={clientId} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Client Required</h3>
                <p className="text-muted-foreground">
                  Please select a client to configure payroll settings
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};