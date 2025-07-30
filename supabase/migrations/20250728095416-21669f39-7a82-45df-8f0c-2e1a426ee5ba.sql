-- Bulk creation of 15 case templates for Pulse CMS
-- Insert case templates
INSERT INTO public.case_templates (id, name, category, estimated_duration_days, description, is_active) VALUES
-- Compliance Templates
('00000000-0000-0000-0000-000000000001', 'Workplace Violence Incident', 'Compliance', 7, 'Comprehensive response protocol for workplace violence incidents including immediate safety measures, investigation, and prevention planning', true),
('00000000-0000-0000-0000-000000000002', 'FMLA/CFRA Violation', 'Compliance', 14, 'Investigation and resolution process for Family and Medical Leave Act or California Family Rights Act violations', true),
('00000000-0000-0000-0000-000000000003', 'Wage & Hour Complaint', 'Compliance', 10, 'Investigation and resolution of wage and hour complaints including overtime, meal breaks, and pay disputes', true),

-- Policy & Documentation  
('00000000-0000-0000-0000-000000000004', 'Policy Violation', 'Policy & Documentation', 5, 'Standard workflow for investigating and addressing employee policy violations', true),
('00000000-0000-0000-0000-000000000005', 'Employee Grievance/Complaint', 'Policy & Documentation', 8, 'Formal process for handling employee grievances and workplace complaints', true),
('00000000-0000-0000-0000-000000000006', 'Return-to-Work Evaluation', 'Policy & Documentation', 12, 'Medical clearance and accommodation assessment for employees returning from leave', true),

-- Safety & Risk
('00000000-0000-0000-0000-000000000007', 'Injury/Workers Comp Claim', 'Safety & Risk', 21, 'Complete workflow for workplace injury reporting, workers compensation claim processing, and return-to-work planning', true),
('00000000-0000-0000-0000-000000000008', 'Near Miss/Unsafe Condition', 'Safety & Risk', 3, 'Investigation and corrective action process for near miss incidents and unsafe working conditions', true),
('00000000-0000-0000-0000-000000000009', 'Drug Test Violation/Reasonable Suspicion', 'Safety & Risk', 7, 'Protocol for reasonable suspicion drug testing and violation response', true),

-- Client & Termination
('00000000-0000-0000-0000-000000000010', 'Client-Specific Policy Review', 'Client & Termination', 5, 'Review and implementation of client-specific policies and procedures', true),
('00000000-0000-0000-0000-000000000011', 'Employee Termination (For Cause/Layoff)', 'Client & Termination', 7, 'Complete termination process including documentation, approvals, final pay, and exit procedures', true),
('00000000-0000-0000-0000-000000000012', 'Workplace Conflict Mediation', 'Client & Termination', 10, 'Structured mediation process for resolving workplace conflicts between employees or departments', true),

-- Enhanced Safety Templates
('00000000-0000-0000-0000-000000000013', 'Safety Incident Investigation', 'Safety & Risk', 14, 'Comprehensive safety incident investigation including root cause analysis and prevention measures', true),
('00000000-0000-0000-0000-000000000014', 'Environmental Compliance Review', 'Compliance', 10, 'Environmental compliance assessment and corrective action planning', true),
('00000000-0000-0000-0000-000000000015', 'Security Breach Response', 'Safety & Risk', 5, 'Immediate response protocol for security breaches including data protection and notification requirements', true);

-- Insert template steps for each template
-- Template 1: Workplace Violence Incident
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000001', 1, 'Immediate Safety Assessment', 'Ensure immediate safety of all personnel and secure the area', 'Safety Officer', 1, '["Incident Location", "Threat Level", "People Involved", "Current Status"]', '{"priority": "critical", "escalation": true}'),
('00000000-0000-0000-0000-000000000001', 2, 'Risk Assessment & Documentation', 'Conduct comprehensive risk assessment and document all details', 'HR Manager', 2, '["Risk Factors", "Witness Statements", "Evidence Collected", "Photos/Video"]', '{"requires_legal": false}'),
('00000000-0000-0000-0000-000000000001', 3, 'Investigation & Interviews', 'Interview involved parties and witnesses to gather complete information', 'HR Specialist', 3, '["Interview Notes", "Timeline", "Contributing Factors", "Policy References"]', '{"confidential": true}'),
('00000000-0000-0000-0000-000000000001', 4, 'Action Plan & Prevention', 'Develop action plan and prevention measures', 'Department Manager', 1, '["Disciplinary Action", "Training Required", "Policy Changes", "Follow-up Schedule"]', '{"approval_required": true}');

-- Template 2: FMLA/CFRA Violation  
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000002', 1, 'Complaint Intake & Documentation', 'Document the FMLA/CFRA violation complaint details', 'HR Specialist', 2, '["Employee Name", "Violation Type", "Dates Involved", "Complaint Details"]', '{"legal_sensitive": true}'),
('00000000-0000-0000-0000-000000000002', 2, 'Medical Documentation Review', 'Review medical documentation and leave entitlements', 'HR Manager', 3, '["Medical Records", "Leave Balance", "Previous Leave History", "Certification Documents"]', '{"confidential": true}'),
('00000000-0000-0000-0000-000000000002', 3, 'Policy Compliance Assessment', 'Assess compliance with FMLA/CFRA regulations and company policy', 'Compliance Officer', 4, '["Policy Analysis", "Regulatory Requirements", "Compliance Gaps", "Risk Assessment"]', '{"requires_legal": true}'),
('00000000-0000-0000-0000-000000000002', 4, 'Corrective Action Planning', 'Develop corrective actions and process improvements', 'HR Manager', 3, '["Corrective Actions", "Process Changes", "Training Needs", "Communication Plan"]', '{"approval_required": true}'),
('00000000-0000-0000-0000-000000000002', 5, 'Follow-up & Monitoring', 'Monitor implementation and follow up with employee', 'HR Specialist', 2, '["Implementation Status", "Employee Feedback", "Additional Needs", "Case Closure"]', '{"follow_up": true}');

-- Template 3: Wage & Hour Complaint
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000003', 1, 'Complaint Documentation', 'Document wage and hour complaint details and scope', 'HR Specialist', 1, '["Employee Name", "Complaint Type", "Time Period", "Amount Claimed"]', '{"financial_impact": true}'),
('00000000-0000-0000-0000-000000000003', 2, 'Time Records Investigation', 'Review time records, timesheets, and payment history', 'Payroll Manager', 3, '["Time Records", "Pay Stubs", "Clock Data", "Schedule Records"]', '{"data_analysis": true}'),
('00000000-0000-0000-0000-000000000003', 3, 'Calculation & Analysis', 'Calculate owed wages and assess compliance', 'Compliance Officer', 4, '["Wage Calculations", "Overtime Analysis", "Break Violations", "Total Amount Owed"]', '{"requires_approval": true}'),
('00000000-0000-0000-0000-000000000003', 4, 'Resolution & Payment', 'Process payment and document resolution', 'HR Manager', 2, '["Payment Authorization", "Resolution Agreement", "Process Improvements", "Case Closure"]', '{"final_approval": true}');

-- Template 4: Policy Violation
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000004', 1, 'Violation Assessment', 'Assess the nature and severity of the policy violation', 'HR Manager', 1, '["Policy Violated", "Severity Level", "Employee Involved", "Circumstances"]', '{"severity_assessment": true}'),
('00000000-0000-0000-0000-000000000004', 2, 'Investigation Process', 'Conduct thorough investigation including witness interviews', 'HR Specialist', 2, '["Investigation Notes", "Witness Statements", "Evidence", "Employee Response"]', '{"confidential": true}'),
('00000000-0000-0000-0000-000000000004', 3, 'Corrective Action Decision', 'Determine appropriate corrective action based on findings', 'Department Manager', 2, '["Disciplinary Action", "Training Required", "Monitoring Plan", "Follow-up Date"]', '{"approval_required": true}');

-- Template 5: Employee Grievance/Complaint
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000005', 1, 'Formal Grievance Intake', 'Document formal grievance and establish case parameters', 'HR Specialist', 1, '["Grievance Type", "Parties Involved", "Desired Resolution", "Supporting Documents"]', '{"formal_process": true}'),
('00000000-0000-0000-0000-000000000005', 2, 'Initial Review & Assessment', 'Review grievance merit and determine investigation scope', 'HR Manager', 2, '["Merit Assessment", "Investigation Scope", "Resources Needed", "Timeline"]', '{"assessment": true}'),
('00000000-0000-0000-0000-000000000005', 3, 'Mediation Session', 'Facilitate mediation between parties to reach resolution', 'HR Manager', 3, '["Mediation Notes", "Agreements Reached", "Outstanding Issues", "Next Steps"]', '{"mediation": true}'),
('00000000-0000-0000-0000-000000000005', 4, 'Resolution & Follow-up', 'Document final resolution and establish follow-up plan', 'HR Specialist', 2, '["Final Resolution", "Implementation Plan", "Follow-up Schedule", "Case Closure"]', '{"resolution": true}');

-- Template 6: Return-to-Work Evaluation  
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000006', 1, 'Medical Clearance Review', 'Review medical clearance and return-to-work authorization', 'HR Specialist', 1, '["Medical Clearance", "Work Restrictions", "Return Date", "Healthcare Provider Info"]', '{"medical_review": true}'),
('00000000-0000-0000-0000-000000000006', 2, 'Job Analysis & Accommodation Assessment', 'Analyze job requirements and assess accommodation needs', 'HR Manager', 3, '["Job Description", "Physical Requirements", "Accommodation Needs", "Workstation Setup"]', '{"accommodation": true}'),
('00000000-0000-0000-0000-000000000006', 3, 'Accommodation Implementation', 'Implement necessary accommodations and modifications', 'Department Manager', 4, '["Accommodations Provided", "Equipment Needed", "Schedule Modifications", "Training Required"]', '{"implementation": true}'),
('00000000-0000-0000-0000-000000000006', 4, 'Trial Period Monitoring', 'Monitor employee performance and accommodation effectiveness', 'HR Specialist', 3, '["Performance Monitoring", "Accommodation Effectiveness", "Employee Feedback", "Adjustments Needed"]', '{"monitoring": true}'),
('00000000-0000-0000-0000-000000000006', 5, 'Final Approval & Documentation', 'Finalize return-to-work plan and document outcomes', 'HR Manager', 1, '["Final Approval", "Documentation Complete", "Success Metrics", "Case Closure"]', '{"final_approval": true}');

-- Template 7: Injury/Workers Comp Claim
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000007', 1, 'Incident Report & Immediate Care', 'Document incident and ensure immediate medical attention', 'Safety Officer', 1, '["Incident Details", "Injury Type", "Medical Attention", "Witnesses"]', '{"immediate_action": true}'),
('00000000-0000-0000-0000-000000000007', 2, 'Workers Comp Claim Filing', 'File workers compensation claim with insurance carrier', 'HR Specialist', 2, '["Claim Number", "Insurance Carrier", "Medical Provider", "Estimated Costs"]', '{"insurance_claim": true}'),
('00000000-0000-0000-0000-000000000007', 3, 'Incident Investigation', 'Conduct thorough investigation to determine cause and prevention', 'Safety Officer', 5, '["Root Cause Analysis", "Safety Violations", "Prevention Measures", "Training Needs"]', '{"investigation": true}'),
('00000000-0000-0000-0000-000000000007', 4, 'Medical Management', 'Coordinate medical treatment and monitor recovery progress', 'HR Manager', 7, '["Treatment Plan", "Medical Updates", "Work Restrictions", "Recovery Timeline"]', '{"medical_coordination": true}'),
('00000000-0000-0000-0000-000000000007', 5, 'Settlement & Closure', 'Finalize claim settlement and case documentation', 'HR Manager', 5, '["Settlement Amount", "Final Medical Reports", "Return to Work Date", "Case Closure"]', '{"settlement": true}'),
('00000000-0000-0000-0000-000000000007', 6, 'Return-to-Work Planning', 'Develop and implement return-to-work plan', 'HR Specialist', 1, '["Return Plan", "Accommodations", "Gradual Return Schedule", "Follow-up Monitoring"]', '{"return_to_work": true}');

-- Template 8: Near Miss/Unsafe Condition
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000008', 1, 'Hazard Identification & Documentation', 'Document the near miss or unsafe condition in detail', 'Safety Officer', 1, '["Hazard Type", "Location", "Potential Consequences", "Photos/Evidence"]', '{"safety_critical": true}'),
('00000000-0000-0000-0000-000000000008', 2, 'Immediate Corrective Measures', 'Implement immediate measures to eliminate or control hazard', 'Department Manager', 1, '["Immediate Actions", "Temporary Controls", "Area Restriction", "Personnel Notified"]', '{"immediate_action": true}'),
('00000000-0000-0000-0000-000000000008', 3, 'Verification & Training', 'Verify corrective measures and provide safety training', 'Safety Officer', 1, '["Verification Complete", "Training Provided", "Updated Procedures", "Case Closure"]', '{"verification": true}');

-- Template 9: Drug Test Violation/Reasonable Suspicion
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000009', 1, 'Reasonable Suspicion Documentation', 'Document observations and reasonable suspicion indicators', 'Department Manager', 1, '["Observations", "Behavior Indicators", "Witnesses", "Time/Date"]', '{"drug_test": true}'),
('00000000-0000-0000-0000-000000000009', 2, 'Testing Process', 'Coordinate drug testing according to company policy', 'HR Manager', 1, '["Test Type", "Testing Facility", "Chain of Custody", "Employee Consent"]', '{"testing": true}'),
('00000000-0000-0000-0000-000000000009', 3, 'Results Review & Assessment', 'Review test results and assess policy implications', 'HR Manager', 2, '["Test Results", "Policy Violation", "Mitigating Factors", "Recommended Action"]', '{"results_review": true}'),
('00000000-0000-0000-0000-000000000009', 4, 'Disciplinary Action & Support', 'Implement disciplinary action and offer employee support resources', 'HR Manager', 3, '["Disciplinary Action", "EAP Referral", "Treatment Options", "Follow-up Plan"]', '{"disciplinary": true}');

-- Template 10: Client-Specific Policy Review
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000010', 1, 'Policy Analysis & Gap Assessment', 'Analyze client-specific policies and identify gaps', 'Compliance Officer', 2, '["Current Policies", "Client Requirements", "Gap Analysis", "Risk Assessment"]', '{"policy_review": true}'),
('00000000-0000-0000-0000-000000000010', 2, 'Client Consultation & Alignment', 'Consult with client to align policy requirements and expectations', 'HR Manager', 2, '["Client Meeting Notes", "Requirements Clarification", "Timeline Agreement", "Resource Needs"]', '{"client_consultation": true}'),
('00000000-0000-0000-0000-000000000010', 3, 'Implementation & Training', 'Implement policy changes and provide necessary training', 'HR Specialist', 1, '["Policy Updates", "Training Materials", "Staff Notification", "Implementation Date"]', '{"implementation": true}');

-- Template 11: Employee Termination (For Cause/Layoff)
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000011', 1, 'Documentation Review & Legal Clearance', 'Review all documentation and obtain legal clearance for termination', 'HR Manager', 2, '["Performance Records", "Disciplinary History", "Legal Review", "Termination Reason"]', '{"legal_review": true}'),
('00000000-0000-0000-0000-000000000011', 2, 'Approval Process', 'Obtain necessary approvals from management and legal', 'Department Manager', 1, '["Management Approval", "Legal Approval", "Final Decision", "Effective Date"]', '{"approval_required": true}'),
('00000000-0000-0000-0000-000000000011', 3, 'Termination Meeting', 'Conduct termination meeting with employee', 'HR Manager', 1, '["Meeting Notes", "Employee Response", "Questions Addressed", "Next Steps Explained"]', '{"termination_meeting": true}'),
('00000000-0000-0000-0000-000000000011', 4, 'Final Pay & Benefits', 'Process final pay and coordinate benefits termination', 'Payroll Manager', 2, '["Final Pay Calculation", "Benefits Termination", "COBRA Information", "Unemployment Information"]', '{"final_pay": true}'),
('00000000-0000-0000-0000-000000000011', 5, 'Exit Procedures & Documentation', 'Complete exit procedures and finalize documentation', 'HR Specialist', 1, '["Property Return", "Access Termination", "Exit Interview", "File Documentation"]', '{"exit_procedures": true}');

-- Template 12: Workplace Conflict Mediation
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000012', 1, 'Conflict Assessment & Preparation', 'Assess conflict situation and prepare for mediation process', 'HR Manager', 2, '["Conflict Description", "Parties Involved", "Root Causes", "Mediation Readiness"]', '{"conflict_assessment": true}'),
('00000000-0000-0000-0000-000000000012', 2, 'Mediation Session Planning', 'Plan and schedule formal mediation session', 'HR Manager', 2, '["Session Date", "Ground Rules", "Mediator Selection", "Pre-session Preparation"]', '{"session_planning": true}'),
('00000000-0000-0000-0000-000000000012', 3, 'Formal Mediation Session', 'Conduct structured mediation session between parties', 'HR Manager', 3, '["Session Notes", "Agreements Reached", "Action Items", "Follow-up Required"]', '{"formal_mediation": true}'),
('00000000-0000-0000-0000-000000000012', 4, 'Agreement Documentation & Follow-up', 'Document agreements and establish follow-up monitoring', 'HR Specialist', 3, '["Written Agreement", "Implementation Timeline", "Success Metrics", "Follow-up Schedule"]', '{"agreement_documentation": true}');

-- Template 13: Safety Incident Investigation
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000013', 1, 'Incident Scene Documentation', 'Document incident scene and gather initial evidence', 'Safety Officer', 1, '["Scene Photos", "Equipment Involved", "Environmental Conditions", "Initial Witness Statements"]', '{"scene_documentation": true}'),
('00000000-0000-0000-0000-000000000013', 2, 'Comprehensive Investigation', 'Conduct detailed investigation including all stakeholders', 'Safety Officer', 5, '["Interview Transcripts", "Equipment Analysis", "Procedure Review", "Timeline Reconstruction"]', '{"comprehensive_investigation": true}'),
('00000000-0000-0000-0000-000000000013', 3, 'Root Cause Analysis', 'Perform root cause analysis using systematic methodology', 'Safety Officer', 4, '["Root Causes Identified", "Contributing Factors", "Analysis Method Used", "Findings Summary"]', '{"root_cause_analysis": true}'),
('00000000-0000-0000-0000-000000000013', 4, 'Prevention Plan Development', 'Develop comprehensive prevention and improvement plan', 'Safety Officer', 3, '["Prevention Measures", "Policy Updates", "Training Requirements", "Equipment Changes"]', '{"prevention_planning": true}'),
('00000000-0000-0000-0000-000000000013', 5, 'Implementation & Monitoring', 'Implement prevention measures and monitor effectiveness', 'Department Manager', 1, '["Implementation Status", "Effectiveness Monitoring", "Lesson Learned", "Case Closure"]', '{"implementation_monitoring": true}');

-- Template 14: Environmental Compliance Review
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000014', 1, 'Compliance Assessment', 'Assess current environmental compliance status', 'Compliance Officer', 3, '["Regulatory Requirements", "Current Status", "Non-compliance Areas", "Risk Level"]', '{"compliance_assessment": true}'),
('00000000-0000-0000-0000-000000000014', 2, 'Gap Analysis & Planning', 'Analyze gaps and develop compliance improvement plan', 'Compliance Officer', 4, '["Gap Analysis", "Improvement Plan", "Resource Requirements", "Timeline"]', '{"gap_analysis": true}'),
('00000000-0000-0000-0000-000000000014', 3, 'Implementation & Training', 'Implement compliance measures and provide training', 'Department Manager', 2, '["Measures Implemented", "Training Completed", "Documentation Updated", "Monitoring Plan"]', '{"implementation": true}'),
('00000000-0000-0000-0000-000000000014', 4, 'Verification & Reporting', 'Verify compliance and prepare required reports', 'Compliance Officer', 1, '["Compliance Verification", "Reports Filed", "Ongoing Monitoring", "Case Closure"]', '{"verification_reporting": true}');

-- Template 15: Security Breach Response
INSERT INTO public.case_template_steps (case_template_id, step_order, title, description, assigned_to_role, due_days, required_fields, metadata) VALUES
('00000000-0000-0000-0000-000000000015', 1, 'Immediate Response & Containment', 'Immediate containment of security breach and damage assessment', 'IT Manager', 1, '["Breach Type", "Systems Affected", "Containment Actions", "Initial Impact Assessment"]', '{"immediate_response": true}'),
('00000000-0000-0000-0000-000000000015', 2, 'Investigation & Analysis', 'Detailed investigation of breach cause and extent', 'IT Manager', 2, '["Breach Origin", "Data Compromised", "Attack Vector", "Timeline Analysis"]', '{"investigation": true}'),
('00000000-0000-0000-0000-000000000015', 3, 'Notification & Reporting', 'Notify affected parties and file required reports', 'Compliance Officer', 1, '["Notifications Sent", "Regulatory Reports", "Customer Communications", "Legal Requirements Met"]', '{"notification": true}'),
('00000000-0000-0000-0000-000000000015', 4, 'Recovery & Prevention', 'System recovery and implementation of prevention measures', 'IT Manager', 1, '["Systems Restored", "Security Enhancements", "Policy Updates", "Monitoring Improvements"]', '{"recovery_prevention": true}');

-- Update existing templates to have proper categories if they don't already
UPDATE public.case_templates 
SET category = 'Compliance'
WHERE name IN ('Harassment Investigation', 'ADA Accommodation Request', 'Disciplinary Action')
AND category IS NULL;

UPDATE public.case_templates 
SET category = 'Safety & Risk'
WHERE name = 'Workplace Investigation'
AND category IS NULL;