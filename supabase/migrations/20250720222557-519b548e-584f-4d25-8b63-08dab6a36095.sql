
-- Insert sample benchmark data for Benefits IQ
INSERT INTO public.benefitsiq_market_benchmarks (
  industry, region, company_size_range, benchmark_type, benchmark_data, 
  data_source, effective_date, is_active
) VALUES 
-- Healthcare Industry Benchmarks
('Healthcare', 'Northeast', '1-50', 'medical', '{
  "average_monthly_premium": {"employee": 650, "employee_spouse": 1200, "employee_children": 950, "family": 1800},
  "employer_contribution_pct": 85,
  "average_deductible": 2500,
  "average_oop_max": 7500,
  "plan_richness_score": 78
}', 'Industry Survey 2024', '2024-01-01', true),

('Healthcare', 'Northeast', '51-200', 'medical', '{
  "average_monthly_premium": {"employee": 620, "employee_spouse": 1150, "employee_children": 900, "family": 1700},
  "employer_contribution_pct": 87,
  "average_deductible": 2200,
  "average_oop_max": 7000,
  "plan_richness_score": 82
}', 'Industry Survey 2024', '2024-01-01', true),

('Healthcare', 'West', '1-50', 'medical', '{
  "average_monthly_premium": {"employee": 720, "employee_spouse": 1350, "employee_children": 1050, "family": 2000},
  "employer_contribution_pct": 82,
  "average_deductible": 2800,
  "average_oop_max": 8000,
  "plan_richness_score": 75
}', 'Industry Survey 2024', '2024-01-01', true),

-- Technology Industry Benchmarks
('Technology', 'West', '51-200', 'medical', '{
  "average_monthly_premium": {"employee": 580, "employee_spouse": 1100, "employee_children": 850, "family": 1650},
  "employer_contribution_pct": 92,
  "average_deductible": 1500,
  "average_oop_max": 6000,
  "plan_richness_score": 88
}', 'Industry Survey 2024', '2024-01-01', true),

('Technology', 'West', '201-500', 'medical', '{
  "average_monthly_premium": {"employee": 550, "employee_spouse": 1050, "employee_children": 800, "family": 1550},
  "employer_contribution_pct": 95,
  "average_deductible": 1200,
  "average_oop_max": 5500,
  "plan_richness_score": 92
}', 'Industry Survey 2024', '2024-01-01', true),

-- Manufacturing Industry Benchmarks
('Manufacturing', 'Midwest', '51-200', 'medical', '{
  "average_monthly_premium": {"employee": 590, "employee_spouse": 1120, "employee_children": 870, "family": 1680},
  "employer_contribution_pct": 88,
  "average_deductible": 2000,
  "average_oop_max": 6800,
  "plan_richness_score": 80
}', 'Industry Survey 2024', '2024-01-01', true),

('Manufacturing', 'Southeast', '201-500', 'medical', '{
  "average_monthly_premium": {"employee": 560, "employee_spouse": 1080, "employee_children": 820, "family": 1620},
  "employer_contribution_pct": 90,
  "average_deductible": 1800,
  "average_oop_max": 6500,
  "plan_richness_score": 83
}', 'Industry Survey 2024', '2024-01-01', true),

-- Dental Benchmarks
('Healthcare', 'Northeast', '51-200', 'dental', '{
  "average_monthly_premium": {"employee": 45, "employee_spouse": 85, "employee_children": 65, "family": 125},
  "employer_contribution_pct": 75,
  "annual_maximum": 1500,
  "preventive_coverage": 100,
  "basic_coverage": 80,
  "major_coverage": 50
}', 'Industry Survey 2024', '2024-01-01', true),

('Technology', 'West', '201-500', 'dental', '{
  "average_monthly_premium": {"employee": 42, "employee_spouse": 80, "employee_children": 62, "family": 118},
  "employer_contribution_pct": 85,
  "annual_maximum": 2000,
  "preventive_coverage": 100,
  "basic_coverage": 85,
  "major_coverage": 60
}', 'Industry Survey 2024', '2024-01-01', true),

-- Vision Benchmarks
('Healthcare', 'Northeast', '51-200', 'vision', '{
  "average_monthly_premium": {"employee": 12, "employee_spouse": 22, "employee_children": 18, "family": 35},
  "employer_contribution_pct": 80,
  "exam_copay": 20,
  "frame_allowance": 200,
  "contact_allowance": 150
}', 'Industry Survey 2024', '2024-01-01', true),

('Technology', 'West', '201-500', 'vision', '{
  "average_monthly_premium": {"employee": 10, "employee_spouse": 20, "employee_children": 16, "family": 32},
  "employer_contribution_pct": 90,
  "exam_copay": 15,
  "frame_allowance": 250,
  "contact_allowance": 200
}', 'Industry Survey 2024', '2024-01-01', true),

-- National Averages for comparison
('All Industries', 'National', '51-200', 'medical', '{
  "average_monthly_premium": {"employee": 600, "employee_spouse": 1140, "employee_children": 880, "family": 1680},
  "employer_contribution_pct": 85,
  "average_deductible": 2100,
  "average_oop_max": 7200,
  "plan_richness_score": 80
}', 'National Benefits Survey 2024', '2024-01-01', true),

('All Industries', 'National', '51-200', 'dental', '{
  "average_monthly_premium": {"employee": 44, "employee_spouse": 83, "employee_children": 64, "family": 122},
  "employer_contribution_pct": 78,
  "annual_maximum": 1600,
  "preventive_coverage": 100,
  "basic_coverage": 80,
  "major_coverage": 50
}', 'National Benefits Survey 2024', '2024-01-01', true),

('All Industries', 'National', '51-200', 'vision', '{
  "average_monthly_premium": {"employee": 11, "employee_spouse": 21, "employee_children": 17, "family": 33},
  "employer_contribution_pct": 82,
  "exam_copay": 18,
  "frame_allowance": 210,
  "contact_allowance": 160
}', 'National Benefits Survey 2024', '2024-01-01', true);
