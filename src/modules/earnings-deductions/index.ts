// Export main components
export { GlobalPayTypes } from './components/GlobalPayTypes';
export { ClientPayTypesManager } from './components/ClientPayTypesManager';

// Export dialogs
export { CreatePayTypeDialog } from './components/dialogs/CreatePayTypeDialog';
export { EditPayTypeDialog } from './components/dialogs/EditPayTypeDialog';

// Export pages
export { GlobalPayTypesPage } from './pages/GlobalPayTypesPage';
export { ClientPayTypesPage } from './pages/ClientPayTypesPage';

// Re-export hooks
export * from '@/hooks/usePayTypes';