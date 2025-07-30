// Case Management Module Exports
export * from './types';
export * from './services/CaseService';
export * from './services/CaseIntelligenceService';
export * from './services/ClientExperienceService';
export * from './hooks/useCaseService';
export * from './components/CasesManager';
export * from './components/PulseMainDashboard';
export * from './components/CaseIntelligenceDashboard';
export * from './components/SLAConfigManager';
export * from './components/ClientCaseTimeline';
export * from './components/ClientDashboard';
export * from './components/CaseVisibilityControls';

// Re-export for backward compatibility
export { usePulseCases as useCases } from './hooks/usePulseCases';