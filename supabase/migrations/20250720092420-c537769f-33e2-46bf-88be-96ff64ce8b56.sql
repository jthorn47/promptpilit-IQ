-- Continue setting up payroll schema - Insert foundational data for TestClient_2025

-- Insert pay groups for the three different schedules
INSERT INTO public.payroll_pay_groups (
  id,
  company_id,
  name,
  description,
  pay_frequency,
  pay_schedule_config,
  is_active
) VALUES 
-- Weekly Pay Group (Fridays)
(
  '22222222-1111-1111-1111-111111111111'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Weekly_Hourly',
  'Weekly pay schedule - Every Friday for hourly employees',
  'weekly',
  '{"day_of_week": 5, "start_date": "2025-01-03"}'::jsonb,
  true
),
-- Bi-Weekly Pay Group (Every other Friday)
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'BiWeekly_Mixed',
  'Bi-weekly pay schedule - Every other Friday for mixed employees',
  'bi_weekly',
  '{"day_of_week": 5, "start_date": "2025-01-03"}'::jsonb,
  true
),
-- Semi-Monthly Pay Group (15th and last day)
(
  '22222222-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'SemiMonthly_Salary',
  'Semi-monthly pay schedule - 15th and last day for salaried employees',
  'semi_monthly',
  '{"pay_dates": [15, -1]}'::jsonb,
  true
);

-- Insert standard pay types for TestClient_2025
INSERT INTO public.payroll_pay_types (
  id,
  company_id,
  code,
  name,
  category,
  is_taxable,
  multiplier
) VALUES 
-- Regular pay types
('44444444-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'REG', 'Regular Hours', 'regular', true, 1.0),
('44444444-1111-1111-1111-111111111112'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'OT', 'Overtime', 'overtime', true, 1.5),
('44444444-1111-1111-1111-111111111113'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'DT', 'Double Time', 'premium', true, 2.0),
('44444444-1111-1111-1111-111111111114'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'HOL', 'Holiday Pay', 'premium', true, 1.5),
('44444444-1111-1111-1111-111111111115'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'SICK', 'Sick Pay', 'time_off', true, 1.0),
('44444444-1111-1111-1111-111111111116'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'VAC', 'Vacation Pay', 'time_off', true, 1.0),
('44444444-1111-1111-1111-111111111117'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'BONUS', 'Bonus Pay', 'bonus', true, 1.0),
('44444444-1111-1111-1111-111111111118'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'SAL', 'Salary', 'regular', true, 1.0);

-- Insert standard deduction types for TestClient_2025
INSERT INTO public.payroll_deduction_types (
  id,
  company_id,
  code,
  name,
  category,
  calculation_method,
  is_pre_tax
) VALUES 
-- Health benefits
('55555555-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'MED', 'Medical Insurance', 'health', 'fixed_amount', true),
('55555555-1111-1111-1111-111111111112'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'DENT', 'Dental Insurance', 'health', 'fixed_amount', true),
('55555555-1111-1111-1111-111111111113'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'VIS', 'Vision Insurance', 'health', 'fixed_amount', true),
-- Retirement
('55555555-1111-1111-1111-111111111114'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '401K', '401(k) Contribution', 'retirement', 'percentage', true),
-- Garnishments and levies
('55555555-1111-1111-1111-111111111115'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'GARN', 'Wage Garnishment', 'garnishment', 'fixed_amount', false),
('55555555-1111-1111-1111-111111111116'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'LEVY', 'Tax Levy', 'levy', 'fixed_amount', false),
-- Voluntary
('55555555-1111-1111-1111-111111111117'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'PARK', 'Parking Fee', 'voluntary', 'fixed_amount', false),
('55555555-1111-1111-1111-111111111118'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'UNION', 'Union Dues', 'voluntary', 'fixed_amount', false);