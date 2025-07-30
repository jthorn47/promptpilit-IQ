import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  Users,
  Settings,
  Shield,
  BarChart3,
  FileText,
  Building2,
  GraduationCap,
  DollarSign,
  Clock,
  UserCheck,
  Briefcase,
  Bot,
  TestTube,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  FileBarChart,
  Zap,
  Workflow,
  ClipboardCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissionEngine } from "@/hooks/usePermissionEngine";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Settings,
    roles: ['super_admin', 'company_admin'],
    children: [
      { title: "Companies", url: "/admin/companies", icon: Building2, roles: ['super_admin'] },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Assessments", url: "/admin/assessments", icon: Shield },
      { title: "Employees", url: "/admin/employees", icon: UserCheck },
      { title: "Training", url: "/admin/training-modules", icon: GraduationCap },
      { title: "Reports", url: "/admin/reports", icon: FileBarChart },
      { title: "Integration Triggers", url: "/admin/integration-triggers", icon: Workflow, roles: ['super_admin'] },
      { title: "Testing", url: "/testing", icon: TestTube },
    ]
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: DollarSign,
    roles: ['super_admin', 'company_admin'],
    children: [
      { title: "Dashboard", url: "/admin/payroll/dashboard", icon: BarChart3 },
      { title: "Processing", url: "/admin/payroll/processing", icon: Zap },
      { title: "Benefits", url: "/admin/payroll/benefits", icon: FileText },
    ]
  },
  {
    title: "Learning",
    url: "/learning",
    icon: GraduationCap,
    roles: ['learner', 'company_admin', 'super_admin'],
  },
  {
    title: "Compliance",
    url: "/admin/compliance",
    icon: Shield,
    roles: ['super_admin', 'company_admin'],
  }
];

export function MainSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { hasRole, canManageUsers, canViewUsers, canManageSystem, assignedModules } = usePermissionEngine();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [currentPath, isMobile, setOpenMobile]);
  
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    // Auto-open groups that contain the current path
    const groups: string[] = [];
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => currentPath.startsWith(child.url));
        if (hasActiveChild || currentPath.startsWith(item.url)) {
          groups.push(item.title);
        }
      }
    });
    return groups;
  });

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    
    // For now, allow access to all menu items while permissions are being loaded
    // This will be improved in the next iteration with proper caching
    return true;
  };

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const filteredMenuItems = menuItems.filter(item => hasAccess(item.roles));

  return (
    <Sidebar 
      collapsible="icon"
      variant="sidebar"
      className="border-r border-sidebar-border/50"
    >
      <SidebarContent className={`scrollbar-thin scrollbar-thumb-muted overflow-x-hidden ${collapsed ? 'px-2' : ''}`}>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isGroupOpen = openGroups.includes(item.title);
                const filteredChildren = item.children?.filter(child => hasAccess(child.roles)) || [];

                return (
                  <SidebarMenuItem key={item.title}>
                    {hasChildren ? (
                      <Collapsible open={isGroupOpen} onOpenChange={() => toggleGroup(item.title)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-between'} ${getNavClasses(item.url)}`}
                            tooltip={collapsed ? item.title : undefined}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                            {!collapsed && <ChevronDown className="h-4 w-4 transition-transform duration-200" 
                              style={{ transform: isGroupOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }} />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenu className="ml-4 mt-1">
                            {filteredChildren.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <SidebarMenuItem key={child.title}>
                                  <SidebarMenuButton asChild tooltip={child.title}>
                                    <NavLink
                                      to={child.url}
                                      className={({ isActive }) => 
                                        `flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors ${
                                          isActive 
                                            ? "bg-primary text-primary-foreground" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`
                                      }
                                    >
                                      <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                      <span>{child.title}</span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                            </SidebarMenu>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton 
                        asChild
                        tooltip={collapsed ? item.title : undefined}
                      >
                        <NavLink
                          to={item.url}
                          className={({ isActive }) => 
                            `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-2 px-3'} py-2 rounded-md transition-colors ${
                              isActive 
                                ? "bg-primary text-primary-foreground font-medium" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`
                          }
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}