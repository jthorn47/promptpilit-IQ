import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const GoogleAdsToolForm = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [campaignTypes, setCampaignTypes] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.rtf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setUploadedFile(file);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .pdf, .doc, .docx, or .rtf file",
          variant: "destructive",
        });
      }
    }
  };

  const handleCampaignTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setCampaignTypes([...campaignTypes, type]);
    } else {
      setCampaignTypes(campaignTypes.filter(t => t !== type));
    }
  };

  const handleCapabilityChange = (capability: string, checked: boolean) => {
    if (checked) {
      setCapabilities([...capabilities, capability]);
    } else {
      setCapabilities(capabilities.filter(c => c !== capability));
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Google Ads Tool Configuration Saved",
      description: "Your tool documentation has been submitted successfully",
    });
  };

  const campaignTypeOptions = [
    "Search Campaigns",
    "Display Campaigns", 
    "Performance Max Campaigns",
    "Video Campaigns",
    "Shopping Campaigns",
    "App Campaigns"
  ];

  const capabilityOptions = [
    "Account Creation",
    "Account Management", 
    "Campaign Creation",
    "Campaign Management",
    "Reporting",
    "Keyword Planning Services",
    "Other"
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Google Ads Tool Documentation</CardTitle>
        <CardDescription>
          Configure your Google Ads tool capabilities and upload design documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Design Documentation * 
            <span className="text-sm text-muted-foreground ml-2">
              (.pdf, .doc, .docx, or .rtf file formats only)
            </span>
          </Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.rtf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Click to upload design documentation
                </div>
              </div>
            </label>
            {uploadedFile && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-foreground">{uploadedFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Types Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Which Google Ads campaign types does your tool support? *
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {campaignTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`campaign-${type}`}
                  checked={campaignTypes.includes(type)}
                  onCheckedChange={(checked) => 
                    handleCampaignTypeChange(type, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`campaign-${type}`}
                  className="text-sm font-normal"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Which of the following Google Ads capabilities does your tool provide? *
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {capabilityOptions.map((capability) => (
              <div key={capability} className="flex items-center space-x-2">
                <Checkbox
                  id={`capability-${capability}`}
                  checked={capabilities.includes(capability)}
                  onCheckedChange={(checked) => 
                    handleCapabilityChange(capability, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`capability-${capability}`}
                  className="text-sm font-normal"
                >
                  {capability}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={!uploadedFile || campaignTypes.length === 0 || capabilities.length === 0}
          >
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};