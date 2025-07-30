interface FeatureFlags {
  // Vault features
  documentStorage: boolean;
  accessControl: boolean;
  vaultCompliance: boolean;
  
  // Pulse CMS features
  contentManagement: boolean;
  caseWorkflows: boolean;
  communicationHub: boolean;
  
  // VaultPay features
  paymentProcessing: boolean;
  paymentSecurity: boolean;
  paymentAnalytics: boolean;
  
  // DataBridge features
  dataIntegration: boolean;
  etlProcessing: boolean;
  dataAnalytics: boolean;
  
  // Connect IQ features
  contactManagement: boolean;
  connectCommunicationHub: boolean;
  salesAnalytics: boolean;
  
  // TimeTrack features
  timeTracking: boolean;
  attendanceManagement: boolean;
  timeAnalytics: boolean;
  
  // CompX features
  wageManagement: boolean;
  performanceIncentives: boolean;
  compensationAnalytics: boolean;
  
  // ComplyIQ features
  policyManagement: boolean;
  riskAssessment: boolean;
  complianceTracking: boolean;
  
  // Report IQ features
  advancedAnalytics: boolean;
  visualReports: boolean;
  predictiveAnalytics: boolean;
  
  // Benefits IQ features
  benefitsEnrollment: boolean;
  planManagement: boolean;
  benefitsAnalytics: boolean;
  
  // Tax IQ features
  taxCalculations: boolean;
  taxReporting: boolean;
  taxCompliance: boolean;
}

export const featureFlags: FeatureFlags = {
  // Vault features - All fully functional
  documentStorage: true,
  accessControl: true,
  vaultCompliance: true,
  
  // Pulse CMS features - All fully functional
  contentManagement: true,
  caseWorkflows: true,
  communicationHub: true,
  
  // VaultPay features - All fully functional
  paymentProcessing: true,
  paymentSecurity: true,
  paymentAnalytics: true,
  
  // DataBridge features - All fully functional
  dataIntegration: true,
  etlProcessing: true,
  dataAnalytics: true,
  
  // Connect IQ features - All fully functional
  contactManagement: true,
  connectCommunicationHub: true,
  salesAnalytics: true,
  
  // TimeTrack features - All fully functional
  timeTracking: true,
  attendanceManagement: true,
  timeAnalytics: true,
  
  // CompX features - All fully functional
  wageManagement: true,
  performanceIncentives: true,
  compensationAnalytics: true,
  
  // ComplyIQ features - All fully functional
  policyManagement: true,
  riskAssessment: true,
  complianceTracking: true,
  
  // Report IQ features - All fully functional
  advancedAnalytics: true,
  visualReports: true,
  predictiveAnalytics: true,
  
  // Benefits IQ features - All fully functional
  benefitsEnrollment: true,
  planManagement: true,
  benefitsAnalytics: true,
  
  // Tax IQ features - All fully functional
  taxCalculations: true,
  taxReporting: true,
  taxCompliance: true,
};

export type FeatureFlagKey = keyof FeatureFlags;