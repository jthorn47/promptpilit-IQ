import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Menu,
  ChevronRight,
  Settings,
  Users,
  Building2,
  CreditCard,
  Shield,
  FileText,
  BarChart3,
  GraduationCap,
  BookOpen,
  Award,
  RefreshCw,
  MessageSquare,
  Zap,
  Clock,
  UserCheck,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/logo';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  badge?: number;
  roles?: string[];
  items?: MenuItem[];
}

export const MobileSidebarDrawer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BarChart3,
      items: [
        { id: 'dashboard', title: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
        { id: 'analytics', title: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: Building2,
      roles: ['super_admin', 'admin'],
      items: [
        { id: 'companies', title: 'Companies', icon: Building2, path: '/admin/companies' },
        { id: 'users', title: 'Users', icon: Users, path: '/admin/users' },
        { id: 'employees', title: 'Employees', icon: Users, path: '/admin/employees' },
      ]
    },
    {
      id: 'learning',
      title: 'Learning & Training',
      icon: GraduationCap,
      items: [
        { id: 'lms', title: 'LMS Dashboard', icon: GraduationCap, path: '/admin/lms' },
        { id: 'courses', title: 'Course Management', icon: BookOpen, path: '/admin/training-modules' },
        { id: 'certificates', title: 'Certificates', icon: Award, path: '/admin/certificates' },
        { id: 'renewals', title: 'Renewals', icon: RefreshCw, path: '/admin/renewals' },
      ]
    },
    {
      id: 'crm',
      title: 'CRM & Communication',
      icon: MessageSquare,
      items: [
        { id: 'crm-dashboard', title: 'CRM Dashboard', icon: MessageSquare, path: '/admin/crm' },
        { id: 'email', title: 'Email Admin', icon: MessageSquare, path: '/admin/email' },
      ]
    },
    {
      id: 'automation',
      title: 'Automation & Workflows',
      icon: Zap,
      items: [
        { id: 'integrations', title: 'Integrations', icon: Zap, path: '/admin/integrations' },
        { id: 'workflows', title: 'Workflows', icon: Zap, path: '/admin/workflows' },
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: Settings,
      roles: ['super_admin', 'admin'],
      items: [
        { id: 'settings', title: 'Settings', icon: Settings, path: '/admin/settings' },
        { id: 'security', title: 'Security', icon: Shield, path: '/admin/security' },
        { id: 'pricing', title: 'Pricing', icon: CreditCard, path: '/admin/pricing' },
      ]
    }
  ];

  // Filter menu items based on user roles
  const visibleMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.some(role => hasRole(role))
  ).map(item => ({
    ...item,
    items: item.items?.filter(subItem => 
      !subItem.roles || subItem.roles.some(role => hasRole(role))
    )
  }));

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="md:hidden min-h-[44px] min-w-[44px] p-2"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Logo size="sm" className="h-8" />
              <div>
                <SheetTitle className="text-left">Admin Panel</SheetTitle>
                <p className="text-sm text-muted-foreground">Mobile Command Center</p>
              </div>
            </div>
          </SheetHeader>

          {/* Menu Items */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {visibleMenuItems.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center space-x-2 px-2 py-1">
                  <section.icon className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                
                <div className="space-y-1">
                  {section.items?.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = item.path && isActivePath(item.path);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.path && handleNavigation(item.path)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left
                          transition-colors duration-200
                          ${isActive 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'hover:bg-muted/50 text-foreground'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <ItemIcon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.badge && item.badge > 0 && (
                            <Badge variant="secondary" className="h-5">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="border-t p-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/admin/knowledge-base')}
              className="w-full justify-start"
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Knowledge Base
            </Button>
            
            <Separator />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};