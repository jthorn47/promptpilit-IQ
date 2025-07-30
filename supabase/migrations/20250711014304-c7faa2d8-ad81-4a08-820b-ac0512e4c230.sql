-- Add demo data to existing clients with Bakersfield, CA information
UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Sarah Johnson",
      "title": "Operations Manager", 
      "email": "sarah.johnson@420kingdom.com",
      "phone": "(661) 555-0101",
      "is_primary": true
    },
    {
      "name": "Mike Rodriguez", 
      "title": "Assistant Manager",
      "email": "mike.r@420kingdom.com", 
      "phone": "(661) 555-0102",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Compliance Training", "Safety Certification", "Employee Onboarding"]'::jsonb,
  notes = 'Cannabis retail location in Bakersfield. Requires specialized compliance training for state regulations. Team of 12 employees.',
  contract_value = 24500.00,
  contract_start_date = '2024-01-15',
  contract_end_date = '2025-01-14'
WHERE company_name = '420 Kingdom';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Jennifer Martinez",
      "title": "HR Director",
      "email": "j.martinez@altasierradairy.com", 
      "phone": "(661) 555-0201",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Safety Training", "OSHA Compliance", "Food Safety Certification"]'::jsonb,
  notes = 'Large dairy operation with 45+ employees. Focus on agricultural safety and food handling protocols.',
  contract_value = 67800.00,
  contract_start_date = '2024-02-01',
  contract_end_date = '2025-01-31'
WHERE company_name = 'Alta Sierra Dairy';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "David Thompson",
      "title": "Safety Coordinator",
      "email": "d.thompson@assumesafety.com",
      "phone": "(661) 555-0301", 
      "is_primary": true
    },
    {
      "name": "Lisa Park",
      "title": "Training Manager",
      "email": "lisa.park@assumesafety.com",
      "phone": "(661) 555-0302",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Advanced Safety Training", "Instructor Certification", "Custom Training Development"]'::jsonb,
  notes = 'Safety consulting firm serving Central Valley. Requires train-the-trainer programs for their consultants.',
  contract_value = 34200.00,
  contract_start_date = '2024-03-01',
  contract_end_date = '2025-02-28'
WHERE company_name = 'Assume Safety LLC';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Robert Chen",
      "title": "Office Manager", 
      "email": "r.chen@ccescrow.com",
      "phone": "(661) 555-0401",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Professional Development", "Customer Service Training", "Compliance Training"]'::jsonb,
  notes = 'Escrow company with 8 employees. Focus on real estate transaction training and customer service excellence.',
  contract_value = 18900.00,
  contract_start_date = '2024-01-10',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Central California Escrow Co.';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Demo User",
      "title": "Administrator",
      "email": "admin@democompany.com",
      "phone": "(661) 555-0001",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Demo Training Module", "Test Certification", "Sample Course"]'::jsonb,
  notes = 'Demo company for testing and demonstration purposes. Contains sample training content.',
  contract_value = 0.00,
  contract_start_date = '2024-01-01',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Demo Co';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Amanda Foster",
      "title": "General Manager",
      "email": "amanda@dogtopiabakerfield.com", 
      "phone": "(661) 555-0501",
      "is_primary": true
    },
    {
      "name": "Carlos Gutierrez",
      "title": "Assistant Manager", 
      "email": "carlos@dogtopiabakerfield.com",
      "phone": "(661) 555-0502", 
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Customer Service Training", "Pet Care Certification", "Safety Protocols"]'::jsonb,
  notes = 'Dog daycare and boarding facility. Team of 15 staff members. Focus on animal care safety and customer service.',
  contract_value = 28750.00,
  contract_start_date = '2024-02-15',
  contract_end_date = '2025-02-14'
WHERE company_name = 'Dogtopia Bakersfield';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Jessica Williams",
      "title": "Operations Director",
      "email": "jessica@easeworks.com",
      "phone": "(661) 555-9999",
      "is_primary": true
    },
    {
      "name": "Marcus Johnson", 
      "title": "Training Coordinator",
      "email": "marcus@easeworks.com",
      "phone": "(661) 555-9998",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Internal Training", "Leadership Development", "Technology Training"]'::jsonb,
  notes = 'Internal training for Easeworks team. Focus on leadership development and new technology adoption.',
  contract_value = 125000.00,
  contract_start_date = '2024-01-01', 
  contract_end_date = '2024-12-31'
WHERE company_name = 'Easeworks, LLC';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Patricia Davis",
      "title": "HR Manager",
      "email": "p.davis@evergreencorp.com",
      "phone": "(661) 555-0601", 
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Environmental Safety", "Sustainability Training", "Employee Development"]'::jsonb,
  notes = 'Environmental services company. 22 employees requiring specialized environmental safety training.',
  contract_value = 41300.00,
  contract_start_date = '2024-03-15',
  contract_end_date = '2025-03-14'
WHERE company_name = 'Evergreen';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Brandon Lee",
      "title": "Studio Manager", 
      "email": "brandon@f45riverlakes.com",
      "phone": "(661) 555-0701",
      "is_primary": true
    },
    {
      "name": "Ashley Turner",
      "title": "Lead Trainer",
      "email": "ashley@f45riverlakes.com", 
      "phone": "(661) 555-0702",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Fitness Certification", "Customer Service", "Emergency Response Training"]'::jsonb,
  notes = 'Fitness studio with 8 trainers and staff. Focus on fitness certifications and emergency response protocols.',
  contract_value = 19800.00,
  contract_start_date = '2024-01-20',
  contract_end_date = '2024-12-31'
WHERE company_name = 'F45 Training Riverlakes';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Steven Garcia",
      "title": "Owner/Manager",
      "email": "steven@f45visalia.com",
      "phone": "(661) 555-0801",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Fitness Certification", "Leadership Training", "Business Development"]'::jsonb,
  notes = 'F45 franchise location in Visalia. Small team of 6 staff members. Owner-operated facility.',
  contract_value = 16500.00,
  contract_start_date = '2024-02-01',
  contract_end_date = '2024-12-31'
WHERE company_name = 'F45 Training Visalia';