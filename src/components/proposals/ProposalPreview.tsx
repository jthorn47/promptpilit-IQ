import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Building2, 
  Calculator,
  Shield,
  Lightbulb,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';

interface ProposalData {
  title: string;
  company_id: string;
  include_investment_analysis: boolean;
  include_risk_assessment: boolean;
  include_recommendations: boolean;
  proposal_data: any;
  brand_settings: {
    primary_color: string;
    show_logo: boolean;
    show_company_info: boolean;
  };
  financial_data: any;
  status?: string;
  created_at?: string;
  version?: number;
}

interface Company {
  id: string;
  company_name: string;
  max_employees: number;
  primary_color: string;
  company_logo_url?: string;
}

interface Assessment {
  id: string;
  company_name: string;
  risk_score: number;
  risk_level: string;
  responses: any;
}

interface ProposalPreviewProps {
  proposalData: ProposalData;
  company?: Company;
  assessment?: Assessment;
  investmentResults?: any;
}

export default function ProposalPreview({
  proposalData,
  company,
  assessment,
  investmentResults
}: ProposalPreviewProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleExport = (format: 'pdf' | 'word') => {
    console.log(`Exporting proposal as ${format}`);
    // TODO: Implement export functionality
  };

  const handleShare = () => {
    console.log('Sharing proposal');
    // TODO: Implement share functionality
  };

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={proposalData.status === 'sent' ? 'default' : 'secondary'}>
                {proposalData.status || 'Draft'}
              </Badge>
              {proposalData.version && (
                <span className="text-sm text-muted-foreground">
                  Version {proposalData.version}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('word')}>
                <FileText className="h-4 w-4 mr-2" />
                Word
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Document */}
      <Card className="proposal-preview">
        <CardContent className="p-8" style={{ '--brand-color': proposalData.brand_settings.primary_color } as any}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/placeholder.svg" 
                alt="Easeworks Logo" 
                className="h-12"
              />
              {company?.company_logo_url && proposalData.brand_settings.show_logo && (
                <>
                  <span className="text-2xl text-muted-foreground">+</span>
                  <img 
                    src={company.company_logo_url} 
                    alt={`${company.company_name} Logo`}
                    className="h-12"
                  />
                </>
              )}
            </div>
            
            <h1 className="text-4xl font-bold mb-2" style={{ color: proposalData.brand_settings.primary_color }}>
              {proposalData.title}
            </h1>
            
            {company && (
              <p className="text-xl text-muted-foreground">
                Prepared for {company.company_name}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground mt-4">
              {proposalData.created_at && formatDate(proposalData.created_at)}
            </p>
          </div>

          <Separator className="my-8" />

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6" style={{ color: proposalData.brand_settings.primary_color }} />
              Executive Summary
            </h2>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-lg leading-relaxed">
                Easeworks is pleased to present this comprehensive HR service proposal for {company?.company_name}. 
                With {company?.max_employees} employees, your organization requires strategic HR support to ensure 
                compliance, optimize operations, and drive business growth.
              </p>
              
              <p>
                This proposal outlines our tailored approach to addressing your HR challenges through our integrated 
                suite of services, delivering measurable value and peace of mind for your leadership team.
              </p>
            </div>
          </section>

          {/* Investment Analysis Section */}
          {proposalData.include_investment_analysis && investmentResults && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="h-6 w-6" style={{ color: proposalData.brand_settings.primary_color }} />
                Investment Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3 text-red-800">Current HR Costs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>HR Staff & Overhead</span>
                      <span className="font-medium">{formatCurrency(investmentResults.currentCosts.hrStaffCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Benefits Administration</span>
                      <span className="font-medium">{formatCurrency(investmentResults.currentCosts.benefitsAdminCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance & Legal</span>
                      <span className="font-medium">{formatCurrency(investmentResults.currentCosts.complianceCosts)}</span>
                    </div>
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total Annual</span>
                        <span>{formatCurrency(investmentResults.currentCosts.totalCosts)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3 text-green-800">Easeworks Investment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Service Fee</span>
                      <span className="font-medium">{formatCurrency(investmentResults.proposedCosts.monthlyServiceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Implementation (One-time)</span>
                      <span className="font-medium">{formatCurrency(investmentResults.proposedCosts.implementationCost)}</span>
                    </div>
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Annual Cost</span>
                        <span>{formatCurrency(investmentResults.proposedCosts.ongoingAnnual)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-4 text-blue-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Investment Returns
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(investmentResults.savings.firstYearSavings)}
                    </div>
                    <div className="text-sm text-muted-foreground">First Year Savings</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {investmentResults.savings.roiPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">ROI</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {investmentResults.savings.paybackMonths.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Payback (Months)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(investmentResults.savings.threeYearSavings)}
                    </div>
                    <div className="text-sm text-muted-foreground">3-Year Savings</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Risk Assessment Section */}
          {proposalData.include_risk_assessment && assessment && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6" style={{ color: proposalData.brand_settings.primary_color }} />
                HR Risk Assessment
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Overall Risk Profile</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Risk Score:</span>
                    <Badge 
                      variant={assessment.risk_level === 'high' ? 'destructive' : 
                               assessment.risk_level === 'medium' ? 'default' : 'secondary'}
                      className="text-lg px-3 py-1"
                    >
                      {assessment.risk_score}/100
                    </Badge>
                    <Badge 
                      variant={assessment.risk_level === 'high' ? 'destructive' : 'default'}
                      className="capitalize"
                    >
                      {assessment.risk_level} Risk
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Based on our comprehensive assessment, your organization shows {assessment.risk_level} risk 
                  across key HR compliance areas. Our services are designed to mitigate these risks and 
                  ensure full regulatory compliance.
                </p>
              </div>
            </section>
          )}

          {/* Service Recommendations */}
          {proposalData.include_recommendations && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="h-6 w-6" style={{ color: proposalData.brand_settings.primary_color }} />
                Recommended Services
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Human Resources Outsourcing (HRO)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Comprehensive HR support including policy development, employee relations, 
                      and strategic HR planning.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Dedicated HR Consultant</li>
                      <li>• Employee Handbook Development</li>
                      <li>• Performance Management Systems</li>
                      <li>• HR Compliance Audits</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Management System (LMS)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete training solution with compliance tracking and 
                      employee development programs.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Compliance Training Library</li>
                      <li>• Custom Training Development</li>
                      <li>• Progress Tracking & Reporting</li>
                      <li>• Mobile Learning Platform</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Benefits Administration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Streamlined benefits management with employee self-service 
                      and compliance support.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Benefits Enrollment Platform</li>
                      <li>• COBRA Administration</li>
                      <li>• FSA/HSA Management</li>
                      <li>• Benefits Communication</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Stay current with ever-changing employment laws and 
                      regulatory requirements.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Employment Law Updates</li>
                      <li>• Policy Template Library</li>
                      <li>• Audit & Risk Assessments</li>
                      <li>• Legal Support Network</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Next Steps */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6" style={{ color: proposalData.brand_settings.primary_color }} />
              Next Steps
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Proposal Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Review this proposal with your leadership team and let us know if you have any questions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Discovery Call</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule a detailed discovery call to discuss your specific requirements and customize our approach.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Contract & Implementation</h4>
                  <p className="text-sm text-muted-foreground">
                    Finalize the service agreement and begin the seamless implementation process.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t pt-6">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-4">
                Contact us today to discuss how Easeworks can transform your HR operations.
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Jeffrey Thorn, CEO</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧 jeffrey@easeworks.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}