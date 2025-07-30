export const getPlanDetails = (packageName: string) => {
  const planMap: Record<string, any> = {
    "Easy": {
      name: "Easy",
      description: "Essential workplace safety training",
      color: "blue",
      features: [
        "1 Core Training Module",
        "Basic progress tracking",
        "Mobile access and learning",
        "Digital completion certificates",
        "Email support during business hours",
        "Standard compliance reporting"
      ],
      moreFeatures: [
        "Interactive video content",
        "Basic quiz functionality",
        "Download certificates as PDF",
        "Employee progress dashboard",
        "English language only",
        "Standard certificate templates"
      ],
      idealFor: "Small businesses (5-25 employees) needing essential training",
      highlight: "Basic Package",
      popular: false
    },
    "Easier": {
      name: "Easier", 
      description: "Comprehensive safety program with plan creation",
      color: "primary",
      features: [
        "3 Training Modules",
        "SB 553 Prevention Plan Wizard",
        "1 hour phone consultation",
        "Advanced progress tracking & analytics",
        "Custom branding on certificates",
        "Priority email & phone support",
        "Manager dashboard with insights"
      ],
      moreFeatures: [
        "Multi-language support (Spanish, English)",
        "Advanced quiz and assessment features",
        "Custom certificate templates",
        "Detailed compliance reporting",
        "Employee performance analytics",
        "Integration with HR systems",
        "Mobile app with offline access",
        "Video streaming optimization",
        "Automated reminder notifications",
        "Bulk employee management"
      ],
      idealFor: "Growing companies (26-200 employees) needing comprehensive training programs",
      highlight: "Most Popular Choice",
      popular: true
    },
    "Easiest": {
      name: "Easiest",
      description: "White Glove service - We handle everything for you", 
      color: "orange",
      features: [
        "5 Training Modules",
        "Full Workplace Violence Prevention Plan creation",
        "White Glove service - We do the work",
        "Dedicated account manager",
        "Custom training module development",
        "API access & system integrations"
      ],
      moreFeatures: [
        "Custom implementation and setup",
        "Multi-language support (10+ languages)",
        "Single Sign-On (SSO) integration",
        "Advanced analytics & custom reporting",
        "White-label platform options",
        "Custom branding throughout platform",
        "Advanced user role management",
        "Priority phone and email support",
        "Quarterly business reviews",
        "Custom compliance templates",
        "Advanced security features",
        "Data export and backup tools",
        "Integration with HRIS/LMS systems",
        "Custom assessment creation",
        "Advanced certificate management"
      ],
      idealFor: "Large organizations (200+ employees) requiring extensive training solutions",
      highlight: "White Glove Service",
      popular: false
    }
  };
  return planMap[packageName] || planMap["Easy"];
};