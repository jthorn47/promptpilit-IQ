-- Create a default WPV plan content for all companies
-- Since this is a special case and should be published by design

-- First, ensure all company_settings records have a default WPV plan
UPDATE public.company_settings 
SET wpv_plan_content = 'WORKPLACE VIOLENCE PREVENTION PLAN

This plan is designed to meet California SB 553 requirements for workplace violence prevention.

1. POLICY STATEMENT
Our organization is committed to providing a safe workplace free from violence and threats of violence.

2. WORKPLACE VIOLENCE PREVENTION TEAM
- Team Leader: [To be assigned]
- HR Representative: [To be assigned] 
- Safety Representative: [To be assigned]
- Employee Representative: [To be assigned]

3. HAZARD IDENTIFICATION AND ASSESSMENT
We will conduct regular assessments to identify workplace violence hazards including:
- Physical layout and security measures
- Lighting and visibility issues
- Customer/client interaction areas
- Cash handling procedures
- Working alone situations

4. PREVENTION STRATEGIES
- Employee training on violence prevention
- Security measures and protocols
- Emergency response procedures
- Reporting mechanisms for threats and incidents

5. EMPLOYEE INVOLVEMENT
Employees are encouraged to participate in violence prevention efforts through:
- Regular safety meetings
- Hazard reporting
- Training participation
- Plan review and feedback

6. TRAINING PROGRAM
All employees will receive training on:
- Recognizing violence warning signs
- De-escalation techniques
- Emergency response procedures
- Reporting requirements

7. INCIDENT REPORTING AND INVESTIGATION
All violence-related incidents must be reported immediately and will be thoroughly investigated.

8. PLAN REVIEW AND UPDATES
This plan will be reviewed annually and updated as needed.

Effective Date: [Current Date]
Plan Review Date: [Annual Review Date]'
WHERE wpv_plan_content IS NULL;

-- For companies that already have content, don't overwrite it
-- This ensures existing customizations are preserved