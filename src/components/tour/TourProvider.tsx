import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TourStep {
  id: string;
  target: string; // CSS selector or element ID
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showSkip?: boolean;
  action?: () => void;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (tourName: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  markTourAsCompleted: (tourName: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

// Define tour configurations
const TOUR_CONFIGS: Record<string, TourStep[]> = {
  'case-management': [
    {
      id: 'welcome',
      target: 'body',
      title: '📋 Welcome to Case Management!',
      content: "Let's explore the comprehensive Case Management System. This tour will show you how to create cases, track time, manage clients, and analyze performance data.",
      placement: 'center',
      showSkip: true
    },
    {
      id: 'case-overview',
      target: '[data-tour="case-overview"]',
      title: '📊 System Overview',
      content: 'Get a quick snapshot of your case workload: total cases, open cases, cases in progress, and total billable hours tracked.',
      placement: 'bottom'
    },
    {
      id: 'new-case-button',
      target: '[data-tour="new-case-button"]',
      title: '➕ Create New Cases',
      content: 'Click here to create new support cases. You can assign them to team members, set priorities, and track estimated vs. actual hours.',
      placement: 'bottom'
    },
    {
      id: 'case-filters',
      target: '[data-tour="case-filters"]',
      title: '🔍 Smart Filtering',
      content: 'Filter cases by search terms, status, type, and priority. This helps you quickly find the cases you need to work on.',
      placement: 'bottom'
    },
    {
      id: 'cases-table',
      target: '[data-tour="cases-table"]',
      title: '📋 Cases Overview',
      content: 'View all cases in an organized table. Click any case to see details, add time entries, and update status. Each case shows ID, title, type, status, priority, assignee, and hours logged.',
      placement: 'top'
    },
    {
      id: 'analytics-tab',
      target: '[data-tour="analytics-tab"]',
      title: '📈 Analytics Dashboard',
      content: 'Switch to the Analytics tab to view performance metrics, time tracking data, and generate reports for billing and team management.',
      placement: 'bottom'
    },
    {
      id: 'case-types',
      target: 'body',
      title: '🏷️ Case Types & Workflow',
      content: 'Cases are categorized by type (HR, Payroll, Compliance, Safety, etc.) and move through statuses: Open → In Progress → Waiting → Resolved → Closed.',
      placement: 'center'
    },
    {
      id: 'time-tracking',
      target: 'body',
      title: '⏱️ Automatic Time Tracking',
      content: 'Time entries are automatically converted to billable amounts based on user roles: Super Admin ($150/hr), Company Admin ($125/hr), Admin ($95/hr), Standard User ($75/hr).',
      placement: 'center'
    },
    {
      id: 'completion',
      target: 'body',
      title: '✅ Case Management Mastery!',
      content: "You're now ready to efficiently manage client support cases! Remember: create detailed cases, log time accurately, and use analytics to optimize your team's performance.",
      placement: 'center'
    }
  ],
  'case-creation': [
    {
      id: 'form-overview',
      target: '[data-tour="case-form"]',
      title: '📝 Case Creation Form',
      content: 'Fill out this comprehensive form to create a new support case. All fields help ensure proper tracking and billing.',
      placement: 'right'
    },
    {
      id: 'case-basics',
      target: '[data-tour="case-title"]',
      title: '📋 Case Basics',
      content: 'Start with a clear, descriptive title that summarizes the client\'s issue or request. This helps with quick identification.',
      placement: 'right'
    },
    {
      id: 'case-type-priority',
      target: '[data-tour="case-type"]',
      title: '🏷️ Categorization',
      content: 'Select the appropriate type and priority. This helps with routing, SLA management, and resource allocation.',
      placement: 'right'
    },
    {
      id: 'case-assignment',
      target: '[data-tour="case-assignment"]',
      title: '👥 Assignment & Company',
      content: 'Assign the case to a team member and link it to the client company. This enables proper time tracking and billing.',
      placement: 'right'
    },
    {
      id: 'case-description',
      target: '[data-tour="case-description"]',
      title: '📄 Detailed Information',
      content: 'Provide a thorough description and estimated hours. Good documentation helps team members understand the scope and work efficiently.',
      placement: 'right'
    }
  ],
  'case-detail': [
    {
      id: 'case-header',
      target: '[data-tour="case-header"]',
      title: '📋 Case Overview',
      content: 'View all essential case information: status, priority, assignment, and key metrics at a glance.',
      placement: 'bottom'
    },
    {
      id: 'case-actions',
      target: '[data-tour="case-actions"]',
      title: '⚡ Quick Actions',
      content: 'Edit case details, log time entries, or update the case status with these action buttons.',
      placement: 'bottom'
    },
    {
      id: 'time-entries-tab',
      target: '[data-tour="time-entries-tab"]',
      title: '⏱️ Time Tracking',
      content: 'View all time entries for this case. Each entry shows duration, description, date, and automatically calculated labor cost.',
      placement: 'bottom'
    },
    {
      id: 'case-activity',
      target: '[data-tour="case-activity"]',
      title: '📈 Case Activity',
      content: 'Track all changes and updates to the case with this detailed activity log. Perfect for audit trails and client updates.',
      placement: 'bottom'
    }
  ],
  'case-analytics': [
    {
      id: 'analytics-overview',
      target: '[data-tour="analytics-overview"]',
      title: '📊 Analytics Dashboard',
      content: 'Comprehensive analytics help you understand team performance, billing efficiency, and case resolution patterns.',
      placement: 'bottom'
    },
    {
      id: 'key-metrics',
      target: '[data-tour="key-metrics"]',
      title: '🎯 Key Performance Indicators',
      content: 'Monitor total active cases, hours logged, labor costs, and average resolution times to optimize operations.',
      placement: 'bottom'
    },
    {
      id: 'status-breakdown',
      target: '[data-tour="status-breakdown"]',
      title: '📈 Status Distribution',
      content: 'Visual breakdown of cases by status helps identify bottlenecks and workload distribution across your team.',
      placement: 'bottom'
    },
    {
      id: 'team-performance',
      target: '[data-tour="team-performance"]',
      title: '👥 Team Analytics',
      content: 'Track individual and team performance with detailed breakdowns of case assignments and time logged by team member.',
      placement: 'bottom'
    }
  ],
  'super-admin': [
    {
      id: 'welcome',
      target: 'body',
      title: '👑 Welcome, Super Admin!',
      content: "As a Super Admin, you have full system access. Let me explain how we've structured EaseLearn to help you manage the entire platform efficiently.",
      placement: 'center',
      showSkip: true
    },
    {
      id: 'architecture-overview',
      target: 'body',
      title: '🏗️ System Architecture',
      content: "We've built EaseLearn with a modular architecture: separate sections for different user types (internal staff, company admins, learners) to maintain clear boundaries and security.",
      placement: 'center'
    },
    {
      id: 'sidebar-structure',
      target: '[data-tour="admin-sidebar"]',
      title: '📋 Organized Navigation',
      content: "The sidebar is organized by function: CRM for sales, EaseLearn LMS for training, Consulting Services for assessments, and System tools. This separation helps different team members focus on their areas.",
      placement: 'right'
    },
    {
      id: 'user-management',
      target: '[data-tour="user-management"]',
      title: '👥 User Management System',
      content: "We've structured user management with role-based access control. You can create users, assign roles (super_admin, company_admin, learner, internal_staff), and manage permissions granularly.",
      placement: 'right'
    },
    {
      id: 'training-system',
      target: '[data-tour="training-modules"]',
      title: '🎓 Training Management',
      content: "The training system is designed for scalability: modules contain scenes, scenes contain content blocks. This structure allows for complex learning paths while keeping content manageable.",
      placement: 'right'
    },
    {
      id: 'knowledge-base',
      target: '[data-tour="knowledge-base"]',
      title: '📚 Knowledge Base',
      content: "We've included a knowledge base for documentation and help articles. This is searchable and categorized to help users find information quickly.",
      placement: 'right'
    },
    {
      id: 'crm-integration',
      target: '[data-tour="crm-section"]',
      title: '💼 CRM Integration',
      content: "The CRM is designed for EaseWorks sales team: lead management, deal tracking, and activity logging. We've separated this from the LMS to maintain clear business logic boundaries.",
      placement: 'right'
    },
    {
      id: 'assessment-system',
      target: '[data-tour="assessments"]',
      title: '📋 Assessment Framework',
      content: "Risk assessments are structured with AI analysis, role-based notifications, and progress tracking. This feeds into our consulting services workflow.",
      placement: 'right'
    },
    {
      id: 'analytics-reporting',
      target: '[data-tour="analytics"]',
      title: '📊 Analytics & Reporting',
      content: "We've built comprehensive analytics: training progress, user engagement, assessment results, and business metrics. Data is segmented by company for privacy and performance.",
      placement: 'right'
    },
    {
      id: 'security-compliance',
      target: '[data-tour="security"]',
      title: '🔒 Security & Compliance',
      content: "Security is built-in: Row-Level Security (RLS) policies, audit logging, SSO integration, and compliance tracking. Every action is logged and permissions are strictly enforced.",
      placement: 'right'
    },
    {
      id: 'completion',
      target: 'body',
      title: '✅ Architecture Tour Complete!',
      content: "You now understand how EaseLearn is structured. Each module serves a specific purpose, and the separation allows for secure multi-tenancy while maintaining system integrity. Questions? Check the documentation or contact the dev team.",
      placement: 'center'
    }
  ],
  'admin-dashboard': [
    {
      id: 'welcome',
      target: 'body',
      title: '🎉 Welcome to EaseBASE!',
      content: "Let's take a quick tour of your training management dashboard. This will only take 2 minutes.",
      placement: 'center',
      showSkip: true
    },
    {
      id: 'sidebar-navigation',
      target: '[data-tour="sidebar"]',
      title: '📋 Navigation Sidebar',
      content: 'Access all key features from this sidebar: Training Modules, Employee Management, Analytics, and more.',
      placement: 'right'
    },
    {
      id: 'training-modules',
      target: '[data-tour="training-modules"]',
      title: '🎓 Training Library',
      content: 'Create, manage, and organize your training content. Build interactive courses with videos, quizzes, and SCORM packages.',
      placement: 'right'
    },
    {
      id: 'employee-management',
      target: '[data-tour="employees"]',
      title: '👥 Employee Management',
      content: 'Manage your team, assign training, track progress, and view completion certificates.',
      placement: 'right'
    },
    {
      id: 'analytics',
      target: '[data-tour="analytics"]',
      title: '📊 Analytics & Reports',
      content: 'Monitor training effectiveness, compliance rates, and generate detailed reports for stakeholders.',
      placement: 'right'
    },
    {
      id: 'quick-actions',
      target: '[data-tour="quick-actions"]',
      title: '⚡ Quick Actions',
      content: 'Use these buttons for common tasks like creating new training modules or adding employees.',
      placement: 'bottom'
    },
    {
      id: 'completion',
      target: 'body',
      title: '✅ Tour Complete!',
      content: "You're all set! You can restart this tour anytime from the Help menu. Need assistance? Contact our support team.",
      placement: 'center'
    }
  ],
  'training-builder': [
    {
      id: 'builder-welcome',
      target: 'body',
      title: '🎬 Training Builder Tour',
      content: 'Learn how to create engaging training content with our advanced builder.',
      placement: 'center'
    },
    {
      id: 'scene-sidebar',
      target: '[data-tour="scene-sidebar"]',
      title: '🎞️ Scene Management',
      content: 'Add and organize training scenes. Drag and drop to reorder. Each scene can contain videos, images, documents, or quizzes.',
      placement: 'right'
    },
    {
      id: 'scene-types',
      target: '[data-tour="scene-types"]',
      title: '📝 Scene Types',
      content: 'Choose from different content types: Video lessons, image galleries, document reviews, and interactive quizzes.',
      placement: 'right'
    },
    {
      id: 'quiz-builder',
      target: '[data-tour="quiz-tab"]',
      title: '❓ Quiz Builder',
      content: 'Create interactive assessments with multiple choice, true/false, and short answer questions.',
      placement: 'bottom'
    },
    {
      id: 'settings-tab',
      target: '[data-tour="settings-tab"]',
      title: '⚙️ Module Settings',
      content: 'Configure learning objectives, prerequisites, difficulty level, and compliance standards.',
      placement: 'bottom'
    },
    {
      id: 'certificates-tab',
      target: '[data-tour="certificates-tab"]',
      title: '🏆 Certificates',
      content: 'Customize completion certificates that learners receive. Includes compliance language for legal requirements.',
      placement: 'bottom'
    }
  ],
  'pulse-admin': [
    {
      id: 'welcome',
      target: 'body',
      title: '⚡ Welcome to Pulse!',
      content: "Pulse is your comprehensive case management platform. Let's explore how to manage client support, track costs, and generate strategic insights.",
      placement: 'center',
      showSkip: true
    },
    {
      id: 'navigation-tabs',
      target: '[data-tour="pulse-tabs"]',
      title: '📋 Navigation Overview',
      content: 'Pulse is organized into five main sections: Cases (management), Analytics (performance), Intelligence (AI insights), Reports (strategic), and Pulse (dashboard).',
      placement: 'bottom'
    },
    {
      id: 'cases-overview',
      target: '[data-tour="cases-tab"]',
      title: '📋 Case Management Hub',
      content: 'The Cases tab is your central command center. Create, assign, track, and resolve client support cases with comprehensive time tracking.',
      placement: 'bottom'
    },
    {
      id: 'new-case-creation',
      target: '[data-tour="new-case-button"]',
      title: '➕ Creating New Cases',
      content: 'Click here to create support cases. Assign them to team members, set priorities, link to clients, and estimate hours for accurate billing.',
      placement: 'bottom'
    },
    {
      id: 'case-workflow',
      target: 'body',
      title: '🔄 Case Workflow',
      content: 'Cases move through structured statuses: Open → In Progress → Waiting → Resolved → Closed. This ensures consistent service delivery.',
      placement: 'center'
    },
    {
      id: 'time-tracking',
      target: '[data-tour="cases-table"]',
      title: '⏱️ Time Tracking & Billing',
      content: 'Click any case to log time entries. Pulse automatically calculates labor costs: Super Admin ($150/hr), Company Admin ($125/hr), Admin ($95/hr), User ($75/hr).',
      placement: 'top'
    },
    {
      id: 'analytics-power',
      target: '[data-tour="analytics-tab"]',
      title: '📊 Analytics Dashboard',
      content: 'Monitor KPIs: active cases, response times, SLA compliance, team performance, and cost-to-serve metrics. Essential for operational excellence.',
      placement: 'bottom'
    },
    {
      id: 'intelligence-features',
      target: '[data-tour="intelligence-tab"]',
      title: '🧠 AI Intelligence',
      content: 'AI-powered insights: smart case assignment, escalation prediction, workload balancing, and SLA monitoring. Let AI optimize your operations.',
      placement: 'bottom'
    },
    {
      id: 'client-experience',
      target: '[data-tour="client-portal"]',
      title: '👥 Client Experience Layer',
      content: 'Clients can access secure case timelines, receive automated updates, and provide feedback. Transparency builds trust and satisfaction.',
      placement: 'bottom'
    },
    {
      id: 'strategic-reporting',
      target: '[data-tour="reports-tab"]',
      title: '📈 Strategic Reports',
      content: 'Generate executive-ready reports: QBR summaries, cost analysis, team performance, and client health metrics. Drive data-informed decisions.',
      placement: 'bottom'
    },
    {
      id: 'completion',
      target: 'body',
      title: '🎯 Pulse Mastery Complete!',
      content: 'You now understand all five phases of Pulse. Use it to deliver exceptional client service, optimize team performance, and drive strategic growth!',
      placement: 'center'
    }
  ],
  'pulse-client-admin': [
    {
      id: 'welcome',
      target: 'body',
      title: '👋 Welcome to Your Client Portal!',
      content: "As a client admin, you can track your support cases, view team performance, and access strategic insights about our service delivery.",
      placement: 'center',
      showSkip: true
    },
    {
      id: 'client-dashboard',
      target: '[data-tour="client-dashboard"]',
      title: '📊 Your Support Dashboard',
      content: 'Get an overview of your support activity: active cases, resolution times, team performance, and service level compliance.',
      placement: 'bottom'
    },
    {
      id: 'case-timeline',
      target: '[data-tour="case-timeline"]',
      title: '📋 Case Timeline View',
      content: 'Track the progress of your support cases in real-time. See status updates, team assignments, and resolution progress.',
      placement: 'bottom'
    },
    {
      id: 'service-metrics',
      target: '[data-tour="service-metrics"]',
      title: '📈 Service Level Metrics',
      content: 'Monitor how well we\'re meeting our service commitments: response times, resolution rates, and satisfaction scores.',
      placement: 'bottom'
    },
    {
      id: 'feedback-system',
      target: '[data-tour="feedback-portal"]',
      title: '💬 Feedback & Communication',
      content: 'Provide feedback on resolved cases and communicate directly with your support team through the integrated messaging system.',
      placement: 'bottom'
    },
    {
      id: 'cost-transparency',
      target: '[data-tour="cost-breakdown"]',
      title: '💰 Service Cost Transparency',
      content: 'See detailed breakdowns of time spent on your cases, team utilization, and the value of services provided.',
      placement: 'bottom'
    },
    {
      id: 'reports-access',
      target: '[data-tour="client-reports"]',
      title: '📋 Executive Reports',
      content: 'Access quarterly business reviews, performance summaries, and strategic insights about your support engagement.',
      placement: 'bottom'
    },
    {
      id: 'completion',
      target: 'body',
      title: '✅ Client Portal Tour Complete!',
      content: 'You can now effectively monitor your support services, track performance, and engage with our team for optimal service delivery.',
      placement: 'center'
    }
  ],
  'visual-report-builder': [
    {
      id: 'welcome',
      target: 'body',
      title: '🎨 Welcome to Visual Report Builder!',
      content: "Let's explore the powerful drag-and-drop report builder. You'll learn how to create stunning reports with charts, tables, and AI assistance from Sarah.",
      placement: 'center',
      showSkip: true
    },
    {
      id: 'component-palette',
      target: '[data-tour="component-palette"]',
      title: '🧩 Component Palette',
      content: 'Choose from various components: Charts (bar, line, pie), Tables (data grids), KPIs (key metrics), Filters (interactive controls), and Text blocks.',
      placement: 'right'
    },
    {
      id: 'drag-drop-canvas',
      target: '[data-tour="canvas-area"]',
      title: '🎯 Drag & Drop Canvas',
      content: 'Drag components from the palette onto this grid-based canvas. Position them precisely where you want them in your report layout.',
      placement: 'bottom'
    },
    {
      id: 'builder-tabs',
      target: '[data-tour="builder-tabs"]',
      title: '📋 Report Builder Tabs',
      content: 'Switch between Builder (design), Smart Filters (interactive controls), and Preview (live view) to create and test your reports.',
      placement: 'bottom'
    },
    {
      id: 'toolbar-actions',
      target: '[data-tour="toolbar-actions"]',
      title: '🛠️ Toolbar Actions',
      content: 'Use Undo/Redo for changes, activate Sarah (AI assistant), Preview your report, Share with others, and Save your work.',
      placement: 'bottom'
    },
    {
      id: 'ai-assistant',
      target: '[data-tour="ai-assistant-button"]',
      title: '🤖 Meet Sarah - Your AI Assistant',
      content: 'Click here to chat with Sarah. She can add components, suggest layouts, help with data connections, and provide design recommendations.',
      placement: 'left'
    },
    {
      id: 'component-selection',
      target: '[data-tour="canvas-area"]',
      title: '⚡ Component Interaction',
      content: 'Click any component on the canvas to select it. Selected components show resize handles and configuration options.',
      placement: 'top'
    },
    {
      id: 'smart-filters-tab',
      target: '[data-tour="filters-tab"]',
      title: '🔍 Smart Filters',
      content: 'Create interactive filters that users can use to explore your report data. Add dropdowns, date pickers, search boxes, and range sliders.',
      placement: 'bottom'
    },
    {
      id: 'preview-mode',
      target: '[data-tour="preview-tab"]',
      title: '👁️ Live Preview',
      content: 'Switch to Preview mode to see how your report looks to end users. Test filters, interactions, and responsive design.',
      placement: 'bottom'
    },
    {
      id: 'save-share',
      target: '[data-tour="save-button"]',
      title: '💾 Save & Share',
      content: 'Save your report designs and share them with team members. Reports are automatically saved as you work.',
      placement: 'left'
    },
    {
      id: 'empty-state-help',
      target: '[data-tour="empty-state"]',
      title: '🚀 Getting Started',
      content: 'When starting fresh, use the "Ask Sarah" button or drag components from the palette. Sarah can help create entire report layouts with just a description!',
      placement: 'center'
    },
    {
      id: 'completion',
      target: 'body',
      title: '✅ Report Builder Mastery!',
      content: "You're now ready to create stunning visual reports! Remember: Start with Sarah for layout ideas, drag components to build, and use Preview to test before sharing.",
      placement: 'center'
    }
  ]
};

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load completed tours from user profile
    loadCompletedTours();
  }, []);

  const loadCompletedTours = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('completed_tours')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.completed_tours) {
          setCompletedTours(profile.completed_tours);
        }
      }
    } catch (error) {
      console.error('Error loading completed tours:', error);
    }
  };

  const markTourAsCompleted = async (tourName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updatedTours = [...completedTours, tourName];
        
        await supabase
          .from('profiles')
          .update({ completed_tours: updatedTours })
          .eq('user_id', user.id);
        
        setCompletedTours(updatedTours);
      }
    } catch (error) {
      console.error('Error marking tour as completed:', error);
    }
  };

  const startTour = (tourName: string) => {
    const tourSteps = TOUR_CONFIGS[tourName];
    if (tourSteps) {
      setSteps(tourSteps);
      setCurrentStep(0);
      setIsActive(true);
      
      // Add overlay to body for accessibility
      document.body.setAttribute('data-tour-active', 'true');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    document.body.removeAttribute('data-tour-active');
    
    toast({
      title: "Tour Skipped",
      description: "You can restart the tour anytime from the Help menu.",
    });
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    document.body.removeAttribute('data-tour-active');
    
    // Mark current tour as completed if we have steps
    if (steps.length > 0) {
      // Derive tour name from first step or current location
      const tourName = window.location.pathname.includes('training-modules') ? 'training-builder' : 'admin-dashboard';
      markTourAsCompleted(tourName);
    }
    
    toast({
      title: "Tour Complete! 🎉",
      description: "You're ready to start using EaseBASE. Need help? Check our documentation or contact support.",
    });
  };

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        markTourAsCompleted
      }}
    >
      {children}
    </TourContext.Provider>
  );
};