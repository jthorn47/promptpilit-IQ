// Simplified version for build stability - TODO: implement full functionality after schema fixes

export interface AlertSettings {
  isEnabled: boolean;
  thresholdDays: number;
  riskThreshold: number;
}

export interface AlertType {
  id: string;
  name: string;
  type: string;
}

export const useCRMAlerts = () => {
  return {
    alerts: [],
    loading: false,
    error: null,
    markAsRead: () => {},
    dismissAlert: () => {},
    getAlertsByType: () => [],
    getUserAlerts: () => [],
    getTaskAlerts: () => [],
    getOpportunityAlerts: () => [],
    getRiskAlerts: () => [],
    getAlertSettings: () => ({ isEnabled: false, thresholdDays: 30, riskThreshold: 70 }),
    updateAlertSettings: () => {},
    sendWeeklyDigest: () => {},
    checkSpecificAlertTrigger: () => false
  };
};