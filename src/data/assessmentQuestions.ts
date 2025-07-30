export interface Question {
  id: string;
  question: string;
  options: {
    text: string;
    score: number;
    riskTip: string;
  }[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  weight: number; // Weight percentage for scoring
  questions: Question[];
}

export const assessmentData: Section[] = [
  {
    id: "compliance",
    title: "Compliance & Labor Law",
    description: "Assess your compliance with federal and state labor regulations",
    weight: 20,
    questions: [
      {
        id: "c1",
        question: "Do you provide new hire paperwork that includes I-9, W-4, and all required state notices?",
        options: [
          {
            text: "Yes, and we track completion for every employee",
            score: 5,
            riskTip: "Excellent! Proper documentation and tracking protects against compliance violations and audits."
          },
          {
            text: "We provide it, but don't always track it",
            score: 3,
            riskTip: "Good start, but tracking completion is essential for audit protection and compliance verification."
          },
          {
            text: "We're not consistent / No",
            score: 0,
            riskTip: "Missing I-9s and required notices can result in significant fines during government audits."
          }
        ]
      },
      {
        id: "c2",
        question: "Are you compliant with California's Sexual Harassment Training law (SB 1343)?",
        options: [
          {
            text: "Yes, training is current for all staff and supervisors",
            score: 5,
            riskTip: "Perfect compliance! Current training is your strongest defense against harassment claims."
          },
          {
            text: "We've trained some employees, but not all",
            score: 3,
            riskTip: "Partial compliance creates risk. California requires training for ALL employees in companies with 5+ workers."
          },
          {
            text: "No / Not sure what's required",
            score: 0,
            riskTip: "Non-compliance with SB 1343 can result in increased liability and regulatory penalties."
          }
        ]
      },
      {
        id: "c3",
        question: "Have you created and implemented a Workplace Violence Prevention Plan (SB 553)?",
        options: [
          {
            text: "Yes, written plan with training provided",
            score: 5,
            riskTip: "Excellent compliance with California's newest workplace safety requirement."
          },
          {
            text: "Written but not trained",
            score: 3,
            riskTip: "Complete the implementation with training - SB 553 requires both written plans AND training."
          },
          {
            text: "No plan or unaware of requirement",
            score: 0,
            riskTip: "SB 553 violations can result in fines up to $18,000. Implementation is required by July 2024."
          }
        ]
      },
      {
        id: "c4",
        question: "Are employees provided with all required wage, sick leave, and rights notices at hire?",
        options: [
          {
            text: "Yes, with signed acknowledgments",
            score: 5,
            riskTip: "Perfect! Signed acknowledgments provide strong legal protection and prove compliance."
          },
          {
            text: "Sometimes / incomplete",
            score: 3,
            riskTip: "Inconsistent notice delivery creates compliance gaps and potential penalty exposure."
          },
          {
            text: "No / not sure",
            score: 0,
            riskTip: "Missing required notices can result in penalties and weaken your defense in wage claims."
          }
        ]
      }
    ]
  },
  {
    id: "policies",
    title: "HR Policies & Documentation",
    description: "Evaluate your HR policies and documentation practices",
    weight: 15,
    questions: [
      {
        id: "p1",
        question: "Do you have a current employee handbook compliant with California law?",
        options: [
          {
            text: "Yes, updated in the last 12 months",
            score: 5,
            riskTip: "Excellent! Current handbooks provide the strongest legal protection and policy clarity."
          },
          {
            text: "We have one but it's outdated",
            score: 3,
            riskTip: "Outdated handbooks can create liability. California employment law changes frequently."
          },
          {
            text: "No handbook",
            score: 0,
            riskTip: "Without a handbook, you're missing critical legal protections and clear policy communication."
          }
        ]
      },
      {
        id: "p2",
        question: "Do your written policies cover harassment, time off, discipline, and performance?",
        options: [
          {
            text: "Yes, and they are acknowledged by employees",
            score: 5,
            riskTip: "Comprehensive policies with acknowledgments provide the best legal protection."
          },
          {
            text: "Some topics covered",
            score: 3,
            riskTip: "Gaps in policy coverage create areas of vulnerability and potential compliance issues."
          },
          {
            text: "No or informal policies",
            score: 0,
            riskTip: "Lack of written policies makes it extremely difficult to defend employment decisions."
          }
        ]
      },
      {
        id: "p3",
        question: "Do employees sign and acknowledge receipt of your policies and handbook?",
        options: [
          {
            text: "Yes, for all policies",
            score: 5,
            riskTip: "Signed acknowledgments prove employees received and understood policies - critical for legal defense."
          },
          {
            text: "Only some / inconsistently",
            score: 3,
            riskTip: "Inconsistent acknowledgments create gaps in legal protection. Ensure all employees sign."
          },
          {
            text: "No",
            score: 0,
            riskTip: "Without signed acknowledgments, you can't prove employees knew about policies and procedures."
          }
        ]
      }
    ]
  },
  {
    id: "payroll",
    title: "Payroll & Wage Compliance",
    description: "Review your payroll accuracy and wage compliance",
    weight: 15,
    questions: [
      {
        id: "pay1",
        question: "Do you comply with all applicable local and state minimum wage laws?",
        options: [
          {
            text: "Yes, verified by role and location",
            score: 5,
            riskTip: "Excellent compliance! Local wage laws often exceed state minimums and change frequently."
          },
          {
            text: "We follow state law but not always local",
            score: 3,
            riskTip: "Local minimum wage violations can be costly. Many California cities have higher rates than state law."
          },
          {
            text: "Not sure / may be out of compliance",
            score: 0,
            riskTip: "Wage violations can result in back pay, penalties, and attorney fees. Verify compliance immediately."
          }
        ]
      },
      {
        id: "pay2",
        question: "Do your pay stubs include all required info under California law?",
        options: [
          {
            text: "Yes, fully itemized and compliant",
            score: 5,
            riskTip: "California has strict pay stub requirements. Compliance prevents penalties and employee disputes."
          },
          {
            text: "Partially compliant / unsure",
            score: 3,
            riskTip: "Pay stub violations can result in penalties up to $4,000 per employee. Ensure full compliance."
          },
          {
            text: "No / employees have complained",
            score: 0,
            riskTip: "Non-compliant pay stubs are a common source of expensive labor violations and lawsuits."
          }
        ]
      },
      {
        id: "pay3",
        question: "Are your overtime, final pay, and meal/rest policies documented and enforced?",
        options: [
          {
            text: "Yes, clearly documented and followed",
            score: 5,
            riskTip: "Clear policies and consistent enforcement prevent the most common wage and hour violations."
          },
          {
            text: "Informal policies",
            score: 3,
            riskTip: "Informal policies create confusion and increase risk of violations. Document everything clearly."
          },
          {
            text: "No clear process",
            score: 0,
            riskTip: "Missing overtime and meal/break policies are the most expensive wage and hour violations to fix."
          }
        ]
      },
      {
        id: "pay4",
        question: "Are commissions or bonuses supported by written agreements?",
        options: [
          {
            text: "Yes, all terms are documented",
            score: 5,
            riskTip: "Written agreements prevent disputes and provide legal protection for commission structures."
          },
          {
            text: "Some agreements are verbal",
            score: 3,
            riskTip: "Verbal agreements create risk. California law requires written commission agreements."
          },
          {
            text: "No documentation",
            score: 0,
            riskTip: "Undocumented commission terms frequently lead to expensive disputes and lawsuits."
          }
        ]
      }
    ]
  },
  {
    id: "safety",
    title: "Workers' Comp & Safety",
    description: "Assess your workplace safety and workers' compensation practices",
    weight: 15,
    questions: [
      {
        id: "s1",
        question: "Do you have an active workers' comp policy that matches your risk and employee classification?",
        options: [
          {
            text: "Yes, with correct codes",
            score: 5,
            riskTip: "Proper classification and coverage protect against unlimited liability and ensure legal compliance."
          },
          {
            text: "Not sure if the policy is accurate",
            score: 3,
            riskTip: "Verify your coverage annually. Incorrect classification can lead to penalties and coverage gaps."
          },
          {
            text: "No / not covered",
            score: 0,
            riskTip: "Operating without workers' comp is illegal and exposes you to unlimited personal liability for injuries."
          }
        ]
      },
      {
        id: "s2",
        question: "Have you reviewed your experience mod (X-Mod) and safety claims in the past year?",
        options: [
          {
            text: "Yes, and we actively manage claims",
            score: 5,
            riskTip: "Active claims management can reduce your experience mod and significantly lower insurance costs."
          },
          {
            text: "Aware of it but haven't reviewed recently",
            score: 3,
            riskTip: "Regular X-Mod review helps identify cost-saving opportunities and safety improvement areas."
          },
          {
            text: "No idea what our X-Mod is",
            score: 0,
            riskTip: "Your experience mod directly affects insurance costs. Poor management can increase premiums significantly."
          }
        ]
      },
      {
        id: "s3",
        question: "Do you have a written safety program (IIPP) and SB 553 plan?",
        options: [
          {
            text: "Yes, both are complete and shared",
            score: 5,
            riskTip: "Written safety programs demonstrate due diligence and help prevent OSHA violations."
          },
          {
            text: "Partially implemented",
            score: 3,
            riskTip: "Complete your safety programs to ensure full regulatory compliance and injury prevention."
          },
          {
            text: "No formal safety program",
            score: 0,
            riskTip: "Missing safety programs create high risk for OSHA violations and workplace injuries."
          }
        ]
      },
      {
        id: "s4",
        question: "Do employees receive safety training at hire and regularly after?",
        options: [
          {
            text: "Yes, and we track completions",
            score: 5,
            riskTip: "Regular, documented safety training reduces injuries and demonstrates compliance commitment."
          },
          {
            text: "Occasionally",
            score: 3,
            riskTip: "Consistent safety training is essential for injury prevention and regulatory compliance."
          },
          {
            text: "Not at all",
            score: 0,
            riskTip: "Lack of safety training significantly increases injury rates and regulatory violations."
          }
        ]
      }
    ]
  },
  {
    id: "training",
    title: "Training & Development",
    description: "Evaluate your employee training and development programs",
    weight: 10,
    questions: [
      {
        id: "t1",
        question: "Do you deliver all state-mandated training (e.g., harassment, safety, WVPP)?",
        options: [
          {
            text: "Yes, all required trainings are up to date",
            score: 5,
            riskTip: "Full compliance with mandatory training requirements provides strong legal protection."
          },
          {
            text: "Some training provided",
            score: 3,
            riskTip: "Partial training compliance creates gaps in legal protection. Ensure all requirements are met."
          },
          {
            text: "None / not compliant",
            score: 0,
            riskTip: "Missing mandatory training significantly increases liability and regulatory violation risks."
          }
        ]
      },
      {
        id: "t2",
        question: "Do new managers receive training on HR policies, discipline, and compliance?",
        options: [
          {
            text: "Yes, structured onboarding in place",
            score: 5,
            riskTip: "Trained managers make better decisions and reduce company liability exposure significantly."
          },
          {
            text: "Some guidance provided",
            score: 3,
            riskTip: "Enhance manager training to prevent costly employment decisions and policy violations."
          },
          {
            text: "No training for managers",
            score: 0,
            riskTip: "Untrained managers frequently make decisions that create expensive legal problems."
          }
        ]
      },
      {
        id: "t3",
        question: "Do you offer professional development or coaching?",
        options: [
          {
            text: "Yes, with a training calendar or LMS",
            score: 5,
            riskTip: "Professional development improves retention, performance, and reduces turnover costs."
          },
          {
            text: "Informal development efforts",
            score: 3,
            riskTip: "Structured development programs provide better ROI and employee engagement."
          },
          {
            text: "Nothing offered",
            score: 0,
            riskTip: "Lack of development opportunities increases turnover and reduces competitive advantage."
          }
        ]
      }
    ]
  },
  {
    id: "relations",
    title: "Employee Relations & Claims",
    description: "Assess your employee relations and claims management",
    weight: 15,
    questions: [
      {
        id: "r1",
        question: "Do you document warnings, coaching, and termination actions?",
        options: [
          {
            text: "Yes, all are recorded and stored",
            score: 5,
            riskTip: "Thorough documentation is essential for defending employment decisions and preventing lawsuits."
          },
          {
            text: "Sometimes / informal",
            score: 3,
            riskTip: "Inconsistent documentation creates legal vulnerabilities. Document all employment actions."
          },
          {
            text: "No documentation",
            score: 0,
            riskTip: "Without documentation, employment decisions become extremely difficult to defend legally."
          }
        ]
      },
      {
        id: "r2",
        question: "Do you have a consistent process for investigating complaints?",
        options: [
          {
            text: "Yes, documented and followed",
            score: 5,
            riskTip: "Consistent complaint handling demonstrates good faith and reduces liability exposure."
          },
          {
            text: "Handled case-by-case",
            score: 3,
            riskTip: "Standardize your complaint process to ensure thorough, defensible investigations."
          },
          {
            text: "No process in place",
            score: 0,
            riskTip: "Without complaint procedures, small issues can escalate into major legal problems."
          }
        ]
      },
      {
        id: "r3",
        question: "Have you had employee legal claims in the last 2 years?",
        options: [
          {
            text: "No",
            score: 5,
            riskTip: "Clean claims history indicates effective HR practices and strong risk management."
          },
          {
            text: "Yes, resolved",
            score: 3,
            riskTip: "Learn from past claims to strengthen policies and prevent future legal issues."
          },
          {
            text: "Yes, unresolved or ongoing",
            score: 0,
            riskTip: "Ongoing litigation indicates high-risk practices requiring immediate professional intervention."
          }
        ]
      },
      {
        id: "r4",
        question: "Do you offer a way for employees to report issues anonymously?",
        options: [
          {
            text: "Yes, anonymous hotline or form",
            score: 5,
            riskTip: "Anonymous reporting encourages early issue identification and demonstrates commitment to safe workplace."
          },
          {
            text: "Employees can speak up but no anonymous option",
            score: 3,
            riskTip: "Anonymous options often surface issues earlier, before they become serious problems."
          },
          {
            text: "No process to report concerns",
            score: 0,
            riskTip: "Without reporting mechanisms, serious issues can fester and become expensive legal problems."
          }
        ]
      }
    ]
  },
  {
    id: "benefits",
    title: "Benefits & Leave",
    description: "Review your benefits and leave compliance",
    weight: 10,
    questions: [
      {
        id: "b1",
        question: "Do you offer all required California leave benefits (sick leave, CFRA, FMLA)?",
        options: [
          {
            text: "Yes, fully compliant",
            score: 5,
            riskTip: "Full leave compliance protects against penalties and improves employee retention."
          },
          {
            text: "Somewhat compliant / unsure",
            score: 3,
            riskTip: "Verify full compliance with all California leave laws to avoid penalties and claims."
          },
          {
            text: "Not compliant",
            score: 0,
            riskTip: "Leave law violations can result in significant penalties and employee lawsuits."
          }
        ]
      },
      {
        id: "b2",
        question: "Do you offer health, dental, or retirement benefits?",
        options: [
          {
            text: "Yes, with clear eligibility and tracking",
            score: 5,
            riskTip: "Comprehensive benefits improve retention and provide competitive advantage in hiring."
          },
          {
            text: "Basic or partial offerings",
            score: 3,
            riskTip: "Consider expanding benefits to improve retention and employee satisfaction."
          },
          {
            text: "No benefits offered",
            score: 0,
            riskTip: "Lack of benefits may limit your ability to attract and retain quality employees."
          }
        ]
      },
      {
        id: "b3",
        question: "Do employees understand their benefits and leave rights?",
        options: [
          {
            text: "Yes, clearly explained and documented",
            score: 5,
            riskTip: "Clear communication prevents misunderstandings and improves benefit utilization and satisfaction."
          },
          {
            text: "Partially explained",
            score: 3,
            riskTip: "Improve benefit communication to maximize value and prevent employee confusion."
          },
          {
            text: "No clear communication",
            score: 0,
            riskTip: "Poor benefit communication reduces value and can lead to compliance issues."
          }
        ]
      },
      {
        id: "b4",
        question: "Do you track benefit enrollment, declination, and COBRA notices?",
        options: [
          {
            text: "Yes, documented for all employees",
            score: 5,
            riskTip: "Proper benefit tracking ensures compliance and protects against administrative penalties."
          },
          {
            text: "Informal tracking",
            score: 3,
            riskTip: "Enhance tracking systems to ensure full compliance with benefit administration requirements."
          },
          {
            text: "No tracking",
            score: 0,
            riskTip: "Poor benefit tracking can result in compliance violations and administrative penalties."
          }
        ]
      }
    ]
  }
];