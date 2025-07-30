-- Add AI reports to assessments that don't have them yet (using simpler format)
UPDATE public.assessments 
SET ai_report = jsonb_build_object(
  'report', 'Executive Summary: Sunrise Retail Corp demonstrates strong HR compliance with a risk score of 82/100, placing them in the Low Risk category. Priority Recommendations: Enhanced timekeeping documentation, management training expansion, and seasonal worker onboarding standardization. Industry Considerations: Focus on seasonal workforce compliance, customer-facing training, and scheduling flexibility while maintaining compliance.'
)
WHERE company_name = 'Sunrise Retail Corp';

UPDATE public.assessments 
SET ai_report = jsonb_build_object(
  'report', 'Executive Summary: Financial Advisory Partners shows moderate HR risk with a score of 58/100, requiring strategic improvements in compliance documentation and training. Critical Priority: Financial services compliance audit, enhanced documentation systems, and professional training programs. Industry Considerations: FINRA/SEC regulatory compliance, client privacy protection, and continuing education requirements for licensed professionals.'
)
WHERE company_name = 'Financial Advisory Partners';

UPDATE public.assessments 
SET ai_report = jsonb_build_object(
  'report', 'Executive Summary: Community Care Non-Profit presents high HR risk with a score of 45/100, requiring immediate attention to compliance gaps. Critical Priority: Emergency compliance audit, wage & hour review, safety protocol implementation, and workers compensation audit. Non-Profit Considerations: Volunteer classification requirements, grant compliance obligations, and community service liability protection.'
)
WHERE company_name = 'Community Care Non-Profit';