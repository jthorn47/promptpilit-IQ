import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    icon?: React.ComponentType<any>;
  };
}

// Route configuration for breadcrumb labels
const routeConfig: BreadcrumbConfig = {
  // Core routes
  dashboard: { label: 'Dashboard' },
  admin: { label: 'System Administration' },
  launchpad: { label: 'Launchpad' },
  superadmin: { label: 'Super Admin' },
  
  // Main sections
  employees: { label: 'Employees' },
  companies: { label: 'Companies' },
  reports: { label: 'Reports' },
  settings: { label: 'PropGEN Settings' },
  profile: { label: 'Profile' },
  onboarding: { label: 'Onboarding' },
  training: { label: 'Training' },
  assessments: { label: 'Assessments' },
  certificates: { label: 'Certificates' },
  
  // Vault
  vault: { label: 'Vault' },
  upload: { label: 'Upload' },
  shared: { label: 'Shared' },
  search: { label: 'Search' },
  
  // HaaLO modules
  halo: { label: 'HaaLO' },
  'hro-iq': { label: 'HRO IQ' },
  'org-settings': { label: 'Org Settings' },
  directory: { label: 'Directory' },
  documents: { label: 'Documents' },
  compliance: { label: 'Compliance' },
  tasks: { label: 'Tasks' },
  time: { label: 'Time & Attendance' },
  leave: { label: 'Leave' },
  knowledge: { label: 'Knowledge' },
  communications: { label: 'Communications' },
  finance: { label: 'Finance' },
  
  // Pulse
  pulse: { label: 'Pulse' },
  
  // Payroll
  payroll: { label: 'Payroll' },
  processing: { label: 'Processing' },
  benefits: { label: 'Benefits' },
  'pay-types': { label: 'Pay Types' },
  ach: { label: 'ACH' },
  deductions: { label: 'Deductions & Benefits' },
  earnings: { label: 'Earnings & Pay Types' },
  basic: { label: 'Basic Settings' },
  tax: { label: 'Tax Configuration' },
  
  // Learning
  learning: { label: 'Learning' },
  'learning-paths': { label: 'Learning Paths' },
  'my-learning': { label: 'My Learning' },
  'my-certificates': { label: 'My Certificates' },
  renewals: { label: 'Renewals' },
  
  // Client specific
  client: { label: 'Client' },
  'benefitsiq': { label: 'Benefits IQ' },
  'job-titles': { label: 'Job Titles' },
  
  // Other sections
  analytics: { label: 'Analytics' },
  'bi-dashboard': { label: 'BI Dashboard' },
  'email-automation': { label: 'Email Automation' },
  gamification: { label: 'Gamification' },
  'bulk-operations': { label: 'Bulk Operations' },
  'live-dashboard': { label: 'Live Dashboard' },
  
  // Testing
  testing: { label: 'Testing' },
  
  // Company settings
  'company-settings': { label: 'Company Settings' },
  'employee-directory': { label: 'Employee Directory' },
  'time-off': { label: 'Time Off' },
  
  // CRM
  crm: { label: 'CRM' },
  clients: { label: 'Clients' },
  
  // System
  system: { label: 'System' },
  'company-admin': { label: 'Company Admin' },
};

interface DynamicBreadcrumbsProps {
  className?: string;
  maxItems?: number;
}

// Routes that should be skipped in breadcrumbs (intermediate navigation levels)
const skipRoutes = ['settings', 'pages'];

export const DynamicBreadcrumbs: React.FC<DynamicBreadcrumbsProps> = ({ 
  className,
  maxItems = 4 
}) => {
  const location = useLocation();
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [clientNames, setClientNames] = useState<Record<string, string>>({});

  // Fetch company name for breadcrumbs
  const fetchCompanyName = async (companyId: string) => {
    if (companyNames[companyId]) return companyNames[companyId];
    
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('company_name')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      
      const name = data?.company_name || companyId;
      setCompanyNames(prev => ({ ...prev, [companyId]: name }));
      return name;
    } catch (error) {
      console.error('Error fetching company name:', error);
      return companyId; // Fallback to ID if fetch fails
    }
  };

  // Fetch client name for breadcrumbs
  const fetchClientName = async (clientId: string) => {
    if (clientNames[clientId]) return clientNames[clientId];
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      
      const name = data?.company_name || clientId;
      setClientNames(prev => ({ ...prev, [clientId]: name }));
      return name;
    } catch (error) {
      console.error('Error fetching client name:', error);
      return clientId; // Fallback to ID if fetch fails
    }
  };

  // Effect to fetch names when route changes
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    pathSegments.forEach((segment, index) => {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return; // Not a UUID
      }

      const previousSegment = pathSegments[index - 1];
      if (previousSegment === 'companies') {
        fetchCompanyName(segment);
      } else if (previousSegment === 'clients') {
        fetchClientName(segment);
      }
    });
  }, [location.pathname]);
  
  // Parse the current path into segments
  const allSegments = location.pathname
    .split('/')
    .filter(segment => segment !== '');
     
  // Don't show breadcrumbs for root or single-level paths
  if (allSegments.length <= 1) {
    return null;
  }

  // Build breadcrumb items with smart filtering
  const breadcrumbItems: Array<{label: string, path: string, isLast: boolean}> = [];
  
  for (let i = 0; i < allSegments.length; i++) {
    const segment = allSegments[i];
    
    // Skip intermediate navigation segments, but keep important end segments
    if (skipRoutes.includes(segment) && i < allSegments.length - 1) {
      continue;
    }
    
    const path = '/' + allSegments.slice(0, i + 1).join('/');
    const isLast = i === allSegments.length - 1;
    
    // Determine the label for this segment
    let label: string;
    
    // Check if this segment is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
    if (isUUID) {
      const previousSegment = allSegments[i - 1];
      if (previousSegment === 'companies' && companyNames[segment]) {
        label = companyNames[segment];
      } else if (previousSegment === 'clients' && clientNames[segment]) {
        label = clientNames[segment];
      } else {
        // Fallback: use a shortened version of the UUID while we're loading
        label = segment.slice(0, 8) + '...';
      }
    } else {
      // Use route config or default capitalization
      const config = routeConfig[segment] || { label: segment.charAt(0).toUpperCase() + segment.slice(1) };
      label = config.label;
    }
    
    breadcrumbItems.push({
      label,
      path: path,
      isLast
    });
    
    // Limit number of items
    if (breadcrumbItems.length >= maxItems) {
      break;
    }
  }

  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                <span className="sr-only">Home</span>
              </NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbItems.map((item, index) => {
            const key = `breadcrumb-${item.path.replace(/\//g, '-')}-${index}`;
            return (
              <div key={key} className="contents">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage className="font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <NavLink 
                        to={item.path}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </NavLink>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

// Custom breadcrumb component for specific use cases
interface CustomBreadcrumbsProps {
  items: Array<{
    label: string;
    path?: string;
    isLast?: boolean;
  }>;
  className?: string;
}

export const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ 
  items, 
  className 
}) => {
  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                <span className="sr-only">Home</span>
              </NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {items.map((item, index) => {
            const key = `custom-breadcrumb-${index}-${item.label.replace(/\s+/g, '-')}`;
            return (
              <div key={key} className="contents">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isLast || !item.path ? (
                    <BreadcrumbPage className="font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <NavLink 
                        to={item.path}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </NavLink>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
