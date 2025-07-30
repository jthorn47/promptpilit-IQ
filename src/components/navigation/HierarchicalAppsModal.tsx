import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight } from 'lucide-react';
import { parentModules } from '@/data/hierarchicalApps';
import { useAuth } from '@/contexts/AuthContext';

interface HierarchicalAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HierarchicalAppsModal: React.FC<HierarchicalAppsModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Filter modules based on user roles
  const accessibleApps = parentModules.filter(module => 
    module.roles.some(role => hasRole(role))
  );

  function getModuleUrl(moduleId: string): string {
    switch (moduleId) {
      case 'halo-iq':
        return '/halo-iq';
      case 'databridge-iq':
        return '/admin/databridge';
      case 'connect-iq-crm':
        return '/admin/connectiq';
      case 'payroll-iq':
        return '/payroll-iq';
      case 'comp-iq':
        return '/comp-iq';
      case 'benefits-iq':
        return '/benefits-iq';
      case 'case-management':
        return '/case-management';
      case 'vault':
        return '/vault';
      case 'time-track':
        return '/time-track';
      case 'policies':
        return '/admin/policies';
      case 'settings':
        return '/admin/settings';
      default:
        return `/${moduleId}`;
    }
  }

  const handleAppClick = (url: string) => {
    navigate(url);
    onClose();
  };

  const handleChildClick = (childUrl: string) => {
    navigate(childUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Apps</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Select a module to access • Hover for child modules
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleApps.map((module) => {
              const IconComponent = module.icon;
              const moduleUrl = getModuleUrl(module.id);
              const isHovered = hoveredModule === module.id;
              
              // Filter accessible child modules
              const accessibleChildren = module.children?.filter(child => 
                child.roles.some(role => hasRole(role))
              ) || [];

              return (
                <div
                  key={module.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <Card className="h-full min-h-[240px] flex flex-col transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-border">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 w-full">
                          <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight truncate">{module.title}</CardTitle>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {module.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                      <CardDescription className="text-sm leading-relaxed flex-1">
                        {module.description}
                      </CardDescription>
                      
                      <Button 
                        className="w-full mt-auto" 
                        variant="default"
                        onClick={() => handleAppClick(moduleUrl)}
                      >
                        <span>Open Module</span>
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Hover Overlay */}
                  {isHovered && accessibleChildren.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-3 animate-fade-in">
                      <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden">
                        <CardHeader className="pb-2 bg-muted/30">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                            {module.title} Modules
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="max-h-56 overflow-y-auto">
                            {accessibleChildren.map((child, index) => {
                              const ChildIconComponent = child.icon;
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => handleChildClick(child.url)}
                                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors duration-150 flex items-center space-x-3 text-sm border-b border-border/50 last:border-b-0 ${
                                    index === 0 ? 'border-t-0' : ''
                                  }`}
                                >
                                  <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                                    <ChildIconComponent className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-foreground">{child.title}</div>
                                    <div className="text-xs text-muted-foreground truncate leading-relaxed">
                                      {child.description}
                                    </div>
                                  </div>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No accessible apps */}
          {accessibleApps.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Apps Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have access to any applications at this time. 
                Contact your administrator if you need access to specific modules.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
