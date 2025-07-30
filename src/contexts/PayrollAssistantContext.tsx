import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PayrollContext {
  currentEmployee?: string;
  currentPayPeriod?: string;
  currentPage?: string;
  activeIssues?: number;
  recentActions?: string[];
}

interface PayrollAssistantContextType {
  context: PayrollContext;
  updateContext: (updates: Partial<PayrollContext>) => void;
  addAction: (action: string) => void;
}

const PayrollAssistantContext = createContext<PayrollAssistantContextType | undefined>(undefined);

export const PayrollAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [context, setContext] = useState<PayrollContext>({
    recentActions: []
  });

  const updateContext = (updates: Partial<PayrollContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  };

  const addAction = (action: string) => {
    setContext(prev => ({
      ...prev,
      recentActions: [action, ...(prev.recentActions || [])].slice(0, 10)
    }));
  };

  return (
    <PayrollAssistantContext.Provider value={{ context, updateContext, addAction }}>
      {children}
    </PayrollAssistantContext.Provider>
  );
};

export const usePayrollAssistant = () => {
  const context = useContext(PayrollAssistantContext);
  if (!context) {
    throw new Error('usePayrollAssistant must be used within PayrollAssistantProvider');
  }
  return context;
};