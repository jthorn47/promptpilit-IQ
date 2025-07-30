import React from 'react';
import { useNavigate } from 'react-router-dom';

export const VaultUploadPage = () => {
  const navigate = useNavigate();

  // Redirect to the main vault page with upload tab active
  React.useEffect(() => {
    navigate('/halo/vault?tab=upload');
  }, [navigate]);

  return null;
};