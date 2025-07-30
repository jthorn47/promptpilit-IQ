-- Add Resend integration provider to the integration_providers table
INSERT INTO integration_providers (
  name,
  display_name,
  category,
  description,
  auth_type,
  config_schema,
  webhook_events,
  icon_url,
  is_active
) VALUES (
  'resend',
  'Resend',
  'email',
  'Modern email API for developers. Send transactional emails at scale with a simple API.',
  'api_key',
  '{
    "type": "object",
    "properties": {
      "api_key": {
        "type": "string",
        "title": "API Key",
        "description": "Your Resend API key"
      },
      "from_email": {
        "type": "string",
        "title": "From Email",
        "description": "Default from email address"
      },
      "from_name": {
        "type": "string",
        "title": "From Name",
        "description": "Default sender name"
      }
    },
    "required": ["api_key", "from_email"]
  }',
  ARRAY['email.sent', 'email.delivered', 'email.bounced', 'email.complained'],
  'https://resend.com/favicon.ico',
  true
);