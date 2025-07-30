import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaxEngineOverview } from '@/components/payroll/TaxEngineOverview';
import { ClientTaxSettings } from '@/components/payroll/ClientTaxSettings';
import { TaxEngineIntegrations } from '@/components/payroll/TaxEngineIntegrations';


export const PayrollTaxConfigPage: React.FC = () => {
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
            <FileText className="w-8 h-8 text-primary" />
            Tax Configuration 📋
          </h1>
          <p className="text-muted-foreground">
            {clientId ? `Manage tax configuration for ${clientName}` : 'Manage global tax configuration and engine settings'}
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Engine Overview
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Tax Engine Integrations
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              FEIN & SUTA Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TaxEngineOverview />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <TaxEngineIntegrations />
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            {clientId ? (
              <ClientTaxSettings clientId={clientId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>FEIN & SUTA Account Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Client Required</h3>
                    <p className="text-muted-foreground mb-4">
                      Please select a client to configure their tax settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};