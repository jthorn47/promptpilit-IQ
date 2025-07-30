import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProposalPreview from '@/components/proposals/ProposalPreview';

// Sample data for demonstration
const sampleCompany = {
  id: 'sample-company-id',
  company_name: 'TechFlow Solutions Inc.',
  max_employees: 85,
  primary_color: '#2563EB',
  company_logo_url: '/placeholder.svg'
};

const sampleAssessment = {
  id: 'sample-assessment-id',
  company_name: 'TechFlow Solutions Inc.',
  risk_score: 72,
  risk_level: 'medium',
  responses: {
    compliance_areas: ['Employment Law', 'Benefits Administration', 'Safety Regulations'],
    current_challenges: ['Manual HR processes', 'Inconsistent policies', 'Compliance tracking'],
    priority_areas: ['Policy standardization', 'Training programs', 'Benefits optimization']
  }
};

const sampleInvestmentResults = {
  currentCosts: {
    hrStaffCosts: 156000, // 2 HR staff @ $60k + overhead
    benefitsAdminCosts: 12750, // $150 per employee
    complianceCosts: 18400, // Higher due to medium risk
    trainingCosts: 17000, // $200 per employee  
    systemsCosts: 8500, // HRIS and other systems
    totalCosts: 212650
  },
  proposedCosts: {
    monthlyServiceFee: 6325, // Base + per employee fees
    implementationCost: 7500,
    totalFirstYear: 83400, // (6325 * 12) + 7500
    ongoingAnnual: 75900 // 6325 * 12
  },
  savings: {
    firstYearSavings: 129250, // 212650 - 83400
    ongoingAnnualSavings: 136750, // 212650 - 75900
    threeYearSavings: 402750, // (212650 * 3) - (83400 + 75900 * 2)
    roiPercentage: 155.0, // (129250 / 83400) * 100
    paybackMonths: 4.3 // Implementation cost recovery time
  }
};

const sampleProposalData = {
  title: 'Comprehensive HR Services Proposal - TechFlow Solutions',
  company_id: 'sample-company-id',
  include_investment_analysis: true,
  include_risk_assessment: true,
  include_recommendations: true,
  status: 'draft',
  created_at: new Date().toISOString(),
  version: 1,
  proposal_data: {
    executive_summary: "Custom executive summary content",
    service_details: "Detailed service descriptions",
    implementation_timeline: "90-day implementation plan"
  },
  brand_settings: {
    primary_color: '#2563EB',
    show_logo: true,
    show_company_info: true
  },
  financial_data: sampleInvestmentResults
};

export default function SampleProposal() {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleExportSample = () => {
    // Create sample export functionality
    const proposalContent = document.getElementById('sample-proposal-content');
    if (proposalContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Sample Proposal - TechFlow Solutions</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .cost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .cost-item { display: flex; justify-content: space-between; padding: 5px 0; }
                .total { font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; }
                .savings-highlight { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${proposalContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleFullScreen}>
              Exit Full Screen
            </Button>
            <h1 className="text-lg font-semibold">Sample Proposal Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportSample}>
              Export Sample
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/proposals')}>
              Back to Proposals
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div id="sample-proposal-content">
            <ProposalPreview
              proposalData={sampleProposalData}
              company={sampleCompany}
              assessment={sampleAssessment}
              investmentResults={sampleInvestmentResults}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/proposals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sample Complete Proposal</h1>
            <p className="text-muted-foreground">
              A comprehensive example showcasing all PropGEN features
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportSample}>
            Export Sample
          </Button>
          <Button onClick={handleFullScreen}>
            Full Screen Preview
          </Button>
        </div>
      </div>

      {/* Sample Proposal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Company Profile</h3>
          <p className="text-sm text-blue-700">
            {sampleCompany.max_employees} employees<br/>
            Technology sector<br/>
            Medium compliance risk
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Projected Savings</h3>
          <p className="text-sm text-green-700">
            First Year: $129,250<br/>
            Annual: $136,750<br/>
            ROI: 155%
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Risk Assessment</h3>
          <p className="text-sm text-purple-700">
            Score: 72/100<br/>
            Level: Medium Risk<br/>
            Key areas identified
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">Services Included</h3>
          <p className="text-sm text-orange-700">
            HRO + LMS + Benefits<br/>
            Compliance Support<br/>
            4.3 month payback
          </p>
        </div>
      </div>

      {/* Key Features Demonstrated */}
      <div className="bg-muted/50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Features Demonstrated in This Sample</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium">Investment Analysis Calculator</h4>
              <p className="text-sm text-muted-foreground">
                Complete financial modeling with current vs. proposed costs, ROI calculations, and savings projections
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium">Risk Assessment Integration</h4>
              <p className="text-sm text-muted-foreground">
                Automated risk scoring and compliance analysis with tailored recommendations
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium">Service Recommendations</h4>
              <p className="text-sm text-muted-foreground">
                Customized service packages based on company size, industry, and risk profile
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium">Brand Customization</h4>
              <p className="text-sm text-muted-foreground">
                Company logos, colors, and branding automatically integrated throughout
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium">Professional Formatting</h4>
              <p className="text-sm text-muted-foreground">
                Print-ready layout with export capabilities for PDF and Word formats
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium">Data-Driven Insights</h4>
              <p className="text-sm text-muted-foreground">
                Real calculations based on industry benchmarks and company-specific data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Preview */}
      <div id="sample-proposal-content">
        <ProposalPreview
          proposalData={sampleProposalData}
          company={sampleCompany}
          assessment={sampleAssessment}
          investmentResults={sampleInvestmentResults}
        />
      </div>
    </div>
  );
}