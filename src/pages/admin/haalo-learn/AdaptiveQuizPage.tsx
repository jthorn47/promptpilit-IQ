import React from 'react';
import { AdaptiveQuizManager } from '@/components/adaptive-quiz/AdaptiveQuizManager';
import { useAuth } from '@/contexts/AuthContext';

export const AdaptiveQuizPage = () => {
  const { companyId, isSuperAdmin } = useAuth();
  
  // For super admin, we'll show data from all companies or allow company selection
  // For now, we'll use a default company or show a message
  const effectiveCompanyId = isSuperAdmin && !companyId ? 'all' : companyId;
  
  return (
    <div className="space-y-6">
      <AdaptiveQuizManager companyId={effectiveCompanyId || ''} />
    </div>
  );
};

export default AdaptiveQuizPage;