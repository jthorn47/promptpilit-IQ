import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, DollarSign, Calendar, FileText, Upload, Image, MapPin, User, UserCheck, Shield, Users, Globe, Briefcase, TrendingUp, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { FileUploadField } from "@/components/onboarding/FileUploadField";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OverviewTabProps {
  data: {
    name: string;
    status: string;
    identifier?: string;
    contractValue?: number;
    currency?: string;
    dateWon?: string;
    onboardingStatus?: string;
    notes?: string;
    additionalInfo?: Record<string, any>;
    // Enhanced fields
    industry?: string;
    headquarters?: string;
    primaryContact?: string;
    salesRep?: string;
    riskScore?: number;
    riskLevel?: string;
    dateCreated?: string;
    employeeCount?: number;
    website?: string;
    totalEmployeesCovered?: number;
    startDate?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    planType?: string;
    billingType?: string;
    servicesPurchased?: string[];
    lifecycleStage?: string;
    initialTerm?: string;
    renewalTerms?: string;
    workerCompCodes?: string[];
  };
  type?: 'company' | 'client' | 'admin';
  clientId?: string;
}

export const OverviewTab = ({ data, type = 'company', clientId }: OverviewTabProps) => {
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch client logo if it's a client
  useEffect(() => {
    if (type === 'client' && clientId) {
      fetchClientLogo();
    }
  }, [type, clientId]);

  const fetchClientLogo = async () => {
    try {
      setLoading(true);
      const { data: profileData, error } = await supabase
        .from('client_onboarding_profiles')
        .select('company_logo_url')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching client logo:', error);
        return;
      }

      if (profileData?.company_logo_url) {
        setCompanyLogoUrl(profileData.company_logo_url);
      }
    } catch (error) {
      console.error('Error fetching client logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (documentType: string, serviceType: string, file: File): Promise<string | null> => {
    try {
      // Upload logo to client-logos bucket
      const timestamp = new Date().getTime();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const filePath = `client-logos/${fileName}`;

      const { data: uploadData, error } = await supabase.storage
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

      // Update or create client onboarding profile with logo URL
      const { data: existingProfile, error: fetchError } = await supabase
        .from('client_onboarding_profiles')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('client_onboarding_profiles')
          .update({ company_logo_url: publicUrl })
          .eq('id', existingProfile.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('client_onboarding_profiles')
          .insert({
            client_id: clientId,
            company_name: data.name,
            company_logo_url: publicUrl,
            service_types: ['general']
          });

        if (insertError) {
          throw insertError;
        }
      }

      setCompanyLogoUrl(publicUrl);

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'premium':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'trial':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOnboardingStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRiskScoreColor = (level?: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return 'N/A';
    if (currency === 'employees') return `${amount} employees`;
    return `${currency || 'USD'} ${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {type === 'client' ? 'Client Information' : 'Company Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" />
                Name
              </label>
              <p className="font-medium">{data.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(data.status)} variant="outline">
                  {data.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.identifier && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {type === 'client' ? 'Client Number' : 'Company ID'}
                </label>
                <p className="font-medium text-xs">{data.identifier}</p>
              </div>
            )}
            {data.onboardingStatus && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Onboarding Status</label>
                <div className="mt-1">
                  <Badge className={getOnboardingStatusColor(data.onboardingStatus)} variant="outline">
                    {data.onboardingStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {data.industry && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Industry
                </label>
                <p className="font-medium">{data.industry}</p>
              </div>
              {data.headquarters && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Headquarters
                  </label>
                  <p className="font-medium">{data.headquarters}</p>
                </div>
              )}
            </div>
          )}

          {(data.primaryContact || data.salesRep) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.primaryContact && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Primary Contact
                  </label>
                  <p className="font-medium">{data.primaryContact}</p>
                </div>
              )}
              {data.salesRep && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Assigned Sales Rep
                  </label>
                  <p className="font-medium">{data.salesRep}</p>
                </div>
              )}
            </div>
          )}

          {(data.riskScore !== undefined || data.employeeCount) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.riskScore !== undefined && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    HR Risk Score
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{data.riskScore}/100</p>
                    {data.riskLevel && (
                      <Badge className={getRiskScoreColor(data.riskLevel)} variant="outline">
                        {data.riskLevel.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {data.employeeCount && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Employee Count
                  </label>
                  <p className="font-medium">{data.employeeCount}</p>
                </div>
              )}
            </div>
          )}

          {(data.website || data.dateCreated) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </label>
                  <a 
                    href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {data.website}
                  </a>
                </div>
              )}
              {data.dateCreated && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date Created
                  </label>
                  <p className="font-medium">{formatDate(data.dateCreated)}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Logo Card */}
      {type === 'client' && clientId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companyLogoUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={companyLogoUrl} 
                    alt="Company Logo" 
                    className="w-32 h-32 object-contain border rounded-lg bg-background"
                  />
                </div>
                <div className="text-center">
                  <FileUploadField
                    label="Update Logo"
                    documentType="company_logo"
                    serviceType="general"
                    onFileUpload={handleLogoUpload}
                    acceptedTypes=".png,.jpg,.jpeg,.svg,.webp"
                    required={false}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <FileUploadField
                  label="Upload Company Logo"
                  documentType="company_logo"
                  serviceType="general"
                  onFileUpload={handleLogoUpload}
                  acceptedTypes=".png,.jpg,.jpeg,.svg,.webp"
                  required={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.contractValue && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Contract Value
                </label>
                <p className="font-medium">{formatCurrency(data.contractValue, data.currency)}</p>
              </div>
            )}
            {data.dateWon && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Date Won
                </label>
                <p className="font-medium">{formatDate(data.dateWon)}</p>
              </div>
            )}
          </div>

          {(data.totalEmployeesCovered || data.startDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.totalEmployeesCovered && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Employees Covered
                  </label>
                  <p className="font-medium">{data.totalEmployeesCovered}</p>
                </div>
              )}
              {data.startDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Start Date
                  </label>
                  <p className="font-medium">{formatDate(data.startDate)}</p>
                </div>
              )}
            </div>
          )}

          {(data.contractStartDate || data.contractEndDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.contractStartDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Start</label>
                  <p className="font-medium">{formatDate(data.contractStartDate)}</p>
                </div>
              )}
              {data.contractEndDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract End</label>
                  <p className="font-medium">{formatDate(data.contractEndDate)}</p>
                </div>
              )}
            </div>
          )}

          {(data.planType || data.billingType) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.planType && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan Type</label>
                  <Badge variant="secondary">{data.planType}</Badge>
                </div>
              )}
              {data.billingType && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Type</label>
                  <Badge variant="outline">{data.billingType}</Badge>
                </div>
              )}
            </div>
          )}

          {(data.initialTerm || data.renewalTerms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.initialTerm && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Initial Term
                  </label>
                  <p className="font-medium">{data.initialTerm}</p>
                </div>
              )}
              {data.renewalTerms && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Renewal Terms
                  </label>
                  <p className="font-medium">{data.renewalTerms}</p>
                </div>
              )}
            </div>
          )}

          {data.servicesPurchased && data.servicesPurchased.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Services Purchased</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.servicesPurchased.map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.workerCompCodes && data.workerCompCodes.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Workers' Comp Classification</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.workerCompCodes.map((code, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-32 overflow-y-auto">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.notes}</p>
            </div>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                {data.notes.length} characters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};