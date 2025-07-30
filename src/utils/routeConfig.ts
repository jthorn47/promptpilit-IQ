// Route configuration for better organization
export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  signup: '/signup',
  
  // Authenticated routes  
  dashboard: '/', // Dashboard system removed - redirect to home
  company: '/company',
  employees: '/employees',
  training: '/training',
  
  // Domain routes
  learning: '/learning',
  compliance: '/compliance', 
  staffing: '/staffing',
  assessments: '/assessments',
  crm: '/crm',
  payroll: '/payroll',
  explainerVideos: '/explainer-videos',
  
  // Payroll sub-routes
  payrollDashboard: '/admin/payroll/dashboard',
  payrollF45: '/admin/payroll/f45-dashboard',
  payrollProcessing: '/admin/payroll/processing',
  payrollBenefits: '/admin/payroll/benefits',
  payrollPayTypes: '/admin/payroll/pay-types',
  payrollManager: '/payroll/manager',
} as const;

export type RouteKey = keyof typeof routes;
export type RoutePath = typeof routes[RouteKey];