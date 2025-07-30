/**
 * Dynamic Module Route Renderer
 * Renders routes dynamically from the module registry with tenant-level permissions
 */

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { moduleRegistry } from './ModuleLoader';
import { Loader2 } from 'lucide-react';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading module...</p>
    </div>
  </div>
);

interface DynamicModuleRoutesProps {
  pathPrefix?: string;
}

export const DynamicModuleRoutes: React.FC<DynamicModuleRoutesProps> = ({
  pathPrefix = '/admin'
}) => {
  console.log('🔥 DynamicModuleRoutes: Component called with pathPrefix:', pathPrefix);
  console.log('🔥 DynamicModuleRoutes: Current path:', window.location.pathname);
  
  const [isRegistryReady, setIsRegistryReady] = useState(moduleRegistry.isReady());
  
  // Poll for registry readiness
  useEffect(() => {
    if (isRegistryReady) return;
    
    const checkReady = () => {
      if (moduleRegistry.isReady()) {
        setIsRegistryReady(true);
      }
    };
    
    // Check immediately and then every 100ms
    checkReady();
    const interval = setInterval(checkReady, 100);
    
    // Cleanup after 10 seconds to avoid infinite polling
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsRegistryReady(true); // Force ready state after timeout
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRegistryReady]);

  const moduleRoutes = useMemo(() => {
    if (!isRegistryReady) {
      return [];
    }
    
    const modules = moduleRegistry.getAllModules();
    const allRoutes = moduleRegistry.getAllRoutes();
    console.log('🚨 ALL ROUTES FROM REGISTRY:', allRoutes.map(r => ({
      path: r.path,
      component: r.component?.name,
      startsWithPrefix: r.path.startsWith(pathPrefix)
    })));
    
    const filteredRoutes = allRoutes.filter(route => 
      route.path.startsWith(pathPrefix)
    );
    
    console.log('🔧 DynamicModuleRoutes debug:', {
      pathPrefix,
      isRegistryReady,
      currentPath: window.location.pathname,
      allRoutes: allRoutes.map(r => ({ 
        path: r.path, 
        component: r.component?.name,
        roles: r.roles,
        matchesPrefix: r.path.startsWith(pathPrefix)
      })),
      filteredRoutes: filteredRoutes.map(r => ({ 
        path: r.path, 
        component: r.component?.name,
        roles: r.roles
      })),
      modules: modules.map(m => ({ 
        name: m.metadata.name, 
        id: m.metadata.id, 
        loaded: moduleRegistry.isModuleLoaded(m.metadata.id),
        hasAccess: moduleRegistry.hasModuleAccess(m.metadata.id),
        routes: m.routes?.map(r => ({ path: r.path, roles: r.roles }))
      }))
    });
    
    return filteredRoutes;
  }, [pathPrefix, isRegistryReady]);

  // Show loading while registry is not ready
  if (!isRegistryReady) {
    return <LoadingFallback />;
  }

  if (moduleRoutes.length === 0) {
    console.warn(`⚠️ No routes found for pathPrefix: ${pathPrefix}`);
    
    // Add debugging info when no routes found
    const allModules = moduleRegistry.getAllModules();
    console.log('📊 All registered modules:', allModules.map(m => ({
      id: m.metadata.id,
      name: m.metadata.name,
      routes: m.routes?.map(r => r.path),
      loaded: moduleRegistry.isModuleLoaded(m.metadata.id),
      hasAccess: moduleRegistry.hasModuleAccess(m.metadata.id)
    })));
    
    // Return null instead of debug message so it doesn't show error UI
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {moduleRoutes.map((route, index) => {
            // Better path handling for nested routes
            let routePath: string;
            if (route.path === pathPrefix) {
              routePath = '';
            } else if (route.path.startsWith(pathPrefix + '/')) {
              routePath = route.path.substring(pathPrefix.length + 1);
            } else {
              routePath = route.path.replace(pathPrefix, '').replace(/^\//, '');
            }
            
            // Add wildcard for nested routes if the component has child routes
            if (!route.exact && routePath && !routePath.includes('*')) {
              routePath = `${routePath}/*`;
            }
            
            const Component = route.component;
            
            console.log('🔧 Rendering route:', {
              originalPath: route.path,
              pathPrefix,
              calculatedPath: routePath,
              component: Component?.name
            });
            
            return (
              <Route
                key={`${route.path}-${index}`}
                path={routePath}
                element={
                  <div className="p-4 md:p-6 max-w-[1440px] mx-auto w-full">
                    {route.roles && route.roles.length > 0 ? (
                      <ProtectedRoute requiredRoles={route.roles}>
                        <Component />
                      </ProtectedRoute>
                    ) : (
                      <Component />
                    )}
                  </div>
                }
              />
            );
          })}
        </Routes>
      </Suspense>
    </div>
  );
};