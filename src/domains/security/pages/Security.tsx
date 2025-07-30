import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle, Users, Database, Globe } from "lucide-react";

const Security = () => {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "24/7 Security Monitoring",
      description: "Continuous monitoring of all system activities with real-time threat detection and automated response protocols.",
      features: ["Real-time Threat Detection", "Automated Incident Response", "Security Event Logging", "Anomaly Detection"]
    },
    {
      icon: <Lock className="w-8 h-8 text-green-600" />,
      title: "Advanced Encryption",
      description: "Military-grade encryption for data at rest and in transit, with secure key management and rotation.",
      features: ["AES-256 Encryption", "TLS 1.3 Protocol", "Key Rotation", "Secure Key Storage"]
    },
    {
      icon: <Eye className="w-8 h-8 text-purple-600" />,
      title: "Audit & Compliance",
      description: "Comprehensive audit trails and compliance reporting to meet regulatory requirements and internal policies.",
      features: ["Complete Audit Trails", "Compliance Reporting", "Data Retention Policies", "Regulatory Alignment"]
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
      title: "Vulnerability Management",
      description: "Proactive security assessments and vulnerability management with regular penetration testing.",
      features: ["Regular Security Scans", "Penetration Testing", "Vulnerability Patching", "Security Assessments"]
    }
  ];

  const certifications = [
    { name: "SOC 2 Type II", description: "Security, availability, and confidentiality controls", status: "Certified" },
    { name: "ISO 27001", description: "Information security management systems", status: "Certified" },
    { name: "GDPR Compliant", description: "European data protection regulation", status: "Compliant" },
    { name: "CCPA Compliant", description: "California Consumer Privacy Act", status: "Compliant" },
    { name: "HIPAA Ready", description: "Healthcare data protection standards", status: "Available" },
    { name: "FedRAMP", description: "Federal risk authorization program", status: "In Progress" }
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
              Security Audit & Monitoring
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Enterprise-grade security infrastructure with continuous monitoring, threat detection, 
              and compliance management to protect your organization's most sensitive data.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>ISO 27001 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-purple-500" />
                <span>Zero Trust Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Security Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multi-layered security architecture designed to protect against evolving threats.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          {item}
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

      {/* Compliance & Certifications */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We maintain the highest standards of compliance to meet regulatory requirements across industries and regions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <Badge 
                    className={`${
                      cert.status === 'Certified' || cert.status === 'Compliant' 
                        ? 'bg-green-100 text-green-800' 
                        : cert.status === 'Available'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {cert.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Zero Trust Security Architecture
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our security model assumes no implicit trust and continuously validates every transaction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Identity Verification</h3>
              <p className="text-gray-600 text-sm mb-4">Multi-factor authentication and continuous identity validation for all users and devices.</p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• Multi-Factor Authentication</li>
                <li>• Single Sign-On (SSO)</li>
                <li>• Privileged Access Management</li>
                <li>• Identity Governance</li>
              </ul>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
              <p className="text-gray-600 text-sm mb-4">End-to-end encryption and data loss prevention with granular access controls.</p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• End-to-End Encryption</li>
                <li>• Data Loss Prevention</li>
                <li>• Access Control Lists</li>
                <li>• Data Classification</li>
              </ul>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Network Security</h3>
              <p className="text-gray-600 text-sm mb-4">Advanced network segmentation and monitoring with real-time threat detection.</p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• Network Segmentation</li>
                <li>• Intrusion Detection</li>
                <li>• DDoS Protection</li>
                <li>• Traffic Analysis</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Metrics */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Security by the Numbers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our security track record speaks for itself with industry-leading metrics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.99%</div>
              <div className="text-white font-semibold mb-2">Uptime SLA</div>
              <div className="text-gray-400 text-sm">Guaranteed system availability</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">0</div>
              <div className="text-white font-semibold mb-2">Data Breaches</div>
              <div className="text-gray-400 text-sm">Zero security incidents to date</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">&lt; 1min</div>
              <div className="text-white font-semibold mb-2">Response Time</div>
              <div className="text-gray-400 text-sm">Average threat response time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-white font-semibold mb-2">Monitoring</div>
              <div className="text-gray-400 text-sm">Continuous security monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready for Enterprise-Grade Security?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Fortune 500 companies who trust us with their most sensitive data and critical operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Request Security Assessment
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Download Security Whitepaper
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Security;