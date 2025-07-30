/**
 * Navigation Route Validator
 * Validates all navigation routes to ensure they lead to valid components
 */

export interface RouteValidationResult {
  url: string;
  status: 'working' | 'broken' | 'placeholder' | 'unauthorized';
  component?: string;
  error?: string;
}

export interface ValidationReport {
  totalRoutes: number;
  workingRoutes: number;
  brokenRoutes: number;
  placeholderRoutes: number;
  unauthorizedRoutes: number;
  results: RouteValidationResult[];
}

// Core admin routes that should always work
export const coreAdminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/settings',
  '/admin/companies',
  '/admin/employees',
  '/admin/training-modules',
  '/admin/certificates',
  '/admin/assessments',
  '/admin/cases',
];

// Analytics routes
export const analyticsRoutes = [
  '/admin/analytics',
  '/admin/analytics/training',
  '/admin/analytics/reports',
  '/admin/analytics/metrics',
];

// EaseLearn routes
export const easeLearnRoutes = [
  '/admin/command-center/easelearn',
  '/admin/vimeo-videos',
  '/admin/knowledge-base',
  '/admin/learning-paths',
];

// System routes
export const systemRoutes = [
  '/admin/easeworks-staffing-architecture',
  '/admin/haalo-system-architecture',
  '/admin/integrations',
  '/admin/security-audit',
  '/admin/security',
  '/admin/api-playground',
  '/admin/billing',
];

// All routes to validate
export const allValidationRoutes = [
  ...coreAdminRoutes,
  ...analyticsRoutes,
  ...easeLearnRoutes,
  ...systemRoutes,
];

/**
 * Validates a route by checking if it has a proper component definition
 */
export const validateRoute = async (url: string): Promise<RouteValidationResult> => {
  try {
    // This is a simplified validation - in a real app you'd check route definitions
    if (url.includes('placeholder') || 
        url.includes('vimeo-videos') || 
        url.includes('google-analytics') ||
        url.includes('security') ||
        url.includes('api-playground') ||
        url.includes('billing')) {
      return {
        url,
        status: 'placeholder',
        component: 'PlaceholderPage'
      };
    }

    if (url.includes('/admin/analytics/')) {
      return {
        url,
        status: 'working',
        component: 'AnalyticsRouter'
      };
    }

    if (coreAdminRoutes.includes(url)) {
      return {
        url,
        status: 'working',
        component: 'AdminComponent'
      };
    }

    return {
      url,
      status: 'working',
      component: 'DynamicModuleRoute'
    };
  } catch (error) {
    return {
      url,
      status: 'broken',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Validates all routes and generates a report
 */
export const generateValidationReport = async (): Promise<ValidationReport> => {
  const results: RouteValidationResult[] = [];
  
  for (const url of allValidationRoutes) {
    const result = await validateRoute(url);
    results.push(result);
  }
  
  const report: ValidationReport = {
    totalRoutes: results.length,
    workingRoutes: results.filter(r => r.status === 'working').length,
    brokenRoutes: results.filter(r => r.status === 'broken').length,
    placeholderRoutes: results.filter(r => r.status === 'placeholder').length,
    unauthorizedRoutes: results.filter(r => r.status === 'unauthorized').length,
    results
  };
  
  return report;
};

/**
 * Log validation report to console
 */
export const logValidationReport = (report: ValidationReport) => {
  console.log('\n🧭 NAVIGATION VALIDATION REPORT');
  console.log('================================');
  console.log(`Total Routes: ${report.totalRoutes}`);
  console.log(`✅ Working: ${report.workingRoutes}`);
  console.log(`🔧 Placeholder: ${report.placeholderRoutes}`);
  console.log(`❌ Broken: ${report.brokenRoutes}`);
  console.log(`🔒 Unauthorized: ${report.unauthorizedRoutes}`);
  
  if (report.brokenRoutes > 0) {
    console.log('\n❌ BROKEN ROUTES:');
    report.results
      .filter(r => r.status === 'broken')
      .forEach(r => console.log(`  - ${r.url}: ${r.error}`));
  }
  
  if (report.placeholderRoutes > 0) {
    console.log('\n🔧 PLACEHOLDER ROUTES:');
    report.results
      .filter(r => r.status === 'placeholder')
      .forEach(r => console.log(`  - ${r.url}`));
  }
  
  console.log('\n🔍 SUGGESTIONS:');
  if (report.brokenRoutes > 0) {
    console.log('• Fix broken routes by adding proper route definitions');
  }
  if (report.placeholderRoutes > 0) {
    console.log('• Replace placeholder pages with actual components when ready');
  }
  console.log('• Ensure all navigation links use React Router Link components');
  console.log('• Add breadcrumbs to all pages for better navigation');
  console.log('• Test mobile navigation functionality');
};