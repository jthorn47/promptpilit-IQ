import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { NavigationProvider, useNavigation } from '@/components/navigation/NavigationProvider';

const MobileBottomTabsContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { navigation } = useNavigation();

  // Convert navigation items to mobile tabs
  const getMobileTabs = () => {
    const tabs: any[] = [];
    
    navigation.forEach((section) => {
      if (section.items && Array.isArray(section.items)) {
        section.items.forEach((item) => {
          // Check if user has required roles
          if (item.roles && !item.roles.some((role: string) => hasRole(role))) {
            return;
          }
          
          if (item.url) {
            tabs.push({
              id: item.id,
              label: item.title,
              icon: item.icon,
              path: item.url,
              badge: (item as any).badge
            });
          }
        });
      }
    });
    
    return tabs;
  };

  const mobileTabs = getMobileTabs();

  const isActiveTab = (tabPath: string) => {
    return location.pathname.startsWith(tabPath);
  };

  const handleTabClick = (path: string) => {
    console.log('🚀 Mobile tab clicked:', { path, currentPath: location.pathname });
    console.log('🚀 Navigation attempt:', { from: location.pathname, to: path });
    try {
      navigate(path);
      console.log('✅ Navigate called successfully for:', path);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80 border-t border-sidebar-border z-50 md:hidden">
      <div className="flex items-center py-2 px-1 w-full overflow-x-auto overscroll-x-contain scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTabClick(tab.path);
              }}
              className={`
                flex flex-col items-center justify-center 
                min-h-[60px] min-w-[60px] flex-shrink-0 rounded-lg transition-all duration-200 mx-1
                touch-manipulation cursor-pointer select-none
                ${isActive 
                  ? 'text-sidebar-primary bg-sidebar-primary/10' 
                  : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
                }
              `}
              aria-label={tab.label}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.badge && tab.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium text-center px-1 ${isActive ? 'text-sidebar-primary' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const MobileBottomTabs = () => {
  return (
    <NavigationProvider>
      <MobileBottomTabsContent />
    </NavigationProvider>
  );
};