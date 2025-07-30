import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, X } from "lucide-react";
import { useSecurity } from '@/contexts/SecurityContext';

export const SecurityBanner: React.FC = () => {
  const { securityAlerts, isSecureSession } = useSecurity();
  
  const criticalAlerts = securityAlerts.filter(alert => 
    alert.type === 'critical' && !alert.resolved
  );
  
  const highAlerts = securityAlerts.filter(alert => 
    alert.type === 'high' && !alert.resolved
  );

  if (criticalAlerts.length === 0 && highAlerts.length === 0) {
    return null;
  }

  const handleDismissAlert = (alertId: string) => {
    // Mark alert as resolved - this would typically call an API
    console.log('Dismissing alert:', alertId);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        {criticalAlerts.map(alert => (
          <Alert key={alert.id} className="mb-2 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AlertDescription className="text-red-800 font-medium">
                  {alert.message}
                </AlertDescription>
                <Badge variant="destructive">CRITICAL</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismissAlert(alert.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}
        
        {highAlerts.length > 0 && criticalAlerts.length === 0 && (
          <Alert className="border-orange-500 bg-orange-50">
            <Shield className="h-4 w-4 text-orange-600" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AlertDescription className="text-orange-800">
                  {highAlerts.length} high-priority security alert{highAlerts.length > 1 ? 's' : ''} require attention
                </AlertDescription>
                <Badge variant="secondary">HIGH</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-800"
              >
                View Details
              </Button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};