import { HeroButton } from "@/components/ui/hero-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Check, Shield, Users, Award, BookOpen, Zap, Search, Phone, Mail, Menu, X, Factory, Hospital, Building, GraduationCap, ShoppingBag, Construction, MessageCircle, Headphones, Info, BarChart3, LogIn, Play, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SkipToContent } from "@/components/AccessibleNavigation";
import { WorkplaceViolenceRibbon } from "@/components/WorkplaceViolenceRibbon";

import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { PricingCard } from "@/components/pricing/PricingCard";
import { usePricingData, useCoursePackages, calculatePricing } from "@/hooks/usePricingData";
import { getPlanDetails } from "@/utils/planDetails";
import { Logo } from "@/components/ui/logo";

// Training course images - unique images for each course based on title
const courseImages = {
  "Workplace Violence Prevention": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format",
  "Sexual Harassment Prevention": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&auto=format",
  "Diversity, Equity & Inclusion": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&auto=format",
  "Cybersecurity Awareness": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop&auto=format",
  "Data Privacy & GDPR": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&auto=format",
  "Anti-Discrimination Training": "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&auto=format",
  "Code of Conduct": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop&auto=format",
  "Workplace Safety Fundamentals": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&auto=format",
  "Emergency Response Procedures": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop&auto=format",
  "Mental Health Awareness": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format",
  "Conflict Resolution": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop&auto=format",
  "Leadership Development": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop&auto=format",
  "Customer Service Excellence": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format",
  "Time Management": "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=300&fit=crop&auto=format",
  "Communication Skills": "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=300&fit=crop&auto=format",
  "Team Building": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&auto=format",
  "Performance Management": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&auto=format",
  "Hiring & Interviewing": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop&auto=format",
  "OSHA Safety Standards": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format",
  "Fire Safety & Prevention": "https://images.unsplash.com/photo-1581578949464-41ab5c8bb419?w=400&h=300&fit=crop&auto=format",
  "First Aid & CPR": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&auto=format",
  "Environmental Compliance": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop&auto=format"
};

const defaultCourseImage = "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop&auto=format";

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isSuperAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState(25);
  
  console.log('🏠 Landing: Page is rendering', { 
    location: window.location.href,
    timestamp: new Date().toISOString(),
    user: user ? { id: user.id, email: user.email } : null,
    isSuperAdmin
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('🏠 Landing: User signed out successfully');
    } catch (error) {
      console.error('🏠 Landing: Sign out error:', error);
    }
  };
  
  // Feature details for pop-ups
  const featureDetails = {
    "Training Modules": {
      title: "Comprehensive Training Modules",
      description: "Our training modules are designed by industry experts to provide comprehensive workplace safety education.",
      benefits: [
        "Interactive video-based learning",
        "Real-world scenario simulations", 
        "Progress tracking and assessments",
        "Mobile-friendly access anywhere",
        "Certificates upon completion"
      ],
      details: "Each module covers essential safety topics with engaging content that keeps employees interested and informed. Our bite-sized lessons make learning convenient and effective."
    },
    "Progress tracking": {
      title: "Advanced Progress Tracking",
      description: "Monitor training progress across your entire organization with detailed analytics and reporting.",
      benefits: [
        "Real-time completion tracking",
        "Individual employee progress",
        "Department-wide analytics",
        "Compliance reporting",
        "Automated reminders"
      ],
      details: "Stay on top of your training requirements with comprehensive dashboards that show who has completed what training and when certifications need renewal."
    },
    "Mobile access": {
      title: "Mobile Learning Platform",
      description: "Train your workforce anywhere, anytime with our fully responsive mobile platform.",
      benefits: [
        "iOS and Android compatible",
        "Offline learning capability",
        "Seamless progress sync",
        "Touch-friendly interface",
        "Download for offline use"
      ],
      details: "Whether on-site or remote, employees can access training materials from any device, ensuring continuous learning opportunities."
    },
    "Digital certificates": {
      title: "Digital Completion Certificates",
      description: "Automatically generate and distribute professional certificates upon course completion.",
      benefits: [
        "Instant certificate generation",
        "PDF download and sharing",
        "Verification system included",
        "Custom branding options",
        "Digital badge integration"
      ],
      details: "Provide employees with verifiable proof of their training achievements with professionally designed certificates that meet industry standards."
    },
    "Email support": {
      title: "Expert Email Support",
      description: "Get help when you need it with our responsive customer support team.",
      benefits: [
        "Dedicated support specialists",
        "Fast response times",
        "Technical assistance",
        "Training guidance",
        "Account management help"
      ],
      details: "Our knowledgeable support team is ready to assist with any questions about platform usage, training content, or compliance requirements."
    },
    "WVP Plan included": {
      title: "Workplace Violence Prevention Plan",
      description: "California SB 553 compliant workplace violence prevention planning tools and resources.",
      benefits: [
        "SB 553 compliance wizard",
        "Customizable plan templates", 
        "Risk assessment tools",
        "Incident reporting system",
        "Regular plan updates"
      ],
      details: "Stay compliant with California's new workplace violence prevention requirements with our comprehensive planning tools and expert guidance."
    },
    "Phone consultation": {
      title: "Expert Phone Consultation",
      description: "Direct access to safety experts for personalized guidance and support.",
      benefits: [
        "One-on-one expert guidance",
        "Customized safety solutions",
        "Implementation support",
        "Compliance consulting",
        "Best practices advice"
      ],
      details: "Get personalized attention from our safety experts who can help tailor your training program to your specific industry and organizational needs."
    },
    "Advanced analytics": {
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive analytics to track training effectiveness and compliance across your organization.",
      benefits: [
        "Detailed completion reports",
        "Training effectiveness metrics",
        "Compliance tracking",
        "Custom report generation",
        "Export capabilities"
      ],
      details: "Make data-driven decisions about your safety training program with in-depth analytics that show what's working and where improvements are needed."
    },
    "Custom branding": {
      title: "Custom Branding Options",
      description: "White-label the platform with your company's branding for a seamless experience.",
      benefits: [
        "Custom logo integration",
        "Brand color customization",
        "Company-specific messaging",
        "Personalized certificates",
        "Custom domain options"
      ],
      details: "Create a cohesive brand experience by customizing the platform to match your company's visual identity and messaging."
    },
    "Manager dashboard": {
      title: "Manager Dashboard",
      description: "Comprehensive management tools for supervisors and administrators.",
      benefits: [
        "Team overview dashboard",
        "Assignment management",
        "Progress monitoring",
        "Report generation",
        "User management tools"
      ],
      details: "Empower managers with the tools they need to oversee training programs, track team progress, and ensure compliance across their departments."
    },
    "White Glove service": {
      title: "White Glove Service",
      description: "Full-service implementation and management - we handle everything for you.",
      benefits: [
        "Complete setup assistance",
        "User onboarding support",
        "Ongoing account management",
        "Priority technical support",
        "Custom implementation"
      ],
      details: "Let our experts handle the entire implementation process, from initial setup to ongoing management, so you can focus on your business."
    },
    "Dedicated account manager": {
      title: "Dedicated Account Manager",
      description: "A personal point of contact who knows your business and training needs.",
      benefits: [
        "Single point of contact",
        "Proactive account monitoring",
        "Strategic planning support",
        "Escalation management",
        "Regular check-ins"
      ],
      details: "Your dedicated account manager will work closely with you to ensure your training program meets your goals and provides ongoing optimization recommendations."
    },
    "Custom module development": {
      title: "Custom Training Module Development",
      description: "Bespoke training content created specifically for your industry and company needs.",
      benefits: [
        "Industry-specific content",
        "Company policy integration",
        "Custom scenarios and examples",
        "Professional video production",
        "Interactive assessments"
      ],
      details: "We'll work with you to create custom training modules that address your specific workplace hazards, policies, and compliance requirements."
    },
    "API access & integrations": {
      title: "API Access & System Integrations",
      description: "Seamlessly integrate with your existing HRIS, LMS, or other business systems.",
      benefits: [
        "REST API access",
        "HRIS integration",
        "Single sign-on (SSO)",
        "Data synchronization",
        "Custom integrations"
      ],
      details: "Connect our platform with your existing systems for streamlined user management, automatic enrollment, and unified reporting across your organization."
    }
  };
  
  // Pricing data
  const { data: pricingData, isLoading: pricingLoading } = usePricingData();
  const { data: packages, isLoading: packagesLoading } = useCoursePackages();
  
  // Calculate pricing for each package
  const pricing = packages?.map(pkg => {
    const calculatedPricing = pricingData ? calculatePricing(employeeCount, pkg.id, 1, pricingData) : null;
    return calculatedPricing ? {
      packageId: pkg.id,
      ...calculatedPricing
    } : null;
  }).filter(Boolean);

  // Get course image with fallback
  const getCourseImage = (courseName: string) => {
    return courseImages[courseName as keyof typeof courseImages] || defaultCourseImage;
  };

  // Course data with detailed content
  const courses = [
    { 
      name: "Workplace Violence Prevention", 
      category: "Safety", 
      duration: "45 min", 
      popular: true,
      description: "Comprehensive training on identifying, preventing, and responding to workplace violence incidents.",
      objectives: [
        "Recognize warning signs of potentially violent behavior",
        "Understand legal requirements and company policies",
        "Learn de-escalation techniques and conflict resolution",
        "Know emergency response procedures"
      ],
      topics: ["Risk Assessment", "Prevention Strategies", "Emergency Response", "Legal Compliance"]
    },
    { 
      name: "Sexual Harassment Prevention", 
      category: "Compliance", 
      duration: "30 min", 
      popular: true,
      description: "Essential training covering sexual harassment prevention, reporting procedures, and creating respectful workplaces.",
      objectives: [
        "Define sexual harassment and understand its impact",
        "Recognize different forms of harassment",
        "Learn reporting procedures and investigation processes",
        "Understand bystander intervention strategies"
      ],
      topics: ["Legal Definitions", "Reporting Procedures", "Prevention Strategies", "Bystander Training"]
    },
    { 
      name: "Diversity, Equity & Inclusion", 
      category: "Workplace Culture", 
      duration: "40 min",
      description: "Build inclusive workplaces through understanding diversity, promoting equity, and fostering belonging.",
      objectives: [
        "Understand the value of diversity in the workplace",
        "Recognize unconscious bias and its effects",
        "Learn inclusive communication strategies",
        "Develop cultural competency skills"
      ],
      topics: ["Unconscious Bias", "Inclusive Leadership", "Cultural Competency", "Equity Practices"]
    },
    { 
      name: "Cybersecurity Awareness", 
      category: "Security", 
      duration: "35 min",
      description: "Protect your organization from cyber threats through comprehensive security awareness training.",
      objectives: [
        "Identify common cyber threats and attack vectors",
        "Learn password security best practices",
        "Understand social engineering tactics",
        "Know incident reporting procedures"
      ],
      topics: ["Phishing Prevention", "Password Security", "Social Engineering", "Data Protection"]
    },
    { 
      name: "Data Privacy & GDPR", 
      category: "Privacy", 
      duration: "30 min",
      description: "Ensure compliance with data privacy regulations and protect sensitive information.",
      objectives: [
        "Understand GDPR requirements and principles",
        "Learn data classification and handling procedures",
        "Know privacy rights and individual protections",
        "Understand breach notification requirements"
      ],
      topics: ["GDPR Compliance", "Data Classification", "Privacy Rights", "Breach Response"]
    },
    { 
      name: "Anti-Discrimination Training", 
      category: "Compliance", 
      duration: "25 min",
      description: "Create fair and equal workplaces free from discrimination and bias.",
      objectives: [
        "Understand legal protections against discrimination",
        "Recognize different forms of workplace discrimination",
        "Learn inclusive hiring and promotion practices",
        "Know complaint and investigation procedures"
      ],
      topics: ["Protected Classes", "Fair Employment", "Inclusive Practices", "Legal Compliance"]
    },
    { 
      name: "Code of Conduct", 
      category: "Ethics", 
      duration: "20 min",
      description: "Establish ethical standards and professional behavior expectations in the workplace.",
      objectives: [
        "Understand company values and ethical standards",
        "Learn decision-making frameworks for ethical dilemmas",
        "Know reporting procedures for misconduct",
        "Understand consequences of policy violations"
      ],
      topics: ["Ethical Standards", "Professional Conduct", "Conflict of Interest", "Reporting Procedures"]
    },
    { 
      name: "Workplace Safety Fundamentals", 
      category: "Safety", 
      duration: "40 min",
      description: "Essential safety training covering hazard identification, prevention, and emergency procedures.",
      objectives: [
        "Identify common workplace hazards",
        "Understand safety protocols and procedures",
        "Learn proper use of safety equipment",
        "Know emergency response procedures"
      ],
      topics: ["Hazard Identification", "Safety Protocols", "PPE Training", "Emergency Procedures"]
    },
    { 
      name: "Emergency Response Procedures", 
      category: "Safety", 
      duration: "35 min",
      description: "Prepare for emergencies with comprehensive response procedures and evacuation plans.",
      objectives: [
        "Understand different types of emergencies",
        "Learn evacuation procedures and routes",
        "Know communication protocols during emergencies",
        "Understand roles and responsibilities"
      ],
      topics: ["Emergency Types", "Evacuation Plans", "Communication Protocols", "Response Teams"]
    },
    { 
      name: "Mental Health Awareness", 
      category: "Wellness", 
      duration: "30 min",
      description: "Promote mental health awareness and create supportive workplace environments.",
      objectives: [
        "Recognize signs of mental health challenges",
        "Learn supportive communication techniques",
        "Understand available resources and support",
        "Know when and how to seek help"
      ],
      topics: ["Mental Health Recognition", "Supportive Communication", "Resource Awareness", "Help-Seeking"]
    },
    { 
      name: "Conflict Resolution", 
      category: "Soft Skills", 
      duration: "25 min",
      description: "Develop skills to manage and resolve workplace conflicts effectively.",
      objectives: [
        "Understand different types of workplace conflict",
        "Learn conflict resolution strategies and techniques",
        "Practice active listening and communication skills",
        "Know when to escalate conflicts"
      ],
      topics: ["Conflict Types", "Resolution Strategies", "Communication Skills", "Escalation Procedures"]
    },
    { 
      name: "Leadership Development", 
      category: "Management", 
      duration: "50 min",
      description: "Build essential leadership skills for managing teams and driving organizational success.",
      objectives: [
        "Develop leadership communication skills",
        "Learn team motivation and engagement strategies",
        "Understand performance management principles",
        "Practice decision-making and problem-solving"
      ],
      topics: ["Leadership Communication", "Team Motivation", "Performance Management", "Decision Making"]
    },
    { 
      name: "Customer Service Excellence", 
      category: "Professional", 
      duration: "30 min",
      description: "Deliver exceptional customer service and build lasting customer relationships.",
      objectives: [
        "Understand customer service principles",
        "Learn effective communication with customers",
        "Develop problem-solving skills for customer issues",
        "Know how to handle difficult situations"
      ],
      topics: ["Service Principles", "Customer Communication", "Problem Solving", "Difficult Situations"]
    },
    { 
      name: "Time Management", 
      category: "Productivity", 
      duration: "25 min",
      description: "Improve productivity through effective time management strategies and techniques.",
      objectives: [
        "Learn prioritization techniques and frameworks",
        "Understand time-blocking and scheduling strategies",
        "Identify and eliminate time wasters",
        "Develop sustainable productivity habits"
      ],
      topics: ["Prioritization", "Time Blocking", "Productivity Habits", "Goal Setting"]
    },
    { 
      name: "Communication Skills", 
      category: "Soft Skills", 
      duration: "35 min",
      description: "Enhance workplace communication through verbal, written, and interpersonal skills development.",
      objectives: [
        "Improve verbal and written communication",
        "Learn active listening techniques",
        "Understand non-verbal communication",
        "Practice giving and receiving feedback"
      ],
      topics: ["Verbal Communication", "Written Skills", "Active Listening", "Feedback Techniques"]
    },
    { 
      name: "Team Building", 
      category: "Collaboration", 
      duration: "40 min",
      description: "Build effective teams through collaboration, trust-building, and shared goal achievement.",
      objectives: [
        "Understand team development stages",
        "Learn collaboration and cooperation strategies",
        "Build trust and psychological safety",
        "Practice conflict resolution in teams"
      ],
      topics: ["Team Development", "Collaboration", "Trust Building", "Team Dynamics"]
    },
    { 
      name: "Performance Management", 
      category: "Management", 
      duration: "45 min",
      description: "Manage employee performance through goal setting, feedback, and development planning.",
      objectives: [
        "Learn performance goal setting and tracking",
        "Understand feedback and coaching techniques",
        "Practice performance review conversations",
        "Develop improvement and development plans"
      ],
      topics: ["Goal Setting", "Performance Reviews", "Coaching", "Development Planning"]
    },
    { 
      name: "Hiring & Interviewing", 
      category: "HR", 
      duration: "35 min",
      description: "Conduct effective interviews and make informed hiring decisions while ensuring legal compliance.",
      objectives: [
        "Understand legal considerations in hiring",
        "Learn structured interviewing techniques",
        "Practice behavioral interview questions",
        "Know how to evaluate candidates fairly"
      ],
      topics: ["Legal Compliance", "Interview Techniques", "Candidate Evaluation", "Selection Process"]
    },
    { 
      name: "OSHA Safety Standards", 
      category: "Compliance", 
      duration: "50 min",
      description: "Comprehensive training on OSHA regulations, standards, and workplace safety requirements.",
      objectives: [
        "Understand OSHA regulations and standards",
        "Learn hazard identification and assessment",
        "Know reporting and recordkeeping requirements",
        "Understand employee rights and responsibilities"
      ],
      topics: ["OSHA Regulations", "Hazard Assessment", "Recordkeeping", "Employee Rights"]
    },
    { 
      name: "Fire Safety & Prevention", 
      category: "Safety", 
      duration: "30 min",
      description: "Essential fire safety training covering prevention, detection, and emergency response procedures.",
      objectives: [
        "Understand fire prevention principles",
        "Learn proper use of fire extinguishers",
        "Know evacuation procedures and routes",
        "Understand fire detection and alarm systems"
      ],
      topics: ["Fire Prevention", "Extinguisher Use", "Evacuation Procedures", "Detection Systems"]
    },
    { 
      name: "First Aid & CPR", 
      category: "Medical", 
      duration: "60 min",
      description: "Life-saving skills training covering basic first aid, CPR, and emergency medical response.",
      objectives: [
        "Learn basic first aid techniques",
        "Practice CPR and AED use",
        "Understand emergency medical response",
        "Know when to call for professional help"
      ],
      topics: ["Basic First Aid", "CPR Techniques", "AED Use", "Emergency Response"]
    },
    { 
      name: "Environmental Compliance", 
      category: "Environment", 
      duration: "40 min",
      description: "Environmental protection training covering regulations, best practices, and sustainability.",
      objectives: [
        "Understand environmental regulations",
        "Learn waste management procedures",
        "Know spill response and cleanup protocols",
        "Understand sustainability practices"
      ],
      topics: ["Environmental Regulations", "Waste Management", "Spill Response", "Sustainability"]
    }
  ];

  const companyLogos = [
    { name: "Microsoft", width: "w-24" },
    { name: "Google", width: "w-20" },
    { name: "Apple", width: "w-16" },
    { name: "Amazon", width: "w-24" },
    { name: "Meta", width: "w-20" },
    { name: "Tesla", width: "w-20" },
    { name: "Netflix", width: "w-24" },
    { name: "Adobe", width: "w-20" }
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Easelearn - Workplace Safety Training Platform",
    "description": "Comprehensive workplace safety training and compliance solutions with interactive modules for workplace violence prevention and harassment training.",
    "url": "https://easelearn.com",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Easelearn Training Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": [
        {
          "@type": "Offer",
          "name": "Easy Plan",
          "price": "49",
          "priceCurrency": "USD",
          "billingIncrement": "monthly"
        },
        {
          "@type": "Offer", 
          "name": "Easier Plan",
          "price": "99",
          "priceCurrency": "USD", 
          "billingIncrement": "monthly"
        },
        {
          "@type": "Offer",
          "name": "Easiest Plan", 
          "price": "149",
          "priceCurrency": "USD",
          "billingIncrement": "monthly"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GoogleAnalytics />
      
      {/* Workplace Violence Prevention Ribbon */}
      <WorkplaceViolenceRibbon />
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={[{ label: "Home" }]} />
      
      <SEOHead
        title="Easelearn - Workplace Safety Training & Compliance Solutions"
        description="Transform your workplace safety with Easelearn's comprehensive training platform. Interactive modules for workplace violence prevention, harassment training, and compliance management. Trusted by thousands of organizations."
        keywords="workplace safety training, harassment prevention, compliance training, workplace violence prevention, employee training, safety compliance, interactive training modules, California SB 553"
        canonicalUrl="https://easelearn.com"
        schemaData={schemaData}
      />
      

      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 mr-2 sm:mr-4 md:mr-8">
              <Logo size="sm" className="h-8 sm:h-10" />
            </div>
            
            {/* Navigation - Centered with more space */}
            <nav className="hidden lg:flex items-center justify-center flex-1 space-x-8">
              <button onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 hover:text-primary font-medium transition-colors">Courses</button>
              <Link to="/easelearn-studio" className="text-gray-700 hover:text-primary font-medium transition-colors">Studio</Link>
              <div className="relative group">
                <button className="text-gray-700 hover:text-primary font-medium transition-colors flex items-center">
                  Resources
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link to="/resources" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">All Resources</Link>
                    <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">Blog</Link>
                    <Link to="/faq" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">FAQ</Link>
                  </div>
                </div>
              </div>
              <Link to="/pricing" className="text-gray-700 hover:text-primary font-medium transition-colors">Pricing</Link>
              <Link to="/easeworks" className="text-gray-700 hover:text-primary font-medium transition-colors">Easeworks</Link>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-700 hover:text-primary font-medium transition-colors">About</button>
            </nav>

            {/* Right side content */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Contact Info - Desktop only */}
              <div className="hidden xl:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span className="whitespace-nowrap">Call 888-843-0880</span>
                </div>
                <button className="hover:text-primary transition-colors">Contact</button>
              </div>
              
              {/* Authentication Button */}
              {user ? (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm text-gray-600 hidden sm:inline-block">
                    {user.email}
                  </span>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 transition-colors ml-4"
                  size="sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50 animate-accordion-down">
              <div className="px-4 py-6">
                <nav className="space-y-4">
                  <button 
                    onClick={() => {
                      document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors text-left w-full"
                  >
                    Courses
                  </button>
                  <Link 
                    to="/easlearn-studio" 
                    className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Studio
                  </Link>
                  <div className="px-4 py-3">
                    <p className="text-gray-700 font-medium mb-2">Resources</p>
                    <div className="ml-4 space-y-2">
                      <Link 
                        to="/resources" 
                        className="block px-2 py-1 text-gray-600 hover:text-primary hover:bg-gray-50 rounded font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        All Resources
                      </Link>
                      <Link 
                        to="/blog" 
                        className="block px-2 py-1 text-gray-600 hover:text-primary hover:bg-gray-50 rounded font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Blog
                      </Link>
                      <Link 
                        to="/faq" 
                        className="block px-2 py-1 text-gray-600 hover:text-primary hover:bg-gray-50 rounded font-medium transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        FAQ
                      </Link>
                    </div>
                  </div>
                  <Link 
                    to="/pricing" 
                    className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/easeworks" 
                    className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Easeworks
                  </Link>
                  <button 
                    onClick={() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors text-left w-full"
                  >
                    About
                  </button>
                  
                  {/* Mobile Contact Info */}
                  <div className="border-t pt-4 mt-4">
                    <div className="px-4 py-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>Call 888-843-0880</span>
                      </div>
                      <button className="text-primary hover:underline">Contact Us</button>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-400 rounded-full opacity-20"></div>
        <div className="absolute top-40 left-40 w-8 h-8 bg-blue-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-300 rounded-full opacity-25"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 
                id="hero-heading"
                className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">The Intelligent LMS</span>
                <br />
                Built for the <span className="text-blue-400">Future</span>
              </h1>
              
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-200 mb-4">
                AI-Powered • SCORM-Compliant • Cal/OSHA Ready
              </h2>
              
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Plan creation, employee training, and compliance tracking — all in one intelligent platform.
              </p>
              
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Built for California law. Backed by real HR experts. Powered by AI. Trusted by thousands.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold"
                >
                  Try it Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 text-lg font-semibold"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </Button>
              </div>
            </div>

            <div className="relative">
              {/* Video Player with EaseLearn styling */}
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-300 via-yellow-300 to-purple-400 p-1 rounded-3xl">
                  <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl overflow-hidden">
                    <video
                      src="https://40048518.fs1.hubspotusercontent-na1.net/hubfs/40048518/EaseLearn%20Overview.mp4"
                      className="w-full aspect-video object-cover rounded-3xl"
                      controls
                      poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop"
                      title="Easelearn Overview Video"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
              
              {/* Floating decorative elements around video */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-400/30 rounded-2xl rotate-12 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/3 -right-8 w-8 h-8 bg-green-400/35 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid - Why Settle for Legacy LMS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Why Settle for <span className="text-muted-foreground line-through">Legacy LMS</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compare outdated systems with EaseLearn's intelligent platform
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50">
              <div className="p-6 text-center font-semibold text-gray-700">
                Feature
              </div>
              <div className="p-6 text-center font-semibold text-gray-700 border-l border-gray-200">
                Legacy LMS
              </div>
              <div className="p-6 text-center font-semibold bg-gradient-to-r from-orange-500/10 to-blue-500/10 border-l border-gray-200">
                <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent font-bold">
                  EaseLearn
                </span>
              </div>
            </div>
            
            {/* Features */}
            {[
              { feature: 'AI-Powered Learning Paths', legacy: false, easelearn: true },
              { feature: 'Real-time Analytics', legacy: false, easelearn: true },
              { feature: 'SCORM 2004 Compliance', legacy: true, easelearn: true },
              { feature: 'Mobile-First Design', legacy: false, easelearn: true },
              { feature: 'Automated Compliance Tracking', legacy: false, easelearn: true },
              { feature: 'Custom Branding', legacy: false, easelearn: true },
              { feature: 'One-Click Reports', legacy: false, easelearn: true },
              { feature: 'Legacy Interface', legacy: true, easelearn: false },
            ].map((item, index) => (
              <div 
                key={index} 
                className="grid grid-cols-3 border-t border-gray-200 hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className="p-6 font-medium text-gray-800">
                  {item.feature}
                </div>
                <div className="p-6 text-center border-l border-gray-200">
                  {item.legacy ? (
                    <Check className="h-5 w-5 text-gray-400 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="p-6 text-center border-l border-gray-200 bg-gradient-to-r from-orange-500/5 to-blue-500/5">
                  {item.easelearn ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your team's learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Assess',
                description: 'AI analyzes your team\'s knowledge gaps and compliance requirements',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Award,
                title: 'Assign',
                description: 'Smart algorithms create personalized learning paths for each employee',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: BarChart3,
                title: 'Improve',
                description: 'Real-time analytics track progress and ensure continuous improvement',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/30 to-blue-500/10 z-0" />
                )}
                
                {/* Step card */}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} p-4 mb-6`}>
                    <step.icon className="w-full h-full text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Carousel */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
                SCORM-Compliant
              </span> Training Library
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading compliance courses, ready to deploy
            </p>
          </div>
          
          {/* Scrollable carousel */}
          <div className="overflow-x-auto">
            <div className="flex space-x-6 pb-4" style={{ width: 'max-content' }}>
              {[
                {
                  icon: Shield,
                  title: 'SB 553',
                  subtitle: 'Workplace Violence Prevention',
                  description: 'California workplace safety compliance training'
                },
                {
                  icon: Users,
                  title: 'HIPAA',
                  subtitle: 'Healthcare Privacy',
                  description: 'Medical information protection training'
                },
                {
                  icon: Award,
                  title: 'AML',
                  subtitle: 'Anti-Money Laundering',
                  description: 'Financial compliance and detection training'
                },
                {
                  icon: Check,
                  title: 'OSHA',
                  subtitle: 'Occupational Safety',
                  description: 'Workplace safety and health standards'
                },
                {
                  icon: Users,
                  title: 'Harassment Prevention',
                  subtitle: 'Workplace Respect',
                  description: 'Creating inclusive work environments'
                },
                {
                  icon: Shield,
                  title: 'Data Security',
                  subtitle: 'Information Protection',
                  description: 'Cybersecurity awareness and protocols'
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-500/20 to-blue-500/20 p-4 mb-4 group-hover:from-orange-500/30 group-hover:to-blue-500/30 transition-colors duration-300">
                    <item.icon className="w-full h-full text-orange-500" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <h4 className="text-sm text-orange-500 font-semibold mb-3">{item.subtitle}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  
                  {/* Learn more link */}
                  <div className="mt-4 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more →
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">← Scroll to explore all compliance topics →</p>
          </div>
        </div>
      </section>

      {/* EaseLearnX Innovation Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500/5 via-blue-500/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full text-orange-600 font-semibold text-sm mb-4">
                  Introducing EaseLearnX
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    AI Coaching.
                  </span>
                  <br />
                  <span className="text-gray-800">Adaptive Training.</span>
                  <br />
                  <span className="text-gray-800">Future-Ready.</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Our next-generation AI engine doesn't just deliver content—it understands how your team learns, 
                  adapts in real-time, and coaches each individual to mastery.
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-3 flex-shrink-0">
                    <BookOpen className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Neural Learning Paths</h3>
                    <p className="text-gray-600">AI analyzes learning patterns to create unique pathways for each employee</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-3 flex-shrink-0">
                    <Zap className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Real-time Adaptation</h3>
                    <p className="text-gray-600">Content difficulty adjusts instantly based on comprehension and engagement</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-3 flex-shrink-0">
                    <BarChart3 className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Predictive Analytics</h3>
                    <p className="text-gray-600">Forecast training needs and prevent compliance gaps before they occur</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 transition-all duration-300 text-white"
                onClick={() => navigate('/pricing')}
              >
                Experience EaseLearnX
              </Button>
            </div>
            
            {/* Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-orange-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl p-8 backdrop-blur-sm border border-gray-200">
                {/* Animated neural network visualization */}
                <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Animated nodes */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-orange-400 rounded-full animate-pulse"
                      style={{
                        left: `${20 + (i % 4) * 20}%`,
                        top: `${20 + Math.floor(i / 4) * 25}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s',
                      }}
                    />
                  ))}
                  
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line
                        key={i}
                        x1={`${20 + (i % 4) * 20}%`}
                        y1={`${20 + Math.floor(i / 4) * 25}%`}
                        x2={`${20 + ((i + 1) % 4) * 20}%`}
                        y2={`${20 + Math.floor((i + 1) / 4) * 25}%`}
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                    ))}
                  </svg>
                  
                  {/* Floating text indicators */}
                  <div className="absolute top-4 left-4 text-xs font-medium text-orange-400 opacity-80">
                    AI Processing...
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs font-medium text-blue-400 opacity-80">
                    Learning Optimized
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* LMS Platform Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete LMS for <span className="text-primary">Compliance & Corporate Training</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EaseLearn is a complete LMS for compliance and corporate training. Deliver your courses, track completions, and automate annual renewals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">SCORM Compliant</h3>
              <p className="text-gray-600">
                Upload and deliver SCORM packages or create custom courses with our built-in authoring tools. Full SCORM 1.2 and 2004 support.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                Comprehensive reporting and analytics to track learner progress, completion rates, and training effectiveness across your organization.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile-Friendly Access</h3>
              <p className="text-gray-600">
                Fully responsive design works seamlessly on any device. Learners can access training anywhere, anytime with offline capability.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/pricing')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
            >
              Explore LMS Features
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted by Organizations <span className="text-orange-500">Just Like Yours</span>
          </h2>
          
          {/* Industry Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
            {[
              { icon: <Factory className="w-8 h-8 text-blue-600" />, label: "Manufacturing", count: "500+" },
              { icon: <Hospital className="w-8 h-8 text-red-600" />, label: "Healthcare", count: "750+" },
              { icon: <Building className="w-8 h-8 text-gray-600" />, label: "Corporate", count: "1,200+" },
              { icon: <GraduationCap className="w-8 h-8 text-green-600" />, label: "Education", count: "400+" },
              { icon: <ShoppingBag className="w-8 h-8 text-purple-600" />, label: "Retail", count: "800+" },
              { icon: <Construction className="w-8 h-8 text-orange-600" />, label: "Construction", count: "350+" }
            ].map((industry, index) => (
              <div key={index} className="aspect-square flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 animate-fade-in group">
                <div className="flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">{industry.icon}</div>
                <div className="font-semibold text-gray-900 text-xs text-center leading-tight">{industry.label}</div>
                <div className="text-orange-500 font-bold text-xs mt-1">{industry.count}</div>
              </div>
            ))}
          </div>
          
          {/* Stats Counter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">25,000+</div>
              <div className="text-gray-600">Employees Trained</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">3,000+</div>
              <div className="text-gray-600">Companies Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">99.8%</div>
              <div className="text-gray-600">Compliance Rate</div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            From small businesses to Fortune 500 companies across all 50 states
          </div>
        </div>
      </section>

      {/* Choose Your Training Plan */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Training Plan
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Flexible per-seat pricing that grows with your business. All plans include our core workplace violence prevention training.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Easy Plan */}
            <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
              <div className="text-center mb-6 pt-3 min-h-[140px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Easy</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">Per-Seat</div>
                  <div className="text-sm text-gray-500 mb-4">Pricing based on team size</div>
                </div>
                <p className="text-sm text-gray-600">Essential workplace safety training</p>
              </div>
              
              <div className="space-y-3 mb-6 flex-grow min-h-[240px]">
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">1 Core Training Module</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Basic progress tracking</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Mobile access and learning</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Digital completion certificates</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Email support during business hours</span>
                </div>
              </div>
              
              <div className="mt-auto">
                <Button 
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-full py-3 mb-3"
                  onClick={() => navigate('/pricing')}
                >
                  Instant Pricing
                </Button>
              </div>
            </Card>

            {/* Easier Plan - Most Popular */}
            <Card className="p-6 bg-white border-2 border-purple-500 rounded-lg shadow-lg relative flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1 text-sm rounded-full">Most Popular</Badge>
              </div>
              
              <div className="text-center mb-6 pt-3 min-h-[140px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Easier</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">Per-Seat</div>
                  <div className="text-sm text-gray-500 mb-4">Pricing based on team size</div>
                </div>
                <p className="text-sm text-gray-600">Comprehensive safety program with plan creation</p>
              </div>
              
              <div className="space-y-3 mb-6 flex-grow min-h-[240px]">
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">3 Training Modules</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">SB 553 Prevention Plan Wizard</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">1 hour phone consultation</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Advanced progress tracking</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Advanced analytics</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700 text-left">Custom branding on certificates</span>
                </div>
              </div>
              
              <div className="mt-auto">
                <Button 
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-full py-3 mb-3"
                  onClick={() => navigate('/pricing')}
                >
                  Instant Pricing
                </Button>
              </div>
            </Card>

            {/* Easiest Plan */}
            <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
              <div className="text-center mb-6 pt-3 min-h-[140px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Easiest</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">Per-Seat</div>
                  <div className="text-sm text-gray-500 mb-4">Pricing based on team size</div>
                </div>
                <p className="text-sm text-gray-600">We handle everything for you</p>
              </div>
              
              <div className="space-y-3 mb-6 flex-grow min-h-[240px]">
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">5 Training Modules</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">SB 553 Prevention Plan Wizard</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">We create the plan for you</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Dedicated account manager</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700 text-left">Custom training module development</span>
                </div>
              </div>
              
              <div className="mt-auto">
                <Button 
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-full py-3 mb-3"
                  onClick={() => navigate('/pricing')}
                >
                  Instant Pricing
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="mt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-primary hover:text-primary-foreground hover:bg-primary">
                  Compare All Features
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                <DialogHeader className="text-center pb-6">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Complete Feature Comparison
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600 mt-2">
                    Compare all features across our training plans
                  </DialogDescription>
                </DialogHeader>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    <div className="p-4 font-bold text-gray-800 border-r border-gray-200">Features</div>
                    <div className="p-4 text-center font-bold text-gray-800 border-r border-gray-200">
                      <div className="text-lg">Easy</div>
                      <div className="text-xs text-gray-500 mt-1">Starter Plan</div>
                    </div>
                    <div className="p-4 text-center font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 border-r border-gray-200 relative">
                      <div className="text-lg">Easier</div>
                      <div className="text-xs text-purple-100 mt-1">Most Popular</div>
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-white text-purple-600 text-xs px-2 py-0.5">Popular</Badge>
                      </div>
                    </div>
                    <div className="p-4 text-center font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600">
                      <div className="text-lg">Easiest</div>
                      <div className="text-xs text-blue-100 mt-1">Premium Plan</div>
                    </div>
                  </div>
                  
                  {/* Core Features Section */}
                  <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="p-3 font-semibold text-gray-800 bg-blue-100 border-r border-gray-200">Core Features</div>
                    <div className="p-3 border-r border-gray-200"></div>
                    <div className="p-3 border-r border-gray-200"></div>
                    <div className="p-3"></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Training Modules</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Training Modules")}
                      />
                    </div>
                    <div className="p-3 text-center text-sm border-r border-gray-200 bg-gray-50">1 Core Module</div>
                    <div className="p-3 text-center text-sm border-r border-gray-200 bg-purple-50 font-medium text-purple-700">3 Modules</div>
                    <div className="p-3 text-center text-sm bg-blue-50 font-medium text-blue-700">5 Modules</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Progress tracking</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Progress tracking")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Mobile access</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Mobile access")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Digital certificates</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Digital certificates")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Email support</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Email support")}
                      />
                    </div>
                    <div className="p-3 text-center text-xs border-r border-gray-200 bg-gray-100 text-gray-600">Business hours</div>
                    <div className="p-3 text-center text-xs border-r border-gray-200 bg-purple-50 text-purple-700">Business hours</div>
                    <div className="p-3 text-center text-xs bg-blue-50 text-blue-700 font-medium">Priority</div>
                  </div>
                  
                  {/* Advanced Features Section */}
                  <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <div className="p-3 font-semibold text-gray-800 bg-purple-100 border-r border-gray-200">Advanced Features</div>
                    <div className="p-3 border-r border-gray-200"></div>
                    <div className="p-3 border-r border-gray-200"></div>
                    <div className="p-3"></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>WVP Plan included</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("WVP Plan included")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Phone consultation</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Phone consultation")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center text-xs border-r border-gray-200 bg-purple-50 text-purple-700">1 hour</div>
                    <div className="p-3 text-center text-xs bg-blue-50 text-blue-700 font-medium">Unlimited</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Advanced analytics</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Advanced analytics")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Custom branding</span>
                      <Info className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => setSelectedFeature("Custom branding")} />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Manager dashboard</span>
                      <Info className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => setSelectedFeature("Manager dashboard")} />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  {/* Premium Features Section */}
                  <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                    <div className="p-3 font-semibold text-gray-800 bg-blue-100 border-r border-gray-200">Premium Features</div>
                    <div className="p-3 border-r border-gray-200"></div>
                    <div className="p-3 border-r border-gray-200"></div>
                    <div className="p-3"></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>White Glove service</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("White Glove service")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Dedicated account manager</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Dedicated account manager")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>Custom module development</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("Custom module development")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0 hover:bg-gray-50 transition-colors">
                    <div className="p-3 text-gray-700 border-r border-gray-200 flex items-center justify-between">
                      <span>API access & integrations</span>
                      <Info 
                        className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700" 
                        onClick={() => setSelectedFeature("API access & integrations")}
                      />
                    </div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center border-r border-gray-200 text-gray-400">-</div>
                    <div className="p-3 text-center bg-blue-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                  
                  {/* CTA Row */}
                  <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300">
                    <div className="p-4 font-semibold text-gray-800 border-r border-gray-200 flex items-center">
                      Get Instant Pricing
                    </div>
                    <div className="p-4 text-center border-r border-gray-200">
                      <Button 
                        onClick={() => navigate('/pricing#calculator')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                        size="sm"
                      >
                        Instant Pricing Quote
                      </Button>
                    </div>
                    <div className="p-4 text-center border-r border-gray-200 bg-purple-50">
                      <Button 
                        onClick={() => navigate('/pricing#calculator')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        Instant Pricing Quote
                      </Button>
                    </div>
                    <div className="p-4 text-center bg-blue-50">
                      <Button 
                        onClick={() => navigate('/pricing#calculator')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        Instant Pricing Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            💡 <strong>Pro Tip:</strong> Pricing decreases as team size increases. Get a custom quote for teams over 100 employees.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Modern Training for Modern Workplaces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interactive, mobile-ready compliance training that fits into your team's workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: <BookOpen className="w-10 h-10" />,
                title: "Interactive Learning",
                description: "Bite-sized modules with quizzes, scenarios, and real-world examples that keep employees engaged.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: <Shield className="w-10 h-10" />,
                title: "Always Compliant",
                description: "Stay current with federal and state regulations through our expert-maintained content library.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: <Award className="w-10 h-10" />,
                title: "Digital Certificates",
                description: "Professional certificates with secure verification and your company's custom branding.",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: "Team Dashboard",
                description: "Track progress, send reminders, and manage training assignments from one central location.",
                gradient: "from-orange-500 to-orange-600"
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Quick Deployment",
                description: "Launch training organization-wide in minutes with our streamlined setup process.",
                gradient: "from-yellow-500 to-yellow-600"
              },
              {
                icon: <Check className="w-10 h-10" />,
                title: "Analytics & Reports",
                description: "Detailed insights into completion rates, scores, and compliance status for easy auditing.",
                gradient: "from-indigo-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="relative overflow-hidden p-6 hover:shadow-strong transition-all duration-300 hover:scale-105 border-0 bg-gradient-card group animate-fade-in">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`}></div>
                <div className="relative">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200 shadow-medium`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-Page Pricing Card */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="overflow-hidden bg-gradient-card border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Most Popular: Easier Plan
                </h3>
                <p className="text-muted-foreground mb-6">
                  Everything you need for complete workplace safety compliance, including our signature Workplace Violence Prevention Plan creation.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-success mr-2" />
                    3 Core Training Modules
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-success mr-2" />
                    WVP Plan Creation Included
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-success mr-2" />
                    1-Hour Expert Consultation
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-success mr-2" />
                    Advanced Analytics Dashboard
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center items-center text-center bg-card rounded-lg p-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-foreground">Per-Seat</div>
                  <div className="text-sm text-muted-foreground">Pricing scales with team size</div>
                </div>
                <div className="mb-6">
                  <Badge className="bg-warning-muted text-warning-foreground mb-2">30% Off First Year</Badge>
                  <div className="text-sm text-muted-foreground">Save hundreds on annual plans</div>
                </div>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="w-full"
                  size="lg"
                >
                  View Pricing Calculator
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Training Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're known for our industry-leading Workplace Violence and Sexual Harassment training, 
              plus comprehensive courses covering all your compliance needs.
            </p>
          </div>

          {/* Featured Courses */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Signature Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 border-2 border-primary shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Workplace Violence Prevention Training</h4>
                  <p className="text-gray-600 mb-6">
                    Comprehensive training on recognizing, preventing, and responding to workplace violence. 
                    Includes threat assessment, de-escalation techniques, and emergency response protocols.
                  </p>
                  <Badge className="bg-red-100 text-red-800">Most Popular</Badge>
                </div>
              </Card>
              
              <Card className="p-8 border-2 border-primary shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Sexual Harassment Prevention Training</h4>
                  <p className="text-gray-600 mb-6">
                    Expert-developed training covering federal and state requirements, creating respectful workplaces, 
                    and proper reporting procedures. Tailored for managers and employees.
                  </p>
                  <Badge className="bg-purple-100 text-purple-800">Industry Leading</Badge>
                </div>
              </Card>
            </div>
          </div>

          {/* All Courses Grid */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete Course Catalog</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <Card 
                  key={`course-${index}-${course.name}`} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => setSelectedCourse(course)}
                >
                  {/* Course Image */}
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={getCourseImage(course.name)} 
                      alt={`${course.name} training`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-foreground flex-1 leading-tight">{course.name}</h4>
                      {course.popular && (
                        <Badge className="bg-warning-muted text-warning-foreground ml-2 flex-shrink-0">Popular</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="bg-muted px-3 py-1 rounded-full">{course.category}</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="mt-4 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to view details →
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8"
              onClick={() => navigate('/auth')}
            >
              Start Training Today
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main About Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="mb-4">
                <Badge className="px-4 py-2 text-sm bg-primary/10 text-primary">Trusted Since 2000</Badge>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About Easelearn
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                With over 24 years of experience, we're the trusted experts in workplace safety and compliance training, 
                specializing in Workplace Violence Prevention and Sexual Harassment training 
                that companies nationwide rely on.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded by workplace safety professionals and legal experts in 2000, Easelearn was born 
                from the need to make compliance training more engaging, effective, and accessible.
                We believe that when employees are properly trained, workplaces become safer, 
                more respectful, and more productive.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our mission is simple: transform boring, checkbox compliance training into 
                interactive learning experiences that employees actually remember and apply.
              </p>
            </div>
            
              <div className="bg-gradient-to-br from-primary/10 to-orange-100 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">25,000+</div>
                    <div className="text-gray-600">Employees Trained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">3,000+</div>
                    <div className="text-gray-600">Companies Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
                    <div className="text-gray-600">Compliance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50</div>
                    <div className="text-gray-600">States Served</div>
                  </div>
                </div>
              </div>
          </div>

          {/* Our Expertise */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Expertise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Workplace Violence Prevention</h4>
                <p className="text-gray-600 text-sm">Industry-leading training programs developed by security and legal experts.</p>
              </Card>
              
              <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Harassment Prevention</h4>
                <p className="text-gray-600 text-sm">Comprehensive sexual harassment training meeting all federal and state requirements.</p>
              </Card>
              
              <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Compliance Expertise</h4>
                <p className="text-gray-600 text-sm">Stay current with changing regulations through our expert-maintained content.</p>
              </Card>
              
              <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Interactive Learning</h4>
                <p className="text-gray-600 text-sm">Engaging, scenario-based training that employees actually want to complete.</p>
              </Card>
            </div>
          </div>

          {/* Testimonials section */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              What HR Leaders Say
            </h3>
            <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12">
              Real results from real professionals who've transformed their training programs
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "EaseLearn transformed our compliance training from a dreaded requirement into an engaging experience. Our completion rates went from 60% to 98% in just three months.",
                  author: "Sarah Chen",
                  role: "Chief People Officer",
                  company: "TechCorp Industries",
                  rating: 5
                },
                {
                  quote: "The AI-powered learning paths are incredible. Each employee gets exactly what they need, when they need it. We've never seen such personalized training at scale.",
                  author: "Michael Rodriguez",
                  role: "HR Director", 
                  company: "Healthcare United",
                  rating: 5
                },
                {
                  quote: "Implementation was seamless, and the real-time analytics give us insights we never had before. EaseLearn pays for itself through improved efficiency alone.",
                  author: "Jennifer Park",
                  role: "Learning & Development Manager",
                  company: "Global Financial Services", 
                  rating: 5
                }
              ].map((testimonial, index) => (
                <Card key={index} className="p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative group">
                  {/* Quote icon */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Award key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-orange-500 font-medium">{testimonial.role}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              ))}
            </div>
            
            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <p className="text-gray-600 mb-4">
                Join hundreds of companies already transforming their training
              </p>
              <div className="inline-flex items-center space-x-4 text-sm text-orange-500">
                <span>✓ 30-day free trial</span>
                <span>✓ No setup fees</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gray-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Companies Choose Easelearn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Expert-Developed Content</h4>
                    <p className="text-gray-600">Created by workplace safety professionals, employment lawyers, and HR experts.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Always Up-to-Date</h4>
                    <p className="text-gray-600">Content automatically updates to reflect the latest federal and state regulations.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mobile-First Design</h4>
                    <p className="text-gray-600">Complete training anytime, anywhere on any device with our responsive platform.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Proven Results</h4>
                    <p className="text-gray-600">98% completion rates and 4.9/5 user satisfaction across thousands of companies.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dedicated Support</h4>
                    <p className="text-gray-600">Expert customer success team available to help you maximize your training program.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quick Implementation</h4>
                    <p className="text-gray-600">Get your entire organization trained in days, not months, with our streamlined setup.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-warning/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Don't Wait - California Compliance Deadlines Are Here
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join 3,000+ companies who chose Easelearn for SB 553 and AB 1343 compliance. 
              Get trained, compliant, and protected in under 48 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Urgency messaging */}
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-danger rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-danger-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">SB 553 Compliance Required</h3>
                    <p className="text-muted-foreground">California employers must have workplace violence prevention plans and training in place.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-warning-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">AB 1343 Training Mandated</h3>
                    <p className="text-muted-foreground">Sexual harassment prevention training required for all California employees.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-success-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Easelearn = Full Compliance</h3>
                    <p className="text-muted-foreground">Purpose-built platform covers all requirements with automated tracking and reporting.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Pricing card */}
            <div>
              <Card className="p-8 bg-card border-primary/20 shadow-xl">
                <div className="text-center mb-6">
                  <Badge className="bg-danger text-danger-foreground mb-4">⚡ Limited Time: 30% Off</Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Get Compliant Today</h3>
                  <p className="text-muted-foreground">Complete training + compliance documentation in 48 hours</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Easy Plan (1 module)</span>
                    <span className="font-semibold">Per-seat pricing</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Easier Plan (3 modules + WVP)</span>
                    <span className="font-semibold text-primary">Most Popular</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Easiest Plan (5 modules + White Glove)</span>
                    <span className="font-semibold">Enterprise</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/pricing#calculator')}
                    className="w-full"
                    size="lg"
                  >
                    Get Instant Pricing Calculator
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                    size="lg"
                  >
                    Start Free Trial Now
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  💡 Volume discounts available. Pricing decreases as team size increases.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* EaseLearn Studio Section */}
      <section id="easelearn-studio" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Introducing EaseLearn Studio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Custom-branded training videos designed just for your team — written, voiced, and produced by EaseLearn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Tailored Scripting */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Tailored Scripting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We turn your policies and internal content into engaging, easy-to-understand scripts that resonate with your team.
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Custom content for your industry</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Simplified complex policies</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI or Human Voiceovers */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  AI or Human Voiceovers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Choose between AI avatars, professional narration, or real employee footage to match your brand personality.
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Professional voice talent</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>AI avatar technology</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branded & SCORM-Ready */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Branded & SCORM-Ready
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Every video includes your logo, color scheme, and LMS-ready delivery for seamless integration.
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Full brand customization</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>SCORM 1.2 & 2004 compatible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Video Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors cursor-pointer">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">See EaseLearn Studio in Action</h3>
                    <p className="text-gray-300">Watch a 60-second demo of our custom video production process</p>
                  </div>
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/easlearn-studio')}
            >
              Request a Custom Video
            </Button>
            <p className="text-sm text-gray-600 mt-4">
              Starting at $2,500 per custom training video • Typical delivery in 2-3 weeks
            </p>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Support You Can Count On
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get help when you need it with our comprehensive support options designed for both employees and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* AI Chat Support Tile */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  👩‍💻 AI Chat Support – Always On
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Our smart AI assistant answers plan, course, or login questions instantly — anytime, anywhere.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Available 24/7 in client portal</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Instant responses for employees & admins</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Info className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>AI Chat Support Details</DialogTitle>
                      <DialogDescription>
                        Our AI assistant is available 24/7 to help with:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Course navigation and progress tracking</li>
                          <li>Login and account access issues</li>
                          <li>Training plan questions</li>
                          <li>Compliance requirement clarification</li>
                          <li>Platform feature explanations</li>
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground">
                          Access the AI chat from the bottom-right corner of your screen when logged into the client portal.
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Live Human Support Tile */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-8 h-8 text-warning-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  📞 Talk to a Real Person
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Need help with your training, billing, or onboarding? Our California-based support team is just a call or chat away.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Business hours: Mon-Fri 8AM-6PM PST</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Available for client administrators</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Info className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Live Human Support Details</DialogTitle>
                      <DialogDescription>
                        Our California-based support team can help with:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Complex training setup and customization</li>
                          <li>Billing and subscription management</li>
                          <li>Onboarding new team members</li>
                          <li>Integration with existing HR systems</li>
                          <li>Custom compliance reporting</li>
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground">
                          <strong>Phone:</strong> 888-843-0880<br />
                          <strong>Email:</strong> support@easelearn.com<br />
                          <strong>Live Chat:</strong> Available for admin users in the client portal
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-6 bg-muted rounded-full px-8 py-4">
              <button 
                onClick={() => window.open('tel:888-843-0880', '_self')}
                className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-semibold">888-843-0880</span>
              </button>
              <div className="w-px h-6 bg-border"></div>
              <button 
                onClick={() => window.open('mailto:support@easelearn.com', '_self')}
                className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-semibold">support@easelearn.com</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Modernize Your Training?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the companies choosing Easelearn for smarter, more effective workplace safety training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              onClick={() => window.open('https://easelearn.com/pricing', '_blank')}
            >
              Get Instant Pricing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-gray-900"
            >
              See It In Action
            </Button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo size="md" className="brightness-0 invert" />
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise-grade HR risk assessment and learning management platform trusted by Fortune 500 companies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Enterprise Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/integrations" className="hover:text-white">Fortune 500 Integrations</a></li>
                <li><a href="/crm" className="hover:text-white">Advanced CRM & Sales Pipeline</a></li>
                <li><a href="/analytics" className="hover:text-white">Real-time Analytics & BI</a></li>
                <li><a href="#" className="hover:text-white">Mobile-First Design</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Security & Compliance</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/sso" className="hover:text-white">SSO & Azure AD Integration</a></li>
                <li><a href="/security" className="hover:text-white">Security Audit & Monitoring</a></li>
                <li><a href="/compliance" className="hover:text-white">Compliance Management</a></li>
                <li><a href="/row-level-security" className="hover:text-white">Row Level Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Sales</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>888-843-0880</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>enterprise@easelearn.com</span>
                </div>
                <div className="mt-4">
                  <a href="/system-architecture" className="text-primary hover:text-white text-sm">
                    View System Architecture →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                <p>&copy; 2024 Easelearn. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <span>🔒 SOC 2 Compliant</span>
                <span>🏢 Fortune 500 Ready</span>
                <span>📱 Mobile Responsive</span>
                <span>⚡ Real-time Integrations</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      
      {/* Course Details Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCourse && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedCourse.name}</DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedCourse.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                {/* Course Info */}
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="secondary">{selectedCourse.category}</Badge>
                  <span className="text-muted-foreground">Duration: {selectedCourse.duration}</span>
                  {selectedCourse.popular && (
                    <Badge className="bg-warning-muted text-warning-foreground">Popular</Badge>
                  )}
                </div>
                
                {/* Learning Objectives */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">Learning Objectives</h4>
                  <ul className="space-y-2">
                    {selectedCourse.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Topics Covered */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">Topics Covered</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCourse.topics.map((topic: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Course Image */}
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={getCourseImage(selectedCourse.name)} 
                    alt={`${selectedCourse.name} training`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="flex-1"
                  >
                    Start This Course
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/pricing')}
                    className="flex-1"
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Feature Details Modal */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-2xl">
          {selectedFeature && featureDetails[selectedFeature] && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{featureDetails[selectedFeature].title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {featureDetails[selectedFeature].description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">Key Benefits</h4>
                  <ul className="space-y-2">
                    {featureDetails[selectedFeature].benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-gray-600">{featureDetails[selectedFeature].details}</p>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button onClick={() => navigate('/pricing')} className="flex-1">
                    Get Pricing
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedFeature(null)} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default Landing;