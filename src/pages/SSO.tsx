import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Settings, Zap, CheckCircle, Key, Lock, Globe } from "lucide-react";

const SSO = () => {
  const navigate = useNavigate();

  const providers = [
    {
      name: "Azure Active Directory",
      description: "Microsoft's enterprise identity platform with advanced security features.",
      features: ["Conditional Access", "Multi-Factor Authentication", "Group-based Access", "Seamless Office 365 Integration"],
      logo: "🔷"
    },
    {
      name: "Okta",
      description: "Leading identity and access management platform for enterprise organizations.",
      features: ["Universal Directory", "Adaptive MFA", "Lifecycle Management", "API Access Management"],
      logo: "⭕"
    },
    {
      name: "Google Workspace",
      description: "Google's enterprise identity solution with integrated productivity tools.",
      features: ["Cloud Identity", "2-Step Verification", "Admin Console", "Device Management"],
      logo: "🟢"
    },
    {
      name: "Ping Identity",
      description: "Enterprise-grade identity solutions for complex organizational needs.",
      features: ["PingOne Cloud", "PingFederate", "Risk-based Authentication", "Identity Governance"],
      logo: "🟡"
    },
    {
      name: "OneLogin",
      description: "Cloud-based identity and access management for modern enterprises.",
      features: ["SmartFactor Authentication", "Desktop SSO", "User Provisioning", "Access Insights"],
      logo: "🔵"
    },
    {
      name: "Auth0",
      description: "Flexible identity platform for developers and enterprise teams.",
      features: ["Universal Login", "Passwordless Authentication", "Social Connections", "Rules Engine"],
      logo: "🟠"
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Enhanced Security",
      description: "Centralized authentication reduces password fatigue and improves security posture.",
      details: ["Reduced password reuse", "Centralized security policies", "Advanced threat detection", "Compliance alignment"]
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Improved User Experience",
      description: "One-click access to all applications eliminates login friction for employees.",
      details: ["Single sign-on experience", "Reduced support tickets", "Faster onboarding", "Mobile-friendly access"]
    },
    {
      icon: <Settings className="w-8 h-8 text-purple-600" />,
      title: "Simplified Administration",
      description: "Centralized user management with automated provisioning and deprovisioning.",
      details: ["Automated user lifecycle", "Group-based permissions", "Audit trails", "Compliance reporting"]
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: "Increased Productivity",
      description: "Employees spend less time on authentication and more time on productive work.",
      details: ["Reduced login time", "Seamless app switching", "Mobile accessibility", "Offline capabilities"]
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
              SSO & Azure AD Integration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Seamlessly integrate with your existing identity infrastructure. Support for all major 
              SSO providers including Azure AD, Okta, Google Workspace, and more.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>SAML 2.0 & OAuth 2.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span>5-Minute Setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSO Providers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Supported Identity Providers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with the identity platform your organization already uses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{provider.logo}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{provider.name}</h3>
                  <p className="text-gray-600 text-sm">{provider.description}</p>
                </div>
                <div className="space-y-2">
                  {provider.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="text-sm text-gray-500 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose SSO Integration?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your organization's authentication experience with enterprise-grade SSO integration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {benefit.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 mb-4">{benefit.description}</p>
                    <ul className="space-y-1">
                      {benefit.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {detail}
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

      {/* Technical Details */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Technical Implementation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry-standard protocols with enterprise-grade security and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">SAML 2.0</h3>
              <p className="text-gray-600 text-sm mb-4">Security Assertion Markup Language for secure web browser SSO.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Identity Provider (IdP) initiated</li>
                <li>• Service Provider (SP) initiated</li>
                <li>• Encrypted assertions</li>
                <li>• Attribute mapping</li>
              </ul>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">OAuth 2.0</h3>
              <p className="text-gray-600 text-sm mb-4">Modern authorization framework for secure API access.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Authorization Code flow</li>
                <li>• JWT tokens</li>
                <li>• Refresh token rotation</li>
                <li>• Scope-based access</li>
              </ul>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">OpenID Connect</h3>
              <p className="text-gray-600 text-sm mb-4">Identity layer on top of OAuth 2.0 for authentication.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Identity tokens</li>
                <li>• UserInfo endpoint</li>
                <li>• Discovery protocol</li>
                <li>• Session management</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get up and running with SSO in minutes, not days.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Configuration</h3>
              <p className="text-gray-600 text-sm">Configure your identity provider settings in our admin panel.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Integration</h3>
              <p className="text-gray-600 text-sm">Connect your SSO provider using our pre-built integrations.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Testing</h3>
              <p className="text-gray-600 text-sm">Test the integration with your IT team before going live.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">4</div>
              <h3 className="font-semibold text-gray-900 mb-2">Deployment</h3>
              <p className="text-gray-600 text-sm">Roll out SSO to your entire organization with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Implement SSO?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of organizations who have streamlined their authentication with our SSO solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Start SSO Setup
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Talk to Integration Expert
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SSO;