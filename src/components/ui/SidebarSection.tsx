import React from 'react';
import { LucideIcon } from 'lucide-react';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu 
} from '@/components/ui/sidebar';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationItem, NavigationItemProps } from './NavigationItem';
import { useAuthRole } from '@/hooks/useAuthRole';

interface NavigationItemData extends NavigationItemProps {
  roles?: string[];
}

interface SidebarSectionProps {
  title: string;
  items: NavigationItemData[];
  collapsed?: boolean;
  defaultOpen?: boolean;
  icon?: LucideIcon;
  collapsible?: boolean;
}

/**
 * Collapsible sidebar section component
 * Handles role-based filtering and consistent section styling
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  items,
  collapsed = false,
  defaultOpen = false,
  icon: SectionIcon,
  collapsible = true
}) => {
  const { hasAnyRole } = useAuthRole();
  
  // Filter items based on user roles
  const visibleItems = items.filter(item => 
    !item.roles || hasAnyRole(item.roles)
  );

  if (visibleItems.length === 0) {
    return null;
  }

  if (!collapsible) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          {SectionIcon && <SectionIcon className="h-4 w-4" />}
          {!collapsed && title}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {visibleItems.map((item, index) => (
              <NavigationItem
                key={`${item.url}-${index}`}
                {...item}
                collapsed={collapsed}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <SidebarGroup>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors">
            {SectionIcon && <SectionIcon className="h-4 w-4" />}
            {!collapsed && (
              <>
                <span className="flex-1">{title}</span>
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </>
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item, index) => (
                <NavigationItem
                  key={`${item.url}-${index}`}
                  {...item}
                  collapsed={collapsed}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
};