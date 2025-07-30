import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalLoadingFallback } from '@/components/ui/LoadingFallback';

interface CRMCommandCenterProps {
  // Add any props here
}

export const CRMCommandCenter: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      handleRoleBasedNavigation();
    }
  }, [user, loading, navigate]);

  const handleRoleBasedNavigation = () => {
    const userRole = user?.user_metadata?.role;
    
    switch (userRole) {
      case 'super_admin':
      case 'system_admin':
        navigate('/launchpad/system');
        break;
      case 'admin':
        navigate('/launchpad/admin');
        break;
      case 'client':
        navigate('/launchpad/client');
        break;
      case 'learner':
        navigate('/launchpad/learner');
        break;
      case 'employee':
        navigate('/launchpad/employee');
        break;
      default:
        navigate('/launchpad');
    }
  };

  if (loading) {
    return <GlobalLoadingFallback />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div>
        {user ? (
          <>
            <p className="text-lg">Redirecting you to your command center...</p>
          </>
        ) : (
          <p className="text-lg">Please authenticate to continue.</p>
        )}
      </div>
    </div>
  );
};
