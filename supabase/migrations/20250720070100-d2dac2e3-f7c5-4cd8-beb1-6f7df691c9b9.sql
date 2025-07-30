
-- Add effective_date and end_date to global_job_titles
ALTER TABLE public.global_job_titles 
ADD COLUMN effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date DATE;

-- Add check constraint to ensure end_date is after effective_date
ALTER TABLE public.global_job_titles 
ADD CONSTRAINT check_end_date_after_effective CHECK (end_date IS NULL OR end_date > effective_date);

-- Create comprehensive job description templates table
CREATE TABLE public.job_description_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL, -- entry, mid, senior, executive
  industry TEXT, -- technology, healthcare, finance, etc.
  job_family TEXT, -- engineering, sales, marketing, etc.
  summary TEXT NOT NULL,
  key_responsibilities JSONB NOT NULL DEFAULT '[]',
  required_qualifications JSONB NOT NULL DEFAULT '[]',
  preferred_qualifications JSONB NOT NULL DEFAULT '[]',
  skills_required JSONB NOT NULL DEFAULT '[]',
  skills_preferred JSONB NOT NULL DEFAULT '[]',
  education_level TEXT, -- high_school, associates, bachelors, masters, phd
  experience_years_min INTEGER DEFAULT 0,
  experience_years_max INTEGER,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'USD',
  employment_type TEXT DEFAULT 'full_time', -- full_time, part_time, contract, temporary
  work_arrangement TEXT DEFAULT 'on_site', -- remote, hybrid, on_site
  travel_percentage INTEGER DEFAULT 0,
  supervisory_role BOOLEAN DEFAULT false,
  team_size_min INTEGER,
  team_size_max INTEGER,
  physical_requirements TEXT,
  work_environment TEXT,
  benefits_highlights JSONB DEFAULT '[]',
  career_progression TEXT,
  performance_metrics JSONB DEFAULT '[]',
  certifications_required JSONB DEFAULT '[]',
  certifications_preferred JSONB DEFAULT '[]',
  flsa_classification flsa_classification DEFAULT 'non_exempt',
  is_template BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  template_source TEXT DEFAULT 'system', -- system, user_created, imported
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_description_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_description_templates
CREATE POLICY "Super admins can manage job description templates"
ON public.job_description_templates
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "All authenticated users can view active templates"
ON public.job_description_templates
FOR SELECT
USING (is_active = true AND is_template = true);

-- Add updated_at trigger
CREATE TRIGGER update_job_description_templates_updated_at
  BEFORE UPDATE ON public.job_description_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_job_description_templates_department ON public.job_description_templates(department);
CREATE INDEX idx_job_description_templates_level ON public.job_description_templates(level);
CREATE INDEX idx_job_description_templates_industry ON public.job_description_templates(industry);
CREATE INDEX idx_job_description_templates_job_family ON public.job_description_templates(job_family);

-- Insert comprehensive job description templates
INSERT INTO public.job_description_templates (
  title, department, level, industry, job_family, summary, 
  key_responsibilities, required_qualifications, preferred_qualifications,
  skills_required, skills_preferred, education_level, experience_years_min, experience_years_max,
  flsa_classification, supervisory_role
) VALUES 

-- Technology Roles
('Software Engineer', 'Engineering', 'mid', 'technology', 'engineering',
 'Design, develop, and maintain software applications using modern programming languages and frameworks.',
 '["Write clean, maintainable code", "Participate in code reviews", "Debug and troubleshoot issues", "Collaborate with cross-functional teams", "Contribute to technical documentation"]',
 '["Bachelor''s degree in Computer Science or related field", "2+ years software development experience", "Proficiency in at least one programming language"]',
 '["Experience with cloud platforms", "Knowledge of DevOps practices", "Open source contributions"]',
 '["Programming languages (Java, Python, JavaScript)", "Version control (Git)", "Database design", "Problem solving"]',
 '["Docker/Kubernetes", "CI/CD pipelines", "Agile methodologies"]',
 'bachelors', 2, 5, 'exempt', false),

('Senior Software Engineer', 'Engineering', 'senior', 'technology', 'engineering',
 'Lead technical initiatives, mentor junior developers, and architect scalable software solutions.',
 '["Lead technical design and architecture", "Mentor junior team members", "Drive best practices adoption", "Collaborate with product managers", "Participate in technical interviews"]',
 '["Bachelor''s degree in Computer Science", "5+ years software development experience", "Experience with system design", "Leadership experience preferred"]',
 '["Master''s degree", "Experience with microservices", "Cloud architecture experience"]',
 '["Advanced programming skills", "System design", "Leadership", "Architecture patterns"]',
 '["Kubernetes", "Event-driven architecture", "Performance optimization"]',
 'bachelors', 5, 10, 'exempt', true),

('Product Manager', 'Product', 'mid', 'technology', 'product',
 'Drive product strategy, roadmap development, and cross-functional execution of product initiatives.',
 '["Define product vision and strategy", "Manage product roadmap", "Gather and analyze user feedback", "Coordinate with engineering and design", "Monitor product metrics"]',
 '["Bachelor''s degree in Business, Engineering, or related field", "3+ years product management experience", "Strong analytical skills"]',
 '["MBA or technical background", "Experience with B2B products", "Agile/Scrum certification"]',
 '["Product strategy", "Data analysis", "User research", "Project management"]',
 '["SQL", "A/B testing", "Wireframing tools", "Analytics platforms"]',
 'bachelors', 3, 7, 'exempt', false),

-- Sales & Marketing
('Account Executive', 'Sales', 'mid', 'technology', 'sales',
 'Drive new business acquisition and manage existing client relationships to achieve revenue targets.',
 '["Prospect and qualify new leads", "Conduct product demonstrations", "Negotiate contracts", "Maintain CRM records", "Achieve monthly/quarterly quotas"]',
 '["Bachelor''s degree preferred", "2+ years B2B sales experience", "Excellent communication skills", "CRM experience"]',
 '["Experience in SaaS sales", "Industry-specific knowledge", "Sales methodology training"]',
 '["Consultative selling", "Relationship building", "Negotiation", "Presentation skills"]',
 '["Salesforce", "LinkedIn Sales Navigator", "Email marketing tools"]',
 'bachelors', 2, 5, 'exempt', false),

('Marketing Manager', 'Marketing', 'mid', 'technology', 'marketing',
 'Develop and execute marketing campaigns to drive brand awareness, lead generation, and customer engagement.',
 '["Develop marketing strategies", "Manage campaign execution", "Analyze marketing metrics", "Coordinate with sales team", "Manage marketing budget"]',
 '["Bachelor''s degree in Marketing or related field", "3+ years marketing experience", "Digital marketing expertise"]',
 '["MBA", "Experience with marketing automation", "Content marketing experience"]',
 '["Digital marketing", "Content creation", "Analytics", "Project management"]',
 '["Google Analytics", "HubSpot", "Adobe Creative Suite", "Social media platforms"]',
 'bachelors', 3, 6, 'exempt', false),

-- Operations & Finance
('Operations Manager', 'Operations', 'mid', 'general', 'operations',
 'Oversee daily operations, optimize processes, and ensure efficient workflow across departments.',
 '["Manage daily operations", "Optimize business processes", "Coordinate between departments", "Monitor KPIs", "Implement operational improvements"]',
 '["Bachelor''s degree in Business or Operations", "3+ years operations experience", "Process improvement experience"]',
 '["Six Sigma certification", "Project management certification", "Industry experience"]',
 '["Process optimization", "Project management", "Data analysis", "Leadership"]',
 '["ERP systems", "Process mapping tools", "Excel/Google Sheets"]',
 'bachelors', 3, 7, 'exempt', true),

('Financial Analyst', 'Finance', 'entry', 'finance', 'finance',
 'Analyze financial data, prepare reports, and support budgeting and forecasting activities.',
 '["Prepare financial reports", "Analyze financial data", "Support budgeting process", "Monitor financial performance", "Assist with audits"]',
 '["Bachelor''s degree in Finance, Accounting, or Economics", "Strong analytical skills", "Excel proficiency"]',
 '["CPA or CFA certification", "Experience with financial modeling", "Advanced degree"]',
 '["Financial analysis", "Excel modeling", "Attention to detail", "Communication"]',
 '["Financial software", "SQL", "PowerBI/Tableau"]',
 'bachelors', 0, 3, 'exempt', false),

-- Human Resources
('HR Generalist', 'Human Resources', 'mid', 'general', 'human_resources',
 'Support all aspects of HR including recruitment, employee relations, compliance, and HR programs.',
 '["Manage recruitment process", "Handle employee relations", "Ensure compliance", "Administer benefits", "Support performance management"]',
 '["Bachelor''s degree in HR or related field", "2+ years HR experience", "Knowledge of employment law"]',
 '["PHR/SHRM certification", "HRIS experience", "Compensation analysis experience"]',
 '["Employee relations", "Recruitment", "Compliance", "Communication"]',
 '["HRIS systems", "ATS platforms", "Microsoft Office"]',
 'bachelors', 2, 5, 'exempt', false),

-- Customer Service
('Customer Success Manager', 'Customer Success', 'mid', 'technology', 'customer_success',
 'Ensure customer satisfaction, drive product adoption, and identify expansion opportunities.',
 '["Manage customer relationships", "Drive product adoption", "Identify upsell opportunities", "Handle escalations", "Provide customer training"]',
 '["Bachelor''s degree preferred", "2+ years customer-facing experience", "Strong communication skills"]',
 '["SaaS experience", "Account management experience", "Technical background"]',
 '["Relationship management", "Problem solving", "Technical aptitude", "Communication"]',
 '["CRM systems", "Customer success platforms", "Data analysis tools"]',
 'bachelors', 2, 5, 'exempt', false),

-- Administrative
('Executive Assistant', 'Administration', 'mid', 'general', 'administrative',
 'Provide high-level administrative support to executives and manage office operations.',
 '["Manage executive calendars", "Coordinate meetings and travel", "Prepare documents and presentations", "Handle confidential information", "Manage office operations"]',
 '["High school diploma required, Bachelor''s preferred", "3+ years executive support experience", "Excellent organizational skills"]',
 '["Experience supporting C-level executives", "Project management experience"]',
 '["Organization", "Communication", "Discretion", "Time management"]',
 '["Microsoft Office Suite", "Calendar management tools", "Travel booking platforms"]',
 'associates', 3, 7, 'non_exempt', false);
