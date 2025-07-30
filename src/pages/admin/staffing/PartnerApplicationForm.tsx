import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Building, MapPin } from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  state: string;
  cities: string[];
  is_locked: boolean;
}

export function PartnerApplicationForm() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: '',
    company_name: '',
    email: '',
    phone: '',
    territory_id: '',
    experience_years: '',
    previous_staffing_experience: ''
  });
  const [documents, setDocuments] = useState({
    w9: null as File | null,
    bank_info: null as File | null,
    license: null as File | null
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    try {
      const { data, error } = await supabase
        .from('territories')
        .select('*')
        .eq('is_locked', false)
        .order('name');

      if (error) throw error;
      setTerritories(data || []);
    } catch (error) {
      console.error('Error fetching territories:', error);
      toast({
        title: "Error",
        description: "Failed to load available territories",
        variant: "destructive"
      });
    }
  };

  const uploadDocument = async (file: File, type: string, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('staffing-documents')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload documents
      const documentUrls: any = {};
      if (documents.w9) {
        documentUrls.w9_document_url = await uploadDocument(documents.w9, 'w9', user.id);
      }
      if (documents.bank_info) {
        documentUrls.bank_info_document_url = await uploadDocument(documents.bank_info, 'bank_info', user.id);
      }
      if (documents.license) {
        documentUrls.license_document_url = await uploadDocument(documents.license, 'license', user.id);
      }

      // Submit application
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          ...formData,
          experience_years: parseInt(formData.experience_years) || null,
          ...documentUrls
        });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your partner application has been submitted for review."
      });

      // Reset form
      setFormData({
        applicant_name: '',
        company_name: '',
        email: '',
        phone: '',
        territory_id: '',
        experience_years: '',
        previous_staffing_experience: ''
      });
      setDocuments({ w9: null, bank_info: null, license: null });

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Partner Application</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Join our Partner Office Program (POP) and start your own staffing business
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Application Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applicant_name">Full Name *</Label>
                <Input
                  id="applicant_name"
                  value={formData.applicant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="territory">Preferred Territory *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, territory_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {territories.map((territory) => (
                      <SelectItem key={territory.id} value={territory.id}>
                        {territory.name}, {territory.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_experience">Previous Staffing Experience</Label>
              <Textarea
                id="previous_experience"
                value={formData.previous_staffing_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, previous_staffing_experience: e.target.value }))}
                placeholder="Describe your previous experience in staffing or related industries..."
                rows={4}
              />
            </div>

            {/* Document Uploads */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: 'w9', label: 'W-9 Form', required: true },
                  { key: 'bank_info', label: 'Banking Information', required: true },
                  { key: 'license', label: 'Business License', required: false }
                ].map((doc) => (
                  <div key={doc.key} className="space-y-2">
                    <Label>{doc.label} {doc.required && '*'}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => handleFileChange(doc.key as keyof typeof documents, e.target.files?.[0] || null)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                      />
                      <Upload className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {documents[doc.key as keyof typeof documents] && (
                      <p className="text-sm text-green-600">
                        ✓ {documents[doc.key as keyof typeof documents]!.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={loading || !formData.applicant_name || !formData.company_name || !formData.email || !formData.territory_id}
                className="px-8 py-3 text-lg"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}