import React from 'react';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { moduleRegistry } from '@/modules/core/ModuleLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const NavigationDebug: React.FC = () => {
  const { navigation } = useNavigation();
  const allModules = moduleRegistry.getAllModules();
  const allMenuItems = moduleRegistry.getAllMenuItems();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Navigation Sections: {navigation.length}</h3>
            <div className="space-y-2">
              {navigation.map(section => (
                <div key={section.id} className="border rounded p-2">
                  <div className="font-medium">{section.title} ({section.items?.length || 0} items)</div>
                  <div className="text-sm text-muted-foreground">ID: {section.id}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Registered Modules: {allModules.length}</h3>
            <div className="space-y-2">
              {allModules.map(module => (
                <div key={module.metadata.id} className="border rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{module.metadata.name}</span>
                    <Badge variant={moduleRegistry.isModuleLoaded(module.metadata.id) ? "default" : "secondary"}>
                      {moduleRegistry.isModuleLoaded(module.metadata.id) ? 'Loaded' : 'Not Loaded'}
                    </Badge>
                    <Badge variant={moduleRegistry.hasModuleAccess(module.metadata.id) ? "default" : "destructive"}>
                      {moduleRegistry.hasModuleAccess(module.metadata.id) ? 'Access' : 'No Access'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {module.metadata.id} | Menu Items: {module.menu?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Module Menu Items: {allMenuItems.length}</h3>
            <div className="space-y-2">
              {allMenuItems.map(item => (
                <div key={item.id} className="border rounded p-2">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">
                    Path: {item.path || 'No path'} | Roles: {item.requiredRoles?.join(', ') || 'None'}
                  </div>
                  {item.children && (
                    <div className="ml-4 mt-2">
                      <div className="text-sm font-medium">Children:</div>
                      {item.children.map(child => (
                        <div key={child.id} className="text-sm text-muted-foreground">
                          - {child.label} ({child.path})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};