import { HaaLOModule, RegisterModule } from '../core/ModuleLoader';
import { moduleConfig } from './module.config';
import { routes } from './routes';
import { OrgSettingsConfig } from './components/OrgSettingsConfig';

const orgSettingsModule: HaaLOModule = {
  metadata: moduleConfig,
  routes,
  getComponent: () => OrgSettingsConfig,
  
  async initialize(config) {
    console.log(`🚀 Initializing ${moduleConfig.name} module`, config);
    // Module-specific initialization logic here
  },

  async destroy() {
    console.log(`🗑️ Destroying ${moduleConfig.name} module`);
    // Cleanup logic here
  }
};

// Register the module
RegisterModule(orgSettingsModule);

export default orgSettingsModule;