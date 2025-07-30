import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Phone, Mail, MapPin, Lock, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompanyProfile {
  id?: string;
  business_name: string;
  business_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact_information: {
    primary_contact_name: string;
    primary_contact_phone: string;
    primary_contact_email: string;
  };
  business_details: {
    industry: string;
    employee_count: number;
    business_type: string;
  };
  is_locked: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const CompanyProfileForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>({
    business_name: '',
    business_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    },
    contact_information: {
      primary_contact_name: '',
      primary_contact_phone: '',
      primary_contact_email: user?.email || ''
    },
    business_details: {
      industry: '',
      employee_count: 1,
      business_type: ''
    },
    is_locked: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          business_name: data.business_name,
          business_address: (data.business_address as any) || {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'US'
          },
          contact_information: (data.contact_information as any) || {
            primary_contact_name: '',
            primary_contact_phone: '',
            primary_contact_email: user?.email || ''
          },
          business_details: (data.business_details as any) || {
            industry: '',
            employee_count: 1,
            business_type: ''
          },
          is_locked: data.is_locked
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load company profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const profileData = {
        user_id: user.id,
        business_name: profile.business_name,
        business_address: profile.business_address,
        contact_information: profile.contact_information,
        business_details: profile.business_details
      };

      const { data, error } = await supabase
        .from('company_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setProfile(prev => ({ ...prev, id: data.id }));
      
      toast({
        title: "Profile Saved",
        description: "Your company profile has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (section: keyof CompanyProfile, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section] as any,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {profile.is_locked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Your company profile is locked and cannot be edited. Contact support if you need to make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Business Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={profile.business_name}
              onChange={(e) => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
              disabled={profile.is_locked}
              placeholder="Enter your business name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={profile.business_details.industry}
                onChange={(e) => updateProfile('business_details', 'industry', e.target.value)}
                disabled={profile.is_locked}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            <div>
              <Label htmlFor="business_type">Business Type</Label>
              <Select
                value={profile.business_details.business_type}
                onValueChange={(value) => updateProfile('business_details', 'business_type', value)}
                disabled={profile.is_locked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="employee_count">Employee Count</Label>
            <Input
              id="employee_count"
              type="number"
              min="1"
              value={profile.business_details.employee_count}
              onChange={(e) => updateProfile('business_details', 'employee_count', parseInt(e.target.value) || 1)}
              disabled={profile.is_locked}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Business Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={profile.business_address.street}
              onChange={(e) => updateProfile('business_address', 'street', e.target.value)}
              disabled={profile.is_locked}
              placeholder="Enter street address"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={profile.business_address.city}
                onChange={(e) => updateProfile('business_address', 'city', e.target.value)}
                disabled={profile.is_locked}
                placeholder="City"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={profile.business_address.state}
                onValueChange={(value) => updateProfile('business_address', 'state', value)}
                disabled={profile.is_locked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                value={profile.business_address.zip}
                onChange={(e) => updateProfile('business_address', 'zip', e.target.value)}
                disabled={profile.is_locked}
                placeholder="ZIP"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Primary Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_name">Primary Contact Name *</Label>
            <Input
              id="contact_name"
              value={profile.contact_information.primary_contact_name}
              onChange={(e) => updateProfile('contact_information', 'primary_contact_name', e.target.value)}
              disabled={profile.is_locked}
              placeholder="Full name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Phone Number *</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={profile.contact_information.primary_contact_phone}
                onChange={(e) => updateProfile('contact_information', 'primary_contact_phone', e.target.value)}
                disabled={profile.is_locked}
                placeholder="(555) 123-4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email Address *</Label>
              <Input
                id="contact_email"
                type="email"
                value={profile.contact_information.primary_contact_email}
                onChange={(e) => updateProfile('contact_information', 'primary_contact_email', e.target.value)}
                disabled={profile.is_locked}
                placeholder="email@company.com"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {!profile.is_locked && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};