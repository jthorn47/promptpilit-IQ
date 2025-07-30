import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { NavigationSection as NavigationSectionType, canAccessItem } from '@/config/navigationConfig';
import { NavigationItem } from './NavigationItem';
import { useNavigation } from './NavigationProvider';

interface NavigationSectionProps {
  section: NavigationSectionType;
  collapsed?: boolean;
  showText?: boolean;
  onItemClick?: () => void;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({ 
  section, 
  collapsed = false, 
  showText = true,
  onItemClick
}) => {
  const { isSectionOpen, toggleSection } = useNavigation();
  
  // All items are already filtered at the NavigationProvider level
  const accessibleItems = section.items;
  
  console.log('🔍 NavigationSection Debug:', { 
    sectionId: section.id, 
    collapsed, 
    showText, 
    accessibleItemsCount: accessibleItems.length,
    hasIcon: !!section.icon 
  });
  
  // Don't render section if no accessible items
  if (accessibleItems.length === 0) {
    return null;
  }

  const isOpen = isSectionOpen(section.id);
  const shouldCollapse = section.collapsible && !collapsed;

  const sectionContent = (
    <SidebarGroupContent>
      <SidebarMenu>
        {accessibleItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            showText={showText}
            onItemClick={onItemClick}
          />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  );

  if (collapsed) {
    // When collapsed, show all navigation items as individual icons
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {accessibleItems.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                showText={false}
                onItemClick={onItemClick}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (shouldCollapse) {
    return (
      <Collapsible 
        open={isOpen} 
        onOpenChange={() => toggleSection(section.id)}
      >
        <SidebarGroup>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></div>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel 
                className="pl-4 cursor-pointer hover:bg-muted/50 rounded-md flex items-center justify-between pr-2"
              >
                <div className="flex items-center gap-2">
                  {section.icon && <section.icon className="h-4 w-4" />}
                  <span>{section.title}</span>
                </div>
                {isOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </SidebarGroupLabel>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            {sectionContent}
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  }

  return (
    <SidebarGroup>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></div>
        <SidebarGroupLabel className={`pl-4 ${collapsed ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
          <div className="flex items-center gap-2">
            {section.icon && <section.icon className="h-4 w-4" />}
            <span>{section.title}</span>
          </div>
        </SidebarGroupLabel>
      </div>
      {sectionContent}
    </SidebarGroup>
  );
};