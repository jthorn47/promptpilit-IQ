import React, { useEffect, useState } from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { Shield, Lock } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecureFormWrapperProps {
  children: React.ReactNode;
  resourceType: string;
  requiresEncryption?: boolean;
  sensitiveFields?: string[];
  className?: string;
}

export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  resourceType,
  requiresEncryption = false,
  sensitiveFields = [],
  className = ''
}) => {
  const { isSecureSession, logSecurityEvent, checkDataAccess } = useSecurity();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [resourceType]);

  const checkAccess = async () => {
    try {
      const canAccess = await checkDataAccess(resourceType, 'modify');
      setHasAccess(canAccess);
      
      if (!canAccess) {
        await logSecurityEvent({
          event_type: 'access_denied',
          resource_type: resourceType,
          description: `Unauthorized access attempt to ${resourceType}`,
          risk_level: 'high'
        });
      }
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSecureSession) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Insecure session detected. Please log out and log back in to access this form.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasAccess === false) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You do not have permission to access this resource. Contact your administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`secure-form-wrapper ${className}`}>
      {requiresEncryption && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <Shield className="h-4 w-4" />
            <span>This form uses end-to-end encryption for sensitive data</span>
          </div>
          {sensitiveFields.length > 0 && (
            <div className="mt-2 text-xs text-green-700">
              Encrypted fields: {sensitiveFields.join(', ')}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};