import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { use2FA } from '@/hooks/use2FA';
import { Loader2 } from 'lucide-react';

interface TwoFactorProtectedRouteProps {
  children: React.ReactNode;
}

export const TwoFactorProtectedRoute: React.FC<TwoFactorProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { get2FAStatus } = use2FA();
  const [twoFAStatus, setTwoFAStatus] = useState<{ isEnabled: boolean; isVerified: boolean } | null>(null);
  const [checkingTwoFA, setCheckingTwoFA] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!user) {
        setCheckingTwoFA(false);
        return;
      }

      try {
        const status = await get2FAStatus();
        // For now, we'll assume if 2FA is enabled, the user needs to verify it
        // In a real implementation, you'd track verification status in the session
        const isVerified = !status.isEnabled || sessionStorage.getItem('2fa_verified') === 'true';
        
        setTwoFAStatus({
          isEnabled: status.isEnabled,
          isVerified
        });
      } catch (error) {
        console.error('Error checking 2FA status:', error);
        setTwoFAStatus({ isEnabled: false, isVerified: true });
      } finally {
        setCheckingTwoFA(false);
      }
    };

    check2FAStatus();
  }, [user, get2FAStatus]);

  if (loading || checkingTwoFA) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Skip 2FA check for the setup and verification pages
  if (location.pathname === '/verify-2fa' || location.pathname === '/setup-2fa') {
    return <>{children}</>;
  }

  // If secure auth is not enabled, force user to set it up
  if (!twoFAStatus?.isEnabled) {
    return <Navigate to="/secure-setup" replace />;
  }

  // If 2FA is enabled but not verified, redirect to verification
  if (!twoFAStatus?.isVerified) {
    return <Navigate to="/verify-2fa" replace />;
  }

  return <>{children}</>;
};