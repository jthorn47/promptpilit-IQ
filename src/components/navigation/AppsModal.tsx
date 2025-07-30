import React from 'react';
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
import { X } from 'lucide-react';

interface AppItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  roles: string[];
}

interface AppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  userRole?: string;
}

export const AppsModal: React.FC<AppsModalProps> = ({
  isOpen,
  onClose,
  apps,
  userRole
}) => {
  const navigate = useNavigate();

  const hasRoleAccess = (requiredRoles: string[]) => {
    return userRole && requiredRoles.includes(userRole);
  };

  const getVisibleApps = () => {
    return apps.filter(app => hasRoleAccess(app.roles));
  };

  const getAppsByCategory = () => {
    const visibleApps = getVisibleApps();
    const categories: Record<string, AppItem[]> = {};
    
    visibleApps.forEach(app => {
      if (!categories[app.category]) {
        categories[app.category] = [];
      }
      categories[app.category].push(app);
    });
    
    return categories;
  };

  const handleAppClick = (url: string) => {
    navigate(url);
    onClose();
  };

  const appsByCategory = getAppsByCategory();
  const categoryNames = Object.keys(appsByCategory);

  if (categoryNames.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Platform Apps</DialogTitle>
              <p className="text-muted-foreground mt-1">
                Access all your business applications and tools
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="space-y-8">
            {categoryNames.map((category) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm font-medium">
                    {category}
                  </Badge>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {appsByCategory[category].map((app) => {
                    const Icon = app.icon;
                    return (
                      <Card 
                        key={app.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border bg-card"
                        onClick={() => handleAppClick(app.url)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {app.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                            {app.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with quick stats */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{getVisibleApps().length} apps available</span>
            <span>{categoryNames.length} categories</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};