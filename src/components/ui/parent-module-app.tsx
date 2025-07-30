import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ChildModule {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  roles: string[];
}

interface ParentModuleAppProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ChildModule[];
}

export const ParentModuleApp: React.FC<ParentModuleAppProps> = ({
  title,
  description,
  icon: Icon,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Only show the overview on the root path of the module
  const isRootPath = location.pathname.endsWith('/client-management') || location.pathname === '/client-management/';

  const handleChildClick = (url: string) => {
    navigate(url);
  };

  // If we're not on the root path, don't render the overview - let the child route handle its own layout
  if (!isRootPath) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Icon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <Card 
                key={child.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border bg-card"
                onClick={() => handleChildClick(child.url)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ChildIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {child.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {child.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};