-- Add demo data to final set of clients
UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Tony Palms",
      "title": "Store Manager",
      "email": "tony@palmsliquor.com",
      "phone": "(661) 555-1901",
      "is_primary": true
    },
    {
      "name": "Sofia Ramirez",
      "title": "Assistant Manager",
      "email": "sofia@palmsliquor.com",
      "phone": "(661) 555-1902",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Responsible Service Training", "Age Verification", "Customer Service"]'::jsonb,
  notes = 'Liquor store in Bakersfield. Team of 5 employees. Focus on responsible alcohol service and age verification training.',
  contract_value = 9800.00,
  contract_start_date = '2024-02-28',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Palms Liquor Store';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Michael Relief",
      "title": "Director of Operations",
      "email": "michael@reliefone.com",
      "phone": "(661) 555-2001",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Business Solutions Training", "Customer Relations", "Technology Training"]'::jsonb,
  notes = 'Business solutions and consulting firm. Team of 12 professionals. Focus on technology adoption and customer relations.',
  contract_value = 28900.00,
  contract_start_date = '2024-01-15',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Relief One Solutions';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Dr. Amanda Reveal",
      "title": "Medical Director",
      "email": "a.reveal@revealmedical.com",
      "phone": "(661) 555-2101",
      "is_primary": true
    },
    {
      "name": "Christina Lopez",
      "title": "Practice Manager",
      "email": "c.lopez@revealmedical.com",
      "phone": "(661) 555-2102",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Medical Aesthetics Training", "Patient Safety", "HIPAA Compliance"]'::jsonb,
  notes = 'Medical aesthetics practice. Team of 8 medical professionals. Specialized training for cosmetic procedures and patient safety.',
  contract_value = 42500.00,
  contract_start_date = '2024-03-05',
  contract_end_date = '2025-03-04'
WHERE company_name = 'Reveal Medical Aesthetics, Inc';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Carlos Joaquin",
      "title": "Branch Manager",
      "email": "carlos@sjvmortgage.com",
      "phone": "(661) 555-2201",
      "is_primary": true
    },
    {
      "name": "Jennifer Valley",
      "title": "Loan Officer",
      "email": "jennifer@sjvmortgage.com",
      "phone": "(661) 555-2202",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Financial Services Training", "Customer Service", "Compliance Training"]'::jsonb,
  notes = 'Mortgage lending company serving San Joaquin Valley. Team of 14 loan officers and staff. Focus on financial regulations and customer service.',
  contract_value = 35600.00,
  contract_start_date = '2024-02-01',
  contract_end_date = '2025-01-31'
WHERE company_name = 'San Joaquin Valley Mortgage';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "James Watson",
      "title": "Principal Broker",
      "email": "james@watsonrealty.com",
      "phone": "(661) 555-2301",
      "is_primary": true
    },
    {
      "name": "Rebecca Foster",
      "title": "Office Manager",
      "email": "rebecca@watsonrealty.com",
      "phone": "(661) 555-2302",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Real Estate Training", "Customer Service", "Ethics Training"]'::jsonb,
  notes = 'Full-service real estate brokerage. Team of 20 agents and support staff. Focus on professional development and ethics.',
  contract_value = 31800.00,
  contract_start_date = '2024-01-08',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Watson Realty Services, Inc';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "William License",
      "title": "Licensing Director",
      "email": "william@wliplicense.com",
      "phone": "(661) 555-2401",
      "is_primary": true
    }
  ]'::jsonb,
  services_purchased = '["Professional Licensing", "Compliance Training", "Regulatory Updates"]'::jsonb,
  notes = 'Professional licensing and compliance consulting. Small team of 3 specialists. Focus on professional licensing requirements.',
  contract_value = 12400.00,
  contract_start_date = '2024-02-15',
  contract_end_date = '2024-12-31'
WHERE company_name = 'WLIP Licensing, LLC';

UPDATE public.clients SET 
  key_contacts = '[
    {
      "name": "Colonel (Ret.) Mark Heroes",
      "title": "Executive Director",
      "email": "mark@woundedheroes.org",
      "phone": "(661) 555-2501",
      "is_primary": true
    },
    {
      "name": "Sarah Veteran",
      "title": "Program Coordinator",
      "email": "sarah@woundedheroes.org",
      "phone": "(661) 555-2502",
      "is_primary": false
    }
  ]'::jsonb,
  services_purchased = '["Nonprofit Management", "Fundraising Training", "Volunteer Coordination"]'::jsonb,
  notes = 'Nonprofit organization supporting wounded veterans in Kern County. Team of 8 staff and volunteers. Focus on nonprofit management and fundraising.',
  contract_value = 18600.00,
  contract_start_date = '2024-01-01',
  contract_end_date = '2024-12-31'
WHERE company_name = 'Wounded Heroes Fund Kern County';