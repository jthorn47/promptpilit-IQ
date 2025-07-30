import React from 'react';
import { authServiceAPI } from './services/AuthServiceAPI';
import { useAuthService } from './hooks/useAuthService';

/**
 * AuthService Central Microservice
 * 
 * Features:
 * - RESTful backend microservice for authentication
 * - Token/session management
 * - Password reset and MFA support
 * - Shared across all apps (Easebase, HaaLO, EaseLearnX)
 * - Pluggable policy enforcement
 * - Secure token issuance and refresh strategy
 */
export const AuthServiceModule: React.FC = () => {
  const { isHealthy, policies } = useAuthService();

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Auth Service Status</h2>
      <div className={`p-2 rounded ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        Status: {isHealthy ? 'Healthy' : 'Unhealthy'}
      </div>
      <div className="mt-4">
        <h3 className="font-medium mb-2">Active Policies:</h3>
        <ul className="text-sm text-muted-foreground">
          {policies.map((policy, index) => (
            <li key={index}>• {policy}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Module registration metadata
export const AuthServiceModuleMetadata = {
  id: 'auth-service',
  name: 'Authentication Service',
  version: '1.0.0',
  type: 'microservice' as const,
  category: 'core',
  description: 'Central authentication microservice with JWT and policy enforcement',
  routes: [],
  permissions: ['super_admin'],
  dependencies: [],
  apis: ['AuthServiceAPI'],
  config: {
    isCoreService: true,
    supportsJWT: true,
    supportsMFA: true,
    supportsRateLimit: true,
    supportsAuditLogging: true,
  }
};