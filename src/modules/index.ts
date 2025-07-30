
/**
 * Module Registry Entry Point
 * Import all modules here to register them automatically
 */

// Import SuperAdmin Launchpad module
import './SuperAdmin.Launchpad';

// Import HaaLO Payroll module
import './HaaLO.Payroll';

// Import all modules to register them
import './HaaLO.OrgSettings';
import './HaaLO.CRM';
import './HaaLO.TimeTracking';
import './HaaLO.LeaveManagement';
import './HaaLO.Compliance';
import './HaaLO.Documents';
import './HaaLO.TasksWorkflows';
// Removed HaaLO.Admin module registration
import './HaaLO.CaseManagement';
import './HaaLO.CommunicationsIQ';

// HaaLO Pay Stub Generator
import './HaaLO.PayStubGenerator';
// HaaLO Payroll Batch Processor
import './HaaLO.PayrollBatchProcessor';
// HaaLO Direct Deposit Handler
import './HaaLO.DirectDepositHandler';
// HaaLO Tax Filing Engine
import './HaaLO.TaxFilingEngine';

// HaaLO IQ Premium Modules
import './HaaLO.Vault';
import './HaaLO.PulseCMS';
// Re-enabled placeholder modules
import './HaaLO.PropGEN';
import './HaaLO.OnboardX';
import './HaaLO.TimeTrack';
import './HaaLO.SecureForms';
import './HaaLO.CompX';
import './HaaLO.VaultPay';

import './HaaLO.ComplyIQ';
import './HaaLO.DataBridge';

// EaseLearn microservices modules
import './EaseLearn.Dashboard';
import './EaseLearn.Admin';
import './EaseLearn.Courses';
import './EaseLearn.Media';
import './EaseLearn.Users';
import './EaseLearn.Certificates';
import './EaseLearn.Renewals';
import './EaseLearn.MyLearning';
import './EaseLearn.MyCertificates';
import './EaseLearn.LearningPaths';
import './EaseLearn.KB';
import './EaseLearnX.Analytics';

// Import Halo IQ module
import './HaaLO.HaloIQ';

// Import HRO IQ modules
import './HaaLO.HROIQ';
import './SimpleHROIQTest';

// Import child page modules
import './ConnectIQ';
import './PayrollIQ';
import './HaloIQ';

// Export the module registry for external use
export { moduleRegistry } from './core/ModuleLoader';
export { ModuleRenderer } from './core/ModuleRenderer';
