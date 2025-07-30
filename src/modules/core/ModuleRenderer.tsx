import React, { useEffect, useState } from 'react';
import { moduleRegistry } from './ModuleLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModuleRendererProps {
  clientId?: string;
  onModuleSelect?: (moduleId: string) => void;
}

const iconMap = {
  Settings,
  DollarSign: () => <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</div>,
  // Add other icons as needed
};

export const ModuleRenderer = ({ clientId, onModuleSelect }: ModuleRendererProps) => {
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load all available modules and set access based on clientId
    const loadModules = async () => {
      setLoading(true);
      
      // Set module access (in real implementation, this would come from API)
      const moduleIds = moduleRegistry.getAllModules().map(m => m.metadata.id);
      moduleIds.forEach(id => {
        moduleRegistry.setModuleAccess(id, true); // For demo, grant access to all
      });

      // Load modules
      for (const moduleId of moduleIds) {
        await moduleRegistry.loadModule(moduleId);
      }
      
      setLoading(false);
    };

    loadModules();
  }, [clientId]);

  const handleModuleAction = (moduleId: string) => {
    if (onModuleSelect) {
      onModuleSelect(moduleId);
    } else {
      setSelectedModule(moduleId);
    }
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'locked': return 'bg-yellow-100 text-yellow-800';
      case 'not_installed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case 'active': return 'Configure';
      case 'locked': return 'Upgrade Required';
      case 'not_installed': return 'Install';
      default: return 'Configure';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading modules...</span>
      </div>
    );
  }

  // If a module is selected, render its component with Suspense boundary
  if (selectedModule) {
    const module = moduleRegistry.getModule(selectedModule);
    if (module && module.getComponent) {
      const ModuleComponent = module.getComponent();
      return (
        <div>
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4 p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-lg font-medium">Loading {module.metadata.name}...</p>
                  <p className="text-sm text-muted-foreground">Preparing your workspace</p>
                </div>
              </div>
            </div>
          }>
            <ModuleComponent onBack={handleBackToModules} />
          </React.Suspense>
        </div>
      );
    }
  }

  // Render module grid
  const accessibleModules = moduleRegistry.getAccessibleModules();
  
  // Filter to show only child modules (Finance IQ should be the main focus)
  const childModules = accessibleModules.filter(module => 
    module.metadata.category === 'finance' || module.metadata.id === 'finance-iq'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">HaaLO IQ Modules</h2>
        <p className="text-muted-foreground">Manage and configure your organization's modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {childModules.map((module) => {
          const IconComponent = iconMap[module.metadata.icon as keyof typeof iconMap] || Settings;
          
          return (
            <Card key={module.metadata.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${module.metadata.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <IconComponent className={`w-5 h-5 ${module.metadata.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {module.metadata.name}
                        {module.metadata.isBeta && <Badge variant="secondary" className="text-xs">Beta</Badge>}
                        {module.metadata.isComingSoon && <Badge variant="outline" className="text-xs">Coming Soon</Badge>}
                        {module.metadata.isPremium && <Badge variant="default" className="text-xs">Premium</Badge>}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.metadata.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(module.metadata.status)}`}
                  >
                    {module.metadata.status.charAt(0).toUpperCase() + module.metadata.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    v{module.metadata.version}
                  </Badge>
                </div>
                
                <Button
                  className="w-full"
                  variant={module.metadata.status === 'active' ? 'default' : 'outline'}
                  onClick={() => handleModuleAction(module.metadata.id)}
                  disabled={module.metadata.isComingSoon}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {getButtonText(module.metadata.status)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {childModules.length === 0 && (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Modules Available</h3>
          <p className="text-muted-foreground">No modules are currently accessible for this organization.</p>
        </div>
      )}
    </div>
  );
};