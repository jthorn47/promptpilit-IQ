import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  Building2, 
  FileText, 
  ChevronDown,
  Menu,
  HelpCircle,
  User,
  LogOut,
  MessageCircle,
  ExternalLink,
  Settings,
  GraduationCap,
  Shield,
  Folder,
  Timer,
  DollarSign,
  PieChart,
  FileSpreadsheet,
  TrendingUp,
  Archive,
  BookOpen,
  Home,
  Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/contexts/AuthContext';
import { IQBar } from './IQBar';
import { HierarchicalAppsModal } from './HierarchicalAppsModal';
import { LanguageSelector } from './LanguageSelector';
import { DarkModeToggle } from './DarkModeToggle';
import { parentModules } from '@/data/hierarchicalApps';

interface TabItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface DashboardItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface AppItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  roles: string[];
}

const tabs: TabItem[] = [
  {
    id: 'my-work',
    title: 'My Work',
    url: '/admin/my-work',
    icon: Clock,
    roles: ['super_admin', 'company_admin', 'client_admin', 'learner', 'employee']
  },
  {
    id: 'companies',
    title: 'Companies',
    url: '/admin/companies',
    icon: Building2,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'proposals',
    title: 'Proposals',
    url: '/admin/proposals',
    icon: FileText,
    roles: ['super_admin', 'company_admin']
  }
];

const dashboards: DashboardItem[] = [
  {
    id: 'executive-command-center',
    title: 'Executive Command Center',
    description: 'Super Admin strategic dashboard with live KPIs and controls',
    url: '/admin/executive/dashboard',
    icon: Shield,
    roles: ['super_admin']
  },
  {
    id: 'client-admin-dashboard',
    title: 'My Admin Dashboard',
    description: 'Client Admin command deck with company insights',
    url: '/admin/client/dashboard',
    icon: BarChart3,
    roles: ['client_admin']
  },
  {
    id: 'system-dashboard',
    title: 'System Dashboard',
    description: 'High-level system architecture and metrics',
    url: '/admin/system/dashboard',
    icon: TrendingUp,
    roles: ['super_admin']
  },
  {
    id: 'company-dashboard',
    title: 'Company Dashboard',
    description: 'Company overview and main metrics',
    url: '/dashboard',
    icon: Home,
    roles: ['company_admin', 'learner']
  },
  {
    id: 'easelearn-dashboard',
    title: 'EaseLearn Dashboard',
    description: 'Learning management and training metrics',
    url: '/admin/easelearn/dashboard',
    icon: GraduationCap,
    roles: ['admin', 'super_admin', 'training_manager']
  },
  {
    id: 'payroll-dashboard',
    title: 'Payroll Dashboard',
    description: 'Payroll processing and employee compensation',
    url: '/admin/payroll/dashboard',
    icon: DollarSign,
    roles: ['payroll_admin', 'company_admin', 'super_admin']
  },
  {
    id: 'crm-dashboard',
    title: 'CRM Dashboard',
    description: 'Customer relationship management',
    url: '/admin/crm/dashboard',
    icon: User,
    roles: ['admin', 'super_admin']
  },
  {
    id: 'integration-hub',
    title: 'Integration Hub',
    description: 'Manage integrations, monitor webhooks, and track security events',
    url: '/admin/integrations',
    icon: Plug,
    roles: ['super_admin', 'company_admin']
  }
];

// Legacy apps structure - now replaced by hierarchical structure
const apps: AppItem[] = [];

export const UniversalTopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut, userRoles } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasRoleAccess = (requiredRoles: string[]) => {
    return userRole && requiredRoles.includes(userRole);
  };

  const getVisibleTabs = () => {
    return tabs.filter(tab => hasRoleAccess(tab.roles));
  };

  const getVisibleDashboards = () => {
    return dashboards.filter(dashboard => hasRoleAccess(dashboard.roles));
  };

  const getVisibleApps = () => {
    return apps.filter(app => hasRoleAccess(app.roles));
  };

  const getAppsByCategory = () => {
    const visibleApps = getVisibleApps();
    const categories: Record<string, AppItem[]> = {};
    
    visibleApps.forEach(app => {
      if (!categories[app.category]) {
        categories[app.category] = [];
      }
      categories[app.category].push(app);
    });
    
    return categories;
  };

  const getUserDisplayName = () => {
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const MobileMenu = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col space-y-4 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Logo size="sm" />
              <span className="font-semibold text-lg">Navigation</span>
            </div>
            
            {/* Mobile Tabs */}
            {getVisibleTabs().map((tab) => {
              const Icon = tab.icon;
              const isActive = isActivePath(tab.url);
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(tab.url);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span>{tab.title}</span>
                </Button>
              );
            })}
            
            {/* Mobile Dashboards */}
            {getVisibleDashboards().length > 0 && (
              <>
                <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">Dashboards</div>
                {getVisibleDashboards().map((dashboard) => {
                  const Icon = dashboard.icon;
                  return (
                    <Button
                      key={dashboard.id}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(dashboard.url);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{dashboard.title}</span>
                    </Button>
                  );
                })}
              </>
            )}
            
            {/* Mobile Apps */}
            {parentModules.some(module => hasRoleAccess(module.roles)) && (
              <>
                <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">Apps</div>
                {parentModules.filter(module => hasRoleAccess(module.roles)).map((module) => {
                  const Icon = module.icon;
                  return (
                    <Button
                      key={module.id}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(`/${module.id}`);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{module.title}</span>
                    </Button>
                  );
                })}
              </>
            )}
            
            {/* Mobile Language and Dark Mode */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const DashboardsDropdown = () => {
    const visibleDashboards = getVisibleDashboards();
    
    if (visibleDashboards.length === 0) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1">
            Dashboards
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>Select Dashboard</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {visibleDashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <DropdownMenuItem
                key={dashboard.id}
                onClick={() => navigate(dashboard.url)}
                className="flex items-start space-x-3 p-3 cursor-pointer"
              >
                <Icon className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{dashboard.title}</div>
                  <div className="text-sm text-muted-foreground">{dashboard.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AppsButton = () => {
    // Check if user has access to any parent modules
    const hasAccess = parentModules.some(module => hasRoleAccess(module.roles));
    
    if (!hasAccess) return null;
    
    return (
      <Button 
        variant="ghost" 
        className="flex items-center gap-1"
        onClick={() => setIsAppsModalOpen(true)}
      >
        Apps
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  };

  const HelpDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1">
          Help
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Get Help</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a 
            href="https://help.easelearn.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-start space-x-3 p-3 cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Support Center</div>
              <div className="text-sm text-muted-foreground">Browse help documentation</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-start space-x-3 p-3 cursor-pointer">
          <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Chat with Sarah AI</div>
            <div className="text-sm text-muted-foreground">Get instant AI assistance</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={getUserDisplayName()} />
            <AvatarFallback className="text-white font-medium" style={{ backgroundColor: '#655DC6' }}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline">{getUserDisplayName()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background border shadow-lg z-50">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Profile Section */}
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        
        {/* HaaLO IQ University - Single training link */}
        <DropdownMenuItem onClick={() => window.open('/university/haalo-iq', '_blank')}>
          <BookOpen className="mr-2 h-4 w-4" />
          HaaLO IQ-U
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Settings */}
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm sticky top-0 z-50">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left Section: Logo + Tabs */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="sm" className="h-8 w-auto pr-4 object-contain" />
          </Link>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex items-center space-x-1">
            {getVisibleTabs().map((tab) => {
              const Icon = tab.icon;
              const isActive = isActivePath(tab.url);
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="h-9"
                  onClick={() => navigate(tab.url)}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {tab.title}
                </Button>
              );
            })}
            
            {/* Dashboards Dropdown */}
            <DashboardsDropdown />
            
            {/* Apps Button */}
            <AppsButton />
          </div>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>

        {/* Right Section: IQ Bar + Language + Dark Mode + Help + User */}
        <div className="flex items-center space-x-2">
          {/* IQ Bar */}
          <div className="hidden md:block">
            <IQBar />
          </div>

          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Help Dropdown */}
          <div className="hidden lg:block">
            <HelpDropdown />
          </div>

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
      
      {/* Hierarchical Apps Modal */}
      <HierarchicalAppsModal
        isOpen={isAppsModalOpen}
        onClose={() => setIsAppsModalOpen(false)}
      />
    </nav>
  );
};