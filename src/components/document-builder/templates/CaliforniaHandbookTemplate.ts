import type { DocumentTemplate, SectionTemplate, EditorContent } from '@/types/document-builder';

// California Employee Handbook Template Structure
export const californiaHandbookSections: SectionTemplate[] = [
  {
    title: "Introduction",
    category: "introduction",
    is_required: true,
    content: [
      {
        id: "intro-welcome",
        type: "heading",
        content: { text: "Welcome", level: 2 },
        order: 0
      },
      {
        id: "intro-welcome-text",
        type: "text",
        content: {
          text: `Welcome to [COMPANY_NAME] ("the Company"). The Company has teamed up with Easeworks, LLC ("PEO"), a full service Professional Employer Organization (PEO) that provides human resources outsourcing services. PEO's expertise in payroll, benefits, and labor and employment compliance allows companies like the Company to focus on core business objectives, such as providing products and/or services, customer service, sales, and marketing.

PEO assists the Company with certain specific human resources and administrative functions, which may include payroll, benefits, unemployment insurance, workers' compensation insurance, disability insurance and certain other personnel related issues. PEO does not, however, oversee the day-to-day operations of the Company or its employees. The managers and supervisors of the Company will continue to supervise your day-to-day activities as well as handle the operations of the business.

Communication is critical to the success of any winning team. This handbook outlines the benefits, practices and policies that are important to you. You should use this handbook as a guide and ready reference. If you have questions as you read through this handbook, please do not hesitate to discuss them with the Company's HR Contact ("HR Contact") below, or your supervisor.

Our HR Contact: [HR_CONTACT_NAME, HR_CONTACT_PHONE, HR_CONTACT_EMAIL]
PEO Contact: [PEO_CONTACT_PHONE, PEO_CONTACT_EMAIL]`
        },
        order: 1
      },
      {
        id: "intro-purpose",
        type: "heading",
        content: { text: "Purpose of this Employee Handbook", level: 2 },
        order: 2
      },
      {
        id: "intro-purpose-text",
        type: "text",
        content: {
          text: `This Handbook is designed to acquaint you with the Company and to give you a ready reference to answer most of your questions regarding your employment. In addition, in accordance with the specific policies of the Company and the laws of the particular state where you are employed, there may also be an Addendum, located at the back of this Handbook, which serves as a supplement to this Handbook.

The content of this Handbook constitutes only a summary of the employee benefits, practices and policies in effect at the time of publication. The Company may from time to time change, modify, or delete policies as it deems appropriate. As such, this handbook should not be construed as creating any kind of contract for ongoing employment or specific terms of employment. Employment at the Company is at-will and may be terminated by either the Company or the employee, with or without cause or prior notice.`
        },
        order: 3
      }
    ]
  },
  {
    title: "Equal Employment Opportunity",
    category: "employment_policies",
    is_required: true,
    content: [
      {
        id: "eeo-policy",
        type: "heading",
        content: { text: "Equal Employment Opportunity and Reasonable Accommodations", level: 2 },
        order: 0
      },
      {
        id: "eeo-policy-text",
        type: "text",
        content: {
          text: `The Company is committed to providing equal employment opportunities to all employees and applicants without regard to race (including traits historically associated with race, such as hair texture and protective hairstyles, including braids, locks, and twists), religious creed (including religious dress and grooming practices), ancestry, ethnicity, gender identity and expression, marital status, protected medical condition, reproductive health decision-making, medical leave or other types of protected leave (including requesting or taking approved leave under the FMLA or CFRA), domestic violence victim status, political affiliation, or any other protected status in accordance with all applicable federal, state and local laws.

The Company is also committed to complying with the laws protecting qualified individuals with disabilities, as well as employees' religious beliefs and practices. The Company will provide a reasonable accommodation for any known physical or mental disability of a qualified individual with a disability and/or employees' religious beliefs and practices to the extent required by law, provided the requested accommodation does not create an undue hardship for the Company and/or does not pose a direct threat to the health or safety of others in the workplace and/or to the individual.`
        },
        order: 1
      }
    ]
  },
  {
    title: "Anti-Harassment Policy",
    category: "employment_policies",
    is_required: true,
    content: [
      {
        id: "harassment-policy",
        type: "heading",
        content: { text: "Policy Against Unlawful Harassment, Discrimination, and Retaliation", level: 2 },
        order: 0
      },
      {
        id: "harassment-policy-text",
        type: "text",
        content: {
          text: `The Company is committed to providing a work environment that is free of unlawful harassment, discrimination and retaliation. In furtherance of this commitment, the Company strictly prohibits all forms of unlawful discrimination and harassment, including: discrimination or harassment on the basis of race (including traits historically associated with race, such as hair texture and protective hairstyles, including braids, locks, and twists), religious creed (including religious dress and grooming practices), ancestry, ethnicity, gender identity and expression, marital status, protected medical condition, reproductive health decision-making, medical leave or other types of protected leave (including requesting or taking approved leave under the FMLA or CFRA), domestic violence victim status, political affiliation, or any other category protected by applicable state or federal law.

Examples of Prohibited Sexual Harassment: Sexual harassment includes a broad spectrum of conduct including harassment based on sex, gender, gender identity or expression, or sexual orientation. Examples include:
- unwanted sexual advances
- offering an employment benefit in exchange for sexual favors, or threatening an adverse action for failure to engage in sexual activity
- visual conduct, such as leering, making sexual gestures, and displaying or posting sexually suggestive objects or images
- verbal sexual advances, propositions, requests or comments
- physical conduct, such as touching, groping, assault, or blocking movement`
        },
        order: 1
      }
    ]
  },
  {
    title: "At-Will Employment",
    category: "employment_policies",
    is_required: true,
    content: [
      {
        id: "at-will-policy",
        type: "heading",
        content: { text: "At-Will Employment", level: 2 },
        order: 0
      },
      {
        id: "at-will-text",
        type: "text",
        content: {
          text: `Your employment, position and compensation with the Company are at will and may be changed or terminated at the will of the Company. Both you and the Company have the right to terminate the employment relationship at any time, with or without cause or advance notice. Exceptions to this policy must be memorialized in a fully executed written agreement, signed by you and an authorized Company representative. Similarly, your relationship with PEO is "at-will," it may be terminated by you or PEO with or without cause or advance notice.`
        },
        order: 1
      }
    ]
  },
  {
    title: "Timekeeping and Payroll",
    category: "compensation",
    is_required: true,
    content: [
      {
        id: "employee-classification",
        type: "heading",
        content: { text: "Employee Classification", level: 2 },
        order: 0
      },
      {
        id: "classification-text",
        type: "text",
        content: {
          text: `Full-Time Employees: Full-time employees are employees who are normally scheduled to work at least thirty (30) hours per week, as determined by the Company in its sole discretion.

Part-Time Employees: Part-time employees are employees who are normally scheduled to work fewer than thirty (30) hours per week, as determined by the Company in its sole discretion.

Temporary Employees: Temporary employees are those who are hired for a specific project or for a limited time period.`
        },
        order: 1
      }
    ]
  },
  {
    title: "Work Hours and Breaks",
    category: "workplace_policies",
    is_required: true,
    content: [
      {
        id: "meal-periods",
        type: "heading",
        content: { text: "Meal Periods", level: 2 },
        order: 0
      },
      {
        id: "meal-periods-text",
        type: "text",
        content: {
          text: `The Company provides all non-exempt employees with the opportunity to take a thirty (30) minute unpaid meal period for shifts over five (5) hours. Employees who work more than ten (10) hours in a day are entitled to a second thirty (30) minute unpaid meal period. Meal periods should be taken no later than the end of the fifth hour of work for the first meal period and no later than the end of the tenth hour of work for the second meal period.

Employees are relieved of all duty during meal periods and are free to leave the premises. No manager or supervisor of the Company is authorized to instruct an employee how to spend their personal time during a meal or rest period.`
        },
        order: 1
      },
      {
        id: "rest-periods",
        type: "heading",
        content: { text: "Rest Periods", level: 2 },
        order: 2
      },
      {
        id: "rest-periods-text",
        type: "text",
        content: {
          text: `The Company provides all non-exempt employees with the opportunity to take a ten (10) minute paid rest period for every four (4) hours worked (or major fraction thereof), which should be taken so far as practicable in the middle of each work period. Rest periods are counted as hours worked, and thus, employees are not required to record their rest periods on their timesheets or time cards.`
        },
        order: 3
      }
    ]
  },
  {
    title: "California-Specific Policies",
    category: "california_specific",
    is_required: true,
    content: [
      {
        id: "seating-policy",
        type: "heading",
        content: { text: "California Seating", level: 2 },
        order: 0
      },
      {
        id: "seating-text",
        type: "text",
        content: {
          text: `The Company provides seating for employees wherever possible. If you do not have seating at your workstation and feel you need seating, please notify your supervisor or HR Contact, and we will look into the situation to determine what can be done.`
        },
        order: 1
      },
      {
        id: "lactation-policy",
        type: "heading",
        content: { text: "Lactation Accommodations", level: 2 },
        order: 2
      },
      {
        id: "lactation-text",
        type: "text",
        content: {
          text: `Employees have the right to request, and the Company will provide, accommodations required for employees to express breast milk as necessary. The Company will provide a reasonable amount of break time to accommodate a nursing parent employee's need to express breast milk for the employee's infant child. The Company additionally will provide employees needing to express breast milk with a room or place, other than a restroom, to express breast milk in private.`
        },
        order: 3
      }
    ]
  },
  {
    title: "Leave Policies",
    category: "benefits",
    is_required: true,
    content: [
      {
        id: "cfra-policy",
        type: "heading",
        content: { text: "California Family Rights Act (CFRA)", level: 2 },
        order: 0
      },
      {
        id: "cfra-text",
        type: "text",
        content: {
          text: `This policy applies to all California-based employees of companies with 5 or more employees. CFRA provides eligible employees with the right to take unpaid, job-protected leave for specified family and medical reasons. The maximum amount of leave an employee may use is 12 weeks within a 12-month period.

Employee Eligibility: To be eligible for CFRA leave, you must:
- have worked at least 12 months for the Company
- have worked at least 1,250 hours for the Company over the 12 months preceding the date your leave would commence
- currently work at a location where there are at least 5 employees

Conditions Triggering Leave: CFRA leave may be taken for:
- birth of a child, or to care or bond with a newly-born child
- placement of a child with the employee for adoption or foster care
- to care for an immediate family member with a serious health condition
- because of the employee's serious health condition that makes the employee unable to perform their job`
        },
        order: 1
      },
      {
        id: "fmla-policy",
        type: "heading",
        content: { text: "Family and Medical Leave Act (FMLA)", level: 2 },
        order: 2
      },
      {
        id: "fmla-text",
        type: "text",
        content: {
          text: `This policy is applicable to employees who work at locations with 50 or more employees within 75 miles. FMLA provides eligible employees the opportunity to take unpaid, job-protected leave for certain specified reasons. The maximum amount of leave an employee may use is either 12 or 26 weeks within a 12-month period depending on the reasons for the leave.`
        },
        order: 3
      }
    ]
  }
];

// Create the template data structure
export const californiaHandbookTemplate: DocumentTemplate = {
  id: 'ca-employee-handbook-template',
  document_type_id: '', // Will be set when document type is created
  name: 'California Employee Handbook Template',
  description: 'Comprehensive California-specific employee handbook template including all required policies and procedures',
  template_data: {
    sections: californiaHandbookSections,
    dynamic_fields: [
      'company_name',
      'company_address',
      'company_city',
      'company_state',
      'company_zip',
      'company_phone',
      'company_fax',
      'hr_contact_name',
      'hr_contact_phone',
      'hr_contact_email',
      'peo_contact_phone',
      'peo_contact_email'
    ],
    compliance_requirements: [
      'California Labor Code',
      'California Fair Employment and Housing Act',
      'California Family Rights Act',
      'Federal Family and Medical Leave Act',
      'Americans with Disabilities Act'
    ]
  },
  is_public: true,
  is_default: true,
  company_id: null,
  created_by: null,
  version: '1.0',
  tags: ['california', 'employee-handbook', 'hr-policies', 'compliance'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Dynamic field mappings for the template
export const californiaHandbookDynamicFields = [
  {
    field_name: 'company_name',
    field_label: 'Company Name',
    field_type: 'company_data' as const,
    source_table: 'company_settings',
    source_column: 'company_name',
    is_required: true,
    description: 'The legal name of the company'
  },
  {
    field_name: 'company_address',
    field_label: 'Company Address',
    field_type: 'text' as const,
    is_required: true,
    description: 'Company headquarters address'
  },
  {
    field_name: 'company_phone',
    field_label: 'Company Phone',
    field_type: 'text' as const,
    is_required: true,
    description: 'Main company phone number'
  },
  {
    field_name: 'hr_contact_name',
    field_label: 'HR Contact Name',
    field_type: 'text' as const,
    is_required: true,
    description: 'Name of the HR contact person'
  },
  {
    field_name: 'hr_contact_phone',
    field_label: 'HR Contact Phone',
    field_type: 'text' as const,
    is_required: true,
    description: 'Phone number of the HR contact person'
  },
  {
    field_name: 'hr_contact_email',
    field_label: 'HR Contact Email',
    field_type: 'text' as const,
    is_required: true,
    description: 'Email address of the HR contact person'
  },
  {
    field_name: 'peo_contact_phone',
    field_label: 'PEO Contact Phone',
    field_type: 'text' as const,
    is_required: true,
    description: 'PEO contact phone number'
  },
  {
    field_name: 'peo_contact_email',
    field_label: 'PEO Contact Email',
    field_type: 'text' as const,
    is_required: true,
    description: 'PEO contact email address'
  }
];