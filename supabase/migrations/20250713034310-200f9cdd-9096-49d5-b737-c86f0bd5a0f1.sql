-- Enable comprehensive integration providers with correct PostgreSQL array syntax
-- First, let's add all the missing integration providers

-- Email & Marketing category
INSERT INTO public.integration_providers (name, display_name, category, description, auth_type, config_schema, webhook_events, is_active) VALUES
('sendgrid', 'SendGrid', 'email', 'Cloud-based email delivery service', 'api_key', '{"api_key": {"required": true, "description": "SendGrid API Key"}}', ARRAY['delivered', 'bounce', 'open', 'click'], true),
('constant_contact', 'Constant Contact', 'email', 'Email marketing and online survey tool', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['contact.created', 'campaign.sent'], true),
('convertkit', 'ConvertKit', 'email', 'Email marketing for creators', 'api_key', '{"api_key": {"required": true, "description": "ConvertKit API Key"}}', ARRAY['subscriber.created', 'purchase.created'], true),

-- Payment & E-commerce category  
('paypal', 'PayPal', 'payment', 'Digital payment platform', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['payment.completed', 'subscription.created'], true),
('square', 'Square', 'payment', 'Payment processing and point-of-sale', 'oauth2', '{"application_id": {"required": true}, "access_token": {"required": true}}', ARRAY['payment.created', 'customer.created'], true),
('shopify', 'Shopify', 'payment', 'E-commerce platform and payment processing', 'api_key', '{"api_key": {"required": true}, "shop_domain": {"required": true}}', ARRAY['orders/create', 'customers/create', 'app/uninstalled'], true),

-- Communication & Messaging category
('discord', 'Discord', 'communication', 'Gaming-focused communication platform', 'webhook', '{"webhook_url": {"required": true, "description": "Discord Webhook URL"}}', ARRAY['message'], true),
('microsoft_teams', 'Microsoft Teams', 'communication', 'Business communication platform', 'oauth2', '{"client_id": {"required": true}, "tenant_id": {"required": true}}', ARRAY['message', 'meeting.started'], true),
('zoom', 'Zoom', 'communication', 'Video conferencing platform', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['meeting.started', 'meeting.ended', 'recording.completed'], true),

-- Cloud Storage & Files category
('google_drive', 'Google Drive', 'cloud_storage', 'Cloud storage and file sharing', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['file.created', 'file.updated', 'file.shared'], true),
('dropbox', 'Dropbox', 'cloud_storage', 'Cloud storage and collaboration', 'oauth2', '{"app_key": {"required": true}, "app_secret": {"required": true}}', ARRAY['file.created', 'file.deleted', 'folder.shared'], true),
('onedrive', 'OneDrive', 'cloud_storage', 'Microsoft cloud storage', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['item.created', 'item.updated', 'item.deleted'], true),

-- Analytics & Tracking category
('mixpanel', 'Mixpanel', 'analytics', 'Advanced analytics for mobile and web', 'api_key', '{"api_secret": {"required": true}, "project_token": {"required": true}}', ARRAY['track', 'engage'], true),
('segment', 'Segment', 'analytics', 'Customer data platform', 'api_key', '{"write_key": {"required": true}, "workspace_slug": {"required": true}}', ARRAY['track', 'identify', 'page'], true),
('hotjar', 'Hotjar', 'analytics', 'Website heatmaps and session recordings', 'api_key', '{"api_key": {"required": true}, "site_id": {"required": true}}', ARRAY['recording.created', 'heatmap.updated'], true),

-- Calendar & Scheduling category
('calendly', 'Calendly', 'calendar', 'Automated scheduling tool', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['invitee.created', 'invitee.canceled'], true),
('google_calendar', 'Google Calendar', 'calendar', 'Online calendar service', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['event.created', 'event.updated', 'event.deleted'], true),
('outlook_calendar', 'Outlook Calendar', 'calendar', 'Microsoft calendar service', 'oauth2', '{"client_id": {"required": true}, "tenant_id": {"required": true}}', ARRAY['event.created', 'event.updated'], true),

-- Maps & Location category
('google_maps', 'Google Maps', 'maps', 'Mapping and location services', 'api_key', '{"api_key": {"required": true, "description": "Google Maps API Key"}}', ARRAY[]::text[], true),
('mapbox', 'Mapbox', 'maps', 'Custom maps and location data', 'api_key', '{"access_token": {"required": true, "description": "Mapbox Access Token"}}', ARRAY[]::text[], true),

-- AI & Machine Learning category
('openai', 'OpenAI', 'ai_ml', 'AI and language model APIs', 'api_key', '{"api_key": {"required": true, "description": "OpenAI API Key"}}', ARRAY[]::text[], true),
('anthropic', 'Anthropic', 'ai_ml', 'Claude AI assistant', 'api_key', '{"api_key": {"required": true, "description": "Anthropic API Key"}}', ARRAY[]::text[], true),
('azure_cognitive', 'Azure Cognitive Services', 'ai_ml', 'Microsoft AI and cognitive services', 'api_key', '{"subscription_key": {"required": true}, "endpoint": {"required": true}}', ARRAY[]::text[], true),

-- Social Media category
('facebook', 'Facebook', 'social_media', 'Social networking platform', 'oauth2', '{"app_id": {"required": true}, "app_secret": {"required": true}}', ARRAY['feed', 'page'], true),
('twitter', 'Twitter/X', 'social_media', 'Microblogging social network', 'oauth2', '{"api_key": {"required": true}, "api_secret": {"required": true}}', ARRAY['tweet', 'follow'], true),
('linkedin', 'LinkedIn', 'social_media', 'Professional networking platform', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['share', 'profile'], true),
('instagram', 'Instagram', 'social_media', 'Photo and video sharing platform', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['media', 'story'], true),

-- Security & Authentication category
('auth0', 'Auth0', 'security', 'Identity and access management', 'api_key', '{"domain": {"required": true}, "client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['login', 'signup'], true),
('okta', 'Okta', 'security', 'Identity and access management', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}, "domain": {"required": true}}', ARRAY['user.lifecycle.create', 'user.session.start'], true),

-- Business Intelligence category
('tableau', 'Tableau', 'business_intelligence', 'Data visualization and business intelligence', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['workbook.updated', 'datasource.refresh'], true),
('power_bi', 'Power BI', 'business_intelligence', 'Microsoft business analytics', 'oauth2', '{"client_id": {"required": true}, "tenant_id": {"required": true}}', ARRAY['dataset.refresh', 'report.updated'], true),

-- Design & Media category
('figma', 'Figma', 'design_media', 'Collaborative design tool', 'api_key', '{"personal_access_token": {"required": true, "description": "Figma Personal Access Token"}}', ARRAY['file.updated', 'comment.created'], true),
('canva', 'Canva', 'design_media', 'Graphic design platform', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['design.created', 'design.published'], true),
('unsplash', 'Unsplash', 'design_media', 'Stock photography platform', 'api_key', '{"access_key": {"required": true, "description": "Unsplash Access Key"}}', ARRAY[]::text[], true),

-- Project Management category
('asana', 'Asana', 'project_management', 'Team task and project management', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['task.added', 'project.added', 'story.added'], true),
('trello', 'Trello', 'project_management', 'Kanban-style project management', 'oauth2', '{"api_key": {"required": true}, "api_secret": {"required": true}}', ARRAY['card.created', 'list.created', 'board.updated'], true),
('monday', 'Monday.com', 'project_management', 'Work operating system', 'api_key', '{"api_token": {"required": true, "description": "Monday.com API Token"}}', ARRAY['item.created', 'board.created', 'update.created'], true),
('notion', 'Notion', 'project_management', 'All-in-one workspace', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['page.created', 'database.updated'], true),
('jira', 'Jira', 'project_management', 'Issue tracking and project management', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['issue.created', 'issue.updated'], true),

-- Inventory & Logistics category
('shipstation', 'ShipStation', 'inventory', 'Shipping and order fulfillment', 'api_key', '{"api_key": {"required": true}, "api_secret": {"required": true}}', ARRAY['order.notify', 'shipment.notify'], true),
('quickbooks', 'QuickBooks', 'inventory', 'Accounting and inventory management', 'oauth2', '{"client_id": {"required": true}, "client_secret": {"required": true}}', ARRAY['item.create', 'invoice.create'], true)

ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  auth_type = EXCLUDED.auth_type,
  config_schema = EXCLUDED.config_schema,
  webhook_events = EXCLUDED.webhook_events,
  is_active = EXCLUDED.is_active,
  updated_at = now();