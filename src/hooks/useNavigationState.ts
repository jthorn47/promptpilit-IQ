import { useState, useCallback } from 'react';

interface OpenSections {
  [key: string]: boolean;
}

export const useNavigationState = () => {
  const [openSections, setOpenSections] = useState<OpenSections>({
    // Default all sections closed
    'halo-iq': false,
    'halo-payroll': false,
    'hro-iq': false,
    'connect-iq': false,
    'learning-management': false,
    'company-overview': false,
    'marketing-iq': false,
    'system': true  // Keep system open by default since user is on /launchpad/system
  });

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const openSection = useCallback((sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: true
    }));
  }, []);

  const closeSection = useCallback((sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: false
    }));
  }, []);

  const isSectionOpen = useCallback((sectionId: string) => {
    return openSections[sectionId] ?? false;
  }, [openSections]);

  return {
    openSections,
    toggleSection,
    openSection,
    closeSection,
    isSectionOpen
  };
};