
import React from 'react';
import { HaaLOModule } from '../core/ModuleLoader';
import { BarChart3, Brain, FileText, Heart, DollarSign } from 'lucide-react';

// Lazy load heavy components to improve initial bundle size
const HaloIQDashboard = React.lazy(() => 
  import('./components/HaloIQDashboard').then(m => ({ default: m.HaloIQDashboard }))
);

const AdminReportBoard = React.lazy(() => 
  import('./components/AdminReportBoard').then(m => ({ default: m.AdminReportBoard }))
);

const GlobalReportLibrary = React.lazy(() => 
  import('./components/GlobalReportLibrary').then(m => ({ default: m.GlobalReportLibrary }))
);

const BenefitsIQv11 = React.lazy(() => 
  import('./components/BenefitsIQv11').then(m => ({ default: m.BenefitsIQv11 }))
);

const FinanceIQ = React.lazy(() => 
  import('./components/FinanceIQ').then(m => ({ default: m.FinanceIQ }))
);

const ChartOfAccounts = React.lazy(() => 
  import('./components/FinanceIQ/ChartOfAccounts').then(m => ({ default: m.ChartOfAccounts }))
);

const GeneralLedger = React.lazy(() => 
  import('./components/FinanceIQ/GeneralLedger/index').then(m => ({ default: m.GeneralLedgerModule }))
);

const TrialBalance = React.lazy(() => 
  import('./components/FinanceIQ/TrialBalance').then(m => ({ default: m.TrialBalance }))
);

const ProfitLoss = React.lazy(() => 
  import('./components/FinanceIQ/ProfitLoss').then(m => ({ default: m.ProfitLoss }))
);

const BalanceSheet = React.lazy(() => 
  import('./components/FinanceIQ/BalanceSheet').then(m => ({ default: m.BalanceSheet }))
);

const Clients = React.lazy(() => 
  import('./components/FinanceIQ/Clients').then(m => ({ default: m.Clients }))
);

const Vendors = React.lazy(() => 
  import('./components/FinanceIQ/Vendors').then(m => ({ default: m.Vendors }))
);

const ImportGeneralLedger = React.lazy(() => 
  import('./components/FinanceIQ/ImportGeneralLedger').then(m => ({ default: m.ImportGeneralLedger }))
);

export const HaloIQModule: HaaLOModule = {
  metadata: {
    id: 'haalo.reportiq',
    name: 'Report IQ',
    version: '1.0.0',
    description: 'AI-powered report builder with natural language queries',
    icon: 'Brain',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#655DC6'
  },
  routes: [
    {
      path: '/halo/iq',
      component: HaloIQDashboard,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/halo/finance',
      component: FinanceIQ,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/chart-of-accounts',
      component: ChartOfAccounts,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/general-ledger',
      component: GeneralLedger,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/trial-balance',
      component: TrialBalance,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/profit-loss',
      component: ProfitLoss,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/balance-sheet',
      component: BalanceSheet,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/clients',
      component: Clients,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/finance/vendors',
      component: Vendors,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/admin/reports/admin',
      component: AdminReportBoard,
      exact: true,
      roles: ['super_admin']
    },
    {
      path: '/admin/reports/library',
      component: GlobalReportLibrary,
      exact: true,
      roles: ['company_admin', 'super_admin']
    },
    {
      path: '/halo/benefitsiq',
      component: BenefitsIQv11,
      exact: true,
      roles: ['company_admin', 'super_admin']
    }
  ],
  menu: [
    {
      id: 'finance-iq',
      label: 'Finance IQ',
      icon: 'DollarSign',
      children: [
        {
          id: 'finance-dashboard',
          label: 'Finance Dashboard',
          icon: 'BarChart3',
          path: '/halo/finance'
        },
        {
          id: 'chart-of-accounts',
          label: 'Chart of Accounts',
          icon: 'FileText',
          path: '/finance/chart-of-accounts'
        },
        {
          id: 'general-ledger',
          label: 'General Ledger',
          icon: 'Book',
          path: '/finance/general-ledger'
        },
        {
          id: 'trial-balance',
          label: 'Trial Balance',
          icon: 'Scale',
          path: '/finance/trial-balance'
        },
        {
          id: 'profit-loss',
          label: 'Profit & Loss',
          icon: 'TrendingUp',
          path: '/finance/profit-loss'
        },
        {
          id: 'balance-sheet',
          label: 'Balance Sheet',
          icon: 'BarChart3',
          path: '/finance/balance-sheet'
        },
        {
          id: 'vendors',
          label: 'Vendors',
          icon: 'Building2',
          path: '/finance/vendors'
        },
        {
          id: 'clients',
          label: 'Clients',
          icon: 'Users',
          path: '/finance/clients'
        }
      ]
    },
    {
      id: 'report-iq',
      label: 'Report IQ',
      icon: 'Brain',
      children: [
        {
          id: 'halo-iq-dashboard',
          label: 'Report IQ',
          icon: 'BarChart3',
          path: '/halo/iq'
        },
        {
          id: 'report-library',
          label: 'Report Library',
          icon: 'FileText',
          path: '/admin/reports/library'
        },
        {
          id: 'admin-reports',
          label: 'Admin Board',
          icon: 'Shield',
          path: '/admin/reports/admin'
        },
        {
          id: 'benefits-iq-v11',
          label: 'Benefits IQ v1.1',
          icon: 'Heart',
          path: '/halo/benefitsiq'
        }
      ]
    }
  ],
  initialize: async () => {
    console.log('Halo IQ module initialized');
  },
  destroy: async () => {
    console.log('Halo IQ module destroyed');
  },
  getComponent: () => HaloIQDashboard
};

// Register the module
import { RegisterModule, moduleRegistry } from '../core/ModuleLoader';
console.log('🔧 Registering HaloIQ module with routes:', HaloIQModule.routes);
RegisterModule(HaloIQModule);

// Register Benefits IQ v1.1 as a separate module
const BenefitsIQv11Module: HaaLOModule = {
  metadata: {
    id: 'haalo.benefitsiq-v11',
    name: 'Benefits IQ',
    version: '1.1.0',
    description: 'Advanced benefits intelligence and analytics',
    icon: 'Heart',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#e11d48'
  },
  routes: [
    {
      path: '/halo/benefitsiq',
      component: BenefitsIQv11,
      exact: true,
      roles: ['company_admin', 'super_admin']
    }
  ],
  menu: [],
  initialize: async () => {
    console.log('Benefits IQ v1.1 module initialized');
  },
  destroy: async () => {
    console.log('Benefits IQ v1.1 module destroyed');
  },
  getComponent: () => BenefitsIQv11
};

console.log('🔧 Registering BenefitsIQ v1.1 module with routes:', BenefitsIQv11Module.routes);
RegisterModule(BenefitsIQv11Module);

// Set module access and load both modules
console.log('🔧 Setting module access and loading HaloIQ modules...');
moduleRegistry.setModuleAccess(HaloIQModule.metadata.id, true);
moduleRegistry.loadModule(HaloIQModule.metadata.id);
moduleRegistry.setModuleAccess(BenefitsIQv11Module.metadata.id, true);
moduleRegistry.loadModule(BenefitsIQv11Module.metadata.id);
console.log('🔧 HaloIQ modules loaded. Available routes:', moduleRegistry.getAllRoutes().map(r => r.path));
