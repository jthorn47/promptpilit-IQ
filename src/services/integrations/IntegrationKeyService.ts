import { supabase } from '@/integrations/supabase/client';

export interface IntegrationCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  connection_id?: string;
  app_name: string;
  client_id: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  expiresIn?: number; // minutes until expiration
}

/**
 * Client-side service for integration credential management
 * Note: This only handles token validation and refresh requests
 * Actual credential retrieval happens server-side for security
 */
export class IntegrationKeyService {
  
  /**
   * Check if an integration is connected for a client
   */
  static async isIntegrationConnected(app: string, clientId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_integration_connection', {
          app_name: app,
          client_id: clientId
        });

      if (error) {
        console.error('Error checking integration connection:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('Error checking integration connection:', error);
      return false;
    }
  }

  /**
   * Get integration status and basic info (without sensitive tokens)
   */
  static async getIntegrationStatus(app: string, clientId: string): Promise<{
    connected: boolean;
    expiresAt?: string;
    needsRefresh?: boolean;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_integration_status', {
          app_name: app,
          client_id: clientId
        });

      if (error) {
        console.error('Error getting integration status:', error);
        return { connected: false };
      }

      return (data as { connected: boolean; expiresAt?: string; needsRefresh?: boolean; }) || { connected: false };
    } catch (error) {
      console.error('Error getting integration status:', error);
      return { connected: false };
    }
  }

  /**
   * Request credential retrieval via secure edge function
   * This returns a session token that can be used by backend services
   */
  static async requestCredentialAccess(
    app: string, 
    clientId: string,
    purpose: string
  ): Promise<{ sessionToken: string; expiresAt: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('get-integration-credentials', {
        body: {
          app,
          clientId,
          purpose,
          requestedBy: 'client-service'
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error requesting credential access:', error);
      throw new Error(`Failed to request credentials for ${app}: ${error}`);
    }
  }

  /**
   * Refresh an expired token via edge function
   */
  static async refreshToken(app: string, clientId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('refresh-integration-token', {
        body: {
          app,
          clientId
        }
      });

      if (error) throw error;
      
      return data.success || false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error(`Failed to refresh token for ${app}: ${error}`);
    }
  }

  /**
   * Disconnect an integration
   */
  static async disconnectIntegration(app: string, clientId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('disconnect_integration', {
          app_name: app,
          client_id: clientId
        });

      if (error) throw error;
      
      return data || true;
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      throw new Error(`Failed to disconnect ${app}: ${error}`);
    }
  }

  /**
   * List all connected integrations for a client
   */
  static async getConnectedIntegrations(clientId: string): Promise<Array<{
    app_name: string;
    connected_at: string;
    expires_at?: string;
    needsRefresh: boolean;
  }>> {
    try {
      const { data, error } = await supabase
        .rpc('get_connected_integrations', {
          client_id: clientId
        });

      if (error) throw error;

      return (data as Array<{
        app_name: string;
        connected_at: string;
        expires_at?: string;
        needsRefresh: boolean;
      }>) || [];
    } catch (error) {
      console.error('Error getting connected integrations:', error);
      throw new Error('Failed to retrieve connected integrations');
    }
  }
}