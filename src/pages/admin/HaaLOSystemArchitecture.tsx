import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Calculator, 
  CreditCard, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  UserCheck, 
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  Lightbulb,
  Target,
  Database,
  Cloud,
  Smartphone,
  Brain,
  Handshake,
  HelpCircle,
  FileCheck,
  Bell,
  Timer,
  Award,
  Heart,
  Archive,
  Cpu,
  Rocket
} from "lucide-react";

const currentModules = [
  {
    name: "HaaLOcalc",
    description: "Payroll calculation engine with state-specific compliance",
    icon: Calculator,
    status: "Live",
    version: "2.1",
    features: ["Multi-state compliance", "Real-time calculations", "Tax automation"]
  },
  {
    name: "HaaLOfiling", 
    description: "Automated tax filing and compliance management",
    icon: FileText,
    status: "Live", 
    version: "1.8",
    features: ["Federal & state filing", "Quarterly reports", "Penalty prevention"]
  },
  {
    name: "HaaLOpay",
    description: "Payment processing and disbursement platform", 
    icon: CreditCard,
    status: "Live",
    version: "1.5",
    features: ["ACH processing", "Direct deposit", "Multi-bank support"]
  },
  {
    name: "HaaLOadmin",
    description: "Administrative control center and workflow automation",
    icon: Settings,
    status: "Live", 
    version: "3.0",
    features: ["Workflow automation", "Client management", "Role-based access"]
  },
  {
    name: "HaaLOdata",
    description: "Business intelligence and predictive analytics",
    icon: BarChart3,
    status: "Live",
    version: "1.0", 
    features: ["Executive dashboards", "Predictive modeling", "Client health scoring"]
  },
  {
    name: "HaaLOsecure",
    description: "Security and compliance monitoring",
    icon: Shield,
    status: "Beta",
    version: "0.9",
    features: ["SOC 2 compliance", "Data encryption", "Audit trails"]
  },
  {
    name: "HaaLOboard",
    description: "Employee self-service portal",
    icon: Users,
    status: "Live",
    version: "2.3",
    features: ["Pay stubs", "Tax documents", "Benefits enrollment"]
  },
  {
    name: "HaaLOclient",
    description: "Client dashboard and reporting suite",
    icon: UserCheck,
    status: "Live", 
    version: "1.7",
    features: ["Real-time reports", "Client portal", "Custom dashboards"]
  },
  {
    name: "HaaLOsync",
    description: "Integration hub for third-party systems",
    icon: Zap,
    status: "Live",
    version: "1.2",
    features: ["API gateway", "Webhook management", "Data synchronization"]
  }
];

const futurePhases = [
  {
    phase: "21",
    name: "HaaLOvault",
    description: "Smart document storage & compliance repository",
    icon: Archive,
    timeline: "Q2 2025",
    priority: "High"
  },
  {
    phase: "22", 
    name: "HaaLOhelp",
    description: "AI + human support center for clients",
    icon: HelpCircle,
    timeline: "Q2 2025",
    priority: "High"
  },
  {
    phase: "23",
    name: "HaaLOblueprint", 
    description: "Proposal engine (optional module)",
    icon: FileCheck,
    timeline: "Q3 2025",
    priority: "Medium"
  },
  {
    phase: "24",
    name: "HaaLOpulse",
    description: "Real-time notifications, comms, alerts",
    icon: Bell,
    timeline: "Q3 2025", 
    priority: "High"
  },
  {
    phase: "25",
    name: "HaaLOtrack",
    description: "Employee time + attendance (lightweight or full T&A)",
    icon: Timer,
    timeline: "Q4 2025",
    priority: "Medium"
  },
  {
    phase: "26",
    name: "HaaLOcomply",
    description: "Compliance manager (I-9, EEOC, OSHA)",
    icon: Shield,
    timeline: "Q4 2025",
    priority: "High"
  },
  {
    phase: "27",
    name: "HaaLObenefits",
    description: "Basic benefits module or integration layer", 
    icon: Heart,
    timeline: "Q1 2026",
    priority: "Medium"
  },
  {
    phase: "28",
    name: "HaaLOassist",
    description: "HR concierge services (in-house or partner-delivered)",
    icon: Handshake,
    timeline: "Q1 2026",
    priority: "Low"
  },
  {
    phase: "29",
    name: "HaaLOlabs",
    description: "Innovation sandbox for add-ons (AI agents, chat-based payroll, ML experiments)",
    icon: Brain,
    timeline: "Q2 2026", 
    priority: "Medium"
  },
  {
    phase: "30",
    name: "HaaLOedge",
    description: "Mobile-first / next-gen client & employee portals",
    icon: Smartphone,
    timeline: "Q3 2026",
    priority: "High"
  }
];

const architecturePrinciples = [
  {
    title: "Microservices Architecture",
    description: "Each HaaLO module operates as an independent service with clear APIs",
    icon: Cpu
  },
  {
    title: "Cloud-Native Design", 
    description: "Built for scalability, reliability, and multi-tenant deployment",
    icon: Cloud
  },
  {
    title: "API-First Approach",
    description: "Every feature accessible via REST APIs for maximum integration flexibility", 
    icon: Zap
  },
  {
    title: "Security by Design",
    description: "End-to-end encryption, zero-trust architecture, SOC 2 compliance",
    icon: Shield
  }
];

export default function HaaLOSystemArchitecture() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <img 
            src="/lovable-uploads/438db28b-3492-43f0-8609-ce63c778e329.png" 
            alt="HaaLO Logo" 
            className="h-12 sm:h-16 w-auto"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HaaLO System Architecture
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              Comprehensive Platform for Human Resources & Payroll Operations
            </p>
          </div>
        </div>
      </motion.div>

      {/* Architecture Principles */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Architecture Principles
            </CardTitle>
            <CardDescription>
              Core design principles that drive the HaaLO platform development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {architecturePrinciples.map((principle) => (
                <Card key={principle.title} className="border-border/50">
                  <CardContent className="p-4 text-center space-y-2">
                    <principle.icon className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="font-semibold text-sm sm:text-base">{principle.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{principle.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Current Modules */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Production Modules (1-20)
            </CardTitle>
            <CardDescription>
              Active HaaLO modules currently serving clients in production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {currentModules.map((module) => (
                <motion.div
                  key={module.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <module.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={module.status === 'Live' ? 'default' : 'secondary'}>
                                {module.status}
                              </Badge>
                              <Badge variant="outline">v{module.version}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {module.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Key Features:</h4>
                        <ul className="text-xs space-y-1">
                          {module.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <Separator />

      {/* Roadmap */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-500" />
              Proposed Future Phases (21-30+)
            </CardTitle>
            <CardDescription>
              Strategic roadmap for expanding the HaaLO ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Timeline visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {futurePhases.map((phase, index) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Card className="border-border/50 hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm md:text-base">
                              {phase.phase}
                            </div>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-base md:text-lg flex items-center gap-2">
                                  <phase.icon className="h-4 w-4 md:h-5 md:w-5" />
                                  {phase.name}
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                  {phase.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {phase.timeline}
                              </Badge>
                              <Badge 
                                variant={
                                  phase.priority === 'High' ? 'destructive' : 
                                  phase.priority === 'Medium' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {phase.priority} Priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Integration Architecture */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Flow & Integration Architecture
            </CardTitle>
            <CardDescription>
              How HaaLO modules communicate and share data securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6 text-center space-y-4">
                    <Database className="h-10 w-10 md:h-12 md:w-12 mx-auto text-primary" />
                    <h3 className="font-semibold text-sm md:text-base">Core Data Layer</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Centralized data warehouse with module-specific databases
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6 text-center space-y-4">
                    <Zap className="h-10 w-10 md:h-12 md:w-12 mx-auto text-primary" />
                    <h3 className="font-semibold text-sm md:text-base">API Gateway</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Unified API layer for authentication, routing, and rate limiting
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6 text-center space-y-4">
                    <Bell className="h-10 w-10 md:h-12 md:w-12 mx-auto text-primary" />
                    <h3 className="font-semibold text-sm md:text-base">Event Bus</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Real-time messaging between modules for data synchronization
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6 md:p-8 text-center space-y-4">
            <Lightbulb className="h-10 w-10 md:h-12 md:w-12 mx-auto text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">Ready to Build the Future?</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              The HaaLO platform represents the next generation of HR and payroll technology. 
              Each module is designed to work independently while contributing to a unified ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                View Implementation Details
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Download Architecture Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}