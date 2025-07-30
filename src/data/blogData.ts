import { 
  Shield,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  UserCheck,
  Building2
} from "lucide-react";
import { createElement } from "react";

export const featuredPost = {
  title: "5 Critical Steps to Implement Effective Workplace Violence Prevention",
  excerpt: "Workplace violence costs organizations billions annually. Learn how to create a comprehensive prevention program that protects your employees and reduces liability.",
  author: "Sarah Mitchell, Workplace Safety Expert",
  date: "December 10, 2024",
  readTime: "8 min read",
  category: "Workplace Safety",
  image: "/api/placeholder/800/400",
  featured: true
};

export const blogPosts = [
  {
    title: "Understanding California's New Workplace Violence Prevention Requirements",
    excerpt: "California SB 553 requires most employers to establish workplace violence prevention plans. Here's what you need to know to stay compliant.",
    author: "Jennifer Adams, Employment Attorney",
    date: "December 5, 2024",
    readTime: "6 min read",
    category: "Compliance",
    icon: createElement(Shield, { className: "w-5 h-5" })
  },
  {
    title: "What is a PEO? Everything You Need to Know",
    excerpt: "Professional employer organizations (PEOs) have become the best-kept secret of SMBs. 98% of business owners enthusiastically recommend PEO services to peers.",
    author: "Easeworks Team",
    date: "November 30, 2024",
    readTime: "12 min read",
    category: "HR Solutions",
    icon: createElement(Building2, { className: "w-5 h-5" })
  },
  {
    title: "What are PAGA Claims and How Should You Respond?",
    excerpt: "California's Private Attorneys General Act (PAGA) allows employees to sue employers for labor violations. Learn how to identify and respond to PAGA claims.",
    author: "Legal Team, Easeworks",
    date: "November 25, 2024",
    readTime: "10 min read",
    category: "Legal Compliance",
    icon: createElement(Shield, { className: "w-5 h-5" })
  },
  {
    title: "How to Launch a Profitable Remote Staffing Agency",
    excerpt: "Step-by-step guide to building a successful remote staffing business. From setup to scaling, discover the strategies that lead to profitability.",
    author: "Business Development Team",
    date: "November 22, 2024",
    readTime: "15 min read",
    category: "Business Growth",
    icon: createElement(UserCheck, { className: "w-5 h-5" })
  },
  {
    title: "Mastering De-Escalation Techniques for Public-Facing Employees",
    excerpt: "Essential de-escalation strategies for public sector employees dealing with frustrated citizens. Practical techniques for maintaining professionalism under pressure.",
    author: "Training Specialists",
    date: "November 18, 2024",
    readTime: "8 min read",
    category: "Employee Training",
    icon: createElement(Users, { className: "w-5 h-5" })
  },
  {
    title: "Creating Psychological Safety: The Foundation of Harassment Prevention",
    excerpt: "Beyond compliance training, learn how to build a workplace culture where employees feel safe to speak up and report concerning behavior.",
    author: "Dr. Michael Roberts, HR Consultant",
    date: "November 15, 2024",
    readTime: "10 min read",
    category: "Culture",
    icon: createElement(Users, { className: "w-5 h-5" })
  },
  {
    title: "The Hidden Costs of Inadequate Training: A Case Study Analysis",
    excerpt: "Real-world examples demonstrate how insufficient workplace training can lead to costly legal battles, decreased productivity, and damaged reputation.",
    author: "Lisa Chen, Risk Management Specialist",
    date: "November 12, 2024",
    readTime: "7 min read",
    category: "Risk Management",
    icon: createElement(TrendingUp, { className: "w-5 h-5" })
  },
  {
    title: "Interactive Learning vs. Traditional Training: Engagement and Retention Rates",
    excerpt: "Research shows interactive training modules increase retention by 75%. Discover why scenario-based learning outperforms traditional methods.",
    author: "Dr. Amanda Taylor, Learning Designer",
    date: "November 8, 2024",
    readTime: "9 min read",
    category: "Training Methods",
    icon: createElement(BookOpen, { className: "w-5 h-5" })
  },
  {
    title: "De-escalation Techniques Every Employee Should Know",
    excerpt: "Practical strategies for diffusing tense situations before they escalate into workplace violence. Essential skills for creating a safer work environment.",
    author: "Officer James Rodriguez, Crisis Intervention Specialist",
    date: "November 5, 2024",
    readTime: "12 min read",
    category: "Safety Skills",
    icon: createElement(AlertTriangle, { className: "w-5 h-5" })
  },
  {
    title: "Building an Effective Incident Reporting System",
    excerpt: "Step-by-step guide to creating a reporting system that encourages transparency while protecting both employees and the organization.",
    author: "Maria Gonzalez, Compliance Officer",
    date: "October 30, 2024",
    readTime: "8 min read",
    category: "Systems",
    icon: createElement(CheckCircle, { className: "w-5 h-5" })
  }
];

export const categories = [
  "All Posts",
  "Workplace Safety",
  "Compliance",
  "Training Methods",
  "Culture",
  "Risk Management",
  "Safety Skills",
  "Systems",
  "HR Solutions",
  "Legal Compliance",
  "Business Growth",
  "Employee Training"
];