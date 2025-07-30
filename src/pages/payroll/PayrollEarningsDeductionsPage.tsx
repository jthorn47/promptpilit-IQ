import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PayTypesManager } from '@/domains/payroll/components/PayTypesManager';
import { DeductionsManager } from '@/domains/payroll/components/DeductionsManager';
import { EnterprisePayrollManager } from '@/domains/payroll/components/EnterprisePayrollManager';


export const PayrollEarningsDeductionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName') || 'Unknown Client';
  
  const [isEarningsOpen, setIsEarningsOpen] = useState(true);
  const [isDeductionsOpen, setIsDeductionsOpen] = useState(true);
  const [useEnterpriseView, setUseEnterpriseView] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Earnings & Deductions 💰</h1>
          <p className="text-muted-foreground">
            {clientId ? 'Manage client-specific earnings and deduction selections' : 'Manage global earnings and deductions'}
          </p>
        </div>
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Payroll Settings</span>
      </div>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {clientId ? 'Client' : 'Payroll'}
          </Button>
          <Button 
            variant={useEnterpriseView ? "default" : "outline"} 
            onClick={() => setUseEnterpriseView(!useEnterpriseView)}
            size="sm"
          >
            {useEnterpriseView ? "Standard View" : "Enterprise View"}
          </Button>
        </div>

        {useEnterpriseView ? (
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Payroll Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enterprise View {clientId ? `for client: ${clientId}` : '(Global Settings)'}
              </p>
            </CardHeader>
            <CardContent>
              <EnterprisePayrollManager companyId={clientId || 'global'} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Earnings Section */}
            <Collapsible open={isEarningsOpen} onOpenChange={setIsEarningsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 hover:bg-transparent">
                  <Card className="w-full cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-success" />
                          Earnings & Pay Types
                        </div>
                        {isEarningsOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {clientId && <PayTypesManager companyId={clientId} />}
              </CollapsibleContent>
            </Collapsible>

            {/* Deductions Section */}
            <Collapsible open={isDeductionsOpen} onOpenChange={setIsDeductionsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 hover:bg-transparent">
                  <Card className="w-full cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-destructive" />
                          Deductions & Benefits
                        </div>
                        {isDeductionsOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {clientId && <DeductionsManager companyId={clientId} />}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  );
};