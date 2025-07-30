-- Insert test companies into the invitations table
INSERT INTO public.invitations (
  company_name, 
  contact_name, 
  contact_email, 
  industry, 
  company_size, 
  generated_content, 
  assessment_url, 
  status,
  invited_at
) VALUES 
(
  'Premier Professional Services',
  'Sarah Johnson',
  'sarah.johnson@premierpro.com',
  'Professional Services',
  '51-200 employees',
  'Subject: 5 Minute HR Risk Assessment for Premier Professional Services\n\nDear Sarah,\n\nWe hope this message finds you well. At Easeworks, we specialize in helping professional services firms like Premier Professional Services optimize their HR practices and reduce compliance risks...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'completed',
  '2024-01-15 09:30:00+00'
),
(
  'TechStart Innovations',
  'Michael Chen',
  'michael.chen@techstart.io',
  'Technology',
  '11-50 employees',
  'Subject: 5 Minute HR Risk Assessment for TechStart Innovations\n\nDear Michael,\n\nAs a growing technology company, TechStart Innovations faces unique HR challenges in the fast-paced tech industry...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'sent',
  '2024-01-20 14:15:00+00'
),
(
  'MedCare Solutions',
  'Dr. Jennifer Rodriguez',
  'j.rodriguez@medcaresolutions.com',
  'Healthcare',
  '201-500 employees',
  'Subject: 5 Minute HR Risk Assessment for MedCare Solutions\n\nDear Dr. Rodriguez,\n\nHealthcare organizations like MedCare Solutions must navigate complex compliance requirements while maintaining exceptional patient care...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'pending',
  '2024-01-25 11:45:00+00'
),
(
  'Global Manufacturing Corp',
  'Robert Williams',
  'robert.williams@globalmanufacturing.com',
  'Manufacturing',
  '500+ employees',
  'Subject: 5 Minute HR Risk Assessment for Global Manufacturing Corp\n\nDear Robert,\n\nManufacturing companies like Global Manufacturing Corp face unique safety and workforce management challenges...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'sent',
  '2024-01-28 16:20:00+00'
),
(
  'Retail Excellence Inc',
  'Lisa Thompson',
  'lisa.thompson@retailexcellence.com',
  'Retail',
  '51-200 employees',
  'Subject: 5 Minute HR Risk Assessment for Retail Excellence Inc\n\nDear Lisa,\n\nRetail organizations like Retail Excellence Inc must balance customer service excellence with complex employment law compliance...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'completed',
  '2024-02-01 10:10:00+00'
),
(
  'EduTech Academy',
  'Professor David Martinez',
  'david.martinez@edutech.edu',
  'Education',
  '11-50 employees',
  'Subject: 5 Minute HR Risk Assessment for EduTech Academy\n\nDear Professor Martinez,\n\nEducational institutions like EduTech Academy face unique HR challenges in managing both academic and administrative staff...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'pending',
  '2024-02-05 13:30:00+00'
),
(
  'FinanceFirst Bank',
  'Amanda Davis',
  'amanda.davis@financefirst.com',
  'Finance',
  '201-500 employees',
  'Subject: 5 Minute HR Risk Assessment for FinanceFirst Bank\n\nDear Amanda,\n\nFinancial institutions like FinanceFirst Bank operate under strict regulatory oversight requiring meticulous HR compliance...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'sent',
  '2024-02-08 08:45:00+00'
),
(
  'BuildRight Construction',
  'James Anderson',
  'james.anderson@buildright.com',
  'Construction',
  '51-200 employees',
  'Subject: 5 Minute HR Risk Assessment for BuildRight Construction\n\nDear James,\n\nConstruction companies like BuildRight Construction face significant safety and compliance challenges in managing their workforce...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'pending',
  '2024-02-10 15:00:00+00'
),
(
  'Acme Corporation',
  'John Smith',
  'john.smith@acmecorp.com',
  'Technology',
  '1-10 employees',
  'Subject: 5 Minute HR Risk Assessment for Acme Corporation\n\nDear John,\n\nAs a startup technology company, Acme Corporation needs to establish strong HR foundations from the beginning...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'completed',
  '2024-02-12 12:15:00+00'
),
(
  'Green Energy Solutions',
  'Emily Green',
  'emily.green@greenenergysol.com',
  'Other',
  '11-50 employees',
  'Subject: 5 Minute HR Risk Assessment for Green Energy Solutions\n\nDear Emily,\n\nSustainable energy companies like Green Energy Solutions are at the forefront of innovation while managing growing teams...',
  'https://xfamoteqtucavgiqndfj.supabase.co/assessment',
  'sent',
  '2024-02-15 09:20:00+00'
);