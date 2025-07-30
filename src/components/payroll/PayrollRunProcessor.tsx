
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundTaxProcessor } from './BackgroundTaxProcessor';
import { PayrollTaxAudit } from './PayrollTaxAudit';

interface PayrollRunProcessorProps {
  payrollRun: {
    id: string;
    company_id: string;
    pay_period_start: string;
    pay_period_end: string;
    pay_date: string;
    status: string;
  };
}

export const PayrollRunProcessor: React.FC<PayrollRunProcessorProps> = ({
  payrollRun
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Run Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Pay Period:</span>
              <span className="ml-2">
                {new Date(payrollRun.pay_period_start).toLocaleDateString()} - {' '}
                {new Date(payrollRun.pay_period_end).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium">Pay Date:</span>
              <span className="ml-2">{new Date(payrollRun.pay_date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 capitalize">{payrollRun.status}</span>
            </div>
            <div>
              <span className="font-medium">Run ID:</span>
              <span className="ml-2 font-mono text-xs">{payrollRun.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <BackgroundTaxProcessor
        payrollRunId={payrollRun.id}
        companyId={payrollRun.company_id}
        payPeriodStart={payrollRun.pay_period_start}
        payPeriodEnd={payrollRun.pay_period_end}
        payDate={payrollRun.pay_date}
      />

      <PayrollTaxAudit companyId={payrollRun.company_id} />
    </div>
  );
};
