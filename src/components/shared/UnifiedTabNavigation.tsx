import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface TabConfig {
  id: string;
  label: string;
  component: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
}

interface UnifiedTabNavigationProps {
  tabs: TabConfig[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  showSettings?: boolean;
}

export const UnifiedTabNavigation = ({ 
  tabs, 
  defaultTab, 
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  className,
  showSettings = false 
}: UnifiedTabNavigationProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use external state if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;

  // Filter out hidden tabs
  const visibleTabs = tabs.filter(tab => !tab.hidden);
  
  // Add settings tab if requested
  const allTabs: TabConfig[] = showSettings && !visibleTabs.find(tab => tab.id === 'settings') 
    ? [...visibleTabs, { id: 'settings', label: 'Settings', component: <div>Settings content coming soon...</div> }]
    : visibleTabs;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        {/* Desktop Navigation */}
        {!isMobile && (
          <div>
            <TabsList className={`grid w-full ${
              allTabs.length <= 3 ? 'grid-cols-3' : 
              allTabs.length <= 4 ? 'grid-cols-4' : 
              allTabs.length <= 5 ? 'grid-cols-5' : 
              allTabs.length <= 6 ? 'grid-cols-6' :
              allTabs.length <= 8 ? 'grid-cols-4' :
              'grid-cols-3'
            } ${allTabs.length > 6 ? 'grid-rows-3 gap-2' : ''}`}>
              {allTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  disabled={tab.disabled}
                  className="transition-all duration-200"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        {/* Mobile Navigation - Dropdown */}
        {isMobile && (
          <div>
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-12">
                  <span className="flex items-center gap-2">
                    <Menu className="h-4 w-4" />
                    {allTabs.find(tab => tab.id === activeTab)?.label || 'Select Tab'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[250px] z-[9999] bg-background border shadow-xl" align="start">
                {allTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    disabled={tab.disabled}
                    className={`cursor-pointer min-h-[44px] ${activeTab === tab.id ? 'bg-accent' : ''}`}
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Tab Content */}
        {allTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};