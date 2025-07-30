import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavigationItem as NavigationItemType } from '@/config/navigationConfig';
import { useNavigation } from './NavigationProvider';

interface NavigationItemProps {
  item: NavigationItemType;
  collapsed?: boolean;
  showText?: boolean;
  onItemClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  collapsed = false,
  showText = true,
  onItemClick
}) => {
  const { isSectionOpen, toggleSection } = useNavigation();
  const isExpanded = isSectionOpen(item.id);
  
  console.log('🔍 NavigationItem Debug:', { 
    itemId: item.id, 
    collapsed, 
    showText, 
    hasChildren: !!(item.children && item.children.length > 0)
  });
  
  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    if (collapsed) {
      return cn(
        "flex items-center justify-center w-full h-10 p-2 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      );
    }
    return cn(
      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
      isActive 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );
  };

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // If item has children, render as expandable
  if (item.children && item.children.length > 0) {
    if (collapsed) {
      // When collapsed, just show the parent icon and make it clickable
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink 
              to={item.url} 
              end={item.exact} 
              className={getNavClassName}
              onClick={handleClick}
              title={item.title}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }
    
    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(item.id)}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={`flex items-center ${collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted w-full`}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 ${collapsed ? "" : "mr-2"}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </>
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild>
                    <NavLink 
                      to={child.url} 
                      end={child.exact}
                      className={getNavClassName}
                      onClick={handleClick}
                    >
                      <child.icon className="h-4 w-4 flex-shrink-0 mr-2" />
                      <span className="flex-1">{child.title}</span>
                      {child.badge && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {child.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // Regular navigation item without children
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url} 
          end={item.exact} 
          className={getNavClassName}
          onClick={handleClick}
          title={collapsed ? item.title : undefined}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};