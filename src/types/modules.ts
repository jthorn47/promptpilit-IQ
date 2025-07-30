export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'hr' | 'finance' | 'premium';
  isPremium: boolean;
  isBeta: boolean;
  isComingSoon: boolean;
  requiredSetup: boolean;
  setupWizardPath?: string;
  dependencies?: string[];
  thumbnail_url?: string;
  ai_generated_thumbnails?: Array<{id: number, image: string, prompt: string}>;
}

export interface ModuleStatus {
  enabled: boolean;
  setupComplete: boolean;
  lastConfigured?: string;
  configuredBy?: string;
}

export interface ClientModuleSettings {
  modules_enabled: string[];
  module_setup_status: Record<string, ModuleStatus>;
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'lms',
    name: 'Learning Management',
    description: 'Training modules, certifications, and employee development',
    icon: 'GraduationCap',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/training-modules',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'assessments',
    name: 'Risk Assessments',
    description: 'Company risk evaluation and compliance assessments',
    icon: 'FileSearch',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'payroll',
    name: 'Payroll Management',
    description: 'Employee compensation, tax calculations, and payment processing',
    icon: 'DollarSign',
    category: 'finance',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/payroll/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'ats',
    name: 'Applicant Tracking',
    description: 'Job postings, candidate management, and hiring workflows',
    icon: 'Users',
    category: 'hr',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/ats/setup',
    dependencies: ['lms'], // ATS requires LMS for training new hires
    thumbnail_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'New hire workflows, document collection, and setup processes',
    icon: 'UserPlus',
    category: 'hr',
    isPremium: false,
    isBeta: true,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/onboarding/setup',
    dependencies: ['lms', 'ats'], // Onboarding depends on both LMS and ATS
    thumbnail_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'benefits',
    name: 'Benefits Administration',
    description: 'Health insurance, retirement plans, and employee benefits',
    icon: 'Heart',
    category: 'hr',
    isPremium: true,
    isBeta: false,
    isComingSoon: true,
    requiredSetup: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'performance',
    name: 'Performance Management',
    description: 'Employee reviews, goal tracking, and performance analytics',
    icon: 'TrendingUp',
    category: 'hr',
    isPremium: true,
    isBeta: true,
    isComingSoon: false,
    requiredSetup: true,
    dependencies: ['lms'], // Performance management integrates with training
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'scheduling',
    name: 'Staff Scheduling',
    description: 'Shift management, time tracking, and workforce planning',
    icon: 'Calendar',
    category: 'core',
    isPremium: true,
    isBeta: false,
    isComingSoon: true,
    requiredSetup: true,
    dependencies: ['payroll'], // Scheduling integrates with payroll
    thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'processing_schedules',
    name: 'Processing Schedules',
    description: 'Automated payroll processing, batch scheduling, and payment timing',
    icon: 'Clock',
    category: 'finance',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/processing-schedules/setup',
    dependencies: ['payroll'], // Processing schedules require payroll module
    thumbnail_url: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'express_tracking',
    name: 'Express Tracking',
    description: 'Real-time shipment tracking, delivery notifications, and logistics management',
    icon: 'Truck',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: true,
    requiredSetup: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'hr_management',
    name: 'HR Management',
    description: 'Comprehensive HR functions, employee records, and administrative tools',
    icon: 'Users',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/hr/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'workers_comp',
    name: 'Workers Compensation',
    description: 'Workers comp claims management, safety reporting, and incident tracking',
    icon: 'Heart',
    category: 'hr',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/workers-comp/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'time_attendance',
    name: 'Time & Attendance',
    description: 'Employee clock in/out, time tracking, attendance management, and scheduling',
    icon: 'Clock',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/time-attendance/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'wpv_wizard',
    name: 'WPV Wizard',
    description: 'Workplace Violence Prevention plan builder and SB 553 compliance tool',
    icon: 'FileSearch',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/wpv-wizard/setup',
    dependencies: ['lms'], // Links to SBW-9237 training
    thumbnail_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer relationship management, sales pipeline, and client tracking',
    icon: 'Users',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/crm/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Regulatory compliance tracking, audit trails, and reporting dashboard',
    icon: 'FileSearch',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/compliance/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Custom reporting dashboard, data exports, and analytics tools',
    icon: 'TrendingUp',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/reports/setup',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&h=200&fit=crop'
  },
  {
    id: 'business_intelligence',
    name: 'Business Intelligence',
    description: 'Advanced analytics, data insights, and performance dashboards',
    icon: 'TrendingUp',
    category: 'premium',
    isPremium: true,
    isBeta: true,
    isComingSoon: false,
    requiredSetup: true,
    setupWizardPath: '/admin/bi/setup',
    dependencies: ['reports'], // BI builds on basic reporting
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&h=200&fit=crop'
  }
];