import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Building, Plus, Copy, Eye, Sparkles, History, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Invitation {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  industry: string | null;
  company_size: string | null;
  status: string;
  invited_at: string;
}

export const AdminInvitations = () => {
  const [invitation, setInvitation] = useState({
    companyName: "",
    contactEmail: "",
    contactName: "",
    industry: "",
    companySize: "",
  });
  
  const [generatedInvitation, setGeneratedInvitation] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();

  const industryOptions = [
    "Technology",
    "Healthcare", 
    "Manufacturing",
    "Retail",
    "Finance",
    "Education",
    "Construction",
    "Professional Services",
    "Other"
  ];

  const companySizeOptions = [
    "1-10 employees",
    "11-50 employees", 
    "51-200 employees",
    "201-500 employees",
    "500+ employees"
  ];

  const handleInputChange = (field: string, value: string) => {
    setInvitation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateInvitation = async () => {
    if (!invitation.companyName || !invitation.contactEmail || !invitation.contactName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setShowPreview(false);
    toast({
      title: "Generating invitation...",
      description: "Creating personalized content with AI",
    });

    try {
      // Generate industry-specific content with AI
      const { data, error } = await supabase.functions.invoke('generate-invitation', {
        body: {
          companyName: invitation.companyName,
          contactName: invitation.contactName,
          industry: invitation.industry,
          companySize: invitation.companySize,
        },
      });

      if (error) {
        throw error;
      }

      const aiContent = data.content;
      
      // Generate assessment link
      const assessmentUrl = `${window.location.origin}/assessment`;
      
      // Create the full invitation with AI content
      const fullInvitation = `Subject: 5 Minute HR Risk Assessment for ${invitation.companyName}

To: ${invitation.contactEmail}

${aiContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TAKE YOUR 5 MINUTE HR RISK ASSESSMENT NOW

Assessment Link: ${assessmentUrl}

This quick assessment will help ${invitation.companyName} identify potential HR compliance gaps and receive a detailed report with actionable recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Company Details:
• Company: ${invitation.companyName}
• Contact: ${invitation.contactName}
• Email: ${invitation.contactEmail}
${invitation.industry ? `• Industry: ${invitation.industry}` : ''}
${invitation.companySize ? `• Size: ${invitation.companySize}` : ''}

---
Best regards,
The Easeworks Team
Your HR Business Consulting Partner

For questions or immediate assistance:
📧 info@easeworks.com
🌐 www.easeworks.com`;

      // Save invitation to database
      const { error: saveError } = await supabase
        .from("invitations")
        .insert({
          company_name: invitation.companyName,
          contact_name: invitation.contactName,
          contact_email: invitation.contactEmail,
          industry: invitation.industry || null,
          company_size: invitation.companySize || null,
          generated_content: fullInvitation,
          assessment_url: assessmentUrl,
          status: 'pending'
        });

      if (saveError) {
        console.error("Error saving invitation:", saveError);
        toast({
          title: "Warning",
          description: "Invitation generated but failed to save to database",
          variant: "destructive",
        });
      }

      setGeneratedInvitation(fullInvitation);
      setShowPreview(true);

      toast({
        title: "Invitation Generated & Saved!",
        description: "AI-powered content ready to send and tracked in database",
      });

    } catch (error: any) {
      console.error("Error generating invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedInvitation);
      toast({
        title: "Copied!",
        description: "Invitation content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getDefaultMessage = () => {
    return `Dear ${invitation.contactName || "[Contact Name]"},

We hope this message finds you well. At Easeworks, we specialize in helping companies like ${invitation.companyName || "[Company Name]"} optimize their HR practices and reduce compliance risks.

We would like to invite you to complete our comprehensive HR Risk Assessment. This assessment will help you:

• Identify potential HR compliance gaps
• Understand your current risk level
• Receive personalized recommendations
• Get a detailed AI-generated report with actionable insights

The assessment takes approximately 15-20 minutes to complete and covers key areas including:
- Employment Law Compliance
- Safety & Workers Compensation  
- Training & Development
- Documentation Systems
- Performance Management

Upon completion, you'll receive a detailed report that can serve as a roadmap for improving your HR practices and reducing business risks.

Best regards,
The Easeworks Team`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Company Invitations</h1>
      </div>

      {/* Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Send Assessment Invitation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Essential Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create Invitation</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corporation"
                  value={invitation.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contactName">Client Name *</Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={invitation.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Client Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="john@acmecorp.com"
                  value={invitation.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={invitation.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={invitation.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizeOptions.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateInvitation}
                size="lg"
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI-Powered Invitation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Invitation Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Invitation</span>
              <Button onClick={copyToClipboard} size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedInvitation}
              readOnly
              rows={20}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Fill in the company name, client name, and email address
          </p>
          <p className="text-sm text-muted-foreground">
            2. Select the industry and company size for more targeted AI content
          </p>
          <p className="text-sm text-muted-foreground">
            3. Click "Generate AI-Powered Invitation" to create industry-specific content
          </p>
          <p className="text-sm text-muted-foreground">
            4. Copy the generated content and send it via your email client
          </p>
          <p className="text-sm text-muted-foreground">
            5. Recipients will get a personalized email with a "5 Minute HR Risk Assessment" link
          </p>
        </CardContent>
      </Card>
    </div>
  );
};