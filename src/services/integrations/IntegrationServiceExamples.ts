/**
 * Example service demonstrating how backend microservices can securely
 * use IntegrationKeyService to access 3rd-party API credentials
 */

interface QuickBooksAPIService {
  createInvoice(clientId: string, invoiceData: any): Promise<any>;
  syncCustomers(clientId: string): Promise<any>;
}

interface HubSpotAPIService {
  createContact(clientId: string, contactData: any): Promise<any>;
  syncDeals(clientId: string): Promise<any>;
}

/**
 * Example: QuickBooks integration service
 * This would typically be in a separate microservice
 */
export class QuickBooksService implements QuickBooksAPIService {
  
  async createInvoice(clientId: string, invoiceData: any): Promise<any> {
    try {
      // Step 1: Request secure credential access via edge function
      const credentialResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app: 'quickbooks',
          clientId: clientId,
          purpose: 'create_invoice',
          requestedBy: 'quickbooks-service'
        })
      });

      if (!credentialResponse.ok) {
        throw new Error('Failed to get QuickBooks credentials');
      }

      const { sessionToken } = await credentialResponse.json();

      // Step 2: Use session token to get actual credentials
      const useCredentialsResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/use-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          purpose: 'create_invoice'
        })
      });

      if (!useCredentialsResponse.ok) {
        throw new Error('Failed to retrieve QuickBooks credentials');
      }

      const { credentials } = await useCredentialsResponse.json();

      // Step 3: Use credentials to make QuickBooks API call
      const qbResponse = await fetch('https://sandbox-quickbooks.api.intuit.com/v3/company/{companyId}/invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      if (!qbResponse.ok) {
        const error = await qbResponse.text();
        throw new Error(`QuickBooks API error: ${error}`);
      }

      return await qbResponse.json();

    } catch (error) {
      console.error('QuickBooks invoice creation failed:', error);
      throw error;
    }
  }

  async syncCustomers(clientId: string): Promise<any> {
    // Similar pattern for syncing customers
    try {
      const credentialResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app: 'quickbooks',
          clientId: clientId,
          purpose: 'sync_customers',
          requestedBy: 'quickbooks-service'
        })
      });

      const { sessionToken } = await credentialResponse.json();

      const useCredentialsResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/use-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          purpose: 'sync_customers'
        })
      });

      const { credentials } = await useCredentialsResponse.json();

      const qbResponse = await fetch('https://sandbox-quickbooks.api.intuit.com/v3/company/{companyId}/items/customer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Accept': 'application/json'
        }
      });

      return await qbResponse.json();

    } catch (error) {
      console.error('QuickBooks customer sync failed:', error);
      throw error;
    }
  }
}

/**
 * Example: HubSpot integration service
 */
export class HubSpotService implements HubSpotAPIService {
  
  async createContact(clientId: string, contactData: any): Promise<any> {
    try {
      const credentialResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app: 'hubspot',
          clientId: clientId,
          purpose: 'create_contact',
          requestedBy: 'hubspot-service'
        })
      });

      const { sessionToken } = await credentialResponse.json();

      const useCredentialsResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/use-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          purpose: 'create_contact'
        })
      });

      const { credentials } = await useCredentialsResponse.json();

      const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      return await hubspotResponse.json();

    } catch (error) {
      console.error('HubSpot contact creation failed:', error);
      throw error;
    }
  }

  async syncDeals(clientId: string): Promise<any> {
    // Similar pattern for syncing deals
    try {
      const credentialResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app: 'hubspot',
          clientId: clientId,
          purpose: 'sync_deals',
          requestedBy: 'hubspot-service'
        })
      });

      const { sessionToken } = await credentialResponse.json();

      const useCredentialsResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/use-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          purpose: 'sync_deals'
        })
      });

      const { credentials } = await useCredentialsResponse.json();

      const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return await hubspotResponse.json();

    } catch (error) {
      console.error('HubSpot deals sync failed:', error);
      throw error;
    }
  }
}

/**
 * Simplified helper function for common integration credential access pattern
 */
export class IntegrationServiceHelper {
  
  static async withCredentials<T>(
    app: string,
    clientId: string,
    purpose: string,
    serviceName: string,
    apiCall: (accessToken: string, credentials: any) => Promise<T>
  ): Promise<T> {
    try {
      // Get session token
      const credentialResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app,
          clientId,
          purpose,
          requestedBy: serviceName
        })
      });

      if (!credentialResponse.ok) {
        throw new Error(`Failed to get ${app} credentials`);
      }

      const { sessionToken } = await credentialResponse.json();

      // Use session token to get credentials
      const useCredentialsResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/use-integration-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken,
          purpose
        })
      });

      if (!useCredentialsResponse.ok) {
        throw new Error(`Failed to retrieve ${app} credentials`);
      }

      const { credentials } = await useCredentialsResponse.json();

      // Execute the API call with credentials
      return await apiCall(credentials.access_token, credentials);

    } catch (error) {
      console.error(`Integration service error for ${app}:`, error);
      throw error;
    }
  }
}

// Usage example with the helper:
/*
const result = await IntegrationServiceHelper.withCredentials(
  'quickbooks',
  clientId,
  'create_invoice',
  'quickbooks-service',
  async (accessToken, credentials) => {
    const response = await fetch('https://sandbox-quickbooks.api.intuit.com/v3/company/{companyId}/invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });
    return response.json();
  }
);
*/