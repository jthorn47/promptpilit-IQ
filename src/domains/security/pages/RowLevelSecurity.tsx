import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Database, Users, Eye, Key, Settings, CheckCircle } from "lucide-react";

const RowLevelSecurity = () => {
  const navigate = useNavigate();

  const securityLayers = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "User-Based Access Control",
      description: "Every user can only access data they own or are explicitly granted permission to view.",
      features: ["Individual User Isolation", "Role-Based Permissions", "Dynamic Access Rules", "Session-Based Security"]
    },
    {
      icon: <Database className="w-8 h-8 text-green-600" />,
      title: "Data Compartmentalization",
      description: "Data is automatically segmented at the database level to prevent unauthorized cross-access.",
      features: ["Company Data Isolation", "Department Segregation", "Project-Level Security", "Geographic Restrictions"]
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Policy Enforcement",
      description: "Automated enforcement of security policies with real-time validation and audit logging.",
      features: ["Automated Policy Checks", "Real-time Validation", "Audit Trail Generation", "Violation Alerts"]
    },
    {
      icon: <Eye className="w-8 h-8 text-orange-600" />,
      title: "Granular Visibility",
      description: "Fine-grained control over what data users can see, edit, or share within the platform.",
      features: ["Field-Level Security", "Conditional Visibility", "Time-Based Access", "Context-Aware Permissions"]
    }
  ];

  const useCases = [
    {
      title: "Multi-Tenant Organizations",
      description: "Perfect for organizations managing multiple companies, departments, or subsidiaries.",
      icon: "🏢",
      benefits: ["Complete data isolation between tenants", "Shared resources with proper access controls", "Centralized management with distributed security"]
    },
    {
      title: "Healthcare & HIPAA",
      description: "Ensure patient data privacy with automatic PHI protection and access logging.",
      icon: "🏥",
      benefits: ["HIPAA-compliant data access", "Patient consent management", "Provider-specific data views"]
    },
    {
      title: "Financial Services",
      description: "Meet strict financial regulations with comprehensive audit trails and data protection.",
      icon: "🏦",
      benefits: ["SOX compliance support", "Customer data protection", "Regulatory audit readiness"]
    },
    {
      title: "Education Systems",
      description: "Protect student records while enabling appropriate access for educators and administrators.",
      icon: "🎓",
      benefits: ["FERPA compliance", "Grade privacy protection", "Parent-teacher access controls"]
    }
  ];

  const technicalFeatures = [
    {
      icon: <Key className="w-6 h-6 text-blue-600" />,
      title: "JWT-Based Authentication",
      description: "Secure token-based authentication with automatic user context injection."
    },
    {
      icon: <Database className="w-6 h-6 text-green-600" />,
      title: "PostgreSQL RLS Policies",
      description: "Native database-level security policies that can't be bypassed."
    },
    {
      icon: <Settings className="w-6 h-6 text-purple-600" />,
      title: "Dynamic Policy Engine",
      description: "Flexible policy system that adapts to your organizational structure."
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: "Zero-Trust Architecture",
      description: "Every request is validated regardless of source or user privileges."
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
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Row Level Security (RLS)
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Database-level security that ensures users can only access data they're authorized to see. 
              Built on PostgreSQL's native Row Level Security with enterprise-grade policy management.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Database-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Zero-Trust Architecture</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-purple-500" />
                <span>Automatic Enforcement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Row Level Security Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Security policies are enforced at the database level, making them impossible to bypass.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityLayers.map((layer, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                      {layer.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{layer.title}</h3>
                    <p className="text-gray-600 mb-4">{layer.description}</p>
                    <ul className="space-y-1">
                      {layer.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {feature}
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

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Industry Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Row Level Security is essential for organizations handling sensitive data across various industries.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-3xl">{useCase.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                    <p className="text-gray-600 mb-4">{useCase.description}</p>
                    <ul className="space-y-2">
                      {useCase.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-sm text-gray-500 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{benefit}</span>
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

      {/* Technical Implementation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Technical Implementation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on proven technologies with enterprise-grade security and performance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Example RLS Policy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here's how a typical Row Level Security policy looks in our system.
            </p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Employee Data Access Policy</CardTitle>
              <CardDescription>
                Users can only view employee records from their own company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`-- Enable RLS on the employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can view own company employees" 
ON employees 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM user_company_access 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for managers
CREATE POLICY "Managers can view direct reports" 
ON employees 
FOR SELECT 
USING (
  manager_id = auth.uid() 
  OR company_id IN (
    SELECT company_id 
    FROM user_company_access 
    WHERE user_id = auth.uid() 
    AND role = 'manager'
  )
);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Row Level Security Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The strongest security happens at the database level where it can't be bypassed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unbypassable Security</h3>
              <p className="text-gray-600 text-sm">Security policies are enforced at the database level, making them impossible to circumvent through application vulnerabilities.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Automatic Enforcement</h3>
              <p className="text-gray-600 text-sm">No need to remember to add security checks in code - the database automatically applies the correct policies to every query.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Visibility</h3>
              <p className="text-gray-600 text-sm">Full audit trails show exactly who accessed what data when, providing complete visibility into data usage patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Secure Your Data with Row Level Security
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Implement database-level security that scales with your organization and protects your most sensitive data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Learn About Implementation
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule Security Review
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RowLevelSecurity;