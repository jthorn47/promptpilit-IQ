export const faqCategories = [
  {
    category: "Workplace Violence Prevention",
    questions: [
      {
        question: "What is California SB 553 and how does it affect my business?",
        answer: "California SB 553 requires most employers to establish, implement, and maintain a workplace violence prevention plan. Effective July 1, 2024, this law applies to most California employers and requires specific training, incident reporting, and prevention measures."
      },
      {
        question: "How often should employees complete workplace violence training?",
        answer: "California law requires initial training for all employees and annual refresher training. However, we recommend more frequent training (every 6 months) for high-risk industries or following any workplace incidents."
      },
      {
        question: "What industries are at highest risk for workplace violence?",
        answer: "Healthcare, retail, education, government, and customer service industries face the highest risk. However, workplace violence can occur in any industry, making prevention training essential for all employers."
      }
    ]
  },
  {
    category: "Training Requirements",
    questions: [
      {
        question: "What documentation do I need to maintain for compliance?",
        answer: "You must keep records of who completed training, completion dates, test scores, and certificates issued. Our platform automatically maintains these records and provides audit-ready reports."
      },
      {
        question: "Can training be customized for our specific industry?",
        answer: "Yes! Our training modules can be customized with industry-specific scenarios, your company policies, and branded with your organization's materials to ensure relevance and effectiveness."
      },
      {
        question: "What happens if an employee fails the training assessment?",
        answer: "Employees can retake assessments multiple times. Our platform provides additional resources, remedial materials, and one-on-one support to help employees succeed and meet compliance requirements."
      }
    ]
  },
  {
    category: "Platform & Technology",
    questions: [
      {
        question: "How do I track employee progress across my organization?",
        answer: "Our admin dashboard provides real-time tracking of completion rates, scores, and compliance status across all departments and locations. Generate reports for audits and regulatory compliance easily."
      },
      {
        question: "Is the platform mobile-friendly for remote workers?",
        answer: "Yes, our platform is fully responsive and works on all devices. Remote employees can complete training on smartphones, tablets, or computers with full progress synchronization."
      },
      {
        question: "How long does training typically take to complete?",
        answer: "Most training modules take 30-45 minutes to complete. Our interactive format keeps employees engaged while covering all required topics efficiently."
      }
    ]
  },
  {
    category: "Implementation & Support",
    questions: [
      {
        question: "How quickly can we implement training for our entire organization?",
        answer: "Implementation typically takes 1-2 business days. We provide bulk employee import, customized branding, and dedicated support to get your organization training quickly."
      },
      {
        question: "What support is available during implementation?",
        answer: "We provide dedicated account management, technical support, and training assistance. Our team helps with employee onboarding, progress monitoring, and compliance reporting."
      },
      {
        question: "Can we integrate with our existing HR systems?",
        answer: "Yes, we offer API integrations with popular HRIS platforms including BambooHR, Workday, and ADP. This enables automatic employee sync and seamless workflow integration."
      }
    ]
  }
];

export const generateFAQSchemaData = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqCategories.flatMap(category => 
    category.questions.map(qa => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer
      }
    }))
  )
});