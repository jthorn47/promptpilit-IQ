import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { parentModules } from '@/data/hierarchicalApps';
import { useAuth } from '@/contexts/AuthContext';

interface ParentModuleAppProps {
  moduleId?: string;
}

export const ParentModuleApp: React.FC<ParentModuleAppProps> = ({ moduleId: propModuleId }) => {
  const { moduleId: paramModuleId } = useParams();
  const navigate = useNavigate();
  const { user, hasRole, userRoles } = useAuth();
  
  // Get the appropriate launchpad route based on user role
  const getLaunchpadRoute = () => {
    if (userRoles?.includes('super_admin')) return '/launchpad/system';
    if (userRoles?.includes('company_admin')) return '/launchpad/company-admin';
    if (userRoles?.includes('client_admin')) return '/launchpad/client-admin';
    if (userRoles?.includes('admin')) return '/launchpad/admin';
    if (userRoles?.includes('learner')) return '/launchpad/learn';
    return '/launchpad/employee';
  };
  
  const moduleId = propModuleId || paramModuleId;
  
  // Find the parent module
  const parentModule = parentModules.find(module => module.id === moduleId);
  
  if (!parentModule) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested module "{moduleId}" could not be found.</p>
          <Button onClick={() => navigate(getLaunchpadRoute())} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Launchpad
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has access to this parent module
  const hasAccess = parentModule.roles.some(role => hasRole(role));
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access {parentModule.title}.</p>
          <Button onClick={() => navigate(getLaunchpadRoute())} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Launchpad
          </Button>
        </div>
      </div>
    );
  }

  // Filter child modules based on user roles
  const accessibleChildren = parentModule.children.filter(child => 
    child.roles.some(role => hasRole(role))
  );

  const handleChildClick = (childUrl: string) => {
    console.log('🔥 ParentModuleApp: Navigating to child:', childUrl);
    navigate(childUrl);
  };

  const IconComponent = parentModule.icon;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(getLaunchpadRoute())}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Launchpad
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{parentModule.title}</h1>
              <p className="text-muted-foreground">{parentModule.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessibleChildren.map((child) => {
          const ChildIconComponent = child.icon;
          
          return (
            <Card 
              key={child.id} 
              className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-border"
              onClick={() => {
                console.log('🎯 Card clicked:', child.title, 'URL:', child.url);
                handleChildClick(child.url);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ChildIconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.title}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {child.description}
                </CardDescription>
                
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🎯 Button clicked:', child.title, 'URL:', child.url);
                    handleChildClick(child.url);
                  }}
                >
                  Open Module
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No accessible children */}
      {accessibleChildren.length === 0 && (
        <div className="text-center py-12">
          <IconComponent className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Modules Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have access to any modules within {parentModule.title} at this time. 
            Contact your administrator if you need access to specific modules.
          </p>
        </div>
      )}
    </div>
  );
};