import { TwoFactorVerification } from '@/components/2fa/TwoFactorVerification';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Verify2FA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleVerificationSuccess = () => {
    // Mark 2FA as verified in the session
    sessionStorage.setItem('2fa_verified', 'true');
    // Redirect to dashboard or intended page after successful 2FA verification
    navigate('/');
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <TwoFactorVerification
      onSuccess={handleVerificationSuccess}
      onBack={handleBackToLogin}
    />
  );
};

export default Verify2FA;