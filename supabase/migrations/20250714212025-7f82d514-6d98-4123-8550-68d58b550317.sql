-- Add Easelearn logo URL to system settings
INSERT INTO system_settings (
  category,
  key,
  value,
  description,
  is_public,
  created_by
) VALUES (
  'branding',
  'easelearn_logo_url',
  '"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=200&h=80&q=80"',
  'URL for the Easelearn logo displayed in training modules',
  true,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (key) DO NOTHING;