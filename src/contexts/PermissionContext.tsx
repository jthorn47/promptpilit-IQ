import { createContext, useContext, ReactNode } from 'react';
import { usePermissionEngine, UsePermissionEngineReturn } from '@/hooks/usePermissionEngine';

const PermissionContext = createContext<UsePermissionEngineReturn | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const permissionEngine = usePermissionEngine();
  
  return (
    <PermissionContext.Provider value={permissionEngine}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};