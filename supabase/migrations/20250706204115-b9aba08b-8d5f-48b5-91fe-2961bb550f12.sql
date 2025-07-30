-- Fix missing integration providers data and add sample data for testing
-- Insert integration providers if they don't exist
INSERT INTO public.integration_providers (name, display_name, category, description, auth_type, config_schema, webhook_events, rate_limits, is_active) VALUES
('hubspot', 'HubSpot', 'crm', 'Customer relationship management and marketing automation platform', 'api_key', '{"api_key": {"required": true, "description": "HubSpot API Key"}}', '["contact.creation", "contact.propertyChange", "deal.creation", "deal.propertyChange"]', '{"requests_per_minute": 100}', true),
('stripe', 'Stripe', 'payment', 'Online payment processing platform', 'api_key', '{"secret_key": {"required": true, "description": "Stripe Secret Key"}}', '["customer.created", "customer.updated", "invoice.payment_succeeded", "payment_intent.succeeded"]', '{"requests_per_minute": 100}', true),
('slack', 'Slack', 'communication', 'Team collaboration and messaging platform', 'oauth2', '{"bot_token": {"required": true, "description": "Slack Bot Token"}}', '["message", "channel.created", "user.joined"]', '{"requests_per_minute": 100}', true),
('mailchimp', 'Mailchimp', 'email', 'Email marketing and automation platform', 'api_key', '{"api_key": {"required": true, "description": "Mailchimp API Key"}}', '["subscribe", "unsubscribe", "profile", "campaign"]', '{"requests_per_minute": 100}', true),
('zapier', 'Zapier', 'automation', 'Workflow automation platform', 'webhook', '{"webhook_url": {"required": true, "description": "Zapier Webhook URL"}}', '["trigger"]', '{"requests_per_minute": 100}', true),
('google_analytics', 'Google Analytics', 'analytics', 'Web analytics and reporting platform', 'oauth2', '{"client_id": {"required": true, "description": "Google Client ID"}, "client_secret": {"required": true, "description": "Google Client Secret"}}', '[]', '{"requests_per_minute": 100}', true),
('twilio', 'Twilio', 'communication', 'Cloud communications platform', 'api_key', '{"account_sid": {"required": true, "description": "Twilio Account SID"}, "auth_token": {"required": true, "description": "Twilio Auth Token"}}', '["message.status", "call.status"]', '{"requests_per_minute": 100}', true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  auth_type = EXCLUDED.auth_type,
  config_schema = EXCLUDED.config_schema,
  webhook_events = EXCLUDED.webhook_events,
  rate_limits = EXCLUDED.rate_limits,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Add sample integrations for testing (optional)
-- These will be created only if no integrations exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.integrations LIMIT 1) THEN
    INSERT INTO public.integrations (name, provider_id, status, configuration, webhook_url, created_by) 
    SELECT 
      'Demo ' || display_name || ' Integration',
      id,
      'inactive',
      '{}',
      'https://example.com/webhooks/' || name,
      (SELECT id FROM auth.users LIMIT 1)
    FROM public.integration_providers
    WHERE name IN ('hubspot', 'stripe', 'slack')
    LIMIT 3;
  END IF;
END $$;