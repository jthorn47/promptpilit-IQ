-- Continue adding demo data to remaining clients
UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Kevin Walsh",
      "title": "Shop Manager",
      "email": "kevin@jmprecisiongolf.com",
      "phone": "(661) 555-0901",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Customer Service Training", "Sales Training", "Safety Protocols"]'::jsonb,
  notes = 'Golf cart sales and service center. Team of 6 employees. Focus on customer service and mechanical safety.',
  contract_value = 14200.00,
  contract_start_date = '2024-02-10',
  contract_end_date = '2024-12-31'
WHERE company_name = 'JM Precision Golf Carts';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Kelly Demo",
      "title": "Demo Coordinator",
      "email": "kelly@demokellyco.com", 
      "phone": "(661) 555-1001",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Demo Training", "Product Demonstration", "Basic Certification"]'::jsonb,
  notes = 'Demo and testing account for Kelly. Used for training demonstrations and system testing.',
  contract_value = 500.00,
  contract_start_date = '2024-01-01',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Kellys Demo';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Maria Gonzalez",
      "title": "Executive Director",
      "email": "m.gonzalez@kernbusiness.org",
      "phone": "(661) 555-1101", 
      "is_primary": true
    },
    {
      "name": "Thomas Anderson",
      "title": "Program Manager",
      "email": "t.anderson@kernbusiness.org",
      "phone": "(661) 555-1102",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Leadership Development", "Economic Development Training", "Grant Writing Workshop"]'::jsonb,
  notes = 'Economic development corporation serving Kern County. Team of 25+ professionals. Focus on business development training.',
  contract_value = 78500.00,
  contract_start_date = '2024-01-05',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Kern Economic Development Corporation';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Frank Miller",
      "title": "Operations Manager",
      "email": "f.miller@kernlivestock.com",
      "phone": "(661) 555-1201",
      "is_primary": true
    },
    {
      "name": "Susan Wright",
      "title": "Safety Coordinator", 
      "email": "s.wright@kernlivestock.com",
      "phone": "(661) 555-1202",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Agricultural Safety", "Heavy Equipment Training", "OSHA Compliance"]'::jsonb,
  notes = 'Livestock and grain operation. 35+ employees. Emphasis on agricultural safety and heavy equipment operation.',
  contract_value = 52300.00,
  contract_start_date = '2024-02-20',
  contract_end_date = '2025-02-19'
WHERE company_name = 'Kern Livestock Grain, Inc';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Dr. Rachel Logan",
      "title": "Practice Administrator",
      "email": "r.logan@logandental.com",
      "phone": "(661) 555-1301",
      "is_primary": true
    },
    {
      "name": "Michelle Torres",
      "title": "Office Manager",
      "email": "m.torres@logandental.com", 
      "phone": "(661) 555-1302",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["HIPAA Training", "Customer Service", "Medical Safety Protocols"]'::jsonb,
  notes = 'Dental practice with 12 staff members. Focus on HIPAA compliance and patient care protocols.',
  contract_value = 22800.00,
  contract_start_date = '2024-03-01',
  contract_end_date = '2025-02-28'
WHERE company_name = 'Logan Dental Corporation';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Ryan Mitchell",
      "title": "General Manager",
      "email": "ryan@lvlfitnessfresno.com",
      "phone": "(661) 555-1401",
      "is_primary": true
    },
    {
      "name": "Nicole Adams", 
      "title": "Assistant Manager",
      "email": "nicole@lvlfitnessfresno.com",
      "phone": "(661) 555-1402",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Fitness Certification", "Customer Service", "Equipment Safety Training"]'::jsonb,
  notes = 'Large fitness facility in Fresno. Team of 18 trainers and staff. Focus on fitness certifications and safety.',
  contract_value = 32100.00,
  contract_start_date = '2024-01-25',
  contract_end_date = '2024-12-31'
WHERE company_name = 'LVL Fitness Fresno, LLC';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Jason Clark",
      "title": "Facility Manager", 
      "email": "jason@lvlclimb.com",
      "phone": "(661) 555-1501",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Rock Climbing Safety", "Emergency Response", "Customer Service Training"]'::jsonb,
  notes = 'Rock climbing gym and fitness facility. Specialized training for climbing safety and emergency procedures.',
  contract_value = 26400.00,
  contract_start_date = '2024-02-05',
  contract_end_date = '2024-12-31'
WHERE company_name = 'LVL Fitness, CLIMB by LVL Fitness';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Daniel Craft",
      "title": "Owner/CEO",
      "email": "daniel@mancrafted.com",
      "phone": "(661) 555-1601",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Artisan Training", "Business Development", "Customer Service"]'::jsonb,
  notes = 'Custom crafting and manufacturing business. Small team of 4 artisans. Focus on skill development and business growth.',
  contract_value = 8900.00,
  contract_start_date = '2024-03-10',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Mancrafted, Inc';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Elizabeth March",
      "title": "Principal Consultant",
      "email": "elizabeth@marchconsulting.com",
      "phone": "(661) 555-1701", 
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Consulting Skills", "Project Management", "Client Relations Training"]'::jsonb,
  notes = 'Business consulting firm. Team of 3 consultants. Focus on professional development and client relationship management.',
  contract_value = 15700.00,
  contract_start_date = '2024-02-12',
  contract_end_date = '2024-12-31'
WHERE company_name = 'March Consulting';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Dr. William Hansen",
      "title": "Chief Medical Officer",
      "email": "w.hansen@nkstdhd.org",
      "phone": "(661) 555-1801",
      "is_primary": true
    },
    {
      "name": "Laura Sanchez",
      "title": "Training Director",
      "email": "l.sanchez@nkstdhd.org",
      "phone": "(661) 555-1802", 
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Medical Training", "Emergency Response", "HIPAA Compliance", "Healthcare Safety"]'::jsonb,
  notes = 'Hospital district serving North Kern and South Tulare counties. 150+ healthcare professionals. Comprehensive medical training programs.',
  contract_value = 145000.00,
  contract_start_date = '2024-01-01',
  contract_end_date = '2024-12-31'
WHERE company_name = 'North Kern South Tulare Hospital District';