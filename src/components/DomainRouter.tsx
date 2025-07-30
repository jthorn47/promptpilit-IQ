
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';
// Import Landing directly to avoid module loading errors
import Landing from '@/pages/Landing';
import HaaLOLanding from '@/pages/HaaLOLanding';
import Assessment from '@/domains/assessments/pages/Assessment';
import { logger } from '@/lib/logger';

const DomainRouter: React.FC = () => {
  const { user, loading, isSuperAdmin, isCompanyAdmin, isClientAdmin, isAdmin, isLearner, userRoles, signOut, justLoggedOut } = useAuth();
  const { hasRole, canManageSystem } = usePermissionContext();
  
  console.log('🎯 DomainRouter: Current state', { 
    user: user ? { id: user.id, email: user.email } : null, 
    loading,
    isSuperAdmin,
    isCompanyAdmin,
    isClientAdmin,
    isAdmin,
    isLearner,
    userRoles,
    location: window.location.href
  });
  
  console.log('🎯 DomainRouter: Role check details', { 
    hasUser: !!user, 
    isSuperAdmin, 
    isCompanyAdmin,
    isClientAdmin,
    isAdmin,
    isLearner,
    userRoles,
    notLoading: !loading 
  });
  
  // Memoize domain checks to prevent re-renders
  const domainInfo = useMemo(() => {
    const currentDomain = window.location.hostname;
    const currentUrl = window.location.href;
    const isHaaLODomain = currentDomain === 'haaloiq.app' || 
                         currentDomain === 'www.haaloiq.app' ||
                         currentDomain.includes('haaloiq');
    const isScoreDomain = currentDomain === 'score.easelearn.com' || 
                         currentDomain === 'score.easeworks.com' ||
                         currentDomain.includes('score');
    const isAssessmentDomain = currentDomain === 'easeworks.com' ||
                              currentDomain === 'www.easeworks.com' ||
                              isScoreDomain;
    
    logger.ui.debug('Domain routing analysis', {
      currentDomain,
      currentUrl,
      isHaaLODomain,
      isScoreDomain,
      isAssessmentDomain,
      locationHostname: window.location.hostname,
      locationHref: window.location.href
    });
    
    return {
      currentDomain,
      currentUrl,
      isHaaLODomain,
      isScoreDomain,
      isAssessmentDomain
    };
  }, []);
  
  // HaaLO domain - show HaaLO landing page
  if (domainInfo.isHaaLODomain) {
    logger.ui.info('HaaLO domain detected, showing HaaLO landing page', { 
      domain: domainInfo.currentDomain
    });
    return <HaaLOLanding />;
  }

  // Assessment domain - show assessment directly on root
  if (domainInfo.isAssessmentDomain) {
    console.log('🎯 Assessment domain detected:', { 
      domain: domainInfo.currentDomain,
      isScoreDomain: domainInfo.isScoreDomain,
      component: 'Assessment'
    });
    logger.ui.info('Assessment domain detected, showing assessment directly', { 
      domain: domainInfo.currentDomain
    });
    return <Assessment />;
  }
  
  // Loading state - wait for auth to resolve completely
  if (loading) {
    console.log('🔄 DomainRouter: Auth still loading, showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to appropriate launchpad
  // But only if they navigated here directly, not from a logout
  if (user && !justLoggedOut) {
    console.log('🎯 DomainRouter: Authenticated user detected on root route, redirecting to launchpad');
    
    // Determine redirect path based on user role - redirect to launchpad/system
    let redirectPath = '/launchpad/system'; // main system launchpad for all authenticated users
    
    // All authenticated users get the system launchpad
    if (isSuperAdmin) {
      redirectPath = '/launchpad/system'; // Super admins get system launchpad
    } else if (isCompanyAdmin) {
      redirectPath = '/launchpad/system'; // Company admins also get system launchpad
    } else if (isClientAdmin) {
      redirectPath = '/launchpad/system'; // Client admins also get system launchpad
    } else if (isAdmin) {
      redirectPath = '/launchpad/system'; // Regular admins also get system launchpad
    } else if (isLearner) {
      redirectPath = '/launchpad/system'; // Even learners get system launchpad
    }
    
    logger.ui.info('Redirecting authenticated user to launchpad', { 
      userId: user.id,
      roles: userRoles,
      redirectPath
    });
    
    return <Navigate to={redirectPath} replace />;
  }
  
  // Show original Landing page for unauthenticated users
  logger.ui.info('Showing original Landing page for unauthenticated user');
  return <Landing />;
};

export default DomainRouter;
