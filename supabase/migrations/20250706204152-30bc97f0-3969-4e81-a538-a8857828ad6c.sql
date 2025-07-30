-- Fix missing integration providers data with correct array format
-- Insert integration providers if they don't exist
INSERT INTO public.integration_providers (name, display_name, category, description, auth_type, config_schema, webhook_events, rate_limits, is_active) VALUES
('hubspot', 'HubSpot', 'crm', 'Customer relationship management and marketing automation platform', 'api_key', '{"api_key": {"required": true, "description": "HubSpot API Key"}}', ARRAY['contact.creation', 'contact.propertyChange', 'deal.creation', 'deal.propertyChange'], '{"requests_per_minute": 100}', true),
('stripe', 'Stripe', 'payment', 'Online payment processing platform', 'api_key', '{"secret_key": {"required": true, "description": "Stripe Secret Key"}}', ARRAY['customer.created', 'customer.updated', 'invoice.payment_succeeded', 'payment_intent.succeeded'], '{"requests_per_minute": 100}', true),
('slack', 'Slack', 'communication', 'Team collaboration and messaging platform', 'oauth2', '{"bot_token": {"required": true, "description": "Slack Bot Token"}}', ARRAY['message', 'channel.created', 'user.joined'], '{"requests_per_minute": 100}', true),
('mailchimp', 'Mailchimp', 'email', 'Email marketing and automation platform', 'api_key', '{"api_key": {"required": true, "description": "Mailchimp API Key"}}', ARRAY['subscribe', 'unsubscribe', 'profile', 'campaign'], '{"requests_per_minute": 100}', true),
('zapier', 'Zapier', 'automation', 'Workflow automation platform', 'webhook', '{"webhook_url": {"required": true, "description": "Zapier Webhook URL"}}', ARRAY['trigger'], '{"requests_per_minute": 100}', true),
('google_analytics', 'Google Analytics', 'analytics', 'Web analytics and reporting platform', 'oauth2', '{"client_id": {"required": true, "description": "Google Client ID"}, "client_secret": {"required": true, "description": "Google Client Secret"}}', ARRAY[]::text[], '{"requests_per_minute": 100}', true),
('twilio', 'Twilio', 'communication', 'Cloud communications platform', 'api_key', '{"account_sid": {"required": true, "description": "Twilio Account SID"}, "auth_token": {"required": true, "description": "Twilio Auth Token"}}', ARRAY['message.status', 'call.status'], '{"requests_per_minute": 100}', true)
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