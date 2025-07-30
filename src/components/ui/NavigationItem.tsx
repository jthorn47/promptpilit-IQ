import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface NavigationItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  collapsed?: boolean;
  badge?: string | number;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

/**
 * Standardized navigation item component
 * Provides consistent styling and behavior across all navigation areas
 */
export const NavigationItem: React.FC<NavigationItemProps> = ({
  title,
  url,
  icon: Icon,
  exact = false,
  collapsed = false,
  badge,
  className,
  onClick,
  children,
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={url}
          end={exact}
          onClick={onClick}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:bg-accent focus:text-accent-foreground focus:outline-none',
            isActive && 'bg-accent text-accent-foreground font-medium',
            className
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{title}</span>
              {badge && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {badge}
                </Badge>
              )}
            </>
          )}
        </NavLink>
      </SidebarMenuButton>
      {children}
    </SidebarMenuItem>
  );
};