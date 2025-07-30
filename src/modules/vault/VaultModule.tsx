import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { VaultHomePage } from './pages/VaultHomePage';
import { VaultUploadPage } from './pages/VaultUploadPage';
import { PolicyArchivePage } from './pages/PolicyArchivePage';
import { TrainingCertificatesPage } from './pages/TrainingCertificatesPage';
import { LegalNoticesPage } from './pages/LegalNoticesPage';
import { VaultErrorBoundary } from './components/VaultErrorBoundary';

export const VaultModule: React.FC = () => {
  // Fix scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <VaultErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route index element={<VaultHomePage />} />
          <Route path="upload" element={<VaultUploadPage />} />
          <Route path="policy-archive" element={<PolicyArchivePage />} />
          <Route path="training-certificates" element={<TrainingCertificatesPage />} />
          <Route path="legal-notices" element={<LegalNoticesPage />} />
          <Route path="shared" element={<VaultHomePage />} />
          <Route path="search" element={<VaultHomePage />} />
          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<VaultHomePage />} />
        </Routes>
      </div>
    </VaultErrorBoundary>
  );
};

export default VaultModule;