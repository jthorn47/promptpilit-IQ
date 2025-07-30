import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, ArrowLeft } from "lucide-react";
import { FileUploadField } from "@/components/onboarding/FileUploadField";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NewClientForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    positionsNeeded: '',
    staffingType: '',
    expectedStaff: '',
    startDate: '',
    urgency: '',
    requirements: '',
    companyLogoUrl: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (documentType: string, serviceType: string, file: File): Promise<string | null> => {
    try {
      // Upload logo to client-logos bucket
      const timestamp = new Date().getTime();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const filePath = `client-logos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('client-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(filePath);

      // Update form data with logo URL
      setFormData(prev => ({ ...prev, companyLogoUrl: publicUrl }));

      toast({
        title: "Logo uploaded successfully",
        description: "Company logo has been uploaded and saved.",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically submit the form data to create the client
      console.log('Form data:', formData);
      
      toast({
        title: "Client created successfully",
        description: "New client has been added to the system.",
      });
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Button>
        <h1 className="text-3xl font-bold">Add New Client</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Enter company name" 
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Company Logo Upload */}
              <div>
                <FileUploadField
                  label="Company Logo"
                  documentType="company_logo"
                  serviceType="general"
                  onFileUpload={handleLogoUpload}
                  acceptedTypes=".png,.jpg,.jpeg,.svg,.webp"
                  required={false}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Primary Contact</Label>
                  <Input id="contactName" placeholder="Contact person name" />
                </div>
                <div>
                  <Label htmlFor="contactTitle">Contact Title</Label>
                  <Input id="contactTitle" placeholder="Job title" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="contact@company.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea id="address" placeholder="Enter complete business address" />
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea id="description" placeholder="Brief description of the company and their staffing needs" />
              </div>
            </CardContent>
          </Card>

          {/* Staffing Requirements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Staffing Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positionsNeeded">Positions Needed</Label>
                  <Input id="positionsNeeded" placeholder="e.g., Warehouse Associates, Forklift Operators" />
                </div>
                <div>
                  <Label htmlFor="staffingType">Staffing Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="temp-to-perm">Temp-to-Permanent</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expectedStaff">Expected Staff Count</Label>
                  <Input id="expectedStaff" type="number" placeholder="Number of positions" />
                </div>
                <div>
                  <Label htmlFor="startDate">Expected Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Special Requirements</Label>
                <Textarea id="requirements" placeholder="Any special skills, certifications, or requirements" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">After submission:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Client information will be reviewed</li>
                  <li>Initial consultation will be scheduled</li>
                  <li>Staffing proposal will be prepared</li>
                  <li>Contract negotiations will begin</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <Button className="w-full flex items-center gap-2" onClick={handleSubmit}>
                    <Save className="w-4 h-4" />
                    Submit Application
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>Need help with the application?</p>
                <p className="text-muted-foreground">
                  Contact our business development team:
                </p>
                <p className="font-medium">(555) 123-4567</p>
                <p className="font-medium">partners@easeworks.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewClientForm;