import { useMemo } from "react";
import { MODULE_DEFINITIONS, ModuleDefinition } from "@/types/modules";

export const useModuleDependencies = (enabledModules: string[]) => {
  const dependencyMap = useMemo(() => {
    const map = new Map<string, string[]>();
    
    MODULE_DEFINITIONS.forEach(module => {
      if (module.dependencies) {
        module.dependencies.forEach(dep => {
          if (!map.has(dep)) {
            map.set(dep, []);
          }
          map.get(dep)?.push(module.id);
        });
      }
    });
    
    return map;
  }, []);

  const getDependentModules = (moduleId: string): ModuleDefinition[] => {
    const dependentIds = dependencyMap.get(moduleId) || [];
    return MODULE_DEFINITIONS.filter(module => 
      dependentIds.includes(module.id) && enabledModules.includes(module.id)
    );
  };

  const getMissingDependencies = (moduleId: string): ModuleDefinition[] => {
    const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
    if (!module?.dependencies) return [];
    
    return module.dependencies
      .filter(depId => !enabledModules.includes(depId))
      .map(depId => MODULE_DEFINITIONS.find(m => m.id === depId))
      .filter(Boolean) as ModuleDefinition[];
  };

  const canDisableModule = (moduleId: string): { canDisable: boolean; reason?: string } => {
    const dependents = getDependentModules(moduleId);
    
    if (dependents.length > 0) {
      return {
        canDisable: false,
        reason: `Required by: ${dependents.map(d => d.name).join(', ')}`
      };
    }
    
    return { canDisable: true };
  };

  const validateModuleEnable = (moduleId: string): { isValid: boolean; missingDeps: ModuleDefinition[] } => {
    const missingDeps = getMissingDependencies(moduleId);
    return {
      isValid: missingDeps.length === 0,
      missingDeps
    };
  };

  return {
    getDependentModules,
    getMissingDependencies,
    canDisableModule,
    validateModuleEnable
  };
};