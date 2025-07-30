import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkersCompManager } from '@/domains/payroll/components/WorkersCompManager';

export const PayrollWorkersCompPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName') || 'Unknown Client';

  const breadcrumbItems = [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Workers\' Compensation' }
  ];

  const handleGoBack = () => {
    if (clientId) {
      navigate(`/admin/crm/clients/${clientId}?tab=halo-payroll`);
    } else {
      navigate('/payroll');
    }
  };

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="p-6 space-y-6">

        {clientId ? (
          <WorkersCompManager companyId={clientId} />
        ) : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Select a Client</h3>
            <p className="text-muted-foreground mb-4">
              Please select a client to manage their workers' compensation codes
            </p>
          </div>
        )}
      </div>
    </>
  );
};