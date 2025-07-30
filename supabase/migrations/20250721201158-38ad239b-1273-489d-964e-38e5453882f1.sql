-- Create automated scheduling for wage data parsing
SELECT cron.schedule(
  'wage-data-auto-parse',
  '0 2 * * 1', -- Every Monday at 2 AM
  $$
  SELECT net.http_post(
    url := 'https://xfamotequcavggiqndfj.supabase.co/functions/v1/wage-data-parser',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw"}'::jsonb,
    body := '{"source_name": "Federal DOL", "force_parse": false}'::jsonb
  );
  $$
);

-- Schedule parsing for each jurisdiction
SELECT cron.schedule(
  'california-wage-parse',
  '0 3 * * 1', -- Every Monday at 3 AM
  $$
  SELECT net.http_post(
    url := 'https://xfamotequcavggiqndfj.supabase.co/functions/v1/wage-data-parser',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw"}'::jsonb,
    body := '{"source_name": "California DIR", "force_parse": false}'::jsonb
  );
  $$
);