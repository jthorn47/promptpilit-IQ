import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Clock, Play, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { generateQAReport } from './FeedbackWidget';

interface TestCase {
  id: string;
  module: string;
  testName: string;
  url: string;
  description: string;
  requiredRoles?: string[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  errorMessage?: string;
  timestamp?: string;
}

const testSuites: TestCase[] = [
  // Dashboard - Admin routes to UnifiedDashboard by default
  { id: 'dashboard-1', module: 'Dashboard', testName: 'Admin Dashboard Load', url: '/admin', description: 'Admin unified dashboard loads correctly', status: 'pending' },
  
  // CRM Module
  { id: 'crm-1', module: 'CRM', testName: 'CRM Dashboard', url: '/admin/crm', description: 'CRM main dashboard', requiredRoles: ['admin', 'super_admin'], status: 'pending' },
  { id: 'crm-2', module: 'CRM', testName: 'Leads Management', url: '/admin/crm/leads', description: 'Leads page loads and displays data', requiredRoles: ['admin', 'super_admin'], status: 'pending' },
  { id: 'crm-3', module: 'CRM', testName: 'Deals Pipeline', url: '/admin/crm/deals', description: 'Deals pipeline view', requiredRoles: ['admin', 'super_admin'], status: 'pending' },
  { id: 'crm-4', module: 'CRM', testName: 'Activities Log', url: '/admin/crm/activities', description: 'CRM activities and timeline', requiredRoles: ['admin', 'super_admin'], status: 'pending' },
  { id: 'crm-5', module: 'CRM', testName: 'Clients Management', url: '/admin/clients', description: 'Client management interface', requiredRoles: ['admin', 'super_admin'], status: 'pending' },

  // Companies
  { id: 'companies-1', module: 'Companies', testName: 'Companies List', url: '/admin/companies', description: 'Companies listing page', requiredRoles: ['super_admin'], status: 'pending' },
  
  // Employees
  { id: 'employees-1', module: 'Employees', testName: 'Employee Management', url: '/admin/employees', description: 'Employee management interface', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  
  // Training & Learning
  { id: 'training-1', module: 'EaseLearn', testName: 'Training Modules', url: '/admin/training-modules', description: 'Training modules management', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  { id: 'training-2', module: 'EaseLearn', testName: 'Certificates', url: '/admin/certificates', description: 'Certificate management', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  { id: 'training-3', module: 'EaseLearn', testName: 'LMS Reports', url: '/admin/lms-reports', description: 'LMS reporting dashboard', requiredRoles: ['super_admin'], status: 'pending' },
  
  // Performance Management
  { id: 'performance-1', module: 'Performance', testName: 'Performance Dashboard', url: '/admin/performance', description: 'Performance evaluation dashboard', requiredRoles: ['company_admin', 'super_admin'], status: 'pending' },
  
  // Payroll
  { id: 'payroll-1', module: 'Payroll', testName: 'F45 Payroll', url: '/admin/f45-payroll', description: 'F45 payroll dashboard', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  
  // Compliance
  { id: 'compliance-1', module: 'Compliance', testName: 'Compliance Dashboard', url: '/admin/compliance', description: 'Compliance monitoring', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  
  // Cases
  { id: 'cases-1', module: 'Cases', testName: 'Case Management', url: '/admin/cases', description: 'Case management system', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  
  // Administration
  { id: 'admin-1', module: 'Administration', testName: 'User Management', url: '/admin/users', description: 'User management interface', status: 'pending' },
  { id: 'admin-2', module: 'Administration', testName: 'Settings', url: '/admin/settings', description: 'System settings', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
  { id: 'admin-3', module: 'Administration', testName: 'Integrations', url: '/admin/integrations', description: 'Integration management', requiredRoles: ['super_admin'], status: 'pending' },
  { id: 'admin-4', module: 'Administration', testName: 'Security Audit', url: '/admin/security-audit', description: 'Security audit panel', requiredRoles: ['super_admin'], status: 'pending' },
  
  // Architecture
  { id: 'system-1', module: 'System', testName: 'EaseWorks Architecture', url: '/admin/easeworks-architecture', description: 'EaseWorks architecture view', requiredRoles: ['super_admin'], status: 'pending' },
  { id: 'system-2', module: 'System', testName: 'HaaLO Architecture', url: '/admin/haalo-system-architecture', description: 'HaaLO system architecture', requiredRoles: ['super_admin'], status: 'pending' },
  
  // Proposals
  { id: 'proposals-1', module: 'Proposals', testName: 'Proposals Dashboard', url: '/admin/proposals', description: 'Proposal management dashboard', requiredRoles: ['super_admin', 'company_admin'], status: 'pending' },
];

export const QATestSuite = () => {
  const [tests, setTests] = useState<TestCase[]>(testSuites);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { hasRole: permHasRole } = usePermissionContext();

  const canRunTest = (test: TestCase) => {
    if (!test.requiredRoles) return true;
    // Use both legacy and new permission checking for compatibility
    return test.requiredRoles.some(role => hasRole(role as any));
  };

  const runSingleTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    console.log(`🧪 Starting test: ${test.testName} (${test.url})`);

    // Store the current URL to return to after test
    const returnUrl = '/admin/companies';

    setCurrentTest(testId);
    setTests(prev => prev.map(t => 
      t.id === testId 
        ? { ...t, status: 'running', timestamp: new Date().toISOString() }
        : t
    ));

    try {
      console.log(`🧪 Navigating to: ${test.url}`);
      // Navigate to the test URL
      navigate(test.url);
      
      // Wait longer for navigation and page load
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Check if we successfully navigated
      const currentUrl = window.location.pathname;
      console.log(`🧪 Current URL after navigation: ${currentUrl}, Expected: ${test.url}`);
      
      const urlMatch = currentUrl === test.url || currentUrl.startsWith(test.url);
      console.log(`🧪 URL Match: ${urlMatch}`);
      
      // Additional checks for page health
      let success = urlMatch;
      let errorMessage = '';
      
      if (!urlMatch) {
        success = false;
        errorMessage = `Failed to navigate to ${test.url}. Current URL: ${currentUrl}`;
        console.log(`🧪 ❌ Navigation failed: ${errorMessage}`);
      } else {
        // Check for common error indicators
        const hasErrorElements = document.querySelector('[role="alert"], .error, .alert-error, .text-red-500, .text-destructive');
        const hasLoadingSpinner = document.querySelector('.animate-spin');
        const hasEmptyContent = document.body.textContent?.trim().length === 0;
        
        // Check for successful content indicators
        const hasMainContent = document.querySelector('main, [data-testid], .card, .dashboard, h1, h2, .grid');
        const hasNavigation = document.querySelector('nav, [role="navigation"], .sidebar');
        
        console.log(`🧪 Page health check results:`, {
          hasErrorElements: !!hasErrorElements,
          hasLoadingSpinner: !!hasLoadingSpinner, 
          hasEmptyContent,
          hasMainContent: !!hasMainContent,
          hasNavigation: !!hasNavigation,
          bodyTextLength: document.body.textContent?.trim().length
        });
        
        // Log specific error elements if found
        if (hasErrorElements) {
          console.log(`🧪 Error elements found:`, hasErrorElements);
        }
        
        if (hasErrorElements) {
          success = false;
          errorMessage = 'Page loaded but contains error elements';
        } else if (hasEmptyContent) {
          success = false;
          errorMessage = 'Page loaded but appears to be empty';
        } else if (hasLoadingSpinner) {
          // If still loading after 4 seconds, consider it a failure
          success = false;
          errorMessage = 'Page is still loading after timeout';
        } else if (!hasMainContent) {
          success = false;
          errorMessage = 'Page loaded but appears to lack expected content';
        } else {
          success = true; // Page has content and no errors
          console.log(`🧪 ✅ Test passed - page loaded successfully`);
        }
      }
      
      console.log(`🧪 Final test result: ${success ? 'PASSED' : 'FAILED'} - ${errorMessage || 'Success'}`);
      
      setTests(prev => prev.map(t => 
        t.id === testId 
          ? { 
              ...t, 
              status: success ? 'passed' : 'failed',
              errorMessage: success ? undefined : errorMessage
            }
          : t
      ));

      // Navigate back to QA Dashboard after test completes
      console.log(`🧪 Navigating back to: ${returnUrl}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(returnUrl);
      
    } catch (error) {
      console.log(`🧪 ❌ Test failed with exception:`, error);
      setTests(prev => prev.map(t => 
        t.id === testId 
          ? { 
              ...t, 
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          : t
      ));
      
      // Still navigate back even if test failed
      navigate(returnUrl);
    }

    setCurrentTest(null);
    console.log(`🧪 Test ${test.testName} completed`);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (const test of tests) {
      if (!canRunTest(test)) {
        setTests(prev => prev.map(t => 
          t.id === test.id 
            ? { ...t, status: 'skipped', errorMessage: 'Insufficient permissions' }
            : t
        ));
        continue;
      }
      
      await runSingleTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
    }
    
    setIsRunning(false);
  };

  const resetTests = () => {
    setTests(prev => prev.map(t => ({ 
      ...t, 
      status: 'pending' as const, 
      errorMessage: undefined,
      timestamp: undefined 
    })));
  };

  const getModuleStats = () => {
    const modules = [...new Set(tests.map(t => t.module))];
    return modules.map(module => {
      const moduleTests = tests.filter(t => t.module === module);
      const passed = moduleTests.filter(t => t.status === 'passed').length;
      const failed = moduleTests.filter(t => t.status === 'failed').length;
      const skipped = moduleTests.filter(t => t.status === 'skipped').length;
      const total = moduleTests.length;
      
      return {
        module,
        total,
        passed,
        failed,
        skipped,
        pending: total - passed - failed - skipped,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0
      };
    });
  };

  const exportResults = () => {
    const qaReport = generateQAReport();
    const testResults = {
      timestamp: new Date().toISOString(),
      testSuite: 'Legacy System QA',
      moduleStats: getModuleStats(),
      testResults: tests,
      qaReport
    };
    
    const blob = new Blob([JSON.stringify(testResults, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const overallStats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    skipped: tests.filter(t => t.status === 'skipped').length,
    pending: tests.filter(t => t.status === 'pending').length,
  };

  const progress = ((overallStats.passed + overallStats.failed + overallStats.skipped) / overallStats.total) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🧪 Legacy System QA Test Suite</span>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
              <Button 
                onClick={resetTests} 
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
              <Button 
                onClick={exportResults} 
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overallStats.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{overallStats.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{overallStats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getModuleStats().map(module => (
          <Card key={module.module}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{module.module}</h3>
                <Badge variant={module.passRate === 100 ? 'default' : module.passRate >= 80 ? 'secondary' : 'destructive'}>
                  {module.passRate}%
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {module.passed}✅ {module.failed}❌ {module.skipped}⏭️ of {module.total}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tests.map(test => (
              <div 
                key={test.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  currentTest === test.id ? 'bg-blue-50 border-blue-200' : 'bg-background'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {test.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                    {test.status === 'running' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    {test.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {test.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    {test.status === 'skipped' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div>
                    <div className="font-medium">{test.testName}</div>
                    <div className="text-sm text-muted-foreground">{test.description}</div>
                    {test.errorMessage && (
                      <div className="text-sm text-red-600 mt-1">{test.errorMessage}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{test.module}</Badge>
                  {canRunTest(test) ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runSingleTest(test.id)}
                      disabled={isRunning}
                    >
                      Test
                    </Button>
                  ) : (
                    <Badge variant="secondary">No Access</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};