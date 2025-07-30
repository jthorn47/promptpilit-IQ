import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, Clock } from "lucide-react";
import { ClientOnboardingForm } from "@/components/onboarding/ClientOnboardingForm";
import { useToast } from "@/hooks/use-toast";

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const handleFormComplete = () => {
    toast({
      title: "Onboarding Complete",
      description: "Client onboarding profile has been successfully created."
    });
    navigate("/admin/clients");
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-4 px-4 space-y-4 md:py-6 md:space-y-6 max-w-none overflow-x-hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowForm(false)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Button>
          <h1 className="text-xl md:text-3xl font-bold">Client Onboarding Form</h1>
        </div>

        <ClientOnboardingForm 
          clientId={clientId}
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 space-y-4 md:py-6 md:space-y-6 max-w-none overflow-x-hidden">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/admin/clients")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Button>
        <h1 className="text-xl md:text-3xl font-bold">Client Onboarding</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Overview Cards */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowForm(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Start Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Begin the comprehensive client onboarding process with dynamic forms based on service types.
            </p>
            <div className="mt-4">
              <Button className="w-full">
                Create Onboarding Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Service Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">PEO</span>
                <span className="text-xs bg-primary/10 px-2 py-1 rounded">Professional Employer Organization</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ASO</span>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Administrative Services Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payroll</span>
                <span className="text-xs bg-green-100 px-2 py-1 rounded">Payroll Services</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">HRO</span>
                <span className="text-xs bg-purple-100 px-2 py-1 rounded">HR Outsourcing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">LMS</span>
                <span className="text-xs bg-orange-100 px-2 py-1 rounded">Learning Management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Process Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Universal Information</p>
                  <p className="text-xs text-muted-foreground">Company details, contacts, addresses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Service Selection</p>
                  <p className="text-xs text-muted-foreground">Choose applicable service types</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Service-Specific Data</p>
                  <p className="text-xs text-muted-foreground">Complete forms based on selections</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium">Document Upload</p>
                  <p className="text-xs text-muted-foreground">Upload required documents</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Requirements by Service Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div>
              <h4 className="font-semibold text-primary mb-2">PEO Requirements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Workers' Comp Classifications</li>
                <li>• Employee Census (CSV)</li>
                <li>• Benefits Selections</li>
                <li>• Signed Service Agreement</li>
                <li>• Safety/OSHA Contact Info</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">ASO Requirements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• HR Services Needed</li>
                <li>• Employee Roster</li>
                <li>• Employee Handbook</li>
                <li>• HR Point of Contact</li>
                <li>• Compliance Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Payroll Requirements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pay Groups & Schedules</li>
                <li>• Timekeeping Integration</li>
                <li>• Direct Deposit Setup</li>
                <li>• Payroll Authorization Form</li>
                <li>• Benefit Deduction Codes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">HRO Requirements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• HR Consultant Assignment</li>
                <li>• Compliance Services Needed</li>
                <li>• Legal/Labor Attorney Info</li>
                <li>• Union Workforce Status</li>
                <li>• Disciplinary History</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">LMS Requirements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Number of Seats</li>
                <li>• Training Selections</li>
                <li>• LMS Admin Contacts</li>
                <li>• Custom Branding Options</li>
                <li>• Domain Access Preferences</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}