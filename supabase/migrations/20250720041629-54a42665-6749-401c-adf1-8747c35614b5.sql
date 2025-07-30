-- Add tax engine integration providers to the system

-- Insert tax category integration providers
INSERT INTO public.integration_providers (name, display_name, category, description, auth_type, config_schema, webhook_events, icon_url, is_active) VALUES
('symmetry', 'Symmetry Tax Engine', 'tax', 'Professional tax calculation engine with real-time tax rates and compliance features for all US jurisdictions', 'api_key', 
  '{
    "required": ["api_key", "company_id"],
    "properties": {
      "api_key": {"type": "string", "description": "Symmetry API Key"},
      "company_id": {"type": "string", "description": "Your Symmetry Company ID"},
      "environment": {"type": "string", "enum": ["sandbox", "production"], "default": "sandbox"},
      "version": {"type": "string", "enum": ["2024.1", "2023.2"], "default": "2024.1"}
    }
  }',
  '["tax.calculated", "tax.error", "rates.updated"]',
  'https://logo.clearbit.com/symmetry.com',
  true
),
('avalara', 'Avalara AvaTax', 'tax', 'Cloud-based tax compliance software for automated sales and use tax calculations', 'api_key',
  '{
    "required": ["account_id", "license_key"],
    "properties": {
      "account_id": {"type": "string", "description": "Avalara Account ID"},
      "license_key": {"type": "string", "description": "Avalara License Key"},
      "environment": {"type": "string", "enum": ["sandbox", "production"], "default": "sandbox"},
      "company_code": {"type": "string", "description": "Company Code in Avalara"}
    }
  }',
  '["tax.calculated", "address.validated", "exemption.created"]',
  'https://logo.clearbit.com/avalara.com',
  true
),
('taxjar', 'TaxJar', 'tax', 'Sales tax automation for ecommerce businesses with real-time tax calculations', 'api_key',
  '{
    "required": ["api_token"],
    "properties": {
      "api_token": {"type": "string", "description": "TaxJar API Token"},
      "environment": {"type": "string", "enum": ["sandbox", "production"], "default": "sandbox"}
    }
  }',
  '["tax.calculated", "order.created", "refund.created"]',
  'https://logo.clearbit.com/taxjar.com',
  true
),
('vertex', 'Vertex Tax Technology', 'tax', 'Enterprise tax determination software for complex multi-jurisdictional calculations', 'api_key',
  '{
    "required": ["username", "password", "trusted_id"],
    "properties": {
      "username": {"type": "string", "description": "Vertex Username"},
      "password": {"type": "string", "description": "Vertex Password"},
      "trusted_id": {"type": "string", "description": "Vertex Trusted ID"},
      "environment": {"type": "string", "enum": ["test", "production"], "default": "test"}
    }
  }',
  '["tax.calculated", "location.validated", "exemption.verified"]',
  'https://logo.clearbit.com/vertexinc.com',
  true
),
('ryan', 'Ryan Tax Technology', 'tax', 'Comprehensive tax compliance and calculation platform for large enterprises', 'oauth2',
  '{
    "required": ["client_id", "client_secret"],
    "properties": {
      "client_id": {"type": "string", "description": "Ryan OAuth Client ID"},
      "client_secret": {"type": "string", "description": "Ryan OAuth Client Secret"},
      "scope": {"type": "string", "default": "tax.calculate tax.report"}
    }
  }',
  '["tax.calculated", "audit.completed", "filing.submitted"]',
  'https://logo.clearbit.com/ryan.com',
  true
);