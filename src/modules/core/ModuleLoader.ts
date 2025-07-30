
/**
 * Module Loader System
 * Handles dynamic loading and registration of HaaLO modules
 */

import { logger } from '@/lib/logger';

export interface ModuleRoute {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
}

export interface ModuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  category: 'core' | 'hr' | 'finance' | 'premium';
  isPremium: boolean;
  isBeta: boolean;
  isComingSoon: boolean;
  requiredSetup: boolean;
  dependencies?: string[];
  status: 'active' | 'inactive' | 'locked' | 'not_installed';
  statusColor: string;
}

export interface ModuleMenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: ModuleMenuItem[];
  requiredRoles?: string[];
  permissions?: string[];
}

export interface ModuleConfiguration {
  [key: string]: any;
}

export interface HaaLOModule {
  metadata: ModuleMetadata;
  routes: ModuleRoute[];
  menu?: ModuleMenuItem[];
  services?: any;
  state?: any;
  configuration?: ModuleConfiguration;
  initialize?: (config?: ModuleConfiguration) => Promise<void>;
  destroy?: () => Promise<void>;
  getComponent?: () => React.ComponentType<any>;
}

class ModuleRegistry {
  private modules = new Map<string, HaaLOModule>();
  private loadedModules = new Set<string>();
  private moduleAccess = new Map<string, boolean>();
  private loadingModules = new Set<string>();
  private isInitialized = false;

  /**
   * Register a module in the registry
   */
  register(module: HaaLOModule): void {
    this.modules.set(module.metadata.id, module);
    logger.ui.info('Module registered', { name: module.metadata.name, id: module.metadata.id });
  }

  /**
   * Get a module by ID
   */
  getModule(id: string): HaaLOModule | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): HaaLOModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): HaaLOModule[] {
    return this.getAllModules().filter(module => module.metadata.category === category);
  }

  /**
   * Load a module (initialize if needed)
   */
  async loadModule(id: string, config?: ModuleConfiguration): Promise<boolean> {
    const module = this.modules.get(id);
    if (!module) {
      console.warn(`⚠️ Module not found: ${id}`);
      return false;
    }

    if (this.loadedModules.has(id)) {
      console.log(`✅ Module already loaded: ${id}`);
      return true;
    }

    if (this.loadingModules.has(id)) {
      console.log(`⏳ Module already loading: ${id}`);
      return true;
    }

    this.loadingModules.add(id);
    
    try {
      if (module.initialize) {
        await module.initialize(config);
      }
      this.loadedModules.add(id);
      this.loadingModules.delete(id);
      console.log(`🚀 Module loaded: ${module.metadata.name}`);
      return true;
    } catch (error) {
      this.loadingModules.delete(id);
      console.error(`❌ Failed to load module ${id}:`, error);
      return false;
    }
  }

  /**
   * Unload a module
   */
  async unloadModule(id: string): Promise<boolean> {
    const module = this.modules.get(id);
    if (!module || !this.loadedModules.has(id)) {
      return false;
    }

    try {
      if (module.destroy) {
        await module.destroy();
      }
      this.loadedModules.delete(id);
      console.log(`🗑️ Module unloaded: ${module.metadata.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unload module ${id}:`, error);
      return false;
    }
  }

  /**
   * Check if module is loaded
   */
  isModuleLoaded(id: string): boolean {
    return this.loadedModules.has(id);
  }

  /**
   * Set module access for tenant
   */
  setModuleAccess(moduleId: string, hasAccess: boolean): void {
    this.moduleAccess.set(moduleId, hasAccess);
  }

  /**
   * Check if tenant has access to module
   */
  hasModuleAccess(moduleId: string): boolean {
    return this.moduleAccess.get(moduleId) ?? false;
  }

  /**
   * Get all routes from loaded modules
   */
  getAllRoutes(): ModuleRoute[] {
    const routes: ModuleRoute[] = [];
    for (const moduleId of this.loadedModules) {
      const module = this.modules.get(moduleId);
      if (module && this.hasModuleAccess(moduleId)) {
        routes.push(...module.routes);
      }
    }
    return routes;
  }

  /**
   * Get all menu items from loaded modules
   */
  getAllMenuItems(): ModuleMenuItem[] {
    const menuItems: ModuleMenuItem[] = [];
    for (const moduleId of this.loadedModules) {
      const module = this.modules.get(moduleId);
      if (module && module.menu && this.hasModuleAccess(moduleId)) {
        menuItems.push(...module.menu);
      }
    }
    return menuItems;
  }

  /**
   * Get filtered modules based on access
   */
  getAccessibleModules(): HaaLOModule[] {
    return this.getAllModules().filter(module => 
      this.hasModuleAccess(module.metadata.id)
    );
  }

  /**
   * Check if any modules are currently loading
   */
  isLoading(): boolean {
    return this.loadingModules.size > 0;
  }

  /**
   * Check if the registry is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.loadingModules.size === 0;
  }

  /**
   * Mark registry as initialized
   */
  markInitialized(): void {
    this.isInitialized = true;
  }
}

// Global module registry instance
export const moduleRegistry = new ModuleRegistry();

// Auto-register core modules
import { ClientDashboardModule } from '../client-dashboard/ClientDashboardModule';
import { HaaLOCoreModule } from '../HaaLO.Core/HaaLOCoreModule';
import { HaaLOPayrollModule } from '../HaaLO.Payroll/HaaLOPayrollModule';
import { HubSpotIntegrationModule } from '../IntegrationHub/HubSpotIntegrationModule';

moduleRegistry.register(ClientDashboardModule);
moduleRegistry.register(HaaLOCoreModule);
moduleRegistry.register(HaaLOPayrollModule);
moduleRegistry.register(HubSpotIntegrationModule);

// Import and register ConnectIQ module
import ConnectIQModule from '../ConnectIQ';
moduleRegistry.register(ConnectIQModule);

// Import and register TimeTrack module using named export
import { HaaLOTimeTrackModule } from '../HaaLO.TimeTrack';
moduleRegistry.register(HaaLOTimeTrackModule);

// Auto-load and give access to core modules
(async () => {
  await moduleRegistry.loadModule('client-dashboard');
  await moduleRegistry.loadModule('haalo-core');
  await moduleRegistry.loadModule('haalo-payroll');
  await moduleRegistry.loadModule('hubspot-integration');
  
  // Load DataBridge module
  await moduleRegistry.loadModule('haalo.databridge');
  
  // Load TimeTrack module
  await moduleRegistry.loadModule('haalo.timetrack');
  
  // Set access for all modules (in production this would be tenant-based)
  moduleRegistry.setModuleAccess('client-dashboard', true);
  moduleRegistry.setModuleAccess('haalo-core', true);
  moduleRegistry.setModuleAccess('haalo-payroll', true);
  moduleRegistry.setModuleAccess('hubspot-integration', true);
  moduleRegistry.setModuleAccess('haalo.databridge', true);
  moduleRegistry.setModuleAccess('haalo.timetrack', true);
  
  // Import and load HRO IQ module after core modules are ready
  await import('../HaaLO.HROIQ');
  await moduleRegistry.loadModule('haalo-hroiq');
  moduleRegistry.setModuleAccess('haalo-hroiq', true);
  
  // Load ConnectIQ module
  await moduleRegistry.loadModule('connect-iq');
  moduleRegistry.setModuleAccess('connect-iq', true);
  
  // Load new child page modules
  await moduleRegistry.loadModule('payroll-iq');
  await moduleRegistry.loadModule('halo-iq');
  
  // Give access to all registered modules for super admins
  const allModules = moduleRegistry.getAllModules();
  allModules.forEach(module => {
    moduleRegistry.setModuleAccess(module.metadata.id, true);
  });
  
  // Mark registry as initialized after core modules are loaded
  moduleRegistry.markInitialized();
})();

/**
 * Module decorator for easy registration
 */
export function RegisterModule(module: HaaLOModule) {
  moduleRegistry.register(module);
  return module;
}
