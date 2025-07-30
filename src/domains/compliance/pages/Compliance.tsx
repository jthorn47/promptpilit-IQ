import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileCheck, AlertTriangle, CheckCircle, Calendar, Users, BarChart3, Globe } from "lucide-react";

const Compliance = () => {
  const navigate = useNavigate();

  const complianceFrameworks = [
    {
      name: "California SB 553",
      description: "Workplace Violence Prevention Plan requirements for California employers.",
      requirements: ["Written Prevention Plan", "Employee Training", "Incident Reporting", "Annual Review"],
      status: "Fully Supported",
      category: "State Law"
    },
    {
      name: "California AB 1343",
      description: "Sexual harassment prevention training requirements for California employers.",
      requirements: ["Supervisor Training", "Employee Training", "Biennial Requirements", "Record Keeping"],
      status: "Fully Supported", 
      category: "State Law"
    },
    {
      name: "OSHA Standards",
      description: "Occupational Safety and Health Administration workplace safety requirements.",
      requirements: ["Hazard Communication", "PPE Standards", "Emergency Procedures", "Training Documentation"],
      status: "Fully Supported",
      category: "Federal"
    },
    {
      name: "EEOC Guidelines",
      description: "Equal Employment Opportunity Commission anti-discrimination requirements.",
      requirements: ["Anti-Harassment Policies", "Investigation Procedures", "Training Programs", "Corrective Actions"],
      status: "Fully Supported",
      category: "Federal"
    },
    {
      name: "SOX Compliance",
      description: "Sarbanes-Oxley Act requirements for public companies and contractors.",
      requirements: ["Ethics Training", "Financial Controls", "Whistleblower Protection", "Documentation"],
      status: "Available",
      category: "Corporate"
    },
    {
      name: "Industry Standards",
      description: "Sector-specific compliance requirements for healthcare, finance, and manufacturing.",
      requirements: ["HIPAA Training", "PCI DSS", "FDA Regulations", "Custom Frameworks"],
      status: "Configurable",
      category: "Industry"
    }
  ];

  const features = [
    {
      icon: <FileCheck className="w-8 h-8 text-blue-600" />,
      title: "Automated Compliance Tracking",
      description: "Real-time monitoring of compliance status with automated alerts and reporting.",
      capabilities: ["Real-time Status Dashboard", "Automated Compliance Scoring", "Risk Assessment Tools", "Regulatory Updates"]
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-600" />,
      title: "Training Schedule Management",
      description: "Automated scheduling and reminders for recurring compliance training requirements.",
      capabilities: ["Recurring Training Schedules", "Deadline Management", "Automated Reminders", "Bulk Enrollment"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Compliance Reporting",
      description: "Comprehensive reports for audits, regulatory submissions, and executive review.",
      capabilities: ["Audit-Ready Reports", "Custom Report Builder", "Executive Dashboards", "Export Options"]
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
      title: "Risk Management",
      description: "Proactive identification and mitigation of compliance risks across your organization.",
      capabilities: ["Risk Scoring", "Predictive Analytics", "Remediation Plans", "Incident Tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Compliance Management
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay ahead of regulatory requirements with automated compliance tracking, 
              training management, and reporting. Built for California SB 553, AB 1343, 
              and comprehensive workplace safety compliance.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>California Law Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>OSHA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-purple-500" />
                <span>Multi-State Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Frameworks */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Supported Compliance Frameworks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive coverage of federal, state, and industry-specific compliance requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceFrameworks.map((framework, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      className={`text-xs ${
                        framework.status === 'Fully Supported' 
                          ? 'bg-green-100 text-green-800' 
                          : framework.status === 'Available'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {framework.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {framework.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{framework.description}</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Key Requirements:</h4>
                  {framework.requirements.map((req, reqIndex) => (
                    <div key={reqIndex} className="text-sm text-gray-500 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Compliance Management Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to maintain compliance, from training delivery to audit preparation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.capabilities.map((capability, capIndex) => (
                        <li key={capIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* California Compliance Focus */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for California Compliance
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Purpose-built to handle California's unique workplace safety and harassment prevention requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">SB 553 Workplace Violence Prevention</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Complete solution for California's workplace violence prevention requirements including 
                plan creation, employee training, and incident tracking.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Written prevention plan templates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Employee training certification
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Incident reporting system
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Annual plan review process
                </li>
              </ul>
            </Card>
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AB 1343 Harassment Prevention</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive sexual harassment prevention training that meets all California requirements 
                for supervisors and employees.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Supervisor-specific training (2 hours)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Employee training (1 hour)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Biennial training schedules
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Training record maintenance
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Compliance Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reduce risk, save time, and ensure your organization stays compliant with evolving regulations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reduce Legal Risk</h3>
              <p className="text-gray-600 text-sm">Stay compliant with federal and state regulations to minimize legal exposure and protect your organization.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Administrative Time</h3>
              <p className="text-gray-600 text-sm">Automate compliance tracking, reporting, and training management to free up valuable HR resources.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Audit Readiness</h3>
              <p className="text-gray-600 text-sm">Generate comprehensive audit reports and maintain detailed training records for regulatory inspections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Streamline Your Compliance?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of organizations who have simplified their compliance management with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Compliance Assessment
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              Schedule Compliance Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compliance;