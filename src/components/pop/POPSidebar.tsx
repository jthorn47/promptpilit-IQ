import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  Briefcase,
  UserPlus,
  DollarSign,
  FileText,
  Settings,
  Bell,
  MapPin,
  TrendingUp,
  Menu,
  X,
  Shield,
  ClipboardList,
} from "lucide-react";

interface POPSidebarProps {
  className?: string;
}

const navigation = [
  {
    title: "Dashboard",
    href: "/pop",
    icon: Home,
  },
  {
    title: "Client Management",
    items: [
      {
        title: "My Clients",
        href: "/pop/clients",
        icon: Users,
      },
      {
        title: "Add New Client",
        href: "/pop/clients/new",
        icon: UserPlus,
      },
      {
        title: "Pending Approvals",
        href: "/pop/clients/pending",
        icon: ClipboardList,
        badge: "3",
      },
    ],
  },
  {
    title: "Job Orders",
    items: [
      {
        title: "Active Jobs",
        href: "/pop/jobs",
        icon: Briefcase,
      },
      {
        title: "Create Job Order",
        href: "/pop/jobs/new",
        icon: FileText,
      },
      {
        title: "Candidate Pipeline",
        href: "/pop/candidates",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Earnings",
        href: "/pop/earnings",
        icon: DollarSign,
      },
      {
        title: "Territory",
        href: "/pop/territory",
        icon: MapPin,
      },
      {
        title: "Reports",
        href: "/pop/reports",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Compliance",
    items: [
      {
        title: "Safety & Training",
        href: "/pop/safety",
        icon: Shield,
      },
      {
        title: "Documents",
        href: "/pop/documents",
        icon: FileText,
      },
    ],
  },
  {
    title: "Settings",
    href: "/pop/settings",
    icon: Settings,
  },
];

export function POPSidebar({ className }: POPSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn("relative border-r bg-background", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">POP Platform</span>
              <span className="text-xs text-muted-foreground">Partner Office Program</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 w-8 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Notifications */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-3">
              <Bell className="h-4 w-4 text-accent-foreground" />
              <div className="flex-1 text-sm">
                <p className="font-medium">3 pending approvals</p>
                <p className="text-xs text-muted-foreground">Require your attention</p>
              </div>
            </div>
          )}

          {navigation.map((section, index) => (
            <div key={index}>
              {section.items ? (
                <div className="space-y-2">
                  {!isCollapsed && (
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant={location.pathname === item.href ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          size={isCollapsed ? "sm" : "default"}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span className="ml-2">{item.title}</span>
                              {item.badge && (
                                <Badge variant="destructive" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link to={section.href}>
                  <Button
                    variant={location.pathname === section.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    size={isCollapsed ? "sm" : "default"}
                  >
                    <section.icon className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">{section.title}</span>}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t p-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              JT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Jeffrey Thorn</p>
              <p className="text-xs text-muted-foreground truncate">Senior POP • California</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              JT
            </div>
          </div>
        )}
      </div>
    </div>
  );
}