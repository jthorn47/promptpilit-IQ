import { AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PayrollEngineSource } from '@/domains/payroll/types/mockPayrollEngine';

interface EngineStatusIndicatorProps {
  engineSource: PayrollEngineSource;
  className?: string;
}

export function EngineStatusIndicator({ engineSource, className }: EngineStatusIndicatorProps) {
  if (engineSource === 'mock') {
    return (
      <Badge variant="destructive" className={className}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        Mock Engine - Testing Only
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={className}>
      <CheckCircle className="w-3 h-3 mr-1" />
      TaxIQ Engine
    </Badge>
  );
}